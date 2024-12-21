const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validator.isEmail, 'Invalid email format']
  },
  password: {
    type: String,
    required: true
  },
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
});

// Static method for signing up
userSchema.statics.signup = async function (name, email, password) {
  // Validation
  if (!name || !email || !password) {
    throw Error('All fields must be filled');
  }

  if (!validator.isEmail(email)) {
    throw Error('Email is not valid');
  }

  if (password.length < 8) {
    throw Error('Password must be at least 8 characters long');
  }

  const emailExists = await this.findOne({ email });

  if (emailExists) {
    throw Error('Email already in use');
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  // Create the user
  const user = await this.create({ name, email, password: hash });

  return user;
};

// Static method for logging in
userSchema.statics.login = async function (email, password) {
  if (!email || !password) {
    throw Error('All fields must be filled');
  }

  const user = await this.findOne({ email });

  if (!user) {
    throw Error('User does not exist');
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw Error('Incorrect Password');
  }

  return user;
};

module.exports = mongoose.model('User', userSchema);
