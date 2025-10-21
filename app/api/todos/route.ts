import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/todos - 오늘 To-Do 목록 조회
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todos = await prisma.todo.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: today,
          lt: tomorrow,
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

    const { content } = await request.json()

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const todo = await prisma.todo.create({
      data: {
        content,
        userId: session.user.id,
        date: new Date(),
      },
    })

    return NextResponse.json(todo, { status: 201 })
  } catch (error) {
    console.error("Error creating todo:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
