const express = require("express");
const router = express.Router();
const passport = require('passport');
const wrapAsync = require('../utilities/wrapAsync');
const User = require('../models/user');
const users =require('../controllers/users');
const {storeReturnTo} = require('../middleware');

router.get('/register', users.RenderRegisterForm);

router.post('/register', wrapAsync(users.registerUser));

router.get('/login', users.renderLogin);

router.post('/login', storeReturnTo, passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), users.login);

router.get("/logout", users.logout); 

module.exports = router;