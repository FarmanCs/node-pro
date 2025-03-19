// const { default: Stripe } = require("stripe");
import { showAlert } from './alert';
import axios from "axios"
const stripe = Stripe('pk_test_51QprhiDGQBUHrxOt1rbKnA716ENWdAwjEfYcNkjxEJvpUb4nRqZ94JpkwUdZCZdAL3Sj5KhKed18g3SD4Fw5qPe400RDm4CNb2')

export const BookTour = async tourId => {
   try {
      // 1 get checkout session from api
      const session = await axios(
         `http://127.0.0.1:7070/api/v1/bookings/checkout-session/${tourId}`
      )
      console.log(session)
      // 2 create checkout form + proces credit card
      await stripe.redirectToCheckout({
         sessionId: session.data.session.id
      })
   } catch (error) {
      console.log(error);
      showAlert('error', error)
   }
}