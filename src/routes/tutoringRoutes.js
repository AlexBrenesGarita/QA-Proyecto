const express = require('express');
const router = express.Router();

const {
  getDashboard,
  getNewSession,
  postNewSession,
  getMySessions,
  getAdminSessions
} = require('../controllers/tutoringController');

router.get('/dashboard', getDashboard);
router.get('/sessions', getMySessions);
router.get('/sessions/new', getNewSession);
router.post('/sessions/new', postNewSession);
router.get('/sessions/admin', getAdminSessions); // Solo admin

module.exports = router;
