import { screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Doctors from '../pages/Doctors';
import { renderWithProviders } from '../utils/test-utils';

describe('Doctors Component', () => {
  it('loads and displays doctors from API', async () => {
    renderWithProviders(<Doctors />);
    
    // Should show loading initially
    expect(screen.getByText(/Loading doctors/i)).toBeInTheDocument();
    
    // Wait for doctors to appear
    await waitFor(() => {
      const doctorNames = screen.queryAllByText(/Dr\./i);
      expect(doctorNames.length).toBeGreaterThan(0);
    }, { timeout: 5000 });
  });

  it('displays doctor availability status', async () => {
    renderWithProviders(<Doctors />);
    
    // Wait for available status to show
    await waitFor(() => {
      const availableIndicators = screen.queryAllByText(/Available/i);
      expect(availableIndicators.length).toBeGreaterThan(0);
    }, { timeout: 5000 });
  });
});
