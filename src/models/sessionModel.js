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

function hasConflict(studentId, tutorId, date, time) {
  return sessions.some(
    (s) =>
      s.studentId === studentId &&
      s.tutorId === Number(tutorId) &&
      s.date === date &&
      s.time === time
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

  const newSession = {
    id: uuidv4(),
    studentId,
    tutorId: Number(tutorId),
    date,
    time,
    topic: topic || ''
  };

  sessions.push(newSession);
  return newSession;
}

module.exports = {
  listTutors,
  listSessionsByStudent,
  listAllSessions,
  createSession,
  hasConflict
};
