import { NextResponse } from "next/server"
import { signIn } from "@/lib/auth"

export async function GET() {
  // Google 재인증 페이지로 리다이렉트
  return NextResponse.redirect(new URL("/auth/signin?callbackUrl=/dashboard&reauth=true", process.env.NEXTAUTH_URL!))
}
