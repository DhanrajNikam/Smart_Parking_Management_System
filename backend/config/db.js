// const mysql = require("mysql2");

// const db = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,

//   // ✅ IMPORTANT: Set timezone to IST
//   timezone: "+05:30"
// });

// db.connect((err) => {
//   if (err) {
//     console.log("Database connection failed:", err);
//   } else {
//     console.log("MySQL Connected Successfully (IST Timezone)");
    
//   }
// });

// module.exports = db;




const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  // IST timezone
  timezone: "+05:30"
});

db.getConnection((err, connection) => {
  if (err) {
    console.log("Database connection failed:", err);
  } else {
    console.log("MySQL Connected Successfully (IST Timezone)");
    connection.release();
  }
});

module.exports = db;