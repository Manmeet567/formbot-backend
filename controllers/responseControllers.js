const Form = require('../models/formModel'); 

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
    res.status(500).json({ error: "An error occurred while fetching the form" });
  }
};

module.exports = { getFormFlow };
