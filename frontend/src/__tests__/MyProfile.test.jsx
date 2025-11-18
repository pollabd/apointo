import { screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import MyProfile from '../pages/MyProfile';
import { renderWithProviders } from '../utils/test-utils';

describe('MyProfile Component', () => {
  beforeEach(() => {
    // Mock authenticated user
    localStorage.setItem('token', 'fake-jwt-token');
    localStorage.setItem('user', JSON.stringify({
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'PATIENT',
    }));
  });

  it('renders user profile', async () => {
    renderWithProviders(<MyProfile />);
    
    expect(screen.getByText(/Loading profile/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  it('allows editing profile', async () => {
    renderWithProviders(<MyProfile />);
    
    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Edit'));
    
    const nameInput = screen.getByDisplayValue('Test User');
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
    
    fireEvent.click(screen.getByText('Save information'));
    
    await waitFor(() => {
      expect(screen.getByText('Profile updated successfully')).toBeInTheDocument();
    });
  });
});
