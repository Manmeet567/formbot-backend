const express = require("express");
const { shareWorkspaceByInvite, shareWorkspaceViaLink, getUserWorkspaces } = require("../controllers/workspaceControllers");
const router = express.Router();
const requireAuth = express.Router();

router.use(requireAuth);

router.get('/:id', getUserWorkspaces);

router.post('/share', shareWorkspaceByInvite);

router.get('/share/:workspaceId/:token', shareWorkspaceViaLink);

module.exports = router;