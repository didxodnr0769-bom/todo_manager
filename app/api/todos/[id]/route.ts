import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// PATCH /api/todos/[id] - 완료 상태 변경
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { isCompleted } = await request.json()

    if (typeof isCompleted !== "boolean") {
      return NextResponse.json({ error: "isCompleted must be a boolean" }, { status: 400 })
    }

    // 먼저 해당 todo가 현재 사용자의 것인지 확인
    const existingTodo = await prisma.todo.findUnique({
      where: { id },
    })

    if (!existingTodo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 })
    }

    if (existingTodo.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const updatedTodo = await prisma.todo.update({
      where: { id },
      data: { isCompleted },
    })

    return NextResponse.json(updatedTodo)
  } catch (error) {
    console.error("Error updating todo:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// DELETE /api/todos/[id] - To-Do 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // 먼저 해당 todo가 현재 사용자의 것인지 확인
    const existingTodo = await prisma.todo.findUnique({
      where: { id },
    })

    if (!existingTodo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 })
    }

    if (existingTodo.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.todo.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Todo deleted successfully" })
  } catch (error) {
    console.error("Error deleting todo:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
