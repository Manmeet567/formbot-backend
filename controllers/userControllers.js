const User = require("../models/userModel");
const Workspace = require("../models/workspaceModel");
const jwt = require("jsonwebtoken");

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET);
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
    res.status(400).json({ error: error.message });
  }
};

const signupUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Step 1: Create the user
    const user = await User.signup(name, email, password);

    // Step 2: Create a workspace for the user
    const workspace = await Workspace.create({
      ownerId: user._id,
      sharedWith: [],
      folderIds: [],
      formIds: [],
    });

    // Step 3: Associate the workspace with the user
    user.workspaceId = workspace._id;
    await user.save();

    // Step 4: Create a JWT token
    const token = createToken(user._id);

    res.status(200).json({ token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getUserData = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("-password");

    res.status(200).json(user);
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = { loginUser, signupUser, getUserData };
