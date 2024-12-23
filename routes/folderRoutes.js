const express = require("express");
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const {
  createFolder,
  getFolder,
  addFormToFolder,
} = require("../controllers/folderControllers");

router.use(requireAuth);

router.post("/:workspaceId/create", createFolder);

router.get("/:id", getFolder);

router.put("/:id/add-form", addFormToFolder);

module.exports = router;
