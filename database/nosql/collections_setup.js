db = db.getSiblingDB('f1_telemetry');

db.telemetry.drop();

db.createCollection('telemetry', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['driver_id', 'race_id', 'lap_number', 'telemetry_data'],
      properties: {
        driver_id: { bsonType: ['int', 'long', 'double'], description: 'Driver_ID matching SQL schema' },
        race_id: { bsonType: ['int', 'long', 'double'], description: 'Race_ID matching SQL schema' },
        lap_number: { bsonType: ['int', 'long', 'double'] },
        telemetry_data: {
          bsonType: 'object',
          required: ['speed_kmh', 'throttle_pct', 'brake_pct', 'gear'],
          properties: {
            speed_kmh: { bsonType: ['int', 'double'] },
            throttle_pct: { bsonType: ['int', 'double'] },
            brake_pct: { bsonType: ['int', 'double'] },
            gear: { bsonType: ['int', 'long', 'double'] },
            drs_active: { bsonType: 'bool' }
          }
        },
        pit_stop: {
          bsonType: 'object',
          properties: {
            duration_sec: { bsonType: ['int', 'double'] },
            tyre_compound: { bsonType: 'string' }
          }
        }
      }
    }
  }
});

db.telemetry.createIndex({ race_id: 1, driver_id: 1, lap_number: 1 });

db.telemetry.insertMany([
  {
    driver_id: 101,
    race_id: 1001,
    lap_number: 1,
    telemetry_data: { speed_kmh: 285.5, throttle_pct: 100.0, brake_pct: 0.0, gear: 7, drs_active: false }
  },
  {
    driver_id: 101,
    race_id: 1001,
    lap_number: 15,
    telemetry_data: { speed_kmh: 120.0, throttle_pct: 15.0, brake_pct: 85.0, gear: 2, drs_active: false },
    pit_stop: { duration_sec: 2.34, tyre_compound: 'HARD' }
  },
  {
    driver_id: 102,
    race_id: 1001,
    lap_number: 15,
    telemetry_data: { speed_kmh: 290.0, throttle_pct: 100.0, brake_pct: 0.0, gear: 8, drs_active: true }
  }
]);

print("MongoDB f1_telemetry database initialized successfully!");