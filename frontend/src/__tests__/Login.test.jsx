import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Login from '../pages/Login';
import { renderWithProviders } from '../utils/test-utils';

describe('Login Component', () => {
  it('renders login form with create account mode', () => {
    renderWithProviders(<Login />);
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByText(/Please sign up to book appointment/i)).toBeInTheDocument();
  });

  it('switches to login mode when clicking Login here', () => {
    renderWithProviders(<Login />);
    
    // Find the span with "Login here" text
    const loginLink = screen.getByText('Login here');
    fireEvent.click(loginLink);
    
    // After clicking, should show "Login" title
    const loginTitle = screen.getByText((content, element) => {
      return element.tagName.toLowerCase() === 'p' && content === 'Login';
    });
    expect(loginTitle).toBeInTheDocument();
  });

  it('shows create account button in sign up mode', () => {
    renderWithProviders(<Login />);
    expect(screen.getByRole('button', { name: /Create account/i })).toBeInTheDocument();
  });
});
