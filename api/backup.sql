-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               10.4.34-MariaDB-log - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for sukoharjo_ujang_ngopi
CREATE DATABASE IF NOT EXISTS `sukoharjo_ujang_ngopi` /*!40100 DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci */;
USE `sukoharjo_ujang_ngopi`;

-- Dumping structure for table sukoharjo_ujang_ngopi.akun_karyawan
CREATE TABLE IF NOT EXISTS `akun_karyawan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fName` varchar(100) NOT NULL,
  `lName` varchar(100) NOT NULL,
  `username_login` varchar(50) NOT NULL,
  `password_login` varchar(255) NOT NULL,
  `avatar_url` longtext NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username_login` (`username_login`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table sukoharjo_ujang_ngopi.akun_karyawan: ~2 rows (approximately)
INSERT INTO `akun_karyawan` (`id`, `fName`, `lName`, `username_login`, `password_login`, `avatar_url`) VALUES
	(2, 'Ujang', 'Ananta', 'ujang', '$2b$10$UCgm8YH87djPoU8zTGcBWuWr./uHK9OlCb5zhLRQHFlW8hpEiJhhW', ''),
	(3, 'kevin', 'oj', 'kepin', '$2b$10$AmjvGw6n2KEG8tlN3b9DyOILq79znEA2rMnGxmXWKqfwJSI3RkCbq', '');

-- Dumping structure for table sukoharjo_ujang_ngopi.konfigurasi_cabang
CREATE TABLE IF NOT EXISTS `konfigurasi_cabang` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama_konfigurasi` varchar(50) NOT NULL,
  `VALUE` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nama_konfigurasi` (`nama_konfigurasi`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table sukoharjo_ujang_ngopi.konfigurasi_cabang: ~1 rows (approximately)
INSERT INTO `konfigurasi_cabang` (`id`, `nama_konfigurasi`, `VALUE`) VALUES
	(1, 'jumlah_kursi', 5);

-- Dumping structure for table sukoharjo_ujang_ngopi.list_menu
CREATE TABLE IF NOT EXISTS `list_menu` (
  `id_menu` int(11) NOT NULL AUTO_INCREMENT,
  `nama_item` varchar(40) DEFAULT NULL,
  `label_item` varchar(40) DEFAULT NULL,
  `gambar_item` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `disc_perc` int(11) DEFAULT NULL,
  `id_kategori` int(11) DEFAULT NULL,
  `desc_item` longtext DEFAULT NULL,
  PRIMARY KEY (`id_menu`),
  KEY `fk_kategori` (`id_kategori`),
  CONSTRAINT `fk_kategori` FOREIGN KEY (`id_kategori`) REFERENCES `tabel_kategori` (`id_kategori`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table sukoharjo_ujang_ngopi.list_menu: ~4 rows (approximately)
INSERT INTO `list_menu` (`id_menu`, `nama_item`, `label_item`, `gambar_item`, `price`, `disc_perc`, `id_kategori`, `desc_item`) VALUES
	(1, 'kopi_gulaaren', 'Kopi Gula Aren', '/uploads/1778040043853-506201.jpg', 14000.00, 20, 1, 'Make gula aren asli ga boong :)'),
	(2, 'matcha1', 'Matcha Original', '/uploads/1778040673288-583374.png', 15000.00, 25, 1, 'Rasanya pahit coy kek kenangan masa lalu :)'),
	(3, 'matcha2', 'Matcha Manis', '/uploads/1778040646963-503032.png', 15000.00, 10, 1, 'Manis seperti janji'),
	(4, 'nasgor1', 'Nasi Goreng Spesial', '/uploads/1778040600857-974690.png', 25000.00, 15, 2, 'Pedas kek omongan tetangga');

-- Dumping structure for table sukoharjo_ujang_ngopi.order_history
CREATE TABLE IF NOT EXISTS `order_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `data_order` longtext DEFAULT '[]',
  `pay_via` enum('cash','qris') DEFAULT NULL,
  `pay_at` date DEFAULT curdate(),
  `status` enum('sukses','proses') DEFAULT NULL,
  `payment_refcode` longtext DEFAULT NULL,
  `no_meja` varchar(20) DEFAULT NULL,
  `total_pay` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payment_refcode` (`payment_refcode`) USING HASH
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table sukoharjo_ujang_ngopi.order_history: ~0 rows (approximately)
INSERT INTO `order_history` (`id`, `data_order`, `pay_via`, `pay_at`, `status`, `payment_refcode`, `no_meja`, `total_pay`) VALUES
	(14, '[{"id_menu":1,"nama":"Kopi Gula Aren","qty":2,"price":11200},{"id_menu":2,"nama":"Matcha Original","qty":3,"price":11250},{"id_menu":4,"nama":"Nasi Goreng Spesial","qty":3,"price":21250},{"id_menu":3,"nama":"Matcha Manis","qty":4,"price":13500}]', 'qris', '2026-05-06', 'proses', 'PAYMENT-9NzHZAYHzo', '3', NULL),
	(15, '[{"id_menu":4,"nama":"Nasi Goreng Spesial","qty":2,"price":21250}]', 'qris', '2026-05-13', 'proses', 'PAYMENT-Rp0yLnEI3k', NULL, NULL);

-- Dumping structure for table sukoharjo_ujang_ngopi.tabel_kategori
CREATE TABLE IF NOT EXISTS `tabel_kategori` (
  `id_kategori` int(11) NOT NULL AUTO_INCREMENT,
  `nama_kategori` varchar(100) NOT NULL,
  PRIMARY KEY (`id_kategori`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table sukoharjo_ujang_ngopi.tabel_kategori: ~2 rows (approximately)
INSERT INTO `tabel_kategori` (`id_kategori`, `nama_kategori`) VALUES
	(1, 'Minuman'),
	(2, 'Makanan');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
