import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { google } from "googleapis"

// GET /api/cron/create-todos - 매일 00:00시에 실행되는 Cron Job
// 모든 사용자의 당일 구글 캘린더 일정을 가져와 To-Do 생성
export async function GET() {
  try {
    // 모든 사용자 조회 (Google Provider 계정이 있는 사용자만)
    const users = await prisma.user.findMany({
      include: {
        accounts: {
          where: {
            provider: "google",
          },
        },
      },
    })

    const results = []

    for (const user of users) {
      const googleAccount = user.accounts[0]
      if (!googleAccount || !googleAccount.access_token) {
        results.push({ userId: user.id, status: "skipped", reason: "No Google account or access token" })
        continue
      }

      try {
        // Google Calendar API 초기화
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET
        )

        oauth2Client.setCredentials({
          access_token: googleAccount.access_token,
          refresh_token: googleAccount.refresh_token,
        })

        const calendar = google.calendar({ version: "v3", auth: oauth2Client })

        // 오늘 날짜의 시작과 끝
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        // 오늘의 캘린더 이벤트 조회
        const response = await calendar.events.list({
          calendarId: "primary",
          timeMin: today.toISOString(),
          timeMax: tomorrow.toISOString(),
          singleEvents: true,
          orderBy: "startTime",
        })

        const events = response.data.items || []

        // 각 이벤트를 To-Do로 생성
        const createdTodos = []
        for (const event of events) {
          const todo = await prisma.todo.create({
            data: {
              content: event.summary || "Untitled Event",
              userId: user.id,
              date: today,
              isCompleted: false,
            },
          })
          createdTodos.push(todo)
        }

        results.push({
          userId: user.id,
          status: "success",
          todosCreated: createdTodos.length,
        })
      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error)
        results.push({
          userId: user.id,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    return NextResponse.json({
      success: true,
      processedUsers: users.length,
      results,
    })
  } catch (error) {
    console.error("Error in create-todos cron:", error)
    return NextResponse.json(
      { error: "Internal Server Error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
