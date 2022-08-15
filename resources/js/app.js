// Importing AJAX using axios library
import axios from 'axios'; // Importing from Node Modules folder
// Importing Noty for cart pop-up
import Noty from 'noty';
// Importing admin.js
import { initAdmin } from './admin';
import moment from 'moment';
import { initAdminMenu } from './admin-menu';
import { initStripe } from './stripe';

let addToCart = document.querySelectorAll('.add-to-cart');
let cartCounter = document.querySelector('#cartCount');

function updateCart(item) {
    axios.post('/update-cart', item).then(res => {
        cartCounter.innerText = res.data.totalQty;
        new Noty({
            type: 'success',
            text: 'Item added to Cart',
            timeout: 700,
            progressBar: false
        }).show();
    }).catch(err => {
        new Noty({
            type: 'error',
            text: 'Something went wrong',
            timeout: 700,
            progressBar: false
        }).show();
    })
}

addToCart.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        let item = JSON.parse(btn.dataset.item);
        updateCart(item)
    })
})

const alertMsg = document.querySelector('#success-alert')
if(alertMsg){
    setTimeout(() => {
        alertMsg.remove()
    }, 2000)
}

initAdminMenu();

// Change Order status
let statuses = document.querySelectorAll('.status-line');
let hiddenInput = document.querySelector('#hiddenInput');
let order = hiddenInput ? hiddenInput.value : null;
order = JSON.parse(order);
let time = document.createElement('small')

function updateStatus(order) {                          // Changing Colors and all...
    statuses.forEach((status) => {
        status.classList.remove('step-completed')
        status.classList.remove('current')
    })
    let stepCompleted = true;
    statuses.forEach((status) => {
        let dataProp = status.dataset.status
        if(stepCompleted){
            status.classList.add('step-completed')
        }
        if(dataProp === order.status) {
            stepCompleted = false;
            time.innerText = moment(order.updatedAt).format('hh:mm A');
            status.appendChild(time)
            if(status.nextElementSibling) {
                status.nextElementSibling.classList.add('current')
            }
        }
    })
}

updateStatus(order)

const windowLocation = window.location.pathname
if(windowLocation.includes('cart'))
initStripe()

// Socket
let socket = io()

// Join
if(order){
    socket.emit('join', `order_${order._id}`)
}

// Admin
let adminAreaPath = window.location.pathname;
if(adminAreaPath.includes('admin')){
    initAdmin(socket);
    socket.emit('join', 'adminRoom')
}

socket.on('orderUpdated', (data) => {               // data recieving from server.js
    const updatedOrder = { ...order }
    updatedOrder.updatedAt = moment().format()
    updatedOrder.status = data.status
    updateStatus(updatedOrder)
    new Noty({
        type: 'success',
        text: 'Order status updated',
        timeout: 700,
        progressBar: false
    }).show();
})