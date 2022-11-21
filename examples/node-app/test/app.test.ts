import { Amplitude, experiment, analytics, user, MessageHub, User, Logger } from "../src/amplitude";
import { userUpdatedMessage, MessageTypes as UserMessageTypes } from "@amplitude/user-messages";
import { trackMessage, MessageTypes as AnalyticsMessageTypes } from "@amplitude/analytics-messages";

const apiKey = 'test-api-key';
const userId = 'test-user-id';

afterEach(() => {
  jest.restoreAllMocks();
});

test('node dummy test', () => {
  expect(true).toBe(true);
});
