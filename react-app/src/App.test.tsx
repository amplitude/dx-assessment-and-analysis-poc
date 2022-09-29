import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { hub } from "@amplitude/hub";
import { trackMessage, AnalyticsEvent } from "./@amplitude/analytics/messages";

const SELECTOR_EXPERIMENT_EXPOSURE_BUTTON = /experiment.exposure/i
const SELECTOR_ANALYTICS_USER_LOGGED_IN_BUTTON = /login \(with event method/i
const SELECTOR_ANALYTICS_USER_SIGNED_UP_BUTTON = /sign up/i

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  console.log = () => {};
});

test('sample app loads', () => {
  render(<App />);
  const linkElement = screen.getByText(/Unified SDK/i);
  expect(linkElement).toBeInTheDocument();
});

test('validate events sequence in from UI actions', () => {
  const events: AnalyticsEvent[] = [];
  hub.analytics.subscribe(trackMessage, (message) => {
    events.push(message.payload.event);
  })

  render(<App />);

  // get UI element refs
  const experimentExposureButton = screen.getByText(SELECTOR_EXPERIMENT_EXPOSURE_BUTTON);
  const analyticsUserLoggedInButton = screen.getByText(SELECTOR_ANALYTICS_USER_LOGGED_IN_BUTTON);
  const analyticsUserSignedUpButton = screen.getByText(SELECTOR_ANALYTICS_USER_SIGNED_UP_BUTTON);

  // interact with UI
  userEvent.click(experimentExposureButton);
  userEvent.click(analyticsUserSignedUpButton);
  userEvent.click(analyticsUserLoggedInButton);

  // Validate analytics events were tracked as expected
  expect(events.length).toBe(3);

  const exposureEvent = events[0];
  expect(exposureEvent.event_type).toBe('Exposure');

  const userSignedUpEvent = events[1];
  expect(userSignedUpEvent.event_type).toBe('User Signed Up');

  const userLoggedInEvent = events[2];
  expect(userLoggedInEvent.event_type).toBe('User Logged In');
});
