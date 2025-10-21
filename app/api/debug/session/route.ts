import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth() as any

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

  } catch (error: any) {
    console.error("Session debug error:", error)
    return NextResponse.json(
      { error: "Failed to get session", details: error.message },
      { status: 500 }
    )
  }
}
