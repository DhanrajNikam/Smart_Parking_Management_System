// import { useParams, useNavigate } from "react-router-dom";
// import API from "../services/api";

// function Payment() {

//   const { bookingId } = useParams();
//   const navigate = useNavigate();

//   const makePayment = async (method) => {

//     try {

//       await API.post("/payments/pay", {
//         booking_id: bookingId,
//         payment_method: method
//       });

//       alert("Payment Successful");

//       navigate("/mybookings");

//     } catch (error) {

//       alert("Payment failed");

//     }

//   };

//   return (

//     <div className="container mt-4">

//       <h2>Complete Payment</h2>

//       <button
//         className="btn btn-success m-2"
//         onClick={() => makePayment("upi")}
//       >
//         Pay with UPI
//       </button>

//       <button
//         className="btn btn-primary m-2"
//         onClick={() => makePayment("card")}
//       >
//         Pay with Card
//       </button>

//       <button
//         className="btn btn-secondary m-2"
//         onClick={() => makePayment("cash")}
//       >
//         Pay with Cash
//       </button>

//     </div>

//   );

// }

// export default Payment;


import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

function Payment() {

  const { bookingId } = useParams();
  const navigate = useNavigate();

  const handlePayment = async (method) => {

    try {

      await API.post("/payments/pay", {
        booking_id: bookingId,
        payment_method: method
      });

      alert("Payment Successful");

      navigate("/confirmation");

    } catch (error) {

      console.log(error);

      alert(error.response?.data?.message || "Payment Failed");

    }

  };

  return (

    <div className="container mt-5 text-center">

      <h2>Complete Payment</h2>

      <div className="mt-4">

        <button
          className="btn btn-success m-2"
          onClick={() => handlePayment("upi")}
        >
          Pay with UPI
        </button>

        <button
          className="btn btn-primary m-2"
          onClick={() => handlePayment("card")}
        >
          Pay with Card
        </button>

        <button
          className="btn btn-secondary m-2"
          onClick={() => handlePayment("cash")}
        >
          Pay with Cash
        </button>

      </div>

    </div>

  );

}

export default Payment;