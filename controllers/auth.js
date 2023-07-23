const dotenv = require('dotenv').config({path: '../.env'}); 
const crypto = require('crypto'); 
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer'); 
const User = require('../models/user');
const user = require('../models/user');

var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.mailtrap_user,
      pass: process.env.mailtrap_password,
    }
  });

exports.getLogin = (req, res, next) => {
    let message = req.flash('error');
    if(message.length > 0){
        message = message[0]; 
    }else {
        message = null; 
    }
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: message,  
    });
};

exports.getSignup = (req, res, next) => {
    let message = req.flash('error');
    if(message.length > 0){
        message = message[0]; 
    }else {
        message = null; 
    }
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup', 
        errorMessage: message, 
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                req.flash('error', 'Invalid email or password.');
                req.session.save(err => {
                    console.log(err);
                    return res.redirect('/login'); 
                })
            }
            bcrypt
                .compare(password, user.password)
                .then(isMatched => {
                    if(isMatched){
                        req.session.isloggedIn = true; 
                        req.session.user = user; 
                        return req.session.save(err => {
                            console.log(err); 
                            res.redirect("/");
                        })
                    }
                    req.flash('error', 'Invalid email or password.');
                    return res.redirect('/login');
                })
                .catch(err => {
                    console.log(err);
                    res.redirect('/login');
                });
        })
        .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
    const name = req.body.username; 
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    User.findOne({ email: email })
        .then(userDoc => {
            if (userDoc) {
                req.flash('error', "User with this email already exist"); 
                return res.redirect('/signup');
            }
            return bcrypt
                .hash(password, 12)
                .then(hashedPassword => {
                    const user = new User({
                        name: name, 
                        email: email,
                        password: hashedPassword,
                        cart: { items: [] }
                    });
                    return user.save();
                })
                .then(() => {
                    res.redirect('/login');
                    var mailOptions = {
                        from: '"Yax Prajapati" <yaxprjpt@gmail.com>',
                        to: email,
                        subject: 'Welcome to Shopify',
                        text: 'Signup successfull. Welcome to shopify',
                    };
                    return transport.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            return console.log(error);
                        }
                        console.log('Message sent: %s', info.messageId);
                    });
                });
        })
        .catch(err => {
            console.log(err);
        });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    });
};

exports.getResetPass = (req, res, next) => {
    let message = req.flash('error'); 
    if(message.length > 0){
        message = message[0];
    }else {
        message = null; 
    }
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password', 
        errorMessage: message, 
    });
}; 

exports.postResetPass = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if(err) {
            console.log(err);
            return res.redirect('/reset'); 
        }
        const token = buffer.toString('hex'); 
        User.findOne({email: req.body.email})
        .then(user => {
            if(!user){
                req.flash('error', "No account associated with thit email"); 
                return res.redirect('/reset'); 
            }
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000; 
            return user.save(); 
        })
        .then(result => {
            res.redirect('/');
            var mailOptions = {
                from: '"Yax Prajapati" <yaxprjpt@gmail.com>',
                to: req.body.email,
                subject: 'Password reset at shopify',
                text: 'A request is generated to reset password.',
                html: `
                    <p> Click this link to set a new pasword: <a href="http://localhost:3000/reset/${token}">Reset Password</a><p>
                `
            };
            return transport.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message sent: %s', info.messageId);
            });
        })
        .catch(err => {
            console.log(err);
        })
    })   
}; 

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            let message = req.flash('error');
            if (message.length > 0) {
                message = message[0];
            } else {
                message = null;
            }
            res.render('auth/new-password', {
                path: '/new-password',
                pageTitle: 'New Password',
                errorMessage: message,
                userId: user._id.toString(),
                passwordToken: token, 
            });
        })
        .catch(err => {
            console.log(err);
        })
}; 

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const token = req.body.passwordToken;
    let resetUser;
    User.findOne({ _id: userId, resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then((user) => {
            resetUser = user;
            return bcrypt.hash(newPassword, 12);
        })
        .then(hashedPassword => {
            resetUser.password = hashedPassword;
            resetUser.resetToken = null;
            resetUser.resetTokenExpiration = null;
            return resetUser.save();
        })
        .then(result => {
            return res.redirect('/login');
        })
        .catch(err => {
            console.log(err);
        })
}