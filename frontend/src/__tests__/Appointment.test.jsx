import { screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Appointment from '../pages/Appointment';
import { renderWithProviders } from '../utils/test-utils';

// Mock useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ docId: 'doc-1' }),
  };
});

describe('Appointment Component', () => {
  it('renders doctor details and booking slots', async () => {
    renderWithProviders(<Appointment />);
    
    expect(screen.getByText(/Loading doctor information/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Dr. Richard James')).toBeInTheDocument();
      expect(screen.getByText('MBBS - General physician')).toBeInTheDocument();
    });
    
    // Check for slots
    await waitFor(() => {
      expect(screen.getByText(/Booking slots/i)).toBeInTheDocument();
    });
  });
});
