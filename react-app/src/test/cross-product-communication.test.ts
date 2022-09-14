import { analytics as segmentAnalytics } from "../@amplitude/plugin-segment-analytics/browser";
import { Amplitude, experiment, analytics, user, MessageHub } from "../amplitude/browser";
import { trackMessage } from "../@amplitude/analytics/messages";

const apiKey = 'test-api-key';
const userId = 'test-user-id';

afterEach(() => {
  jest.restoreAllMocks();
});

test('experiment.exposure() should send a track message on hub.analytics', () => {
  const amplitude = new Amplitude();
  const hub = new MessageHub();

  let wasHubMessageReceived = false;
  hub.analytics.subscribe(trackMessage, (message) => {
    wasHubMessageReceived = true;
    const { event, sender } = message.payload;
    expect(message.type).toBe('track');
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

test('analytics plugin should track() on experiment.exposure()', () => {
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

  user.setUserId(userId)
  experiment.exposure();

  expect(trackSpy.mock.calls.length).toBe(1);
});

test('multiple analytics plugins should track() on experiment.exposure()', () => {
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

  user.setUserId(userId)
  experiment.exposure();

  expect(trackSpy.mock.calls.length).toBe(1);
  expect(segmentTrackSpy.mock.calls.length).toBe(1);
});
