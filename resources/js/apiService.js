// Importing AJAX using axios library
import axios from 'axios'; // Importing from Node Modules folder
// Importing Noty for cart pop-up
import Noty from 'noty';

export function placeOrder(formObject) {
    axios.post('/orders', formObject).then((res) => {
        new Noty({
            type: 'success',
            text: res.data.message,
            timeout: 700,
            progressBar: false
    }).show();

    setTimeout(() => {
        window.location.href = '/customer/orders';
    }, 400);

    }).catch((err) => {
        new Noty({
            type: 'error',
            text: err.response.data.message,
            timeout: 700,
            progressBar: false
        }).show();
    })
}