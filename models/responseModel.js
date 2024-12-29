const mongoose = require("mongoose");

const ResponseSchema = new mongoose.Schema({
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Form",
    required: true,
  },
  answers: [
    {
      field: { type: String, required: true },
      response: { type: mongoose.Schema.Types.Mixed, required: true },
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
