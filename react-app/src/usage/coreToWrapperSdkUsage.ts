// For untyped usage
// import { amplitude } from '../@amplitude/amplitude-browser'
// import { user } from '../@amplitude/user-browser'
// import { analytics } from '../@amplitude/analytics-browser'
// import { experiment } from '../@amplitude/experiment-browser'

// For strongly typed usage
import { amplitude, user, analytics, experiment, UserLoggedIn } from '../amplitude'

// ====== Untyped Types =======
amplitude.load({
  apiKey: 'a-key',
  logLevel: 'info',
})

// single user, multi-tenant is tbd
user.setUserId('u-id')

// set untyped user properties
user.setUserProperties({
  requiredProp: "untyped"
});

// analytics.add(new MyPlugin());

if (experiment.variant('flag-codegen-on')) {
  throw new Error('codegen not available')
} else {
  analytics.track('My Event')
}

// ====== Strong Types =======

// all codegen methods are available on 'data' objects per product
user.data.setUserProperties({
  requiredProp: "strongly typed",
});

if (experiment.data.flagCodegenEnabled()) {
  analytics.data.userLoggedIn();
  analytics.track(new UserLoggedIn());
} else {
  analytics.track('My Event')
}
