const mongoose = require("mongoose");

const FormSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Folder",
    default: null,
  },
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workspace",
    required:true,
  },
  title: { type: String, required: true },
  flow: [
    {
      field: { type: String, required: true }, 
      type: { type: String, enum: ["bubble", "input"], required: true }, 
      fieldValue: { type: mongoose.Schema.Types.Mixed, default: null }, 
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const Form = mongoose.model("Form", FormSchema);

module.exports = Form;
