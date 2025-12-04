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
  getStatsPage,
  getTutorsAdminPage,
  postNewTutor,
  postNewSessionApi,
  postNewTutorApi
} = require('../controllers/tutoringController');

// Dashboard y listados
router.get('/dashboard', getDashboard);
router.get('/sessions', getMySessions);
router.get('/sessions/admin', getAdminSessions);

// Crear tutorías (form web)
router.get('/sessions/new', getNewSession);
router.post('/sessions/new', postNewSession);

// Cancelar / completar tutorías
router.post('/sessions/:id/cancel', postCancelSession);
router.post('/sessions/:id/complete', postCompleteSession);

// Valorar tutorías
router.get('/sessions/:id/rate', getRateSessionPage);
router.post('/sessions/:id/rate', postRateSession);

// Estadísticas admin
router.get('/stats', getStatsPage);

// Administración de tutores (solo admin)
router.get('/tutors', getTutorsAdminPage);
router.post('/tutors', postNewTutor);

// APIs JSON
router.post('/api/sessions', postNewSessionApi);
router.post('/api/tutors', postNewTutorApi);

module.exports = router;
