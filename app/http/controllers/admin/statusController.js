const Order = require('../../../models/order')

function statusController() {
    return {
        update(req, res) {
            Order.updateOne({_id: req.body.orderId}, {status:req.body.status}, (err, data) => {
                if(err){
                return res.redirect('/admin/orders') //Err dalna hai
                }

                // Emit Event
                const eventEmitter = req.app.get('eventEmitter') // From server.js
                eventEmitter.emit('orderUpdated', { id: req.body.orderId, status: req.body.status })  //So that it can be emit (accessible) anywhere
                return res.redirect('/admin/orders')
            })
        }
    }
}

module.exports = statusController;