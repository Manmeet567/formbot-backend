const express = require("express");
const { shareWorkspaceByInvite, shareWorkspaceViaLink, getUserWorkspaces } = require("../controllers/workspaceControllers");
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');

router.use(requireAuth);

router.get('/get-workspace', getUserWorkspaces);

router.post('/share', shareWorkspaceByInvite);

router.get('/share/:workspaceId/:token', shareWorkspaceViaLink);

module.exports = router;