# TODO - Recent Reviews + Admin Reply (Smart Parking Admin Dashboard)

## Steps
- [x] Update database schema: add `admin_reply TEXT NULL` column to `ratings` table
- [x] Backend: add `getRecentReviews` and `replyToReview` controllers in `backend/controllers/adminController.js`
- [x] Backend: add routes in `backend/routes/adminRoutes.js` for `/recent-reviews` and `/reply-review/:id`
- [x] Frontend: update `frontend/src/admin/AdminDashboard.js`
  - fetch recent reviews
  - render Recent Reviews section + stars
  - add textarea + submit for admin reply
  - show existing reply after update
- [x] Testing: restart backend + frontend and verify UI/API behavior

