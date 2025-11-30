const express = require('express');
const router = express.Router();

const {
  getLoginPage,
  postLogin,
  logout
} = require('../controllers/authController');

router.get('/login', getLoginPage);
router.post('/login', postLogin);
router.get('/logout', logout);

module.exports = router;
