import { describe, it, expect } from "vitest";
import {
  validateTitle,
  validateContent,
  validateRequired,
  ValidationResult,
} from "./validation";

describe("질문글 입력 검증 유틸 함수", () => {
  describe("validateTitle", () => {
    it("제목이 비어있으면 에러를 반환해야 한다", () => {
      const result = validateTitle("");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("제목을 입력해주세요.");
    });

    it("제목이 2자 미만이면 에러를 반환해야 한다", () => {
      const result = validateTitle("a");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("제목은 2자 이상 50자 이하로 입력해주세요.");
    });

    it("제목이 50자 초과이면 에러를 반환해야 한다", () => {
      const longTitle = "a".repeat(51);
      const result = validateTitle(longTitle);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("제목은 2자 이상 50자 이하로 입력해주세요.");
    });

    it("제목이 2자 이상 50자 이하이면 유효해야 한다", () => {
      const result = validateTitle("적절한 제목");
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("제목이 정확히 2자이면 유효해야 한다", () => {
      const result = validateTitle("ab");
      expect(result.isValid).toBe(true);
    });

    it("제목이 정확히 50자이면 유효해야 한다", () => {
      const title = "a".repeat(50);
      const result = validateTitle(title);
      expect(result.isValid).toBe(true);
    });
  });

  describe("validateContent", () => {
    it("내용이 비어있으면 에러를 반환해야 한다", () => {
      const result = validateContent("");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("내용을 입력해주세요.");
    });

    it("내용이 10자 미만이면 에러를 반환해야 한다", () => {
      const result = validateContent("짧은내용");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("내용은 10자 이상 2000자 이하로 입력해주세요.");
    });

    it("내용이 2000자 초과이면 에러를 반환해야 한다", () => {
      const longContent = "a".repeat(2001);
      const result = validateContent(longContent);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("내용은 10자 이상 2000자 이하로 입력해주세요.");
    });

    it("내용이 10자 이상 2000자 이하이면 유효해야 한다", () => {
      const result = validateContent("적절한 길이의 내용입니다.");
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("내용이 정확히 10자이면 유효해야 한다", () => {
      const content = "a".repeat(10);
      const result = validateContent(content);
      expect(result.isValid).toBe(true);
    });

    it("내용이 정확히 2000자이면 유효해야 한다", () => {
      const content = "a".repeat(2000);
      const result = validateContent(content);
      expect(result.isValid).toBe(true);
    });
  });

  describe("validateRequired", () => {
    it("값이 비어있으면 에러를 반환해야 한다", () => {
      const result = validateRequired("", "카테고리");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("카테고리를 선택해주세요.");
    });

    it("값이 null이면 에러를 반환해야 한다", () => {
      const result = validateRequired(null, "공개 범위");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("공개 범위를 선택해주세요.");
    });

    it("값이 undefined이면 에러를 반환해야 한다", () => {
      const result = validateRequired(undefined, "카테고리");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("카테고리를 선택해주세요.");
    });

    it("값이 있으면 유효해야 한다", () => {
      const result = validateRequired("React", "카테고리");
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("공백 문자만 있으면 에러를 반환해야 한다", () => {
      const result = validateRequired("   ", "제목");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("제목을 선택해주세요.");
    });
  });
});


