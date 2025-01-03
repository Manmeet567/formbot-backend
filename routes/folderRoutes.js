const express = require("express");
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const {
  createFolder,
  deleteFolder,
  getFolder,
} = require("../controllers/folderControllers");

router.use(requireAuth);

router.post("/:workspaceId/create", createFolder);

router.delete("/:folderId/delete-folder", deleteFolder);

router.get("/:id", getFolder);

module.exports = router;
