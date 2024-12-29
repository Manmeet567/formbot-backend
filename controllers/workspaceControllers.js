const Workspace = require("../models/workspaceModel");
const Form = require("../models/formModel");
const Folder = require("../models/folderModel");
const User = require("../models/userModel");
const mongoose = require("mongoose");

const getAllWorkspaces = async (req, res) => {
  const userId = req.user._id;

  try {
    const workspaces = await Workspace.find({
      $or: [{ ownerId: userId }, { "sharedWith.userId": userId }],
    });

    if (!workspaces.length) {
      return res
        .status(404)
        .json({ error: "No workspaces found for the user" });
    }

    const transformedWorkspaces = workspaces.map((workspace) => {
      const isOwner = workspace.ownerId.toString() === userId.toString();
      const sharedUser = workspace.sharedWith.find(
        (shared) => shared.userId.toString() === userId.toString()
      );

      return {
        ...workspace.toObject(),
        permission: isOwner ? "edit" : sharedUser?.permission || "none", // Owner has "edit" permission
      };
    });

    transformedWorkspaces.forEach((workspace) => {
      delete workspace.sharedWith;
    });

    const workspaceIds = transformedWorkspaces.map(
      (workspace) => workspace._id
    );

    const folders = await Folder.find({ workspaceId: { $in: workspaceIds } });

    const forms = await Form.find({
      workspaceId: { $in: workspaceIds },
      folderId: null,
    });

    const response = {
      workspaces: transformedWorkspaces,
      folders,
      forms,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    res.status(500).json({ error: "Failed to retrieve workspace data" });
  }
};

const getWorkspaceById = async (req, res) => {
  const userId = req.user._id;
  const { workspaceId } = req.params;

  try {
    // Fetch the workspace by ID
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    // Check if the user is the owner of the workspace
    const isOwner = workspace.ownerId.toString() === userId.toString();

    // Check if the user is shared with the workspace
    const sharedUser = workspace.sharedWith.find(
      (shared) => shared.userId.toString() === userId.toString()
    );

    // If the user is neither the owner nor shared with, deny access
    if (!isOwner && !sharedUser) {
      return res.status(403).json({ error: "Access denied to this workspace" });
    }

    // Determine the permission level (edit for owner, shared user's permission, or "none")
    const permission = isOwner ? "edit" : sharedUser?.permission || "none";
    // Fetch folders related to this workspace
    const folders = await Folder.find({ workspaceId });

    // Fetch forms related to this workspace
    const forms = await Form.find({ workspaceId });

    // Prepare the transformed workspace object, excluding the sharedWith field
    const transformedWorkspace = {
      ...workspace.toObject(),
      permission,
    };
    delete transformedWorkspace.sharedWith;

    // Respond with workspace, folders, and forms in the required format
    res.status(200).json({
      workspace: transformedWorkspace,
      folders: folders || [], // Return an empty array if no folders found
      forms: forms || [], // Return an empty array if no forms found
    });
  } catch (error) {
    console.error("Error fetching workspace:", error);
    res.status(500).json({ error: "Failed to retrieve workspace" });
  }
};

const addSharedUser = async (req, res) => {
  const { workspaceId } = req.params;
  const { email, permission } = req.body;

  if (!["view", "edit"].includes(permission)) {
    return res
      .status(400)
      .json({ error: "Invalid permission type. Must be 'view' or 'edit'." });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ error: "User not found with the provided email." });
    }

    // Find the workspace by workspaceId
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found." });
    }

    // Check if user is already shared with the workspace
    const existingUser = workspace.sharedWith.find(
      (item) => item.userId.toString() === user._id.toString()
    );
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User is already shared with this workspace." });
    }

    // Add the user to the sharedWith array of the workspace
    workspace.sharedWith.push({
      userId: user._id,
      permission,
    });

    // Update the user's workspaceAccess array
    user.workspaceAccess.push(workspaceId);

    // Save the updated workspace and user
    await workspace.save();
    await user.save();

    return res
      .status(200)
      .json({ message: "User successfully added to workspace.", workspace });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error." });
  }
};

module.exports = {
  getAllWorkspaces,
  getWorkspaceById,
  addSharedUser,
};
