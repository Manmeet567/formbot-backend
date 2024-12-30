const Workspace = require("../models/workspaceModel");
const Form = require("../models/formModel");
const Folder = require("../models/folderModel");
const User = require("../models/userModel");
const WorkspaceInvite = require("../models/workspaceInvite");
const { v4: uuidv4 } = require("uuid");
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
        .json({ error: "User already has access to this workspace." });
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

const generateInvite = async (req, res) => {
  const { workspaceId } = req.params;
  const { permission } = req.body;
  const userId = req.user._id;

  if (!permission) {
    return res.status(400).json({ error: "Permission is required." });
  }

  try {
    const inviteToken = uuidv4();

    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 48);

    const user = await User.findById(userId);

    const invite = await WorkspaceInvite.create({
      inviteToken,
      ownerName: user?.name,
      workspaceId,
      permission,
      expiresAt: expirationTime,
    });

    return res.status(201).json({ token: inviteToken });
  } catch (error) {
    console.error("Error generating invite:", error);
    return res.status(500).json({ error: "Failed to generate invite." });
  }
};

const validateInviteAndAddUser = async (req, res) => {
  const { inviteToken } = req.params;
  const userId = req.user._id;

  try {
    const invite = await WorkspaceInvite.findOne({ inviteToken });

    if (!invite) {
      return res.status(404).json({ error: "Invalid invite token." });
    }

    if (invite.expiresAt < new Date()) {
      // If the invite is expired, delete it and send error
      await WorkspaceInvite.deleteOne({ inviteToken });
      return res.status(400).json({ error: "Invite link has expired." });
    }

    // Step 3: Find the workspace using workspaceId from the invite
    const workspace = await Workspace.findById(invite.workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found." });
    }

    // Step 4: Check if user is already added to the workspace
    const alreadyShared = workspace.sharedWith.some((user) =>
      user.userId.equals(userId)
    );

    if (!alreadyShared) {
      // Step 5: Add the user to the sharedWith array with permission
      workspace.sharedWith.push({
        userId: userId,
        permission: invite.permission,
      });
      await workspace.save(); // Save the updated workspace
    }

    // Step 6: Find the user and add workspaceId to their workspaceAccess array
    const user = await User.findById(userId);
    if (!user.workspaceAccess.includes(invite.workspaceId)) {
      user.workspaceAccess.push(invite.workspaceId);
      await user.save(); // Save the updated user with workspaceAccess array
    }

    // await WorkspaceInvite.deleteOne({ inviteToken });

    // Step 7: Return the workspaceId to the frontend
    return res
      .status(200)
      .json({ ownerName: invite.ownerName, workspaceId: workspace._id });
  } catch (error) {
    console.error("Error processing invite:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while processing the invite." });
  }
};

module.exports = {
  getAllWorkspaces,
  getWorkspaceById,
  addSharedUser,
  generateInvite,
  validateInviteAndAddUser,
};
