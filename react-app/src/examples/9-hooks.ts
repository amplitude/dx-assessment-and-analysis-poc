import { amplitude, Logger } from "../@amplitude/amplitude/browser";
import { experiment } from "../@amplitude/experiment/browser";
import { analytics } from "../@amplitude/analytics/browser";
import { trackMessage } from "../@amplitude/analytics/messages";
import { hub } from "../@amplitude/hub";
import { user } from "../@amplitude/user";
import { userUpdatedMessage } from "../@amplitude/user/messages";
import { jsons } from "../util";

const logger = new Logger();

/**
 * 1. Register plugins with Amplitude during load()
 */
amplitude.load({
  apiKey: 'scoped-source-write-key',
  logger,
  plugins: [
    experiment,
    analytics,
  ]
})

/**
 * 2. Hook into Analytics updates via 'hub.analytics'
 */
hub.analytics.subscribe(trackMessage, (message) => {
  logger.log(`An analytics event was tracked!\n${jsons(message)}`);
});

/**
 * 2. Hook into User updates via 'hub.user'
 */
hub.user.subscribe(userUpdatedMessage, (message) => {
  logger.log(`The user was updated!\n${jsons(message)}`);
});

user.setUserId('test-user-id')
analytics.track('My Event')


