#!/bin/bash

set -e

BASE_URL="http://localhost:3000"
PASS=0
FAIL=0

echo "=================================================="
echo "🏎️  F1 Management System — E2E Verification Suite"
echo "=================================================="

# 1. MySQL Stored Procedure Check
echo -n "[TEST 1] MySQL Stored Procedure (sp_GetDriverSummary)... "
SQL_OUT=$(mysql Formula_Racing_DB -N -e "CALL sp_GetDriverSummary(103);")
if [[ "$SQL_OUT" == *"Lewis Hamilton"* ]]; then
  echo "✅ PASS"
  ((PASS++))
else
  echo "❌ FAIL"
  ((FAIL++))
fi

# 2. MongoDB Telemetry Collection Check
echo -n "[TEST 2] MongoDB Telemetry Document Count... "
MONGO_COUNT=$(mongosh --quiet "mongodb://localhost:27017/f1_telemetry" --eval "db.telemetry.countDocuments()")
if [[ "$MONGO_COUNT" -ge 3 ]]; then
  echo "✅ PASS ($MONGO_COUNT docs)"
  ((PASS++))
else
  echo "❌ FAIL (Got $MONGO_COUNT)"
  ((FAIL++))
fi

# 3. API: Constructor Standings (SQL View)
echo -n "[TEST 3] GET /api/standings (SQL View)... "
STANDINGS_RES=$(curl -s "$BASE_URL/api/standings")
if [[ "$STANDINGS_RES" == *"Mercedes-AMG PETRONAS"* ]]; then
  echo "✅ PASS"
  ((PASS++))
else
  echo "❌ FAIL"
  ((FAIL++))
fi

# 4. API: Live Telemetry (MongoDB Aggregation)
echo -n "[TEST 4] GET /api/telemetry?raceId=1001 (MongoDB Aggregation)... "
TELEMETRY_RES=$(curl -s "$BASE_URL/api/telemetry?raceId=1001")
if [[ "$TELEMETRY_RES" == *"avgSpeed"* || "$TELEMETRY_RES" == *"290"* ]]; then
  echo "✅ PASS"
  ((PASS++))
else
  echo "❌ FAIL"
  ((FAIL++))
fi

# 5. RBAC Auth: Invalid Login Rejection (HTTP 401)
echo -n "[TEST 5] POST /api/auth/login (RBAC Invalid Credentials)... "
AUTH_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"viewer","password":"wrong"}')
if [[ "$AUTH_CODE" == "401" ]]; then
  echo "✅ PASS (HTTP 401)"
  ((PASS++))
else
  echo "❌ FAIL (Got HTTP $AUTH_CODE)"
  ((FAIL++))
fi

# 6. Trigger Integrity: Negative Points Rejection (HTTP 400)
echo -n "[TEST 6] POST /api/admin/race-result (SQL Trigger Integrity)... "
TRIGGER_RES=$(curl -s -X POST "$BASE_URL/api/admin/race-result" \
  -H "Content-Type: application/json" \
  -d '{"driverId":105,"raceId":1003,"finishingPosition":1,"points":-10,"raceStatus":"Finished","fastestLap":"01:21.456","carUsed":10}')
if [[ "$TRIGGER_RES" == *"Race points cannot be negative"* ]]; then
  echo "✅ PASS"
  ((PASS++))
else
  echo "❌ FAIL"
  ((FAIL++))
fi

echo "=================================================="
echo "Summary: $PASS Passed | $FAIL Failed"
echo "=================================================="

if [[ "$FAIL" -ne 0 ]]; then
  exit 1
fi
