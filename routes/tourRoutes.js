const express = require('express')
const {
  AuthenticateUser,
  RedirectIfLoggedOut,
  RedirectIfNotAdmin
} = require('../middlewares/auth.js');
const upload = require('../middlewares/upload.js');
const handleFiles = require('../middlewares/handleFiles.js')
const Tour = require('../models/Tour.js')
const fs = require('fs');
const path = require('path');

const router = express.Router();

module.exports = () => {
  // ----------- /tour -----------

  router.post('/create', AuthenticateUser, RedirectIfLoggedOut, RedirectIfNotAdmin, upload.array('images', 3), handleFiles, (req, res, next) => {
    const {name, description, price, capacity, startlat, startlon, endlat, endlon} = req.body;
    let locations = {
      start: {
        coordinates: [startlat, startlon]
      },
      end: {
        coordinates: [endlat, endlon]
      }
    }
    const tour = new Tour({name, description, price, capacity, locations, images: req.filenames})
    tour.save().then(tour => {
      res.send(tour)
    }).catch(e => res.status(401).send(e))
  })

  router.get('/search', AuthenticateUser, RedirectIfLoggedOut, async (req, res, next) => {
    try {
      const {price_gte, price_lte, capacity_gte, capacity_lte} = req.query;
      const page = req.query.page ? req.query.page : 1;
      const limit = 5;
      let tours = await Tour.where('price').gte(price_gte).lte(price_lte)
                        .where('capacity').gte(capacity_gte).lte(capacity_lte)
                        .skip((page-1)*limit).limit(limit);
      res.send(tours);
    } catch(e) {
      res.status(401).send(e);
    }
  })

  router.get('/report', AuthenticateUser, RedirectIfLoggedOut, RedirectIfNotAdmin, async (req, res, next) => {
    try {
      const date_gte = req.query.date_gte ? req.query.date_gte : 0;
      const date_lte = req.query.date_lte ? req.query.date_lte : Date.now();
      console.log(date_gte, date_lte);
      let tours = await Tour.find({createdAt: {$gte: date_gte, $lte: date_lte}});
      let data = {
        numberOfTours: tours.length,
        numberOfPersons: 0,
        totalIncome: 0
      }
      tours.forEach(tour => {
        data.numberOfPersons += tour.sold;
        data.totalIncome += tour.sold * tour.price;
      })
      res.send(data);
    } catch(e) {
      res.status(401).send(e);
    }
  })

  router.get('/date-report/:y/:m/:d', AuthenticateUser, RedirectIfLoggedOut, RedirectIfNotAdmin, async (req, res, next) => {
    try {
      const {y, m, d} = req.params;
      let tours = await Tour.find({createdAt: {$lte: `${y}-${m}-${d}T23:59:59.999Z`, $gte: `${y}-${m}-${d}T00:00:00.000Z`}});
      let data = {
        date: `${y}-${m}-${d}`,
        numberOfTours: tours.length,
        numberOfPersons: 0,
        totalIncome: 0
      }
      tours.forEach(tour => {
        data.numberOfPersons += tour.sold;
        data.totalIncome += tour.sold * tour.price;
      })
      res.send(data);
    } catch(e) {
      res.status(401).send(e);
    }
  })

  router.get('/images/:image', (req, res, next) => {
    res.send(fs.readFileSync(path.resolve(`${__dirname}/../public/${req.params.image}`)));
  })

  return router;
}
