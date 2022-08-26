// For strongly typed usage
import { amplitude, user, analytics, experiment, UserLoggedIn } from '../amplitude/browser'

amplitude.load({
  apiKey: 'scoped-source-write-key',
})

// Single user
//   Amplitude keeps a reference to current user
//   Plugins can access the user via config
amplitude.user.setUserId('u-id')

// Multiple users (server usage)
//   See `multiTenantUser.ts`

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
