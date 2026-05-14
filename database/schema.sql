-- Smart Parking System - Complete Database Schema

CREATE DATABASE IF NOT EXISTS smart_parking;
USE smart_parking;

-- ==========================================
-- 1. USERS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
phone_number VARCHAR(20) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user','admin') DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. PARKING LOCATIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS parking_locations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  total_slots INT NOT NULL DEFAULT 0,
  price_per_hour DECIMAL(10, 2) NOT NULL DEFAULT 40.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 3. SLOTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS slots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  location_id INT NOT NULL,
  slot_number VARCHAR(10) NOT NULL,
  status ENUM('available','occupied','reserved') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES parking_locations(id) ON DELETE CASCADE,
  UNIQUE KEY unique_slot (location_id, slot_number)
);

-- ==========================================
-- 4. BOOKINGS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_code VARCHAR(50) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  location_id INT NOT NULL,
  slot_id INT NOT NULL,
  vehicle_type ENUM('bike','car','truck') DEFAULT 'car',
  vehicle_number VARCHAR(20) NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration INT NOT NULL DEFAULT 1,
  total_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  status ENUM('pending','active','completed','cancelled') DEFAULT 'pending',
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (location_id) REFERENCES parking_locations(id) ON DELETE CASCADE,
  FOREIGN KEY (slot_id) REFERENCES slots(id) ON DELETE CASCADE
);

-- ==========================================
-- 5. PAYMENTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method ENUM('upi','card','cash') NOT NULL,
  status ENUM('success','failed','pending') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- ==========================================
-- 6. FAVORITES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  location_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (location_id) REFERENCES parking_locations(id) ON DELETE CASCADE,
  UNIQUE KEY unique_favorite (user_id, location_id)
);

-- ==========================================
-- 7. RATINGS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  booking_code VARCHAR(50) NOT NULL,
  location_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review TEXT,
  admin_reply TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (location_id) REFERENCES parking_locations(id) ON DELETE CASCADE,
  UNIQUE KEY unique_rating (user_id, booking_code)
);


-- ==========================================
-- 8. NOTIFICATIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS notifications (

  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  booking_id INT DEFAULT NULL,
  message TEXT NOT NULL,
  type ENUM('reminder','alert','info') DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- ==========================================
-- SUPPORT TICKETS (Support/Help Center)
-- ==========================================
CREATE TABLE IF NOT EXISTS support_tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_code VARCHAR(50) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  booking_id INT DEFAULT NULL,
  subject VARCHAR(200) NOT NULL,
  issue_type ENUM('Booking Issue','Refund Issue','Payment Issue','Slot/Parking Issue','Emergency Issue') NOT NULL,
  message TEXT NOT NULL,
  status ENUM('open','pending','resolved') DEFAULT 'open',
  admin_reply TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  INDEX idx_support_tickets_user (user_id),
  INDEX idx_support_tickets_status (status),
  INDEX idx_support_tickets_booking (booking_id)
);

-- ==========================================
-- WALLET + REFUND SYSTEM (Wallet Transactions + Refund Requests)
-- ==========================================


-- Add wallet column to users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS wallet DECIMAL(10,2) DEFAULT 0;

-- Wallet transaction history
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  booking_id INT DEFAULT NULL,
  amount DECIMAL(10,2) NOT NULL,
  type ENUM('credit','debit') NOT NULL,
  description VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  INDEX idx_wallet_transactions_user (user_id),
  INDEX idx_wallet_transactions_booking (booking_id)
);

-- Refund request workflow
CREATE TABLE IF NOT EXISTS refund_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  booking_id INT DEFAULT NULL,
  amount DECIMAL(10,2) NOT NULL,
  upi_id VARCHAR(100) DEFAULT NULL,
  account_number VARCHAR(50) DEFAULT NULL,
  ifsc_code VARCHAR(20) DEFAULT NULL,
  payment_method ENUM('upi','bank') NOT NULL,
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  reason VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  INDEX idx_refund_requests_user (user_id),
  INDEX idx_refund_requests_booking (booking_id)
);

-- ==========================================
-- INSERT DEFAULT ADMIN USER
-- ==========================================
INSERT IGNORE INTO users (id, name, email, phone_number, password, role, is_active) VALUES
(1, 'System Admin', 'admin@smartparking.com', '+0000000000', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', TRUE);


-- ==========================================
-- INSERT SAMPLE PARKING LOCATIONS
-- ==========================================
INSERT IGNORE INTO parking_locations (id, name, address, latitude, longitude, total_slots, price_per_hour) VALUES
(1, 'Central Mall Parking', 'Near Central Mall, Main Road', 19.9975, 73.7898, 20, 50.00),
(2, 'Railway Station Parking', 'Nashik Road Railway Station', 20.0115, 73.7902, 15, 30.00),
(3, 'City Center Parking', 'City Center Complex, MG Road', 19.9890, 73.7800, 25, 40.00);

-- ==========================================
-- INSERT SAMPLE SLOTS
-- ==========================================
INSERT IGNORE INTO slots (id, location_id, slot_number, status) VALUES
(1, 1, 'A1', 'available'), (2, 1, 'A2', 'available'), (3, 1, 'A3', 'occupied'),
(4, 1, 'A4', 'available'), (5, 1, 'B1', 'available'), (6, 1, 'B2', 'reserved'),
(7, 2, 'A1', 'available'), (8, 2, 'A2', 'available'), (9, 2, 'A3', 'available'),
(10, 2, 'B1', 'occupied'), (11, 2, 'B2', 'available'), (12, 3, 'A1', 'available'),
(13, 3, 'A2', 'available'), (14, 3, 'A3', 'available'), (15, 3, 'B1', 'available');

