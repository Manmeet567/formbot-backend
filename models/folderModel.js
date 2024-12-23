const mongoose = require("mongoose");

const FolderSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: { type: String, required: true },
  formIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Form" }],
  createdAt: { type: Date, default: Date.now },
});

const Folder = mongoose.model("Folder", FolderSchema);

module.exports = Folder;
