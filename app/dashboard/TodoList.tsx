"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import AddTodoDialog from "./AddTodoDialog";

interface Todo {
  id: string;
  content: string;
  isCompleted: boolean;
  date: string;
  createdAt: string;
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // To-Do 목록 조회
  const fetchTodos = async (date?: string) => {
    try {
      setIsLoading(true);
      const dateParam = date || selectedDate;
      const response = await fetch(`/api/todos?date=${dateParam}`);
      if (!response.ok) throw new Error("Failed to fetch todos");
      const data = await response.json();
      setTodos(data);
      setError(null);
    } catch (err) {
      setError("할 일 목록을 불러오는데 실패했습니다.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // 새 To-Do 추가 (폼 제출)
  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newTodo, date: selectedDate }),
      });

      if (!response.ok) throw new Error("Failed to create todo");

      const createdTodo = await response.json();
      setTodos([...todos, createdTodo]);
      setNewTodo("");
      setError(null);
    } catch (err) {
      setError("할 일 추가에 실패했습니다.");
      console.error(err);
    }
  };

  // 다이얼로그에서 To-Do 추가
  const handleDialogAdd = async (todoData: {
    content: string;
    startTime?: string;
    endTime?: string;
  }) => {
    try {
      const content =
        todoData.startTime && todoData.endTime
          ? `${todoData.content} (${todoData.startTime} - ${todoData.endTime})`
          : todoData.content;

      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, date: selectedDate }),
      });

      if (!response.ok) throw new Error("Failed to create todo");

      const createdTodo = await response.json();
      setTodos([...todos, createdTodo]);
      setError(null);
    } catch (err) {
      setError("할 일 추가에 실패했습니다.");
      console.error(err);
    }
  };

  // To-Do 완료 상태 변경
  const toggleTodo = async (id: string, isCompleted: boolean) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: !isCompleted }),
      });

      if (!response.ok) throw new Error("Failed to update todo");

      const updatedTodo = await response.json();
      setTodos(todos.map((todo) => (todo.id === id ? updatedTodo : todo)));
      setError(null);
    } catch (err) {
      setError("할 일 상태 변경에 실패했습니다.");
      console.error(err);
    }
  };

  // To-Do 삭제
  const deleteTodo = async (id: string) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete todo");

      setTodos(todos.filter((todo) => todo.id !== id));
      setError(null);
    } catch (err) {
      setError("할 일 삭제에 실패했습니다.");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // 날짜 변경 핸들러
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  // 이전/다음 날짜로 이동
  const changeDate = (days: number) => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + days);
    setSelectedDate(currentDate.toISOString().split("T")[0]);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* 날짜 선택기 */}
      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={() => changeDate(-1)}
          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
          title="이전 날짜"
        >
          ←
        </button>
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => changeDate(1)}
          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
          title="다음 날짜"
        >
          →
        </button>
        <button
          onClick={() =>
            setSelectedDate(new Date().toISOString().split("T")[0])
          }
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          오늘
        </button>
      </div>

      {/* 일정 추가 버튼 */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          일정 추가
        </button>
      </div>

      {/* 새 To-Do 추가 폼 */}
      <form onSubmit={addTodo} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="새로운 할 일을 입력하세요"
            className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            추가
          </button>
        </div>
      </form>

      {/* To-Do 리스트 */}
      {todos.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          오늘의 할 일이 없습니다. 새로운 할 일을 추가해보세요!
        </p>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
            >
              <input
                type="checkbox"
                checked={todo.isCompleted}
                onChange={() => toggleTodo(todo.id, todo.isCompleted)}
                className="w-5 h-5 cursor-pointer"
              />
              <span
                className={`flex-1 ${
                  todo.isCompleted
                    ? "line-through text-gray-500"
                    : "text-gray-900"
                }`}
              >
                {todo.content}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* 통계 */}
      {todos.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
          전체 {todos.length}개 | 완료{" "}
          {todos.filter((t) => t.isCompleted).length}개 | 미완료{" "}
          {todos.filter((t) => !t.isCompleted).length}개
        </div>
      )}

      {/* 일정 추가 다이얼로그 */}
      <AddTodoDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onAdd={handleDialogAdd}
      />
    </div>
  );
}
