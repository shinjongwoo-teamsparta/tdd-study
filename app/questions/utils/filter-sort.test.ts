import { describe, it, expect } from "vitest";
import { filterQuestions, sortQuestions, Question } from "./filter-sort";

const mockQuestions: Question[] = [
  {
    id: "1",
    title: "React useState 사용법",
    content: "useState를 어떻게 사용하나요?",
    category: "React",
    author: "김철수",
    createdAt: "2024-01-15",
    commentCount: 5,
    likeCount: 10,
    isResolved: false,
  },
  {
    id: "2",
    title: "Vitest로 비동기 테스트하기",
    content: "비동기 함수를 테스트하는 방법은?",
    category: "테스트",
    author: "이영희",
    createdAt: "2024-01-14",
    commentCount: 3,
    likeCount: 7,
    isResolved: true,
  },
  {
    id: "3",
    title: "JavaScript 클로저란?",
    content: "클로저 개념이 어렵습니다",
    category: "JavaScript",
    author: "박민수",
    createdAt: "2024-01-13",
    commentCount: 8,
    likeCount: 15,
    isResolved: false,
  },
  {
    id: "4",
    title: "React 컴포넌트 최적화",
    content: "React 성능 최적화 방법을 알려주세요",
    category: "React",
    author: "최지수",
    createdAt: "2024-01-16",
    commentCount: 2,
    likeCount: 5,
    isResolved: false,
  },
];

describe("질문글 필터링 및 정렬 유틸 함수", () => {
  describe("filterQuestions", () => {
    describe("검색어 필터", () => {
      it("검색어가 제목에 포함된 질문만 반환해야 한다", () => {
        const result = filterQuestions(mockQuestions, { searchQuery: "React" });
        expect(result).toHaveLength(2);
        expect(result[0].id).toBe("1");
        expect(result[1].id).toBe("4");
      });

      it("검색어가 내용에 포함된 질문만 반환해야 한다", () => {
        const result = filterQuestions(mockQuestions, { searchQuery: "비동기" });
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe("2");
      });

      it("검색어가 제목 또는 내용에 포함된 질문을 반환해야 한다", () => {
        const result = filterQuestions(mockQuestions, { searchQuery: "테스트" });
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe("2");
      });

      it("검색어가 대소문자 구분 없이 작동해야 한다", () => {
        const result = filterQuestions(mockQuestions, { searchQuery: "react" });
        expect(result).toHaveLength(2);
      });

      it("검색어가 없으면 모든 질문을 반환해야 한다", () => {
        const result = filterQuestions(mockQuestions, { searchQuery: "" });
        expect(result).toHaveLength(4);
      });

      it("일치하는 질문이 없으면 빈 배열을 반환해야 한다", () => {
        const result = filterQuestions(mockQuestions, { searchQuery: "Python" });
        expect(result).toHaveLength(0);
      });
    });

    describe("카테고리 필터", () => {
      it("선택한 카테고리의 질문만 반환해야 한다", () => {
        const result = filterQuestions(mockQuestions, { category: "React" });
        expect(result).toHaveLength(2);
        expect(result.every((q) => q.category === "React")).toBe(true);
      });

      it("카테고리가 '전체'이면 모든 질문을 반환해야 한다", () => {
        const result = filterQuestions(mockQuestions, { category: "전체" });
        expect(result).toHaveLength(4);
      });

      it("카테고리가 없으면 모든 질문을 반환해야 한다", () => {
        const result = filterQuestions(mockQuestions, {});
        expect(result).toHaveLength(4);
      });
    });

    describe("해결 여부 필터", () => {
      it("해결된 질문만 반환해야 한다", () => {
        const result = filterQuestions(mockQuestions, { resolved: "resolved" });
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe("2");
        expect(result[0].isResolved).toBe(true);
      });

      it("미해결 질문만 반환해야 한다", () => {
        const result = filterQuestions(mockQuestions, { resolved: "unresolved" });
        expect(result).toHaveLength(3);
        expect(result.every((q) => !q.isResolved)).toBe(true);
      });

      it("해결 여부가 '전체'이면 모든 질문을 반환해야 한다", () => {
        const result = filterQuestions(mockQuestions, { resolved: "all" });
        expect(result).toHaveLength(4);
      });

      it("해결 여부가 없으면 모든 질문을 반환해야 한다", () => {
        const result = filterQuestions(mockQuestions, {});
        expect(result).toHaveLength(4);
      });
    });

    describe("복합 필터", () => {
      it("카테고리와 해결 여부를 동시에 필터링해야 한다", () => {
        const result = filterQuestions(mockQuestions, {
          category: "React",
          resolved: "unresolved",
        });
        expect(result).toHaveLength(2);
        expect(result.every((q) => q.category === "React" && !q.isResolved)).toBe(true);
      });

      it("검색어, 카테고리, 해결 여부를 모두 적용해야 한다", () => {
        const result = filterQuestions(mockQuestions, {
          searchQuery: "React",
          category: "React",
          resolved: "unresolved",
        });
        expect(result).toHaveLength(2);
      });
    });
  });

  describe("sortQuestions", () => {
    it("최신순으로 정렬해야 한다", () => {
      const result = sortQuestions([...mockQuestions], "latest");
      expect(result[0].id).toBe("4"); // 2024-01-16
      expect(result[1].id).toBe("1"); // 2024-01-15
      expect(result[2].id).toBe("2"); // 2024-01-14
      expect(result[3].id).toBe("3"); // 2024-01-13
    });

    it("좋아요순으로 정렬해야 한다", () => {
      const result = sortQuestions([...mockQuestions], "likes");
      expect(result[0].id).toBe("3"); // 15 likes
      expect(result[1].id).toBe("1"); // 10 likes
      expect(result[2].id).toBe("2"); // 7 likes
      expect(result[3].id).toBe("4"); // 5 likes
    });

    it("댓글 많은 순으로 정렬해야 한다", () => {
      const result = sortQuestions([...mockQuestions], "comments");
      expect(result[0].id).toBe("3"); // 8 comments
      expect(result[1].id).toBe("1"); // 5 comments
      expect(result[2].id).toBe("2"); // 3 comments
      expect(result[3].id).toBe("4"); // 2 comments
    });

    it("정렬 옵션이 없으면 최신순으로 정렬해야 한다", () => {
      const result = sortQuestions([...mockQuestions]);
      expect(result[0].id).toBe("4");
    });

    it("빈 배열을 정렬해도 에러가 발생하지 않아야 한다", () => {
      const result = sortQuestions([], "likes");
      expect(result).toHaveLength(0);
    });

    it("원본 배열을 변경하지 않아야 한다", () => {
      const original = [...mockQuestions];
      const sorted = sortQuestions(original, "likes");
      expect(original[0].id).toBe("1"); // 원본은 그대로
      expect(sorted[0].id).toBe("3"); // 정렬된 배열
    });
  });
});


