const Folder = require("../models/folderModel");
const Workspace = require("../models/workspaceModel");

const createFolder = async (req, res) => {
  const { title } = req.body; 
  const { workspaceId } = req.params; 

  try {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }
    const existingFolder = await Folder.findOne({
      title: title,
      workspaceId: workspaceId, 
    });

    if (existingFolder) {
      return res.status(400).json({
        error: "A folder with this name already exists in the workspace",
      });
    }

    const newFolder = new Folder({
      title, 
      createdBy: req.user._id, 
      workspaceId: workspaceId, 
    });

    await newFolder.save();


    res.status(201).json(newFolder);
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).json({ error: "Error creating folder" });
  }
};

const deleteFolder = async (req, res) => {
  const { folderId } = req.params;

  try {
    const folder = await Folder.findById(folderId);
    if (!folder) {
      return res.status(404).json({ error: "Folder not found" });
    }

    const workspace = await Workspace.findById(folder.workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    await Folder.findByIdAndDelete(folderId);

    res.status(200).json({ message: "Folder deleted successfully" });
  } catch (error) {
    console.error("Error deleting folder:", error);
    res.status(500).json({ error: "Server error, could not delete folder" });
  }
};

const getFolder = async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id).populate("formIds");
    if (!folder) {
      return res.status(404).json({ error: "Folder not found" });
    }
    res.status(200).json(folder);
  } catch (error) {
    res.status(500).json({ error: "Error fetching folder" });
  }
};

const addFormToFolder = async (req, res) => {
  const { formId } = req.body;

  try {
    const folder = await Folder.findById(req.params.id);
    if (!folder) {
      return res.status(404).json({ error: "Folder not found" });
    }

    folder.formIds.push(formId);
    await folder.save();

    res.status(200).json(folder);
  } catch (error) {
    res.status(500).json({ error: "Error adding form to folder" });
  }
};

module.exports = { createFolder, deleteFolder, getFolder, addFormToFolder };
