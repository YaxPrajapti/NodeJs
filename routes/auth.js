const express = require('express');
const { check, body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/auth');

router.get('/login', authController.getLogin);
router.post('/login', [
    body('email')
    .isEmail()
    .withMessage("Enter a valid message")
    .normalizeEmail(), 
    body('password')
    .isLength({min: 5})
    .trim()
], authController.postLogin);

router.post('/logout', authController.postLogout);

router.get('/signup', authController.getSignup);
router.post('/signup',
    [check('email')
        .isEmail()
        .withMessage("Please enter valid email")
        .normalizeEmail(),
    body('password', "Please use only alphanumeric keys and password length must be atleast 5")
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim(), 
    body('confirmPassword').trim().custom((value, {req}) => {
        if(value !== req.body.password){
            throw new Error('password must match in password and confirm password'); 
        }
        return true;  
    })
    ], authController.postSignup);

router.get('/reset', authController.getResetPass);
router.post('/reset', authController.postResetPass);

router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router; 
