const Form = require("../models/formModel");
const Folder = require("../models/folderModel");
const Workspace = require("../models/workspaceModel");
const Response = require("../models/responseModel");
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

    try {
      await Response.deleteMany({ formId });
      console.log(`All responses for form ${formId} have been deleted.`);
    } catch (error) {
      console.error(`Error deleting responses for form ${formId}:`, error);
    }
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
  const { flow, title } = req.body;

  try {
    const form = await Form.findById(formId);

    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }

    let updated = false;

    // Only update the flow if it has changed
    if (flow && JSON.stringify(flow) !== JSON.stringify(form.flow)) {
      form.flow = flow;
      updated = true;
    }

    // Only update the title if it has changed
    if (title && title !== form.title) {
      form.title = title;
      updated = true;
    }

    if (!updated) {
      return res.status(400).json({ error: "No changes to update" });
    }

    await form.save();

    return res.status(200).json({
      _id:formId,
      message: "Flow and/or title updated successfully",
      updatedFlow: form.flow,
      updatedTitle: form.title,
    });
  } catch (error) {
    console.error("Error updating form flow or title:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  createForm,
  deleteForm,
  getForm,
  saveFlow,
};
