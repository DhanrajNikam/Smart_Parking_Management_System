import React, { useEffect, useMemo, useRef, useState } from "react";
import API from "../services/api";
import "./GuardScanner.css";

import { Html5Qrcode } from "html5-qrcode";
function GuardScanner() {
  const [mode, setMode] = useState("entry"); // entry | exit
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const scannerRef = useRef(null);
  const scanLockRef = useRef(false);
  const containerId = useMemo(
    () => `guard-qr-${Math.random().toString(16).slice(2)}`,
    []
  );

  const modeLabel = mode === "entry" ? "ENTRY" : "EXIT";

  const playBeep = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = 880;
      gain.gain.value = 0.06;

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        ctx.close?.();
      }, 140);
    } catch (e) {
      // ignore
    }
  };

  const vibrate = () => {
    try {
      if (navigator && typeof navigator.vibrate === "function") {
        navigator.vibrate([60, 40, 60]);
      }
    } catch (e) {
      // ignore
    }
  };

  const stopScanner = () => {
    try {
      if (scannerRef.current) {
        scannerRef.current.stop();
      }
    } catch (e) {
      // ignore
    }
    setIsScannerActive(false);
  };

  const startScanner = () => {
    setError(null);
    setSuccess(null);

    // prevent re-creating multiple instances
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode(containerId);

      scannerRef.current
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            if (!decodedText) return;
            if (scanLockRef.current) return;

            // lock to prevent duplicates
            scanLockRef.current = true;
            stopScanner();

            // immediate feedback on decode
            playBeep();
            vibrate();

            setIsValidating(true);
            try {
              const body = {
                qrCodeValue: decodedText,
                mode
              };

              const res = await API.post("/qr/validate", body);
              const data = res?.data || {};

              const timestamp = new Date().toISOString();

              setSuccess({
                bookingId: data.booking_id ?? data.bookingId ?? null,
                message: data.message ?? "Validated",
                timestamp,
                mode
              });

              setError(null);
            } catch (err) {
              const backendMsg = err?.response?.data?.message;
              setError({
                message: backendMsg || "Validation failed"
              });
              setSuccess(null);
            } finally {
              setIsValidating(false);
            }
          },
          (errorMessage) => {
            // html5-qrcode gives frequent errors while scanning; ignore unless we are validating
            if (errorMessage && !scanLockRef.current) {
              // no-op
            }
          }
        )
        .then(() => setIsScannerActive(true))
        .catch(() => {
          setIsScannerActive(false);
          setError({
            message:
              "Camera permission denied or camera not available. Please use Start Scanner again."
          });
          scanLockRef.current = false;
        });

      return;
    }

    // existing scanner instance
    scanLockRef.current = false;
    try {
      scannerRef.current
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            if (!decodedText) return;
            if (scanLockRef.current) return;

            scanLockRef.current = true;
            stopScanner();

            playBeep();
            vibrate();

            setIsValidating(true);
            try {
              const body = { qrCodeValue: decodedText, mode };
              const res = await API.post("/qr/validate", body);
              const data = res?.data || {};

              const timestamp = new Date().toISOString();

              setSuccess({
                bookingId: data.booking_id ?? data.bookingId ?? null,
                message: data.message ?? "Validated",
                timestamp,
                mode
              });
              setError(null);
            } catch (err) {
              const backendMsg = err?.response?.data?.message;
              setError({ message: backendMsg || "Validation failed" });
              setSuccess(null);
            } finally {
              setIsValidating(false);
            }
          }
        )
        .then(() => setIsScannerActive(true))
        .catch(() => {
          setIsScannerActive(false);
          setError({
            message:
              "Unable to start camera. Please check permissions and try again."
          });
          scanLockRef.current = false;
        });
    } catch (e) {
      setIsScannerActive(false);
      setError({ message: "Unable to start scanner." });
      scanLockRef.current = false;
    }
  };

  const scanAgain = () => {
    setError(null);
    setSuccess(null);
    scanLockRef.current = false;
    setIsValidating(false);
    startScanner();
  };

  useEffect(() => {
    // Auto-open camera on load
    startScanner();
    return () => {
      try {
        stopScanner();
      } catch {
        // ignore
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // When switching mode, allow another scan
    scanLockRef.current = false;
    setError(null);
    setSuccess(null);
    // keep camera running if already active
  }, [mode]);

  return (
    <div className="guard-scanner-page">
      <div className="guard-scanner-shell">
        <div className="guard-scanner-title">Smart Parking Guard Scanner</div>

        <div className="guard-scanner-card">
          <div className="guard-scanner-top">
            <div className="guard-scanner-mode-row">
              <button
                className={`guard-mode-btn ${mode === "entry" ? "active" : ""}`}
                type="button"
                onClick={() => setMode("entry")}
              >
                ENTRY MODE
              </button>
              <button
                className={`guard-mode-btn ${mode === "exit" ? "active" : ""}`}
                type="button"
                onClick={() => setMode("exit")}
              >
                EXIT MODE
              </button>
            </div>
          </div>

          <div className="guard-scanner-body">
            <div>
              <div className="guard-video-wrap">
                <div className="guard-qr-container" id={containerId}>
                  <div className="guard-qr-overlay">
                    <div className="guard-scanner-frame">
                      <div className="guard-corners">
                        <div className="guard-corner tl" />
                        <div className="guard-corner tr" />
                        <div className="guard-corner bl" />
                        <div className="guard-corner br" />
                      </div>
                      <div className="guard-scanline" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="guard-controls">
                <button
                  className="guard-btn primary"
                  type="button"
                  onClick={startScanner}
                  disabled={isScannerActive || isValidating}
                >
                  Start Scanner
                </button>
                <button
                  className="guard-btn danger"
                  type="button"
                  onClick={stopScanner}
                  disabled={!isScannerActive || isValidating}
                >
                  Stop Scanner
                </button>
                <button
                  className="guard-btn"
                  type="button"
                  onClick={scanAgain}
                  disabled={isValidating}
                >
                  Scan Again
                </button>
              </div>

              <div style={{ marginTop: 10 }} className="guard-subtle">
                Current mode: <b>{modeLabel}</b>
              </div>
            </div>

            <div className="guard-status-panel">
              <div className="guard-status-title">Scan Status</div>
              <div className="guard-subtle">
                Point the camera at the QR and keep it inside the frame.
              </div>

              {isValidating && (
                <div className="guard-loading">
                  <div className="guard-spinner" />
                  <div className="guard-subtle" style={{ fontWeight: 900 }}>
                    Validating QR...
                  </div>
                </div>
              )}

              {success && (
                <div className="guard-alert success" role="status">
                  <div style={{ fontWeight: 950, marginBottom: 6, fontSize: 16 }}>
                    {mode === "entry" ? "ENTRY SUCCESS" : "EXIT SUCCESS"}
                  </div>
                  <div className="guard-subtle" style={{ fontWeight: 900 }}>
                    {success.message}
                  </div>
                  <div className="guard-meta">
                    <div className="guard-meta-row">
                      <div className="guard-meta-label">Booking ID</div>
                      <div className="guard-meta-value">{success.bookingId ?? "-"}</div>
                    </div>
                    <div className="guard-meta-row">
                      <div className="guard-meta-label">Timestamp</div>
                      <div className="guard-meta-value">
                        {success.timestamp
                          ? new Date(success.timestamp).toLocaleString()
                          : "-"}
                      </div>
                    </div>
                    <div className="guard-meta-row">
                      <div className="guard-meta-label">Mode</div>
                      <div className="guard-meta-value">{success.mode.toUpperCase()}</div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="guard-alert error" role="alert">
                  <div style={{ fontWeight: 950, marginBottom: 6, fontSize: 16 }}>
                    SCAN FAILED
                  </div>
                  <div className="guard-subtle" style={{ fontWeight: 900 }}>
                    {error.message}
                  </div>
                  <div className="guard-subtle" style={{ marginTop: 8, fontWeight: 750 }}>
                    Tip: Try “Scan Again” and ensure the QR is not expired.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuardScanner;

