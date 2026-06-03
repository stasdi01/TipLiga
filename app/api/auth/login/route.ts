import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken, COOKIE_NAME, SESSION_DURATION } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { username, password } = body;

  if (!username || !password) {
    return NextResponse.json(
      { error: "Unesite korisničko ime i lozinku" },
      { status: 400 }
    );
  }

  let id: string;
  let role: "admin" | "user";

  if (username === process.env.ADMIN_USERNAME) {
    const valid = await bcrypt.compare(
      password,
      process.env.ADMIN_PASSWORD_HASH!
    );
    if (!valid) {
      return NextResponse.json(
        { error: "Pogrešno korisničko ime ili lozinka" },
        { status: 401 }
      );
    }
    id = "admin";
    role = "admin";
  } else {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || user.status === "INACTIVE") {
      return NextResponse.json(
        { error: "Pogrešno korisničko ime ili lozinka" },
        { status: 401 }
      );
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json(
        { error: "Pogrešno korisničko ime ili lozinka" },
        { status: 401 }
      );
    }
    id = user.id;
    role = "user";
  }

  const token = await signToken({ id, username, role });
  const response = NextResponse.json({ success: true });

  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION,
    path: "/",
  });

  return response;
}