exports.getLogin = (req, res, next) => {
    console.log(req.session.isloggedIn);
    let isloggedIn = false; 
    let cookieString = req.get('Cookie'); 
    if(cookieString){
        let cookieArray = req.get('Cookie').split(';'); 
        cookieArray.forEach(cookie => {
            if(cookie.includes('isLoggedIn')){
                isloggedIn = cookie.split('=')[1].trim() === 'true'; 
            }
        });
    }
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        isAuthenticated: isloggedIn, 
    });
}; 

exports.postLogin = (req, res, next) => {
    req.session.isloggedIn = true; 
    res.redirect('/'); 
};