// models/WorkspaceInvite.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const workspaceInviteSchema = new Schema({
  inviteToken: {
    type: String,
    required: true,
    unique: true,
  },
  ownerName:{
    type: String,
    required: true,
  },
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workspace",
    required: true,
  },
  permission: {
    type: String,
    enum: ["view", "edit"], // restrict permission values to either "view" or "edit"
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

const WorkspaceInvite = mongoose.model("WorkspaceInvite", workspaceInviteSchema);

module.exports = WorkspaceInvite;
