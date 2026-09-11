import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../App';

describe('App', () => {
  it('renders the election title and demo mode badge', async () => {
    render(<App />);
    expect(await screen.findByText(/treasury fund the Q2 community grants round/i)).toBeInTheDocument();
    expect(screen.getByText('Demo mode')).toBeInTheDocument();
  });

  it('shows the privacy model panel', async () => {
    render(<App />);
    expect(await screen.findByText(/half light, half shadow/i)).toBeInTheDocument();
  });
});
