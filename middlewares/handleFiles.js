const fs = require('fs');
const path = require('path');

function handleFiles(req, res, next) {
  const BASE_DIR = path.resolve(`${__dirname}/../public`);
  req.filenames = []
  req.files.forEach(file => {
    if(file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/jpg' && file.mimetype !== 'image/png') {
      return res.status(401).send('Invalid Format')
    }
    let name = `${Date.now()}.jpg`;
    fs.writeFileSync(`${BASE_DIR}/${name}`, file.buffer);
    req.filenames.push(name);
  })
  next();
}

module.exports = handleFiles;
