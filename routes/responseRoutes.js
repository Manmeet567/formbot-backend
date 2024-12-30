const express = require("express");
const {
  getFormFlow,
  updateResponse,
} = require("../controllers/responseControllers");
const router = express.Router();

router.get("/:formId/get-flow", getFormFlow);

router.post("/update-response", updateResponse);

module.exports = router;
