import { NextResponse } from 'next/server';
import { querySQL } from '../../../../lib/db-sql';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { driverId, raceId, finishingPosition, points, raceStatus, fastestLap, carUsed } = body;

    // Execute INSERT INTO PARTICIPATES_IN (Triggers trg_ValidateRacePoints BEFORE INSERT)
    await querySQL(
      `INSERT INTO PARTICIPATES_IN (Driver_ID, Race_ID, Finishing_Position, Points, Race_Status, Fastest_Lap, Car_Used)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [driverId, raceId, finishingPosition, points, raceStatus, fastestLap, carUsed]
    );

    return NextResponse.json({
      success: true,
      message: `Race result logged successfully for Driver #${driverId}!`,
    });
  } catch (error: any) {
    // Captures MySQL Trigger SIGNAL SQLSTATE '45000' rejection
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
