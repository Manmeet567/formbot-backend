const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const {
  createForm,
  getForm,
  submitForm,
} = require("../controllers/formControllers");

router.use(requireAuth);

router.post("/create-form", createForm);

router.get("/:id", getForm);

router.post("/:id/response", submitForm);

module.exports = router;
