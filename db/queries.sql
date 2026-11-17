USE Formula_Racing_DB;
-- JOIN + GROUP BY + HAVING + ORDER BY
SELECT Driver_Name, Total_Points, Wins FROM v_driver_standings WHERE Year=2026 HAVING Total_Points > 0 ORDER BY Total_Points DESC;
-- Subquery
SELECT Driver_Name, Total_Points FROM v_driver_standings WHERE Total_Points > (SELECT AVG(Total_Points) FROM v_driver_standings);
-- Constructors' standings
SELECT t.Team_Name, SUM(p.Points) AS Pts FROM PARTICIPATES_IN p JOIN CAR c ON c.Car_ID=p.Car_Used JOIN TEAM t ON t.Team_ID=c.Team_ID GROUP BY t.Team_ID ORDER BY Pts DESC;
-- Full-text search
SELECT * FROM DRIVER WHERE MATCH(Driver_Name) AGAINST('lew*' IN BOOLEAN MODE);
-- UPDATE (trigger recalculates points) and DELETE
UPDATE PARTICIPATES_IN SET Finishing_Position=6 WHERE Driver_ID=4 AND Race_ID=1;
DELETE FROM PARTICIPATES_IN WHERE Driver_ID=2 AND Race_ID=1;
-- Constraint tests (each must FAIL):
-- INSERT INTO PARTICIPATES_IN (Driver_ID,Race_ID,Finishing_Position,Car_Used) VALUES (1,2,99,1);  -- CHECK
-- CALL sp_record_result(1,1,1,'Finished',NULL,1);  -- duplicate PK
-- CALL sp_record_result(1,2,1,'Finished',NULL,2);  -- wrong car (rollback)
