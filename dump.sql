-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: mysql-46e8e6c-reno-cercel.k.aivencloud.com    Database: newcitrashadowdb
-- ------------------------------------------------------
-- Server version	8.4.8

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2026_06_23_172730_create_suppliers_table',1),(5,'2026_06_23_181832_create_bahans_table',1),(6,'2026_06_24_020756_create_produks_table',1),(7,'2026_06_24_071346_create_mitras_table',1),(8,'2026_06_24_134335_create_harga_produks_table',1),(9,'2026_06_25_055013_create_asets_table',1),(10,'2026_06_25_154616_create_overheads_table',1),(11,'2026_06_25_172606_create_akuns_table',1),(12,'2026_06_26_050610_create_divisis_table',1),(13,'2026_06_26_121242_create_boms_table',1),(14,'2026_06_26_121252_create_detail_boms_table',1),(15,'2026_06_26_160342_create_t_jadwal_produksi_table',1),(16,'2026_06_26_160356_create_t_detail_jadwal_produksi_table',1),(17,'2026_06_26_160406_create_t_kebutuhan_bahan_table',1),(18,'2026_06_27_033238_create_t_so_table',1),(19,'2026_06_27_033318_create_t_so_detail_table',1),(20,'2026_06_28_160442_create_t_permintaan_pembelian_table',1),(21,'2026_06_28_160456_create_t_detail_pp_table',1),(22,'2026_06_29_004207_create_t_purchase_order_table',1),(23,'2026_06_29_004623_rename_termin_to_metode_beli_in_t_purchase_order_table',1),(24,'2026_06_29_004942_create_t_detail_po_table',1),(25,'2026_06_29_092209_create_t_pesanan_table',1),(26,'2026_06_29_092220_create_t_pesanan_detail_table',1),(27,'2026_06_29_135240_create_penjualans_table',1),(28,'2026_06_29_135241_create_penjualan_details_table',1),(29,'2026_06_30_140636_add_kategori_simpan_to_t_bahan_table',1),(30,'2026_06_30_140713_add_periode_to_t_permintaan_pembelian_table',1),(31,'2026_06_30_161103_create_penerimaan_bahans_table',1),(32,'2026_06_30_161120_create_detail_penerimaan_bahans_table',1),(33,'2026_07_01_002847_create_t_retur_pembelian_table',1),(34,'2026_07_01_002859_create_t_detail_retur_pembelian_table',1),(35,'2026_07_01_015403_create_t_hasil_produksi_table',1),(36,'2026_07_01_015412_create_t_pemakaian_bahan_table',1),(37,'2026_07_01_021016_create_t_kartu_persediaan_table',1),(38,'2026_07_01_033306_create_surat_jalans_table',1),(39,'2026_07_01_130400_create_t_retur_jual_table',1),(40,'2026_07_01_130430_create_t_retur_jual_detail_table',1),(41,'2026_07_02_070530_create_t_penyusutan_aset_table',1),(42,'2026_07_02_132008_create_t_transaksi_pembelian_table',1),(43,'2026_07_02_132015_create_t_detail_transaksi_pembelian_table',1),(44,'2026_07_04_134210_create_t_approval_pemakaian_bahan_table',1),(45,'2026_07_05_050850_create_hpp_cogm_tables',1),(46,'2026_07_05_061106_create_t_jurnal_table',1),(47,'2026_07_05_061132_create_t_jurnal_detail_table',1),(48,'2026_07_06_013619_create_t_hutang_usaha_table',1),(49,'2026_07_06_013651_create_t_pembayaran_hutang_table',1),(50,'2026_07_06_131804_create_piutangs_table',1),(51,'2026_07_06_141453_create_pelunasan_piutangs_table',1),(52,'2026_07_07_061344_create_perpanjangan_piutangs_table',1),(53,'2026_07_07_093045_create_konsinyasi_keluars_table',1),(54,'2026_07_07_094008_create_konsinyasi_keluar_details_table',1),(55,'2026_07_07_153429_create_konsinyasi_juals_table',1),(56,'2026_07_07_153522_create_konsinyasi_jual_details_table',1),(57,'2026_07_08_042059_create_retur_konsinyasis_table',1),(58,'2026_07_08_042132_create_retur_konsinyasi_details_table',1),(59,'2026_07_09_142802_add_keterangan_to_surat_jalan_and_jual_table_and_retur',1),(60,'2026_07_11_123127_create_utang_produksis_table',1),(61,'2026_07_12_0000_create_transaksi_pengeluarans_table',1),(62,'2026_07_14_220518_add_role_to_users_table',2);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('8a0W4diutgetclPFr2aRIErYKf9Ft5daZKiLnE7Z',1,'152.233.15.123','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiTDVUQWRvZVJkOTJ5Q0htUW85MTRsR2FnQ2xva1JQM0FTTXV1dXR0RSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MTt9',1784087970),('eGJzMk3qTpGE1UPwUPR9Z4par3gN0DTvsWLLaP4L',3,'152.233.15.120','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 OPR/133.0.0.0','YTo0OntzOjY6Il90b2tlbiI7czo0MDoiMjdqQkE1Tk8wNUJ3WHBOSVJtTmhiTzFSUU1YZWRYSGR6dVJ6VTRjTSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NTU6Imh0dHBzOi8vbmV3Y2l0cmEtc2hhZG93LXByb2R1Y3Rpb24udXAucmFpbHdheS5hcHAvbG9naW4iO3M6NToicm91dGUiO3M6NToibG9naW4iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX1zOjUwOiJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI7aTozO30=',1784130117),('IjqLaHXT7jyLpcCf41HK85Q2nUqxIaVeNoONyJNq',3,'152.233.15.123','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 OPR/133.0.0.0','YTo0OntzOjY6Il90b2tlbiI7czo0MDoiVzA0WHp6SEN0VFVGVlZoWXo1OWtMeWF0VnB1dXBLS1A3TDhkYmgwNSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NTU6Imh0dHBzOi8vbmV3Y2l0cmEtc2hhZG93LXByb2R1Y3Rpb24udXAucmFpbHdheS5hcHAvbG9naW4iO3M6NToicm91dGUiO3M6NToibG9naW4iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX1zOjUwOiJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI7aTozO30=',1784199717),('KjQHpSOTzGwgBH5ih2jU7vxTNet5jaBuZH7KyNND',3,'152.233.15.123','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 OPR/132.0.0.0','YTo0OntzOjY6Il90b2tlbiI7czo0MDoicThpeTJtSkZuMEZHVUFpRm5PREt3d2l3OU50ZWdITldzS1Y3TDVQcyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NTU6Imh0dHBzOi8vbmV3Y2l0cmEtc2hhZG93LXByb2R1Y3Rpb24udXAucmFpbHdheS5hcHAvbG9naW4iO3M6NToicm91dGUiO3M6NToibG9naW4iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX1zOjUwOiJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI7aTozO30=',1784094644);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_akun`
--

DROP TABLE IF EXISTS `t_akun`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_akun` (
  `id_akun` bigint unsigned NOT NULL AUTO_INCREMENT,
  `kode_akun` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama_akun` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kategori` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `saldo_normal` enum('Debit','Kredit') COLLATE utf8mb4_unicode_ci NOT NULL,
  `saldo_awal` decimal(15,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_akun`),
  UNIQUE KEY `t_akun_kode_akun_unique` (`kode_akun`),
  KEY `t_akun_kategori_index` (`kategori`)
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_akun`
--

LOCK TABLES `t_akun` WRITE;
/*!40000 ALTER TABLE `t_akun` DISABLE KEYS */;
INSERT INTO `t_akun` VALUES (1,'1001001','KAS','Aset Lancar','Debit',0.00,'2026-07-14 18:57:49','2026-07-14 18:57:49'),(2,'1001002','BANK','Aset Lancar','Debit',0.00,'2026-07-14 18:57:49','2026-07-14 18:57:49'),(3,'1001003','PIUTANG USAHA','Aset Lancar','Debit',0.00,'2026-07-14 18:57:49','2026-07-14 18:57:49'),(4,'1001004','PERSEDIAAN BAHAN BAKU','Aset Lancar','Debit',0.00,'2026-07-14 18:57:50','2026-07-14 18:57:50'),(5,'1001005','PERSEDIAAN BAHAN PENOLONG','Aset Lancar','Debit',0.00,'2026-07-14 18:57:50','2026-07-14 18:57:50'),(6,'1001006','PERSEDIAAN BARANG JADI','Aset Lancar','Debit',0.00,'2026-07-14 18:57:50','2026-07-14 18:57:50'),(7,'1001007','PERSEDIAAN BARANG KONSINYASI','Aset Lancar','Debit',0.00,'2026-07-14 18:57:51','2026-07-14 18:57:51'),(8,'1001008','PERSEDIAAN BARANG DALAM PROSES','Aset Lancar','Debit',0.00,'2026-07-14 18:57:51','2026-07-14 18:57:51'),(9,'1002001','ASET TETAP - PERALATAN','Aset Tetap','Debit',0.00,'2026-07-14 18:57:51','2026-07-14 18:57:51'),(10,'1002002','ASET TETAP - MESIN','Aset Tetap','Debit',0.00,'2026-07-14 18:57:52','2026-07-14 18:57:52'),(11,'1002003','ASET TETAP - KENDARAAN','Aset Tetap','Debit',0.00,'2026-07-14 18:57:52','2026-07-14 18:57:52'),(12,'1002004','ASET TETAP - BANGUNAN','Aset Tetap','Debit',0.00,'2026-07-14 18:57:52','2026-07-14 18:57:52'),(13,'1002005','ASET TETAP - TANAH','Aset Tetap','Debit',0.00,'2026-07-14 18:57:53','2026-07-14 18:57:53'),(14,'1002006','AKUMULASI DEPRESIASI - PERALATAN','Aset Tetap','Debit',0.00,'2026-07-14 18:57:53','2026-07-14 18:57:53'),(15,'1002007','AKUMULASI DEPRESIASI - MESIN','Aset Tetap','Debit',0.00,'2026-07-14 18:57:53','2026-07-14 18:57:53'),(16,'1002008','AKUMULASI DEPRESIASI - KENDARAAN','Aset Tetap','Debit',0.00,'2026-07-14 18:57:54','2026-07-14 18:57:54'),(17,'1002009','AKUMULASI DEPRESIASI - BANGUNAN','Aset Tetap','Debit',0.00,'2026-07-14 18:57:54','2026-07-14 18:57:54'),(18,'2001001','HUTANG USAHA','Liabilitas','Kredit',0.00,'2026-07-14 18:57:55','2026-07-14 18:57:55'),(19,'2001002','HUTANG GAJI PRODUKSI','Liabilitas','Kredit',0.00,'2026-07-14 18:57:55','2026-07-14 18:57:55'),(20,'2001003','HUTANG OVERHEAD PRODUKSI','Liabilitas','Kredit',0.00,'2026-07-14 18:57:55','2026-07-14 18:57:55'),(21,'3001001','MODAL PEMILIK','Ekuitas','Kredit',0.00,'2026-07-14 18:57:56','2026-07-14 18:57:56'),(22,'3002001','LABA DITAHAN','Ekuitas','Kredit',0.00,'2026-07-14 18:57:56','2026-07-14 18:57:56'),(23,'4001001','PENJUALAN - TAHU BAKSO','Pendapatan','Kredit',0.00,'2026-07-14 18:57:56','2026-07-14 18:57:56'),(24,'4001002','PENJUALAN - BANDENG','Pendapatan','Kredit',0.00,'2026-07-14 18:57:57','2026-07-14 18:57:57'),(25,'4001003','PENJUALAN - OTAK-OTAK','Pendapatan','Kredit',0.00,'2026-07-14 18:57:57','2026-07-14 18:57:57'),(26,'4001004','PENJUALAN - PEPES','Pendapatan','Kredit',0.00,'2026-07-14 18:57:57','2026-07-14 18:57:57'),(27,'4001005','RETUR PENJUALAN','Pendapatan','Kredit',0.00,'2026-07-14 18:57:58','2026-07-14 18:57:58'),(28,'4001006','DISKON PENJUALAN','Pendapatan','Debit',0.00,'2026-07-14 18:57:58','2026-07-14 18:57:58'),(29,'5001001','HPP','Beban Pokok Penjualan','Debit',0.00,'2026-07-14 18:57:58','2026-07-14 18:57:58'),(30,'5001002','RETUR PEMBELIAN','Beban Pokok Penjualan','Debit',0.00,'2026-07-14 18:57:59','2026-07-14 18:57:59'),(31,'6001001','BEBAN GAJI DISTRIBUSI','Beban Operasional','Debit',0.00,'2026-07-14 18:57:59','2026-07-14 18:57:59'),(32,'6001002','BEBAN CETAKAN BUKU, PO','Beban Operasional','Debit',0.00,'2026-07-14 18:58:00','2026-07-14 18:58:00'),(33,'6001003','BEBAN PENGIRIMAN','Beban Operasional','Debit',0.00,'2026-07-14 18:58:00','2026-07-14 18:58:00'),(34,'6001004','BEBAN BBM TOL PARKIR','Beban Operasional','Debit',0.00,'2026-07-14 18:58:00','2026-07-14 18:58:00'),(35,'6001005','BEBAN PEMELIHARAAN KENDARAAN','Beban Operasional','Debit',0.00,'2026-07-14 18:58:01','2026-07-14 18:58:01'),(36,'6001006','BEBAN KERUSAKAN BARANG','Beban Operasional','Debit',0.00,'2026-07-14 18:58:02','2026-07-14 18:58:02'),(37,'6001007','BEBAN PERBAIKAN PRODUK','Beban Operasional','Debit',0.00,'2026-07-14 18:58:02','2026-07-14 18:58:02'),(38,'6001008','BEBAN SELISIH PERSEDIAAN','Beban Operasional','Debit',0.00,'2026-07-14 18:58:03','2026-07-14 18:58:03'),(39,'6002001','BEBAN GAJI MARKETING','Beban Operasional','Debit',0.00,'2026-07-14 18:58:03','2026-07-14 18:58:03'),(40,'6002002','BEBAN PROMOSI, SAMPEL','Beban Operasional','Debit',0.00,'2026-07-14 18:58:03','2026-07-14 18:58:03'),(41,'6003001','BEBAN GAJI DIREKSI','Beban Operasional','Debit',0.00,'2026-07-14 18:58:04','2026-07-14 18:58:04'),(42,'6003002','BEBAN GAJI KARYAWAN','Beban Operasional','Debit',0.00,'2026-07-14 18:58:04','2026-07-14 18:58:04'),(43,'6003003','BEBAN THR','Beban Operasional','Debit',0.00,'2026-07-14 18:58:05','2026-07-14 18:58:05'),(44,'6003004','BEBAN ATK','Beban Operasional','Debit',0.00,'2026-07-14 18:58:05','2026-07-14 18:58:05'),(45,'6003005','BEBAN FOTOCOPY & CETAKAN','Beban Operasional','Debit',0.00,'2026-07-14 18:58:07','2026-07-14 18:58:07'),(46,'6006001','BEBAN FASILITAS KANTOR','Beban Operasional','Debit',0.00,'2026-07-14 18:58:09','2026-07-14 18:58:09'),(47,'6006002','BEBAN FASILITAS KENDARAAN','Beban Operasional','Debit',0.00,'2026-07-14 18:58:09','2026-07-14 18:58:09'),(48,'6006003','BEBAN ENTERTAIN','Beban Operasional','Debit',0.00,'2026-07-14 18:58:10','2026-07-14 18:58:10'),(49,'6006004','BEBAN KOMUNIKASI','Beban Operasional','Debit',0.00,'2026-07-14 18:58:10','2026-07-14 18:58:10'),(50,'6006005','BEBAN PENYUSUTAN PERALATAN','Beban Operasional','Debit',0.00,'2026-07-14 18:58:10','2026-07-14 18:58:10'),(51,'6006006','BEBAN PENYUSUTAN MESIN','Beban Operasional','Debit',0.00,'2026-07-14 18:58:11','2026-07-14 18:58:11'),(52,'6006007','BEBAN PENYUSUTAN KENDARAAN','Beban Operasional','Debit',0.00,'2026-07-14 18:58:11','2026-07-14 18:58:11'),(53,'6006008','BEBAN PENYUSUTAN BANGUNAN','Beban Operasional','Debit',0.00,'2026-07-14 18:58:12','2026-07-14 18:58:12'),(54,'6006009','BEBAN OPERASIONAL LAIN-LAIN','Beban Operasional','Debit',0.00,'2026-07-14 18:58:12','2026-07-14 18:58:12'),(55,'8001000','PENDAPATAN SELISIH PERSEDIAAN','Penghasilan Lain-lain','Kredit',0.00,'2026-07-14 18:58:12','2026-07-14 18:58:12'),(56,'8002000','PENDAPATAN ADMINISTRASI BANK','Penghasilan Lain-lain','Kredit',0.00,'2026-07-14 18:58:13','2026-07-14 18:58:13'),(57,'9001000','BEBAN PAJAK BUMI DAN BANGUNAN','Beban Lain-lain','Debit',0.00,'2026-07-14 18:58:13','2026-07-14 18:58:13'),(58,'9002000','BEBAN PAJAK PPH 4 AYAT 2 FINAL','Beban Lain-lain','Debit',0.00,'2026-07-14 18:58:13','2026-07-14 18:58:13'),(59,'9003000','BEBAN PAJAK PPH 23','Beban Lain-lain','Debit',0.00,'2026-07-14 18:58:14','2026-07-14 18:58:14');
/*!40000 ALTER TABLE `t_akun` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_approval_pemakaian_bahan`
--

DROP TABLE IF EXISTS `t_approval_pemakaian_bahan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_approval_pemakaian_bahan` (
  `id_approval` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_pemakaian` bigint unsigned NOT NULL,
  `id_kartupers_bahan` bigint unsigned NOT NULL,
  `qty_standar` decimal(15,2) NOT NULL DEFAULT '0.00',
  `harga_standar` decimal(15,2) NOT NULL DEFAULT '0.00',
  `qty_aktual` decimal(15,2) NOT NULL DEFAULT '0.00',
  `harga_ratarata_aktual` decimal(15,2) NOT NULL DEFAULT '0.00',
  `total_aktual` decimal(15,2) NOT NULL DEFAULT '0.00',
  `status_approval` enum('pending','approved') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `komentar_admin` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tanggal_approval` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_approval`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_approval_pemakaian_bahan`
--

LOCK TABLES `t_approval_pemakaian_bahan` WRITE;
/*!40000 ALTER TABLE `t_approval_pemakaian_bahan` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_approval_pemakaian_bahan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_aset`
--

DROP TABLE IF EXISTS `t_aset`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_aset` (
  `id_aset` bigint unsigned NOT NULL AUTO_INCREMENT,
  `kode_aset` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama_aset` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipe_aset` enum('Mesin','Kendaraan','Peralatan') COLLATE utf8mb4_unicode_ci NOT NULL,
  `tanggal_beli` date NOT NULL,
  `harga_perolehan` decimal(15,2) NOT NULL,
  `umur_ekonomis` int NOT NULL,
  `nilai_sisa` decimal(15,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_aset`),
  UNIQUE KEY `t_aset_kode_aset_unique` (`kode_aset`)
) ENGINE=InnoDB AUTO_INCREMENT=167 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_aset`
--

LOCK TABLES `t_aset` WRITE;
/*!40000 ALTER TABLE `t_aset` DISABLE KEYS */;
INSERT INTO `t_aset` VALUES (1,'AST-001','TV 17 Ich','Peralatan','2020-01-01',698000.00,8,0.00,'2026-07-14 18:58:33','2026-07-14 18:58:33'),(2,'AST-002','Wifi Indihome','Peralatan','2020-01-01',400000.00,4,0.00,'2026-07-14 18:58:33','2026-07-14 18:58:33'),(3,'AST-003','Printer Epson L3110','Peralatan','2020-01-01',2575000.00,4,0.00,'2026-07-14 18:58:33','2026-07-14 18:58:33'),(4,'AST-004','Telepon Panasonic','Peralatan','2020-01-01',200000.00,4,0.00,'2026-07-14 18:58:34','2026-07-14 18:58:34'),(5,'AST-005','Meja Kayu Kerja - 1 (Topan)','Peralatan','2020-01-01',220000.00,4,0.00,'2026-07-14 18:58:34','2026-07-14 18:58:34'),(6,'AST-006','Meja Kayu Kerja - 2 (Acc)','Peralatan','2020-01-01',220000.00,4,0.00,'2026-07-14 18:58:34','2026-07-14 18:58:34'),(7,'AST-007','Kursi Kerja - Biru','Peralatan','2020-01-01',499000.00,4,0.00,'2026-07-14 18:58:35','2026-07-14 18:58:35'),(8,'AST-008','Kursi Kerja - Merah','Peralatan','2020-01-01',499000.00,4,0.00,'2026-07-14 18:58:35','2026-07-14 18:58:35'),(9,'AST-009','Rak Dokumen Kantor (Aktif)','Peralatan','2020-01-01',1500000.00,4,0.00,'2026-07-14 18:58:35','2026-07-14 18:58:35'),(10,'AST-010','Lemari Dokumen Kantor (Aktif)','Peralatan','2020-01-01',650000.00,4,0.00,'2026-07-14 18:58:36','2026-07-14 18:58:36'),(11,'AST-011','Lemari Perlengkapan Produksi (Aktif)','Peralatan','2020-01-01',650000.00,4,0.00,'2026-07-14 18:58:36','2026-07-14 18:58:36'),(12,'AST-012','Kulkas Samsung 1 Pintu','Peralatan','2020-01-01',2226000.00,8,0.00,'2026-07-14 18:58:36','2026-07-14 18:58:36'),(13,'AST-013','Loker Produksi','Peralatan','2020-01-01',600000.00,4,0.00,'2026-07-14 18:58:37','2026-07-14 18:58:37'),(14,'AST-014','Etalase Kaca Panjang','Peralatan','2020-01-01',2285000.00,4,0.00,'2026-07-14 18:58:37','2026-07-14 18:58:37'),(15,'AST-015','Korden Plastik (4 set)','Peralatan','2020-01-01',3000000.00,4,0.00,'2026-07-14 18:58:37','2026-07-14 18:58:37'),(16,'AST-016','Timbangan Digital - Toko','Peralatan','2020-01-01',1100000.00,4,0.00,'2026-07-14 18:58:38','2026-07-14 18:58:38'),(17,'AST-017','CCTV -1 (4 unit)','Peralatan','2020-01-01',2877600.00,4,0.00,'2026-07-14 18:58:38','2026-07-14 18:58:38'),(18,'AST-018','Alat Kasir Toko','Peralatan','2020-01-01',2350000.00,4,0.00,'2026-07-14 18:58:38','2026-07-14 18:58:38'),(19,'AST-019','Meja Kasir Toko','Peralatan','2020-01-01',2700000.00,4,0.00,'2026-07-14 18:58:39','2026-07-14 18:58:39'),(20,'AST-020','Chiller Toko','Peralatan','2020-01-01',11000000.00,8,0.00,'2026-07-14 18:58:39','2026-07-14 18:58:39'),(21,'AST-021','Rak Merah Toko (2 unit)','Peralatan','2020-01-01',2000000.00,4,0.00,'2026-07-14 18:58:39','2026-07-14 18:58:39'),(22,'AST-022','Meja Putih Toko','Peralatan','2020-01-01',410000.00,4,0.00,'2026-07-14 18:58:40','2026-07-14 18:58:40'),(23,'AST-023','Ex House (2 unit)','Peralatan','2020-01-01',618000.00,4,0.00,'2026-07-14 18:58:40','2026-07-14 18:58:40'),(24,'AST-024','Kursi Coklat (3 unit)','Peralatan','2020-01-01',1230000.00,4,0.00,'2026-07-14 18:58:40','2026-07-14 18:58:40'),(25,'AST-025','Kursi Napoly (3 unit)','Peralatan','2020-01-01',499000.00,4,0.00,'2026-07-14 18:58:41','2026-07-14 18:58:41'),(26,'AST-026','Rak Piring','Peralatan','2020-01-01',790000.00,4,0.00,'2026-07-14 18:58:41','2026-07-14 18:58:41'),(27,'AST-027','Insect Killer','Peralatan','2020-01-01',400000.00,4,0.00,'2026-07-14 18:58:42','2026-07-14 18:58:42'),(28,'AST-028','Blender - Cosmos','Peralatan','2020-01-01',636000.00,4,0.00,'2026-07-14 18:58:42','2026-07-14 18:58:42'),(29,'AST-029','Blender - Qxone','Peralatan','2020-01-01',636000.00,4,0.00,'2026-07-14 18:58:43','2026-07-14 18:58:43'),(30,'AST-030','Blender - Fomac','Peralatan','2020-01-01',636000.00,4,0.00,'2026-07-14 18:58:43','2026-07-14 18:58:43'),(31,'AST-031','Meja Besi - 1 (5 unit)','Peralatan','2020-01-01',2500000.00,8,0.00,'2026-07-14 18:58:44','2026-07-14 18:58:44'),(32,'AST-032','Tempat P3k','Peralatan','2020-01-01',498000.00,4,0.00,'2026-07-14 18:58:44','2026-07-14 18:58:44'),(33,'AST-033','Tabung Pemadam Kebakaran','Peralatan','2020-01-01',525000.00,4,0.00,'2026-07-14 18:58:44','2026-07-14 18:58:44'),(34,'AST-034','Rak Tahu (2 unit)','Peralatan','2020-01-01',1200000.00,4,0.00,'2026-07-14 18:58:45','2026-07-14 18:58:45'),(35,'AST-035','Rak Kemasan','Peralatan','2020-01-01',800000.00,4,0.00,'2026-07-14 18:58:45','2026-07-14 18:58:45'),(36,'AST-036','Meja Putih Ruang Packing','Peralatan','2020-01-01',620000.00,4,0.00,'2026-07-14 18:58:46','2026-07-14 18:58:46'),(37,'AST-037','Trolli','Peralatan','2020-01-01',700000.00,8,0.00,'2026-07-14 18:58:47','2026-07-14 18:58:47'),(38,'AST-038','Rak Bandeng (2 unit)','Peralatan','2020-01-01',830000.00,4,0.00,'2026-07-14 18:58:48','2026-07-14 18:58:48'),(39,'AST-039','Meja Putih Ruang Bumbu','Peralatan','2020-01-01',400000.00,4,0.00,'2026-07-14 18:58:48','2026-07-14 18:58:48'),(40,'AST-040','Mesin Saelae','Peralatan','2020-01-01',4500000.00,8,0.00,'2026-07-14 18:58:49','2026-07-14 18:58:49'),(41,'AST-041','Lemari Bumbu 3 Pintu','Peralatan','2020-01-01',1260000.00,4,0.00,'2026-07-14 18:58:49','2026-07-14 18:58:49'),(42,'AST-042','Kompor Gas Rinai 1 Tungku','Peralatan','2020-01-01',289300.00,8,0.00,'2026-07-14 18:58:50','2026-07-14 18:58:50'),(43,'AST-043','Kompor Gas Rinai 2 Tungku','Peralatan','2020-01-01',473500.00,8,0.00,'2026-07-14 18:58:50','2026-07-14 18:58:50'),(44,'AST-044','Kompor Gas Racket Hock','Peralatan','2020-01-01',473500.00,8,0.00,'2026-07-14 18:58:51','2026-07-14 18:58:51'),(45,'AST-045','Kipas Angin Duduk (3 unit)','Peralatan','2020-01-01',1617000.00,4,0.00,'2026-07-14 18:58:51','2026-07-14 18:58:51'),(46,'AST-046','Kipas Angin Berdiri (2 unit)','Peralatan','2020-01-01',830000.00,4,0.00,'2026-07-14 18:58:52','2026-07-14 18:58:52'),(47,'AST-047','AC Sharp (2 unit)','Peralatan','2020-01-01',5650000.00,4,0.00,'2026-07-14 18:58:52','2026-07-14 18:58:52'),(48,'AST-048','AC Skem','Peralatan','2020-01-01',2100000.00,4,0.00,'2026-07-14 18:58:52','2026-07-14 18:58:52'),(49,'AST-049','Cooler Box Merah (4 unit)','Peralatan','2020-01-01',1920000.00,4,0.00,'2026-07-14 18:58:53','2026-07-14 18:58:53'),(50,'AST-050','Air Fryer Manual (Dusem)','Peralatan','2021-01-01',849900.00,4,0.00,'2026-07-14 18:58:53','2026-07-14 18:58:53'),(51,'AST-051','Pintu Roolling Dor','Peralatan','2021-01-01',3100000.00,4,0.00,'2026-07-14 18:58:53','2026-07-14 18:58:53'),(52,'AST-052','Laptop - Thosiba','Peralatan','2021-01-01',4100000.00,4,0.00,'2026-07-14 18:58:54','2026-07-14 18:58:54'),(53,'AST-053','Freezer Modena MD-20W','Peralatan','2021-01-01',2035000.00,4,0.00,'2026-07-14 18:58:54','2026-07-14 18:58:54'),(54,'AST-054','Langseng Maspion','Peralatan','2020-01-01',530000.00,4,0.00,'2026-07-14 18:58:54','2026-07-14 18:58:54'),(55,'AST-055','Alat pemotong kertas Kenko','Peralatan','2020-01-01',300000.00,4,0.00,'2026-07-14 18:58:55','2026-07-14 18:58:55'),(56,'AST-056','Langseng 5 set','Peralatan','2020-01-01',1350000.00,4,0.00,'2026-07-14 18:58:55','2026-07-14 18:58:55'),(57,'AST-057','Panci Presto Nagami 75 Ltr','Peralatan','2020-01-01',2450000.00,4,0.00,'2026-07-14 18:58:55','2026-07-14 18:58:55'),(58,'AST-058','Loyang + tatakan (5 set)','Peralatan','2020-01-01',550000.00,4,0.00,'2026-07-14 18:58:56','2026-07-14 18:58:56'),(59,'AST-059','Panci Presto Nagami 75 Ltr','Peralatan','2020-01-01',2450000.00,4,0.00,'2026-07-14 18:58:56','2026-07-14 18:58:56'),(60,'AST-060','Loyang + tatakan (5 set)','Peralatan','2020-01-01',575000.00,4,0.00,'2026-07-14 18:58:57','2026-07-14 18:58:57'),(61,'AST-061','Loker 5 pintu (2 unit)','Peralatan','2020-01-01',2300000.00,4,0.00,'2026-07-14 18:58:57','2026-07-14 18:58:57'),(62,'AST-062','AC GREE 1/2 PK','Peralatan','2020-01-01',3000000.00,4,0.00,'2026-07-14 18:58:58','2026-07-14 18:58:58'),(63,'AST-063','Blower','Peralatan','2020-01-01',350000.00,4,0.00,'2026-07-14 18:58:58','2026-07-14 18:58:58'),(64,'AST-064','Heat Gun Makita','Peralatan','2020-01-01',525000.00,4,0.00,'2026-07-14 18:58:59','2026-07-14 18:58:59'),(65,'AST-065','Kompor raket Win Gas 2 pcs + regulator','Peralatan','2020-01-01',1120000.00,4,0.00,'2026-07-14 18:58:59','2026-07-14 18:58:59'),(66,'AST-066','Panci Presto Nagami 2 pcs','Peralatan','2020-01-01',4900000.00,4,0.00,'2026-07-14 18:59:00','2026-07-14 18:59:00'),(67,'AST-067','Loyang + tatakan panci presto (10 unit)','Peralatan','2020-01-01',1100000.00,4,0.00,'2026-07-14 18:59:00','2026-07-14 18:59:00'),(68,'AST-068','Wastafel,tempat sabun,sifon botol','Peralatan','2020-01-01',451000.00,4,0.00,'2026-07-14 18:59:01','2026-07-14 18:59:01'),(69,'AST-069','Laptop Lenovo+mouse','Peralatan','2020-01-01',3235000.00,4,0.00,'2026-07-14 18:59:01','2026-07-14 18:59:01'),(70,'AST-070','HP I-Phone XR RED  64 GB','Peralatan','2020-01-01',4600000.00,4,0.00,'2026-07-14 18:59:02','2026-07-14 18:59:02'),(71,'AST-071','Perlengkapan Tik Tok (microfon,lampu,payung)','Peralatan','2020-01-01',1472000.00,4,0.00,'2026-07-14 18:59:02','2026-07-14 18:59:02'),(72,'AST-072','Basket 36 pcs + palet plastik 5 pcs ruang karantina','Peralatan','2020-01-01',2160000.00,4,0.00,'2026-07-14 18:59:02','2026-07-14 18:59:02'),(73,'AST-073','Timbangan Digital','Peralatan','2020-01-01',180000.00,4,0.00,'2026-07-14 18:59:03','2026-07-14 18:59:03'),(74,'AST-074','Electric Food Processor','Peralatan','2020-01-01',905000.00,4,0.00,'2026-07-14 18:59:03','2026-07-14 18:59:03'),(75,'AST-075','Blender Kaca Cosmor','Peralatan','2020-01-01',335000.00,4,0.00,'2026-07-14 18:59:03','2026-07-14 18:59:03'),(76,'AST-076','Komputer Conten Creator','Peralatan','2020-01-01',5000000.00,4,0.00,'2026-07-14 18:59:04','2026-07-14 18:59:04'),(77,'AST-077','HP Samsung A236 5G silver','Peralatan','2020-01-01',3999000.00,4,0.00,'2026-07-14 18:59:04','2026-07-14 18:59:04'),(78,'AST-078','Kompor + rak pendek 2 pcs','Peralatan','2020-01-01',1210000.00,4,0.00,'2026-07-14 18:59:04','2026-07-14 18:59:04'),(79,'AST-079','Heat Gun Makita 6002','Peralatan','2020-01-01',525000.00,4,0.00,'2026-07-14 18:59:05','2026-07-14 18:59:05'),(80,'AST-080','Monitor LG','Peralatan','2020-01-01',1250000.00,4,0.00,'2026-07-14 18:59:05','2026-07-14 18:59:05'),(81,'AST-081','Srewdriver JLD','Peralatan','2020-01-01',554800.00,4,0.00,'2026-07-14 18:59:07','2026-07-14 18:59:07'),(82,'AST-082','Lemari LH-0704 + Locker Pasifik','Peralatan','2020-01-01',1650000.00,4,0.00,'2026-07-14 18:59:08','2026-07-14 18:59:08'),(83,'AST-083','KURSI STAFF','Peralatan','2020-01-01',550000.00,4,0.00,'2026-07-14 18:59:09','2026-07-14 18:59:09'),(84,'AST-084','MEJA 1/2 BIRO','Peralatan','2020-01-01',875000.00,4,0.00,'2026-07-14 18:59:10','2026-07-14 18:59:10'),(85,'AST-085','KURSI SUSUN HITAM (2 unit)','Peralatan','2020-01-01',720000.00,4,0.00,'2026-07-14 18:59:10','2026-07-14 18:59:10'),(86,'AST-086','DISPENSER MIYAKO','Peralatan','2020-01-01',890000.00,4,0.00,'2026-07-14 18:59:11','2026-07-14 18:59:11'),(87,'AST-087','MT Volans','Peralatan','2020-01-01',875000.00,4,0.00,'2026-07-14 18:59:11','2026-07-14 18:59:11'),(88,'AST-088','MT Pasific','Peralatan','2020-01-01',475000.00,4,0.00,'2026-07-14 18:59:12','2026-07-14 18:59:12'),(89,'AST-089','AC GREE 1/2 PK','Peralatan','2020-01-01',3350000.00,4,0.00,'2026-07-14 18:59:12','2026-07-14 18:59:12'),(90,'AST-090','SOFABED HITAM','Peralatan','2020-01-01',2650000.00,4,0.00,'2026-07-14 18:59:12','2026-07-14 18:59:12'),(91,'AST-091','Laptop Asus Bu Sari','Peralatan','2020-01-01',4500000.00,4,0.00,'2026-07-14 18:59:13','2026-07-14 18:59:13'),(92,'AST-092','CPU Ica','Peralatan','2020-01-01',2200000.00,4,0.00,'2026-07-14 18:59:13','2026-07-14 18:59:13'),(93,'AST-093','Exhaust Fan Extra 300w','Peralatan','2020-01-01',1790100.00,4,0.00,'2026-07-14 18:59:13','2026-07-14 18:59:13'),(94,'AST-094','Meja Tulis 1/2 Biro Optima Maple Bu Sari','Peralatan','2020-01-01',875000.00,4,0.00,'2026-07-14 18:59:14','2026-07-14 18:59:14'),(95,'AST-095','Kitchen Set + Jasa Pasang untuk Dapur Atas','Peralatan','2020-01-01',1260000.00,4,0.00,'2026-07-14 18:59:14','2026-07-14 18:59:14'),(96,'AST-096','Wadah Box Ember','Peralatan','2020-01-01',1235000.00,4,0.00,'2026-07-14 18:59:14','2026-07-14 18:59:14'),(97,'AST-097','Gorden Plastik ruang produksi','Peralatan','2020-01-01',1650000.00,4,0.00,'2026-07-14 18:59:15','2026-07-14 18:59:15'),(98,'AST-098','Camera CCTV 2 unit + Perlengkapan','Peralatan','2020-01-01',698000.00,4,0.00,'2026-07-14 18:59:15','2026-07-14 18:59:15'),(99,'AST-099','CKE-Ceiling Fan 1 unit','Peralatan','2020-01-01',597000.00,4,0.00,'2026-07-14 18:59:15','2026-07-14 18:59:15'),(100,'AST-100','CKE-Exhaust Fan Std Shut 1 unit','Peralatan','2020-01-01',601000.00,4,0.00,'2026-07-14 18:59:16','2026-07-14 18:59:16'),(101,'AST-101','Wastafel 1 unit','Peralatan','2020-01-01',294900.00,4,0.00,'2026-07-14 18:59:16','2026-07-14 18:59:16'),(102,'AST-102','Curtain','Peralatan','2020-01-01',4550000.00,4,0.00,'2026-07-14 18:59:17','2026-07-14 18:59:17'),(103,'AST-103','Stiker Film pelapis kaca','Peralatan','2020-01-01',673100.00,4,0.00,'2026-07-14 18:59:17','2026-07-14 18:59:17'),(104,'AST-104','Tempat sampah Injak Besar','Peralatan','2020-01-01',350000.00,4,0.00,'2026-07-14 18:59:17','2026-07-14 18:59:17'),(105,'AST-105','Wastafel Keramik Area Karyawan','Peralatan','2020-01-01',300000.00,4,0.00,'2026-07-14 18:59:18','2026-07-14 18:59:18'),(106,'AST-106','Kawat Kasa Ventilasi Gudang Bumbu','Peralatan','2020-01-01',400000.00,4,0.00,'2026-07-14 18:59:18','2026-07-14 18:59:18'),(107,'AST-107','Palet plastik (5 unit)','Peralatan','2020-01-01',500000.00,4,0.00,'2026-07-14 18:59:19','2026-07-14 18:59:19'),(108,'AST-108','Palet Kayu (5 unit)','Peralatan','2020-01-01',300000.00,4,0.00,'2026-07-14 18:59:19','2026-07-14 18:59:19'),(109,'AST-109','Besi Alas Penyangga Freezer BB Bandeng','Peralatan','2020-01-01',1500000.00,4,0.00,'2026-07-14 18:59:19','2026-07-14 18:59:19'),(110,'AST-110','Pisau Mitochiba Chopper 2 pcs','Peralatan','2020-01-01',317500.00,4,0.00,'2026-07-14 18:59:20','2026-07-14 18:59:20'),(111,'AST-111','Mesin Absensi','Peralatan','2020-01-01',498000.00,4,0.00,'2026-07-14 18:59:20','2026-07-14 18:59:20'),(112,'AST-112','Cold Storage','Peralatan','2020-01-01',75202500.00,4,0.00,'2026-07-14 18:59:20','2026-07-14 18:59:20'),(113,'AST-113','Bak Cuci Bandeng','Peralatan','2020-01-01',8500000.00,4,0.00,'2026-07-14 18:59:21','2026-07-14 18:59:21'),(114,'AST-114','Filter Air + Wadahnya 1 Set','Peralatan','2020-01-01',230000.00,4,0.00,'2026-07-14 18:59:21','2026-07-14 18:59:21'),(115,'AST-115','Rak Stainless 4 Pintu','Peralatan','2020-01-01',20000000.00,4,0.00,'2026-07-14 18:59:22','2026-07-14 18:59:22'),(116,'AST-116','Loyang Stainless','Peralatan','2020-01-01',10500000.00,4,0.00,'2026-07-14 18:59:22','2026-07-14 18:59:22'),(117,'AST-117','Meja Stainless (2 unit)','Peralatan','2020-01-01',5000000.00,4,0.00,'2026-07-14 18:59:22','2026-07-14 18:59:22'),(118,'AST-118','Kipas Angin CKE','Peralatan','2020-01-01',1321450.00,4,0.00,'2026-07-14 18:59:23','2026-07-14 18:59:23'),(119,'AST-119','Pintu Aluminium 4 unit (Ruko)','Peralatan','2020-01-01',1600000.00,4,0.00,'2026-07-14 18:59:23','2026-07-14 18:59:23'),(120,'AST-120','Sofa Puff Smook Merah 1 unit (Ruko)','Peralatan','2020-01-01',1300000.00,4,0.00,'2026-07-14 18:59:23','2026-07-14 18:59:23'),(121,'AST-121','Rak Double T 3 unit (Ruko)','Peralatan','2020-01-01',1050000.00,4,0.00,'2026-07-14 18:59:24','2026-07-14 18:59:24'),(122,'AST-122','Meja Tulis Expo 1 unit (Ruko)','Peralatan','2020-01-01',775000.00,4,0.00,'2026-07-14 18:59:24','2026-07-14 18:59:24'),(123,'AST-123','AC LG 2 PK 1 unit (Ruko)','Peralatan','2020-01-01',5500000.00,4,0.00,'2026-07-14 18:59:24','2026-07-14 18:59:24'),(124,'AST-124','AC CHANGHONG 2 PK 1 unit (Ruko)','Peralatan','2020-01-01',5000000.00,4,0.00,'2026-07-14 18:59:25','2026-07-14 18:59:25'),(125,'AST-125','Bangku Sandar Rotan 20 unit (Ruko)','Peralatan','2020-01-01',2060000.00,4,0.00,'2026-07-14 18:59:25','2026-07-14 18:59:25'),(126,'AST-126','Kusen Putih 4 + Jendela Kaca + 2 Pintu Swing (Ruko)','Peralatan','2020-01-01',6500000.00,4,0.00,'2026-07-14 18:59:26','2026-07-14 18:59:26'),(127,'AST-127','Cat + Perlengkapan Listrik + Vinyl (Ruko)','Peralatan','2020-01-01',5616000.00,4,0.00,'2026-07-14 18:59:27','2026-07-14 18:59:27'),(128,'AST-128','Dispenser portable Maspion 1 unit','Peralatan','2020-01-01',125000.00,8,0.00,'2026-07-14 18:59:28','2026-07-14 18:59:28'),(129,'AST-129','Set Kompor Rinai TL-299 RI','Peralatan','2020-01-01',590000.00,8,0.00,'2026-07-14 18:59:29','2026-07-14 18:59:29'),(130,'AST-130','Printer Epson LX310  1 unit','Peralatan','2020-01-01',2825000.00,8,0.00,'2026-07-14 18:59:30','2026-07-14 18:59:30'),(131,'AST-131','Listrik Lantai 2','Peralatan','2020-01-01',10225100.00,8,0.00,'2026-07-14 18:59:30','2026-07-14 18:59:30'),(132,'AST-132','Meja Stainless (2 unit)','Peralatan','2020-01-01',4760000.00,8,0.00,'2026-07-14 18:59:31','2026-07-14 18:59:31'),(133,'AST-133','AC dan Instalasinya','Peralatan','2020-01-01',3820000.00,8,0.00,'2026-07-14 18:59:31','2026-07-14 18:59:31'),(134,'AST-134','Freezer Modena MX-0310','Mesin','2020-01-01',4900000.00,4,0.00,'2026-07-14 18:59:32','2026-07-14 18:59:32'),(135,'AST-135','Freezer RSA 100 L-Dusem','Mesin','2020-01-01',4900000.00,4,0.00,'2026-07-14 18:59:32','2026-07-14 18:59:32'),(136,'AST-136','Mesin Presto','Mesin','2020-01-01',10000000.00,8,0.00,'2026-07-14 18:59:33','2026-07-14 18:59:33'),(137,'AST-137','Mesin Penggiling Daging','Mesin','2020-01-01',2040000.00,8,0.00,'2026-07-14 18:59:33','2026-07-14 18:59:33'),(138,'AST-138','Cooking Mixer','Mesin','2020-01-01',1550000.00,8,0.00,'2026-07-14 18:59:33','2026-07-14 18:59:33'),(139,'AST-139','Mesin Vaccum','Mesin','2020-01-01',20000000.00,8,0.00,'2026-07-14 18:59:34','2026-07-14 18:59:34'),(140,'AST-140','MSP Mesin Hand Printer HP-351','Mesin','2022-01-01',864350.00,8,0.00,'2026-07-14 18:59:34','2026-07-14 18:59:34'),(141,'AST-141','MSP Mesin Oven Listrik Food Dehydrator MKS-FDH10','Mesin','2022-01-01',5460000.00,8,0.00,'2026-07-14 18:59:34','2026-07-14 18:59:34'),(142,'AST-142','Freezer Modena MD-37W','Mesin','2020-01-01',3000000.00,8,0.00,'2026-07-14 18:59:35','2026-07-14 18:59:35'),(143,'AST-143','Freezer Modena MD-65W 650 L','Mesin','2020-01-01',8000000.00,8,0.00,'2026-07-14 18:59:35','2026-07-14 18:59:35'),(144,'AST-144','Mesin giling daging','Mesin','2020-01-01',2835000.00,8,0.00,'2026-07-14 18:59:35','2026-07-14 18:59:35'),(145,'AST-145','Mesin vacuum DE-400/ZE WIRAPAX','Mesin','2020-01-01',12635000.00,8,0.00,'2026-07-14 18:59:35','2026-07-14 18:59:35'),(146,'AST-146','Food Dehydrator 20 Trays (Oven Bandeng)','Mesin','2020-01-01',6175000.00,8,0.00,'2026-07-14 18:59:36','2026-07-14 18:59:36'),(147,'AST-147','Freezer bandung RSA 288 L','Mesin','2020-01-01',2200000.00,8,0.00,'2026-07-14 18:59:36','2026-07-14 18:59:36'),(148,'AST-148','Freezer Aqua 450 L','Mesin','2020-01-01',5750000.00,8,0.00,'2026-07-14 18:59:36','2026-07-14 18:59:36'),(149,'AST-149','Mesin Giling Bumbu Ossel','Mesin','2020-01-01',2650000.00,8,0.00,'2026-07-14 18:59:37','2026-07-14 18:59:37'),(150,'AST-150','Mesin Presto Besar','Mesin','2020-01-01',20000000.00,8,0.00,'2026-07-14 18:59:37','2026-07-14 18:59:37'),(151,'AST-151','Dough Mixer','Mesin','2020-01-01',3855000.00,8,0.00,'2026-07-14 18:59:38','2026-07-14 18:59:38'),(152,'AST-152','Mesin String Wiratech (1)','Mesin','2020-01-01',5400000.00,8,0.00,'2026-07-14 18:59:38','2026-07-14 18:59:38'),(153,'AST-153','Mesin Las','Mesin','2020-01-01',3850000.00,8,0.00,'2026-07-14 18:59:38','2026-07-14 18:59:38'),(154,'AST-154','Mesin Presto Kapasitas 100 Kg','Mesin','2020-01-01',35000000.00,8,0.00,'2026-07-14 18:59:39','2026-07-14 18:59:39'),(155,'AST-155','Mesin Retort','Mesin','2020-01-01',129850000.00,8,0.00,'2026-07-14 18:59:39','2026-07-14 18:59:39'),(156,'AST-156','Mesin Bowl Cutter Mixer','Mesin','2020-01-01',15000000.00,8,0.00,'2026-07-14 18:59:39','2026-07-14 18:59:39'),(157,'AST-157','Freezer Sliding GEA SD 516 (Ruko)','Mesin','2020-01-01',5950000.00,8,0.00,'2026-07-14 18:59:40','2026-07-14 18:59:40'),(158,'AST-158','Freezer Sliding HAIER 350 L (Ruko)','Mesin','2020-01-01',3000000.00,8,0.00,'2026-07-14 18:59:40','2026-07-14 18:59:40'),(159,'AST-159','Bak Stainless Pendingin Retort','Mesin','2020-01-01',2000000.00,8,0.00,'2026-07-14 18:59:41','2026-07-14 18:59:41'),(160,'AST-160','Pelunasan Bak Stainless Pendingin Retort','Mesin','2020-01-01',2385000.00,8,0.00,'2026-07-14 18:59:41','2026-07-14 18:59:41'),(161,'AST-161','Mesin String Wiratech (2)','Mesin','2020-01-01',4000000.00,8,0.00,'2026-07-14 18:59:41','2026-07-14 18:59:41'),(162,'AST-162','Multifunctional Cutter Fomax','Mesin','2020-01-01',9237901.00,8,0.00,'2026-07-14 18:59:42','2026-07-14 18:59:42'),(163,'AST-163','Mesin Pemisah Duri by Fomac','Mesin','2020-01-01',38196981.00,8,0.00,'2026-07-14 18:59:42','2026-07-14 18:59:42'),(164,'AST-164','Motor Honda Beat 2015','Kendaraan','2015-01-01',27000000.00,4,0.00,'2026-07-14 18:59:43','2026-07-14 18:59:43'),(165,'AST-165','Motor Honda Beat 2022','Kendaraan','2022-01-01',26376000.00,5,0.00,'2026-07-14 18:59:43','2026-07-14 18:59:43'),(166,'AST-166','Mobil Daihatsu Grandmax','Kendaraan','2020-01-01',210000000.00,8,0.00,'2026-07-14 18:59:43','2026-07-14 18:59:43');
/*!40000 ALTER TABLE `t_aset` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_bahan`
--

DROP TABLE IF EXISTS `t_bahan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_bahan` (
  `id_bahan` bigint unsigned NOT NULL AUTO_INCREMENT,
  `jenis_bahan` enum('baku','penolong') COLLATE utf8mb4_unicode_ci NOT NULL,
  `kategori_simpan` enum('perishable','non_perishable') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'non_perishable',
  `kode_bahan` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama_bahan` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `satuan_bahan` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `harga_beli` decimal(15,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_bahan`),
  UNIQUE KEY `t_bahan_kode_bahan_unique` (`kode_bahan`)
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_bahan`
--

LOCK TABLES `t_bahan` WRITE;
/*!40000 ALTER TABLE `t_bahan` DISABLE KEYS */;
INSERT INTO `t_bahan` VALUES (1,'baku','non_perishable','BB-001','Bandeng Isi 3','Kg',11666.67,'2026-07-14 18:58:16','2026-07-14 18:58:16'),(2,'baku','non_perishable','BB-002','Asam Kawak','Gr',70.00,'2026-07-14 18:58:16','2026-07-14 18:58:16'),(3,'baku','non_perishable','BB-003','Bawang Merah','Gr',55.00,'2026-07-14 18:58:17','2026-07-14 18:58:17'),(4,'baku','non_perishable','BB-004','Bawang Merah Goreng','Gr',283.33,'2026-07-14 18:58:17','2026-07-14 18:58:17'),(5,'baku','non_perishable','BB-005','Bawang Putih','Gr',46.00,'2026-07-14 18:58:17','2026-07-14 18:58:17'),(6,'baku','non_perishable','BB-006','Bumbu Dapur','Paket',5000.00,'2026-07-14 18:58:17','2026-07-14 18:58:17'),(7,'baku','non_perishable','BB-007','Bumbu Pepes','Paket',15000.00,'2026-07-14 18:58:17','2026-07-14 18:58:17'),(8,'baku','non_perishable','BB-008','Cabe Merah','Gr',65.00,'2026-07-14 18:58:17','2026-07-14 18:58:17'),(9,'baku','non_perishable','BB-009','Cabe Rawit Merah','Gr',100.00,'2026-07-14 18:58:17','2026-07-14 18:58:17'),(10,'baku','perishable','BB-010','Daging Sapi','Gr',110.00,'2026-07-14 18:58:18','2026-07-15 02:45:38'),(11,'baku','non_perishable','BB-011','Daun Jeruk','Paket',5000.00,'2026-07-14 18:58:18','2026-07-14 18:58:18'),(12,'baku','non_perishable','BB-012','Daun Kemangi','Paket',40000.00,'2026-07-14 18:58:18','2026-07-14 18:58:18'),(13,'baku','non_perishable','BB-013','Daun Pisang','Paket',20000.00,'2026-07-14 18:58:18','2026-07-14 18:58:18'),(14,'baku','non_perishable','BB-014','Garam Bata','Gr',12.70,'2026-07-14 18:58:18','2026-07-14 18:58:18'),(15,'baku','non_perishable','BB-015','Garam Halus','Gr',8.00,'2026-07-14 18:58:18','2026-07-14 18:58:18'),(16,'baku','non_perishable','BB-016','Gula Pasir','Gr',12.50,'2026-07-14 18:58:18','2026-07-14 18:58:18'),(17,'baku','non_perishable','BB-017','Jahe','Gr',40.00,'2026-07-14 18:58:19','2026-07-14 18:58:19'),(18,'baku','non_perishable','BB-018','Jahe Bubuk','Gr',150.00,'2026-07-14 18:58:19','2026-07-14 18:58:19'),(19,'baku','non_perishable','BB-019','Kemiri','Gr',220.83,'2026-07-14 18:58:19','2026-07-14 18:58:19'),(20,'baku','non_perishable','BB-020','Kencur','Sachet',1000.00,'2026-07-14 18:58:19','2026-07-14 18:58:19'),(21,'baku','non_perishable','BB-021','Ketumbar','Gr',64.00,'2026-07-14 18:58:19','2026-07-14 18:58:19'),(22,'baku','non_perishable','BB-022','Kunyit','Gr',80.00,'2026-07-14 18:58:20','2026-07-14 18:58:20'),(23,'baku','non_perishable','BB-023','Ladaku','Sachet',100.00,'2026-07-14 18:58:20','2026-07-14 18:58:20'),(24,'baku','non_perishable','BB-024','Masako Sapi','Gr',36.67,'2026-07-14 18:58:20','2026-07-14 18:58:20'),(25,'baku','non_perishable','BB-025','Pala','Gr',27.50,'2026-07-14 18:58:20','2026-07-14 18:58:20'),(26,'baku','non_perishable','BB-026','Pengenyal','Gr',47.00,'2026-07-14 18:58:20','2026-07-14 18:58:20'),(27,'baku','non_perishable','BB-027','Penyedap Rasa','Gr',28.00,'2026-07-14 18:58:21','2026-07-14 18:58:21'),(28,'baku','non_perishable','BB-028','Sambal','Sachet',1000.00,'2026-07-14 18:58:21','2026-07-14 18:58:21'),(29,'baku','non_perishable','BB-029','Saos Sambal','Sachet',1000.00,'2026-07-14 18:58:21','2026-07-14 18:58:21'),(30,'baku','non_perishable','BB-030','Tahu Goreng','Biji',425.00,'2026-07-14 18:58:21','2026-07-14 18:58:21'),(31,'baku','non_perishable','BB-031','Telur','Butir',333.33,'2026-07-14 18:58:22','2026-07-14 18:58:22'),(32,'baku','non_perishable','BB-032','Tepung Aren','Gr',14.00,'2026-07-14 18:58:22','2026-07-14 18:58:22'),(33,'baku','non_perishable','BB-033','Tepung Panir','Gr',233.33,'2026-07-14 18:58:22','2026-07-14 18:58:22'),(34,'baku','non_perishable','BB-034','Tepung Tapioka','Gr',10.80,'2026-07-14 18:58:23','2026-07-14 18:58:23'),(35,'penolong','non_perishable','BP-001','Gas','Tabung',23000.00,'2026-07-14 18:58:23','2026-07-14 18:58:23'),(36,'penolong','non_perishable','BP-002','Dus Bandeng Merah','Lembar',2000.00,'2026-07-14 18:58:23','2026-07-14 18:58:23'),(37,'penolong','non_perishable','BP-003','Boilpack 1725','Lembar',1215.00,'2026-07-14 18:58:23','2026-07-14 18:58:23'),(38,'penolong','non_perishable','BP-004','Bp Transparan 1330','Lembar',775.00,'2026-07-14 18:58:23','2026-07-14 18:58:23'),(39,'penolong','non_perishable','BP-005','Dus Coklat','Lembar',1250.00,'2026-07-14 18:58:24','2026-07-14 18:58:24'),(40,'penolong','non_perishable','BP-006','Dus Coklat Besar','Lembar',1500.00,'2026-07-14 18:58:24','2026-07-14 18:58:24'),(41,'penolong','non_perishable','BP-007','Dus Otak Otak','Lembar',1250.00,'2026-07-14 18:58:24','2026-07-14 18:58:24'),(42,'penolong','non_perishable','BP-008','Dus Pepes','Lembar',1250.00,'2026-07-14 18:58:24','2026-07-14 18:58:24'),(43,'penolong','non_perishable','BP-009','Dus Tahu Bakso','Lembar',1500.00,'2026-07-14 18:58:24','2026-07-14 18:58:24'),(44,'penolong','non_perishable','BP-010','Dus Tahu Isi 5','Lembar',1250.00,'2026-07-14 18:58:24','2026-07-14 18:58:24'),(45,'penolong','non_perishable','BP-011','Kemasan Retort','Lembar',3000.00,'2026-07-14 18:58:25','2026-07-14 18:58:25'),(46,'penolong','non_perishable','BP-012','Plastik Shrink Tahu Bakso Isi 8','Lembar',350.00,'2026-07-14 18:58:25','2026-07-14 18:58:25'),(47,'penolong','non_perishable','BP-013','Plastik Shrink Tahu Bakso Premium','Lembar',350.00,'2026-07-14 18:58:25','2026-07-14 18:58:25'),(48,'penolong','non_perishable','BP-014','Plastik Srink','Lembar',350.00,'2026-07-14 18:58:25','2026-07-14 18:58:25'),(49,'penolong','non_perishable','BP-015','Plastik Strink Bandeng','Lembar',350.00,'2026-07-14 18:58:26','2026-07-14 18:58:26'),(50,'penolong','non_perishable','BP-016','Retort Pack-1335','Lembar',1050.00,'2026-07-14 18:58:26','2026-07-14 18:58:26'),(51,'penolong','non_perishable','BP-017','Retort Pack-1335 Isi 1','Lembar',975.00,'2026-07-14 18:58:27','2026-07-14 18:58:27'),(52,'penolong','non_perishable','BP-018','Tas Bandeng','Lembar',2000.00,'2026-07-14 18:58:27','2026-07-14 18:58:27'),(53,'penolong','non_perishable','BP-019','Tas Plastik Bandeng','Lembar',1000.00,'2026-07-14 18:58:27','2026-07-14 18:58:27'),(54,'penolong','non_perishable','BP-020','Vacuum Pack-1335','Lembar',700.00,'2026-07-14 18:58:28','2026-07-14 18:58:28');
/*!40000 ALTER TABLE `t_bahan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_bbb`
--

DROP TABLE IF EXISTS `t_bbb`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_bbb` (
  `id_bbb` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_produksi` bigint unsigned NOT NULL,
  `total_bbb` decimal(15,2) NOT NULL DEFAULT '0.00',
  `tanggal_hitung` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_bbb`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_bbb`
--

LOCK TABLES `t_bbb` WRITE;
/*!40000 ALTER TABLE `t_bbb` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_bbb` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_bom`
--

DROP TABLE IF EXISTS `t_bom`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_bom` (
  `id_bom` bigint unsigned NOT NULL AUTO_INCREMENT,
  `kode_bom` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_produk` bigint unsigned NOT NULL,
  `nama_resep` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `qty_batch` int NOT NULL,
  `satuan_batch` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_bom`),
  UNIQUE KEY `t_bom_kode_bom_unique` (`kode_bom`),
  KEY `t_bom_id_produk_foreign` (`id_produk`),
  CONSTRAINT `t_bom_id_produk_foreign` FOREIGN KEY (`id_produk`) REFERENCES `t_produk` (`id_produk`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_bom`
--

LOCK TABLES `t_bom` WRITE;
/*!40000 ALTER TABLE `t_bom` DISABLE KEYS */;
INSERT INTO `t_bom` VALUES (1,'BOM-001',1,'Tahu Bakso Isi 8',100,'Pack','2026-07-02 09:20:04','2026-07-02 10:32:54'),(2,'BOM-002',2,'Tahu Bakso Isi 10',70,'Pack','2026-07-02 09:20:04','2026-07-02 10:40:35');
/*!40000 ALTER TABLE `t_bom` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_bop`
--

DROP TABLE IF EXISTS `t_bop`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_bop` (
  `id_bop` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_produksi` bigint unsigned NOT NULL,
  `total_bop` decimal(15,2) NOT NULL DEFAULT '0.00',
  `tanggal_hitung` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_bop`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_bop`
--

LOCK TABLES `t_bop` WRITE;
/*!40000 ALTER TABLE `t_bop` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_bop` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_btkl`
--

DROP TABLE IF EXISTS `t_btkl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_btkl` (
  `id_btkl` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_produksi` bigint unsigned NOT NULL,
  `total_btkl` decimal(15,2) NOT NULL DEFAULT '0.00',
  `tanggal_hitung` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_btkl`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_btkl`
--

LOCK TABLES `t_btkl` WRITE;
/*!40000 ALTER TABLE `t_btkl` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_btkl` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_cogm`
--

DROP TABLE IF EXISTS `t_cogm`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_cogm` (
  `id_cogm` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_produksi` bigint unsigned NOT NULL,
  `total_bbb` decimal(15,2) NOT NULL DEFAULT '0.00',
  `total_btkl` decimal(15,2) NOT NULL DEFAULT '0.00',
  `total_bop` decimal(15,2) NOT NULL DEFAULT '0.00',
  `total_cogm` decimal(15,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_cogm`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_cogm`
--

LOCK TABLES `t_cogm` WRITE;
/*!40000 ALTER TABLE `t_cogm` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_cogm` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_detail_bbb`
--

DROP TABLE IF EXISTS `t_detail_bbb`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_detail_bbb` (
  `id_detail_bbb` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_bbb` bigint unsigned NOT NULL,
  `id_approval` bigint unsigned NOT NULL,
  `subtotal_bahan` decimal(15,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_detail_bbb`),
  KEY `t_detail_bbb_id_bbb_foreign` (`id_bbb`),
  CONSTRAINT `t_detail_bbb_id_bbb_foreign` FOREIGN KEY (`id_bbb`) REFERENCES `t_bbb` (`id_bbb`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_detail_bbb`
--

LOCK TABLES `t_detail_bbb` WRITE;
/*!40000 ALTER TABLE `t_detail_bbb` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_detail_bbb` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_detail_bom`
--

DROP TABLE IF EXISTS `t_detail_bom`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_detail_bom` (
  `id_detail_bom` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_bom` bigint unsigned NOT NULL,
  `id_bahan` bigint unsigned NOT NULL,
  `jumlah_bahan` decimal(15,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_detail_bom`),
  KEY `t_detail_bom_id_bom_foreign` (`id_bom`),
  KEY `t_detail_bom_id_bahan_foreign` (`id_bahan`),
  CONSTRAINT `t_detail_bom_id_bahan_foreign` FOREIGN KEY (`id_bahan`) REFERENCES `t_bahan` (`id_bahan`) ON DELETE RESTRICT,
  CONSTRAINT `t_detail_bom_id_bom_foreign` FOREIGN KEY (`id_bom`) REFERENCES `t_bom` (`id_bom`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_detail_bom`
--

LOCK TABLES `t_detail_bom` WRITE;
/*!40000 ALTER TABLE `t_detail_bom` DISABLE KEYS */;
INSERT INTO `t_detail_bom` VALUES (1,1,10,5000.00,'2026-07-14 18:59:44','2026-07-14 18:59:44'),(2,1,30,800.00,'2026-07-14 18:59:44','2026-07-14 18:59:44'),(3,2,10,5000.00,'2026-07-14 18:59:44','2026-07-14 18:59:44'),(4,2,30,700.00,'2026-07-14 18:59:44','2026-07-14 18:59:44'),(5,2,34,3500.00,'2026-07-14 18:59:44','2026-07-14 18:59:44'),(8,1,34,4000.00,'2026-07-14 18:59:44','2026-07-14 18:59:44'),(9,1,32,1000.00,'2026-07-14 18:59:44','2026-07-14 18:59:44'),(10,1,4,125.00,'2026-07-14 18:59:44','2026-07-14 18:59:44'),(11,1,14,1525.00,'2026-07-14 18:59:44','2026-07-14 18:59:44'),(12,1,16,75.00,'2026-07-14 18:59:44','2026-07-14 18:59:44'),(13,1,27,75.00,'2026-07-14 18:59:44','2026-07-14 18:59:44'),(14,1,26,20.00,'2026-07-14 18:59:44','2026-07-14 18:59:44'),(15,1,24,125.00,'2026-07-14 18:59:44','2026-07-14 18:59:44'),(16,1,23,10.00,'2026-07-14 18:59:44','2026-07-14 18:59:44'),(17,1,19,70.00,'2026-07-14 18:59:44','2026-07-14 18:59:44'),(18,1,43,100.00,'2026-07-14 18:59:44','2026-07-14 18:59:44'),(19,1,45,100.00,'2026-07-14 18:59:44','2026-07-14 18:59:44'),(20,1,39,7.00,'2026-07-14 18:59:44','2026-07-14 18:59:44'),(21,1,46,100.00,'2026-07-14 18:59:44','2026-07-14 18:59:44'),(22,1,35,3.00,'2026-07-14 18:59:44','2026-07-14 18:59:44'),(23,2,32,500.00,'2026-07-14 18:59:44','2026-07-14 18:59:44'),(24,2,4,90.00,'2026-07-14 18:59:44','2026-07-14 18:59:44'),(25,2,14,825.00,'2026-07-14 18:59:44','2026-07-14 18:59:44'),(26,2,16,75.00,'2026-07-14 18:59:44','2026-07-14 18:59:44'),(27,2,27,225.00,'2026-07-14 18:59:44','2026-07-14 18:59:44'),(28,2,26,20.00,'2026-07-14 18:59:44','2026-07-14 18:59:44'),(29,2,24,175.00,'2026-07-14 18:59:44','2026-07-14 18:59:44'),(30,2,23,1.00,'2026-07-14 18:59:44','2026-07-14 18:59:44'),(31,2,19,50.00,'2026-07-14 18:59:44','2026-07-14 18:59:44'),(32,2,29,70.00,'2026-07-14 18:59:44','2026-07-14 18:59:44'),(33,2,35,2.00,'2026-07-14 18:59:44','2026-07-14 18:59:44'),(34,2,43,70.00,'2026-07-14 18:59:44','2026-07-14 18:59:44'),(35,2,37,70.00,'2026-07-14 18:59:44','2026-07-14 18:59:44');
/*!40000 ALTER TABLE `t_detail_bom` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_detail_bop`
--

DROP TABLE IF EXISTS `t_detail_bop`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_detail_bop` (
  `id_detail_bop` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_bop` bigint unsigned NOT NULL,
  `id_overhead` bigint unsigned NOT NULL,
  `biaya` decimal(15,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_detail_bop`),
  KEY `t_detail_bop_id_bop_foreign` (`id_bop`),
  CONSTRAINT `t_detail_bop_id_bop_foreign` FOREIGN KEY (`id_bop`) REFERENCES `t_bop` (`id_bop`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_detail_bop`
--

LOCK TABLES `t_detail_bop` WRITE;
/*!40000 ALTER TABLE `t_detail_bop` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_detail_bop` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_detail_btkl`
--

DROP TABLE IF EXISTS `t_detail_btkl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_detail_btkl` (
  `id_detail_btkl` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_btkl` bigint unsigned NOT NULL,
  `id_divisi` bigint unsigned NOT NULL,
  `jumlah_orang` decimal(5,2) NOT NULL DEFAULT '0.00',
  `tarif_per_hari` decimal(15,2) NOT NULL DEFAULT '0.00',
  `subtotal_btkl` decimal(15,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_detail_btkl`),
  KEY `t_detail_btkl_id_btkl_foreign` (`id_btkl`),
  CONSTRAINT `t_detail_btkl_id_btkl_foreign` FOREIGN KEY (`id_btkl`) REFERENCES `t_btkl` (`id_btkl`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_detail_btkl`
--

LOCK TABLES `t_detail_btkl` WRITE;
/*!40000 ALTER TABLE `t_detail_btkl` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_detail_btkl` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_detail_jadwal_produksi`
--

DROP TABLE IF EXISTS `t_detail_jadwal_produksi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_detail_jadwal_produksi` (
  `id_produksi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `kode_produksi` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_jadwal` bigint unsigned NOT NULL,
  `id_produk` bigint unsigned NOT NULL,
  `id_bom` bigint unsigned NOT NULL,
  `tanggal_produksi` date NOT NULL,
  `qty_rencana` int NOT NULL,
  `catatan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_produksi`),
  UNIQUE KEY `t_detail_jadwal_produksi_kode_produksi_unique` (`kode_produksi`),
  KEY `t_detail_jadwal_produksi_id_jadwal_foreign` (`id_jadwal`),
  KEY `t_detail_jadwal_produksi_id_produk_foreign` (`id_produk`),
  KEY `t_detail_jadwal_produksi_id_bom_foreign` (`id_bom`),
  CONSTRAINT `t_detail_jadwal_produksi_id_bom_foreign` FOREIGN KEY (`id_bom`) REFERENCES `t_bom` (`id_bom`) ON DELETE RESTRICT,
  CONSTRAINT `t_detail_jadwal_produksi_id_jadwal_foreign` FOREIGN KEY (`id_jadwal`) REFERENCES `t_jadwal_produksi` (`id_jadwal`) ON DELETE CASCADE,
  CONSTRAINT `t_detail_jadwal_produksi_id_produk_foreign` FOREIGN KEY (`id_produk`) REFERENCES `t_produk` (`id_produk`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_detail_jadwal_produksi`
--

LOCK TABLES `t_detail_jadwal_produksi` WRITE;
/*!40000 ALTER TABLE `t_detail_jadwal_produksi` DISABLE KEYS */;
INSERT INTO `t_detail_jadwal_produksi` VALUES (1,'PRD-2026-001',1,1,1,'2026-02-02',800,'Tahu bakso nyoba doang','2026-06-28 14:13:10','2026-06-28 14:13:10'),(2,'PRD-2026-002',1,6,2,'2026-02-03',700,'bandeng mantap','2026-06-28 14:13:10','2026-06-28 14:13:10'),(3,'PRD-2026-003',1,1,2,'2026-02-15',400,'enak pol','2026-06-28 14:13:10','2026-06-28 14:13:10'),(4,'PRD-2026-004',2,2,1,'2026-03-04',500,'nyoba baru','2026-06-30 12:11:52','2026-06-30 12:11:52'),(5,'PRD-2026-005',2,1,1,'2026-03-10',500,'Tahu bakso nyoba doang','2026-06-30 12:11:52','2026-06-30 12:11:52'),(6,'PRD-2026-006',2,6,2,'2026-03-18',700,'bandeng mantap','2026-06-30 12:11:52','2026-06-30 12:11:52'),(7,'PRD-2026-007',2,1,2,'2026-03-25',800,'enak pol','2026-06-30 12:11:52','2026-06-30 12:11:52');
/*!40000 ALTER TABLE `t_detail_jadwal_produksi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_detail_penerimaan_bahan`
--

DROP TABLE IF EXISTS `t_detail_penerimaan_bahan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_detail_penerimaan_bahan` (
  `id_detail_penerimaan` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_penerimaan` bigint unsigned NOT NULL,
  `id_bahan` bigint unsigned NOT NULL,
  `qty_diterima` decimal(10,2) NOT NULL,
  `qty_retur` decimal(10,2) NOT NULL,
  `kondisi` enum('Baik','Retur') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Baik',
  `catatan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_detail_penerimaan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_detail_penerimaan_bahan`
--

LOCK TABLES `t_detail_penerimaan_bahan` WRITE;
/*!40000 ALTER TABLE `t_detail_penerimaan_bahan` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_detail_penerimaan_bahan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_detail_po`
--

DROP TABLE IF EXISTS `t_detail_po`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_detail_po` (
  `id_detail_po` int unsigned NOT NULL AUTO_INCREMENT,
  `id_po` int unsigned NOT NULL,
  `id_bahan` bigint unsigned NOT NULL,
  `id_detail_pp` int unsigned NOT NULL,
  `qty_po` decimal(10,2) NOT NULL,
  `harga_satuan` decimal(15,2) NOT NULL,
  `subtotal` decimal(15,2) GENERATED ALWAYS AS ((`qty_po` * `harga_satuan`)) VIRTUAL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_detail_po`),
  KEY `t_detail_po_id_po_foreign` (`id_po`),
  KEY `t_detail_po_id_bahan_foreign` (`id_bahan`),
  KEY `t_detail_po_id_detail_pp_foreign` (`id_detail_pp`),
  CONSTRAINT `t_detail_po_id_bahan_foreign` FOREIGN KEY (`id_bahan`) REFERENCES `t_bahan` (`id_bahan`) ON DELETE RESTRICT,
  CONSTRAINT `t_detail_po_id_detail_pp_foreign` FOREIGN KEY (`id_detail_pp`) REFERENCES `t_detail_pp` (`id_detail_pp`) ON DELETE RESTRICT,
  CONSTRAINT `t_detail_po_id_po_foreign` FOREIGN KEY (`id_po`) REFERENCES `t_purchase_order` (`id_po`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_detail_po`
--

LOCK TABLES `t_detail_po` WRITE;
/*!40000 ALTER TABLE `t_detail_po` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_detail_po` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_detail_pp`
--

DROP TABLE IF EXISTS `t_detail_pp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_detail_pp` (
  `id_detail_pp` int unsigned NOT NULL AUTO_INCREMENT,
  `id_pp` int unsigned NOT NULL,
  `id_bahan` bigint unsigned NOT NULL,
  `qty_kebutuhan` decimal(10,2) NOT NULL,
  `qty_diminta` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_detail_pp`),
  KEY `t_detail_pp_id_pp_foreign` (`id_pp`),
  KEY `t_detail_pp_id_bahan_foreign` (`id_bahan`),
  CONSTRAINT `t_detail_pp_id_bahan_foreign` FOREIGN KEY (`id_bahan`) REFERENCES `t_bahan` (`id_bahan`) ON DELETE RESTRICT,
  CONSTRAINT `t_detail_pp_id_pp_foreign` FOREIGN KEY (`id_pp`) REFERENCES `t_permintaan_pembelian` (`id_pp`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_detail_pp`
--

LOCK TABLES `t_detail_pp` WRITE;
/*!40000 ALTER TABLE `t_detail_pp` DISABLE KEYS */;
INSERT INTO `t_detail_pp` VALUES (1,1,10,40000.00,90000.00,'2026-07-15 02:46:26','2026-07-15 02:46:26');
/*!40000 ALTER TABLE `t_detail_pp` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_detail_retur_pembelian`
--

DROP TABLE IF EXISTS `t_detail_retur_pembelian`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_detail_retur_pembelian` (
  `id_detail_retur` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_retur` bigint unsigned NOT NULL,
  `id_bahan` bigint unsigned NOT NULL,
  `qty_retur` int NOT NULL,
  `harga_satuan` int NOT NULL,
  `alasan` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_detail_retur`),
  KEY `t_detail_retur_pembelian_id_retur_foreign` (`id_retur`),
  KEY `t_detail_retur_pembelian_id_bahan_foreign` (`id_bahan`),
  CONSTRAINT `t_detail_retur_pembelian_id_bahan_foreign` FOREIGN KEY (`id_bahan`) REFERENCES `t_bahan` (`id_bahan`) ON DELETE RESTRICT,
  CONSTRAINT `t_detail_retur_pembelian_id_retur_foreign` FOREIGN KEY (`id_retur`) REFERENCES `t_retur_pembelian` (`id_retur`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_detail_retur_pembelian`
--

LOCK TABLES `t_detail_retur_pembelian` WRITE;
/*!40000 ALTER TABLE `t_detail_retur_pembelian` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_detail_retur_pembelian` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_detail_transaksi_pembelian`
--

DROP TABLE IF EXISTS `t_detail_transaksi_pembelian`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_detail_transaksi_pembelian` (
  `id_detail_transaksi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_transaksi` bigint unsigned NOT NULL,
  `id_detail_penerimaan` bigint unsigned NOT NULL,
  `harga_aktual` decimal(15,2) NOT NULL,
  `subtotal` decimal(15,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_detail_transaksi`),
  KEY `t_detail_transaksi_pembelian_id_transaksi_foreign` (`id_transaksi`),
  KEY `t_detail_transaksi_pembelian_id_detail_penerimaan_foreign` (`id_detail_penerimaan`),
  CONSTRAINT `t_detail_transaksi_pembelian_id_detail_penerimaan_foreign` FOREIGN KEY (`id_detail_penerimaan`) REFERENCES `t_detail_penerimaan_bahan` (`id_detail_penerimaan`),
  CONSTRAINT `t_detail_transaksi_pembelian_id_transaksi_foreign` FOREIGN KEY (`id_transaksi`) REFERENCES `t_transaksi_pembelian` (`id_transaksi`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_detail_transaksi_pembelian`
--

LOCK TABLES `t_detail_transaksi_pembelian` WRITE;
/*!40000 ALTER TABLE `t_detail_transaksi_pembelian` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_detail_transaksi_pembelian` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_divisi`
--

DROP TABLE IF EXISTS `t_divisi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_divisi` (
  `id_divisi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `kode_divisi` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama_divisi` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_divisi`),
  UNIQUE KEY `t_divisi_kode_divisi_unique` (`kode_divisi`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_divisi`
--

LOCK TABLES `t_divisi` WRITE;
/*!40000 ALTER TABLE `t_divisi` DISABLE KEYS */;
INSERT INTO `t_divisi` VALUES (1,'DIV-001','Kepala Produksi','2026-07-14 18:57:47','2026-07-14 18:57:47'),(2,'DIV-002','Staff Produksi','2026-07-14 18:57:48','2026-07-14 18:57:48'),(3,'DIV-003','Packaging','2026-07-14 18:57:48','2026-07-14 18:57:48');
/*!40000 ALTER TABLE `t_divisi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_harga_produk`
--

DROP TABLE IF EXISTS `t_harga_produk`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_harga_produk` (
  `id_harga_produk` bigint unsigned NOT NULL AUTO_INCREMENT,
  `kode_harga` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_produk` bigint unsigned NOT NULL,
  `jenis_transaksi` enum('Penjualan Langsung','Maklon','Konsinyasi') COLLATE utf8mb4_unicode_ci NOT NULL,
  `harga` decimal(15,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_harga_produk`),
  UNIQUE KEY `t_harga_produk_kode_harga_unique` (`kode_harga`),
  KEY `t_harga_produk_id_produk_foreign` (`id_produk`),
  CONSTRAINT `t_harga_produk_id_produk_foreign` FOREIGN KEY (`id_produk`) REFERENCES `t_produk` (`id_produk`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_harga_produk`
--

LOCK TABLES `t_harga_produk` WRITE;
/*!40000 ALTER TABLE `t_harga_produk` DISABLE KEYS */;
INSERT INTO `t_harga_produk` VALUES (1,'HG-001',1,'Penjualan Langsung',45000.00,'2026-07-14 18:59:45','2026-07-14 18:59:45'),(2,'HG-002',1,'Konsinyasi',42000.00,'2026-07-14 18:59:46','2026-07-14 18:59:46'),(3,'HG-003',2,'Penjualan Langsung',50000.00,'2026-07-14 18:59:47','2026-07-14 18:59:47'),(4,'HG-004',3,'Penjualan Langsung',60000.00,'2026-07-14 18:59:49','2026-07-14 18:59:49'),(5,'HG-005',3,'Maklon',55000.00,'2026-07-14 18:59:49','2026-07-14 18:59:49'),(6,'HG-006',4,'Penjualan Langsung',75000.00,'2026-07-14 18:59:50','2026-07-14 18:59:50'),(7,'HG-007',4,'Konsinyasi',70000.00,'2026-07-14 18:59:50','2026-07-14 18:59:50'),(8,'HG-008',5,'Maklon',120000.00,'2026-07-14 18:59:51','2026-07-14 18:59:51'),(9,'HG-009',6,'Penjualan Langsung',35000.00,'2026-07-14 18:59:52','2026-07-14 18:59:52'),(10,'HG-010',6,'Konsinyasi',32000.00,'2026-07-14 18:59:52','2026-07-14 18:59:52'),(11,'HG-011',6,'Maklon',30000.00,'2026-07-14 18:59:53','2026-07-14 18:59:53'),(12,'HG-012',7,'Penjualan Langsung',95000.00,'2026-07-14 18:59:53','2026-07-14 18:59:53');
/*!40000 ALTER TABLE `t_harga_produk` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_hasil_produksi`
--

DROP TABLE IF EXISTS `t_hasil_produksi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_hasil_produksi` (
  `id_hasil_produksi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_produksi` bigint unsigned NOT NULL,
  `output_aktual` decimal(10,2) NOT NULL,
  `tanggal_produksi` date NOT NULL,
  `tanggal_kadaluarsa` date NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Draft',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_hasil_produksi`),
  KEY `t_hasil_produksi_id_produksi_foreign` (`id_produksi`),
  CONSTRAINT `t_hasil_produksi_id_produksi_foreign` FOREIGN KEY (`id_produksi`) REFERENCES `t_detail_jadwal_produksi` (`id_produksi`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_hasil_produksi`
--

LOCK TABLES `t_hasil_produksi` WRITE;
/*!40000 ALTER TABLE `t_hasil_produksi` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_hasil_produksi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_hutang_usaha`
--

DROP TABLE IF EXISTS `t_hutang_usaha`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_hutang_usaha` (
  `id_hutang` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_transaksi` bigint unsigned NOT NULL,
  `no_hutang` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_hutang` decimal(15,2) NOT NULL,
  `terbayar` decimal(15,2) NOT NULL DEFAULT '0.00',
  `kurang_bayar` decimal(15,2) NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Belum Lunas',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_hutang`),
  UNIQUE KEY `t_hutang_usaha_no_hutang_unique` (`no_hutang`),
  KEY `t_hutang_usaha_id_transaksi_foreign` (`id_transaksi`),
  CONSTRAINT `t_hutang_usaha_id_transaksi_foreign` FOREIGN KEY (`id_transaksi`) REFERENCES `t_transaksi_pembelian` (`id_transaksi`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_hutang_usaha`
--

LOCK TABLES `t_hutang_usaha` WRITE;
/*!40000 ALTER TABLE `t_hutang_usaha` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_hutang_usaha` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_jadwal_produksi`
--

DROP TABLE IF EXISTS `t_jadwal_produksi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_jadwal_produksi` (
  `id_jadwal` bigint unsigned NOT NULL AUTO_INCREMENT,
  `kode_jadwal` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `periode` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tanggal_dibuat` date NOT NULL,
  `jumlah_produksi` int NOT NULL,
  `status_jadwal` enum('Draft','Pending Approval','Revision Required','Approved') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Draft',
  `komentar_owner` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_jadwal`),
  UNIQUE KEY `t_jadwal_produksi_kode_jadwal_unique` (`kode_jadwal`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_jadwal_produksi`
--

LOCK TABLES `t_jadwal_produksi` WRITE;
/*!40000 ALTER TABLE `t_jadwal_produksi` DISABLE KEYS */;
INSERT INTO `t_jadwal_produksi` VALUES (1,'JDW-2026-0001','Februari 2026','2026-01-28',3,'Approved','Disetujui sesuai kapasitas produksi.','2026-06-28 10:19:35','2026-06-28 14:13:30'),(2,'JDW-2026-0002','Maret 2026','2026-02-25',4,'Pending Approval',NULL,'2026-06-30 12:11:52','2026-06-30 12:11:52');
/*!40000 ALTER TABLE `t_jadwal_produksi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_jual`
--

DROP TABLE IF EXISTS `t_jual`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_jual` (
  `id_jual` int NOT NULL AUTO_INCREMENT,
  `no_jual` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tgl_jual` date NOT NULL,
  `id_pesanan` int NOT NULL,
  `jenis_penjualan` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `metode_pembayaran` enum('Tunai','Kredit') COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtotal` decimal(20,0) NOT NULL,
  `total_diskon` decimal(20,0) NOT NULL,
  `total_hpp` decimal(20,0) NOT NULL,
  `grand_total` decimal(25,0) NOT NULL,
  `catatan` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_jual`),
  UNIQUE KEY `t_jual_no_jual_unique` (`no_jual`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_jual`
--

LOCK TABLES `t_jual` WRITE;
/*!40000 ALTER TABLE `t_jual` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_jual` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_jual_detail`
--

DROP TABLE IF EXISTS `t_jual_detail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_jual_detail` (
  `id_jual_detail` int NOT NULL AUTO_INCREMENT,
  `id_jual` int NOT NULL,
  `id_produk` int NOT NULL,
  `harga` decimal(20,0) NOT NULL DEFAULT '0',
  `qty_jual` int NOT NULL,
  `hpp_satuan` decimal(20,0) NOT NULL,
  `diskon` decimal(12,0) NOT NULL,
  `subtotal` decimal(20,0) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_jual_detail`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_jual_detail`
--

LOCK TABLES `t_jual_detail` WRITE;
/*!40000 ALTER TABLE `t_jual_detail` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_jual_detail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_jual_konsinyasi`
--

DROP TABLE IF EXISTS `t_jual_konsinyasi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_jual_konsinyasi` (
  `id_jual_konsinyasi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `no_penjualan` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tgl_penjualan` date NOT NULL,
  `id_konsinyasi_keluar` int NOT NULL,
  `id_mitra` int unsigned NOT NULL,
  `jenis_pembayaran` enum('Tunai','Kredit') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Tunai',
  `total_bayar` decimal(15,2) NOT NULL DEFAULT '0.00',
  `hpp_total` decimal(15,2) NOT NULL,
  `keterangan` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_jual_konsinyasi`),
  UNIQUE KEY `t_jual_konsinyasi_no_penjualan_unique` (`no_penjualan`),
  KEY `fk_jual_id_konsinyasi_keluar` (`id_konsinyasi_keluar`),
  KEY `t_jual_konsinyasi_id_mitra_foreign` (`id_mitra`),
  CONSTRAINT `fk_jual_id_konsinyasi_keluar` FOREIGN KEY (`id_konsinyasi_keluar`) REFERENCES `t_konsinyasi_keluar` (`id_konsinyasi_keluar`) ON DELETE CASCADE,
  CONSTRAINT `t_jual_konsinyasi_id_mitra_foreign` FOREIGN KEY (`id_mitra`) REFERENCES `t_mitra` (`id_mitra`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_jual_konsinyasi`
--

LOCK TABLES `t_jual_konsinyasi` WRITE;
/*!40000 ALTER TABLE `t_jual_konsinyasi` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_jual_konsinyasi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_jual_konsinyasi_detail`
--

DROP TABLE IF EXISTS `t_jual_konsinyasi_detail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_jual_konsinyasi_detail` (
  `id_jual_konsinyasi_detail` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_jual_konsinyasi` bigint unsigned NOT NULL,
  `id_produk` bigint unsigned NOT NULL,
  `qty_terjual` int NOT NULL,
  `harga_jual` decimal(15,2) NOT NULL,
  `subtotal` decimal(15,2) NOT NULL,
  `hpp_satuan` decimal(15,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_jual_konsinyasi_detail`),
  KEY `fk_jual_konsinyasi_dtl` (`id_jual_konsinyasi`),
  KEY `t_jual_konsinyasi_detail_id_produk_foreign` (`id_produk`),
  CONSTRAINT `fk_jual_konsinyasi_dtl` FOREIGN KEY (`id_jual_konsinyasi`) REFERENCES `t_jual_konsinyasi` (`id_jual_konsinyasi`) ON DELETE CASCADE,
  CONSTRAINT `t_jual_konsinyasi_detail_id_produk_foreign` FOREIGN KEY (`id_produk`) REFERENCES `t_produk` (`id_produk`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_jual_konsinyasi_detail`
--

LOCK TABLES `t_jual_konsinyasi_detail` WRITE;
/*!40000 ALTER TABLE `t_jual_konsinyasi_detail` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_jual_konsinyasi_detail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_jurnal`
--

DROP TABLE IF EXISTS `t_jurnal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_jurnal` (
  `id_jurnal` bigint unsigned NOT NULL AUTO_INCREMENT,
  `kode_jurnal` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tanggal` date NOT NULL,
  `keterangan` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `jenis_jurnal` enum('umum','penyesuaian') COLLATE utf8mb4_unicode_ci NOT NULL,
  `kode_referensi` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_jurnal`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_jurnal`
--

LOCK TABLES `t_jurnal` WRITE;
/*!40000 ALTER TABLE `t_jurnal` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_jurnal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_jurnal_detail`
--

DROP TABLE IF EXISTS `t_jurnal_detail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_jurnal_detail` (
  `id_jurnal_detail` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_jurnal` bigint unsigned NOT NULL,
  `id_akun` bigint unsigned NOT NULL,
  `debit` decimal(15,2) NOT NULL DEFAULT '0.00',
  `kredit` decimal(15,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_jurnal_detail`),
  KEY `t_jurnal_detail_id_jurnal_foreign` (`id_jurnal`),
  KEY `t_jurnal_detail_id_akun_foreign` (`id_akun`),
  CONSTRAINT `t_jurnal_detail_id_akun_foreign` FOREIGN KEY (`id_akun`) REFERENCES `t_akun` (`id_akun`) ON DELETE RESTRICT,
  CONSTRAINT `t_jurnal_detail_id_jurnal_foreign` FOREIGN KEY (`id_jurnal`) REFERENCES `t_jurnal` (`id_jurnal`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_jurnal_detail`
--

LOCK TABLES `t_jurnal_detail` WRITE;
/*!40000 ALTER TABLE `t_jurnal_detail` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_jurnal_detail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_kartu_persediaan`
--

DROP TABLE IF EXISTS `t_kartu_persediaan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_kartu_persediaan` (
  `id_kartu` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_bahan` bigint unsigned DEFAULT NULL,
  `id_produk` bigint unsigned DEFAULT NULL,
  `no_referensi` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `jenis_transaksi` enum('MASUK','KELUAR') COLLATE utf8mb4_unicode_ci NOT NULL,
  `sumber_transaksi` enum('pembelian','produksi_masuk','produksi_keluar','retur_pembelian','retur_penjualan','penjualan','penyesuaian_harga','stock_opname','konsinyasi_keluar','retur_konsinyasi') COLLATE utf8mb4_unicode_ci NOT NULL,
  `keterangan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `qty_masuk` decimal(12,2) NOT NULL DEFAULT '0.00',
  `harga_masuk` decimal(14,2) NOT NULL DEFAULT '0.00',
  `total_masuk` decimal(14,2) NOT NULL DEFAULT '0.00',
  `qty_keluar` decimal(12,2) NOT NULL DEFAULT '0.00',
  `harga_keluar` decimal(14,2) NOT NULL DEFAULT '0.00',
  `total_keluar` decimal(14,2) NOT NULL DEFAULT '0.00',
  `saldo_qty` decimal(12,2) NOT NULL DEFAULT '0.00',
  `saldo_harga` decimal(14,2) NOT NULL DEFAULT '0.00',
  `saldo_total` decimal(14,2) NOT NULL DEFAULT '0.00',
  `tanggal_transaksi` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_kartu`),
  KEY `t_kartu_persediaan_id_bahan_tanggal_transaksi_index` (`id_bahan`,`tanggal_transaksi`),
  KEY `t_kartu_persediaan_id_produk_tanggal_transaksi_index` (`id_produk`,`tanggal_transaksi`),
  CONSTRAINT `t_kartu_persediaan_id_bahan_foreign` FOREIGN KEY (`id_bahan`) REFERENCES `t_bahan` (`id_bahan`) ON DELETE SET NULL,
  CONSTRAINT `t_kartu_persediaan_id_produk_foreign` FOREIGN KEY (`id_produk`) REFERENCES `t_produk` (`id_produk`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_kartu_persediaan`
--

LOCK TABLES `t_kartu_persediaan` WRITE;
/*!40000 ALTER TABLE `t_kartu_persediaan` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_kartu_persediaan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_kebutuhan_bahan`
--

DROP TABLE IF EXISTS `t_kebutuhan_bahan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_kebutuhan_bahan` (
  `id_kebutuhan_bahan` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_produksi` bigint unsigned NOT NULL,
  `id_detail_bom` bigint unsigned NOT NULL,
  `qty_bahan_snapshot` decimal(10,2) NOT NULL,
  `qty_kebutuhan` decimal(10,2) NOT NULL,
  `tanggal_generate` date NOT NULL DEFAULT (curdate()),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_kebutuhan_bahan`),
  KEY `t_kebutuhan_bahan_id_produksi_foreign` (`id_produksi`),
  KEY `t_kebutuhan_bahan_id_detail_bom_foreign` (`id_detail_bom`),
  CONSTRAINT `t_kebutuhan_bahan_id_detail_bom_foreign` FOREIGN KEY (`id_detail_bom`) REFERENCES `t_detail_bom` (`id_detail_bom`) ON DELETE RESTRICT,
  CONSTRAINT `t_kebutuhan_bahan_id_produksi_foreign` FOREIGN KEY (`id_produksi`) REFERENCES `t_detail_jadwal_produksi` (`id_produksi`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_kebutuhan_bahan`
--

LOCK TABLES `t_kebutuhan_bahan` WRITE;
/*!40000 ALTER TABLE `t_kebutuhan_bahan` DISABLE KEYS */;
INSERT INTO `t_kebutuhan_bahan` VALUES (1,1,1,5000.00,40000.00,'2026-06-30','2026-06-28 14:35:30','2026-06-28 14:35:30'),(2,1,2,800.00,6400.00,'2026-06-30','2026-06-28 14:35:30','2026-06-28 14:35:30'),(3,1,8,4000.00,32000.00,'2026-06-30','2026-06-28 14:35:30','2026-06-28 14:35:30'),(4,1,9,1000.00,8000.00,'2026-06-30','2026-06-28 14:35:30','2026-06-28 14:35:30'),(5,1,10,125.00,1000.00,'2026-06-30','2026-06-28 14:35:30','2026-06-28 14:35:30'),(6,1,11,1525.00,12200.00,'2026-06-30','2026-06-28 14:35:30','2026-06-28 14:35:30'),(7,1,12,75.00,600.00,'2026-06-30','2026-06-28 14:35:30','2026-06-28 14:35:30'),(8,1,13,75.00,600.00,'2026-06-30','2026-06-28 14:35:30','2026-06-28 14:35:30'),(9,1,14,20.00,160.00,'2026-06-30','2026-06-28 14:35:30','2026-06-28 14:35:30'),(10,1,15,125.00,1000.00,'2026-06-30','2026-06-28 14:35:30','2026-06-28 14:35:30'),(11,1,16,10.00,80.00,'2026-06-30','2026-06-28 14:35:30','2026-06-28 14:35:30'),(12,1,17,70.00,560.00,'2026-06-30','2026-06-28 14:35:30','2026-06-28 14:35:30'),(13,1,18,100.00,800.00,'2026-06-30','2026-06-28 14:35:30','2026-06-28 14:35:30'),(14,1,19,100.00,800.00,'2026-06-30','2026-06-28 14:35:30','2026-06-28 14:35:30'),(15,1,20,7.00,56.00,'2026-06-30','2026-06-28 14:35:30','2026-06-28 14:35:30'),(16,1,21,100.00,800.00,'2026-06-30','2026-06-28 14:35:30','2026-06-28 14:35:30'),(17,1,22,3.00,24.00,'2026-06-30','2026-06-28 14:35:30','2026-06-28 14:35:30'),(18,2,3,5000.00,50000.00,'2026-06-30','2026-06-30 11:38:28','2026-06-30 11:38:28'),(19,2,4,700.00,7000.00,'2026-06-30','2026-06-30 11:38:28','2026-06-30 11:38:28'),(20,2,5,3500.00,35000.00,'2026-06-30','2026-06-30 11:38:28','2026-06-30 11:38:28'),(21,2,23,500.00,5000.00,'2026-06-30','2026-06-30 11:38:28','2026-06-30 11:38:28'),(22,2,24,90.00,900.00,'2026-06-30','2026-06-30 11:38:28','2026-06-30 11:38:28'),(23,2,25,825.00,8250.00,'2026-06-30','2026-06-30 11:38:28','2026-06-30 11:38:28'),(24,2,26,75.00,750.00,'2026-06-30','2026-06-30 11:38:28','2026-06-30 11:38:28'),(25,2,27,225.00,2250.00,'2026-06-30','2026-06-30 11:38:28','2026-06-30 11:38:28'),(26,2,28,20.00,200.00,'2026-06-30','2026-06-30 11:38:28','2026-06-30 11:38:28'),(27,2,29,175.00,1750.00,'2026-06-30','2026-06-30 11:38:28','2026-06-30 11:38:28'),(28,2,30,1.00,10.00,'2026-06-30','2026-06-30 11:38:28','2026-06-30 11:38:28'),(29,2,31,50.00,500.00,'2026-06-30','2026-06-30 11:38:28','2026-06-30 11:38:28'),(30,2,32,70.00,700.00,'2026-06-30','2026-06-30 11:38:28','2026-06-30 11:38:28'),(31,2,33,2.00,20.00,'2026-06-30','2026-06-30 11:38:28','2026-06-30 11:38:28'),(32,2,34,70.00,700.00,'2026-06-30','2026-06-30 11:38:28','2026-06-30 11:38:28'),(33,2,35,70.00,700.00,'2026-06-30','2026-06-30 11:38:28','2026-06-30 11:38:28'),(34,3,3,5000.00,28571.43,'2026-06-30','2026-06-30 11:38:36','2026-06-30 11:38:36'),(35,3,4,700.00,4000.00,'2026-06-30','2026-06-30 11:38:36','2026-06-30 11:38:36'),(36,3,5,3500.00,20000.00,'2026-06-30','2026-06-30 11:38:36','2026-06-30 11:38:36'),(37,3,23,500.00,2857.14,'2026-06-30','2026-06-30 11:38:36','2026-06-30 11:38:36'),(38,3,24,90.00,514.29,'2026-06-30','2026-06-30 11:38:36','2026-06-30 11:38:36'),(39,3,25,825.00,4714.29,'2026-06-30','2026-06-30 11:38:36','2026-06-30 11:38:36'),(40,3,26,75.00,428.57,'2026-06-30','2026-06-30 11:38:36','2026-06-30 11:38:36'),(41,3,27,225.00,1285.71,'2026-06-30','2026-06-30 11:38:36','2026-06-30 11:38:36'),(42,3,28,20.00,114.29,'2026-06-30','2026-06-30 11:38:36','2026-06-30 11:38:36'),(43,3,29,175.00,1000.00,'2026-06-30','2026-06-30 11:38:36','2026-06-30 11:38:36'),(44,3,30,1.00,5.71,'2026-06-30','2026-06-30 11:38:36','2026-06-30 11:38:36'),(45,3,31,50.00,285.71,'2026-06-30','2026-06-30 11:38:36','2026-06-30 11:38:36'),(46,3,32,70.00,400.00,'2026-06-30','2026-06-30 11:38:36','2026-06-30 11:38:36'),(47,3,33,2.00,11.43,'2026-06-30','2026-06-30 11:38:36','2026-06-30 11:38:36'),(48,3,34,70.00,400.00,'2026-06-30','2026-06-30 11:38:36','2026-06-30 11:38:36'),(49,3,35,70.00,400.00,'2026-06-30','2026-06-30 11:38:36','2026-06-30 11:38:36');
/*!40000 ALTER TABLE `t_kebutuhan_bahan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_konsinyasi_keluar`
--

DROP TABLE IF EXISTS `t_konsinyasi_keluar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_konsinyasi_keluar` (
  `id_konsinyasi_keluar` int NOT NULL AUTO_INCREMENT,
  `no_konsinyasi` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_mitra` int NOT NULL,
  `tgl_konsinyasi` date NOT NULL,
  `total_estimasi` decimal(20,0) NOT NULL DEFAULT '0',
  `keterangan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Draft',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_konsinyasi_keluar`),
  UNIQUE KEY `t_konsinyasi_keluar_no_konsinyasi_unique` (`no_konsinyasi`),
  KEY `t_konsinyasi_keluar_id_mitra_index` (`id_mitra`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_konsinyasi_keluar`
--

LOCK TABLES `t_konsinyasi_keluar` WRITE;
/*!40000 ALTER TABLE `t_konsinyasi_keluar` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_konsinyasi_keluar` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_konsinyasi_keluar_detail`
--

DROP TABLE IF EXISTS `t_konsinyasi_keluar_detail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_konsinyasi_keluar_detail` (
  `id_konsinyasi_detail` int NOT NULL AUTO_INCREMENT,
  `id_konsinyasi_keluar` int NOT NULL,
  `id_produk` bigint unsigned NOT NULL,
  `id_harga` bigint unsigned NOT NULL,
  `qty` int NOT NULL,
  `harga_titip` decimal(20,0) NOT NULL,
  `subtotal` decimal(20,0) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_konsinyasi_detail`),
  KEY `fk_tk_detail_id_tk` (`id_konsinyasi_keluar`),
  KEY `fk_tk_detail_id_produk` (`id_produk`),
  KEY `fk_tk_detail_id_harga` (`id_harga`),
  CONSTRAINT `fk_tk_detail_id_harga` FOREIGN KEY (`id_harga`) REFERENCES `t_harga_produk` (`id_harga_produk`),
  CONSTRAINT `fk_tk_detail_id_produk` FOREIGN KEY (`id_produk`) REFERENCES `t_produk` (`id_produk`),
  CONSTRAINT `fk_tk_detail_id_tk` FOREIGN KEY (`id_konsinyasi_keluar`) REFERENCES `t_konsinyasi_keluar` (`id_konsinyasi_keluar`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_konsinyasi_keluar_detail`
--

LOCK TABLES `t_konsinyasi_keluar_detail` WRITE;
/*!40000 ALTER TABLE `t_konsinyasi_keluar_detail` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_konsinyasi_keluar_detail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_mitra`
--

DROP TABLE IF EXISTS `t_mitra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_mitra` (
  `id_mitra` int unsigned NOT NULL AUTO_INCREMENT,
  `kode_mitra` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama_mitra` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pic_mitra` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `alamat` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `no_telp` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kota` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('Aktif','Tidak Aktif') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Aktif',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_mitra`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_mitra`
--

LOCK TABLES `t_mitra` WRITE;
/*!40000 ALTER TABLE `t_mitra` DISABLE KEYS */;
INSERT INTO `t_mitra` VALUES (1,'MIT-0001','LIDULAPA','Budi Santoso','Jl. Bawen - Ambarawa, Merakrejo, Harjosari, Kec. Bawen','081234567890','Kabupaten Semarang','Aktif','2026-07-14 18:58:16','2026-07-14 18:58:16'),(2,'MIT-0002','Dusun Semilir','Iwan Sulistyo','Jl. Soekarno - Hatta No.49, Ngemple, Bawen','081987654321','Kabupaten Semarang','Aktif','2026-07-14 18:58:16','2026-07-14 18:58:16'),(3,'MIT-0003','KOETA TOEA','Siti Aminah','Jl. Brigjen Sudiarto No.448b, Pedurungan Tengah','085712345678','Kota Semarang','Aktif','2026-07-14 18:58:16','2026-07-14 18:58:16');
/*!40000 ALTER TABLE `t_mitra` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_overhead`
--

DROP TABLE IF EXISTS `t_overhead`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_overhead` (
  `id_overhead` bigint unsigned NOT NULL AUTO_INCREMENT,
  `kode_overhead` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama_overhead` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `keterangan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_overhead`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_overhead`
--

LOCK TABLES `t_overhead` WRITE;
/*!40000 ALTER TABLE `t_overhead` DISABLE KEYS */;
INSERT INTO `t_overhead` VALUES (1,'OVH-001','Listrik','Biaya listrik untuk produksi','2026-07-14 18:59:44','2026-07-14 18:59:44'),(2,'OVH-002','Air','Biaya air untuk produksi','2026-07-14 18:59:44','2026-07-14 18:59:44');
/*!40000 ALTER TABLE `t_overhead` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_pemakaian_bahan`
--

DROP TABLE IF EXISTS `t_pemakaian_bahan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_pemakaian_bahan` (
  `id_pemakaian` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_hasil_produksi` bigint unsigned NOT NULL,
  `id_bahan` bigint unsigned NOT NULL,
  `qty_aktual` decimal(10,2) NOT NULL,
  `selisih` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_pemakaian`),
  KEY `t_pemakaian_bahan_id_hasil_produksi_foreign` (`id_hasil_produksi`),
  KEY `t_pemakaian_bahan_id_bahan_foreign` (`id_bahan`),
  CONSTRAINT `t_pemakaian_bahan_id_bahan_foreign` FOREIGN KEY (`id_bahan`) REFERENCES `t_bahan` (`id_bahan`) ON DELETE RESTRICT,
  CONSTRAINT `t_pemakaian_bahan_id_hasil_produksi_foreign` FOREIGN KEY (`id_hasil_produksi`) REFERENCES `t_hasil_produksi` (`id_hasil_produksi`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_pemakaian_bahan`
--

LOCK TABLES `t_pemakaian_bahan` WRITE;
/*!40000 ALTER TABLE `t_pemakaian_bahan` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_pemakaian_bahan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_pembayaran_hutang`
--

DROP TABLE IF EXISTS `t_pembayaran_hutang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_pembayaran_hutang` (
  `id_pembayaran` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_hutang` bigint unsigned NOT NULL,
  `id_retur` bigint unsigned DEFAULT NULL,
  `no_pembayaran` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tanggal_pembayaran` date NOT NULL,
  `jumlah_dibayar` decimal(15,2) NOT NULL,
  `metode_pembayaran` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Transfer Bank',
  `tipe` enum('Bayar','Retur') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Bayar',
  `catatan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_pembayaran`),
  UNIQUE KEY `t_pembayaran_hutang_no_pembayaran_unique` (`no_pembayaran`),
  KEY `t_pembayaran_hutang_id_hutang_foreign` (`id_hutang`),
  KEY `t_pembayaran_hutang_id_retur_foreign` (`id_retur`),
  CONSTRAINT `t_pembayaran_hutang_id_hutang_foreign` FOREIGN KEY (`id_hutang`) REFERENCES `t_hutang_usaha` (`id_hutang`) ON DELETE CASCADE,
  CONSTRAINT `t_pembayaran_hutang_id_retur_foreign` FOREIGN KEY (`id_retur`) REFERENCES `t_retur_pembelian` (`id_retur`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_pembayaran_hutang`
--

LOCK TABLES `t_pembayaran_hutang` WRITE;
/*!40000 ALTER TABLE `t_pembayaran_hutang` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_pembayaran_hutang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_penerimaan_bahan`
--

DROP TABLE IF EXISTS `t_penerimaan_bahan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_penerimaan_bahan` (
  `id_penerimaan` bigint unsigned NOT NULL AUTO_INCREMENT,
  `no_penerimaan` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_po` bigint unsigned NOT NULL,
  `tanggal_penerimaan` date NOT NULL,
  `catatan` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_penerimaan`),
  UNIQUE KEY `t_penerimaan_bahan_no_penerimaan_unique` (`no_penerimaan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_penerimaan_bahan`
--

LOCK TABLES `t_penerimaan_bahan` WRITE;
/*!40000 ALTER TABLE `t_penerimaan_bahan` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_penerimaan_bahan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_penyusutan_aset`
--

DROP TABLE IF EXISTS `t_penyusutan_aset`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_penyusutan_aset` (
  `id_penyusutan` bigint unsigned NOT NULL AUTO_INCREMENT,
  `kode_penyusutan` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_aset` bigint unsigned NOT NULL,
  `periode` date NOT NULL,
  `nilai_penyusutan` decimal(15,2) NOT NULL,
  `akumulasi_penyusutan` decimal(15,2) NOT NULL,
  `nilai_buku` decimal(15,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_penyusutan`),
  UNIQUE KEY `idx_aset_periode_unique` (`id_aset`,`periode`),
  CONSTRAINT `t_penyusutan_aset_id_aset_foreign` FOREIGN KEY (`id_aset`) REFERENCES `t_aset` (`id_aset`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_penyusutan_aset`
--

LOCK TABLES `t_penyusutan_aset` WRITE;
/*!40000 ALTER TABLE `t_penyusutan_aset` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_penyusutan_aset` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_permintaan_pembelian`
--

DROP TABLE IF EXISTS `t_permintaan_pembelian`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_permintaan_pembelian` (
  `id_pp` int unsigned NOT NULL AUTO_INCREMENT,
  `no_pp` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tgl_pp` date NOT NULL,
  `id_produksi` bigint unsigned DEFAULT NULL,
  `tgl_mulai_periode` date DEFAULT NULL,
  `tgl_akhir_periode` date DEFAULT NULL,
  `jenis_bahan` enum('baku','penolong','tambahan') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('diajukan','disetujui') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'diajukan',
  `catatan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_pp`),
  UNIQUE KEY `t_permintaan_pembelian_no_pp_unique` (`no_pp`),
  KEY `t_permintaan_pembelian_id_produksi_foreign` (`id_produksi`),
  CONSTRAINT `t_permintaan_pembelian_id_produksi_foreign` FOREIGN KEY (`id_produksi`) REFERENCES `t_detail_jadwal_produksi` (`id_produksi`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_permintaan_pembelian`
--

LOCK TABLES `t_permintaan_pembelian` WRITE;
/*!40000 ALTER TABLE `t_permintaan_pembelian` DISABLE KEYS */;
INSERT INTO `t_permintaan_pembelian` VALUES (1,'PRB-0001','2026-07-15',1,NULL,NULL,'baku','diajukan',NULL,'2026-07-15 02:46:25','2026-07-15 02:46:25');
/*!40000 ALTER TABLE `t_permintaan_pembelian` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_pesanan`
--

DROP TABLE IF EXISTS `t_pesanan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_pesanan` (
  `id_pesanan` int unsigned NOT NULL AUTO_INCREMENT,
  `no_pesanan` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tgl_pesanan` date NOT NULL,
  `id_mitra` int unsigned NOT NULL,
  `jenis_transaksi` enum('Penjualan Langsung','Maklon','Konsinyasi') COLLATE utf8mb4_unicode_ci NOT NULL,
  `alamat` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_harga` decimal(20,0) NOT NULL DEFAULT '0',
  `catatan` text COLLATE utf8mb4_unicode_ci,
  `total_diskon` decimal(12,0) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_pesanan`),
  UNIQUE KEY `t_pesanan_no_pesanan_unique` (`no_pesanan`),
  KEY `t_pesanan_id_mitra_foreign` (`id_mitra`),
  CONSTRAINT `t_pesanan_id_mitra_foreign` FOREIGN KEY (`id_mitra`) REFERENCES `t_mitra` (`id_mitra`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_pesanan`
--

LOCK TABLES `t_pesanan` WRITE;
/*!40000 ALTER TABLE `t_pesanan` DISABLE KEYS */;
INSERT INTO `t_pesanan` VALUES (1,'SO-20260714-0001','2026-07-14',1,'Penjualan Langsung','Jl. Bawen - Ambarawa, Merakrejo, Harjosari, Kec. Bawen',225000,NULL,0,'2026-07-14 18:59:54','2026-07-14 18:59:54'),(2,'SO-20260714-0002','2026-07-14',2,'Maklon','Jl. Soekarno - Hatta No.49, Ngemple, Bawen',1420000,NULL,0,'2026-07-14 18:59:55','2026-07-14 18:59:55'),(3,'SO-20260714-0003','2026-07-14',3,'Maklon','Jl. Brigjen Sudiarto No.448b, Pedurungan Tengah',825000,NULL,0,'2026-07-14 18:59:56','2026-07-14 18:59:56'),(4,'SO-20260714-0004','2026-07-14',1,'Maklon','Jl. Bawen - Ambarawa, Merakrejo, Harjosari, Kec. Bawen',1875000,NULL,0,'2026-07-14 18:59:56','2026-07-14 18:59:56'),(5,'SO-20260714-0005','2026-07-14',2,'Maklon','Jl. Soekarno - Hatta No.49, Ngemple, Bawen',4800000,NULL,0,'2026-07-14 18:59:57','2026-07-14 18:59:57'),(6,'SO-20260714-0006','2026-07-14',1,'Penjualan Langsung','Jl. Bawen - Ambarawa, Merakrejo, Harjosari, Kec. Bawen',1420000,NULL,0,'2026-07-14 18:59:58','2026-07-14 18:59:58'),(7,'SO-20260714-0007','2026-07-14',2,'Penjualan Langsung','Jl. Soekarno - Hatta No.49, Ngemple, Bawen',6000000,NULL,0,'2026-07-14 18:59:58','2026-07-14 18:59:58');
/*!40000 ALTER TABLE `t_pesanan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_pesanan_detail`
--

DROP TABLE IF EXISTS `t_pesanan_detail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_pesanan_detail` (
  `id_pesanan_detail` int unsigned NOT NULL AUTO_INCREMENT,
  `id_pesanan` int unsigned NOT NULL,
  `id_produk` bigint unsigned NOT NULL,
  `id_harga` bigint unsigned NOT NULL,
  `harga` decimal(20,0) NOT NULL,
  `qty` int NOT NULL,
  `subtotal` decimal(20,0) NOT NULL,
  `diskon` decimal(12,0) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_pesanan_detail`),
  KEY `t_pesanan_detail_id_pesanan_foreign` (`id_pesanan`),
  KEY `t_pesanan_detail_id_produk_foreign` (`id_produk`),
  KEY `t_pesanan_detail_id_harga_foreign` (`id_harga`),
  CONSTRAINT `t_pesanan_detail_id_harga_foreign` FOREIGN KEY (`id_harga`) REFERENCES `t_harga_produk` (`id_harga_produk`) ON DELETE CASCADE,
  CONSTRAINT `t_pesanan_detail_id_pesanan_foreign` FOREIGN KEY (`id_pesanan`) REFERENCES `t_pesanan` (`id_pesanan`) ON DELETE CASCADE,
  CONSTRAINT `t_pesanan_detail_id_produk_foreign` FOREIGN KEY (`id_produk`) REFERENCES `t_produk` (`id_produk`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_pesanan_detail`
--

LOCK TABLES `t_pesanan_detail` WRITE;
/*!40000 ALTER TABLE `t_pesanan_detail` DISABLE KEYS */;
INSERT INTO `t_pesanan_detail` VALUES (1,1,1,1,45000,5,225000,0,NULL,NULL),(2,2,1,2,42000,10,420000,0,NULL,NULL),(3,2,2,3,50000,20,1000000,0,NULL,NULL),(4,3,3,5,55000,15,825000,0,NULL,NULL),(5,4,4,6,75000,25,1875000,0,NULL,NULL),(6,5,5,8,120000,40,4800000,0,NULL,NULL),(7,6,6,9,35000,8,280000,0,NULL,NULL),(8,6,7,12,95000,12,1140000,0,NULL,NULL),(9,7,3,4,60000,100,6000000,0,NULL,NULL);
/*!40000 ALTER TABLE `t_pesanan_detail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_piutang`
--

DROP TABLE IF EXISTS `t_piutang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_piutang` (
  `id_piutang` bigint unsigned NOT NULL AUTO_INCREMENT,
  `no_piutang` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_jual` int DEFAULT NULL,
  `id_mitra` int NOT NULL,
  `tgl_piutang` date NOT NULL,
  `total_piutang` decimal(20,2) NOT NULL,
  `terbayar` decimal(20,2) NOT NULL DEFAULT '0.00',
  `sisa_piutang` decimal(20,2) NOT NULL,
  `jt_piutang` date NOT NULL,
  `status_piutang` enum('Belum Lunas','Lunas') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Belum Lunas',
  `keterangan` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_piutang`),
  UNIQUE KEY `t_piutang_no_piutang_unique` (`no_piutang`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_piutang`
--

LOCK TABLES `t_piutang` WRITE;
/*!40000 ALTER TABLE `t_piutang` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_piutang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_piutang_pelunasan`
--

DROP TABLE IF EXISTS `t_piutang_pelunasan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_piutang_pelunasan` (
  `id_pelunasan` int NOT NULL AUTO_INCREMENT,
  `no_pelunasan` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tgl_pelunasan` date NOT NULL,
  `id_piutang` int NOT NULL,
  `nominal_bayar` decimal(20,0) NOT NULL DEFAULT '0',
  `metode_bayar` enum('Tunai','Transfer') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Tunai',
  `keterangan` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_pelunasan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_piutang_pelunasan`
--

LOCK TABLES `t_piutang_pelunasan` WRITE;
/*!40000 ALTER TABLE `t_piutang_pelunasan` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_piutang_pelunasan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_piutang_perpanjangan`
--

DROP TABLE IF EXISTS `t_piutang_perpanjangan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_piutang_perpanjangan` (
  `id_perpanjangan` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_piutang` bigint unsigned NOT NULL,
  `nominal` decimal(15,2) NOT NULL,
  `jt_lama` date NOT NULL,
  `jt_baru` date NOT NULL,
  `alasan` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_perpanjangan`),
  KEY `t_piutang_perpanjangan_id_piutang_foreign` (`id_piutang`),
  CONSTRAINT `t_piutang_perpanjangan_id_piutang_foreign` FOREIGN KEY (`id_piutang`) REFERENCES `t_piutang` (`id_piutang`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_piutang_perpanjangan`
--

LOCK TABLES `t_piutang_perpanjangan` WRITE;
/*!40000 ALTER TABLE `t_piutang_perpanjangan` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_piutang_perpanjangan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_produk`
--

DROP TABLE IF EXISTS `t_produk`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_produk` (
  `id_produk` bigint unsigned NOT NULL AUTO_INCREMENT,
  `kode_produk` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama_produk` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `satuan_produk` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_produk`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_produk`
--

LOCK TABLES `t_produk` WRITE;
/*!40000 ALTER TABLE `t_produk` DISABLE KEYS */;
INSERT INTO `t_produk` VALUES (1,'PRD-001','Tahu Bakso Retort Isi 8','pcs','2026-07-14 18:58:28','2026-07-14 18:58:28'),(2,'PRD-002','Tahu Bakso Retort Isi 10','pcs','2026-07-14 18:58:29','2026-07-14 18:58:29'),(3,'PRD-003','Tahu Bakso Premium Isi 5','pcs','2026-07-14 18:58:29','2026-07-14 18:58:29'),(4,'PRD-004','Bandeng Frozen Isi 1','pcs','2026-07-14 18:58:29','2026-07-14 18:58:29'),(5,'PRD-005','Bandeng Frozen Isi 2','pcs','2026-07-14 18:58:30','2026-07-14 18:58:30'),(6,'PRD-006','Bandeng Retort','pcs','2026-07-14 18:58:30','2026-07-14 18:58:30'),(7,'PRD-007','Otak-Otak Vaccum','pcs','2026-07-14 18:58:31','2026-07-14 18:58:31'),(8,'PRD-008','Otak-Otak Retort','pcs','2026-07-14 18:58:31','2026-07-14 18:58:31'),(9,'PRD-009','Pepes Retort','pcs','2026-07-14 18:58:32','2026-07-14 18:58:32'),(10,'PRD-010','Pepes Vaccum','pcs','2026-07-14 18:58:32','2026-07-14 18:58:32');
/*!40000 ALTER TABLE `t_produk` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_purchase_order`
--

DROP TABLE IF EXISTS `t_purchase_order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_purchase_order` (
  `id_po` int unsigned NOT NULL AUTO_INCREMENT,
  `no_po` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tgl_po` date NOT NULL,
  `id_pp` int unsigned NOT NULL,
  `id_supplier` bigint unsigned NOT NULL,
  `metode_beli` enum('tunai','tempo_30') COLLATE utf8mb4_unicode_ci NOT NULL,
  `catatan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('diajukan','perlu_revisi','disetujui') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'diajukan',
  `catatan_finance` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_po`),
  UNIQUE KEY `t_purchase_order_no_po_unique` (`no_po`),
  UNIQUE KEY `t_purchase_order_id_pp_unique` (`id_pp`),
  KEY `t_purchase_order_id_supplier_foreign` (`id_supplier`),
  CONSTRAINT `t_purchase_order_id_pp_foreign` FOREIGN KEY (`id_pp`) REFERENCES `t_permintaan_pembelian` (`id_pp`) ON DELETE RESTRICT,
  CONSTRAINT `t_purchase_order_id_supplier_foreign` FOREIGN KEY (`id_supplier`) REFERENCES `t_supplier` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_purchase_order`
--

LOCK TABLES `t_purchase_order` WRITE;
/*!40000 ALTER TABLE `t_purchase_order` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_purchase_order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_retur_jual`
--

DROP TABLE IF EXISTS `t_retur_jual`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_retur_jual` (
  `id_retur_jual` int NOT NULL AUTO_INCREMENT,
  `no_retur_jual` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tgl_retur_jual` date NOT NULL,
  `id_jual` int NOT NULL,
  `subtotal` decimal(20,0) NOT NULL DEFAULT '0',
  `total_hpp` decimal(20,0) NOT NULL DEFAULT '0',
  `total_perbaikan` decimal(20,0) NOT NULL DEFAULT '0',
  `total_kerugian` decimal(20,0) NOT NULL DEFAULT '0',
  `grand_total` decimal(25,0) NOT NULL DEFAULT '0',
  `catatan` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_retur_jual`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_retur_jual`
--

LOCK TABLES `t_retur_jual` WRITE;
/*!40000 ALTER TABLE `t_retur_jual` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_retur_jual` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_retur_jual_detail`
--

DROP TABLE IF EXISTS `t_retur_jual_detail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_retur_jual_detail` (
  `id_retur_jual_detail` int NOT NULL AUTO_INCREMENT,
  `id_retur_jual` int NOT NULL,
  `id_produk` int NOT NULL,
  `harga` decimal(20,0) NOT NULL DEFAULT '0',
  `hpp` decimal(20,0) NOT NULL DEFAULT '0',
  `qty` int NOT NULL,
  `subtotal` decimal(20,0) NOT NULL DEFAULT '0',
  `kondisi_barang` enum('Layak','Rusak','Perbaikan') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Layak',
  `biaya_perbaikan` decimal(20,0) NOT NULL DEFAULT '0',
  `nilai_kerugian` decimal(20,0) NOT NULL DEFAULT '0',
  `keterangan` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_retur_jual_detail`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_retur_jual_detail`
--

LOCK TABLES `t_retur_jual_detail` WRITE;
/*!40000 ALTER TABLE `t_retur_jual_detail` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_retur_jual_detail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_retur_konsinyasi`
--

DROP TABLE IF EXISTS `t_retur_konsinyasi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_retur_konsinyasi` (
  `id_retur_konsinyasi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `no_retur_konsinyasi` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tgl_retur_konsinyasi` date NOT NULL,
  `id_konsinyasi_keluar` bigint unsigned NOT NULL,
  `total_hpp_retur` decimal(15,2) NOT NULL DEFAULT '0.00',
  `total_perbaikan` decimal(20,0) NOT NULL DEFAULT '0',
  `total_kerugian` decimal(20,0) NOT NULL DEFAULT '0',
  `grand_total` decimal(20,0) NOT NULL DEFAULT '0',
  `catatan` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_retur_konsinyasi`),
  UNIQUE KEY `t_retur_konsinyasi_no_retur_konsinyasi_unique` (`no_retur_konsinyasi`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_retur_konsinyasi`
--

LOCK TABLES `t_retur_konsinyasi` WRITE;
/*!40000 ALTER TABLE `t_retur_konsinyasi` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_retur_konsinyasi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_retur_konsinyasi_detail`
--

DROP TABLE IF EXISTS `t_retur_konsinyasi_detail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_retur_konsinyasi_detail` (
  `id_retur_konsinyasi_detail` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_retur_konsinyasi` bigint unsigned NOT NULL,
  `id_produk` bigint unsigned NOT NULL,
  `harga` decimal(20,0) NOT NULL DEFAULT '0',
  `qty` int NOT NULL,
  `subtotal` decimal(20,0) NOT NULL DEFAULT '0',
  `kondisi_barang` enum('Layak','Rusak','Perlu Perbaikan') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Layak',
  `hpp_saat_ini` decimal(15,2) NOT NULL DEFAULT '0.00',
  `biaya_perbaikan` decimal(20,0) NOT NULL DEFAULT '0',
  `nilai_kerugian` decimal(20,0) NOT NULL DEFAULT '0',
  `keterangan` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_retur_konsinyasi_detail`),
  KEY `t_retur_konsinyasi_detail_id_retur_konsinyasi_foreign` (`id_retur_konsinyasi`),
  CONSTRAINT `t_retur_konsinyasi_detail_id_retur_konsinyasi_foreign` FOREIGN KEY (`id_retur_konsinyasi`) REFERENCES `t_retur_konsinyasi` (`id_retur_konsinyasi`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_retur_konsinyasi_detail`
--

LOCK TABLES `t_retur_konsinyasi_detail` WRITE;
/*!40000 ALTER TABLE `t_retur_konsinyasi_detail` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_retur_konsinyasi_detail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_retur_pembelian`
--

DROP TABLE IF EXISTS `t_retur_pembelian`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_retur_pembelian` (
  `id_retur` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_penerimaan` bigint unsigned NOT NULL,
  `no_retur` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tanggal_retur` date NOT NULL,
  `total_nilai` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_retur`),
  UNIQUE KEY `t_retur_pembelian_no_retur_unique` (`no_retur`),
  KEY `t_retur_pembelian_id_penerimaan_foreign` (`id_penerimaan`),
  CONSTRAINT `t_retur_pembelian_id_penerimaan_foreign` FOREIGN KEY (`id_penerimaan`) REFERENCES `t_penerimaan_bahan` (`id_penerimaan`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_retur_pembelian`
--

LOCK TABLES `t_retur_pembelian` WRITE;
/*!40000 ALTER TABLE `t_retur_pembelian` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_retur_pembelian` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_so`
--

DROP TABLE IF EXISTS `t_so`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_so` (
  `id_so` int unsigned NOT NULL AUTO_INCREMENT,
  `no_so` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tgl_so` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_so`),
  UNIQUE KEY `t_so_no_so_unique` (`no_so`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_so`
--

LOCK TABLES `t_so` WRITE;
/*!40000 ALTER TABLE `t_so` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_so` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_so_detail`
--

DROP TABLE IF EXISTS `t_so_detail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_so_detail` (
  `id_so_detail` int unsigned NOT NULL AUTO_INCREMENT,
  `id_so` int unsigned NOT NULL,
  `id_bahan` bigint unsigned DEFAULT NULL,
  `id_produk` bigint unsigned DEFAULT NULL,
  `qty_sistem` decimal(10,2) NOT NULL,
  `qty_fisik` decimal(10,2) NOT NULL,
  `qty_kadaluarsa` decimal(10,2) NOT NULL DEFAULT '0.00',
  `selisih` decimal(10,2) GENERATED ALWAYS AS ((`qty_fisik` - `qty_sistem`)) VIRTUAL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_so_detail`),
  KEY `t_so_detail_id_so_foreign` (`id_so`),
  KEY `t_so_detail_id_bahan_foreign` (`id_bahan`),
  KEY `t_so_detail_id_produk_foreign` (`id_produk`),
  CONSTRAINT `t_so_detail_id_bahan_foreign` FOREIGN KEY (`id_bahan`) REFERENCES `t_bahan` (`id_bahan`) ON DELETE RESTRICT,
  CONSTRAINT `t_so_detail_id_produk_foreign` FOREIGN KEY (`id_produk`) REFERENCES `t_produk` (`id_produk`) ON DELETE RESTRICT,
  CONSTRAINT `t_so_detail_id_so_foreign` FOREIGN KEY (`id_so`) REFERENCES `t_so` (`id_so`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_so_detail`
--

LOCK TABLES `t_so_detail` WRITE;
/*!40000 ALTER TABLE `t_so_detail` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_so_detail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_supplier`
--

DROP TABLE IF EXISTS `t_supplier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_supplier` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `kode_supplier` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama_supplier` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kontak_supplier` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `alamat_supplier` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `t_supplier_kode_supplier_unique` (`kode_supplier`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_supplier`
--

LOCK TABLES `t_supplier` WRITE;
/*!40000 ALTER TABLE `t_supplier` DISABLE KEYS */;
INSERT INTO `t_supplier` VALUES (1,'SUP-001','Toko Daging Bu Vera','-','Kota Semarang','2026-07-14 18:58:14','2026-07-14 18:58:14'),(2,'SUP-002','UD MNS','-','Ps Kobong Semarang','2026-07-14 18:58:14','2026-07-14 18:58:14'),(3,'SUP-003','Bandeng Sigit','-','Kota Semarang','2026-07-14 18:58:14','2026-07-14 18:58:14'),(4,'SUP-004','Bandeng Balap','-','Kota Semarang','2026-07-14 18:58:14','2026-07-14 18:58:14'),(5,'SUP-005','Tahu Din','-','Ungaran','2026-07-14 18:58:15','2026-07-14 18:58:15'),(6,'SUP-006','Bintang Fausta Cemerlag','-','Semarang','2026-07-14 18:58:15','2026-07-14 18:58:15'),(7,'SUP-007','Cerah Indah Grafika','-','Semarang','2026-07-14 18:58:15','2026-07-14 18:58:15'),(8,'SUP-008','Cv Karya Mahardika','-','Semarang','2026-07-14 18:58:15','2026-07-14 18:58:15'),(9,'SUP-009','Trimulya Cipta Grafika','-','Semarang','2026-07-14 18:58:15','2026-07-14 18:58:15'),(10,'SUP-010','Sambel Bu Lani','-','Semarang','2026-07-14 18:58:16','2026-07-14 18:58:16');
/*!40000 ALTER TABLE `t_supplier` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_surat_jalan`
--

DROP TABLE IF EXISTS `t_surat_jalan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_surat_jalan` (
  `id_surat_jalan` bigint unsigned NOT NULL AUTO_INCREMENT,
  `no_surat_jalan` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tgl_surat_jalan` date NOT NULL,
  `id_pesanan` int DEFAULT NULL,
  `id_konsinyasi` int DEFAULT NULL,
  `alamat` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nama_pengirim` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kendaraan` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `no_plat` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('Diproses','Dikirim','Terkirim') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Diproses',
  `catatan` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_surat_jalan`),
  UNIQUE KEY `t_surat_jalan_no_surat_jalan_unique` (`no_surat_jalan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_surat_jalan`
--

LOCK TABLES `t_surat_jalan` WRITE;
/*!40000 ALTER TABLE `t_surat_jalan` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_surat_jalan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_transaksi_pembelian`
--

DROP TABLE IF EXISTS `t_transaksi_pembelian`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_transaksi_pembelian` (
  `id_transaksi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_penerimaan` bigint unsigned NOT NULL,
  `no_faktur` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tanggal_transaksi` date NOT NULL,
  `metode_pembayaran` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status_pembayaran` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `jatuh_tempo` date DEFAULT NULL,
  `subtotal_barang` decimal(15,2) NOT NULL,
  `diskon` decimal(15,2) NOT NULL DEFAULT '0.00',
  `ongkos_kirim` decimal(15,2) NOT NULL DEFAULT '0.00',
  `pajak` decimal(15,2) NOT NULL DEFAULT '0.00',
  `total_tagihan` decimal(15,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_transaksi`),
  KEY `t_transaksi_pembelian_id_penerimaan_foreign` (`id_penerimaan`),
  CONSTRAINT `t_transaksi_pembelian_id_penerimaan_foreign` FOREIGN KEY (`id_penerimaan`) REFERENCES `t_penerimaan_bahan` (`id_penerimaan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_transaksi_pembelian`
--

LOCK TABLES `t_transaksi_pembelian` WRITE;
/*!40000 ALTER TABLE `t_transaksi_pembelian` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_transaksi_pembelian` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_transaksi_pengeluaran`
--

DROP TABLE IF EXISTS `t_transaksi_pengeluaran`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_transaksi_pengeluaran` (
  `id_transaksi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_akun` bigint unsigned NOT NULL,
  `id_cogm` bigint unsigned DEFAULT NULL,
  `jenis_pengeluaran` enum('Operasional','Pembayaran Utang Produksi') COLLATE utf8mb4_unicode_ci NOT NULL,
  `jenis_utang` enum('BTKL','BOP') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `no_transaksi` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tgl_transaksi` date NOT NULL,
  `nominal_bayar` decimal(15,2) NOT NULL,
  `metode_bayar` enum('Cash','Transfer') COLLATE utf8mb4_unicode_ci NOT NULL,
  `catatan` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_transaksi`),
  KEY `t_transaksi_pengeluaran_id_akun_foreign` (`id_akun`),
  KEY `t_transaksi_pengeluaran_id_cogm_foreign` (`id_cogm`),
  CONSTRAINT `t_transaksi_pengeluaran_id_akun_foreign` FOREIGN KEY (`id_akun`) REFERENCES `t_akun` (`id_akun`) ON DELETE RESTRICT,
  CONSTRAINT `t_transaksi_pengeluaran_id_cogm_foreign` FOREIGN KEY (`id_cogm`) REFERENCES `t_cogm` (`id_cogm`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_transaksi_pengeluaran`
--

LOCK TABLES `t_transaksi_pengeluaran` WRITE;
/*!40000 ALTER TABLE `t_transaksi_pengeluaran` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_transaksi_pengeluaran` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_utang_produksi`
--

DROP TABLE IF EXISTS `t_utang_produksi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_utang_produksi` (
  `id_utang` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_cogm` bigint unsigned NOT NULL,
  `jenis` enum('BTKL','BOP') COLLATE utf8mb4_unicode_ci NOT NULL,
  `nominal_terbayar` decimal(15,2) NOT NULL DEFAULT '0.00',
  `status` enum('lunas','blm lunas') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'blm lunas',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_utang`),
  KEY `t_utang_produksi_id_cogm_foreign` (`id_cogm`),
  CONSTRAINT `t_utang_produksi_id_cogm_foreign` FOREIGN KEY (`id_cogm`) REFERENCES `t_cogm` (`id_cogm`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_utang_produksi`
--

LOCK TABLES `t_utang_produksi` WRITE;
/*!40000 ALTER TABLE `t_utang_produksi` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_utang_produksi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'super_admin',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Super Admin','admin@gmail.com','super_admin',NULL,'$2y$12$Ed3FfMlUUWTfX2oKsY1jw.BPwfnff2KVRuR4kxjh4xd1FDFS1473a','Nd1v00b28uszWBsfctk2GKUr6AQu79Mva46Zm7LaL2yJ0lIdC9YC5pIQ3AmP','2026-07-14 18:57:47','2026-07-14 22:10:01'),(2,'Test','test@test.com','super_admin',NULL,'$2y$12$.5QeaMRDASE9zrZ4elwBPuRTCYf2pD2zAH97lY6mymp0GIJq8wJfO',NULL,'2026-07-14 21:52:38','2026-07-14 21:52:38'),(3,'Admin Akuntansi','akuntansi@newcitra.com','admin_akuntansi',NULL,'$2y$12$IvmJZQX8KDC2eVROrmKKCubtD5pInlOUTuMddd5lllOaSthLe7/pq',NULL,'2026-07-14 22:10:01','2026-07-14 22:10:01'),(4,'Admin Produksi','produksi@newcitra.com','admin_produksi',NULL,'$2y$12$iqOe0lrFthC8PoR8AhYG2uWr1CqqjU2olY7QcZ4vK983fOoeID/OK',NULL,'2026-07-14 22:10:02','2026-07-14 22:10:02'),(5,'Admin Pembelian','pembelian@newcitra.com','admin_pembelian',NULL,'$2y$12$tdaslSVhFSZ54jNMn34PoePk0x9k/deevbX6UhMSq06iTlb1DOQta',NULL,'2026-07-14 22:10:03','2026-07-14 22:10:03'),(6,'Admin Penjualan','penjualan@newcitra.com','admin_penjualan',NULL,'$2y$12$peSSpqVz/.8n2ylXfCHsBO.F05LJMJTgH4Wj6iIwuPfe79Y58/efi',NULL,'2026-07-14 22:10:04','2026-07-14 22:10:04'),(7,'Manajer','manajer@newcitra.com','manajer',NULL,'$2y$12$kzqJv8M4tkY9KtiU1UC6y.IAseNQIkG3z.wu/6UeepCN435PTBY46',NULL,'2026-07-14 22:10:04','2026-07-14 22:10:04');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'newcitrashadowdb'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-16 18:24:28
