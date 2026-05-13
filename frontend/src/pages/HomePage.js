// import { Link } from "react-router-dom";
// import { FaMapMarkerAlt, FaCalendarCheck, FaCreditCard, FaBell, FaCar, FaSearch, FaParking } from "react-icons/fa";

// function HomePage() {
//   return (
//     <div>
//       {/* Navbar */}
//       <nav className="navbar navbar-expand-lg navbar-dark" style={{ background: "#0d6efd" }}>
//         <div className="container">
//           <Link className="navbar-brand fw-bold" to="/">
//             🚗 ParkSmart
//           </Link>
//           <div className="d-flex gap-2">
//             <Link className="btn btn-outline-light btn-sm" to="/login">
//               Login
//             </Link>
//             <Link className="btn btn-light btn-sm fw-bold" to="/login">
//               Get Started
//             </Link>
//           </div>
//         </div>
//       </nav>

//       {/* Hero Section */}
//       <section
//         style={{
//           minHeight: "90vh",
//           background: "linear-gradient(135deg, #0d6efd, #3b82f6, #93c5fd)",
//           display: "flex",
//           alignItems: "center",
//           color: "white",
//           padding: "60px 20px"
//         }}
//       >
//         <div className="container text-center">
//           <h1 className="display-3 fw-bold mb-4">
//             Smart Parking, Simplified.
//           </h1>
//           <p className="lead mb-5" style={{ maxWidth: "700px", margin: "0 auto" }}>
//             Find, book, and manage parking spots in real-time. No more circling the block — ParkSmart gets you parked faster.
//           </p>
//           <div className="d-flex justify-content-center gap-3 flex-wrap">
//             <Link
//               to="/login"
//               className="btn btn-light btn-lg fw-bold px-5"
//               style={{ borderRadius: "14px" }}
//             >
//               Get Started
//             </Link>
//             <Link
//               to="/login"
//               className="btn btn-outline-light btn-lg fw-bold px-5"
//               style={{ borderRadius: "14px" }}
//             >
//               Explore Map
//             </Link>
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section className="py-5 bg-light">
//         <div className="container">
//           <h2 className="text-center fw-bold mb-5">Why Choose ParkSmart?</h2>
//           <div className="row g-4">
//             <div className="col-md-3 col-sm-6">
//               <div className="card h-100 border-0 shadow-sm text-center p-4" style={{ borderRadius: "18px" }}>
//                 <div className="mb-3" style={{ fontSize: "2.5rem", color: "#0d6efd" }}>
//                   <FaSearch />
//                 </div>
//                 <h5 className="fw-bold">Real-Time Search</h5>
//                 <p className="text-muted mb-0">Find available parking spots near you instantly with live updates.</p>
//               </div>
//             </div>
//             <div className="col-md-3 col-sm-6">
//               <div className="card h-100 border-0 shadow-sm text-center p-4" style={{ borderRadius: "18px" }}>
//                 <div className="mb-3" style={{ fontSize: "2.5rem", color: "#0d6efd" }}>
//                   <FaCalendarCheck />
//                 </div>
//                 <h5 className="fw-bold">Easy Booking</h5>
//                 <p className="text-muted mb-0">Reserve your spot in seconds and guarantee your parking space.</p>
//               </div>
//             </div>
//             <div className="col-md-3 col-sm-6">
//               <div className="card h-100 border-0 shadow-sm text-center p-4" style={{ borderRadius: "18px" }}>
//                 <div className="mb-3" style={{ fontSize: "2.5rem", color: "#0d6efd" }}>
//                   <FaCreditCard />
//                 </div>
//                 <h5 className="fw-bold">Secure Payments</h5>
//                 <p className="text-muted mb-0">Pay safely online with multiple payment options and instant confirmation.</p>
//               </div>
//             </div>
//             <div className="col-md-3 col-sm-6">
//               <div className="card h-100 border-0 shadow-sm text-center p-4" style={{ borderRadius: "18px" }}>
//                 <div className="mb-3" style={{ fontSize: "2.5rem", color: "#0d6efd" }}>
//                   <FaBell />
//                 </div>
//                 <h5 className="fw-bold">Instant Alerts</h5>
//                 <p className="text-muted mb-0">Get notified about bookings, reminders, and parking updates.</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* How It Works Section */}
//       <section className="py-5">
//         <div className="container">
//           <h2 className="text-center fw-bold mb-5">How It Works</h2>
//           <div className="row g-4 text-center">
//             <div className="col-md-4">
//               <div className="p-4">
//                 <div
//                   className="mx-auto mb-3 d-flex align-items-center justify-content-center"
//                   style={{
//                     width: "80px",
//                     height: "80px",
//                     background: "#0d6efd",
//                     color: "white",
//                     borderRadius: "50%",
//                     fontSize: "2rem"
//                   }}
//                 >
//                   <FaMapMarkerAlt />
//                 </div>
//                 <h5 className="fw-bold">1. Search Location</h5>
//                 <p className="text-muted">Enter your destination and find nearby parking areas on the map.</p>
//               </div>
//             </div>
//             <div className="col-md-4">
//               <div className="p-4">
//                 <div
//                   className="mx-auto mb-3 d-flex align-items-center justify-content-center"
//                   style={{
//                     width: "80px",
//                     height: "80px",
//                     background: "#0d6efd",
//                     color: "white",
//                     borderRadius: "50%",
//                     fontSize: "2rem"
//                   }}
//                 >
//                   <FaCar />
//                 </div>
//                 <h5 className="fw-bold">2. Select & Book</h5>
//                 <p className="text-muted">Choose your preferred slot, select time, and confirm your booking.</p>
//               </div>
//             </div>
//             <div className="col-md-4">
//               <div className="p-4">
//                 <div
//                   className="mx-auto mb-3 d-flex align-items-center justify-content-center"
//                   style={{
//                     width: "80px",
//                     height: "80px",
//                     background: "#0d6efd",
//                     color: "white",
//                     borderRadius: "50%",
//                     fontSize: "2rem"
//                   }}
//                 >
//                   <FaParking />
//                 </div>
//                 <h5 className="fw-bold">3. Park & Go</h5>
//                 <p className="text-muted">Arrive at your spot, park hassle-free, and enjoy your day.</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section
//         className="py-5 text-center text-white"
//         style={{ background: "linear-gradient(135deg, #0d6efd, #3b82f6)" }}
//       >
//         <div className="container">
//           <h2 className="fw-bold mb-3">Ready to Park Smarter?</h2>
//           <p className="lead mb-4">Join thousands of users who save time and stress with ParkSmart.</p>
//           <Link
//             to="/login"
//             className="btn btn-light btn-lg fw-bold px-5"
//             style={{ borderRadius: "14px" }}
//           >
//             Get Started Now
//           </Link>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="bg-dark text-white text-center py-4">
//         <div className="container">
//           <p className="mb-1 fw-bold">🚗 ParkSmart</p>
//           <p className="mb-0 text-muted" style={{ fontSize: "0.9rem" }}>
//             © {new Date().getFullYear()} ParkSmart. All rights reserved.
//           </p>
//         </div>
//       </footer>
//     </div>
//   );
// }

// export default HomePage;




import { Link } from "react-router-dom";
import {
  FaMapMarkerAlt, FaCalendarCheck, FaCreditCard, FaBell, FaCar,
  FaSearch, FaParking, FaStar, FaArrowRight, FaShieldAlt, FaBolt,
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
  .ps-gradient-text { background:var(--ps-gradient); -webkit-background-clip:text; background-clip:text; color:transparent; }
  .ps-glass { background:rgba(255,255,255,.72); backdrop-filter:saturate(180%) blur(14px);
    -webkit-backdrop-filter:saturate(180%) blur(14px); border-bottom:1px solid rgba(15,23,42,.06); }
  .ps-btn-primary { background:var(--ps-gradient); color:#fff; border:0; box-shadow:var(--ps-shadow-glow);
    transition:transform .25s ease, box-shadow .25s ease, opacity .25s ease; }
  .ps-btn-primary:hover { transform:translateY(-2px); opacity:.95; color:#fff; }
  .ps-btn-ghost { background:rgba(255,255,255,.1); color:#fff; border:1px solid rgba(255,255,255,.35);
    backdrop-filter:blur(8px); transition:all .25s ease; }
  .ps-btn-ghost:hover { background:rgba(255,255,255,.2); color:#fff; }
  .ps-card { background:#fff; border:1px solid var(--ps-border); border-radius:20px;
    transition:transform .3s ease, box-shadow .3s ease, border-color .3s ease; }
  .ps-card:hover { transform:translateY(-6px); box-shadow:var(--ps-shadow-glow); border-color:transparent; }
  .ps-icon-tile { width:56px; height:56px; border-radius:16px; display:flex; align-items:center; justify-content:center;
    background:var(--ps-gradient); color:#fff; font-size:1.4rem; box-shadow:0 10px 25px -10px rgba(99,102,241,.6); }
  .ps-step { width:84px; height:84px; border-radius:50%; display:flex; align-items:center; justify-content:center;
    background:var(--ps-gradient); color:#fff; font-size:2rem; box-shadow:var(--ps-shadow-glow); position:relative; }
  .ps-step::after { content:""; position:absolute; inset:-6px; border-radius:50%;
    background:var(--ps-gradient); filter:blur(18px); opacity:.35; z-index:-1; }
  .ps-pill { display:inline-flex; align-items:center; gap:.5rem; padding:.4rem .9rem; border-radius:999px;
    background:rgba(255,255,255,.15); border:1px solid rgba(255,255,255,.3); color:#fff;
    font-size:.8rem; font-weight:600; backdrop-filter:blur(8px); }
  .ps-stat-num { font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:2.25rem; }
  .ps-hero { position:relative; overflow:hidden; color:#fff; background:#0b1020; }
  .ps-hero::before { content:""; position:absolute; inset:0; background:var(--ps-mesh); opacity:.9; }
  .ps-hero::after { content:""; position:absolute; inset:0;
    background:linear-gradient(135deg,rgba(99,102,241,.85),rgba(139,92,246,.7) 50%,rgba(6,182,212,.55)); }
  .ps-hero > * { position:relative; z-index:1; }
  .ps-mock { background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.18);
    border-radius:20px; padding:1.25rem; backdrop-filter:blur(14px);
    box-shadow:0 30px 80px -30px rgba(0,0,0,.6); }
  .ps-fade-up { animation:psFadeUp .7s cubic-bezier(.4,0,.2,1) both; }
  @keyframes psFadeUp { from{opacity:0; transform:translateY(20px);} to{opacity:1; transform:none;} }
  .ps-cta { border-radius:28px; padding:4rem 2rem; color:#fff; text-align:center;
    background:var(--ps-gradient); box-shadow:var(--ps-shadow-glow); position:relative; overflow:hidden; }
  .ps-cta::before { content:""; position:absolute; inset:0; background:var(--ps-mesh); opacity:.4; }
  .ps-cta > * { position:relative; }
  .ps-footer { background:#0b1020; color:#cbd5e1; }
  a.ps-nav-link { color:#0f172a; text-decoration:none; font-weight:500; font-size:.9rem; opacity:.75; transition:opacity .2s; }
  a.ps-nav-link:hover { opacity:1; }
`;

function HomePage() {
  return (
    <div>
      <style>{tokens}</style>

      {/* Navbar */}
      <nav className="ps-glass sticky-top">
        <div className="container d-flex align-items-center justify-content-between py-3">
          <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
            <span className="d-inline-flex align-items-center justify-content-center"
              style={{ width:40, height:40, borderRadius:12, background:"var(--ps-gradient)",
                color:"#fff", boxShadow:"var(--ps-shadow-glow)" }}>
              <FaCar />
            </span>
            <span className="ps-display fw-bold fs-5" style={{ color:"var(--ps-ink)" }}>ParkSmart</span>
          </Link>

          <div className="d-none d-md-flex align-items-center gap-4">
            <a href="#features" className="ps-nav-link">Features</a>
            <a href="#how" className="ps-nav-link">How it works</a>
            <Link to="/login" className="ps-nav-link">Dashboard</Link>
          </div>

          <div className="d-flex gap-2">
            <Link to="/login" className="btn btn-sm fw-semibold" style={{ color:"var(--ps-ink)" }}>Login</Link>
            <Link to="/login" className="btn btn-sm ps-btn-primary fw-semibold px-3 py-2 rounded-pill">
              Get Started <FaArrowRight className="ms-1" size={12} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="ps-hero py-5">
        <div className="container py-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-7 ps-fade-up">
              <span className="ps-pill mb-4"><FaBolt /> Trusted by 940+ drivers in Nashik</span>
              <h1 className="ps-display fw-bold display-2 mb-4 lh-1">
                Smart parking,<br />
                <span style={{ background:"linear-gradient(135deg,#fff,#bae6fd)",
                  WebkitBackgroundClip:"text", backgroundClip:"text", color:"transparent" }}>
                  reimagined.
                </span>
              </h1>
              <p className="lead mb-4" style={{ maxWidth:560, opacity:.92 }}>
                Stop circling the block. ParkSmart finds, books, and manages parking spots in real-time —
                so you arrive, park, and go.
              </p>
              <div className="d-flex flex-wrap gap-3 mb-4">
                <Link to="/login" className="btn ps-btn-primary btn-lg fw-semibold px-4 rounded-3">
                  Get Started Free <FaArrowRight className="ms-2" size={14} />
                </Link>
                <Link to="/login" className="btn ps-btn-ghost btn-lg fw-semibold px-4 rounded-3">
                  Explore the Map
                </Link>
              </div>
              <div className="d-flex align-items-center gap-3 mt-4">
                <div className="d-flex" style={{ color:"#fbbf24" }}>
                  {[...Array(5)].map((_, i) => <FaStar key={i} />)}
                </div>
                <div style={{ opacity:.9, fontSize:".95rem" }}>
                  <strong>4.9</strong> from 1,200+ reviews
                </div>
              </div>
            </div>

            <div className="col-lg-5 ps-fade-up">
              <div className="ps-mock">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <div style={{ fontSize:".75rem", opacity:.7 }}>NEAREST AVAILABLE</div>
                    <div className="fw-bold fs-5">Tech Park Garage</div>
                  </div>
                  <span className="badge rounded-pill px-3 py-2" style={{ background:"var(--ps-success)" }}>Live</span>
                </div>
                <div className="row g-2 mb-3">
                  {[...Array(12)].map((_, i) => {
                    const taken = [2, 5, 8].includes(i);
                    return (
                      <div key={i} className="col-3">
                        <div style={{
                          aspectRatio:"1/1", borderRadius:10,
                          background: taken ? "rgba(255,255,255,.1)" : "linear-gradient(135deg,#10b981,#06b6d4)",
                          border:"1px solid rgba(255,255,255,.15)",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          color:"#fff", fontWeight:700, fontSize:".8rem", opacity: taken ? .4 : 1,
                        }}>
                          {String(i + 1).padStart(2, "0")}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="d-flex justify-content-between align-items-center pt-3"
                  style={{ borderTop:"1px solid rgba(255,255,255,.15)" }}>
                  <div>
                    <div style={{ fontSize:".75rem", opacity:.7 }}>STARTING AT</div>
                    <div className="fw-bold fs-5">₹30<span style={{ fontSize:".9rem", opacity:.7 }}>/hr</span></div>
                  </div>
                  <button className="btn ps-btn-primary btn-sm fw-semibold px-3 rounded-pill">
                    Book now <FaArrowRight className="ms-1" size={11} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background:"#fff", borderBottom:"1px solid var(--ps-border)" }}>
        <div className="container py-5">
          <div className="row g-4 text-center">
            {[
              { v:"320+", l:"Live Slots" },
              { v:"1,284", l:"Bookings" },
              { v:"₹4.8L", l:"Saved in Fuel" },
              { v:"4.9★", l:"Driver Rating" },
            ].map((s, i) => (
              <div key={i} className="col-6 col-md-3">
                <div className="ps-stat-num ps-gradient-text">{s.v}</div>
                <div className="text-uppercase fw-semibold mt-1"
                  style={{ fontSize:".75rem", letterSpacing:".1em", color:"var(--ps-muted)" }}>
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-5" style={{ background:"#fafbff" }}>
        <div className="container py-5">
          <div className="text-center mb-5" style={{ maxWidth:640, margin:"0 auto" }}>
            <span className="badge rounded-pill px-3 py-2 mb-3"
              style={{ background:"rgba(99,102,241,.1)", color:"var(--ps-primary)" }}>FEATURES</span>
            <h2 className="ps-display fw-bold display-5 mb-3">Everything you need to park.</h2>
            <p className="lead" style={{ color:"var(--ps-muted)" }}>
              Built for drivers, lot owners, and city operators.
            </p>
          </div>

          <div className="row g-4">
            {[
              { icon:<FaSearch />, title:"Real-Time Search", desc:"Find available parking spots near you instantly with live updates." },
              { icon:<FaCalendarCheck />, title:"Easy Booking", desc:"Reserve your spot in seconds and guarantee your parking space." },
              { icon:<FaCreditCard />, title:"Secure Payments", desc:"Pay safely with UPI, cards, or cash — encrypted end-to-end." },
              { icon:<FaBell />, title:"Smart Alerts", desc:"Get notified before time runs out — extend with one tap." },
            ].map((f, i) => (
              <div key={i} className="col-md-6 col-lg-3">
                <div className="ps-card p-4 h-100">
                  <div className="ps-icon-tile mb-4">{f.icon}</div>
                  <h5 className="fw-bold mb-2">{f.title}</h5>
                  <p className="mb-0" style={{ color:"var(--ps-muted)", fontSize:".95rem" }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-5">
        <div className="container py-5">
          <div className="text-center mb-5">
            <span className="badge rounded-pill px-3 py-2 mb-3"
              style={{ background:"rgba(139,92,246,.1)", color:"var(--ps-primary-2)" }}>HOW IT WORKS</span>
            <h2 className="ps-display fw-bold display-5">Park in three simple steps.</h2>
          </div>

          <div className="row g-5 text-center">
            {[
              { icon:<FaMapMarkerAlt />, title:"1. Search Location", desc:"Enter your destination and find nearby parking on the live map." },
              { icon:<FaCar />, title:"2. Select & Book", desc:"Choose your slot, set your time, and confirm with one tap." },
              { icon:<FaParking />, title:"3. Park & Go", desc:"Arrive, park hassle-free, and enjoy the rest of your day." },
            ].map((s, i) => (
              <div key={i} className="col-md-4">
                <div className="ps-step mx-auto mb-4">{s.icon}</div>
                <h5 className="fw-bold mb-2">{s.title}</h5>
                <p style={{ color:"var(--ps-muted)", maxWidth:300, margin:"0 auto" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust band */}
      <section className="py-4" style={{ background:"#fafbff",
        borderTop:"1px solid var(--ps-border)", borderBottom:"1px solid var(--ps-border)" }}>
        <div className="container">
          <div className="d-flex flex-wrap justify-content-center align-items-center gap-4 gap-md-5 text-center"
            style={{ color:"var(--ps-muted)", fontSize:".9rem", fontWeight:500 }}>
            <span className="d-flex align-items-center gap-2"><FaShieldAlt /> Bank-grade encryption</span>
            <span className="d-flex align-items-center gap-2"><FaBolt /> Instant confirmation</span>
            <span className="d-flex align-items-center gap-2"><FaStar /> 4.9 rated by drivers</span>
            <span className="d-flex align-items-center gap-2"><FaMapMarkerAlt /> Across Nashik</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-5">
        <div className="container py-4">
          <div className="ps-cta">
            <h2 className="ps-display fw-bold display-5 mb-3">Ready to park smarter?</h2>
            <p className="lead mb-4" style={{ opacity:.9, maxWidth:540, margin:"0 auto 2rem" }}>
              Join thousands of drivers who never wait for a spot.
            </p>
            <Link to="/login"
              className="btn btn-light btn-lg fw-bold px-5 rounded-3 d-inline-flex align-items-center gap-2"
              style={{ color:"var(--ps-primary)" }}>
              Create your account <FaArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="ps-footer py-5">
        <div className="container">
          <div className="row align-items-center gy-3">
            <div className="col-md-6 d-flex align-items-center gap-2">
              <span className="d-inline-flex align-items-center justify-content-center"
                style={{ width:36, height:36, borderRadius:10, background:"var(--ps-gradient)", color:"#fff" }}>
                <FaCar />
              </span>
              <span className="ps-display fw-bold text-white">ParkSmart</span>
            </div>
            <div className="col-md-6 text-md-end" style={{ fontSize:".875rem", opacity:.7 }}>
              © {new Date().getFullYear()} ParkSmart · Built with care in Nashik
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
