const Form = require("../models/formModel");
const Folder = require("../models/folderModel");
const Workspace = require("../models/workspaceModel");

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
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }
    res.status(200).json(form);
  } catch (error) {
    res.status(500).json({ error: "Error fetching form" });
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
    // Find forms that have the same folderId
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
  submitForm,
  getFormsByFolder,
};
