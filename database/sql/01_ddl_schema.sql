-- MySQL dump 10.13  Distrib 26.7.0, for macos26.6 (arm64)
--
-- Host: localhost    Database: Formula_Racing_DB
-- ------------------------------------------------------
-- Server version	26.7.0

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
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'a8da43c8-9236-11f1-926e-469415a9156a:1-95';

--
-- Current Database: `Formula_Racing_DB`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `Formula_Racing_DB` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `Formula_Racing_DB`;

--
-- Table structure for table `CAR`
--

DROP TABLE IF EXISTS `CAR`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CAR` (
  `Car_ID` int NOT NULL,
  `Car_Model` varchar(100) NOT NULL,
  `Manufacturing_Year` int NOT NULL,
  `Engine_Manufacturer` varchar(100) NOT NULL,
  `Team_ID` int NOT NULL,
  PRIMARY KEY (`Car_ID`),
  KEY `Team_ID` (`Team_ID`),
  CONSTRAINT `car_ibfk_1` FOREIGN KEY (`Team_ID`) REFERENCES `TEAM` (`Team_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `CIRCUIT`
--

DROP TABLE IF EXISTS `CIRCUIT`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CIRCUIT` (
  `Circuit_ID` int NOT NULL,
  `Circuit_Name` varchar(100) NOT NULL,
  `Country` varchar(50) NOT NULL,
  `Circuit_Length` decimal(6,3) NOT NULL,
  `Number_Of_Laps` int NOT NULL,
  PRIMARY KEY (`Circuit_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `DRIVER`
--

DROP TABLE IF EXISTS `DRIVER`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `DRIVER` (
  `Driver_ID` int NOT NULL,
  `Driver_Name` varchar(100) NOT NULL,
  `Nationality` varchar(50) NOT NULL,
  `Date_Of_Birth` date NOT NULL,
  PRIMARY KEY (`Driver_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `DRIVES_FOR`
--

DROP TABLE IF EXISTS `DRIVES_FOR`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `DRIVES_FOR` (
  `Driver_ID` int NOT NULL,
  `Team_ID` int NOT NULL,
  `Season_ID` int NOT NULL,
  PRIMARY KEY (`Driver_ID`,`Team_ID`,`Season_ID`),
  KEY `Team_ID` (`Team_ID`),
  KEY `Season_ID` (`Season_ID`),
  CONSTRAINT `drives_for_ibfk_1` FOREIGN KEY (`Driver_ID`) REFERENCES `DRIVER` (`Driver_ID`),
  CONSTRAINT `drives_for_ibfk_2` FOREIGN KEY (`Team_ID`) REFERENCES `TEAM` (`Team_ID`),
  CONSTRAINT `drives_for_ibfk_3` FOREIGN KEY (`Season_ID`) REFERENCES `SEASON` (`Season_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `PARTICIPATES_IN`
--

DROP TABLE IF EXISTS `PARTICIPATES_IN`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PARTICIPATES_IN` (
  `Driver_ID` int NOT NULL,
  `Race_ID` int NOT NULL,
  `Finishing_Position` int DEFAULT NULL,
  `Points` decimal(5,2) DEFAULT NULL,
  `Race_Status` varchar(50) DEFAULT NULL,
  `Fastest_Lap` time DEFAULT NULL,
  `Car_Used` int DEFAULT NULL,
  PRIMARY KEY (`Driver_ID`,`Race_ID`),
  KEY `idx_participates_finishing` (`Race_ID`,`Finishing_Position`,`Points`),
  CONSTRAINT `participates_in_ibfk_1` FOREIGN KEY (`Driver_ID`) REFERENCES `DRIVER` (`Driver_ID`),
  CONSTRAINT `participates_in_ibfk_2` FOREIGN KEY (`Race_ID`) REFERENCES `RACE` (`Race_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_ValidateRacePoints` BEFORE INSERT ON `participates_in` FOR EACH ROW BEGIN
    IF NEW.Points < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Data Integrity Error: Race points cannot be negative.';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `RACE`
--

DROP TABLE IF EXISTS `RACE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `RACE` (
  `Race_ID` int NOT NULL,
  `Race_Name` varchar(100) NOT NULL,
  `Race_Date` date NOT NULL,
  `Season_ID` int NOT NULL,
  `Circuit_ID` int NOT NULL,
  PRIMARY KEY (`Race_ID`),
  KEY `Circuit_ID` (`Circuit_ID`),
  KEY `idx_race_date_season` (`Season_ID`,`Race_Date`),
  CONSTRAINT `race_ibfk_1` FOREIGN KEY (`Season_ID`) REFERENCES `SEASON` (`Season_ID`),
  CONSTRAINT `race_ibfk_2` FOREIGN KEY (`Circuit_ID`) REFERENCES `CIRCUIT` (`Circuit_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `SEASON`
--

DROP TABLE IF EXISTS `SEASON`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SEASON` (
  `Season_ID` int NOT NULL,
  `Season_Name` varchar(100) NOT NULL,
  `Year` int NOT NULL,
  PRIMARY KEY (`Season_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `TEAM`
--

DROP TABLE IF EXISTS `TEAM`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TEAM` (
  `Team_ID` int NOT NULL,
  `Team_Name` varchar(100) NOT NULL,
  `Country` varchar(50) NOT NULL,
  `Team_Principal` varchar(100) NOT NULL,
  PRIMARY KEY (`Team_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `v_constructorstandings`
--

DROP TABLE IF EXISTS `v_constructorstandings`;
/*!50001 DROP VIEW IF EXISTS `v_constructorstandings`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_constructorstandings` AS SELECT 
 1 AS `Team_ID`,
 1 AS `Team_Name`,
 1 AS `Team_Principal`,
 1 AS `Total_Constructor_Points`,
 1 AS `Races_Participated`*/;
SET character_set_client = @saved_cs_client;

--
-- Current Database: `Formula_Racing_DB`
--

USE `Formula_Racing_DB`;

--
-- Final view structure for view `v_constructorstandings`
--

/*!50001 DROP VIEW IF EXISTS `v_constructorstandings`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_constructorstandings` AS select `t`.`Team_ID` AS `Team_ID`,`t`.`Team_Name` AS `Team_Name`,`t`.`Team_Principal` AS `Team_Principal`,sum(`p`.`Points`) AS `Total_Constructor_Points`,count(distinct `p`.`Race_ID`) AS `Races_Participated` from ((`team` `t` join `drives_for` `df` on((`t`.`Team_ID` = `df`.`Team_ID`))) join `participates_in` `p` on((`df`.`Driver_ID` = `p`.`Driver_ID`))) group by `t`.`Team_ID`,`t`.`Team_Name`,`t`.`Team_Principal` order by `Total_Constructor_Points` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-12  8:53:44
