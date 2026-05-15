const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('./auth.controller');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
  ],
  authController.login
);

router.post('/logout', auth, authController.logout);

router.get('/me', auth, authController.getMe);

module.exports = router;
