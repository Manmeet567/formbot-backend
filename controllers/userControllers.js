const User = require("../models/userModel");
const Workspace = require("../models/workspaceModel");
const bcrypt = require("bcrypt");
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

const updateUser = async (req, res) => {
  const userId = req.user._id;
  const { name, email, oldPassword, newPassword } = req.body;

  try {
    // Find the user by userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the name directly if it's provided
    if (name) {
      user.name = name;
    }

    
    if (email && email !== user.email) {
      // Check if another user has this email
      const emailExists = await User.findOne({ email, _id: { $ne: userId } });
      if (emailExists) {
        return res.status(400).json({ error: "Email is already in use" });
      }
      user.email = email;
    }

    // Check if password is being updated
    if (oldPassword && newPassword) {
      // Validate the old password
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Old password is incorrect" });
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      user.password = hashedPassword;
    }

    // Save the updated user details
    await user.save();

    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { loginUser, signupUser, getUserData, updateUser };
