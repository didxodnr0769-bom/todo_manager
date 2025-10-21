import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { google } from "googleapis"

export async function GET() {
  try {
    const session = await auth() as any

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

    // 오늘 날짜의 시작과 끝 시간 계산
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // 오늘의 캘린더 이벤트 가져오기
    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: today.toISOString(),
      timeMax: tomorrow.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    })

    const events = response.data.items || []

    return NextResponse.json({
      success: true,
      count: events.length,
      date: today.toISOString().split('T')[0],
      events: events.map((event) => ({
        id: event.id,
        summary: event.summary,
        description: event.description,
        start: event.start?.dateTime || event.start?.date,
        end: event.end?.dateTime || event.end?.date,
        location: event.location,
      })),
    })

  } catch (error: any) {
    console.error("Calendar API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch calendar events",
        details: error.message
      },
      { status: 500 }
    )
  }
}
