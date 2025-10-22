"use client"

import { signOut } from "next-auth/react"

interface HeaderProps {
  userName?: string | null
}

export default function Header({ userName }: HeaderProps) {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  // 이름에서 첫 글자 추출 (한글/영문 지원)
  const getInitial = (name?: string | null) => {
    if (!name) return "U"
    return name.charAt(0).toUpperCase()
  }

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-xl font-bold text-gray-900">To-Do Manager</h1>

        <button
          onClick={handleSignOut}
          className="w-8 h-8 rounded-full bg-blue-500 text-white font-medium flex items-center justify-center hover:bg-blue-600 transition-colors"
          title={userName || "사용자"}
        >
          {getInitial(userName)}
        </button>
      </div>
    </header>
  )
}
