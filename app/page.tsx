"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SplashScreen } from "./splash/SplashPage";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // 2초 후 스플래시 화면 숨김
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(splashTimer);
  }, []);

  useEffect(() => {
    // 스플래시가 끝나고 세션 상태가 로딩 중이 아닐 때만 리다이렉트
    if (!showSplash && status !== "loading") {
      if (session) {
        router.push("/dashboard");
      } else {
        router.push("/auth/signin");
      }
    }
  }, [showSplash, session, status, router]);

  // 스플래시 화면 표시 또는 로딩 중 상태
  if (showSplash || status === "loading") {
    return <SplashScreen />;
  }

  // 리다이렉트 전까지 스플래시 화면 유지
  return <SplashScreen />;
}
