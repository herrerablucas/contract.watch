const express = require('express');
const router = express.Router();

const {
	getScans,
} = require('../controllers/scans.controller');

router.get('/', getScans);

module.exports = router;