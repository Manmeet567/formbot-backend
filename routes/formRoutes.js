const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const {
  createForm,
  deleteForm,
  getForm,
  saveFlow
} = require("../controllers/formControllers");

router.use(requireAuth);

router.post("/:workspaceId/:folderId?/create-form", createForm);

router.get("/:workspaceId/:folderId?/:formId/get-form", getForm);

router.put("/:formId/update-flow", saveFlow);

router.delete("/:formId/delete-form", deleteForm);

router.get("/:id", getForm);

module.exports = router;
