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


-- Dumping database structure for ujang_ngopi
CREATE DATABASE IF NOT EXISTS `ujang_ngopi` /*!40100 DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci */;
USE `ujang_ngopi`;

-- Dumping structure for table ujang_ngopi.akun_karyawan
CREATE TABLE IF NOT EXISTS `akun_karyawan` (
  `id` int(11) NOT NULL,
  `fName` varchar(100) NOT NULL,
  `lName` varchar(100) NOT NULL,
  `username_login` varchar(50) NOT NULL,
  `password_login` varchar(255) NOT NULL,
  `avatar_url` longtext NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username_login` (`username_login`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table ujang_ngopi.akun_karyawan: ~0 rows (approximately)

-- Dumping structure for table ujang_ngopi.list_menu
CREATE TABLE IF NOT EXISTS `list_menu` (
  `id_menu` int(11) NOT NULL AUTO_INCREMENT,
  `nama_item` varchar(40) DEFAULT NULL,
  `label_item` varchar(40) DEFAULT NULL,
  `gambar_item` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `disc_perc` int(11) DEFAULT NULL,
  `id_kategori` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_menu`),
  KEY `fk_kategori` (`id_kategori`),
  CONSTRAINT `fk_kategori` FOREIGN KEY (`id_kategori`) REFERENCES `tabel_kategori` (`id_kategori`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table ujang_ngopi.list_menu: ~4 rows (approximately)
INSERT INTO `list_menu` (`id_menu`, `nama_item`, `label_item`, `gambar_item`, `price`, `disc_perc`, `id_kategori`) VALUES
	(1, 'kopi_gulaaren', 'Kopi Gula Aren', 'kopix.png', 14000.00, 20, 1),
	(2, 'matcha1', 'Matcha Original', 'matcha1.png', 15000.00, 25, 1),
	(3, 'matcha2', 'Matcha Manis', 'matcha2.png', 15000.00, 10, 1),
	(4, 'nasgor1', 'Nasi Goreng Spesial', 'nasgor1.png', 25000.00, 15, 2);

-- Dumping structure for table ujang_ngopi.order_history
CREATE TABLE IF NOT EXISTS `order_history` (
  `id` int(11) NOT NULL,
  `data_order` longtext DEFAULT '[]',
  `pay_via` enum('cash','qris') DEFAULT NULL,
  `pay_at` date DEFAULT curdate(),
  `status` enum('sukses','proses') DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table ujang_ngopi.order_history: ~0 rows (approximately)

-- Dumping structure for table ujang_ngopi.tabel_kategori
CREATE TABLE IF NOT EXISTS `tabel_kategori` (
  `id_kategori` int(11) NOT NULL AUTO_INCREMENT,
  `nama_kategori` varchar(100) NOT NULL,
  PRIMARY KEY (`id_kategori`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table ujang_ngopi.tabel_kategori: ~2 rows (approximately)
INSERT INTO `tabel_kategori` (`id_kategori`, `nama_kategori`) VALUES
	(1, 'Minuman'),
	(2, 'Makanan');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
