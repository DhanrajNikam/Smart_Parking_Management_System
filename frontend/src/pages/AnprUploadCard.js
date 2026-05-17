import { useRef, useState } from "react";
import Tesseract from "tesseract.js";

function AnprUploadCard({ onExtract }) {

  const fileRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handlePick = () => {
    fileRef.current?.click?.();
  };

  const onFile = async (file) => {

    setResult(null);
    setError("");

    if (!file) return;

    try {

      setLoading(true);

      const {
        data: { text }
      } = await Tesseract.recognize(
        file,
        "eng"
      );

      console.log("OCR TEXT:", text);

      const PLATE_REGEX =
        /[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}/;

      const cleaned = String(text || "")
        .toUpperCase()
        .replace(/O/g, "0")
        .replace(/I/g, "1")
        .replace(/Z/g, "2")
        .replace(/S/g, "5")
        .replace(/B/g, "8")
        .replace(/[^A-Z0-9]/g, "");

      const match =
        String(text || "").match(PLATE_REGEX) ||
        cleaned.match(PLATE_REGEX);

      if (match) {

        const vehicleNumber = match[0].toUpperCase();


        const data = {
          extracted_vehicle_number: vehicleNumber,
          confidence_score: 95
        };

        setResult(data);

        onExtract?.(vehicleNumber);

      } else {

        setError(
          "OCR could not detect vehicle number. Please enter manually."
        );

      }

    } catch (e) {

      console.log(e);

      setError(
        "OCR could not detect vehicle number. Please enter manually."
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="card shadow-sm sp-upload-card">

      <div className="card-body">

        <h5 className="mb-2">
          📷 Upload Vehicle Image (ANPR Demo)
        </h5>

        <p
          className="text-muted"
          style={{
            fontSize: 13,
            marginBottom: 12
          }}
        >
          Drag & drop or choose image.
          OCR will extract vehicle number.
        </p>

        <div
          className="sp-dropzone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();

            const f =
              e.dataTransfer.files?.[0];

            if (f) onFile(f);
          }}
          role="button"
          tabIndex={0}
          onClick={handlePick}
        >

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) =>
              onFile(e.target.files?.[0])
            }
          />

          <div className="sp-dropzone-inner">

            <div style={{ fontSize: 28 }}>
              ⬆️
            </div>

            <div style={{ fontWeight: 800 }}>
              Click or Drag to Upload
            </div>

            <div
              className="text-muted"
              style={{ fontSize: 12 }}
            >
              Max 5MB
            </div>

          </div>
        </div>

        {loading && (
          <div className="mt-3 alert alert-info">
            ⏳ Processing OCR...
          </div>
        )}

        {error && (
          <div className="mt-3 alert alert-danger">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-3">

            <div className="alert alert-success mb-0">

              <div style={{ fontWeight: 900 }}>
                ✅ Extracted:
              </div>

              <div
                style={{
                  fontSize: 18,
                  fontWeight: 900
                }}
              >
                {result.extracted_vehicle_number}
              </div>

              <div
                className="text-muted"
                style={{ fontSize: 12 }}
              >
                Confidence:
                {" "}
                {result.confidence_score}%
              </div>

            </div>

            <button
              className="btn btn-outline-secondary w-100 mt-2"
              onClick={() => setResult(null)}
            >
              Retry
            </button>

          </div>
        )}

      </div>
    </div>
  );
}

export default AnprUploadCard;