const express = require('express');
const router = express.Router();

const {
	getContracts,
} = require('../controllers/contracts.controller');

router.get('/', getContracts);

module.exports = router;