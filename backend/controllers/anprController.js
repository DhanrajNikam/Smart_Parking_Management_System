const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

// OCR
let Tesseract = null;

try {

  Tesseract = require("tesseract.js");

} catch (e) {

  console.log("Tesseract not installed");

}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

// ================= CLEAN OCR TEXT =================

const normalizePlate = (s) => {

  if (!s) return "";

  // SAFE cleanup only: do NOT replace letters aggressively.
  // We only uppercase and remove non-alphanumerics.
  return String(s)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .trim();

};

const PLATE_REGEX = /[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}/;

const extractIndianPlate = (text) => {

  if (!text) return "";

  // Direct match first
  const match = text.match(PLATE_REGEX);
  if (match) return match[0];

  // If text contains spacing/punctuation remnants, try joining variants
  const compact = normalizePlate(text);
  const match2 = compact.match(PLATE_REGEX);
  if (match2) return match2[0];

  return "";

};

// ================= MAIN CONTROLLER =================

exports.extractVehicleNumber = (req, res) => {

  upload.single("image")(req, res, async (err) => {


    try {

      if (err) {

        return res.status(400).json({
          message: "Upload error"
        });

      }

      if (!req.file) {

        return res.status(400).json({
          message: "Image is required"
        });

      }

      const filename =
        `anpr-${crypto.randomBytes(8).toString("hex")}${path.extname(req.file.originalname || "jpg")}`;

      const imageBuffer = req.file.buffer;

      // ================= OCR =================

      if (Tesseract && Tesseract.recognize) {

        const result = await Tesseract.recognize(
          imageBuffer,
          "eng"
        );

        const text =
          result?.data?.text || "";

        const confidence =
          result?.data?.confidence || 0;

        // Required logs
        console.log("RAW OCR:", text);

        // CLEAN
        const cleaned =
          normalizePlate(text);

        console.log("CLEANED OCR:", cleaned);

        // EXTRACT NUMBER (try from both raw and cleaned)
        const vehicleNumber =
          extractIndianPlate(text) || extractIndianPlate(cleaned);

        // Required debug log
        console.log("MATCHED PLATE:", vehicleNumber);

        // NOT FOUND
        if (!vehicleNumber) {

          return res.status(200).json({

            extracted_text: cleaned,

            extracted_vehicle_number: "",

            confidence_score: confidence,

            filename,

            message:
              "OCR could not detect vehicle number. Please enter manually."

          });

        }


        // SUCCESS
        return res.json({

          extracted_text: cleaned,

          extracted_vehicle_number:
            vehicleNumber,

          confidence_score: confidence,

          filename

        });

      }

      // ================= FALLBACK =================

      return res.json({

        extracted_text:
          "OCR not installed",

        extracted_vehicle_number:
          "",

        confidence_score: 0,

        filename,

        message:
          "OCR not installed"

      });


    } catch (e) {

      console.log(
        "extractVehicleNumber error:",
        e
      );

      return res.status(500).json({

        message: "OCR failed"

      });

    }

  });

};