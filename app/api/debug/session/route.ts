import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { Session } from "next-auth"

interface ExtendedSession extends Session {
  accessToken?: string
}

export async function GET() {
  try {
    const session = await auth() as ExtendedSession | null

    if (!session) {
      return NextResponse.json({ error: "No session found" }, { status: 401 })
    }

    return NextResponse.json({
      hasSession: true,
      hasAccessToken: !!session.accessToken,
      user: {
        id: session.user?.id,
        name: session.user?.name,
        email: session.user?.email,
      },
      accessTokenPreview: session.accessToken ? session.accessToken.substring(0, 20) + "..." : null,
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
