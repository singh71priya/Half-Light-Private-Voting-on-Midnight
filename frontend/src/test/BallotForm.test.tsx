import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BallotForm } from '../components/BallotForm';
import type { ElectionMeta } from '../lib/types';

const meta: ElectionMeta = {
  id: 'test-election',
  title: 'Test election?',
  description: 'A test ballot',
  yesLabel: 'Yes, fund it',
  noLabel: 'No, hold off',
};

describe('BallotForm', () => {
  it('renders both vote options when the election is open', () => {
    render(<BallotForm meta={meta} status="OPEN" hasVoted={false} onVote={vi.fn()} />);
    expect(screen.getByText('Yes, fund it')).toBeInTheDocument();
    expect(screen.getByText('No, hold off')).toBeInTheDocument();
  });

  it('calls onVote with YES when the yes button is clicked', async () => {
    const onVote = vi.fn().mockResolvedValue(undefined);
    render(<BallotForm meta={meta} status="OPEN" hasVoted={false} onVote={onVote} />);
    await userEvent.click(screen.getByText('Yes, fund it'));
    expect(onVote).toHaveBeenCalledWith('YES');
  });

  it('shows a confirmation state instead of buttons once the voter has voted', () => {
    render(<BallotForm meta={meta} status="OPEN" hasVoted onVote={vi.fn()} />);
    expect(screen.getByText(/ballot was recorded/i)).toBeInTheDocument();
    expect(screen.queryByText('Yes, fund it')).not.toBeInTheDocument();
  });

  it('disables voting and explains why when the election has not opened yet', () => {
    render(<BallotForm meta={meta} status="CREATED" hasVoted={false} onVote={vi.fn()} />);
    expect(screen.getByText(/has not opened yet/i)).toBeInTheDocument();
  });
});
