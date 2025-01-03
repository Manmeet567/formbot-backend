const Form = require("../models/formModel");
const Response = require("../models/responseModel");

const getFormFlow = async (req, res) => {
  try {
    const { formId } = req.params;

    const form = await Form.findById(formId);

    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }

    form.visitCount += 1;

    await form.save();

    res.status(200).json({ flow: form.flow });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching the form" });
  }
};

const updateResponse = async (req, res) => {
  const { responseId, formId, responses, isSubmitted } = req.body;

  try {
    let response;
    const status = isSubmitted ? "completed" : "incomplete"; // Determine the status based on isSubmitted

    if (responseId) {
      // Update existing response
      response = await Response.findByIdAndUpdate(
        responseId,
        {
          $set: {
            responses,
            status,
            submittedAt: Date.now(),
          },
        },
        { new: true }
      );

      if (!response) {
        return res.status(404).json({ error: "Response not found." });
      }
    } else {
      response = new Response({
        formId,
        responses,
        status,
        submittedAt: Date.now(),
      });

      await response.save();
    }

    return res.json({
      responseId: response._id,
      formId: response.formId,
    });
  } catch (error) {
    console.error("Error updating/creating response:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

const getAllResponses = async (req, res) => {
  const { formId } = req.params;

  try {
    const responses = await Response.find({ formId }).sort({ submittedAt: -1 });

    if (responses.length === 0) {
      return res
        .status(404)
        .json({ message: "No responses found for this form." });
    }

    return res.status(200).json(responses);
  } catch (error) {
    console.error("Error fetching responses:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = { getFormFlow, updateResponse, getAllResponses };
