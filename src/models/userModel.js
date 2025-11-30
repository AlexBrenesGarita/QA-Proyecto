const users = require('../config/users');

function findByEmail(email) {
  return users.find((u) => u.email === email);
}

function validateUser(email, password) {
  const user = findByEmail(email);
  if (!user) return null;
  if (user.password !== password) return null;
  return { ...user };
}

function getPublicProfile(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

module.exports = {
  findByEmail,
  validateUser,
  getPublicProfile
};
