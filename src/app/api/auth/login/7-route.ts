import { NextResponse } from 'next/server';
import { errorMessage } from '../../../../lib/errors';
import { COOKIE_NAME, signSessionToken, type Role } from '../../../../lib/auth';

export async function POST(request: Request) {
  try {
    const validUser = process.env.ADMIN_USER;
    const validPass = process.env.ADMIN_PASSWORD;

    if (!validUser || !validPass) {
      return NextResponse.json(
        { success: false, error: 'Server misconfiguration: Admin credentials are not configured.' },
        { status: 500 }
      );
    }

    const { username, password } = await request.json();

    // Role 1: Admin (full CRUD). Role 2: Viewer (read-only), enabled only when
    // VIEWER_USER and VIEWER_PASSWORD are set in the environment.
    const viewerUser = process.env.VIEWER_USER;
    const viewerPass = process.env.VIEWER_PASSWORD;

    let role: Role | null = null;
    if (username === validUser && password === validPass) {
      role = 'Admin';
    } else if (viewerUser && viewerPass && username === viewerUser && password === viewerPass) {
      role = 'Viewer';
    }

    if (role) {
      const token = signSessionToken({ username, role });
      const response = NextResponse.json({
        success: true,
        user: { name: role === 'Admin' ? 'Race Director' : 'Race Viewer', role },
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
      { success: false, message: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: errorMessage(error) },
      { status: 500 }
    );
  }
}