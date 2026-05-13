const db = require("../config/db");
const ExcelJS = require("exceljs");


exports.getDashboardStats = async (req, res) => {
  try {

    // 1️⃣ Total bookings
    const [[totalBookings]] = await db.promise().query(
      "SELECT COUNT(*) AS total FROM bookings"
    );

    // 2️⃣ Active bookings
    const [[activeBookings]] = await db.promise().query(
      "SELECT COUNT(*) AS total FROM bookings WHERE status = 'active'"
    );

    // 3️⃣ Completed bookings
    const [[completedBookings]] = await db.promise().query(
      "SELECT COUNT(*) AS total FROM bookings WHERE status = 'completed'"
    );

    // 4️⃣ Cancelled bookings
    const [[cancelledBookings]] = await db.promise().query(
      "SELECT COUNT(*) AS total FROM bookings WHERE status = 'cancelled'"
    );

    // 5️⃣ Total revenue
    const [[totalRevenue]] = await db.promise().query(
      "SELECT IFNULL(SUM(total_price),0) AS revenue FROM bookings WHERE status IN ('active','completed')"
    );

    // 6️⃣ Today revenue
    const [[todayRevenue]] = await db.promise().query(
      `SELECT IFNULL(SUM(total_price),0) AS revenue 
       FROM bookings 
       WHERE DATE(created_at) = CURDATE()
       AND status IN ('active','completed')`
    );

    // 7️⃣ Top location
    const [[topLocation]] = await db.promise().query(
      `SELECT pl.name, COUNT(b.id) AS total_bookings
       FROM bookings b
       JOIN parking_locations pl ON b.location_id = pl.id
       WHERE b.status IN ('active','completed')
       GROUP BY pl.name
       ORDER BY total_bookings DESC
       LIMIT 1`
    );

    // 8️⃣ Total parking slots
    const [[totalSlots]] = await db.promise().query(
      "SELECT COUNT(*) AS total FROM slots"
    );

    // 9️⃣ Available slots
    const [[availableSlots]] = await db.promise().query(
      "SELECT COUNT(*) AS total FROM slots WHERE status = 'available'"
    );

    // 🔟 Occupied slots
    const [[occupiedSlots]] = await db.promise().query(
      "SELECT COUNT(*) AS total FROM slots WHERE status = 'occupied'"
    );

    // 1️⃣1️⃣ Total registered users
    const [[totalUsers]] = await db.promise().query(
      "SELECT COUNT(*) AS total FROM users WHERE role = 'user'"
    );

    // 1️⃣2️⃣ Today's bookings
    const [[todayBookings]] = await db.promise().query(
      `SELECT COUNT(*) AS total FROM bookings WHERE DATE(created_at) = CURDATE()`
    );

    res.json({
      total_bookings: totalBookings.total,
      active_bookings: activeBookings.total,
      completed_bookings: completedBookings.total,
      cancelled_bookings: cancelledBookings.total,
      total_revenue: totalRevenue.revenue,
      today_revenue: todayRevenue.revenue,
      top_location: topLocation ? topLocation.name : null,
      total_parking_slots: totalSlots.total,
      available_slots: availableSlots.total,
      occupied_slots: occupiedSlots.total,
      total_users: totalUsers.total,
      todays_bookings: todayBookings.total
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.getMonthlyRevenue = async (req, res) => {
  try {
    const [data] = await db.promise().query(
      `SELECT 
          DATE_FORMAT(created_at, '%b') AS month,
          SUM(total_price) AS revenue
       FROM bookings
       WHERE status IN ('active','completed')
       GROUP BY MONTH(created_at), DATE_FORMAT(created_at, '%b')
       ORDER BY MONTH(created_at)`
    );

    res.json(data);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.getTopLocations = async (req, res) => {
  try {
    const [data] = await db.promise().query(
      `SELECT 
          pl.name AS location,
          COUNT(b.id) AS total_bookings,
          IFNULL(SUM(b.total_price), 0) AS total_revenue
       FROM bookings b
       JOIN parking_locations pl ON b.location_id = pl.id
       WHERE b.status IN ('active','completed')
       GROUP BY pl.name
       ORDER BY total_bookings DESC
       LIMIT 5`
    );

    res.json(data);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.getDailyBookingTrend = async (req, res) => {
  try {
    const [data] = await db.promise().query(
      `SELECT 
          DATE(created_at) AS date,
          COUNT(*) AS bookings
       FROM bookings
       WHERE created_at >= CURDATE() - INTERVAL 6 DAY
       GROUP BY DATE(created_at)
       ORDER BY DATE(created_at)`
    );

    res.json(data);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.getVehicleTypeAnalytics = async (req, res) => {
  try {
    const [data] = await db.promise().query(
      `SELECT 
          vehicle_type,
          COUNT(*) AS total_bookings,
          IFNULL(SUM(total_price),0) AS total_revenue
       FROM bookings
       WHERE status IN ('active','completed')
       GROUP BY vehicle_type
       ORDER BY total_bookings DESC`
    );

    res.json(data);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.getRevenueByLocation = async (req, res) => {
  try {
    const [data] = await db.promise().query(
      `SELECT 
          pl.name AS location,
          IFNULL(SUM(b.total_price), 0) AS total_revenue
       FROM bookings b
       JOIN parking_locations pl ON b.location_id = pl.id
       WHERE b.status IN ('active','completed')
       GROUP BY pl.name
       ORDER BY total_revenue DESC`
    );

    res.json(data);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.getYearlyRevenue = async (req, res) => {
  try {
    const [data] = await db.promise().query(
      `SELECT 
          MONTH(created_at) AS month_number,
          SUM(total_price) AS revenue
       FROM bookings
       WHERE status IN ('active','completed')
       GROUP BY MONTH(created_at)`
    );

    const months = [
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec"
    ];

    const result = months.map((month, index) => {
      const found = data.find(d => d.month_number === index + 1);
      return {
        month,
        revenue: found ? Number(found.revenue) : 0
      };
    });

    res.json(result);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.getProfitLossSummary = async (req, res) => {
  try {

    // 1️⃣ Get total revenue
    const [[revenueData]] = await db.promise().query(
      `SELECT IFNULL(SUM(total_price),0) AS revenue
       FROM bookings
       WHERE status IN ('active','completed')`
    );

    const totalRevenue = Number(revenueData.revenue);

    // 2️⃣ Estimate expenses (40%)
    const estimatedExpenses = totalRevenue * 0.4;

    // 3️⃣ Net profit
    const netProfit = totalRevenue - estimatedExpenses;

    // 4️⃣ Profit margin %
    const profitMargin =
      totalRevenue > 0
        ? ((netProfit / totalRevenue) * 100).toFixed(2)
        : 0;

    res.json({
      total_revenue: totalRevenue,
      estimated_expenses: Number(estimatedExpenses.toFixed(2)),
      net_profit: Number(netProfit.toFixed(2)),
      profit_margin_percent: Number(profitMargin)
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.getPeakHourAnalytics = async (req, res) => {
  try {
    const [data] = await db.promise().query(
      `SELECT 
          HOUR(start_time) AS hour,
          COUNT(*) AS bookings
       FROM bookings
       WHERE status IN ('active','completed')
       GROUP BY HOUR(start_time)`
    );

    // 0 ते 23 hours full structure
    const result = [];

    for (let i = 0; i < 24; i++) {
      const found = data.find(d => d.hour === i);
      result.push({
        hour: i.toString().padStart(2, "0"),
        bookings: found ? found.bookings : 0
      });
    }

    res.json(result);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// exports.getAllBookings = async (req, res) => {
//   try {
//     const [bookings] = await db.promise().query(
//       `SELECT 
//           b.id,
//           b.booking_code,
//           u.name AS user_name,
//           u.email,
//           pl.name AS parking_location,
//           s.slot_number,
//           b.vehicle_type,
//           b.vehicle_number,
//           b.booking_date,
//           b.start_time,
//           b.duration,
//           b.total_price,
//           b.status,
//           b.created_at
//        FROM bookings b
//        JOIN users u ON b.user_id = u.id
//        JOIN parking_locations pl ON b.location_id = pl.id
//        JOIN slots s ON b.slot_id = s.id
//        ORDER BY b.created_at DESC`
//     );

//     res.json(bookings);

//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };


exports.getAllBookings = async (req, res) => {
  try {

    // Get page & limit from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const offset = (page - 1) * limit;

    // Total count
    const [countResult] = await db.promise().query(
      "SELECT COUNT(*) AS total FROM bookings"
    );

    const totalBookings = countResult[0].total;

    // Get paginated data
    const [bookings] = await db.promise().query(
      `
      SELECT b.*, u.name AS user_name, pl.name AS location_name, s.slot_number
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN parking_locations pl ON b.location_id = pl.id
      JOIN slots s ON b.slot_id = s.id
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?
      `,
      [limit, offset]
    );

    res.json({
      current_page: page,
      total_pages: Math.ceil(totalBookings / limit),
      total_bookings: totalBookings,
      bookings: bookings
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.forceCancelBooking = async (req, res) => {
  const bookingId = req.params.id;

  try {

    const [booking] = await db.promise().query(
      `SELECT 
        b.id,
        b.booking_code,
        b.user_id,
        b.location_id,
        b.slot_id,
        b.booking_date,
        b.start_time,
        b.duration,
        b.total_price,
        pl.address,
        pl.name AS location_name,
        b.status
      FROM bookings b
      JOIN parking_locations pl ON pl.id = b.location_id
      WHERE b.id = ?`,
      [bookingId]
    );



    if (booking.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking[0].status === "cancelled") {
      return res.status(400).json({ message: "Booking already cancelled" });
    }

    // 1️⃣ Cancel booking
    await db.promise().query(
      "UPDATE bookings SET status = 'cancelled' WHERE id = ?",
      [bookingId]
    );

    // 2️⃣ Free slot
    await db.promise().query(
      "UPDATE slots SET status = 'available' WHERE id = ?",
      [booking[0].slot_id]
    );

    // Policy calculation
    const now = new Date();
    const bookingDateStr = booking[0].booking_date instanceof Date
      ? booking[0].booking_date.toISOString().split("T")[0]
      : booking[0].booking_date;

    const startDateTime = new Date(`${bookingDateStr}T${booking[0].start_time}`);
    const hoursLeft = (startDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    let refundAmount = 0;
    if (hoursLeft >= 1) refundAmount = Number(booking[0].total_price);
    else if (hoursLeft >= 0.5) refundAmount = Number(booking[0].total_price) * 0.5;

    // Wallet refund credit (if refundAmount > 0)
    if (refundAmount > 0) {
      await db.promise().query(
        "UPDATE users SET wallet = wallet + ? WHERE id = ?",
        [refundAmount, booking[0].user_id]
      );

      await db.promise().query(
        `INSERT INTO wallet_transactions
         (user_id, booking_id, amount, type, description)
         VALUES (?, ?, ?, 'credit', ?)` ,
        [
          booking[0].user_id,
          bookingId,
          refundAmount,
          `Admin cancellation refund for ${booking[0].booking_code} (hoursLeft=${hoursLeft.toFixed(2)})`
        ]
      );
    }

    // 3️⃣ Notification
    await db.promise().query(
      `INSERT INTO notifications 
       (user_id, booking_id, message, type)
       VALUES (?, ?, ?, 'alert')`,
      [
        booking[0].user_id,
        bookingId,
        `Your booking ${booking[0].booking_code} was cancelled by admin. Refund: ₹${refundAmount.toFixed(2).replace(/\.00$/, "")}`
      ]
    );

    // Best-effort SMS
    try {
      const [userRows] = await db.promise().query(
        "SELECT phone_number FROM users WHERE id = ?",
        [booking[0].user_id]
      );

      const phone_number = userRows[0]?.phone_number;

      const start_time_display = new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      }).format(startDateTime);

      const endDate = new Date(startDateTime.getTime() + Number(booking[0].duration) * 60 * 60 * 1000);

      const end_time_display = new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      }).format(endDate);

      const { sendBookingCancelledSMS } = require("../utils/notificationHelper");

      if (phone_number) {
        await sendBookingCancelledSMS({
          phone_number,
          booking_code: booking[0].booking_code,
          refund_amount: refundAmount,
          slot_id: booking[0].slot_id,
          location_address: booking[0].address ? booking[0].address : booking[0].location_name,
          start_time_display,
          end_time_display
        });
      }
    } catch (smsErr) {
      console.log("Admin cancellation SMS best-effort failed:", smsErr?.message || smsErr);
    }

    res.json({ message: "Booking force cancelled successfully", refund_amount: Number(refundAmount.toFixed(2)) });


  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.promise().query(
      `SELECT 
          u.id,
          u.name,
          u.email,
          u.role,
          u.is_active,
          COUNT(b.id) AS total_bookings,
          u.created_at
       FROM users u
       LEFT JOIN bookings b ON u.id = b.user_id
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    );

    res.json(users);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};





exports.changeUserRole = async (req, res) => {
  const userId = req.params.id;
  const { role } = req.body;

  try {
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role value" });
    }

    const [user] = await db.promise().query(
      "SELECT id FROM users WHERE id = ?",
      [userId]
    );

    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    await db.promise().query(
      "UPDATE users SET role = ? WHERE id = ?",
      [role, userId]
    );

    res.json({
      message: "User role updated successfully",
      new_role: role
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.getFilteredBookings = async (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT 
        b.id,
        u.name AS user_name,
        b.location_id,
        b.slot_id,
        b.start_time,
        b.status,
        b.created_at
      FROM bookings b
      JOIN users u ON b.user_id = u.id
    `;

    const values = [];

    if (status) {
      query += " WHERE b.status = ?";
      values.push(status);
    }

    query += " ORDER BY b.start_time DESC";

    const [bookings] = await db.promise().query(query, values);

    res.json(bookings);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getParkingUtilization = async (req, res) => {
  try {
    // Total slots
    const [totalResult] = await db.promise().query(
      "SELECT COUNT(*) AS total FROM slots"
    );

    const totalSlots = totalResult[0].total;

    // Occupied slots (from slots table)
    const [occupiedResult] = await db.promise().query(
      "SELECT COUNT(*) AS occupied FROM slots WHERE status = 'occupied'"
    );

    const occupiedSlots = occupiedResult[0].occupied;

    // Calculate percentage
    let utilization = 0;

    if (totalSlots > 0) {
      utilization = ((occupiedSlots / totalSlots) * 100).toFixed(2);
    }

    res.json({
      total_slots: totalSlots,
      occupied_slots: occupiedSlots,
      utilization_percentage: Number(utilization)
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.getMostUsedParkingArea = async (req, res) => {
  try {
    const [result] = await db.promise().query(`
      SELECT 
        pl.name AS location_name,
        COUNT(b.id) AS total_bookings
      FROM bookings b
      JOIN parking_locations pl ON b.location_id = pl.id
      GROUP BY b.location_id
      ORDER BY total_bookings DESC
      LIMIT 1
    `);

    if (result.length === 0) {
      return res.json({ message: "No bookings found" });
    }

    res.json(result[0]);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getLeastUsedParkingArea = async (req, res) => {
  try {
    const [result] = await db.promise().query(`
      SELECT 
        pl.name AS location_name,
        COUNT(b.id) AS total_bookings
      FROM parking_locations pl
      LEFT JOIN bookings b ON b.location_id = pl.id
      GROUP BY pl.id
      ORDER BY total_bookings ASC
      LIMIT 1
    `);

    if (result.length === 0) {
      return res.json({ message: "No data found" });
    }

    res.json(result[0]);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateBookingStatus = async (req, res) => {
  const bookingId = req.params.id;
  const { status } = req.body;

  try {

    const allowedStatuses = ["pending", "active", "completed", "cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const [booking] = await db.promise().query(
      "SELECT id, slot_id FROM bookings WHERE id = ?",
      [bookingId]
    );

    if (booking.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Update booking status
    await db.promise().query(
      "UPDATE bookings SET status = ? WHERE id = ?",
      [status, bookingId]
    );

    // If booking completed or cancelled → free slot
    if (status === "completed" || status === "cancelled") {
      await db.promise().query(
        "UPDATE slots SET status = 'available' WHERE id = ?",
        [booking[0].slot_id]
      );
    }

    // If booking becomes active → occupy slot
    if (status === "active") {
      await db.promise().query(
        "UPDATE slots SET status = 'occupied' WHERE id = ?",
        [booking[0].slot_id]
      );
    }

    res.json({
      message: "Booking status updated successfully",
      booking_id: bookingId,
      new_status: status
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAdvancedFilteredBookings = async (req, res) => {
  try {

    const {
      status,
      location_id,
      from,
      to,
      page = 1,
      limit = 10
    } = req.query;

    const offset = (page - 1) * limit;

    let query = `
      SELECT b.*, 
             u.name AS user_name,
             pl.name AS location_name,
             s.slot_number
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN parking_locations pl ON b.location_id = pl.id
      JOIN slots s ON b.slot_id = s.id
      WHERE 1=1
    `;

    const values = [];

    // Filter by status
    if (status) {
      query += " AND b.status = ?";
      values.push(status);
    }

    // Filter by location
    if (location_id) {
      query += " AND b.location_id = ?";
      values.push(location_id);
    }

    // Filter by date range
    if (from && to) {
      query += " AND b.booking_date BETWEEN ? AND ?";
      values.push(from, to);
    }

    query += " ORDER BY b.created_at DESC LIMIT ? OFFSET ?";
    values.push(parseInt(limit), parseInt(offset));

    const [bookings] = await db.promise().query(query, values);

    res.json({
      page: Number(page),
      limit: Number(limit),
      results: bookings.length,
      bookings
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.exportBookingsExcel = async (req, res) => {
  try {

    const [bookings] = await db.promise().query(`
      SELECT 
        b.id,
        u.name AS user_name,
        pl.name AS location_name,
        s.slot_number,
        b.vehicle_type,
        b.vehicle_number,
        b.booking_date,
        b.start_time,
        b.duration,
        b.total_price,
        b.status
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN parking_locations pl ON b.location_id = pl.id
      JOIN slots s ON b.slot_id = s.id
      ORDER BY b.created_at DESC
    `);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Bookings Report");

    // Header Row
    worksheet.columns = [
      { header: "Booking ID", key: "id", width: 12 },
      { header: "User", key: "user_name", width: 20 },
      { header: "Location", key: "location_name", width: 25 },
      { header: "Slot", key: "slot_number", width: 10 },
      { header: "Vehicle Type", key: "vehicle_type", width: 15 },
      { header: "Vehicle Number", key: "vehicle_number", width: 20 },
      { header: "Date", key: "booking_date", width: 15 },
      { header: "Start Time", key: "start_time", width: 15 },
      { header: "Duration", key: "duration", width: 10 },
      { header: "Total Price", key: "total_price", width: 15 },
      { header: "Status", key: "status", width: 15 }
    ];

    // Add Rows
    bookings.forEach((booking) => {
      worksheet.addRow(booking);
    });

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=bookings_report.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.toggleUserStatus = async (req, res) => {
  const userId = req.params.id;
  const { is_active } = req.body;

  try {
    if (typeof is_active !== "boolean") {
      return res.status(400).json({
        message: "is_active must be true or false"
      });
    }

    const [user] = await db.promise().query(
      "SELECT id FROM users WHERE id = ?",
      [userId]
    );

    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    await db.promise().query(
      "UPDATE users SET is_active = ? WHERE id = ?",
      [is_active, userId]
    );

    res.json({
      message: is_active
        ? "User activated successfully"
        : "User blocked successfully"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
