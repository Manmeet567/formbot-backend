const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

// Function to create a JWT token
const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET); // No expiry since we don't need it
};

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);

    // Create a JWT token
    const token = createToken(user._id);

    res.status(200).json({ token: token });
  } catch (error) {
    res.status(400).json({ error: error.message }); // Change 'message' to 'error'
  }
};

const signupUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const user = await User.signup(name, email, password);

    // Create a JWT token
    const token = createToken(user._id);

    res.status(200).json({ token: token });
  } catch (error) {
    res.status(400).json({ error: error.message }); // Change 'message' to 'error'
  }
};

module.exports = { loginUser, signupUser };
