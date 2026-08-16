const express = require('express');
const router = express.Router();
const transController = require('../controllers/transController');

router.get('/', transController.getTransactions);
router.get('/:id', transController.getTransactionById);
router.post('/', transController.createTransaction);
router.put('/:id', transController.updateTransaction);
router.delete('/:id', transController.deleteTransaction);

module.exports = router;
