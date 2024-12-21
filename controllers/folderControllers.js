const Folder = require("../models/folderSchema");
const Workspace = require("../models/workspaceModel");

const createFolder = async (req, res) => {
  const { title, workspaceId } = req.body;

  try {
    // Validate workspace existence
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    // Create the folder
    const newFolder = new Folder({
      title,
      createdBy: req.user._id,
    });
    await newFolder.save();

    // Add the folder ID to the workspace
    workspace.folderIds.push(newFolder._id);
    await workspace.save();

    res.status(201).json(newFolder);
  } catch (error) {
    res.status(500).json({ error: "Error creating folder" });
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

module.exports = { createFolder, getFolder, addFormToFolder };
