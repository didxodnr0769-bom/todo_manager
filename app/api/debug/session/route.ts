import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { Session } from "next-auth"

interface ExtendedSession extends Session {
  accessToken?: string
  error?: string
}

/**
 * 개발/디버깅용 세션 정보 확인 API
 * 세션 상태, 토큰 유무, 에러 상태 등을 확인할 수 있습니다.
 */
export async function GET() {
  // 프로덕션 환경에서는 보안을 위해 비활성화
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 })
  }

  try {
    const session = await auth() as ExtendedSession | null

    if (!session) {
      return NextResponse.json({
        authenticated: false,
        message: "No active session found",
        recommendation: "Please log in again",
      })
    }

    // 세션 에러 상태 확인
    const hasAuthError = !!session.error
    const errorType = session.error || null

    return NextResponse.json({
      authenticated: true,
      hasSession: true,
      hasAccessToken: !!session.accessToken,
      hasAuthError,
      errorType,
      user: {
        id: session.user?.id,
        name: session.user?.name,
        email: session.user?.email,
      },
      accessTokenPreview: session.accessToken ? session.accessToken.substring(0, 20) + "..." : null,
      recommendation: hasAuthError
        ? "Token refresh failed. Please re-authenticate."
        : "Session is valid",
    })

  } catch (error: unknown) {
    console.error("Session debug error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: "Failed to get session", details: errorMessage },
      { status: 500 }
    )
  }
}
