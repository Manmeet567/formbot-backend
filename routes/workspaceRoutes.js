const express = require("express");
const {
  getAllWorkspaces,
  getWorkspaceById,
  addSharedUser,
} = require("../controllers/workspaceControllers");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");

router.use(requireAuth);

router.get("/get-all-workspaces", getAllWorkspaces);

router.get("/:workspaceId/get-workspace", getWorkspaceById);

router.post("/:workspaceId/add-workspace", addSharedUser);

module.exports = router;
