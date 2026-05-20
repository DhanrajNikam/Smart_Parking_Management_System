import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";

function Payment() {

  const { bookingId } = useParams();

  const navigate = useNavigate();

  const [loadingMethod, setLoadingMethod] =
    useState("");

  const handlePayment = async (method) => {

    try {

      setLoadingMethod(method);

      await API.post("/payments/pay", {
        booking_id: bookingId,
        payment_method: method
      });

      alert("Payment Successful");

      navigate("/confirmation");

    } catch (error) {

      console.log(error);

      alert(
        error.response?.data?.message ||
        "Payment Failed"
      );

    } finally {

      setLoadingMethod("");

    }
  };

  const paymentOptions = [

    {
      key: "upi",
      title: "Pay with UPI",
      icon: "📱",
      className: "success"
    },

    {
      key: "card",
      title: "Pay with Card",
      icon: "💳",
      className: "primary"
    },

    {
      key: "wallet",
      title: "Pay with Wallet",
      icon: "👛",
      className: "warning"
    },

    {
      key: "cash",
      title: "Pay with Cash",
      icon: "💵",
      className: "secondary"
    }

  ];

  return (

    <div>

      <Navbar />

      <div className="container mt-5">

        <div className="row justify-content-center">

          <div className="col-lg-7">

            <div
              className="
                card
                shadow-lg
                border-0
                rounded-4
                p-4
              "
            >

              <div className="text-center mb-4">

                <h2 className="fw-bold">
                  Complete Payment
                </h2>

                <p className="text-muted">
                  Choose your preferred payment method
                </p>

              </div>

              <div className="row g-3">

                {paymentOptions.map((item) => (

                  <div
                    key={item.key}
                    className="col-md-6"
                  >

                    <button
                      className={`
                        btn
                        btn-${item.className}
                        w-100
                        p-4
                        rounded-4
                        shadow-sm
                      `}
                      style={{
                        minHeight: "120px"
                      }}
                      disabled={
                        loadingMethod !== ""
                      }
                      onClick={() =>
                        handlePayment(item.key)
                      }
                    >

                      <div
                        style={{
                          fontSize: "2rem"
                        }}
                      >
                        {item.icon}
                      </div>

                      <div
                        className="
                          fw-bold
                          mt-2
                        "
                      >
                        {item.title}
                      </div>

                      {loadingMethod === item.key && (
                        <div className="mt-2">

                          <span
                            className="
                              spinner-border
                              spinner-border-sm
                            "
                          />

                        </div>
                      )}

                    </button>

                  </div>

                ))}

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

  );
}

export default Payment;