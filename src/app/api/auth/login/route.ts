import { NextResponse } from 'next/server';
import { COOKIE_NAME, signSessionToken } from '../../../../lib/auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const validUser = process.env.ADMIN_USER || 'admin';
    const validPass = process.env.ADMIN_PASSWORD || 'admin123';

    if (username === validUser && password === validPass) {
      const token = signSessionToken({ username, role: 'Admin' });
      const response = NextResponse.json({
        success: true,
        user: { name: 'Race Director', role: 'Admin' },
      });

      response.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 8,
      });

      return response;
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