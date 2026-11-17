-- Formula 1 Racing Database (MySQL 8) : DDL, constraints, indexes, view, function, trigger, procedure, seed
DROP DATABASE IF EXISTS Formula_Racing_DB;
CREATE DATABASE Formula_Racing_DB;
USE Formula_Racing_DB;

CREATE TABLE DRIVER (
  Driver_ID INT PRIMARY KEY AUTO_INCREMENT,
  Driver_Name VARCHAR(100) NOT NULL,
  Nationality VARCHAR(50) NOT NULL,
  Date_Of_Birth DATE NOT NULL,
  CONSTRAINT chk_dob CHECK (Date_Of_Birth > '1950-01-01')
);
CREATE TABLE TEAM (
  Team_ID INT PRIMARY KEY AUTO_INCREMENT,
  Team_Name VARCHAR(100) NOT NULL UNIQUE,
  Country VARCHAR(50) NOT NULL,
  Team_Principal VARCHAR(100) NOT NULL
);
CREATE TABLE SEASON (
  Season_ID INT PRIMARY KEY AUTO_INCREMENT,
  Season_Name VARCHAR(100) NOT NULL,
  Year INT NOT NULL UNIQUE,
  CONSTRAINT chk_year CHECK (Year BETWEEN 1950 AND 2100)
);
CREATE TABLE CIRCUIT (
  Circuit_ID INT PRIMARY KEY AUTO_INCREMENT,
  Circuit_Name VARCHAR(100) NOT NULL,
  Country VARCHAR(50) NOT NULL,
  Circuit_Length DECIMAL(6,3) NOT NULL,
  Number_Of_Laps INT NOT NULL,
  CONSTRAINT chk_len CHECK (Circuit_Length > 0),
  CONSTRAINT chk_laps CHECK (Number_Of_Laps > 0)
);
CREATE TABLE CAR (
  Car_ID INT PRIMARY KEY AUTO_INCREMENT,
  Car_Model VARCHAR(100) NOT NULL,
  Manufacturing_Year INT NOT NULL,
  Engine_Manufacturer VARCHAR(100) NOT NULL,
  Team_ID INT NOT NULL,
  CONSTRAINT chk_myear CHECK (Manufacturing_Year BETWEEN 1950 AND 2100),
  FOREIGN KEY (Team_ID) REFERENCES TEAM(Team_ID) ON DELETE CASCADE
);
CREATE TABLE RACE (
  Race_ID INT PRIMARY KEY AUTO_INCREMENT,
  Race_Name VARCHAR(100) NOT NULL,
  Race_Date DATE NOT NULL,
  Season_ID INT NOT NULL,
  Circuit_ID INT NOT NULL,
  UNIQUE (Race_Name, Season_ID),
  FOREIGN KEY (Season_ID) REFERENCES SEASON(Season_ID),
  FOREIGN KEY (Circuit_ID) REFERENCES CIRCUIT(Circuit_ID)
);
CREATE TABLE PARTICIPATES_IN (
  Driver_ID INT, Race_ID INT,
  Finishing_Position INT,
  Points DECIMAL(5,2),
  Race_Status VARCHAR(50) NOT NULL DEFAULT 'Finished',
  Fastest_Lap TIME(3),
  Car_Used INT,
  PRIMARY KEY (Driver_ID, Race_ID),
  UNIQUE (Race_ID, Finishing_Position),
  CONSTRAINT chk_pos CHECK (Finishing_Position IS NULL OR Finishing_Position BETWEEN 1 AND 30),
  CONSTRAINT chk_status CHECK (Race_Status IN ('Finished','DNF','DSQ')),
  CONSTRAINT chk_pts CHECK (Points IS NULL OR Points >= 0),
  FOREIGN KEY (Driver_ID) REFERENCES DRIVER(Driver_ID),
  FOREIGN KEY (Race_ID) REFERENCES RACE(Race_ID)
);
CREATE TABLE DRIVES_FOR (
  Driver_ID INT, Team_ID INT, Season_ID INT,
  PRIMARY KEY (Driver_ID, Team_ID, Season_ID),
  FOREIGN KEY (Driver_ID) REFERENCES DRIVER(Driver_ID),
  FOREIGN KEY (Team_ID) REFERENCES TEAM(Team_ID),
  FOREIGN KEY (Season_ID) REFERENCES SEASON(Season_ID)
);
-- NEW: users for authentication / role based access
CREATE TABLE APP_USER (
  User_ID INT PRIMARY KEY AUTO_INCREMENT,
  Username VARCHAR(50) NOT NULL UNIQUE,
  Password_Hash VARCHAR(100) NOT NULL,
  Role ENUM('admin','viewer') NOT NULL DEFAULT 'viewer'
);

-- ALTER: original design missed this FK (Car_Used was a plain INT)
ALTER TABLE PARTICIPATES_IN ADD CONSTRAINT fk_part_car FOREIGN KEY (Car_Used) REFERENCES CAR(Car_ID);
CREATE INDEX idx_part_race ON PARTICIPATES_IN(Race_ID);
CREATE INDEX idx_race_date ON RACE(Race_Date);
ALTER TABLE DRIVER ADD FULLTEXT INDEX ft_driver_name (Driver_Name);

DROP VIEW IF EXISTS v_driver_standings;
CREATE VIEW v_driver_standings AS
SELECT d.Driver_ID, d.Driver_Name, s.Year, SUM(p.Points) AS Total_Points,
       COALESCE(SUM(p.Finishing_Position = 1), 0) AS Wins, COUNT(*) AS Races
FROM PARTICIPATES_IN p
JOIN DRIVER d ON d.Driver_ID = p.Driver_ID
JOIN RACE r ON r.Race_ID = p.Race_ID
JOIN SEASON s ON s.Season_ID = r.Season_ID
GROUP BY d.Driver_ID, d.Driver_Name, s.Year;

DELIMITER //
CREATE FUNCTION fn_points(pos INT, st VARCHAR(50)) RETURNS DECIMAL(5,2) DETERMINISTIC
BEGIN
  IF pos IS NULL OR st <> 'Finished' THEN RETURN 0; END IF;
  RETURN CASE pos WHEN 1 THEN 25 WHEN 2 THEN 18 WHEN 3 THEN 15 WHEN 4 THEN 12 WHEN 5 THEN 10
                  WHEN 6 THEN 8 WHEN 7 THEN 6 WHEN 8 THEN 4 WHEN 9 THEN 2 WHEN 10 THEN 1 ELSE 0 END;
END//

CREATE TRIGGER trg_points_ins BEFORE INSERT ON PARTICIPATES_IN FOR EACH ROW
BEGIN SET NEW.Points = fn_points(NEW.Finishing_Position, NEW.Race_Status); END//
CREATE TRIGGER trg_points_upd BEFORE UPDATE ON PARTICIPATES_IN FOR EACH ROW
BEGIN SET NEW.Points = fn_points(NEW.Finishing_Position, NEW.Race_Status); END//

CREATE PROCEDURE sp_record_result(IN p_driver INT, IN p_race INT, IN p_pos INT,
  IN p_status VARCHAR(50), IN p_lap TIME(3), IN p_car INT)
BEGIN
  DECLARE v_season INT; DECLARE v_ok INT;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; RESIGNAL; END;
  START TRANSACTION;
  SELECT Season_ID INTO v_season FROM RACE WHERE Race_ID = p_race;
  SELECT COUNT(*) INTO v_ok FROM DRIVES_FOR d JOIN CAR c ON c.Team_ID = d.Team_ID
   WHERE d.Driver_ID = p_driver AND d.Season_ID = v_season AND c.Car_ID = p_car;
  IF v_ok = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Driver does not drive this car in this race season';
  END IF;
  INSERT INTO PARTICIPATES_IN (Driver_ID, Race_ID, Finishing_Position, Race_Status, Fastest_Lap, Car_Used)
  VALUES (p_driver, p_race, p_pos, p_status, p_lap, p_car);
  COMMIT;
END//
DELIMITER ;

INSERT INTO SEASON (Season_Name, Year) VALUES ('2026 F1 Season', 2026);
INSERT INTO CIRCUIT (Circuit_Name, Country, Circuit_Length, Number_Of_Laps) VALUES
 ('Silverstone', 'UK', 5.891, 52), ('Monza', 'Italy', 5.793, 53);
INSERT INTO RACE (Race_Name, Race_Date, Season_ID, Circuit_ID) VALUES
 ('British Grand Prix', '2026-07-05', 1, 1), ('Italian Grand Prix', '2026-09-06', 1, 2);
INSERT INTO TEAM (Team_Name, Country, Team_Principal) VALUES
 ('Red Bull Racing', 'Austria', 'Laurent Mekies'), ('Ferrari', 'Italy', 'Frederic Vasseur'), ('McLaren', 'UK', 'Andrea Stella');
INSERT INTO CAR (Car_Model, Manufacturing_Year, Engine_Manufacturer, Team_ID) VALUES
 ('RB22', 2026, 'Red Bull Ford', 1), ('SF-26', 2026, 'Ferrari', 2), ('MCL40', 2026, 'Mercedes', 3);
INSERT INTO DRIVER (Driver_Name, Nationality, Date_Of_Birth) VALUES
 ('Max Verstappen','Dutch','1997-09-30'), ('Isack Hadjar','French','2004-09-28'),
 ('Charles Leclerc','Monegasque','1997-10-16'), ('Lewis Hamilton','British','1985-01-07'),
 ('Lando Norris','British','1999-11-13'), ('Oscar Piastri','Australian','2001-04-06');
INSERT INTO DRIVES_FOR VALUES (1,1,1),(2,1,1),(3,2,1),(4,2,1),(5,3,1),(6,3,1);
CALL sp_record_result(1,1,1,'Finished','00:01:27.100',1);
CALL sp_record_result(5,1,2,'Finished','00:01:27.350',3);
CALL sp_record_result(3,1,3,'Finished','00:01:27.600',2);
CALL sp_record_result(6,1,4,'Finished','00:01:27.800',3);
CALL sp_record_result(4,1,5,'Finished','00:01:28.000',2);
CALL sp_record_result(2,1,NULL,'DNF',NULL,1);
