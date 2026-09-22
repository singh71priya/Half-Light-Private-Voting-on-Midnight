export const createVotingPrivateState = (voterSecretKey) => ({
    voterSecretKey,
});
export const witnesses = {
    voterSecretKey: ({ privateState, }) => [privateState, privateState?.voterSecretKey ?? new Uint8Array(32)],
};
//# sourceMappingURL=witnesses.js.map