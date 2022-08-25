import { amplitude, user, analytics, UserLoggedIn } from '../amplitude/node'

// ====== Untyped Types =======
amplitude.load({
  apiKey: 'a-key',
})

amplitude.user.setUserId('u-id')

// set untyped user properties
user.setUserProperties({
  requiredProp: "untyped"
});

analytics.userId('node-user').track('My Event');

analytics.userId('id').data.userSignedUp();

// analytics.user().track(UserLoggedIn);
// single user, multi-tenant is tbd

// amplitude.track({
//   event_type: 'My Event',
//   user_id: 'user-id'
// })
// amplitude.track('My Event', undefined, {
//   user_id: 'id'
// })
//
// analytics.associate(user.id, new MyEvent())
// analytics.associate(user.id).track(new MyEvent())
//
// analytics.user('id').myEvent();
//
// amplitude(user).getPlugin('analytics');
//
// amplitude.getPlugin('analytics');
//
// analytics(user).myEvent();
// experiment(user).
//
// analytics.data.myEvent('user-id', new MyEvent({
//   prop1: true,
//   user_id__: '',
// }));
//
// analytics.data.myEvent(new MyEvent({
//   prop1: true
// }), {
//   user_id: 'id'
// });
//

// analytics.track(User.setUserId('u-id').setUserProperties(), new UserLoggedIn());

// set untyped user properties
// user.setUserProperties({
//   requiredProp: "untyped"
// });
