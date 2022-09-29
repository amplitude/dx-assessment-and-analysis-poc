import { Amplitude, experiment, analytics, user, MessageHub, User, Logger } from "../amplitude/browser";
import { userUpdatedMessage, MessageTypes as UserMessageTypes } from "@amplitude/user-messages";
import { trackMessage, MessageTypes as AnalyticsMessageTypes } from "@amplitude/analytics-messages";
import { analytics as segmentAnalytics } from "../@amplitude/plugin-segment-analytics/browser";

const apiKey = 'test-api-key';
const userId = 'test-user-id';

afterEach(() => {
  jest.restoreAllMocks();
});

test('experiment.exposure() sends a track message on hub.analytics', () => {
  const amplitude = new Amplitude();
  const hub = new MessageHub();

  let wasHubMessageReceived = false;
  hub.analytics.subscribe(trackMessage, (message) => {
    wasHubMessageReceived = true;
    const { event, sender } = message.payload;
    expect(message.type).toBe(AnalyticsMessageTypes.Track);
    expect(event.event_type).toBe('Exposure');
    expect(event.user_id).toBe(userId);
    expect(sender.name).toBe(experiment.name);
    expect(sender.version).toBe(experiment.version);
  })

  amplitude.load({ apiKey, hub, plugins: [ experiment ] })

  user.setUserId(userId)
  experiment.exposure();

  expect(wasHubMessageReceived).toBe(true);
});

test('analytics plugin automatically calls track() on experiment.exposure()', () => {
  const amplitude = new Amplitude();
  const hub = new MessageHub();

  // @ts-ignore
  let trackSpy = jest.spyOn(analytics, '_track');
  // let trackSpy = jest.spyOn(Analytics.prototype, '_track');

  amplitude.load({
    apiKey,
    hub,
    plugins: [ experiment, analytics ]
  })

  experiment.exposure();

  expect(trackSpy.mock.calls.length).toBe(1);
});

test('multiple analytics plugins automatically call track() on experiment.exposure()', () => {
  const amplitude = new Amplitude();
  const hub = new MessageHub();

  // @ts-ignore
  let trackSpy = jest.spyOn(analytics, '_track');
  let segmentTrackSpy = jest.spyOn(segmentAnalytics, 'track');

  amplitude.load({
    apiKey,
    hub,
    plugins: [ experiment, analytics, segmentAnalytics ]
  })

  experiment.exposure();

  expect(trackSpy.mock.calls.length).toBe(1);
  expect(segmentTrackSpy.mock.calls.length).toBe(1);
});

test('user updates should send messages on hub.user', () => {
  const testUser = new User();
  const amplitude = new Amplitude(testUser);
  const hub = new MessageHub();

  let wasHubMessageReceived = false;
  hub.user.subscribe(userUpdatedMessage, (message) => {
    wasHubMessageReceived = true;
    const { user: messageUser, sender } = message.payload;
    expect(message.type).toBe(UserMessageTypes.UserUpdated);
    expect(messageUser.userId).toBe(userId);
    expect(messageUser.deviceId).toBe(undefined);
    expect(sender.name).toBe(user.name);
    expect(sender.version).toBe(user.version);
  })

  amplitude.load({ apiKey, hub })

  testUser.setUserId(userId)

  expect(wasHubMessageReceived).toBe(true);
});
