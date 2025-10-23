"use client";

import { useState } from "react";
import Header from "./Header";
import DatePicker from "./DatePicker";
import TabView from "./TabView";
import TodoListSection from "./TodoListSection";
import CalendarEventsSection from "./CalendarEventsSection";
import YesterdayTodos from "./YesterdayTodos";

interface DashboardClientProps {
  userName?: string | null;
  userEmail?: string | null;
}

export default function DashboardClient({
  userName,
  userEmail,
}: DashboardClientProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [activeTab, setActiveTab] = useState<"todos" | "calendar">("todos");

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 헤더 */}
      <Header userName={userName} userEmail={userEmail} />

      {/* 메인 컨텐츠 */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* 날짜 선택기 */}
        <DatePicker
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        {/* 탭 뷰 */}
        <TabView activeTab={activeTab} onTabChange={setActiveTab} />

        {/* 탭 컨텐츠 */}
        {activeTab === "todos" ? (
          <TodoListSection selectedDate={selectedDate} />
        ) : (
          <CalendarEventsSection selectedDate={selectedDate} />
        )}

        {/* 어제 완료하지 못한 할 일 */}
        <YesterdayTodos />
      </div>
    </div>
  );
}
