const User = require('../../models/user')
const bcrypt = require('bcrypt')
const emailValid = require('email-validator')
const passport = require('passport')
const lowercase = require('lower-case');

const regexPass = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{5,15}$/;

// Function toTitleCase
const toTitleCase = (phrase) => {
    return phrase
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
};

function authController() {
    const _getRedirectUrl = (req) => {
        return req.user.role === 'admin' ? '/admin/orders' : req.session.cart ? '/cart' : '/customer/orders';  // Checking the role and redirecting accordingly
    }

    return {
        login(req, res) {
            res.render('auth/login')
        },
        postLogin(req, res, next) {  //next: if everything OK then process. Just like a middleware
            if(req.user){
                return res.redirect('/')
            }
            // Validate Request
            const{ email, password } = req.body;

            if(!email || !password) {
                req.flash('error', 'All fields are required!')
                return res.redirect('/login')
            }
            passport.authenticate('local', (err, user, info) => {  //Getting null, user & msg from done method of Passport
                if(err) {
                    req.flash('error', info.message)
                    return next(err)
                }
                if(!user){
                    req.flash('error', info.message)
                    return res.redirect('/login')
                }
                req.logIn(user, (err) => {
                    if(err){
                        req.flash('error', info.message)
                        return next(err)
                    }

                    return res.redirect(_getRedirectUrl(req))
                })
            })(req, res, next)
        },
        register(req, res) {
            res.render('auth/register')
        },
        async postRegister(req, res) {
            if(req.user){
                return res.redirect('/')
            }
            const{ name, phone, email, password } = req.body;
            
            // Validate Request
            if(!name || !phone || !email || !password) {
            req.flash('error', 'All fields are required!')
            req.flash('name', name)
            req.flash('phone', phone)
            req.flash('email', email)
            return res.redirect('/register')
            }

            // Defining Regex
            const regexName = /^([a-zA-Z' ]+)$/;
            const regexPhone = /^[6-9]\d{9}$/;
            

            // Triming
            const finalName = await toTitleCase(name.trim());
            const finalPhone = await phone.trim();
            const Email = await email.trim();
            const finalEmail = await lowercase.lowerCase(Email);

            if(finalName.length < 2) {
                req.flash('error', 'Name must be greater than 2 Characters!')
                    req.flash('name', name)
                    req.flash('phone', phone)
                    req.flash('email', email)
                    return res.redirect('/register')
            }
            else if(!regexName.test(finalName)){
                req.flash('error', 'Please enter a valid full name!')
                    req.flash('name', name)
                    req.flash('phone', phone)
                    req.flash('email', email)
                    return res.redirect('/register')
            }
            else if(finalPhone.length !== 10){
                req.flash('error', 'Phone number should be of 10 digits!')
                    req.flash('name', name)
                    req.flash('phone', phone)
                    req.flash('email', email)
                    return res.redirect('/register')
            }
            else if(!regexPhone.test(finalPhone)){
                req.flash('error', 'Please enter a valid phone number!')
                    req.flash('name', name)
                    req.flash('phone', phone)
                    req.flash('email', email)
                    return res.redirect('/register')
            }
            else if(!emailValid.validate(finalEmail)){
                req.flash('error', 'Please enter a valid email!')
                    req.flash('name', name)
                    req.flash('phone', phone)
                    req.flash('email', email)
                    return res.redirect('/register')
            }
            else if(!regexPass.test(password)){
                req.flash('error', `Password must be between 6 to 15 characters
                                    which contain at least one lowercase letter,
                                    one uppercase letter, one numeric digit,
                                    and one special character!`)
                    req.flash('name', name)
                    req.flash('phone', phone)
                    req.flash('email', email)
                    return res.redirect('/register')
            }

            // Check if Phone exists
            User.exists({ phone: phone }, (err, result) => {
                if(result) {
                    req.flash('error', 'Phone already exists!')
                    req.flash('name', name)
                    req.flash('phone', phone)
                    req.flash('email', email)
                    return res.redirect('/register')
                }
            })
            

            // Check if Email exists
            User.exists({ email: email }, (err, result) => {
                if(result) {
                    req.flash('error', 'Email already exists!')
                    req.flash('name', name)
                    req.flash('phone', phone)
                    req.flash('email', email)
                    return res.redirect('/register')
                }
            })



            // Hash Password
            const hashedPassword = await bcrypt.hash(password, 10)

            // Create User
            const user = new User({
                name: finalName,
                phone: finalPhone,
                email: finalEmail,
                password: hashedPassword
            })

            user.save().then((user) => {
                req.flash('success', `You have been registered successfully.
                                      Please login!`)
                return res.redirect('/login')
            }).catch(err => {
                req.flash('error', 'Something went wrong!')
                return res.redirect('/register')
            })
          
        },
        logout(req, res) {
            req.logout()
            return res.redirect('/login')
        },
        changePassword(req, res) {
            res.render('auth/changepassword')
        },
        async postChangePassword(req, res) {
            if(!req.user){
                return res.redirect('/')
            }
            
            const user = await User.findOne({ email: req.user.email })
            
            const { currPass, password } = req.body;
            if(!currPass || !password) {
                req.flash('error', 'Both fields are required!')
                res.redirect('/changepassword')
            }
            if(!regexPass.test(password)){
                req.flash('error', `New Password must be between 6 to 15 characters
                                    which contain at least one lowercase letter,
                                    one uppercase letter, one numeric digit,
                                    and one special character!`)
                    return res.redirect('/changepassword')
            }

            const newPassword = await bcrypt.hash(password, 10);

            bcrypt.compare(currPass, user.password).then(match => {
                if(match) {
                    user.password = newPassword
                    user.save();
                    req.logout();
                    req.flash('success', `Your Password has been successfully changed!
                                          Please login again with new password.`)
                    return res.redirect('/login')
                }else {
                    req.flash('error', 'Current Password entered was wrong!')
                    res.redirect('/changepassword')
                }                
            }).catch(err => {
                req.flash('error', 'Both fields are required!')
                res.redirect('/changepassword')
            })
        }
    }
}

module.exports = authController;