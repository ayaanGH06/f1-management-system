import { NextResponse } from 'next/server';
import type { ResultSetHeader } from 'mysql2';
import { errorMessage } from '../../../../lib/errors';
import { querySQL } from '../../../../lib/db-sql';
import { requireAdmin, requireUser, getSessionRole } from '../../../../lib/auth';

export async function GET() {
  try {
    const authError = await requireUser();
    if (authError) return authError;

    const drivers = await querySQL(
      'SELECT Driver_ID, Driver_Name, Nationality, DATE_FORMAT(Date_Of_Birth, "%Y-%m-%d") AS Date_Of_Birth FROM DRIVER ORDER BY Driver_ID ASC'
    );
    return NextResponse.json({ success: true, drivers, role: await getSessionRole() });
  } catch (error) {
    return NextResponse.json({ success: false, error: errorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const { driverId, driverName, nationality, dateOfBirth } = await request.json();
    if (!driverId || !driverName || !nationality || !dateOfBirth) {
      return NextResponse.json({ success: false, error: 'All fields are required.' }, { status: 400 });
    }

    await querySQL(
      'INSERT INTO DRIVER (Driver_ID, Driver_Name, Nationality, Date_Of_Birth) VALUES (?, ?, ?, ?)',
      [driverId, driverName, nationality, dateOfBirth]
    );

    return NextResponse.json({ success: true, message: `Driver ${driverName} added successfully!` });
  } catch (error) {
    return NextResponse.json({ success: false, error: errorMessage(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const { driverId, driverName, nationality, dateOfBirth } = await request.json();
    if (!driverId || !driverName || !nationality || !dateOfBirth) {
      return NextResponse.json({ success: false, error: 'All fields are required for UPDATE.' }, { status: 400 });
    }

    const result = await querySQL<ResultSetHeader>(
      'UPDATE DRIVER SET Driver_Name = ?, Nationality = ?, Date_Of_Birth = ? WHERE Driver_ID = ?',
      [driverName, nationality, dateOfBirth, driverId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: `Driver #${driverId} not found.` }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Driver #${driverId} (${driverName}) updated successfully!` });
  } catch (error) {
    return NextResponse.json({ success: false, error: errorMessage(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const driverId = Number(searchParams.get('driverId'));
    if (!driverId) {
      return NextResponse.json({ success: false, error: 'driverId query parameter is required.' }, { status: 400 });
    }

    const result = await querySQL<ResultSetHeader>('DELETE FROM DRIVER WHERE Driver_ID = ?', [driverId]);
    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: `Driver #${driverId} not found.` }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Driver #${driverId} deleted successfully!` });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: `Cannot delete driver (may have race/contract records): ${errorMessage(error)}` },
      { status: 400 }
    );
  }
}