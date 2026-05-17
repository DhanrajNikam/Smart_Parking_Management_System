# TODO - Smart Parking OCR + QR Fixes

- [ ] Update `backend/controllers/anprController.js`
  - [ ] Add required RAW/CLEANED OCR logs
  - [ ] Improve OCR cleanup and plate extraction using robust regex
  - [ ] Return exact failure message when OCR fails
- [ ] Update `frontend/src/pages/AnprUploadCard.js`
  - [ ] Clean OCR before regex match
  - [ ] Use required robust plate regex
  - [ ] Show required manual-entry failure message
- [ ] Update `backend/controllers/qrController.js`
  - [ ] Generate QR Base64 PNG using `qrcode` package
  - [ ] Return `qr_code` expected by frontend
  - [ ] Add error logs if generation fails
- [ ] Update `frontend/src/pages/Confirmation.js`
  - [ ] Ensure it renders QR from `res.data.qr_code`
- [ ] Test both flows
  - [ ] OCR: upload plate image -> vehicle number auto-filled
  - [ ] QR: book -> confirmation page shows QR image

