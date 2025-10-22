import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { google } from "googleapis"
import { Session } from "next-auth"

interface ExtendedSession extends Session {
  accessToken?: string
}

// GET /api/calendar/list - 사용자의 모든 캘린더 목록 조회
export async function GET() {
  try {
    const session = await auth() as ExtendedSession | null

    if (!session || !session.accessToken) {
      return NextResponse.json({ error: "Unauthorized - Please login again" }, { status: 401 })
    }

    // OAuth2 클라이언트 설정
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    )

    // 액세스 토큰 설정
    oauth2Client.setCredentials({
      access_token: session.accessToken,
    })

    // Calendar API 클라이언트 생성
    const calendar = google.calendar({ version: "v3", auth: oauth2Client })

    // 캘린더 목록 가져오기
    const response = await calendar.calendarList.list()

    const calendars = response.data.items || []

    return NextResponse.json({
      success: true,
      count: calendars.length,
      calendars: calendars.map((cal) => ({
        id: cal.id,
        summary: cal.summary, // 캘린더 이름
        description: cal.description,
        primary: cal.primary, // 기본 캘린더 여부
        accessRole: cal.accessRole, // 권한 (owner, reader, writer 등)
        backgroundColor: cal.backgroundColor,
        foregroundColor: cal.foregroundColor,
        selected: cal.selected, // 구글 캘린더 UI에서 표시 여부
      })),
    })

  } catch (error: unknown) {
    console.error("Calendar List API error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      {
        error: "Failed to fetch calendar list",
        details: errorMessage
      },
      { status: 500 }
    )
  }
}
