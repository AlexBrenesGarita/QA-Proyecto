const {
  listTutors,
  listSessionsByStudent,
  listAllSessions,
  createSession
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
      subject: tutor ? tutor.subject : 'N/A'
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

module.exports = {
  getDashboard,
  getNewSession,
  postNewSession,
  getMySessions,
  getAdminSessions
};
