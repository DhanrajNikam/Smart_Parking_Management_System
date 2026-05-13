## Wallet Refund System - Progress

### Step 1: DB schema updates (users.wallet + wallet_transactions + refund_requests)
- [x] Update `database/schema.sql`

### Step 2: Backend wallet/refund controllers & routes
- [x] Create `backend/controllers/walletController.js`

- [x] Create wallet/refund routes


### Step 3: Cancellation refund logic + SMS
- [x] Update `backend/controllers/bookingController.js` cancelBooking

- [x] Update `adminController.forceCancelBooking`
- [x] Add cancellation wallet refund + SMS format + in-app notifications



- [ ] Add cancellation SMS format + in-app notifications

### Step 4: Admin approve/reject refund + SMS
- [ ] Implement admin endpoints


### Step 5: Frontend pages + navbar integration
- [ ] Add Wallet/Refund pages
- [ ] Add Admin Refund management page
- [ ] Hook up API calls

### Step 6: Testing checklist
- [ ] Validate policy refunds
- [ ] Validate wallet debit/credit on request/approve/reject
- [ ] Validate SMS payload formatting

