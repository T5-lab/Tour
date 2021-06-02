const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const conf = require('../conf.js');
const bcrypt = require('bcryptjs');

function validateValue(value) {
  value = value.split('');
  let psb = '1234567890qazwsxedcrfvtgbyhnujmiklop'.split('');
  for (let i = 0; i < value.length; i++) {
    for (let j = 0; j < psb.length; j++) {
      if(value[i] === psb[j]) break;
      if(psb.length-1 === j) return false;
    }
  }
  return true;
}

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 12,
    unique: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return validateValue(v);
      },
      message: props => `${props.value} is not a valid username`
    }
  },
  password: {
    type: String,
    minlength: 8,
    required: true
  },
  groups: [{
    type: String
  }],
  reserves: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'reserve'
  }],
  tokens: [{
    token: {
      type: String
    }
  }]
}, {timestamps: true})

UserSchema.methods.generateToken = function() {
  const token = jwt.sign({id: this._id}, conf.TOKEN_SECRET);
  this.tokens.push({token});
  return this.save().then(user => {
    return token;
  })
}

UserSchema.pre('save', function(next) {
  if(this.isModified('password')) {
    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(this.password, salt);
    this.password = hash;
    return next();
  }
  return next();
})

UserSchema.methods.comparePassword = function(password) {
  return bcrypt.compareSync(password, this.password)
}

UserSchema.statics.findAndCheck = async function(username, password) {
  try {
    let user = await this.findOne({username})
    if(!user.comparePassword(password)) {
      return Promise.reject('incorrect password!');
    }
    return Promise.resolve(user);
  } catch(e) {
    return Promise.reject('user not found!');
  }
}

UserSchema.statics.findByToken = async function(token) {
  let decoded;
  try {
    decoded = jwt.verify(token, conf.TOKEN_SECRET);
  } catch(e) {
    return Promise.reject('something went wrong');
  }
  return this.findOne({
    '_id': decoded.id,
    'tokens.token': token
  })
}

UserSchema.statics.logoutUser = async function(token) {
  let decoded;
  try {
    decoded = jwt.verify(token, conf.TOKEN_SECRET);
  }
  catch(e) {
    return Promise.reject('Expired Token');
  }
  this.findOne({
    '_id': decoded.id
  }).then(user => {
    user.updateOne({
      $pull: {
        tokens: {
          token
        }
      }
    }).then(() => {
      return Promise.resolve('Successfully logged out')
    }).catch(e => {
      return Promise.reject('Could not log out')
    })
  }).catch(e => {
    return Promise.reject('Could not find User')
  })
}

module.exports = mongoose.model('user', UserSchema);
