/**
 * 한국 시간(KST) 기준 날짜 유틸리티 함수
 */

/**
 * 한국 시간 기준 날짜를 YYYY-MM-DD 형식으로 반환
 * @param date - 변환할 Date 객체 (기본값: 현재 시간)
 * @returns YYYY-MM-DD 형식의 날짜 문자열
 */
export function getKSTDateString(date: Date = new Date()): string {
  const kstDate = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Seoul" })
  );
  const year = kstDate.getFullYear();
  const month = String(kstDate.getMonth() + 1).padStart(2, "0");
  const day = String(kstDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * 한국 시간 기준 오늘 날짜를 YYYY-MM-DD 형식으로 반환
 * @returns YYYY-MM-DD 형식의 오늘 날짜 문자열
 */
export function getTodayKST(): string {
  return getKSTDateString();
}

/**
 * 주어진 날짜가 한국 시간 기준 오늘인지 확인
 * @param dateString - YYYY-MM-DD 형식의 날짜 문자열
 * @returns 오늘이면 true, 아니면 false
 */
export function isKSTToday(dateString: string): boolean {
  return dateString === getTodayKST();
}

/**
 * 날짜 문자열에 일수를 더하거나 빼서 새로운 날짜 반환
 * @param dateString - YYYY-MM-DD 형식의 날짜 문자열
 * @param days - 더할 일수 (음수면 과거 날짜)
 * @returns YYYY-MM-DD 형식의 새로운 날짜 문자열
 */
export function addDaysToDateString(dateString: string, days: number): string {
  const date = new Date(dateString + "T00:00:00");
  date.setDate(date.getDate() + days);
  return getKSTDateString(date);
}
