/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.8.3-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: pyq_db
-- ------------------------------------------------------
-- Server version	11.8.3-MariaDB-1+b1 from Debian

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Current Database: `pyq_db`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `pyq_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;

USE `pyq_db`;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `admin_id` int(11) NOT NULL,
  `action` varchar(50) NOT NULL,
  `target_paper_id` int(11) DEFAULT NULL,
  `target_user_id` int(11) DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `metadata_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata_json`)),
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `ip_address` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `admin_id` (`admin_id`),
  KEY `target_paper_id` (`target_paper_id`),
  KEY `target_user_id` (`target_user_id`),
  KEY `idx_audit_logs_created_at` (`created_at`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `audit_logs_ibfk_2` FOREIGN KEY (`target_paper_id`) REFERENCES `papers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `audit_logs_ibfk_3` FOREIGN KEY (`target_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `audit_logs` (`id`, `admin_id`, `action`, `target_paper_id`, `target_user_id`, `reason`, `metadata_json`, `created_at`, `ip_address`) VALUES (1,1,'approve',NULL,1,NULL,NULL,'2026-02-14 09:48:30',NULL),
(2,1,'approve',NULL,NULL,NULL,NULL,'2026-02-14 10:01:06',NULL),
(3,1,'update_settings',NULL,NULL,'Updated system configuration: auto_approval, mod_assignment, spam_sensitivity, max_file_size, allowed_extensions',NULL,'2026-02-14 11:53:40','127.0.0.1'),
(4,1,'delete_paper',NULL,NULL,'Deleted paper: rr (RR - 2024-2025) by a',NULL,'2026-02-14 11:58:39','127.0.0.1'),
(5,1,'approve',NULL,1,NULL,NULL,'2026-02-14 11:59:33','127.0.0.1'),
(6,1,'approve',NULL,1,NULL,NULL,'2026-02-14 12:38:11','127.0.0.1'),
(7,1,'approve',NULL,NULL,NULL,NULL,'2026-02-15 07:01:52','127.0.0.1'),
(8,1,'reject',NULL,NULL,'Duplicate Registry Entry: please dont upload this things ',NULL,'2026-02-15 07:24:21','127.0.0.1'),
(9,1,'test',NULL,NULL,NULL,NULL,'2026-02-15 08:01:12','127.0.0.1'),
(10,1,'reject',NULL,NULL,'Rejected by admin',NULL,'2026-02-15 08:06:15','127.0.0.1'),
(13,1,'reject',NULL,NULL,'Legibility Failure (Blurry): sdhaskhdajshdahsshdhshd testsdhaskhdajshdahsshdhshd testsdhaskhdajshdahsshdhshd test',NULL,'2026-02-15 08:24:19','127.0.0.1'),
(14,1,'approve',13,NULL,NULL,NULL,'2026-02-15 11:52:08','127.0.0.1'),
(15,1,'update_paper_metadata',14,NULL,'Metadata updated by super admin: Basics of computer science & Ms-Office Suite (BAI - 301)',NULL,'2026-02-15 12:01:16','127.0.0.1'),
(16,1,'approve',14,NULL,NULL,NULL,'2026-02-15 12:01:22','127.0.0.1'),
(17,1,'delete_paper',NULL,NULL,'Deleted paper: dsaaaa (AAA - 2024-2025) by a',NULL,'2026-02-16 04:54:02','127.0.0.1'),
(18,1,'update_role',NULL,NULL,'Changed to admin',NULL,'2026-02-16 04:54:48','127.0.0.1'),
(19,1,'update_role',NULL,NULL,'Changed to student',NULL,'2026-02-16 04:54:50','127.0.0.1'),
(20,1,'update_role',NULL,NULL,'Changed to admin',NULL,'2026-02-16 04:54:50','127.0.0.1'),
(29,1,'delete_paper',NULL,NULL,'Deleted paper: rr (RR - 2024-2025) by a',NULL,'2026-02-16 04:59:39','127.0.0.1'),
(31,1,'update_settings',NULL,NULL,'Updated system configuration: auto_approval, mod_assignment, spam_sensitivity, max_file_size, allowed_extensions',NULL,'2026-02-27 07:34:12','127.0.0.1'),
(32,1,'reject',NULL,NULL,'Metadata Inconsistency: Adidnudnsidjdj',NULL,'2026-02-27 08:00:44','127.0.0.1'),
(33,1,'approve',NULL,NULL,NULL,NULL,'2026-03-24 12:33:42','127.0.0.1'),
(34,1,'delete_paper',NULL,NULL,'Deleted paper: Test (101 - 2023) by Aakash Modi',NULL,'2026-03-24 12:45:53','127.0.0.1'),
(35,1,'delete_paper',NULL,NULL,'Deleted paper: Testing (BAI - 101 - 2024-2025) by AAA',NULL,'2026-03-24 12:45:56','127.0.0.1'),
(36,1,'update_role',NULL,NULL,'Changed to admin',NULL,'2026-05-08 01:49:34','127.0.0.1'),
(37,1,'update_role',NULL,NULL,'Changed to student',NULL,'2026-05-08 01:49:34','127.0.0.1'),
(38,1,'update_role',NULL,NULL,'Changed to admin',NULL,'2026-05-08 01:49:35','127.0.0.1'),
(39,1,'update_role',NULL,NULL,'Changed to student',NULL,'2026-05-08 01:49:36','127.0.0.1'),
(42,1,'delete_user',NULL,NULL,'Permanently deleted user: Knowledge Hub (knowledge.pyqs@gmail.com)',NULL,'2026-05-08 02:04:52','127.0.0.1'),
(43,1,'delete_user',NULL,NULL,'Permanently deleted user: Knowledge Hub (knowledge.pyqs@gmail.com)',NULL,'2026-05-08 02:29:49','127.0.0.1'),
(44,1,'approve',NULL,NULL,NULL,NULL,'2026-05-08 10:30:15','127.0.0.1'),
(45,1,'delete_user',NULL,NULL,'Permanently deleted user: Knowledge Hub (knowledge.pyqs@gmail.com)',NULL,'2026-05-08 10:31:37','127.0.0.1'),
(46,1,'delete_paper',NULL,NULL,'Deleted paper: test2_delete (1 - 2022) by Unknown',NULL,'2026-05-08 10:33:15','127.0.0.1'),
(47,1,'delete_paper',NULL,NULL,'Deleted paper: Jshs (ISJD - 2023-2024) by AAA',NULL,'2026-05-08 10:33:25','127.0.0.1');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `bookmarks`
--

DROP TABLE IF EXISTS `bookmarks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookmarks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `paper_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_bookmark` (`user_id`,`paper_id`),
  KEY `paper_id` (`paper_id`),
  CONSTRAINT `bookmarks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bookmarks_ibfk_2` FOREIGN KEY (`paper_id`) REFERENCES `papers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookmarks`
--

LOCK TABLES `bookmarks` WRITE;
/*!40000 ALTER TABLE `bookmarks` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `bookmarks` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `code` varchar(10) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `departments` (`id`, `name`, `code`, `created_at`) VALUES (1,'Department of Computer Science','CS','2026-02-14 14:45:10'),
(7,'Department of Chemistry','CH','2026-02-14 14:45:10'),
(48,'Department of Botany','BO','2026-02-15 13:59:56'),
(49,'Department of Business Management','BM','2026-02-15 13:59:56'),
(51,'Department of English','EN','2026-02-15 13:59:56'),
(52,'Department of Geology','GE','2026-02-15 13:59:56'),
(53,'Department of Journalism (Journalism and Mass Communication)','JC','2026-02-15 13:59:56'),
(56,'Department of Tourism and Hospitality Management','TH','2026-02-15 13:59:56'),
(58,'Others (Elective Subjects)','OTH','2026-05-08 18:24:19');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `downloads`
--

DROP TABLE IF EXISTS `downloads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `downloads` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `paper_id` int(11) NOT NULL,
  `downloaded_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `paper_id` (`paper_id`),
  CONSTRAINT `downloads_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `downloads_ibfk_2` FOREIGN KEY (`paper_id`) REFERENCES `papers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `downloads`
--

LOCK TABLES `downloads` WRITE;
/*!40000 ALTER TABLE `downloads` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `downloads` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `leaderboard_points`
--

DROP TABLE IF EXISTS `leaderboard_points`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `leaderboard_points` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `points` int(11) NOT NULL DEFAULT 0,
  `action_type` enum('upload','approved','download_milestone','bonus') NOT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `leaderboard_points_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leaderboard_points`
--

LOCK TABLES `leaderboard_points` WRITE;
/*!40000 ALTER TABLE `leaderboard_points` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `leaderboard_points` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `link` varchar(255) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_notif` (`user_id`,`is_read`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `link`, `is_read`, `created_at`) VALUES (1,1,'warning','New Pending Paper','User AAA uploaded \"aa\". Approval required.','/admin/moderation',0,'2026-02-15 07:00:59'),
(2,1,'info','Test','Connectivity Test',NULL,0,'2026-02-15 12:32:02'),
(4,1,'danger','Test','Test',NULL,1,'2026-02-15 08:02:06'),
(7,1,'warning','New Pending Paper','User AAA uploaded \"wqwq\". Approval required.','/admin/moderation',0,'2026-02-15 08:23:37'),
(9,1,'success','New User Registered','User Aakash (aakashmodi150@gmail.com) has joined the platform.','/admin/users',0,'2026-02-15 11:02:26'),
(10,1,'success','New User Registered','User Aakash (work.aakash.modi@gmail.com) has joined and verified their account.','/admin/users',0,'2026-02-15 11:46:43'),
(11,1,'warning','New Pending Paper','User Aakash uploaded \"Basics of computer science & Ms-Office Suite\". Approval required.','/admin/moderation',0,'2026-02-15 11:51:08'),
(13,1,'warning','New Pending Paper','User Aakash uploaded \"Basics of computer science & Ms-Office Suite\". Approval required.','/admin/moderation',0,'2026-02-15 12:00:40'),
(15,1,'warning','New Pending Paper','User AAA uploaded \"Testing\". Approval required.','/admin/moderation',0,'2026-02-16 06:43:51'),
(18,1,'warning','New Pending Paper','User AAA uploaded \"Jshs\". Approval required.','/sector-delta/moderation',0,'2026-02-27 07:59:58'),
(20,1,'success','New User Registered','User Aakash Modi (yapesiw725@exahut.com) has joined and verified their account.','/sector-delta/users',0,'2026-03-24 11:18:17'),
(21,1,'warning','New Pending Paper','User Aakash Modi uploaded \"Test\". Approval required.','/sector-delta/moderation',0,'2026-03-24 12:32:40'),
(23,1,'success','New User Registered (Google)','User Knowledge Hub (knowledge.pyqs@gmail.com) has joined via Google OAuth.','/sector-delta/users',0,'2026-05-08 01:34:18'),
(24,1,'success','New User Registered (Google)','User Knowledge Hub (knowledge.pyqs@gmail.com) has joined via Google OAuth.','/sector-delta/users',0,'2026-05-08 02:05:15'),
(25,1,'success','New User Registered (Google)','User Knowledge Hub (knowledge.pyqs@gmail.com) has joined via Google OAuth.','/sector-delta/users',0,'2026-05-08 02:30:30'),
(26,1,'warning','New Pending Paper','User Knowledge Hub uploaded \"test1\". Approval required.','/sector-delta/moderation',0,'2026-05-08 10:28:21'),
(27,1,'warning','New Pending Paper','User Knowledge Hub uploaded \"test2_delete\". Approval required.','/sector-delta/moderation',0,'2026-05-08 10:29:16'),
(29,1,'success','New User Registered (Google)','User Knowledge Hub (knowledge.pyqs@gmail.com) has joined via Google OAuth.','/sector-delta/users',0,'2026-05-08 10:32:45');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `otps`
--

DROP TABLE IF EXISTS `otps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `otps` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(150) NOT NULL,
  `code` varchar(6) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `name` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `semester` int(11) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `purpose` varchar(50) DEFAULT 'registration',
  `attempts` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otps`
--

LOCK TABLES `otps` WRITE;
/*!40000 ALTER TABLE `otps` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `otps` (`id`, `email`, `code`, `expires_at`, `created_at`, `name`, `password_hash`, `department_id`, `semester`, `phone_number`, `purpose`, `attempts`) VALUES (2,'mitec52662@desiys.com','315833','2026-02-15 17:13:47','2026-02-15 16:56:04','Aakash','$2b$12$ZSPY70MV6y.dHlIOM6ZLn.F5SDSUg/4pYBOAXDaa9LO8NeTjbAibC',1,NULL,NULL,'registration',0),
(3,'noreb66797@desiys.com','047368','2026-02-15 17:15:26','2026-02-15 17:05:26','Aakash','$2b$12$kUbYqMK5jzRw4UOAzro5M.TSUKPiAMER4m5Gc6Z46ORsBMt9Xc39i',1,NULL,NULL,'registration',0),
(10,'work.aakash.modi@gmail.com','878421','2026-02-27 13:58:10','2026-02-27 13:48:10','__PASSWORD_RESET__',NULL,NULL,NULL,NULL,'registration',0),
(11,'aakashmodi@gmail.com','274907','2026-03-24 16:43:12','2026-03-24 16:33:12','Aakash Modi','$2b$12$i3oFAUU/AZWnSXROI3.9eeP9ds4.xyi3zsMKfst8dYT/jtGVMsnsK',1,NULL,NULL,'registration',0);
/*!40000 ALTER TABLE `otps` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `papers`
--

DROP TABLE IF EXISTS `papers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `papers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `subject_code` varchar(20) NOT NULL,
  `year` varchar(9) NOT NULL,
  `semester` tinyint(4) NOT NULL,
  `exam_type` varchar(50) DEFAULT 'End Semester',
  `file_url` varchar(500) NOT NULL,
  `file_type` varchar(10) DEFAULT 'pdf',
  `file_size` int(11) DEFAULT 0,
  `professor` varchar(100) DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `rejection_reason` text DEFAULT NULL,
  `rating_avg` decimal(2,1) DEFAULT 0.0,
  `rating_count` int(11) DEFAULT 0,
  `download_count` int(11) DEFAULT 0,
  `uploader_id` int(11) DEFAULT NULL,
  `department_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `uploader_id` (`uploader_id`),
  KEY `idx_status` (`status`),
  KEY `idx_dept` (`department_id`),
  KEY `idx_semester` (`semester`),
  KEY `idx_year` (`year`),
  KEY `idx_papers_created_at` (`created_at`),
  CONSTRAINT `papers_ibfk_1` FOREIGN KEY (`uploader_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `papers_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=105 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `papers`
--

LOCK TABLES `papers` WRITE;
/*!40000 ALTER TABLE `papers` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `papers` (`id`, `title`, `subject_code`, `year`, `semester`, `exam_type`, `file_url`, `file_type`, `file_size`, `professor`, `status`, `rejection_reason`, `rating_avg`, `rating_count`, `download_count`, `uploader_id`, `department_id`, `created_at`, `updated_at`) VALUES (3,'ee','NA1','2024-2025',7,'End Semester','1_268627_downloadfile_compressed.pdf','pdf',45246,NULL,'pending',NULL,0.0,0,0,1,1,'2026-02-14 10:04:28','2026-02-14 10:04:28'),
(13,'Basics of Computer Science and MS-Office Suite','BAI - 301','2023-2024',1,'Mid 1','4_68112_Semester-I_Mid-term-1_AImajor.pdf','pdf',119320,NULL,'approved',NULL,0.0,0,0,1,1,'2026-02-15 11:51:08','2026-05-08 17:49:39'),
(14,'Basics of Computer Science & MS-Office Suite','BAI - 301','2023-2024',1,'Mid 2','4_640671_AI_semester-I_Mid-term-II.pdf','pdf',132859,NULL,'approved',NULL,0.0,0,1,1,1,'2026-02-15 12:00:40','2026-05-08 17:49:39'),
(15,'Mineral Resources of India','MIDC-204','2023-2024',3,'End Semester','1_1708000001_Mineral Resources-end-semester-iii.pdf','pdf',728995,NULL,'approved',NULL,0.0,0,0,1,52,'2026-02-16 09:37:04','2026-05-08 16:46:58'),
(16,'Mineral Resources of India','GEN-301','2023-2024',3,'Mid 2','1_1708000002_Mineral Resources-mid2-semester-iii.pdf','pdf',562761,NULL,'approved',NULL,0.0,0,0,1,52,'2026-02-16 09:37:04','2026-05-08 18:19:47'),
(17,'Physical Geology and Geodynamics','GEN-101','2023-2024',1,'Mid 1','1_1708000003_Geology Mid-I Semester-I.pdf','pdf',146286,NULL,'approved',NULL,5.0,1,3,1,52,'2026-02-16 09:37:05','2026-05-08 18:19:47'),
(18,'Physical Geology and Geodynamics','GEN-101','2023-2024',1,'End Semester','1_1708000004_Geology Semester-I.pdf','pdf',270406,NULL,'approved',NULL,5.0,1,1,1,52,'2026-02-16 09:37:05','2026-05-08 18:19:47'),
(19,'Physical Geology and Geodynamics','GEN-101','2023-2024',1,'Mid 2','1_1708000005_Geology Mid-II Semester-I.pdf','pdf',159147,NULL,'approved',NULL,4.0,1,1,1,52,'2026-02-16 09:37:05','2026-05-08 18:19:47'),
(20,'Event Management','GEN-401','2023-2024',4,'Mid 1','1_1708000006_BBA-mid1-semester-IV.pdf','pdf',1284387,NULL,'approved',NULL,5.0,1,0,1,49,'2026-02-16 09:37:05','2026-05-08 18:19:47'),
(21,'Event Management','GEN-401','2023-2024',4,'Mid 2','1_1708000007_BBA-mid2-semester-IV.pdf','pdf',759656,NULL,'approved',NULL,5.0,1,0,1,49,'2026-02-16 09:37:05','2026-05-08 18:19:47'),
(22,'Crystallography and Mineralogy','GEN-201','2023-2024',2,'Mid 1','1_1708000008_Geology Mid-II Semester-II.pdf','pdf',118749,NULL,'approved',NULL,0.0,0,0,1,52,'2026-02-16 09:37:05','2026-05-08 18:19:47'),
(23,'Crystallography and Mineralogy','GEOIS51','2023-2024',2,'End Semester','1_1708000009_Geology End-Semester-II.pdf','pdf',168648,NULL,'approved',NULL,0.0,0,0,1,52,'2026-02-16 09:37:05','2026-05-08 17:02:41'),
(24,'Biodiversity','GEN-101','2023-2024',1,'End Semester','1_1708000010_Botany End-Semester.pdf','pdf',254330,NULL,'approved',NULL,0.0,0,0,1,48,'2026-02-16 09:37:05','2026-05-08 18:19:47'),
(25,'Biodiversity','GEN-101','2023-2024',1,'Mid 1','1_1708000011_Botany, Semester-I Mid -1.pdf','pdf',71927,NULL,'approved',NULL,0.0,0,0,1,48,'2026-02-16 09:37:05','2026-05-08 18:19:47'),
(26,'Biodiversity','GEN-101','2023-2024',1,'Mid 1','1_1708000012_Botany, Semester-I Mid -2.pdf','pdf',101586,NULL,'approved',NULL,0.0,0,0,1,48,'2026-02-16 09:37:05','2026-05-08 18:19:47'),
(27,'Inorganic Chemistry-1','GEN-101','2023-2024',1,'Mid 1','1_1708000013_Chemistry Mid-1 semester-1.pdf','pdf',147268,NULL,'approved',NULL,0.0,0,0,1,7,'2026-02-16 09:37:05','2026-05-08 18:19:47'),
(28,'Inorganic Chemistry-1','GEN-101','2023-2024',1,'Mid 1','1_1708000014_Chemistry Mid-2 semester-1.pdf','pdf',127204,NULL,'approved',NULL,0.0,0,0,1,7,'2026-02-16 09:37:05','2026-05-08 18:19:47'),
(29,'Inorganic Chemistry-1','GEN-101','2023-2024',1,'Mid 1','1_1708000015_Chemistry Mid-1 semester-1-Batch-24.pdf','pdf',698297,NULL,'approved',NULL,4.0,1,0,1,7,'2026-02-16 09:37:05','2026-05-08 18:19:47'),
(30,'Inorganic Chemistry-I','GEN-101','2023-2024',1,'End Semester','1_1708000016_Chemistry End-semester-1.pdf','pdf',322820,NULL,'approved',NULL,0.0,0,0,1,7,'2026-02-16 09:37:05','2026-05-08 18:19:47'),
(31,'Leadership and Management Skills','SEC','2023-2024',3,'End Semester','1_1708000017_Leadership-Management-Skills-end-semester-iii.pdf','pdf',447384,NULL,'approved',NULL,0.0,0,0,1,58,'2026-02-16 09:37:05','2026-05-08 18:24:43'),
(32,'Plant Morphology and Anatomy','GEN-201','2023-2024',2,'End Semester','1_1708000018_Botany End-Semester.pdf','pdf',226362,NULL,'approved',NULL,0.0,0,0,1,48,'2026-02-16 09:37:05','2026-05-08 18:19:47'),
(33,'Plant Morphology and Anatomy','GEN-201','2023-2024',2,'Mid 2','1_1708000019_Botany, Semester-II Mid -2.pdf','pdf',80237,NULL,'approved',NULL,0.0,0,0,1,48,'2026-02-16 09:37:05','2026-05-08 18:19:47'),
(34,'Database Management Systems','GEN-301','2023-2024',3,'End Semester','1_1708000020_Database-Management-Systems-end-semester-iii.pdf','pdf',847959,NULL,'approved',NULL,0.0,0,0,1,1,'2026-02-16 09:37:05','2026-05-08 18:19:47'),
(35,'Database Management Systems','GEN-301','2023-2024',3,'Mid 2','1_1708000021_Database-Management-Systems-mid2-semester-iii.pdf','pdf',574067,NULL,'approved',NULL,0.0,0,0,1,1,'2026-02-16 09:37:05','2026-05-08 18:19:47'),
(36,'Object Oriented Programming using C++','GEN-301','2023-2024',3,'Mid 2','1_1708000022_C++-mid2-semester-iii.pdf','pdf',1236832,NULL,'approved',NULL,0.0,0,0,1,1,'2026-02-16 09:37:05','2026-05-08 18:19:47'),
(37,'Object Programming using C++','GEN-301','2023-2024',3,'End Semester','1_1708000023_C++-end-semester-iii.pdf','pdf',1138415,NULL,'approved',NULL,0.0,0,0,1,1,'2026-02-16 09:37:05','2026-05-08 18:19:47'),
(38,'Organic Chemistry-1','GEN-201','2023-2024',2,'Mid 1','1_1708000024_chemistry Mid-1 semester-2.pdf','pdf',136501,NULL,'approved',NULL,0.0,0,0,1,7,'2026-02-16 09:37:05','2026-05-08 18:19:47'),
(39,'Organic Chemistry-I','GEN-201','2023-2024',2,'End Semester','1_1708000025_chemistry Semester-2.pdf','pdf',261200,NULL,'approved',NULL,0.0,0,0,1,7,'2026-02-16 09:37:05','2026-05-08 18:19:47'),
(40,'Physical Chemistry-I','GEN-201','2023-2024',3,'Mid 1','1_1708000026_Physical Chemistry-mid1-semester-iii.pdf','pdf',681838,NULL,'approved',NULL,0.0,0,0,1,7,'2026-02-16 09:37:05','2026-05-08 18:19:47'),
(41,'Marketing Management','GEN-201','2023-2024',3,'Mid 1','1_1708000027_Market-Management-mid1-semester-iii.pdf','pdf',556565,NULL,'approved',NULL,0.0,0,0,1,1,'2026-02-16 09:37:05','2026-05-08 18:19:47'),
(42,'Basics of Accounting','BTM','2023-2024',2,'End Semester','1_1708000028_End-semester-II.pdf','pdf',850752,NULL,'approved',NULL,0.0,0,0,1,1,'2026-02-16 09:37:05','2026-05-08 17:03:23'),
(43,'Marketing Management','GEN-201','2023-2024',3,'Mid 2','1_1708000029_Market-Management-mid2-semester-iii.pdf','pdf',574621,NULL,'approved',NULL,0.0,0,0,1,1,'2026-02-16 09:37:05','2026-05-08 18:19:47'),
(44,'Basics of Accounting','GEN-201','2023-2024',2,'Mid 1','1_1708000030_AI-Minor-Semester-II Mid-1.pdf','pdf',125557,NULL,'approved',NULL,0.0,0,0,1,1,'2026-02-16 09:37:05','2026-05-08 18:19:47'),
(45,'Basics of Accounting','GEN-201','2023-2024',2,'Mid 2','1_1708000031_semester -II Mid-2.pdf','pdf',347096,NULL,'approved',NULL,0.0,0,0,1,1,'2026-02-16 09:37:05','2026-05-08 18:19:47'),
(46,'Marketing Management','GEN-201','2023-2024',3,'End Semester','1_1708000032_Market-Management-end-semester-iii.pdf','pdf',774018,NULL,'approved',NULL,0.0,0,0,1,1,'2026-02-16 09:37:05','2026-05-08 18:19:47'),
(47,'Good Laboratory Practices','GEN-401','2023-2024',4,'Mid 2','1_1708000033_AI-GLP-mid2-semester-IV.pdf','pdf',1041368,NULL,'approved',NULL,0.0,0,0,1,1,'2026-02-16 09:37:05','2026-05-08 18:19:47'),
(48,'Python Programming','GEN-401','2023-2024',4,'Mid 2','1_1708000034_Python-mid2-semester-IV.pdf','pdf',1168991,NULL,'approved',NULL,0.0,0,0,1,1,'2026-02-16 09:37:05','2026-05-08 18:19:47'),
(49,'Introduction to Artificial Intelligence','GEN-401','2023-2024',4,'Mid 2','1_1708000035_AI-mid2-semester-IV.pdf','pdf',1128337,NULL,'approved',NULL,0.0,0,0,1,1,'2026-02-16 09:37:05','2026-05-08 18:19:47'),
(50,'Emotional Intelligence','GEN-201','2023-2024',2,'End Semester','1_1708000036_End-semester-II.pdf','pdf',173781,NULL,'approved',NULL,0.0,0,0,1,58,'2026-02-16 09:37:05','2026-05-08 18:24:43'),
(51,'Emotional Intelligence','GEN-201','2023-2024',2,'Mid 1','1_1708000037_EI Semester-II Mid-1 Common.pdf','pdf',145311,NULL,'approved',NULL,0.0,0,0,1,58,'2026-02-16 09:37:05','2026-05-08 18:24:43'),
(52,'Emotional Intelligence','GEN-101','2023-2024',2,'Mid 2','1_1708000038_semester -II Mid-2-7.pdf','pdf',346796,NULL,'approved',NULL,0.0,0,0,1,58,'2026-02-16 09:37:05','2026-05-08 18:24:43'),
(53,'Tourism Concepts, Systems, and Functions','MDC155','2023-2024',2,'End Semester','1_1708000039_End-semester-II.pdf','pdf',184894,NULL,'approved',NULL,0.0,0,0,1,56,'2026-02-16 09:37:05','2026-05-08 17:51:29'),
(54,'Tourism Concepts, Systems and Functions','GEN-201','2023-2024',2,'Mid 2','1_1708000040_TTM Semester-II Mid-1_1-4 Common.pdf','pdf',103462,NULL,'approved',NULL,0.0,0,0,1,56,'2026-02-16 09:37:05','2026-05-08 17:51:29'),
(55,'Tourism Concepts, Systems and Functions','GEN-101','2023-2024',2,'Mid 1','1_1708000041_semester -II Mid-2.pdf','pdf',245752,NULL,'approved',NULL,0.0,0,0,1,56,'2026-02-16 09:37:05','2026-05-08 17:51:29'),
(56,'Software, Hardware and Networking','GEN-201','2023-2024',2,'End Semester','1_1708000042_End-semester-II.pdf','pdf',141490,NULL,'approved',NULL,0.0,0,0,1,58,'2026-02-16 09:37:05','2026-05-08 18:24:43'),
(57,'Basics of Computer Science and MS-Office Suite','GEN-101','2023-2024',1,'Mid 1','1_1708000043_semester -II Mid-1-Batch-24.pdf','pdf',719152,NULL,'approved',NULL,0.0,0,0,1,58,'2026-02-16 09:37:05','2026-05-08 18:24:43'),
(58,'Software, Hardware and Networking','GEN-101','2023-2024',2,'Mid 2','1_1708000044_semester -II Mid-2.pdf','pdf',354373,NULL,'approved',NULL,0.0,0,0,1,58,'2026-02-16 09:37:05','2026-05-08 18:24:43'),
(59,'Hindi','GEN-201','2023-2024',2,'End Semester','1_1708000045_End-semester-II.pdf','pdf',82224,NULL,'approved',NULL,0.0,0,0,1,58,'2026-02-16 09:37:05','2026-05-08 18:24:30'),
(60,'Hindi','GEN-401','2023-2024',4,'Mid 2','1_1708000046_Hindi-mid2-semester-IV.pdf','pdf',757003,NULL,'approved',NULL,0.0,0,0,1,58,'2026-02-16 09:37:05','2026-05-08 18:24:30'),
(61,'Hindi','GEN-101','2023-2024',2,'Mid 2','1_1708000047_semester -II Mid-2.pdf','pdf',163851,NULL,'approved',NULL,0.0,0,0,1,58,'2026-02-16 09:37:05','2026-05-08 18:24:30'),
(62,'Hindi','GEN-201','2023-2024',1,'Mid 1','1_1708000048_Mid-1 Semester-II.pdf','pdf',99131,NULL,'approved',NULL,0.0,0,0,1,58,'2026-02-16 09:37:05','2026-05-08 18:24:30'),
(63,'Hindi','GEN-401','2023-2024',4,'Mid 1','1_1708000049_Hindi-mid1-semester-IV.pdf','pdf',988281,NULL,'approved',NULL,0.0,0,0,1,58,'2026-02-16 09:37:05','2026-05-08 18:24:30'),
(64,'Environmental Science','VACI51','2023-2024',2,'End Semester','1_1708000050_End-semester-II.pdf','pdf',204078,NULL,'approved',NULL,0.0,0,0,1,58,'2026-02-16 09:37:05','2026-05-08 18:24:30'),
(65,'Environmental Science','GEN-201','2023-2024',2,'Mid 1','1_1708000051_Semester-II Mid-1.pdf','pdf',134142,NULL,'approved',NULL,0.0,0,0,1,58,'2026-02-16 09:37:05','2026-05-08 18:24:30'),
(66,'Environmental Science','GEN-101','2023-2024',2,'Mid 2','1_1708000052_semester -II Mid-2.pdf','pdf',257787,NULL,'approved',NULL,0.0,0,0,1,58,'2026-02-16 09:37:05','2026-05-08 18:24:30'),
(67,'Desktop Publishing (DTP)','GEN-301','2023-2024',3,'Mid 1','1_1708000053_Desktop-Publishing-mid1-semester-iii.pdf','pdf',559943,NULL,'approved',NULL,0.0,0,0,1,53,'2026-02-16 09:37:05','2026-05-08 17:49:39'),
(68,'DTP (Multi Disciplinary)','GEN-301','2023-2024',3,'Mid 2','1_1708000054_Desktop-Publishing-mid2-semester-iii.pdf','pdf',537322,NULL,'approved',NULL,0.0,0,0,1,53,'2026-02-16 09:37:05','2026-05-08 17:49:39'),
(69,'Programming for Problem Solving using \"C\"','GEN-201','2023-2024',2,'End Semester','1_1708000055_End-semester-II.pdf','pdf',181293,NULL,'approved',NULL,0.0,0,1,1,1,'2026-02-16 09:37:05','2026-05-08 17:49:39'),
(70,'Programming for Problem Solving using \"C\"','GEN-201','2023-2024',2,'Mid 2','1_1708000056_AI Semester-II Mid-2.pdf','pdf',539032,NULL,'approved',NULL,0.0,0,0,1,1,'2026-02-16 09:37:05','2026-05-08 17:49:39'),
(71,'Programming for Problem Solving using \"C\"','GEN-201','2023-2024',2,'Mid 1','1_1708000057_AI Semester-II Mid-1.pdf','pdf',127695,NULL,'approved',NULL,0.0,0,0,1,1,'2026-02-16 09:37:05','2026-05-08 17:49:39'),
(72,'Basics of Computer Science & MS-Office Suite','GEN-101','2023-2024',1,'Mid 2','1_1708000058_AI semester-I, Mid-term-II.pdf','pdf',132859,NULL,'approved',NULL,0.0,0,0,1,1,'2026-02-16 09:37:05','2026-05-08 17:49:39'),
(73,'Basics of Computer Science and MS-Office Suite','GEN-101','2023-2024',1,'Mid 1','1_1708000059_Semester-I, Mid-term-1, AImajor.pdf','pdf',119320,NULL,'approved',NULL,0.0,0,0,1,1,'2026-02-16 09:37:05','2026-05-08 17:49:39'),
(74,'Basics of Computer Science and MS-Office Suite','GEN-101','2023-2024',1,'End Semester','1_1708000060_AI End-semester_1.pdf','pdf',271504,NULL,'approved',NULL,0.0,0,0,1,1,'2026-02-16 09:37:05','2026-05-08 17:49:39'),
(75,'Introduction to Renewable Energy','GEN-301','2023-2024',4,'Mid 1','1_1708000061_Renewable Energy-mid1-semester-iii.pdf','pdf',626656,NULL,'approved',NULL,0.0,0,0,1,49,'2026-02-16 09:37:05','2026-05-08 17:49:39'),
(76,'Good Laboratory Practices (GLP)','GEN-301','2023-2024',4,'Mid 1','1_1708000062_Renewable Energy-mid2-semester-iii.pdf','pdf',616984,NULL,'approved',NULL,0.0,0,0,1,49,'2026-02-16 09:37:05','2026-05-08 17:49:39'),
(77,'Indian Constitution and Heritage','GEN-101','2023-2024',1,'End Semester','1_1708000063_End-semester_1.pdf','pdf',316066,NULL,'approved',NULL,0.0,0,0,1,58,'2026-02-16 09:37:05','2026-05-08 18:24:30'),
(78,'Indian Heritage and Constitution','GEN-101','2023-2024',1,'Mid 1','1_1708000064_Semester-I Mid-I-Batch-24.pdf','pdf',885957,NULL,'approved',NULL,0.0,0,0,1,58,'2026-02-16 09:37:05','2026-05-08 18:24:30'),
(79,'Indian Constitution and Heritage','GEN-101','2023-2024',1,'Mid 1','1_1708000065_Semester-I Mid-I.pdf','pdf',119211,NULL,'approved',NULL,0.0,0,0,1,58,'2026-02-16 09:37:05','2026-05-08 18:24:30'),
(80,'Indian Constitution and Heritage','GEN-101','2023-2024',1,'Mid 2','1_1708000066_Semester-I Mid-II.pdf','pdf',167009,NULL,'approved',NULL,0.0,0,0,1,58,'2026-02-16 09:37:05','2026-05-08 18:24:30'),
(81,'Verbal Ability and Quantitative Aptitude','GEN-101','2023-2024',1,'Mid 1','1_1708000067_Semester-I, Mid-term-I.pdf','pdf',409706,NULL,'approved',NULL,0.0,0,0,1,58,'2026-02-16 09:37:05','2026-05-08 18:24:30'),
(82,'Verbal Ability and Quantitative Aptitude','GEN-101','2023-2024',1,'End Semester','1_1708000068_End-semester_1.pdf','pdf',681390,NULL,'approved',NULL,0.0,0,0,1,58,'2026-02-16 09:37:05','2026-05-08 18:24:30'),
(83,'Verbal Ability and Quantitative Aptitude','GEN-101','2023-2024',2,'Mid 2','1_1708000069_semester-I, Mid-term-II.pdf','pdf',339394,NULL,'approved',NULL,0.0,0,0,1,58,'2026-02-16 09:37:05','2026-05-08 18:24:30'),
(84,'Verbal Ability and Quantitative Aptitude','GEN-101','2023-2024',1,'Mid 1','1_1708000070_Semester-I, Mid-term-I-Batch-24.pdf','pdf',1796434,NULL,'approved',NULL,0.0,0,0,1,58,'2026-02-16 09:37:05','2026-05-08 18:24:30'),
(85,'English for Communication - I','GEN-101','2023-2024',1,'Mid 1','1_1708000071_Semester-I, Mid-term-I.pdf','pdf',160203,NULL,'approved',NULL,0.0,0,0,1,51,'2026-02-16 09:37:05','2026-05-08 17:49:39'),
(86,'English for Communication - I','GEN-101','2023-2024',1,'End Semester','1_1708000072_End-semester_.pdf','pdf',402762,NULL,'approved',NULL,0.0,0,0,1,51,'2026-02-16 09:37:05','2026-05-08 17:49:39'),
(87,'English for Communication - II','GEN-301','2023-2024',3,'End Semester','1_1708000073_English-end-semester-iii.pdf','pdf',1053677,NULL,'approved',NULL,0.0,0,0,1,51,'2026-02-16 09:37:05','2026-05-08 17:49:39'),
(88,'English for Communication - I','GEN-101','2023-2024',1,'Mid 2','1_1708000074_semester-I, Mid-term-II.pdf','pdf',218604,NULL,'approved',NULL,0.0,0,0,1,51,'2026-02-16 09:37:05','2026-05-08 17:49:39'),
(89,'English for Communication - II','GEN-301','2023-2024',3,'Mid 2','1_1708000075_English-mid2-semester-iii.pdf','pdf',747804,NULL,'approved',NULL,0.0,0,0,1,51,'2026-02-16 09:37:05','2026-05-08 17:49:39'),
(90,'English for Communication - I','GEN-101','2023-2024',1,'Mid 1','1_1708000076_Semester-I, Mid-term-I-Batch-24.pdf','pdf',825278,NULL,'approved',NULL,0.0,0,0,1,51,'2026-02-16 09:37:05','2026-05-08 17:49:39'),
(91,'Personality Development','GEN-101','2023-2024',1,'Mid 1','1_1708000077_Semester-I, Mid-term-I.pdf','pdf',127374,NULL,'approved',NULL,0.0,0,0,1,58,'2026-02-16 09:37:05','2026-05-08 18:24:30'),
(92,'Personality Development','GEN-101','2023-2024',1,'End Semester','1_1708000078_End-semester_1.pdf','pdf',314196,NULL,'approved',NULL,0.0,0,1,1,58,'2026-02-16 09:37:05','2026-05-08 18:24:30'),
(93,'Personality Development','GEN-101','2023-2024',1,'Mid 2','1_1708000079_semester-I, Mid-term-II.pdf','pdf',123964,NULL,'approved',NULL,0.0,0,0,1,58,'2026-02-16 09:37:05','2026-05-08 18:24:30'),
(94,'Personality Development','GEN-101','2023-2024',1,'Mid 1','1_1708000080_Semester-I, Mid-term-I-Batch-24.pdf','pdf',746652,NULL,'approved',NULL,0.0,0,0,1,58,'2026-02-16 09:37:05','2026-05-08 18:24:30'),
(95,'Global Tourism Geography','GEN-101','2023-2024',1,'Mid 1','1_1708000081_Semester-I, Mid-term-I.pdf','pdf',115406,NULL,'approved',NULL,0.0,0,0,1,56,'2026-02-16 09:37:05','2026-05-08 17:51:29'),
(96,'Global Tourism Geography','GEN-101','2023-2024',1,'End Semester','1_1708000082_End-semester_1.pdf','pdf',277679,NULL,'approved',NULL,0.0,0,0,1,56,'2026-02-16 09:37:05','2026-05-08 17:51:29'),
(97,'Global Tourism Geography','GEN-101','2023-2024',1,'Mid 2','1_1708000083_semester-I, Mid-term-II.pdf','pdf',109034,NULL,'approved',NULL,0.0,0,0,1,56,'2026-02-16 09:37:05','2026-05-08 17:51:29'),
(98,'Management Concepts and Organizational Behaviour','GEN-101','2023-2024',1,'Mid 1','1_1708000084_Semester-I, Mid-term-I.pdf','pdf',127307,NULL,'approved',NULL,0.0,0,0,1,49,'2026-02-16 09:37:05','2026-05-08 17:51:29'),
(99,'MCOB (Management Concepts and Organizational Behaviour)','GEN-101','2023-2024',1,'Mid 2','1_1708000085_semester-I, Mid-term-II.pdf','pdf',114080,NULL,'approved',NULL,0.0,0,3,1,49,'2026-02-16 09:37:05','2026-05-10 02:06:32');
/*!40000 ALTER TABLE `papers` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `ratings`
--

DROP TABLE IF EXISTS `ratings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ratings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `paper_id` int(11) NOT NULL,
  `score` tinyint(4) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_rating` (`user_id`,`paper_id`),
  KEY `idx_rating_paper` (`paper_id`,`score`),
  KEY `idx_rating_user` (`user_id`),
  CONSTRAINT `ratings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ratings_ibfk_2` FOREIGN KEY (`paper_id`) REFERENCES `papers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `CONSTRAINT_1` CHECK (`score` between 1 and 5)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ratings`
--

LOCK TABLES `ratings` WRITE;
/*!40000 ALTER TABLE `ratings` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `ratings` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `security_logs`
--

DROP TABLE IF EXISTS `security_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `security_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `event_type` varchar(50) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `metadata_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata_json`)),
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `security_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=156 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `security_logs`
--

LOCK TABLES `security_logs` WRITE;
/*!40000 ALTER TABLE `security_logs` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `security_logs` (`id`, `user_id`, `event_type`, `ip_address`, `metadata_json`, `created_at`) VALUES (4,1,'LOGIN','127.0.0.1','{\"browser\": null, \"os\": null}','2026-02-15 10:48:46'),
(6,1,'LOGIN','127.0.0.1','{\"browser\": null, \"os\": null}','2026-02-15 11:31:11'),
(7,1,'LOGIN','127.0.0.1','{\"browser\": null, \"os\": null}','2026-02-15 11:31:36'),
(8,1,'LOGIN','127.0.0.1','{\"browser\": null, \"os\": null}','2026-02-15 11:39:00'),
(10,1,'LOGIN','127.0.0.1','{\"browser\": null, \"os\": null}','2026-02-15 11:39:55'),
(11,1,'LOGIN','127.0.0.1','{\"browser\": null, \"os\": null}','2026-02-15 11:46:20'),
(12,1,'LOGIN','127.0.0.1','{\"browser\": null, \"os\": null}','2026-02-15 11:54:22'),
(13,1,'LOGIN','127.0.0.1','{\"browser\": null, \"os\": null}','2026-02-15 12:01:34'),
(14,1,'LOGIN','127.0.0.1','{\"browser\": null, \"os\": null}','2026-02-15 12:13:30'),
(16,1,'LOGIN','127.0.0.1','{\"browser\": null, \"os\": null}','2026-02-15 12:14:01'),
(18,1,'LOGIN','127.0.0.1','{\"browser\": null, \"os\": null}','2026-02-15 12:31:33'),
(20,1,'LOGIN','127.0.0.1','{\"browser\": null, \"os\": null}','2026-02-15 13:36:10'),
(23,1,'LOGIN','127.0.0.1','{\"browser\": null, \"os\": null}','2026-02-15 13:53:53'),
(25,1,'LOGIN','127.0.0.1','{\"browser\": null, \"os\": null}','2026-02-15 13:57:13'),
(27,1,'LOGIN','127.0.0.1','{\"browser\": null, \"os\": null}','2026-02-15 14:01:45'),
(35,1,'LOGIN','127.0.0.1','{\"browser\": null, \"os\": null}','2026-02-15 17:21:46'),
(38,1,'LOGIN','127.0.0.1','{\"browser\": null, \"os\": null}','2026-02-15 17:30:53'),
(40,1,'LOGIN','127.0.0.1','{\"browser\": null, \"os\": null}','2026-02-15 17:32:36'),
(42,1,'LOGIN','127.0.0.1','{\"browser\": null, \"os\": null}','2026-02-15 17:35:24'),
(48,1,'LOGIN','127.0.0.1','{\"browser\": null, \"os\": null}','2026-02-16 10:29:13'),
(49,1,'LOGIN','127.0.0.1','{\"browser\": null, \"os\": null}','2026-02-16 10:30:08'),
(58,1,'LOGIN','127.0.0.1','{\"browser\": null, \"os\": null}','2026-02-16 11:19:40'),
(74,1,'LOGIN','127.0.0.1','{\"browser\": null, \"os\": null}','2026-02-16 14:46:01'),
(79,1,'LOGIN','127.0.0.1','{\"browser\": null, \"os\": null}','2026-02-17 08:37:38'),
(80,1,'LOGIN','127.0.0.1','{\"browser\": null, \"os\": null}','2026-02-17 08:37:47'),
(85,1,'LOGIN','127.0.0.1','{\"browser\": null, \"os\": null}','2026-02-17 13:32:52'),
(88,1,'LOGIN','127.0.0.1','{\"browser\": null, \"os\": null}','2026-02-17 13:58:06'),
(89,1,'LOGIN','127.0.0.1','{\"browser\": null, \"os\": null}','2026-02-17 14:00:56'),
(90,1,'LOGIN','127.0.0.1','{\"browser\": null, \"os\": null}','2026-02-17 14:01:17'),
(93,1,'LOGIN','127.0.0.1','{\"browser\": null, \"os\": null}','2026-02-22 06:14:18'),
(96,1,'PWD_RESET','127.0.0.1','null','2026-02-22 07:16:43'),
(97,1,'LOGIN','127.0.0.1','{\"browser\": null, \"os\": null}','2026-02-22 07:16:54'),
(98,1,'LOGIN','127.0.0.1','{\"browser\": null, \"os\": null}','2026-02-22 07:17:28'),
(99,1,'LOGIN','127.0.0.1','{\"browser\": null, \"os\": null}','2026-02-27 12:36:30'),
(102,1,'LOGIN','127.0.0.1','{\"browser\": null, \"os\": null}','2026-02-27 13:02:58'),
(104,1,'LOGIN','127.0.0.1','{\"browser\": null, \"os\": null}','2026-02-27 13:30:22'),
(106,1,'PWD_RESET','127.0.0.1','{\"method\": \"email_otp\"}','2026-02-27 13:32:07'),
(107,1,'LOGIN','127.0.0.1','{\"browser\": null, \"os\": null}','2026-02-27 13:32:39'),
(109,1,'LOGIN','127.0.0.1','{\"browser\": null, \"os\": null}','2026-03-19 12:31:00'),
(110,1,'LOGIN','127.0.0.1','{\"browser\": null, \"os\": null}','2026-03-19 12:31:21'),
(111,1,'LOGIN','127.0.0.1','{\"browser\": null, \"os\": null}','2026-03-19 13:54:24'),
(113,1,'LOGIN','127.0.0.1','{\"browser\": null, \"os\": null}','2026-03-19 14:28:04'),
(114,1,'LOGIN','127.0.0.1','{\"browser\": null, \"os\": null}','2026-03-24 15:42:42'),
(117,1,'LOGIN','127.0.0.1','{\"browser\": null, \"os\": null}','2026-03-24 16:24:45'),
(125,1,'LOGIN','127.0.0.1','{\"browser\": null, \"os\": null}','2026-03-24 18:03:31'),
(127,1,'LOGIN','127.0.0.1','{\"browser\": null, \"os\": null}','2026-03-24 18:15:42'),
(131,1,'GOOGLE_LOGIN','127.0.0.1','{\"email\": \"work.aakash.modi@gmail.com\"}','2026-05-08 07:02:53'),
(134,1,'GOOGLE_LOGIN','127.0.0.1','{\"email\": \"work.aakash.modi@gmail.com\"}','2026-05-08 07:16:56'),
(137,1,'GOOGLE_LOGIN','127.0.0.1','{\"email\": \"work.aakash.modi@gmail.com\"}','2026-05-08 07:24:58'),
(139,1,'GOOGLE_LOGIN','127.0.0.1','{\"email\": \"work.aakash.modi@gmail.com\"}','2026-05-08 07:35:51'),
(140,1,'GOOGLE_LOGIN','127.0.0.1','{\"email\": \"work.aakash.modi@gmail.com\"}','2026-05-08 07:59:40'),
(142,1,'GOOGLE_LOGIN','127.0.0.1','{\"email\": \"work.aakash.modi@gmail.com\"}','2026-05-08 08:00:56'),
(144,1,'GOOGLE_LOGIN','127.0.0.1','{\"email\": \"work.aakash.modi@gmail.com\"}','2026-05-08 15:59:34'),
(146,1,'GOOGLE_LOGIN','127.0.0.1','{\"email\": \"work.aakash.modi@gmail.com\"}','2026-05-08 16:00:59'),
(149,1,'GOOGLE_LOGIN','127.0.0.1','{\"email\": \"work.aakash.modi@gmail.com\"}','2026-05-08 16:03:08'),
(154,1,'GOOGLE_LOGIN','127.0.0.1','{\"email\": \"work.aakash.modi@gmail.com\"}','2026-05-10 07:37:29'),
(155,1,'GOOGLE_LOGIN','127.0.0.1','{\"email\": \"work.aakash.modi@gmail.com\"}','2026-05-10 07:41:17');
/*!40000 ALTER TABLE `security_logs` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_settings` (
  `key` varchar(50) NOT NULL,
  `value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`value`)),
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `system_settings` (`key`, `value`, `updated_at`) VALUES ('allowed_extensions','[\"pdf\", \"docx\", \"jpg\", \"png\", \"zip\", \"txt\", \"*\"]','2026-02-14 17:23:40'),
('auto_approval','false','2026-02-14 17:23:40'),
('clash_subtitle','\"Which department will contribute the most previous year questions this semester?\"',NULL),
('elite_rank_label','\"Elite Rank #1\"',NULL),
('hierarchy_title','\"Department Hierarchy\"',NULL),
('max_file_size','1','2026-02-27 13:04:12'),
('mod_assignment','\"round-robin\"','2026-02-14 17:23:40'),
('scholars_active_label','\"scholars active\"',NULL),
('season_end_date','\"2026-05-20\"',NULL),
('season_name','\"Departmental Clash\"',NULL),
('season_year','\"2025\"',NULL),
('sortBy_momentum_label','\"By Momentum\"',NULL),
('sortBy_volume_label','\"By Volume\"',NULL),
('spam_sensitivity','\"Medium\"','2026-02-14 17:23:40');
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `user_sessions`
--

DROP TABLE IF EXISTS `user_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `jti` varchar(36) NOT NULL,
  `browser` varchar(255) DEFAULT NULL,
  `os` varchar(255) DEFAULT NULL,
  `device_type` varchar(512) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `is_revoked` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `last_active` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `jti` (`jti`),
  KEY `jti_2` (`jti`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=155 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_sessions`
--

LOCK TABLES `user_sessions` WRITE;
/*!40000 ALTER TABLE `user_sessions` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `user_sessions` (`id`, `user_id`, `jti`, `browser`, `os`, `device_type`, `ip_address`, `location`, `is_revoked`, `created_at`, `last_active`) VALUES (1,1,'27389131-22dd-4461-83f3-350853a9a41f',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0','127.0.0.1',NULL,0,'2026-02-15 10:27:56','2026-02-15 10:27:56'),
(7,1,'1d1756f8-ea8e-4a32-bd7a-d6b78ee0a571',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0','127.0.0.1',NULL,0,'2026-02-15 10:48:46','2026-02-15 10:48:46'),
(9,1,'9d184eb4-8b44-4488-a98e-ecad2115f0b4',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0','127.0.0.1',NULL,0,'2026-02-15 11:31:11','2026-02-15 11:31:11'),
(10,1,'5ec5409f-afdd-46a6-befc-74f956d61377',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0','127.0.0.1',NULL,0,'2026-02-15 11:31:36','2026-02-15 11:31:36'),
(11,1,'95231c26-0e18-4351-8a9f-eca3260a42d6',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0','127.0.0.1',NULL,0,'2026-02-15 11:39:00','2026-02-15 11:39:00'),
(13,1,'d3e35c76-599e-4b82-aa93-51302e63d4ca',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0','127.0.0.1',NULL,0,'2026-02-15 11:39:55','2026-02-15 11:39:55'),
(14,1,'3b1ee5b5-6ccf-40d4-8e45-c7cdbbb212e0',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0','127.0.0.1',NULL,0,'2026-02-15 11:46:20','2026-02-15 11:46:20'),
(15,1,'d2f7d11c-e459-49af-82eb-0c586696490b',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0','127.0.0.1',NULL,0,'2026-02-15 11:54:22','2026-02-15 11:54:22'),
(16,1,'e8b4c3bc-3b61-4f0d-a3e9-d3ff3149003c',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0','127.0.0.1',NULL,0,'2026-02-15 12:01:34','2026-02-15 12:01:34'),
(17,1,'0a12593e-12e6-4868-afad-56b93c7f3cab',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0','127.0.0.1',NULL,0,'2026-02-15 12:13:30','2026-02-15 12:13:30'),
(19,1,'2d72ae0f-914b-4d7e-8104-592e45ad1527',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0','127.0.0.1',NULL,0,'2026-02-15 12:14:01','2026-02-15 12:14:01'),
(21,1,'c8a5c16c-6b04-414f-acff-cbb7ed34395b',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0','127.0.0.1',NULL,0,'2026-02-15 12:31:33','2026-02-15 12:31:33'),
(23,1,'2d5f0987-bc91-4bd8-a8bc-25ca9ffca5d4',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0','127.0.0.1',NULL,0,'2026-02-15 13:36:10','2026-02-15 13:36:10'),
(26,1,'a2fc980a-0a28-4ec5-811e-a103732f6c0c',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0','127.0.0.1',NULL,0,'2026-02-15 13:53:53','2026-02-15 13:53:53'),
(28,1,'e8b3dd2f-17f6-4bfa-8497-1b6d975b7606',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0','127.0.0.1',NULL,0,'2026-02-15 13:57:13','2026-02-15 13:57:13'),
(30,1,'1bace371-28b8-4b07-ba32-f215ead1a38e',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0','127.0.0.1',NULL,0,'2026-02-15 14:01:45','2026-02-15 14:01:45'),
(37,1,'6975e612-6706-4bbb-add2-a99a49f04de8',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0','127.0.0.1',NULL,0,'2026-02-15 17:21:46','2026-02-15 17:21:46'),
(40,1,'51c933f3-7dac-4bb4-8919-b36f26b10ab2',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0','127.0.0.1',NULL,0,'2026-02-15 17:30:53','2026-02-15 17:30:53'),
(42,1,'50499c93-4dee-42fa-89ba-12a70aad070b',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0','127.0.0.1',NULL,0,'2026-02-15 17:32:36','2026-02-15 17:32:36'),
(44,1,'93b01d80-05e2-4ab3-9464-03c30942f586',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0','127.0.0.1',NULL,0,'2026-02-15 17:35:24','2026-02-15 17:35:24'),
(50,1,'e19ff50b-3494-4160-95d3-ac5df21ad846',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0','127.0.0.1',NULL,0,'2026-02-16 10:29:13','2026-02-16 10:29:13'),
(51,1,'8f74894c-3a27-44f5-92d7-b2920b5af12a',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0','127.0.0.1',NULL,0,'2026-02-16 10:30:08','2026-02-16 10:30:08'),
(60,1,'5e32f34b-e2b1-4e38-8c1a-472117ea60d2',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0','127.0.0.1',NULL,0,'2026-02-16 11:19:40','2026-02-16 11:19:40'),
(76,1,'9025c0ba-c4c3-4ac7-a20f-5ec3eca102c2',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0','127.0.0.1',NULL,0,'2026-02-16 14:46:01','2026-02-16 14:46:01'),
(81,1,'f752eb9a-3f0f-41db-bfef-940e4635b6c9',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0','127.0.0.1',NULL,0,'2026-02-17 08:37:38','2026-02-17 08:37:38'),
(82,1,'89a0abf5-b80a-4bac-8d1e-168c31144a99',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0','127.0.0.1',NULL,0,'2026-02-17 08:37:47','2026-02-17 08:37:47'),
(87,1,'b3fcf4a3-0631-44e8-87ad-994ecac9b142',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0','127.0.0.1',NULL,0,'2026-02-17 13:32:52','2026-02-17 13:32:52'),
(90,1,'e0fec43e-a0a9-4972-9c8e-fc5328ef68bc',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0','127.0.0.1',NULL,0,'2026-02-17 13:58:06','2026-02-17 13:58:06'),
(91,1,'f508986c-a94d-47f2-ae1d-ceddfe482a4a',NULL,NULL,'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36','127.0.0.1',NULL,0,'2026-02-17 14:00:56','2026-02-17 14:00:56'),
(92,1,'39a29b90-cc9a-428b-9237-7b4439a9a161',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0','127.0.0.1',NULL,0,'2026-02-17 14:01:17','2026-02-17 14:01:17'),
(95,1,'23c4a87a-84b5-46a8-b2db-28afacce2172',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0','127.0.0.1',NULL,0,'2026-02-22 06:14:18','2026-02-22 06:14:18'),
(98,1,'096a9a27-9e14-4776-9518-cbf4d38f6f34',NULL,NULL,'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36','127.0.0.1',NULL,0,'2026-02-22 07:16:54','2026-02-22 07:16:54'),
(99,1,'fe7892dc-ff9b-4a22-a8c2-9018920b8557',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0','127.0.0.1',NULL,0,'2026-02-22 07:17:28','2026-02-22 07:17:28'),
(100,1,'8671ce1d-0614-459c-b8e9-e9aee527bdf8',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0','127.0.0.1',NULL,0,'2026-02-27 12:36:30','2026-02-27 12:36:30'),
(103,1,'f08199b5-7c7b-4457-ac44-ddb0acdb8cd9',NULL,NULL,'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36','127.0.0.1',NULL,0,'2026-02-27 13:02:58','2026-02-27 13:02:58'),
(105,1,'8478149e-3940-4f21-93da-bac00a29b5ea',NULL,NULL,'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36','127.0.0.1',NULL,0,'2026-02-27 13:30:22','2026-02-27 13:30:22'),
(107,1,'8f6b1263-da54-4587-b5a4-6569397a17fa',NULL,NULL,'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36','127.0.0.1',NULL,0,'2026-02-27 13:32:39','2026-02-27 13:32:39'),
(109,1,'9c47b552-498c-449b-9ccc-2c5e9ecb22db',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0','127.0.0.1',NULL,0,'2026-03-19 12:31:00','2026-03-19 12:31:00'),
(110,1,'8c9d5305-9aff-4b1f-9490-714db5088655',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0','127.0.0.1',NULL,0,'2026-03-19 12:31:21','2026-03-19 12:31:21'),
(111,1,'d65f1327-0547-4e9a-822e-f9e48e73f02a',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0','127.0.0.1',NULL,0,'2026-03-19 13:54:24','2026-03-19 13:54:24'),
(113,1,'6bf131ce-8e44-432c-bc7b-40bb41b99324',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0','127.0.0.1',NULL,0,'2026-03-19 14:28:04','2026-03-19 14:28:04'),
(114,1,'05df9e66-c718-46f7-a18f-360f6d9dbde2',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0','127.0.0.1',NULL,0,'2026-03-24 15:42:42','2026-03-24 15:42:42'),
(117,1,'7b04c00b-6a7a-47bc-b4d5-2b403b2ec1bc',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0','127.0.0.1',NULL,0,'2026-03-24 16:24:45','2026-03-24 16:24:45'),
(124,1,'e1ead9df-1efb-46bd-92ff-50f7d33a2ae7',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0','127.0.0.1',NULL,0,'2026-03-24 18:03:31','2026-03-24 18:03:31'),
(126,1,'4309dff1-9922-4b25-bb91-c927a9e15da0',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0','127.0.0.1',NULL,0,'2026-03-24 18:15:42','2026-03-24 18:15:42'),
(130,1,'da66f654-6bcd-43e2-9e30-c0632766c50c',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36','127.0.0.1',NULL,0,'2026-05-08 07:02:53','2026-05-08 07:02:53'),
(133,1,'aa27b536-9679-45c2-98da-d54b8a5c31d6',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36','127.0.0.1',NULL,0,'2026-05-08 07:16:56','2026-05-08 07:16:56'),
(136,1,'85fac6b4-b221-4c46-a651-723cb325f28c',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36','127.0.0.1',NULL,0,'2026-05-08 07:24:58','2026-05-08 07:24:58'),
(138,1,'b4609027-a13a-43d8-a9b5-e8dacd69431e',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36','127.0.0.1',NULL,0,'2026-05-08 07:35:51','2026-05-08 07:35:51'),
(139,1,'02356f55-9964-4df0-9a8b-c8e329547f79',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36','127.0.0.1',NULL,0,'2026-05-08 07:59:40','2026-05-08 07:59:40'),
(141,1,'aa832fef-f3bb-411e-9a79-f8a5006124bd',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36','127.0.0.1',NULL,0,'2026-05-08 08:00:56','2026-05-08 08:00:56'),
(143,1,'844c0705-f4b5-4f9a-a17c-e709ed1ec2d1',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36','127.0.0.1',NULL,0,'2026-05-08 15:59:34','2026-05-08 15:59:34'),
(145,1,'18eb7bf1-bac2-4c91-842e-f774376a7451',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36','127.0.0.1',NULL,0,'2026-05-08 16:00:59','2026-05-08 16:00:59'),
(148,1,'e33516b3-702d-4386-a02f-6e4a81207355',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36','127.0.0.1',NULL,0,'2026-05-08 16:03:08','2026-05-08 16:03:08'),
(153,1,'f2333207-0fd5-4eb6-baca-598c6e4305ba',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36','127.0.0.1',NULL,0,'2026-05-10 07:37:29','2026-05-10 07:37:29'),
(154,1,'97b2695d-d0bc-457d-a245-b0c0f86f7ac7',NULL,NULL,'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36','127.0.0.1',NULL,0,'2026-05-10 07:41:17','2026-05-10 07:41:17');
/*!40000 ALTER TABLE `user_sessions` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `role` enum('student','admin','super_admin') DEFAULT 'student',
  `avatar_url` varchar(500) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `total_points` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `roll_no` varchar(50) DEFAULT NULL,
  `year` int(11) DEFAULT NULL,
  `semester` int(11) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `interface_mode` varchar(20) DEFAULT 'system',
  `accent_color` varchar(20) DEFAULT 'blue',
  `paper_alerts` tinyint(1) DEFAULT 1,
  `leaderboard_updates` tinyint(1) DEFAULT 1,
  `system_announcements` tinyint(1) DEFAULT 0,
  `default_department_id` int(11) DEFAULT NULL,
  `download_behavior` varchar(20) DEFAULT 'direct',
  `password_changed_at` datetime DEFAULT current_timestamp(),
  `is_2fa_enabled` tinyint(1) DEFAULT 0,
  `is_verified` tinyint(1) DEFAULT 0,
  `is_top_contributor` tinyint(1) DEFAULT 0,
  `is_beta_tester` tinyint(1) DEFAULT 0,
  `oauth_provider` varchar(20) DEFAULT NULL COMMENT 'OAuth provider: google, github, etc.',
  `oauth_id` varchar(255) DEFAULT NULL COMMENT 'Unique ID from the OAuth provider',
  `is_banned` tinyint(1) DEFAULT 0 COMMENT 'Whether the user account is banned/suspended',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `idx_oauth_provider_id` (`oauth_provider`,`oauth_id`),
  KEY `department_id` (`department_id`),
  KEY `fk_user_default_dept` (`default_department_id`),
  CONSTRAINT `fk_user_default_dept` FOREIGN KEY (`default_department_id`) REFERENCES `departments` (`id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `avatar_url`, `department_id`, `total_points`, `created_at`, `updated_at`, `roll_no`, `year`, `semester`, `phone_number`, `bio`, `interface_mode`, `accent_color`, `paper_alerts`, `leaderboard_updates`, `system_announcements`, `default_department_id`, `download_behavior`, `password_changed_at`, `is_2fa_enabled`, `is_verified`, `is_top_contributor`, `is_beta_tester`, `oauth_provider`, `oauth_id`, `is_banned`) VALUES (1,'Aakash Modi','work.aakash.modi@gmail.com','$2b$12$Jf5YSm2gi/P8kOYUQQxXx..dvxTfqDptlzV2ok2fmxzT78JZSg.Ne','super_admin','https://lh3.googleusercontent.com/a/ACg8ocISYaaJ17cK4mx87itJgMXtQYtgao0SHw2Zi7lSAH8fotmsFZA=s96-c',NULL,0,'2026-02-14 09:39:19','2026-05-10 07:40:07',NULL,NULL,NULL,NULL,NULL,'dark','emerald',1,1,0,NULL,'direct','2026-02-27 13:32:07',0,1,0,0,'google','113264534776486448845',0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Dumping events for database 'pyq_db'
--

--
-- Dumping routines for database 'pyq_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-05-10 13:12:03
