const express = require("express");
const router = express.Router();

const { generatePairCode } = require("../controllers/pairController");

// POST /api/pair
router.post("/pair", generatePairCode);

module.exports = router;