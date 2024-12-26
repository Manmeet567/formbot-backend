const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const {
  createForm,
  deleteForm,
  getForm,
  submitForm,
  getFormsByFolder,
} = require("../controllers/formControllers");

router.use(requireAuth);

router.post("/:workspaceId/:folderId?/create-form", createForm);

router.delete("/:formId/delete-form", deleteForm);

router.get("/:id", getForm);

router.post("/:id/response", submitForm);

router.get("/:folderId/get-forms", getFormsByFolder);

module.exports = router;
