const express = require('express');
const router = express.Router();

const {
  getDashboard,
  getNewSession,
  postNewSession,
  getMySessions,
  getAdminSessions,
  postCancelSession,
  postCompleteSession,
  getRateSessionPage,
  postRateSession,
  getStatsPage
} = require('../controllers/tutoringController');

// Dashboard y listados
router.get('/dashboard', getDashboard);
router.get('/sessions', getMySessions);
router.get('/sessions/admin', getAdminSessions);

// Crear tutorías
router.get('/sessions/new', getNewSession);
router.post('/sessions/new', postNewSession);

// Cancelar / completar
router.post('/sessions/:id/cancel', postCancelSession);
router.post('/sessions/:id/complete', postCompleteSession);

// NUEVO: valorar sesiones (student)
router.get('/sessions/:id/rate', getRateSessionPage);
router.post('/sessions/:id/rate', postRateSession);

// Estadísticas admin
router.get('/stats', getStatsPage);

module.exports = router;
