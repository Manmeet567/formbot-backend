const mongoose = require("mongoose");

const WorkspaceSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  ownerName: {
    type: String,
    required: true,
  },
  sharedWith: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      permission: { type: String, enum: ["view", "edit"] },
    },
  ],
});

const Workspace = mongoose.model("Workspace", WorkspaceSchema);

module.exports = Workspace;
