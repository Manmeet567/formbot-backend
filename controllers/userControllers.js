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
    // Step 1: Register the new user
    const user = await User.signup(name, email, password);

    // Step 2: Create a new workspace with the user as the owner
    const workspace = await Workspace.create({
      ownerId: user._id,
      folderIds: [],
      formIds: [],
    });

    user.workspaceAccess.push({
      workspaceId: workspace._id,
      permission: "edit",
      ownerId: user._id,
      ownerName: name,
    });

    await user.save();

    // Step 4: Create a token for the user
    const token = createToken(user._id);

    // Step 5: Send the response with the token
    res.status(200).json({ token });
  } catch (error) {
    console.error("Error during user signup:", error);
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
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (name) {
      user.name = name;
      user.workspaceAccess[0].ownerName = name;
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: userId } });
      if (emailExists) {
        return res.status(400).json({ error: "Email is already in use" });
      }
      user.email = email;
    }

    if (oldPassword && newPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Old password is incorrect" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      user.password = hashedPassword;
    }

    const userData = await user.save();

    res.status(200).json(userData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { loginUser, signupUser, getUserData, updateUser };
