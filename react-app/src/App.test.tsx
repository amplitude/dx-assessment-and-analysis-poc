import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  // jest.spyOn(console, 'log').mockImplementation(() => {});
});

test('renders learn react link', () => {
  console.log = jest.fn()
  render(<App />);
  const linkElement = screen.getByText(/Amplitude SDK Unification/i);
  expect(linkElement).toBeInTheDocument();
});
