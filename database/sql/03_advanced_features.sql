USE Formula_Racing_DB;

-- ============================================================================
-- FEATURE 1: VIEW - Constructor (Team) Standings Leaderboard
-- Aggregates total points earned by all drivers for each team across races.
-- ============================================================================
DROP VIEW IF EXISTS v_ConstructorStandings;
CREATE VIEW v_ConstructorStandings AS
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

-- ============================================================================
-- FEATURE 2: INDEXING - Performance Optimization on Race Results
-- Optimizes leaderboard filtering by Driver, Race, and Finishing Position.
-- ============================================================================
CREATE INDEX idx_participates_finishing
ON PARTICIPATES_IN(Race_ID, Finishing_Position, Points);

CREATE INDEX idx_race_date_season
ON RACE(Season_ID, Race_Date);

-- ============================================================================
-- FEATURE 3: STORED PROCEDURE - Calculate Driver Championship Points
-- Accepts a Driver_ID and returns their detailed points summary.
-- ============================================================================
DELIMITER //
DROP PROCEDURE IF EXISTS sp_GetDriverSummary //
CREATE PROCEDURE sp_GetDriverSummary(IN p_Driver_ID INT)
BEGIN
    SELECT
        d.Driver_ID,
        d.Driver_Name,
        d.Nationality,
        COUNT(p.Race_ID) AS Total_Races,
        COALESCE(SUM(p.Points), 0) AS Total_Points,
        COALESCE(MIN(p.Finishing_Position), 0) AS Best_Finish
    FROM DRIVER d
    LEFT JOIN PARTICIPATES_IN p ON d.Driver_ID = p.Driver_ID
    WHERE d.Driver_ID = p_Driver_ID
    GROUP BY d.Driver_ID, d.Driver_Name, d.Nationality;
END //
DELIMITER ;

-- ============================================================================
-- FEATURE 4: TRIGGER - Prevent Invalid Points Entry
-- Automatically enforces data integrity by rejecting negative points.
-- ============================================================================
DELIMITER //
DROP TRIGGER IF EXISTS trg_ValidateRacePoints //
CREATE TRIGGER trg_ValidateRacePoints
BEFORE INSERT ON PARTICIPATES_IN
FOR EACH ROW
BEGIN
    IF NEW.Points < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Data Integrity Error: Race points cannot be negative.';
    END IF;
END //
DELIMITER ;
