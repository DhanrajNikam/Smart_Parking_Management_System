import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import { generateReceiptPDF } from "../utils/receiptGenerator";
import "./Confirmation.css";

function Confirmation() {

  const navigate = useNavigate();

  const [latestBooking, setLatestBooking] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrImage, setQrImage] = useState("");


  useEffect(() => {
    console.log("LATEST BOOKING:", latestBooking);
    if (latestBooking?.id) {
      console.log("GENERATING QR FOR:", latestBooking.id);
      generateQr(latestBooking.id);
    }
  }, [latestBooking]);


  useEffect(() => {
    fetchLatestBooking();
  }, []);



  // ================= FETCH BOOKING =================

  const fetchLatestBooking = async () => {

    try {

      const res = await API.get("/bookings/my?status=active");

      if (res.data.length > 0) {

        const booking = res.data[0];

        setLatestBooking(booking);


      } else {

        const allRes = await API.get("/bookings/my");

        if (allRes.data.length > 0) {

          const booking = allRes.data[0];

          setLatestBooking(booking);


        }

      }

    } catch (error) {

      console.log("Fetch booking error:", error);

    }

  };

  // ================= GENERATE QR =================

  const generateQr = async (bookingId) => {

    try {

      setQrImage("");

      const res = await API.post(`/qr/generate/${bookingId}`);

      console.log("QR RESPONSE:", res.data);

      setQrImage(res.data.qr_code);

    } catch (error) {

      console.log("QR generation error:", error);

      // Keep UI deterministic: if generation fails, show "QR not generated"
      setQrImage("");

    }

  };


  // ================= RECEIPT =================

  const receiptId = "parkSmartReceipt";

  const handleDownloadReceipt = async () => {

    if (!latestBooking) return;

    setIsGenerating(true);

    try {

      await generateReceiptPDF({
        elementId: receiptId,
        booking: latestBooking,
        outputFileName:
          `ParkSmart-Receipt-${latestBooking.booking_code || ""}.pdf`
      });

    } catch (e) {

      console.log("Receipt generation error:", e);

      alert("Failed to download receipt.");

    } finally {

      setIsGenerating(false);

    }

  };

  // ================= PRINT =================

  const handlePrint = () => {

    window.print();

  };

  // ================= ROW UI =================

  const renderRow = (icon, label, value) => (

    <div className="sp-row">

      <div className="sp-row-left">

        <div className="sp-row-icon">
          {icon}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column"
          }}
        >

          <div className="sp-row-label">
            {label}
          </div>

          <div className="sp-row-value">
            {value || "-"}
          </div>

        </div>

      </div>

    </div>

  );

  return (

    <div className="sp-confirm-page">

      <Navbar />

      <div className="container mt-5 mb-5">

        <div className="row justify-content-center">

          <div className="col-lg-8">

            <div className="sp-confirm-card p-4 p-md-5 text-center">

              {/* SUCCESS ICON */}

              <div className="sp-icon-anim">

                <div className="sp-success-badge">
                  ✓
                </div>

              </div>

              {/* TITLE */}

              <h2 className="text-success sp-confirm-title mt-3 mb-2">
                🎉 Booking Confirmed
              </h2>

              <p className="text-muted mb-4">
                Your parking slot has been booked successfully.
              </p>

              {/* BOOKING DETAILS */}

              {latestBooking ? (

                <div
                  id={receiptId}
                  className="sp-print-area"
                >

                  <div className="sp-summary-card p-3 p-md-4 mb-4">

                    {/* BOOKING HEADER */}

                    <div
                      className="sp-row"
                      style={{ marginBottom: 10 }}
                    >

                      <div className="sp-row-left">

                        <div className="sp-row-icon">
                          🧾
                        </div>

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column"
                          }}
                        >

                          <div className="sp-row-label">
                            Booking ID
                          </div>

                          <div className="sp-row-value">
                            {latestBooking.booking_code}
                          </div>

                        </div>

                      </div>

                      <div>

                        <span className="badge bg-success">
                          {latestBooking.status}
                        </span>

                      </div>

                    </div>

                    {/* ROWS */}

                    <div className="row g-2">

                      <div className="col-12 col-md-6">
                        {renderRow(
                          "📍",
                          "Parking Location",
                          latestBooking.parking_location
                        )}
                      </div>

                      <div className="col-12 col-md-6">
                        {renderRow(
                          "🅿️",
                          "Slot Number",
                          latestBooking.slot_number
                        )}
                      </div>

                      <div className="col-12 col-md-6">
                        {renderRow(
                          "🚗",
                          "Vehicle Number",
                          latestBooking.vehicle_number
                        )}
                      </div>

                      <div className="col-12 col-md-6">
                        {renderRow(
                          "🧰",
                          "Vehicle Type",
                          latestBooking.vehicle_type
                        )}
                      </div>

                      <div className="col-12 col-md-6">
                        {renderRow(
                          "📅",
                          "Booking Date",
                          latestBooking.booking_date
                        )}
                      </div>

                      <div className="col-12 col-md-6">
                        {renderRow(
                          "⏰",
                          "Start Time",
                          latestBooking.start_time
                        )}
                      </div>

                      <div className="col-12 col-md-6">
                        {renderRow(
                          "⏳",
                          "Duration",
                          `${latestBooking.duration} hour(s)`
                        )}
                      </div>

                      <div className="col-12 col-md-6">
                        {renderRow(
                          "💳",
                          "Payment Method",
                          latestBooking.payment_method || "-"
                        )}
                      </div>

                      <div className="col-12 col-md-6">
                        {renderRow(
                          "₹",
                          "Total Paid",
                          `₹${latestBooking.total_price}`
                        )}
                      </div>

                      {/* QR SECTION */}

                      <div className="col-12">

                        <div
                          style={{
                            marginTop: 18,
                            textAlign: "center"
                          }}
                        >

                          <div
                            style={{
                              fontWeight: 900,
                              marginBottom: 12,
                              fontSize: 18
                            }}
                          >
                            📷 Entry / Exit QR
                          </div>

                          {qrImage ? (

                            <img
                              src={qrImage}
                              alt="Parking QR"
                              style={{
                                width: 220,
                                height: 220,
                                objectFit: "contain",
                                borderRadius: 16,
                                border: "1px solid #ddd",
                                padding: 10,
                                background: "#fff"
                              }}
                            />

                          ) : (

                            <div
                              className="text-muted"
                              style={{
                                padding: 30
                              }}
                            >
                              QR not generated
                            </div>

                          )}

                          <div
                            className="text-muted"
                            style={{
                              fontSize: 12,
                              marginTop: 8
                            }}
                          >
                            Scan to Enter / Exit
                          </div>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              ) : (

                <p className="text-muted">
                  Loading booking details...
                </p>

              )}

              {/* ACTION BUTTONS */}

              <div className="sp-actions sp-no-print">

                <button
                  className="btn btn-success"
                  onClick={handleDownloadReceipt}
                  disabled={!latestBooking || isGenerating}
                >
                  📄 {isGenerating
                    ? "Generating..."
                    : "Download Receipt"}
                </button>

                <button
                  className="btn btn-outline-primary"
                  onClick={handlePrint}
                  disabled={!latestBooking}
                >
                  🖨 Print Ticket
                </button>

                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/mybookings")}
                >
                  📂 My Bookings
                </button>

                <button
                  className="btn btn-outline-secondary"
                  onClick={() => navigate("/dashboard")}
                >
                  🏠 Dashboard
                </button>

              </div>

              <div
                className="sp-no-print mt-3 text-muted"
                style={{ fontSize: 12 }}
              >
                Thank you for using ParkSmart
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}

export default Confirmation;