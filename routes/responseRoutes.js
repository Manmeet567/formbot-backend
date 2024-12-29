const express = require("express");
const { getFormFlow } = require("../controllers/responseControllers");
const router = express.Router();

router.get("/:formId/get-flow", getFormFlow);

module.exports = router;
