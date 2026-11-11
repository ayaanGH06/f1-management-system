import { NextResponse } from 'next/server';
import { querySQL } from '../../../../lib/db-sql';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { driverId, driverName, nationality, dateOfBirth } = body;

    // Validate inputs
    if (!driverId || !driverName || !nationality || !dateOfBirth) {
      return NextResponse.json(
        { success: false, error: 'All fields are required.' },
        { status: 400 }
      );
    }

    // SQL INSERT DML
    await querySQL(
      'INSERT INTO DRIVER (Driver_ID, Driver_Name, Nationality, Date_Of_Birth) VALUES (?, ?, ?, ?)',
      [driverId, driverName, nationality, dateOfBirth]
    );

    return NextResponse.json({
      success: true,
      message: `Driver ${driverName} added successfully!`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
