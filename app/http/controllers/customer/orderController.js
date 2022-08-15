const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
const Order = require('../../../models/order');
const moment = require('moment')
const mongoose = require('mongoose')
const regexPhone = /^[6-9]\d{9}$/;

function orderController() {
    return{
        store(req, res){
            // Validate Request

            // Getting fields
            const { phone, instructions, address, stripeToken, paymentType } = req.body
            const finalPhone = phone.trim();
            const finalAddress = address.trim();
            if(!finalPhone) {
                return res.status(422).json({message : 'Phone is required!'});
            }
            if(!regexPhone.test(finalPhone)) {
                return res.status(422).json({message : 'Please enter a valid Phone Number!'});
            }
            if(!finalAddress) {
                return res.status(422).json({message : 'Address is required!'});
            }
            if(!req.session.cart.items)
            return;

            const order = new Order({
                customerId: req.user._id,
                items: req.session.cart.items,
                phone: finalPhone,
                instructions,
                address: finalAddress
            })

            order.save().then(result => {

                Order.populate(result, { path: 'customerId' }, (err, placedOrder) => {
                    // req.flash('success', 'Order placed successfully.')

                    // Stripe Payment
                    if(paymentType === 'card'){
                        stripe.charges.create({
                            amount: req.session.cart.totalPrice * 100,
                            source: stripeToken,
                            currency: 'inr',
                            description: `Item order: ${placedOrder._id}`
                        }).then(() => {
                            placedOrder.paymentStatus = true;
                            placedOrder.paymentType = paymentType;
                            placedOrder.save().then((ord) => {
                            // Emit
                            const eventEmitter = req.app.get('eventEmitter') // From server.js
                            eventEmitter.emit('orderPlaced', ord)  //So that it can be emit (accessible) anywhere
                            delete req.session.cart
                            return res.json({message: 'Order placed successfully.'})
                            }).catch((err) => {
                                console.log(err)
                            })

                        }).catch((err) => {
                            console.log(err)
                            delete req.session.cart
                            return res.json({message: 'Payment Failed! Pay using cash at the time of delivery.'})
                        })
                    }else {
                        const eventEmitter = req.app.get('eventEmitter') // From server.js
                        eventEmitter.emit('orderPlaced', placedOrder)  //So that it can be emit (accessible) anywhere
                        delete req.session.cart
                        return res.json({message: 'Order placed successfully.'})
                    }
            })
            }).catch(err => {
                return res.status(500).json({message : 'Something went wrong'})
            })
        },
        async index(req, res) {
            const orders = await Order.find({ customerId: req.user._id },
                null,
                { sort: { 'createdAt': -1 } })
            
            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0')  // The green flash on my orders will be only once after placing order
            res.render('customers/orders', { orders: orders, moment: moment }) // Passing this using EJS on order.ejs
            
        },
        async show(req, res) {
            if(mongoose.Types.ObjectId.isValid(req.params.id)){
                const order = await Order.findById(req.params.id)

            // Authorizeing User
            if(order){
                if(req.user._id.toString() === order.customerId.toString())
                    return res.render('customers/singleOrder', { order });
                    
                return res.redirect('/customer/orders')
            }
        }
            return res.redirect('/customer/orders')
        }
    }
}

module.exports = orderController;