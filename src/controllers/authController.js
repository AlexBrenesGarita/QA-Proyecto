const { validateUser, getPublicProfile } = require('../models/userModel');

function getLoginPage(req, res) {
  res.render('login', { error: null });
}

function postLogin(req, res) {
  const { email, password } = req.body;
  const user = validateUser(email, password);

  if (!user) {
    return res.status(401).render('login', {
      error: 'Credenciales inválidas. Intente de nuevo.'
    });
  }

  req.session.user = getPublicProfile(user);
  res.redirect('/tutoring/dashboard');
}

function logout(req, res) {
  req.session.destroy(() => {
    res.redirect('/login');
  });
}

function ensureAuthenticated(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
}

module.exports = {
  getLoginPage,
  postLogin,
  logout,
  ensureAuthenticated
};
