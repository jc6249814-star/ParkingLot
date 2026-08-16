const express = require('express');
const router = express.Router();
const resController = require('../controllers/resController');

router.get('/', resController.getReservations);
router.get('/:id', resController.getReservationById);
router.post('/', resController.createReservation);
router.put('/:id', resController.updateReservation);
router.delete('/:id', resController.deleteReservation);

// Cancelar vía post (compatibilidad con app.js)
router.post('/cancel', resController.cancelReservationPost);

module.exports = router;
