// Importing Stripe
import { loadStripe } from '@stripe/stripe-js';
import { placeOrder } from './apiService';

export async function initStripe() {
    const stripe = await loadStripe('pk_test_51HkoVnGUcm5o3tSjwvUVvynXaq3WKOgaT0QH4F7tsb1HHCRNkZxJlBccl4Vr0JEpNjSeB07QysB9ZfkUBvtGd0gD00T6LgrqtH');
    const elements = stripe.elements();

    let card = null;
    function mountWidget() {
        let style = {
            base: {
            color: '#32325d',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder': {
                color: '#aab7c4'
            }
            },
            invalid: {
            color: '#fa755a',
            iconColor: '#fa755a'
            }
        };
    
        card = elements.create('card', { style, hidePostalCode: true })
        card.mount('#card-element');
    }

    const paymentType = document.querySelector('#paymentType');
    
    if(!paymentType)
    return;

    paymentType.addEventListener('change',(e) => {
        if(e.target.value === 'card') {
            // Display Widget
            mountWidget();
        }else {
            card.destroy() 
        }
    })

    // Ajax Call
    const paymentForm = document.querySelector('#payment-form');
    if(paymentForm) {
        paymentForm.addEventListener("submit", (e) => {
            e.preventDefault();
            let formData = new FormData(paymentForm);
            let formObject = {};
    
        for(let [key, value] of formData.entries()) {
            formObject[key] = value;
        }

        if(!card){
            placeOrder(formObject);
            return;
        }
        // Verify Card
            stripe.createToken(card).then((result) => {
                formObject.stripeToken = result.token.id;
                placeOrder(formObject);
            }).catch((err) => {
                console.log(err)
            })
            
        })
    }
}