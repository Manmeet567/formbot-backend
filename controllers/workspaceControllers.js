const Workspace = require("../models/workspaceModel");
const Form = require("../models/formModel");
const Folder = require("../models/folderModel");
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

const getWorkspaces = async (req, res) => {
  const workspaceAccess = req.body.workspaceAccess;

  try {
    const workspaceIds = workspaceAccess.map((access) => access.workspaceId);

    // Fetch workspaces with owner details
    const workspaces = await Workspace.aggregate([
      { $match: { _id: { $in: workspaceIds.map(mongoose.Types.ObjectId) } } },
      {
        $lookup: {
          from: "users",
          localField: "ownerId",
          foreignField: "_id",
          as: "ownerDetails",
        },
      },
      {
        $project: {
          _id: 1,
          "ownerDetails.name": 1,
        },
      },
    ]);

    // Format the response
    const response = workspaces.map((workspace) => ({
      workspaceId: workspace._id,
      ownerName: workspace.ownerDetails[0]?.name || "Unknown",
    }));

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching workspaces with owners:", error);
    res.status(500).json({ error: "Failed to fetch workspaces" });
  }
};

const getUserWorkspaces = async (req, res) => {
  const userId = req.user._id;
  const { workspaceId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const accessibleWorkspaces = user.workspaceAccess.map((access) =>
      access.workspaceId.toString()
    );

    if (workspaceId) {
      if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
        return res.status(400).json({ error: "Invalid workspace ID" });
      }

      if (!accessibleWorkspaces.includes(workspaceId)) {
        return res
          .status(403)
          .json({ error: "Access denied to this workspace" });
      }
    }

    const workspaceQuery = workspaceId
      ? { _id: workspaceId }
      : { _id: { $in: accessibleWorkspaces } };

    const workspace = await Workspace.find(workspaceQuery);

    if (!workspace || workspace.length === 0) {
      return res.status(404).json({ error: "No workspaces found" });
    }

    const folderIds = workspace.flatMap((workspace) => workspace.folderIds);
    const formIds = workspace.flatMap((workspace) => workspace.formIds);

    const folders = await Folder.find({ _id: { $in: folderIds } });
    const forms = await Form.find({ _id: { $in: formIds } });

    const response = {
      workspace,
      folders,
      forms,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    res.status(500).json({ error: "Failed to retrieve workspaces" });
  }
};

module.exports = {
  shareWorkspaceByInvite,
  shareWorkspaceViaLink,
  getUserWorkspaces
};
