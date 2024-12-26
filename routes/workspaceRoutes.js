const express = require("express");
const {
  getAllWorkspaces,
  getWorkspaceById,
} = require("../controllers/workspaceControllers");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");

router.use(requireAuth);

router.get("/get-all-workspaces", getAllWorkspaces);

router.get("/:workspaceId/get-workspace", getWorkspaceById);

module.exports = router;
