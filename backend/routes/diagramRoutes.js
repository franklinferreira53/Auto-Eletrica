const express = require('express');
const router = express.Router();
const {
  getDiagrams,
  getDiagram,
  createDiagram,
  updateDiagram,
  deleteDiagram,
  uploadDiagramFile,
  addToFavorites,
  removeFromFavorites,
  getFavorites
} = require('../controllers/diagramController');
const { syncDiagrams } = require('../controllers/syncController');
const {
  recordView,
  recordDownload,
  downloadDiagram
} = require('../controllers/downloadController');
const { protect, authorize, checkSubscription } = require('../middleware/authMiddleware');

// Rotas protegidas por assinatura
router.get('/', protect, checkSubscription, getDiagrams);
router.get('/sync', protect, syncDiagrams);
router.get('/favorites', protect, getFavorites);
router.get('/:id', protect, checkSubscription, getDiagram);
router.get('/:id/download', protect, checkSubscription, downloadDiagram);
router.put('/:id/view', protect, recordView);
router.put('/:id/download', protect, recordDownload);
router.post('/:id/favorite', protect, addToFavorites);
router.delete('/:id/favorite', protect, removeFromFavorites);

// Rotas de administrador
router.post('/', protect, authorize('admin'), createDiagram);
router.put('/:id', protect, authorize('admin'), updateDiagram);
router.delete('/:id', protect, authorize('admin'), deleteDiagram);
router.post('/:id/upload', protect, authorize('admin'), uploadDiagramFile);

module.exports = router;