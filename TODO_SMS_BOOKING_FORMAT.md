# TODO_SMS_BOOKING_FORMAT

- [ ] Update backend/utils/notificationHelper.js
  - [ ] Modify sendBookingSMS() signature to accept: duration, total_price, location_name, latitude, longitude
  - [ ] Implement exact required SMS layout with correct emojis and line spacing
  - [ ] Auto-generate Google Maps URL using latitude/longitude
  - [ ] Keep formatDateTime() helper unchanged
  - [ ] Ensure missing new fields do not break SMS sending (fallbacks)

- [ ] Update backend/controllers/bookingController.js
  - [ ] In createBooking(), fetch parking fields needed for SMS: name, latitude, longitude
  - [ ] Pass duration/total_price/location fields into sendBookingSMS()

- [ ] Verify behavior manually
  - [ ] SMS includes parking name
  - [ ] Directions link opens Google Maps
  - [ ] Duration and amount paid appear correctly
  - [ ] Layout matches required format

