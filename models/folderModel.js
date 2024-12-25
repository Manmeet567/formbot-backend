const mongoose = require("mongoose");

const FolderSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: { type: String, required: true },
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace" },
  createdAt: { type: Date, default: Date.now },
});

const Folder = mongoose.model("Folder", FolderSchema);

module.exports = Folder;
