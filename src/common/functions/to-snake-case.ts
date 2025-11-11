/**
 * snake_case 형태로 문자열 포맷팅 변환하는 함수
 * - 활용: S3 마그넷 이미지 탐색
 *
 * @param value - snake_case 변환이 필요한 영어문자 (e.g. South Korea)
 * @returns - snake_case로 변환된 문자열 (e.g. south_korea)
 */
function toSnakeCase(value: string): string {
  if (!value) return value;
  return value.trim().toLowerCase().replace(/\s+/g, '_');
}

export default toSnakeCase;
