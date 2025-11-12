import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { google } from "googleapis"
import { Session } from "next-auth"

interface ExtendedSession extends Session {
  accessToken?: string
}

export async function GET(request: Request) {
  try {
    const session = await auth() as ExtendedSession | null

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

    // 날짜 비교를 위한 targetDateString (YYYY-MM-DD 형식)
    const targetDateString = targetDate.toISOString().split('T')[0]

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

        return events
          .map((event) => {
            const isAllDay = !event.start?.dateTime && !!event.start?.date
            const startDate = event.start?.dateTime || event.start?.date
            const endDate = event.end?.dateTime || event.end?.date

            return {
              id: event.id,
              summary: event.summary,
              description: event.description,
              start: startDate,
              end: endDate,
              location: event.location,
              calendarId: cal.id,
              calendarName: cal.summary,
              backgroundColor: cal.backgroundColor,
              foregroundColor: cal.foregroundColor,
              isAllDay,
            }
          })
          .filter((event) => {
            // 하루종일 이벤트의 경우, end 날짜가 targetDate보다 크거나 같아야 함
            // 예: 11월 12일 하루종일 이벤트는 start: 2025-11-11, end: 2025-11-12
            // targetDate가 2025-11-12일 때는 표시되어야 하므로 end >= targetDate
            if (event.isAllDay && event.end) {
              const endDateOnly = event.end.split('T')[0] // YYYY-MM-DD만 추출
              return endDateOnly > targetDateString // end가 targetDate보다 커야 해당 날짜 포함
            }
            return true // 일반 이벤트는 모두 포함
          })
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

  } catch (error: unknown) {
    console.error("Calendar API error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"

    // Google API 에러 처리
    if (errorMessage.includes("invalid_grant") || errorMessage.includes("Token has been expired")) {
      return NextResponse.json(
        {
          error: "Token expired",
          message: "인증 토큰이 만료되었습니다. 다시 로그인해주세요.",
          code: "TOKEN_EXPIRED"
        },
        { status: 401 }
      )
    }

    if (errorMessage.includes("Invalid Credentials") || errorMessage.includes("401")) {
      return NextResponse.json(
        {
          error: "Invalid credentials",
          message: "인증 정보가 유효하지 않습니다. 다시 로그인해주세요.",
          code: "INVALID_CREDENTIALS"
        },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        error: "Failed to fetch calendar events",
        details: errorMessage
      },
      { status: 500 }
    )
  }
}
