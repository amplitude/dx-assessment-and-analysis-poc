// For strongly typed usage
import { amplitude, user, analytics, experiment, UserLoggedIn } from '../amplitude'

amplitude.load({
  apiKey: 'scoped-source-write-key',
})

amplitude.user.setUserId('u-id')

// all codegen methods are available on 'data' objects per product
user.data.setUserProperties({
  requiredProp: "strongly typed",
});

experiment.fetch();
if (experiment.data.flagCodegenEnabled()) {
  analytics.data.userLoggedIn();
  analytics.track(new UserLoggedIn());
} else {
  analytics.track('My Event')
}
