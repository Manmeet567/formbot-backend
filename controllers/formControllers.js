const Form = require("../models/formModel");
const Folder = require("../models/folderModel");
const Workspace = require("../models/workspaceModel");

const createForm = async (req, res) => {
  const { title, fields, folderId, workspaceId } = req.body;

  try {
    // Validate workspace existence
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    // Validate folder existence if folderId is provided
    if (folderId) {
      const folder = await Folder.findById(folderId);
      if (!folder) {
        return res.status(404).json({ error: "Folder not found" });
      }
    }

    // Create the form
    const newForm = new Form({
      title,
      fields,
      folderId,
    });
    await newForm.save();

    // Add the form ID to the folder if folderId is provided
    if (folderId) {
      await Folder.findByIdAndUpdate(folderId, {
        $push: { formIds: newForm._id },
      });
    }

    // Add the form ID to the workspace
    workspace.formIds.push(newForm._id);
    await workspace.save();

    res.status(201).json(newForm);
  } catch (error) {
    res.status(500).json({ error: "Error creating form" });
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

module.exports = { createForm, getForm, submitForm };
