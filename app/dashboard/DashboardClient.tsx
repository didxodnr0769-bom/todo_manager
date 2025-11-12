"use client";

import { useState } from "react";
import { useSwipeable } from "react-swipeable";
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

  // 오늘 날짜인지 확인하는 함수
  const isToday = () => {
    const today = new Date().toISOString().split("T")[0];
    return selectedDate === today;
  };

  // 날짜 변경 함수
  const changeDate = (days: number) => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + days);
    setSelectedDate(currentDate.toISOString().split("T")[0]);
  };

  // 탭 전환 함수
  const switchTab = (direction: "left" | "right") => {
    if (direction === "left" && activeTab === "todos") {
      setActiveTab("calendar");
    } else if (direction === "right" && activeTab === "calendar") {
      setActiveTab("todos");
    }
  };

  // 날짜 영역 스와이프 핸들러 (날짜 변경)
  const dateSwipeHandlers = useSwipeable({
    onSwipedLeft: () => changeDate(1), // 다음 날
    onSwipedRight: () => changeDate(-1), // 이전 날
    trackMouse: false,
    trackTouch: true,
    delta: 50,
    preventScrollOnSwipe: true,
  });

  // 컨텐츠 영역 스와이프 핸들러 (탭 전환)
  const contentSwipeHandlers = useSwipeable({
    onSwipedLeft: () => switchTab("left"),
    onSwipedRight: () => switchTab("right"),
    trackMouse: false,
    trackTouch: true,
    delta: 50,
    preventScrollOnSwipe: true,
  });

  return (
    <div className="min-h-screen bg-blue-50 relative">
      {/* 배경 장식 요소들 */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-pink-100/30 rounded-full blur-3xl animate-float pointer-events-none -z-10" style={{ animationDelay: '0s' }}></div>
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl animate-float pointer-events-none -z-10" style={{ animationDelay: '2s' }}></div>
      <div className="fixed top-1/2 left-1/2 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl animate-float pointer-events-none -z-10" style={{ animationDelay: '4s' }}></div>

      {/* 헤더 */}
      <Header userName={userName} userEmail={userEmail} />

      {/* 메인 컨텐츠 */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6 relative z-10">
        {/* 날짜 선택기 (스와이프로 날짜 변경) */}
        <div {...dateSwipeHandlers} className="touch-pan-y">
          <DatePicker
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </div>

        {/* 탭 뷰 */}
        <TabView activeTab={activeTab} onTabChange={setActiveTab} />

        {/* 탭 컨텐츠 (스와이프로 탭 전환) */}
        <div {...contentSwipeHandlers} className="touch-pan-y">
          {activeTab === "todos" ? (
            <TodoListSection selectedDate={selectedDate} />
          ) : (
            <CalendarEventsSection selectedDate={selectedDate} />
          )}
        </div>

        {/* 어제 완료하지 못한 할 일 (오늘의 할일 탭 & 오늘 날짜에만 표시) */}
        {activeTab === "todos" && isToday() && <YesterdayTodos />}
      </div>
    </div>
  );
}
