import { Link } from "react-router-dom";
import {
  FaInfoCircle,
  FaHeadset,
  FaLifeRing,
  FaEnvelope,
  FaPhone,
  FaQuestionCircle,
  FaArrowRight
} from "react-icons/fa";

const tokens = `
  :root {
    --ps-ink:#0f172a; --ps-muted:#64748b; --ps-border:#e6e8ef;
    --ps-primary:#6366f1; --ps-primary-2:#8b5cf6; --ps-accent:#06b6d4; --ps-success:#10b981;
    --ps-gradient: linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#06b6d4 100%);
    --ps-mesh:
      radial-gradient(at 18% 12%, rgba(139,92,246,.35) 0, transparent 45%),
      radial-gradient(at 82% 0%,  rgba(99,102,241,.35) 0, transparent 50%),
      radial-gradient(at 60% 90%, rgba(6,182,212,.25)  0, transparent 50%);
    --ps-shadow-glow: 0 25px 70px -20px rgba(99,102,241,.55);
  }
  body { font-family:'Inter',system-ui,-apple-system,Segoe UI,Roboto,sans-serif; color:var(--ps-ink); }
  .ps-display { font-family:'Space Grotesk','Inter',sans-serif; letter-spacing:-.02em; }
  .ps-btn-primary { background:var(--ps-gradient); color:#fff; border:0; box-shadow:var(--ps-shadow-glow);
    transition:transform .25s ease, box-shadow .25s ease, opacity .25s ease; }
  .ps-btn-primary:hover { transform:translateY(-2px); opacity:.95; color:#fff; }
  .ps-card { background:#fff; border:1px solid var(--ps-border); border-radius:20px;
    transition:transform .3s ease, box-shadow .3s ease, border-color .3s ease; }
  .ps-card:hover { transform:translateY(-6px); box-shadow:var(--ps-shadow-glow); border-color:transparent; }
  .ps-hero { position:relative; overflow:hidden; color:#fff; background:#0b1020; }
  .ps-hero::before { content:""; position:absolute; inset:0; background:var(--ps-mesh); opacity:.9; }
  .ps-hero::after { content:""; position:absolute; inset:0;
    background:linear-gradient(135deg,rgba(99,102,241,.85),rgba(139,92,246,.7) 50%,rgba(6,182,212,.55)); }
  .ps-hero > * { position:relative; z-index:1; }
`;

function Support() {
  const faqs = [
    {
      q: "How do I raise a ticket?",
      a: "Go to Support Center after login and click “Raise Ticket”. Add a subject, issue type, and message."
    },
    {
      q: "Can I attach a booking ID?",
      a: "Yes. In the ticket form, add the booking ID (optional). This helps the admin resolve faster."
    },
    {
      q: "How do I track my ticket status?",
      a: "In Support Center, use “My Tickets” to filter by status and view admin replies."
    },
    {
      q: "What if my refund/payment is pending?",
      a: "Choose “Refund Issue” or “Payment Issue”. Our support team will review and update your ticket."
    }
  ];

  return (
    <div style={{ minHeight: "100vh" }}>
      <style>{tokens}</style>

      {/* Header */}
      <section className="ps-hero py-5">
        <div className="container py-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <h1 className="ps-display fw-bold display-4 mb-3">Support & Help</h1>
              <p className="lead mb-4" style={{ maxWidth: 640, opacity: 0.95 }}>
                Find answers in our FAQ, contact support, or log in to raise a ticket and get admin replies.
              </p>

              <div className="d-flex flex-wrap gap-3">
                <Link to="/login" className="btn ps-btn-primary btn-lg fw-semibold px-4 rounded-3 d-inline-flex align-items-center gap-2">
                  Login to Raise Ticket <FaArrowRight />
                </Link>
                <a href="#faq" className="btn btn-outline-light btn-lg fw-semibold px-4 rounded-3" style={{ border: "1px solid rgba(255,255,255,.35)" }}>
                  View FAQs
                </a>
              </div>

              <div className="d-flex flex-wrap gap-3 mt-4 text-white" style={{ opacity: 0.95 }}>
                <span className="d-flex align-items-center gap-2"><FaHeadset /> Fast replies</span>
                <span className="d-flex align-items-center gap-2"><FaLifeRing /> Booking & refund help</span>
                <span className="d-flex align-items-center gap-2"><FaInfoCircle /> Clear ticket statuses</span>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="ps-card p-4" style={{ borderRadius: 24, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.18)" }}>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="ps-icon" style={{ width: 44, height: 44, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.18)" }}>
                    <FaEnvelope />
                  </div>
                  <div>
                    <div className="fw-bold">Contact Email</div>
                    <div style={{ opacity: 0.92 }}>
                      <a href="mailto:support@smartparking.com" className="text-white text-decoration-none">support@smartparking.com</a>
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3 mb-3">
                  <div style={{ width: 44, height: 44, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.18)" }}>
                    <FaPhone />
                  </div>
                  <div>
                    <div className="fw-bold">Contact Phone</div>
                    <div style={{ opacity: 0.92 }}>
                      <a href="tel:+919999999999" className="text-white text-decoration-none">+91 99999 99999</a>
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <div style={{ width: 44, height: 44, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.18)" }}>
                    <FaLifeRing />
                  </div>
                  <div>
                    <div className="fw-bold">Emergency Helpline</div>
                    <div style={{ opacity: 0.92 }}>
                      <span className="badge rounded-pill px-3 py-2" style={{ background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.22)" }}>
                        +91 88888 88888
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-5" style={{ background: "#fafbff" }}>
        <div className="container py-4">
          <div className="text-center mb-4">
            <span className="badge rounded-pill px-3 py-2 mb-3" style={{ background: "rgba(99,102,241,.1)", color: "#4f46e5" }}>FAQ</span>
            <h2 className="ps-display fw-bold display-5">Frequently Asked Questions</h2>
            <p className="text-muted mb-0">Get quick answers before raising a ticket.</p>
          </div>

          <div className="row g-4">
            {faqs.map((f, idx) => (
              <div key={idx} className="col-md-6 col-lg-3">
                <div className="ps-card p-4 h-100">
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(99,102,241,.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#4f46e5", border: "1px solid rgba(99,102,241,.18)" }}>
                    <FaQuestionCircle />
                  </div>
                  <h5 className="fw-bold mt-3">{f.q}</h5>
                  <p className="text-muted mb-0" style={{ fontSize: ".95rem" }}>{f.a}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="row mt-5">
            <div className="col-12">
              <div className="text-center">
                <p className="text-muted mb-3">Still need help?</p>
                <Link to="/login" className="btn ps-btn-primary btn-lg fw-semibold px-5 rounded-3">
                  Login to Raise Ticket
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-dark text-white py-4">
        <div className="container d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="fw-bold">🚗 ParkSmart</div>
          <div style={{ opacity: 0.8, fontSize: ".9rem" }}>
            © {new Date().getFullYear()} ParkSmart · Support Center
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Support;

