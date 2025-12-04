# TutorQA – Plataforma de tutorías para proyecto de Auditoría y Validación

Este repositorio contiene una aplicación web sencilla llamada **TutorQA**, desarrollada como base para el **Proyecto Integrado de Auditoría y Validación de Sistemas de Información**.

La idea es tener un sistema “realista” pero manejable, donde se pueda aplicar:

- Pruebas estáticas (revisión de código, deuda técnica, mantenibilidad).
- Pruebas dinámicas (unitarias, integración, sistema, rendimiento, seguridad, usabilidad).
- Métricas de calidad basadas en modelos como **ISO/IEC 25010**.

El proyecto está pensado como si fuera un trabajo de curso universitario, no como un sistema de producción.

---

## 1. Tecnologías utilizadas

- **Backend:** Node.js + Express
- **Vistas:** EJS (plantillas del lado del servidor)
- **Estilos:** CSS simple (sin framework)
- **Sesiones:** `express-session` (para manejar login)
- **Identificadores:** `uuid` para IDs de tutorías
- **Tests:** Jest (pruebas unitarias básicas de modelos)
- **Datos:** almacenados en memoria (no hay base de datos real)

> Importante: como todo está en memoria, cada vez que se reinicia el servidor se pierden las tutorías y tutores creados dinámicamente.

---

## 2. Objetivo académico del proyecto

El objetivo principal es **tener una aplicación web completa pero simple** que nos permita:

- Definir **requerimientos funcionales (RF)** claros.
- Diseñar un **plan de pruebas** completo (funcionales y no funcionales).
- Usar **herramientas automatizadas** (SonarQube, ESLint, Postman, JMeter, ZAP, etc.).
- Medir **atributos de calidad** como:
  - Funcionalidad/Adecuación funcional
  - Usabilidad
  - Eficiencia de desempeño
  - Mantenibilidad
  - Seguridad (básica)

Todo esto se documenta en el informe final del curso.

---

## 3. Funcionalidades principales del sistema

A nivel funcional, la aplicación soporta:

### 3.1 Gestión de usuarios (preconfigurados)

Hay dos tipos de usuario:

- **Administrador**
  - email: `admin@tutorqa.com`
  - password: `Admin123*`
- **Estudiante**
  - email: `student@tutorqa.com`
  - password: `Student123*`

Los usuarios están definidos en `src/config/users.js` y **no se pueden registrar usuarios nuevos** desde la interfaz (esto es una simplificación del proyecto).

### 3.2 Gestión de tutores

Solo el **admin** puede:

- Ver la lista de tutores existentes.
- Crear nuevos tutores con:
  - Nombre
  - Materia

Estos tutores se almacenan en memoria y luego pueden ser usados para crear tutorías.

### 3.3 Gestión de tutorías (sesiones)

Para **estudiantes**:

- Ver tutores disponibles.
- Crear nuevas tutorías seleccionando:
  - Tutor
  - Fecha
  - Hora
  - Tema (opcional)
- Ver la lista de sus tutorías.
- Cancelar tutorías que estén en estado **“scheduled”**.
- Valorar tutorías **completadas** (calificación 1–5 + comentario).

Para **admin**:

- Ver todas las tutorías del sistema.
- Marcar tutorías como **completadas**.
- Cancelar tutorías.
- Ver estadísticas generales.

Cada tutoría tiene:

- `studentId`
- `tutorId`
- `date`
- `time`
- `topic`
- `status` (`scheduled`, `completed`, `canceled`)
- Fechas de creación/completado/cancelación
- `rating` y `feedback` (cuando el estudiante la valora)

### 3.4 Estadísticas

En la sección de estadísticas (solo admin) se muestran:

- Cantidad total de tutorías.
- Cantidad por estado (programadas, completadas, canceladas).
- Cantidad de valoraciones registradas.
- Calificación promedio global.
- Calificación promedio por tutor y número de valoraciones por tutor.

---

## 4. Estructura del proyecto

```text
tutorqa-app/
├── package.json
├── src/
│   ├── app.js
│   ├── config/
│   │   └── users.js
│   ├── models/
│   │   ├── userModel.js
│   │   └── sessionModel.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── tutoringController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── tutoringRoutes.js
│   ├── views/
│   │   ├── login.ejs
│   │   ├── dashboard.ejs
│   │   ├── sessions.ejs
│   │   ├── sessionsAdmin.ejs
│   │   ├── newSession.ejs
│   │   ├── rateSession.ejs
│   │   ├── stats.ejs
│   │   └── tutorsAdmin.ejs
│   └── public/
│       └── css/
│           └── styles.css
└── tests/
    └── unit/
        ├── userModel.test.js
        └── sessionModel.test.js
