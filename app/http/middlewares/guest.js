function guest(req,res,next) {
    if(!req.isAuthenticated()){  // isAuthenticated (passport) to know if user is logedin
        return next();
    }

    return res.redirect('/');
}

module.exports = guest;