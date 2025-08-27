const express = require('express');
const router = express.Router();
const {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  uploadVehicleImage
} = require('../controllers/vehicleController');
const { protect, authorize, checkSubscription } = require('../middleware/authMiddleware');

// Rota pública
router.get('/', protect, checkSubscription, getVehicles);
router.get('/:id', protect, checkSubscription, getVehicle);

// Rotas de administrador
router.post('/', protect, authorize('admin'), createVehicle);
router.put('/:id', protect, authorize('admin'), updateVehicle);
router.delete('/:id', protect, authorize('admin'), deleteVehicle);
router.post('/:id/upload-image', protect, authorize('admin'), uploadVehicleImage);

module.exports = router;