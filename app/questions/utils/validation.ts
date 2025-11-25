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
    return {
      isValid: false,
      error: `${fieldName}를 선택해주세요.`,
    };
  }

  return { isValid: true };
}


