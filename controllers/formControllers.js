const Form = require("../models/formModel");
const Folder = require("../models/folderModel");
const Workspace = require("../models/workspaceModel");
const mongoose = require("mongoose");

const createForm = async (req, res) => {
  const { workspaceId, folderId } = req.params; // Params from the request
  const { title } = req.body; // Form title from the request body

  try {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    if (folderId) {
      const folder = await Folder.findById(folderId);
      if (!folder) {
        return res.status(404).json({ error: "Folder not found" });
      }
    }
    const existingForm = await Form.findOne({
      title: title,
      workspaceId: workspaceId,
    });

    if (existingForm) {
      return res.status(400).json({
        error: "A form with this title already exists in the workspace",
      });
    }

    const newForm = new Form({
      createdBy: req.user._id,
      folderId: folderId || null,
      workspaceId: workspaceId,
      title: title,
      flow: [],
    });

    await newForm.save();

    res.status(201).json(newForm);
  } catch (error) {
    console.error("Error creating form:", error);
    res.status(500).json({ error: "Server error, could not create form" });
  }
};

const deleteForm = async (req, res) => {
  const { formId } = req.params;

  try {
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }

    const workspace = await Workspace.findById(form.workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    await Form.findByIdAndDelete(formId);

    res.status(200).json({ message: "Form deleted successfully" });
  } catch (error) {
    console.error("Error deleting form:", error);
    res.status(500).json({ error: "Server error, could not delete form" });
  }
};

const getForm = async (req, res) => {
  const { workspaceId, folderId, formId } = req.params;
  const userId = req.user._id;

  const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

  try {
    if (
      !isValidObjectId(workspaceId) ||
      (folderId && !isValidObjectId(folderId)) ||
      !isValidObjectId(formId)
    ) {
      return res.status(400).json({ error: "Invalid ID format in parameters" });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    const sharedWithEntry = workspace.sharedWith.find(
      (entry) => entry.userId.toString() === userId.toString()
    );
    if (!sharedWithEntry) {
      return res
        .status(403)
        .json({ error: "Access denied: User does not have permission" });
    }
    req.user.permission = sharedWithEntry.permission;

    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }

    if (
      form.workspaceId.toString() !== workspaceId ||
      (folderId && form.folderId?.toString() !== folderId)
    ) {
      return res.status(403).json({ error: "Access denied: ID mismatch" });
    }

    const responseForm = {
      ...form.toObject(),
      permission: sharedWithEntry.permission,
    };

    res.status(200).json(responseForm);
  } catch (error) {
    console.error("Error fetching form:", error);
    res.status(500).json({ error: "Error fetching form" });
  }
};

const saveFlow = async (req, res) => {
  const { formId } = req.params;
  const { flow } = req.body;
  console.log(req.user.permission);
  try {
    const form = await Form.findById(formId);

    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }

    form.flow = flow;

    await form.save();

    return res.status(200).json({
      message: "Flow updated successfully",
      updatedFlow: form.flow, 
    });
  } catch (error) {
    console.error("Error updating form flow:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

const submitForm = async (req, res) => {
  const { responses } = req.body;

  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }

    form.responses.push(responses);
    await form.save();

    res.status(200).json({ message: "Response submitted", form });
  } catch (error) {
    res.status(500).json({ error: "Error submitting response" });
  }
};

const getFormsByFolder = async (req, res) => {
  const { folderId } = req.params;

  try {
    const forms = await Form.find({ folderId });

    // If no forms found, send a 404 response
    if (!forms || forms.length === 0) {
      return res.status(404).json({ error: "No forms found for this folder" });
    }

    // Return the found forms
    return res.status(200).json({ forms });
  } catch (error) {
    // Handle errors and send a 500 response if something goes wrong
    return res
      .status(500)
      .json({ error: "Server error", details: error.message });
  }
};

module.exports = {
  createForm,
  deleteForm,
  getForm,
  saveFlow,
  submitForm,
  getFormsByFolder,
};
