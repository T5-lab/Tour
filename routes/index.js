const express = require('express')
const userRoutes = require('./userRoutes.js')
const tourRoutes = require('./tourRoutes.js')
const reserveRoutes = require('./reserveRoutes.js')

const router = express.Router();

module.exports = () => {

  router.use('/user', userRoutes());

  router.use('/tour', tourRoutes());

  router.use('/reserve', reserveRoutes());

  return router;
}
