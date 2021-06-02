const User = require('../models/User.js');

function AuthenticateUser(req, res, next) {
  const token = req.header('x-auth');
  User.findByToken(token).then(user => {
    req.user = user;
    next();
  }).catch(e => {
    req.user = null;
    next();
  })
}

function RedirectIfLoggedIn(req, res, next) {
  if(req.user)
    res.send('u should logout');
  else next();
}

function RedirectIfLoggedOut(req, res, next) {
  if(!req.user)
    res.send('u should login')
  else next();
}

function RedirectIfNotAdmin(req, res, next) {
  if(!req.user.groups.includes("ADMIN"))
    res.send('Premission Denied')
  else next();
}

module.exports = {
  AuthenticateUser,
  RedirectIfLoggedIn,
  RedirectIfLoggedOut,
  RedirectIfNotAdmin
}
