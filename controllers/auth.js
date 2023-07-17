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
    User.findById('64abace0271c372330997ca9')
        .then(user => {
            req.session.isloggedIn = true;
            req.session.user = user;
            req.session.save((err) => {
                if(err){
                    console.log(err); 
                }
                res.redirect('/');
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

}

