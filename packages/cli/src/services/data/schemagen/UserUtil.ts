export type User = {
  firstName?: string;
  lastName?:string;
  email?: string;
  emailAddress?: string;
}

export const getUsername = (user: User) => {
  const fullName = `${user.firstName} ${user.lastName}`.trim();
  if (fullName.length === 0) {
    return user.email ?? user.emailAddress;
  }

  return fullName;
};
