import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Role-based credential check
    if (username === 'admin' && password === 'admin123') {
      return NextResponse.json({
        success: true,
        user: { name: 'Race Director', role: 'Admin' },
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid Admin credentials' },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
