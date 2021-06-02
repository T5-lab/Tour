const multer = require('multer');
const path = require('path');

module.exports = multer({
  limits: {
    fileSize: 5*1024*1024
  }
})
