#!/bin/bash


if [ -f .env.local ]; then
  set -a
  source .env.local
  set +a
fi

BASE_URL="http://localhost:3000"
PASS=0
FAIL=0

echo "=================================================="
echo "🏎️  F1 Management System — E2E Verification Suite"
echo "=================================================="

# 1. MySQL Stored Procedure Check
echo -n "[TEST 1] MySQL Stored Procedure (sp_GetDriverSummary)... "
SQL_OUT=$(mysql -u "${SQL_USER:-root}" -p"${SQL_PASSWORD}" "${SQL_DATABASE:-Formula_Racing_DB}" -N -e "CALL sp_GetDriverSummary(103);")
if [[ "$SQL_OUT" == *"Lewis Hamilton"* ]]; then
  echo "✅ PASS"
  PASS=$((PASS + 1))
else
  echo "❌ FAIL"
  FAIL=$((FAIL + 1))
fi

# 2. MongoDB Telemetry Collection Check
echo -n "[TEST 2] MongoDB Telemetry Document Count... "
MONGO_COUNT=$(mongosh --quiet "${MONGODB_URI:-mongodb://localhost:27017/f1_telemetry}" --eval "db.telemetry.countDocuments()")
if [[ "$MONGO_COUNT" -ge 3 ]]; then
  echo "✅ PASS ($MONGO_COUNT docs)"
  PASS=$((PASS + 1))
else
  echo "❌ FAIL (Got $MONGO_COUNT)"
  FAIL=$((FAIL + 1))
fi

# 3. API: Constructor Standings (SQL View)
echo -n "[TEST 3] GET /api/standings (SQL View)... "
STANDINGS_RES=$(curl -s "$BASE_URL/api/standings")
if [[ "$STANDINGS_RES" == *"Mercedes-AMG PETRONAS"* ]]; then
  echo "✅ PASS"
  PASS=$((PASS + 1))
else
  echo "❌ FAIL"
  FAIL=$((FAIL + 1))
fi

# 4. API: Live Telemetry (MongoDB Aggregation)
echo -n "[TEST 4] GET /api/telemetry?raceId=1001 (MongoDB Aggregation)... "
TELEMETRY_RES=$(curl -s "$BASE_URL/api/telemetry?raceId=1001")
if [[ "$TELEMETRY_RES" == *"avgSpeed"* || "$TELEMETRY_RES" == *"avg_speed_kmh"* || "$TELEMETRY_RES" == *"290"* ]]; then
  echo "✅ PASS"
  PASS=$((PASS + 1))
else
  echo "❌ FAIL"
  FAIL=$((FAIL + 1))
fi

# 5. RBAC Auth: Unauthenticated Mutation Blocked (HTTP 401)
echo -n "[TEST 5] POST /api/admin/race-result (Unauthenticated Block)... "
UNAUTH_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/admin/race-result" \
  -H "Content-Type: application/json" \
  -d '{"driverId":105,"raceId":1003,"finishingPosition":1,"points":25,"raceStatus":"Finished","fastestLap":"01:21.456","carUsed":10}')
if [[ "$UNAUTH_CODE" == "401" ]]; then
  echo "✅ PASS (HTTP 401)"
  PASS=$((PASS + 1))
else
  echo "❌ FAIL (Got HTTP $UNAUTH_CODE)"
  FAIL=$((FAIL + 1))
fi

# 6. Authenticated Admin Session + SQL Trigger Integrity (HTTP 400)
echo -n "[TEST 6] Authenticated POST /api/admin/race-result (Trigger Integrity)... "
COOKIE_JAR=$(mktemp)
curl -s -c "$COOKIE_JAR" -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"${ADMIN_USER:?ADMIN_USER must be set in .env.local}\",\"password\":\"${ADMIN_PASSWORD:?ADMIN_PASSWORD must be set in .env.local}\"}" > /dev/null

TRIGGER_RES=$(curl -s -b "$COOKIE_JAR" -X POST "$BASE_URL/api/admin/race-result" \
  -H "Content-Type: application/json" \
  -d '{"driverId":105,"raceId":1003,"finishingPosition":1,"points":-10,"raceStatus":"Finished","fastestLap":"01:21.456","carUsed":10}')
rm -f "$COOKIE_JAR"

if [[ "$TRIGGER_RES" == *"Race points cannot be negative"* ]]; then
  echo "✅ PASS"
  PASS=$((PASS + 1))
else
  echo "❌ FAIL ($TRIGGER_RES)"
  FAIL=$((FAIL + 1))
fi

echo "=================================================="
echo "Summary: $PASS Passed | $FAIL Failed"
echo "=================================================="

if [[ "$FAIL" -ne 0 ]]; then
  exit 1
fi
