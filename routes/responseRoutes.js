const express = require("express");
const {
  getFormFlow,
  updateResponse,
  getAllResponses,
} = require("../controllers/responseControllers");
const router = express.Router();

router.get("/:formId/get-flow", getFormFlow);

router.post("/update-response", updateResponse);

router.get("/:formId/get-responses", getAllResponses);

module.exports = router;
