export type ValidationResult = {
  isValid: boolean;
  error?: string;
};

/**
 * 제목 유효성 검증
 * @param title - 검증할 제목
 * @returns 검증 결과
 */
export function validateTitle(title: string): ValidationResult {
  if (!title || title.trim() === "") {
    return {
      isValid: false,
      error: "제목을 입력해주세요.",
    };
  }

  if (title.length < 2 || title.length > 50) {
    return {
      isValid: false,
      error: "제목은 2자 이상 50자 이하로 입력해주세요.",
    };
  }

  return { isValid: true };
}

/**
 * 내용 유효성 검증
 * @param content - 검증할 내용
 * @returns 검증 결과
 */
export function validateContent(content: string): ValidationResult {
  if (!content || content.trim() === "") {
    return {
      isValid: false,
      error: "내용을 입력해주세요.",
    };
  }

  if (content.length < 10 || content.length > 2000) {
    return {
      isValid: false,
      error: "내용은 10자 이상 2000자 이하로 입력해주세요.",
    };
  }

  return { isValid: true };
}

/**
 * 한국어 조사 선택 함수
 * @param word - 단어
 * @returns "을" 또는 "를"
 */
function getJosa(word: string): string {
  const lastChar = word.charAt(word.length - 1);
  const charCode = lastChar.charCodeAt(0);
  
  // 한글 범위: 0xAC00 ~ 0xD7A3
  if (charCode >= 0xAC00 && charCode <= 0xD7A3) {
    // 받침이 있으면 "을", 없으면 "를"
    return (charCode - 0xAC00) % 28 === 0 ? "를" : "을";
  }
  
  // 한글이 아닌 경우 기본값 "을"
  return "을";
}

/**
 * 필수 입력 검증
 * @param value - 검증할 값
 * @param fieldName - 필드 이름
 * @returns 검증 결과
 */
export function validateRequired(
  value: string | null | undefined,
  fieldName: string
): ValidationResult {
  if (!value || value.trim() === "") {
    const josa = getJosa(fieldName);
    return {
      isValid: false,
      error: `${fieldName}${josa} 선택해주세요.`,
    };
  }

  return { isValid: true };
}


