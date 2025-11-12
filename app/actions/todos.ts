"use server";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * To-Do 목록 조회 (날짜 필터링 지원) - 캐싱 적용
 */
export async function getTodos(dateParam?: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // 날짜 설정: 파라미터가 있으면 해당 날짜, 없으면 오늘
    const targetDate = dateParam ? new Date(dateParam) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // 캐싱된 함수 생성 - 사용자별, 날짜별로 캐시 키 생성
    const getCachedTodos = unstable_cache(
      async () => {
        return await prisma.todo.findMany({
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
        });
      },
      [`todos-${session.user.id}-${dateParam || "today"}`],
      {
        tags: [`todos-${session.user.id}`, `todos-${session.user.id}-${dateParam || "today"}`],
        revalidate: 60, // 60초 후 재검증
      }
    );

    const todos = await getCachedTodos();
    return todos;
  } catch (error) {
    console.error("Error fetching todos:", error);
    throw error;
  }
}

/**
 * 새 To-Do 추가
 */
export async function addTodo(content: string, date?: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    if (!content || typeof content !== "string") {
      throw new Error("Content is required");
    }

    // 날짜가 제공되면 해당 날짜 사용, 없으면 오늘 날짜 사용
    const todoDate = date ? new Date(date) : new Date();

    const todo = await prisma.todo.create({
      data: {
        content,
        userId: session.user.id,
        date: todoDate,
      },
    });

    // 캐시 무효화: 해당 사용자의 모든 todo 캐시와 특정 날짜 캐시 무효화
    revalidateTag(`todos-${session.user.id}`);
    if (date) {
      revalidateTag(`todos-${session.user.id}-${date}`);
    } else {
      revalidateTag(`todos-${session.user.id}-today`);
    }
    revalidatePath("/dashboard");

    return todo;
  } catch (error) {
    console.error("Error creating todo:", error);
    throw error;
  }
}

/**
 * To-Do 완료 상태 변경
 */
export async function toggleTodo(id: string, isCompleted: boolean) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    if (typeof isCompleted !== "boolean") {
      throw new Error("isCompleted must be a boolean");
    }

    // 먼저 해당 todo가 현재 사용자의 것인지 확인
    const existingTodo = await prisma.todo.findUnique({
      where: { id },
    });

    if (!existingTodo) {
      throw new Error("Todo not found");
    }

    if (existingTodo.userId !== session.user.id) {
      throw new Error("Forbidden");
    }

    const updatedTodo = await prisma.todo.update({
      where: { id },
      data: { isCompleted },
    });

    // 캐시 무효화
    revalidateTag(`todos-${session.user.id}`);
    revalidatePath("/dashboard");
    return updatedTodo;
  } catch (error) {
    console.error("Error updating todo:", error);
    throw error;
  }
}

/**
 * To-Do 삭제
 */
export async function deleteTodo(id: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // 먼저 해당 todo가 현재 사용자의 것인지 확인
    const existingTodo = await prisma.todo.findUnique({
      where: { id },
    });

    if (!existingTodo) {
      throw new Error("Todo not found");
    }

    if (existingTodo.userId !== session.user.id) {
      throw new Error("Forbidden");
    }

    await prisma.todo.delete({
      where: { id },
    });

    // 캐시 무효화
    revalidateTag(`todos-${session.user.id}`);
    revalidatePath("/dashboard");
    return { message: "Todo deleted successfully" };
  } catch (error) {
    console.error("Error deleting todo:", error);
    throw error;
  }
}
