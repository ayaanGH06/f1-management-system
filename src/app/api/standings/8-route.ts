import { NextResponse } from 'next/server';
import { errorMessage } from '../../../lib/errors';
import { querySQL } from '../../../lib/db-sql';

export async function GET() {
  try {
    const standings = await querySQL('SELECT * FROM v_ConstructorStandings');
    return NextResponse.json({ success: true, data: standings });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: errorMessage(error) },
      { status: 500 }
    );
  }
}