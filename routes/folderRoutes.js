const express = require("express");
const router = express.Router();
const requireAuth = express.Router();
const {
  createFolder,
  getFolder,
  addFormToFolder,
} = require("../controllers/folderControllers");

router.use(requireAuth);

router.post("/create-folder", createFolder);

router.get("/:id", getFolder);

router.put("/:id/add-form", addFormToFolder);

module.exports = router;
