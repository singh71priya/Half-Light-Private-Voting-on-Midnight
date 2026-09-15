// This file is part of midnightntwrk/example-bboard.
// Copyright (C) Midnight Foundation
// SPDX-License-Identifier: Apache-2.0
// Licensed under the Apache License, Version 2.0 (the "License");
// You may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// import { webcrypto } from 'crypto';

import { type WalletFacade } from '@midnight-ntwrk/wallet-sdk-facade';
import { createKeystore, UnshieldedWalletState } from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import { Logger } from 'pino';
import { HDWallet, Roles } from '@midnight-ntwrk/wallet-sdk-hd';
import { getNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import * as rx from 'rxjs';

export const getUnshieldedSeed = (seed: string): Uint8Array<ArrayBufferLike> => {
  let seedBuffer: Buffer;
  if (seed.trim().includes(' ')) {
    try {
      // Decode 24-word mnemonic to entropy
      const bip39 = require('bip39');
      const entropy = bip39.mnemonicToEntropy(seed.trim());
      seedBuffer = Buffer.from(entropy, 'hex');
    } catch {
      seedBuffer = Buffer.from(seed.replace(/\s+/g, ''), 'hex');
    }
  } else {
    seedBuffer = Buffer.from(seed.trim(), 'hex');
  }

  const hdWalletResult = HDWallet.fromSeed(seedBuffer);
  if ((hdWalletResult as any)?.type === 'seedOk') {
    const derivationResult = (hdWalletResult as any).hdWallet.selectAccount(0).selectRole(Roles.NightExternal).deriveKeyAt(0);
    if (derivationResult.type !== 'keyOutOfBounds') {
      return derivationResult.key;
    }
  }

  return new Uint8Array(seedBuffer.subarray(0, 32));
};

export const generateDust = async (
  logger: Logger,
  walletSeed: string,
  unshieldedState: UnshieldedWalletState,
  walletFacade: WalletFacade,
  passedKeystore?: any,
) => {
  const dustAddress = await walletFacade.dust.getAddress();
  const networkId = getNetworkId();
  const unshieldedKeystore = passedKeystore ?? createKeystore(getUnshieldedSeed(walletSeed), networkId);
  const utxos = unshieldedState.availableCoins.filter((coin) => !coin.meta.registeredForDustGeneration);

  if (utxos.length === 0) {
    logger.debug('No unregistered UTXOs found for dust generation.');
    return undefined;
  }

  logger.info(`Generating dust with ${utxos.length} UTXOs for address ${dustAddress}...`);

  const recipe = await walletFacade.registerNightUtxosForDustGeneration(
    utxos,
    unshieldedKeystore.getPublicKey(),
    (payload) => unshieldedKeystore.signData(payload),
    dustAddress,
  );
  const transaction = await walletFacade.finalizeRecipe(recipe);
  const txId = await walletFacade.submitTransaction(transaction);
  logger.info(`Dust generation transaction submitted with txId: ${txId}`);

  return txId;
};
