const { v4: uuidv4 } = require('uuid');

// Tutores "semilla" para pruebas
const tutors = [
  { id: 1, name: 'Ana Matemáticas', subject: 'Matemática' },
  { id: 2, name: 'Carlos Programación', subject: 'Programación' },
  { id: 3, name: 'Lucía Bases de Datos', subject: 'Bases de Datos' }
];

// Aquí se almacenan las sesiones en memoria
const sessions = [];

function listTutors() {
  return [...tutors];
}

function listSessionsByStudent(studentId) {
  return sessions.filter((s) => s.studentId === studentId);
}

function listAllSessions() {
  return [...sessions];
}

// Conflicto solo con sesiones programadas (scheduled)
function hasConflict(studentId, tutorId, date, time) {
  return sessions.some(
    (s) =>
      s.studentId === studentId &&
      s.tutorId === Number(tutorId) &&
      s.date === date &&
      s.time === time &&
      s.status === 'scheduled'
  );
}

function createSession({ studentId, tutorId, date, time, topic }) {
  if (!studentId || !tutorId || !date || !time) {
    throw new Error('Datos de sesión incompletos');
  }

  if (hasConflict(studentId, tutorId, date, time)) {
    throw new Error(
      'Conflicto de horario: ya existe una tutoría en ese horario'
    );
  }

  const now = new Date().toISOString();

  const newSession = {
    id: uuidv4(),
    studentId,
    tutorId: Number(tutorId),
    date,
    time,
    topic: topic || '',
    status: 'scheduled',
    createdAt: now,
    completedAt: null,
    canceledAt: null,
    rating: null,          // NUEVO
    feedback: ''           // NUEVO
  };

  sessions.push(newSession);
  return newSession;
}

function getSessionById(id) {
  return sessions.find((s) => s.id === id) || null;
}

function updateSessionStatus(id, newStatus) {
  const session = getSessionById(id);
  if (!session) {
    throw new Error('Sesión no encontrada');
  }

  const allowed = ['scheduled', 'completed', 'canceled'];
  if (!allowed.includes(newStatus)) {
    throw new Error('Estado no válido');
  }

  session.status = newStatus;

  const now = new Date().toISOString();
  if (newStatus === 'completed') {
    session.completedAt = now;
  }
  if (newStatus === 'canceled') {
    session.canceledAt = now;
  }

  return session;
}

function getStatusCounts() {
  const counts = {
    scheduled: 0,
    completed: 0,
    canceled: 0
  };

  sessions.forEach((s) => {
    if (counts[s.status] !== undefined) {
      counts[s.status] += 1;
    }
  });

  return counts;
}

// ---------- NUEVO: valoración de sesiones ----------

function addSessionRating({ sessionId, studentId, rating, feedback }) {
  const session = getSessionById(sessionId);
  if (!session) {
    throw new Error('Sesión no encontrada');
  }

  if (session.studentId !== studentId) {
    throw new Error('No está autorizado para valorar esta tutoría');
  }

  if (session.status !== 'completed') {
    throw new Error('Solo se pueden valorar tutorías completadas');
  }

  if (session.rating !== null) {
    throw new Error('La tutoría ya fue valorada');
  }

  const numericRating = Number(rating);
  if (
    !Number.isFinite(numericRating) ||
    numericRating < 1 ||
    numericRating > 5
  ) {
    throw new Error('La calificación debe estar entre 1 y 5');
  }

  session.rating = numericRating;
  session.feedback = (feedback || '').trim();

  return session;
}

function getRatingStats() {
  const ratedSessions = sessions.filter(
    (s) => typeof s.rating === 'number' && !Number.isNaN(s.rating)
  );

  const result = {
    global: {
      count: 0,
      average: null
    },
    byTutor: {} // tutorId -> { sum, count }
  };

  if (ratedSessions.length === 0) {
    return result;
  }

  let globalSum = 0;

  ratedSessions.forEach((s) => {
    globalSum += s.rating;

    if (!result.byTutor[s.tutorId]) {
      result.byTutor[s.tutorId] = { sum: 0, count: 0 };
    }

    result.byTutor[s.tutorId].sum += s.rating;
    result.byTutor[s.tutorId].count += 1;
  });

  result.global.count = ratedSessions.length;
  result.global.average = globalSum / ratedSessions.length;

  return result;
}

module.exports = {
  listTutors,
  listSessionsByStudent,
  listAllSessions,
  createSession,
  hasConflict,
  getSessionById,
  updateSessionStatus,
  getStatusCounts,
  addSessionRating,   // NUEVO
  getRatingStats      // NUEVO
};
