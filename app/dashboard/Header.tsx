"use client"

import { useState, useRef, useEffect } from "react"
import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"

interface HeaderProps {
  userName?: string | null
  userEmail?: string | null
}

export default function Header({ userName, userEmail }: HeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  // 이름에서 첫 글자 추출 (한글/영문 지원)
  const getInitial = (name?: string | null) => {
    if (!name) return "U"
    return name.charAt(0).toUpperCase()
  }

  // 모달 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false)
      }
    }

    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isProfileOpen])

  return (
    <header className="bg-white/95 backdrop-blur-md glass-shadow relative z-20 sticky top-0 border-b border-gray-200/50">
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-xl font-bold text-gray-700 drop-shadow-sm">To-Do Manager</h1>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-8 h-8 rounded-full bg-white/40 backdrop-blur-sm text-gray-700 font-medium flex items-center justify-center hover:bg-white/60 transition-all duration-300 glass-shadow"
            title={userName || "사용자"}
          >
            {getInitial(userName)}
          </button>

          {/* 프로필 모달 */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-md rounded-2xl glass-shadow-strong py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 border border-white/40">
              {/* 사용자 정보 */}
              <div className="px-4 py-3 border-b border-gray-300/30">
                <p className="text-sm font-medium text-gray-700">
                  {userName || "사용자"}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {userEmail || "이메일 없음"}
                </p>
              </div>

              {/* 로그아웃 버튼 */}
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-white/20 transition-all duration-200 flex items-center gap-2 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
