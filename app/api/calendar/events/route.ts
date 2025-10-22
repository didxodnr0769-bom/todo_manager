import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { google } from "googleapis"

export async function GET(request: Request) {
  try {
    const session = await auth() as any

    if (!session || !session.accessToken) {
      return NextResponse.json({ error: "Unauthorized - Please login again" }, { status: 401 })
    }

    // URL에서 쿼리 파라미터 추출
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get("date") // YYYY-MM-DD 형식

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

    // 날짜 설정: 쿼리 파라미터가 있으면 해당 날짜, 없으면 오늘
    const targetDate = dateParam ? new Date(dateParam) : new Date()
    targetDate.setHours(0, 0, 0, 0)
    const nextDay = new Date(targetDate)
    nextDay.setDate(nextDay.getDate() + 1)

    // 모든 캘린더 목록 가져오기
    const calendarListResponse = await calendar.calendarList.list()
    const calendars = calendarListResponse.data.items || []

    // 각 캘린더의 이벤트를 병렬로 가져오기
    const allEventsPromises = calendars.map(async (cal) => {
      try {
        const response = await calendar.events.list({
          calendarId: cal.id!,
          timeMin: targetDate.toISOString(),
          timeMax: nextDay.toISOString(),
          singleEvents: true,
          orderBy: "startTime",
        })

        const events = response.data.items || []

        return events.map((event) => ({
          id: event.id,
          summary: event.summary,
          description: event.description,
          start: event.start?.dateTime || event.start?.date,
          end: event.end?.dateTime || event.end?.date,
          location: event.location,
          calendarId: cal.id,
          calendarName: cal.summary,
          backgroundColor: cal.backgroundColor,
          foregroundColor: cal.foregroundColor,
        }))
      } catch (error) {
        console.error(`Error fetching events for calendar ${cal.id}:`, error)
        return []
      }
    })

    const eventsArrays = await Promise.all(allEventsPromises)
    const allEvents = eventsArrays.flat()

    // 시작 시간 기준으로 정렬
    allEvents.sort((a, b) => {
      const aTime = new Date(a.start || 0).getTime()
      const bTime = new Date(b.start || 0).getTime()
      return aTime - bTime
    })

    return NextResponse.json({
      success: true,
      count: allEvents.length,
      date: targetDate.toISOString().split('T')[0],
      events: allEvents,
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
