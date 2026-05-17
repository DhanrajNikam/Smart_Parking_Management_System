const express = require("express");
const router = express.Router();

const { extractVehicleNumber } = require("../controllers/anprController");

// multipart/form-data upload
router.post("/extract", extractVehicleNumber);

module.exports = router;

