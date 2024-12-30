const mongoose = require("mongoose");

const ResponseSchema = new mongoose.Schema({
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Form",
    required: true,
  },
  responses: [
    {
      field: { type: String, required: true },
      fieldValue: { type: String, required: true },
      type: { type: String, required: true },
    },
  ],
  status: {
    type: String,
    enum: ["completed", "incomplete"],
    default: "incomplete",
  },
  submittedAt: { type: Date, default: null },
});

const Response = mongoose.model("Response", ResponseSchema);

module.exports = Response;
