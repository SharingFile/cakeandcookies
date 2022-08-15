
// Routes

const notFoundController = require('../app/http/controllers/notFoundController')
const homeController = require('../app/http/controllers/homeController');
const authController = require('../app/http/controllers/authController');
const cartController = require('../app/http/controllers/customer/cartController');
const orderController = require('../app/http/controllers/customer/orderController');
const adminOrderController = require('../app/http/controllers/admin/orderController');
const adminUpdateMenuController = require('../app/http/controllers/admin/updateMenuController');
const statusController = require('../app/http/controllers/admin/statusController');

// Middlewares
const guest = require('../app/http/middlewares/guest');
const auth = require('../app/http/middlewares/auth');
const admin = require('../app/http/middlewares/admin');
const adminNa = require('../app/http/middlewares/adminna');
const changePass = require('../app/http/middlewares/changePass');

function initRoutes(app) {
       
    app.get('/', adminNa, homeController().index)
    app.get('/login', guest, authController().login)
    app.post('/login', authController().postLogin)
    app.get('/register', guest, authController().register)
    app.post('/register', authController().postRegister)
    app.get('/changepassword', changePass, authController().changePassword)
    app.post('/changepassword', changePass, authController().postChangePassword)
    app.post('/logout', authController().logout)
    
    app.get('/cart', adminNa, cartController().index)
    app.post('/update-cart', adminNa, cartController().update)

    // Customer Routes
    app.post('/orders', auth, orderController().store)
    app.get('/customer/orders', auth, orderController().index)
    app.get('/customer/orders/:id', auth, orderController().show)
    
    // Admin routes
    app.get('/admin/orders', admin, adminOrderController().index)
    app.get('/admin/update_menu', admin, adminUpdateMenuController().index)
    app.post('/admin/orders/status', admin, statusController().update)
    app.post('/admin/update', admin, adminUpdateMenuController().updateMenu)
    app.post('/admin/lock', admin, adminUpdateMenuController().lockMenu)
    app.post('/admin/unlock', admin, adminUpdateMenuController().unlockMenu)
    app.post('/admin/delete', admin, adminUpdateMenuController().deleteMenu)
    app.post('/admin/add', admin, adminUpdateMenuController().addMenu)
    
    // Custom 404 Page
    app.get("*", notFoundController().index)
}

module.exports = initRoutes;