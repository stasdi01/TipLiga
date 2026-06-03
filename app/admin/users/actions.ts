"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { UserStatus } from "@/app/generated/prisma";

function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

async function uniqueReferralCode(): Promise<string> {
  while (true) {
    const code = generateReferralCode();
    const existing = await prisma.user.findUnique({
      where: { referral_code: code },
    });
    if (!existing) return code;
  }
}

export async function createUser(
  _prev: { error?: string; success?: boolean },
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await getSession();
  if (!session || session.role !== "admin") return { error: "Nedozvoljen pristup" };

  const username = (formData.get("username") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const referralCodeInput = (formData.get("referral_code") as string)?.trim().toUpperCase();

  if (!username || !password) return { error: "Korisničko ime i lozinka su obavezni" };
  if (username.length < 3) return { error: "Korisničko ime mora imati najmanje 3 karaktera" };
  if (password.length < 6) return { error: "Lozinka mora imati najmanje 6 karaktera" };

  const exists = await prisma.user.findUnique({ where: { username } });
  if (exists) return { error: "Korisničko ime je već zauzeto" };

  let referrerId: string | null = null;

  if (referralCodeInput) {
    const referrer = await prisma.user.findUnique({
      where: { referral_code: referralCodeInput },
    });
    if (!referrer) return { error: "Referal kod ne postoji" };
    referrerId = referrer.id;
  }

  const password_hash = await bcrypt.hash(password, 12);
  const referral_code = await uniqueReferralCode();

  await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        username,
        password_hash,
        referral_code,
        referred_by_id: referrerId,
        referral_points: referrerId ? 1 : 0,
      },
    });

    if (referrerId) {
      const referrer = await tx.user.findUnique({
        where: { id: referrerId },
        select: { referral_points: true },
      });
      if (referrer && referrer.referral_points < 5) {
        await tx.user.update({
          where: { id: referrerId },
          data: { referral_points: { increment: 1 } },
        });
      }
    }

    return newUser;
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function toggleUserStatus(
  userId: string,
  currentStatus: UserStatus
): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== "admin") return;

  const newStatus: UserStatus =
    currentStatus === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE;

  await prisma.user.update({
    where: { id: userId },
    data: { status: newStatus },
  });

  revalidatePath("/admin/users");
}