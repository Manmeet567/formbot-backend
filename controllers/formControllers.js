const Form = require("../models/formModel");
const Folder = require("../models/folderModel");
const Workspace = require("../models/workspaceModel");

const createForm = async (req, res) => {
  const { workspaceId, folderId } = req.params; // Params from the request
  const { title } = req.body; // Form title from the request body

  try {
    // Check if workspaceId is provided and valid
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    // Check if folderId is provided and valid (if folderId exists)
    if (folderId) {
      const folder = await Folder.findById(folderId);
      if (!folder) {
        return res.status(404).json({ error: "Folder not found" });
      }
    }

    // Check if the form with the same title already exists in the workspace
    const existingForm = await Form.findOne({
      title: title,
      workspaceId: workspaceId,
    });

    if (existingForm) {
      return res.status(400).json({
        error: "A form with this title already exists in the workspace",
      });
    }

    // If no existing form, create a new form
    const newForm = new Form({
      createdBy: req.user._id,
      folderId: folderId || null,
      workspaceId: workspaceId,
      title: title,
      flow: [],
    });

    await newForm.save();

    workspace.formIds.push(newForm._id);
    await workspace.save();

    res.status(201).json(newForm);
  } catch (error) {
    console.error("Error creating form:", error);
    res.status(500).json({ error: "Server error, could not create form" });
  }
};

const deleteForm = async (req, res) => {
  const { formId } = req.params;

  try {
    // Find the form by its ID
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }

    // Remove the form ID from the workspace's formIds array
    const workspace = await Workspace.findById(form.workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    workspace.formIds = workspace.formIds.filter(
      (id) => id.toString() !== formId
    );
    await workspace.save();

    // Delete the form
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

module.exports = { createForm, deleteForm, getForm, submitForm };
