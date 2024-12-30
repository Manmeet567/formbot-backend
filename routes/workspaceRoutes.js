const express = require("express");
const {
  getAllWorkspaces,
  getWorkspaceById,
  addSharedUser,
  generateInvite,
  validateInviteAndAddUser
} = require("../controllers/workspaceControllers");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");

router.use(requireAuth);

router.get("/get-all-workspaces", getAllWorkspaces);

router.get("/:workspaceId/get-workspace", getWorkspaceById);

router.post("/:workspaceId/add-workspace", addSharedUser);

router.post("/:workspaceId/generate-invite", generateInvite);

router.get("/:inviteToken/validate-invite", validateInviteAndAddUser);

module.exports = router;
