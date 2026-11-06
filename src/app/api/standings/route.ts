import { NextResponse } from 'next/server';
import { querySQL } from '../../../lib/db-sql';

export async function GET() {
  try {
    const standings = await querySQL('SELECT * FROM v_ConstructorStandings');
    return NextResponse.json({ success: true, data: standings });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}