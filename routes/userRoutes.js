const express = require('express')
const User = require('../models/User.js')
const {
  AuthenticateUser,
  RedirectIfLoggedIn,
  RedirectIfLoggedOut
} = require('../middlewares/auth.js')

const router = express.Router();

module.exports = () => {
  // ----------- /user -----------

  router.post('/signup', AuthenticateUser, RedirectIfLoggedIn, (req, res, next) => {
    const {username, password} = req.body;
    const user = new User({username, password, groups: ['MEMBER']});
    user.save().then(user => {
      user.generateToken().then(token => {
        res.setHeader('x-auth', token)
        res.send(user)
      }).catch(e => res.status(401).send(e))
    }).catch(e => res.status(401).send(e))
  })

  router.post('/admin-signup', AuthenticateUser, RedirectIfLoggedIn, (req, res, next) => {
    const {username, password} = req.body;
    const user = new User({username, password, groups: ['ADMIN']});
    user.save().then(user => {
      user.generateToken().then(token => {
        res.setHeader('x-auth', token)
        res.send(user)
      }).catch(e => res.status(401).send(e))
    }).catch(e => res.status(401).send(e))
  })

  router.post('/login', AuthenticateUser, RedirectIfLoggedIn, (req, res, next) => {
    const {username, password} = req.body;
    User.findAndCheck(username, password).then(user => {
      user.generateToken().then(token => {
        res.setHeader('x-auth', token)
        res.send(user)
      }).catch(e => res.status(401).send(e))
    }).catch(e => res.status(401).send(e))
  })

  router.get('/logout', AuthenticateUser, RedirectIfLoggedOut, (req, res, next) => {
    const token = req.header('x-auth');
    User.logoutUser(token).then(resp => {
      res.send(resp)
    }).catch(e => {
      res.status(401).send(e);
    })
  })

  router.get('/me', AuthenticateUser, RedirectIfLoggedOut, (req, res, next) => {
    res.send(req.user);
  })

  return router;
}
