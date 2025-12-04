const {
  listTutors,
  addTutor,
  listSessionsByStudent,
  listAllSessions,
  createSession,
  getSessionById,
  updateSessionStatus,
  getStatusCounts,
  addSessionRating,
  getRatingStats
} = require('../models/sessionModel');

// ---------- DASHBOARD / SESIONES ----------

function getDashboard(req, res) {
  const tutors = listTutors();
  const mySessions = listSessionsByStudent(req.session.user.id);

  res.render('dashboard', {
    tutors,
    mySessions
  });
}

function getNewSession(req, res) {
  const tutors = listTutors();
  res.render('newSession', { tutors, error: null });
}

function postNewSession(req, res) {
  const { tutorId, date, time, topic } = req.body;
  const tutors = listTutors();

  try {
    createSession({
      studentId: req.session.user.id,
      tutorId,
      date,
      time,
      topic
    });

    res.redirect('/tutoring/sessions');
  } catch (error) {
    res.status(400).render('newSession', {
      tutors,
      error: error.message
    });
  }
}

function getMySessions(req, res) {
  const mySessions = listSessionsByStudent(req.session.user.id);
  const tutors = listTutors();

  const decoratedSessions = mySessions.map((s) => {
    const tutor = tutors.find((t) => t.id === s.tutorId);
    return {
      ...s,
      tutorName: tutor ? tutor.name : 'Desconocido',
      subject: tutor ? tutor.subject : 'N/A',
      canRate: s.status === 'completed' && s.rating === null
    };
  });

  res.render('sessions', { sessions: decoratedSessions });
}

function getAdminSessions(req, res) {
  if (req.session.user.role !== 'admin') {
    return res.status(403).send('Acceso denegado');
  }

  const tutors = listTutors();
  const allSessions = listAllSessions().map((s) => {
    const tutor = tutors.find((t) => t.id === s.tutorId);
    return {
      ...s,
      tutorName: tutor ? tutor.name : 'Desconocido',
      subject: tutor ? tutor.subject : 'N/A'
    };
  });

  res.render('sessionsAdmin', { sessions: allSessions });
}

// ---------- CANCELAR / COMPLETAR SESIONES ----------

function postCancelSession(req, res) {
  const { id } = req.params;
  const user = req.session.user;

  const session = getSessionById(id);
  if (!session) {
    return res.status(404).send('Sesión no encontrada');
  }

  if (user.role !== 'admin' && session.studentId !== user.id) {
    return res.status(403).send('No está autorizado para cancelar esta tutoría');
  }

  if (session.status !== 'scheduled') {
    return res
      .status(400)
      .send('Solo se pueden cancelar tutorías en estado "programado"');
  }

  try {
    updateSessionStatus(id, 'canceled');
    if (user.role === 'admin') {
      return res.redirect('/tutoring/sessions/admin');
    }
    return res.redirect('/tutoring/sessions');
  } catch (error) {
    return res.status(400).send(error.message);
  }
}

function postCompleteSession(req, res) {
  const { id } = req.params;
  const user = req.session.user;

  if (user.role !== 'admin') {
    return res.status(403).send('Solo el administrador puede completar tutorías');
  }

  const session = getSessionById(id);
  if (!session) {
    return res.status(404).send('Sesión no encontrada');
  }

  if (session.status !== 'scheduled') {
    return res
      .status(400)
      .send('Solo se pueden completar tutorías en estado "programado"');
  }

  try {
    updateSessionStatus(id, 'completed');
    return res.redirect('/tutoring/sessions/admin');
  } catch (error) {
    return res.status(400).send(error.message);
  }
}

// ---------- VALORAR SESIONES (STUDENT) ----------

function getRateSessionPage(req, res) {
  const { id } = req.params;
  const user = req.session.user;

  const session = getSessionById(id);
  if (!session) {
    return res.status(404).send('Sesión no encontrada');
  }

  if (session.studentId !== user.id) {
    return res.status(403).send('No está autorizado para valorar esta tutoría');
  }

  if (session.status !== 'completed') {
    return res
      .status(400)
      .send('Solo se pueden valorar tutorías en estado "completado"');
  }

  if (session.rating !== null) {
    return res.redirect('/tutoring/sessions');
  }

  const tutors = listTutors();
  const tutor = tutors.find((t) => t.id === session.tutorId);

  return res.render('rateSession', {
    session,
    tutorName: tutor ? tutor.name : 'Desconocido',
    error: null
  });
}

function postRateSession(req, res) {
  const { id } = req.params;
  const user = req.session.user;
  const { rating, feedback } = req.body;

  try {
    addSessionRating({
      sessionId: id,
      studentId: user.id,
      rating,
      feedback
    });

    return res.redirect('/tutoring/sessions');
  } catch (error) {
    const session = getSessionById(id);
    if (!session) {
      return res.status(404).send('Sesión no encontrada');
    }

    const tutors = listTutors();
    const tutor = tutors.find((t) => t.id === session.tutorId);

    return res.status(400).render('rateSession', {
      session,
      tutorName: tutor ? tutor.name : 'Desconocido',
      error: error.message
    });
  }
}

// ---------- ESTADÍSTICAS (ADMIN) ----------

function getStatsPage(req, res) {
  const user = req.session.user;
  if (user.role !== 'admin') {
    return res.status(403).send('Acceso denegado');
  }

  const counts = getStatusCounts();
  const allSessions = listAllSessions();
  const totalSessions = allSessions.length;

  const tutors = listTutors();
  const ratingStats = getRatingStats();

  const byTutor = tutors.map((tutor) => {
    const sessionsForTutor = allSessions.filter((s) => s.tutorId === tutor.id);
    const scheduled = sessionsForTutor.filter(
      (s) => s.status === 'scheduled'
    ).length;
    const completed = sessionsForTutor.filter(
      (s) => s.status === 'completed'
    ).length;
    const canceled = sessionsForTutor.filter(
      (s) => s.status === 'canceled'
    ).length;

    const ratingInfo = ratingStats.byTutor[tutor.id] || { sum: 0, count: 0 };
    const averageRating =
      ratingInfo.count > 0 ? ratingInfo.sum / ratingInfo.count : null;

    return {
      tutorId: tutor.id,
      tutorName: tutor.name,
      subject: tutor.subject,
      total: sessionsForTutor.length,
      scheduled,
      completed,
      canceled,
      averageRating,
      ratingCount: ratingInfo.count
    };
  });

  res.render('stats', {
    counts,
    totalSessions,
    byTutor,
    globalRating: ratingStats.global
  });
}

// ---------- ADMINISTRACIÓN DE TUTORES (NUEVO) ----------

function getTutorsAdminPage(req, res) {
  const user = req.session.user;
  if (user.role !== 'admin') {
    return res.status(403).send('Acceso denegado');
  }

  const tutors = listTutors();
  res.render('tutorsAdmin', { tutors, error: null });
}

function postNewTutor(req, res) {
  const user = req.session.user;
  if (user.role !== 'admin') {
    return res.status(403).send('Acceso denegado');
  }

  const { name, subject } = req.body;

  try {
    addTutor({ name, subject });
    return res.redirect('/tutoring/tutors');
  } catch (error) {
    const tutors = listTutors();
    return res.status(400).render('tutorsAdmin', {
      tutors,
      error: error.message
    });
  }
}

// ---------- API JSON para crear tutorías (ya la tenías) ----------

function postNewSessionApi(req, res) {
  const user = req.session.user;
  const { studentId, tutorId, date, time, topic } = req.body || {};

  const effectiveStudentId =
    user.role === 'admin' ? (studentId || user.id) : user.id;

  try {
    const session = createSession({
      studentId: effectiveStudentId,
      tutorId,
      date,
      time,
      topic
    });

    return res.status(201).json({
      success: true,
      session
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
}

// ---------- API JSON para crear tutores (nuevo) ----------

function postNewTutorApi(req, res) {
  const user = req.session.user;
  if (user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado'
    });
  }

  const { name, subject } = req.body || {};

  try {
    const tutor = addTutor({ name, subject });
    return res.status(201).json({
      success: true,
      tutor
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
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
};
