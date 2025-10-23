import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"

/**
 * Google OAuth 토큰 갱신 함수
 * @param refreshToken - Google OAuth refresh token
 * @returns 새로운 액세스 토큰 정보
 */
async function refreshAccessToken(refreshToken: string) {
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    })

    const tokens = await response.json()

    if (!response.ok) {
      throw new Error(tokens.error || "Failed to refresh token")
    }

    return {
      accessToken: tokens.access_token,
      accessTokenExpires: Date.now() + tokens.expires_in * 1000,
      refreshToken: tokens.refresh_token ?? refreshToken, // 새 refresh token이 없으면 기존 것 사용
    }
  } catch (error) {
    console.error("Error refreshing access token:", error)
    throw error
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt", // JWT 세션 전략 명시
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/calendar.readonly",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  cookies: {
    pkceCodeVerifier: {
      name: "next-auth.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  useSecureCookies: process.env.NODE_ENV === "production",
  callbacks: {
    async jwt({ token, account }) {
      // 초기 로그인: 계정 정보로 토큰 설정
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at
            ? account.expires_at * 1000
            : Date.now() + 3600 * 1000, // 기본값: 1시간
        }
      }

      // 토큰이 아직 유효한 경우 그대로 반환
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token
      }

      // 토큰이 만료된 경우 갱신 시도
      if (token.refreshToken) {
        try {
          const refreshedTokens = await refreshAccessToken(token.refreshToken as string)
          return {
            ...token,
            accessToken: refreshedTokens.accessToken,
            accessTokenExpires: refreshedTokens.accessTokenExpires,
            refreshToken: refreshedTokens.refreshToken,
          }
        } catch (error) {
          console.error("Failed to refresh access token:", error)
          // 토큰 갱신 실패 시 기존 토큰 반환 (재로그인 필요)
          return {
            ...token,
            error: "RefreshAccessTokenError",
          }
        }
      }

      return token
    },
    async session({ session, token }) {
      // JWT 전략 사용 시 token.sub에서 사용자 ID 가져오기
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      // 세션에 액세스 토큰 추가
      if (token.accessToken) {
        session.accessToken = token.accessToken as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
})
