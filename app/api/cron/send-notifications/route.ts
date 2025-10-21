import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/cron/send-notifications - 매일 21:00시에 실행되는 Cron Job
// 당일 완료되지 않은 To-Do가 있는 사용자에게 웹 푸시 알림 발송
export async function GET() {
  try {
    // 오늘 날짜의 시작과 끝
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // 오늘 미완료 To-Do가 있는 사용자 조회
    const incompleteTodos = await prisma.todo.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
        isCompleted: false,
      },
      include: {
        user: true,
      },
    })

    // 사용자별로 그룹화
    const userTodosMap = new Map<string, typeof incompleteTodos>()
    for (const todo of incompleteTodos) {
      const userId = todo.userId
      if (!userTodosMap.has(userId)) {
        userTodosMap.set(userId, [])
      }
      userTodosMap.get(userId)!.push(todo)
    }

    const results = []

    for (const [userId, todos] of userTodosMap) {
      const user = todos[0].user
      const incompleteCount = todos.length

      // TODO: 실제 웹 푸시 알림 로직 구현
      // 현재는 주석으로 처리하고 로그만 출력
      console.log(`Notification for user ${user.email}: ${incompleteCount} incomplete todos`)

      /*
      // 웹 푸시 알림 예시 (실제 구현 시 사용)
      await sendPushNotification({
        userId: user.id,
        title: "미완료 할 일 알림",
        body: `오늘 ${incompleteCount}개의 할 일이 완료되지 않았습니다.`,
      })
      */

      results.push({
        userId,
        email: user.email,
        incompleteTodos: incompleteCount,
        status: "notification_logged", // 실제 구현 시 "sent"로 변경
      })
    }

    return NextResponse.json({
      success: true,
      notificationsSent: results.length,
      totalIncompleteTodos: incompleteTodos.length,
      results,
    })
  } catch (error) {
    console.error("Error in send-notifications cron:", error)
    return NextResponse.json(
      { error: "Internal Server Error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
