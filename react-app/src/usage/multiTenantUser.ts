import { amplitude, User, analytics, experiment, UserLoggedIn } from '../amplitude/node'

// ====== Untyped Types =======
amplitude.load({
  apiKey: 'a-key',
})

//  1. Track with `userId`
analytics.userId('node-user').track(new UserLoggedIn());

//  2. Track with `deviceId`
analytics.deviceId('node-device').data.userSignedUp();

// 3. Track with `userProperties`
const user = new User('node-user-2');
user.data.setUserProperties({
  requiredProp: 'strongly typed'
})
experiment.user(user).data.flagCodegenEnabled();

// 4. Create RequestScoped client
type Middleware = (req: any, res: any, next: () => void) => any;
const app = { // express()
  use: (middleware: Middleware) => {}
};
app.use((req, res, next) => {
  const userId = req.params.id;
  req.analytics =  analytics.userId(userId);
  req.experiment =  experiment.userId(userId);
  next()
})
app.use((req) => {
  req.analytics.data.userSignedUp();
})

// amplitude.track({
//   event_type: 'My Event',
//   user_id: 'user-id'
// })
// amplitude.track('My Event', undefined, {
//   user_id: 'id'
// })
// analytics.userId('id').myEvent();

// amplitude(user).getPlugin('analytics');

// analytics(user).myEvent();

// analytics.data.myEvent(userId, new MyEvent({
//   prop1: true
// }), {
//   user_id: 'id',
//   device_id: ''
// });

// analytics.track(User.setUserId('u-id').setUserProperties(), new UserLoggedIn());
