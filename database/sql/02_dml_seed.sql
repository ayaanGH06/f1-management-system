USE Formula_Racing_DB;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. TEAMS (Team_ID, Team_Name, Country, Team_Principal)
INSERT INTO TEAM (Team_ID, Team_Name, Country, Team_Principal) VALUES
(1, 'Red Bull Racing', 'Austria', 'Christian Horner'),
(2, 'Scuderia Ferrari', 'Italy', 'Frédéric Vasseur'),
(3, 'Mercedes-AMG PETRONAS', 'Germany', 'Toto Wolff'),
(4, 'McLaren F1 Team', 'United Kingdom', 'Andrea Stella');

-- 2. DRIVERS (Driver_ID, Driver_Name, Nationality, Date_Of_Birth)
INSERT INTO DRIVER (Driver_ID, Driver_Name, Nationality, Date_Of_Birth) VALUES
(101, 'Max Verstappen', 'Dutch', '1997-09-30'),
(102, 'Charles Leclerc', 'Monegasque', '1997-10-16'),
(103, 'Lewis Hamilton', 'British', '1985-01-07'),
(104, 'Lando Norris', 'British', '1999-11-13');

-- 3. CARS (Car_ID, Car_Model, Manufacturing_Year, Engine_Manufacturer, Team_ID)
INSERT INTO CAR (Car_ID, Car_Model, Manufacturing_Year, Engine_Manufacturer, Team_ID) VALUES
(10, 'RB20', 2024, 'Honda RBPT', 1),
(20, 'SF-24', 2024, 'Ferrari', 2),
(30, 'W15', 2024, 'Mercedes', 3),
(40, 'MCL38', 2024, 'Mercedes', 4);

-- 4. SEASONS (Season_ID, Season_Name, Year)
INSERT INTO SEASON (Season_ID, Season_Name, Year) VALUES
(1, '2024 Formula 1 World Championship', 2024),
(2, '2025 Formula 1 World Championship', 2025);

-- 5. CIRCUITS (Circuit_ID, Circuit_Name, Country, Circuit_Length, Number_Of_Laps)
INSERT INTO CIRCUIT (Circuit_ID, Circuit_Name, Country, Circuit_Length, Number_Of_Laps) VALUES
(501, 'Circuit de Monaco', 'Monaco', 3.337, 78),
(502, 'Silverstone Circuit', 'United Kingdom', 5.891, 52),
(503, 'Autodromo Nazionale Monza', 'Italy', 5.793, 53);

-- 6. RACES (Race_ID, Race_Name, Race_Date, Season_ID, Circuit_ID)
INSERT INTO RACE (Race_ID, Race_Name, Race_Date, Season_ID, Circuit_ID) VALUES
(1001, 'Monaco Grand Prix', '2024-05-26', 1, 501),
(1002, 'British Grand Prix', '2024-07-07', 1, 502),
(1003, 'Italian Grand Prix', '2024-09-01', 1, 503);

-- 7. DRIVES_FOR (Driver_ID, Team_ID, Season_ID)
INSERT INTO DRIVES_FOR (Driver_ID, Team_ID, Season_ID) VALUES
(101, 1, 1),
(102, 2, 1),
(103, 3, 1),
(104, 4, 1);

-- 8. PARTICIPATES_IN (Driver_ID, Race_ID, Finishing_Position, Points, Race_Status, Fastest_Lap, Car_Used)
INSERT INTO PARTICIPATES_IN (Driver_ID, Race_ID, Finishing_Position, Points, Race_Status, Fastest_Lap, Car_Used) VALUES
(101, 1001, 6, 8.00, 'Finished', '01:14.165', 10),
(102, 1001, 1, 25.00, 'Finished', '01:14.165', 20),
(103, 1001, 7, 6.00, 'Finished', '01:14.165', 30),
(104, 1001, 4, 12.00, 'Finished', '01:14.165', 40),
(101, 1002, 2, 18.00, 'Finished', '01:28.293', 10),
(102, 1002, 14, 0.00, 'Finished', '01:28.293', 20),
(103, 1002, 1, 25.00, 'Finished', '01:28.293', 30),
(104, 1002, 3, 15.00, 'Finished', '01:28.293', 40);

SET FOREIGN_KEY_CHECKS = 1;