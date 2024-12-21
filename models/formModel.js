const mongoose = require("mongoose");

const FormSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Folder",
    default: null,
  },
  title: { type: String, required: true },
  fields: [
    {
      label: { type: String, required: true },
      type: { type: String, required: true },
      required: { type: Boolean, default: false },
    },
  ],
  responses: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now },
});

const Form = mongoose.model("Form", FormSchema);

module.exports = Form;
