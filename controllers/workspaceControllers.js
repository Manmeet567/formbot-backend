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
    req.user.permission = permission;
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

module.exports = {
  getAllWorkspaces,
  getWorkspaceById,
};
