const express = require('express');
const path = require('path');
const session = require('express-session');

const authRoutes = require('./routes/authRoutes');
const tutoringRoutes = require('./routes/tutoringRoutes');
const { ensureAuthenticated } = require('./controllers/authController');

const app = express();

// Configuración de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: 'super-secret-qa-project', // en producción usar variable de entorno
    resave: false,
    saveUninitialized: false
  })
);

// Compartir usuario en todas las vistas
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

// Rutas
app.use('/', authRoutes);
app.use('/tutoring', ensureAuthenticated, tutoringRoutes);

// Home
app.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/tutoring/dashboard');
  }
  res.redirect('/login');
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
  });
}

module.exports = app;
