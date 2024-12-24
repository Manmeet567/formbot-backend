const mongoose = require("mongoose");

const WorkspaceSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  folderIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Folder" }],
  formIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Form" }],
});

const Workspace = mongoose.model("Workspace", WorkspaceSchema);

module.exports = Workspace;
