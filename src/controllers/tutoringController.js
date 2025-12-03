const {
  listTutors,
  listSessionsByStudent,
  listAllSessions,
  createSession,
  getSessionById,
  updateSessionStatus,
  getStatusCounts,
  addSessionRating,
  getRatingStats
} = require('../models/sessionModel');

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

// ---------- Cancelar tutoría (student/admin) ----------

function postCancelSession(req, res) {
  const { id } = req.params;
  const user = req.session.user;

  const session = getSessionById(id);
  if (!session) {
    return res.status(404).send('Sesión no encontrada');
  }

  // Solo dueño o admin pueden cancelar
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

// ---------- Marcar tutoría como completada (solo admin) ----------

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

// ---------- NUEVO: Página para valorar tutoría (student) ----------

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

// ---------- Página de estadísticas (solo admin) con ratings ----------

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
  getStatsPage
};
