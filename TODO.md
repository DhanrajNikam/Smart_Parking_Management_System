# Smart Parking Management System - Wallet Refund System

## Plan Steps (Approved)

1. Update `database/schema.sql`:
   - Add `users.wallet DECIMAL(10,2) DEFAULT 0`
   - Create `wallet_transactions`
   - Create `refund_requests`

2. Backend Wallet APIs:
   - Add `backend/controllers/walletController.js` with:
     - get wallet balance
     - get wallet transaction history
     - request refund (deduct immediately + create refund request)

3. Backend Refund Admin APIs:
   - Add endpoints for admin to view/approve/reject refund requests
   - On approve: send in-app notification + SMS
   - On reject: credit wallet back + send in-app notification + SMS

4. Update booking cancellation logic:
   - In `backend/controllers/bookingController.js` cancelBooking:
     - compute refund based on policy
     - credit wallet refund
     - insert wallet_transactions
     - send professional cancellation SMS
     - create in-app notification (booking cancelled + refund)
   - Ensure admin force-cancel also triggers wallet refund + SMS via admin cancellation path (if required).

5. Add backend routes:
   - `backend/routes/walletRoutes.js`
   - Admin refund routes integrated into `backend/routes/adminRoutes.js` (or new file)

6. Update backend `backend/server.js` to mount new routes.

7. Update SMS formatting helpers in `backend/utils/notificationHelper.js`:
   - Booking confirmed SMS already exists; add:
     - booking cancelled SMS (professional format with refund amount)
     - refund approved/rejected SMS
   - Add professional date/time formatting helper.

8. Frontend Pages + UI:
   - `frontend/src/pages/Wallet.js`
   - `frontend/src/pages/RefundRequest.js`
   - `frontend/src/pages/WalletHistory.js`
   - `frontend/src/admin/RefundRequests.js`

9. Frontend API calls:
   - Wire up Axios calls using `frontend/src/services/api.js`.

10. Frontend navigation:
   - Update `frontend/src/components/Navbar.js` to include Wallet/Refund pages for users.
   - Update admin navigation to include Refund Requests.

11. Validation + testing:
   - Cancel booking before 1 hour => 100% refund + SMS
   - Cancel before 30 min => 50% refund + SMS
   - After start time => 0% refund + SMS
   - Refund request => deduct immediately + wallet transaction + status pending
   - Admin approve => status approved + SMS
   - Admin reject => credit back + wallet transaction + SMS

