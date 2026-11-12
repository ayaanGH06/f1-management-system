-- Formula Racing Database (Formula_Racing_DB) - Clean DDL Schema

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

DROP DATABASE IF EXISTS `Formula_Racing_DB`;
CREATE DATABASE `Formula_Racing_DB` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

USE `Formula_Racing_DB`;

--
-- Table structure for table `TEAM`
--

DROP TABLE IF EXISTS `TEAM`;
CREATE TABLE `TEAM` (
  `Team_ID` int NOT NULL,
  `Team_Name` varchar(100) NOT NULL,
  `Country` varchar(50) NOT NULL,
  `Team_Principal` varchar(100) NOT NULL,
  PRIMARY KEY (`Team_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `SEASON`
--

DROP TABLE IF EXISTS `SEASON`;
CREATE TABLE `SEASON` (
  `Season_ID` int NOT NULL,
  `Season_Name` varchar(100) NOT NULL,
  `Year` int NOT NULL,
  `Champion_Team_ID` int DEFAULT NULL,
  PRIMARY KEY (`Season_ID`),
  KEY `fk_season_champion_team` (`Champion_Team_ID`),
  CONSTRAINT `fk_season_champion_team` FOREIGN KEY (`Champion_Team_ID`) REFERENCES `TEAM` (`Team_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `DRIVER`
--

DROP TABLE IF EXISTS `DRIVER`;
CREATE TABLE `DRIVER` (
  `Driver_ID` int NOT NULL,
  `Driver_Name` varchar(100) NOT NULL,
  `Nationality` varchar(50) NOT NULL,
  `Date_Of_Birth` date NOT NULL,
  PRIMARY KEY (`Driver_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `CAR`
--

DROP TABLE IF EXISTS `CAR`;
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

--
-- Table structure for table `CIRCUIT`
--

DROP TABLE IF EXISTS `CIRCUIT`;
CREATE TABLE `CIRCUIT` (
  `Circuit_ID` int NOT NULL,
  `Circuit_Name` varchar(100) NOT NULL,
  `Country` varchar(50) NOT NULL,
  `Circuit_Length` decimal(6,3) NOT NULL,
  `Number_Of_Laps` int NOT NULL,
  PRIMARY KEY (`Circuit_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `RACE`
--

DROP TABLE IF EXISTS `RACE`;
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

--
-- Table structure for table `DRIVES_FOR`
--

DROP TABLE IF EXISTS `DRIVES_FOR`;
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

--
-- Table structure for table `PARTICIPATES_IN`
--

DROP TABLE IF EXISTS `PARTICIPATES_IN`;
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

DELIMITER ;;
CREATE TRIGGER `trg_ValidateRacePoints` BEFORE INSERT ON `PARTICIPATES_IN` FOR EACH ROW BEGIN
    IF NEW.Points < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Data Integrity Error: Race points cannot be negative.';
    END IF;
END ;;
DELIMITER ;

--
-- View structure for `v_ConstructorStandings`
--

DROP VIEW IF EXISTS `v_ConstructorStandings`;
CREATE VIEW `v_ConstructorStandings` AS
SELECT
    t.Team_ID,
    t.Team_Name,
    t.Team_Principal,
    SUM(p.Points) AS Total_Constructor_Points,
    COUNT(DISTINCT p.Race_ID) AS Races_Participated
FROM TEAM t
JOIN DRIVES_FOR df ON t.Team_ID = df.Team_ID
JOIN PARTICIPATES_IN p ON df.Driver_ID = p.Driver_ID
GROUP BY t.Team_ID, t.Team_Name, t.Team_Principal
ORDER BY Total_Constructor_Points DESC;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;