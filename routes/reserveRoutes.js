const express = require('express');
const User = require('../models/User.js');
const Tour = require('../models/Tour.js');
const Reserve = require('../models/Reserve.js');
const {
  RedirectIfLoggedOut,
  AuthenticateUser
} = require('../middlewares/auth.js');

const router = express.Router();

module.exports = () => {
  // -------------- /reserve --------------

  router.post('/', AuthenticateUser, RedirectIfLoggedOut, async (req, res, next) => {
    try {
      const {tourId, count, date} = req.body;
      let reserve = new Reserve({user: req.user._id, tour: tourId, count, date});
      let tour = await Tour.findById(tourId);
      let user = await User.findById(req.user._id);
      if(tour.capacity - tour.sold < count) {
        throw "out of capacity";
      }
      reserve = await reserve.save();
      user.reserves.push(reserve._id);
      user = await user.save();
      tour.sold += reserve.count;
      tour = await tour.save();
      res.send(reserve);
    } catch(e) {
      res.status(401).send(e);
    }
  })

  router.get('/:id', AuthenticateUser, RedirectIfLoggedOut, async (req, res, next) => {
    try {
      let user = await User.findById(req.params.id).populate({path: 'reserves', populate: {path: 'tour'}});
      if(!user) throw "user not found";
      if(user._id.toString() === req.user._id.toString() || req.user.groups.includes('ADMIN')) return res.send(user.reserves);
      res.status(401).send('Premission Denied');
    } catch(e) {
      res.status(401).send(e);
    }
  })

  return router;
}
