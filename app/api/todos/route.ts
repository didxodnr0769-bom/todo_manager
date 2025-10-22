import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/todos - To-Do 목록 조회 (날짜 필터링 지원)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // URL에서 date 쿼리 파라미터 추출 (YYYY-MM-DD 형식)
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get("date")

    // 날짜 설정: 쿼리 파라미터가 있으면 해당 날짜, 없으면 오늘
    const targetDate = dateParam ? new Date(dateParam) : new Date()
    targetDate.setHours(0, 0, 0, 0)

    const nextDay = new Date(targetDate)
    nextDay.setDate(nextDay.getDate() + 1)

    const todos = await prisma.todo.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: targetDate,
          lt: nextDay,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    return NextResponse.json(todos)
  } catch (error) {
    console.error("Error fetching todos:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// POST /api/todos - 새 To-Do 추가
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content, date } = await request.json()

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    // 날짜가 제공되면 해당 날짜 사용, 없으면 오늘 날짜 사용
    const todoDate = date ? new Date(date) : new Date()

    const todo = await prisma.todo.create({
      data: {
        content,
        userId: session.user.id,
        date: todoDate,
      },
    })

    return NextResponse.json(todo, { status: 201 })
  } catch (error) {
    console.error("Error creating todo:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
