import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '../utils/test-utils';
import Login from '../pages/Login';
import Doctors from '../pages/Doctors';

// These are E2E tests that run against the real backend
// Make sure the backend is running on http://localhost:5000

describe('E2E: Full Stack Integration Tests', () => {
  const testUser = {
    email: `e2e.test.${Date.now()}@example.com`,
    password: 'TestPassword123!',
    name: 'E2E Test User',
  };

  describe('Authentication Flow', () => {
    it('should register a new user successfully', async () => {
      const { container } = renderWithProviders(<Login />);

      // Ensure we are on Sign Up page (default) or switch to it
      const createAccountTitle = screen.queryByText('Create Account');
      if (!createAccountTitle) {
         const signUpLink = screen.queryByText(/Click here/i);
         if (signUpLink) fireEvent.click(signUpLink);
      }

      // Fill registration form
      // Inputs don't have labels/placeholders, so we select by type/order
      const nameInput = container.querySelector('input[type="text"]');
      const emailInput = container.querySelector('input[type="email"]');
      const passwordInput = container.querySelector('input[type="password"]');

      fireEvent.change(nameInput, { target: { value: testUser.name } });
      fireEvent.change(emailInput, { target: { value: testUser.email } });
      fireEvent.change(passwordInput, { target: { value: testUser.password } });

      // Submit
      const submitButton = screen.getByRole('button', { name: /Create account/i });
      fireEvent.click(submitButton);

      // Should show success message or redirect
      await waitFor(() => {
         // Check for success toast or redirect content
         const successToast = screen.queryByText(/Registration successful/i);
         // If redirected to home, we might see "Top Doctors to Book" or "Speciality"
         const homePageElement = screen.queryByText(/Top Doctors to Book/i); 
         
         if (!successToast && !homePageElement) {
             // Debug: print what we see if failing
             // console.log(document.body.innerHTML);
         }
         
         expect(successToast || homePageElement).toBeTruthy();
      }, { timeout: 10000 });
    });

    it('should login with existing credentials', async () => {
      const { container } = renderWithProviders(<Login />);

      // Switch to login mode
      const loginLink = screen.getByText('Login here');
      fireEvent.click(loginLink);

      // Fill login form
      const emailInput = container.querySelector('input[type="email"]');
      const passwordInput = container.querySelector('input[type="password"]');

      // Use the seeded patient
      fireEvent.change(emailInput, { target: { value: 'patient@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      // Submit
      const submitButton = screen.getByRole('button', { name: /Login/i });
      fireEvent.click(submitButton);

      // Should show success
      await waitFor(() => {
        const successToast = screen.queryByText(/Login successful/i);
        const homePageElement = screen.queryByText(/Top Doctors to Book/i);
        expect(successToast || homePageElement).toBeTruthy();
      }, { timeout: 10000 });
    });
  });

  describe('Doctors List', () => {
    it('should load doctors from backend', async () => {
      renderWithProviders(<Doctors />);

      // Should show loading
      expect(screen.getByText(/Loading doctors/i)).toBeInTheDocument();

      // Should load real doctors from database
      await waitFor(() => {
        // Check for any doctor cards
        const doctorElements = screen.queryAllByText(/Dr\./i);
        expect(doctorElements.length).toBeGreaterThan(0);
      }, { timeout: 15000 });
    });
  });
});
