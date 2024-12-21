const Workspace = require("../models/workspaceModel");
const User = require("../models/userModel");
const mongoose = require("mongoose");

const shareWorkspaceByInvite = async (req, res) => {
  const { workspaceId, userEmail, permission } = req.body;

  if (!workspaceId || !userEmail || !permission) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).json({ error: "User does not exist" });
    }

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    const alreadyShared = workspace.sharedWith.some(
      (shared) => shared.userId.toString() === user._id.toString()
    );

    if (alreadyShared) {
      return res
        .status(400)
        .json({ error: "Workspace already shared with this user" });
    }

    workspace.sharedWith.push({ userId: user._id, permission });
    await workspace.save();

    res.status(200).json({ message: "Workspace shared successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const shareWorkspaceViaLink = async (req, res) => {
  const { workspaceId, token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.SECRET);

    const userId = decoded._id;
    const permission = decoded.permission;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User does not exist" });
    }

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    const alreadyShared = workspace.sharedWith.some(
      (shared) => shared.userId.toString() === userId
    );

    if (alreadyShared) {
      return res
        .status(400)
        .json({ error: "Workspace already shared with this user" });
    }

    workspace.sharedWith.push({ userId, permission });
    await workspace.save();

    res.status(200).json({ message: "Workspace shared successfully via link" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserWorkspaces = async (req, res) => {
  const _id = req.params; 

  try {
    const objectIdUserId = new mongoose.Types.ObjectId(_id);

    // Find workspaces owned by the user
    const ownedWorkspaces = await Workspace.find({
      ownerId: objectIdUserId,
    });

    // Find workspaces shared with the user
    const sharedWorkspaces = await Workspace.find({
      "sharedWith.userId": objectIdUserId,
    });

    // Combine owned and shared workspaces
    const allWorkspaces = {
      owned: ownedWorkspaces,
      shared: sharedWorkspaces,
    };

    res.status(200).json(allWorkspaces);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve workspaces" });
  }
};

module.exports = {
  shareWorkspaceByInvite,
  shareWorkspaceViaLink,
  getUserWorkspaces,
};
