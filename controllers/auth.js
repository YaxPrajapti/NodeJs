const bcrypt = require('bcryptjs');

const User = require('../models/user');

exports.getLogin = (req, res, next) => {
    const isloggedIn = req.session.isloggedIn;
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        isAuthenticated: req.session.isloggedIn,
    });
};

exports.postLogin = (req, res, next) => {
    const {email, password} = req.body; 
    User.findOne({email: email})
        .then(user => {
            if(!user){
                return res.redirect('/login'); 
            }
            bcrypt.compare(password, user.password) //bcrypt.comapare() returns the boolean value if the password matches or not? 
            .then(isMatched => {
                if(isMatched){
                    req.session.isloggedIn = true; 
                    req.session.user = user; 
                    return req.session.save(err => {
                        console.log(err); 
                        res.redirect("/");
                    })
                }
                res.redirect('/'); 
            })
            .catch(err => {
                console.log(err);
                res.redirect("/")
            })
        })
        .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(req.session);
        res.redirect('/');
    });
};

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        pageTitle: 'Sign Up',
        path: '/signup',
        isAuthenticated: false,
    });
};

exports.postSignup = (req, res, next) => {
    const { email, password, username } = req.body;
    User.findOne({ email: email })
        .then(userDoc => {
            if (userDoc) {
                return res.redirect('/signup');
            }
            return bcrypt.hash(password, 12)
                .then((hashedPassword) => {
                    const user = new User({
                        name: username,
                        email: email,
                        password: hashedPassword,
                        cart: { items: [] },
                    })
                    return user.save();
                })
        })
        .then(user => {
            console.log(user);
            return res.redirect('/login');
        })
        .catch(err => {
            console.log(err);
        })
}

