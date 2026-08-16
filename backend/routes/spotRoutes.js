const express = require('express');
const router = express.Router();
const spotController = require('../controllers/spotController');

router.get('/', spotController.getSpots);
router.get('/:id', spotController.getSpotById);
router.post('/', spotController.createSpot);
router.put('/:id', spotController.updateSpot);
router.delete('/:id', spotController.deleteSpot);

// Ocupación y liberación
router.post('/occupy', spotController.occupySpot);
router.post('/release', spotController.releaseSpot);

module.exports = router;
