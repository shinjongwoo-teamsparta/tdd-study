import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import QuestionEditPage from "./page";

// Mock 데이터 타입
type Question = {
  id: string;
  title: string;
  content: string;
  category: string;
  visibility: string;
  isResolved: boolean;
  authorId: string;
};

// Mock API 함수
const mockFetchQuestion = vi.fn();
const mockUpdateQuestion = vi.fn();
const mockGetCurrentUser = vi.fn();

vi.mock("./api", () => ({
  fetchQuestion: (id: string) => mockFetchQuestion(id),
  updateQuestion: (id: string, data: any) => mockUpdateQuestion(id, data),
  getCurrentUser: () => mockGetCurrentUser(),
}));

describe("질문글 수정 페이지", () => {
  const mockQuestion: Question = {
    id: "1",
    title: "React useState 사용법",
    content: "useState를 어떻게 사용하나요? 자세히 알려주세요.",
    category: "React",
    visibility: "전체 공개",
    isResolved: false,
    authorId: "user1",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue({ id: "user1", name: "김철수" });
  });

  describe("수정 모드 초기값", () => {
    it("기존 질문의 제목, 내용, 카테고리, 공개 범위가 폼에 미리 채워져 있어야 한다", async () => {
      mockFetchQuestion.mockResolvedValue(mockQuestion);

      render(<QuestionEditPage params={{ id: "1" }} />);

      await waitFor(() => {
        const titleInput = screen.getByLabelText("제목") as HTMLInputElement;
        const contentTextarea = screen.getByLabelText("내용") as HTMLTextAreaElement;
        const categorySelect = screen.getByLabelText("카테고리") as HTMLSelectElement;
        const visibilitySelect = screen.getByLabelText("공개 범위") as HTMLSelectElement;

        expect(titleInput.value).toBe("React useState 사용법");
        expect(contentTextarea.value).toBe("useState를 어떻게 사용하나요? 자세히 알려주세요.");
        expect(categorySelect.value).toBe("React");
        expect(visibilitySelect.value).toBe("전체 공개");
      });
    });

    it("해결 여부 필드가 표시되고 기존 값이 선택되어 있어야 한다", async () => {
      mockFetchQuestion.mockResolvedValue(mockQuestion);

      render(<QuestionEditPage params={{ id: "1" }} />);

      await waitFor(() => {
        const resolvedSelect = screen.getByLabelText("해결 여부") as HTMLSelectElement;
        expect(resolvedSelect).toBeInTheDocument();
        expect(resolvedSelect.value).toBe("false");
      });
    });

    it("이미 해결된 질문은 해결 여부가 '해결됨'으로 선택되어 있어야 한다", async () => {
      const resolvedQuestion = { ...mockQuestion, isResolved: true };
      mockFetchQuestion.mockResolvedValue(resolvedQuestion);

      render(<QuestionEditPage params={{ id: "1" }} />);

      await waitFor(() => {
        const resolvedSelect = screen.getByLabelText("해결 여부") as HTMLSelectElement;
        expect(resolvedSelect.value).toBe("true");
      });
    });
  });

  describe("입력 필드 표시", () => {
    it("제목, 내용, 카테고리, 공개 범위, 해결 여부 입력 필드가 표시되어야 한다", async () => {
      mockFetchQuestion.mockResolvedValue(mockQuestion);

      render(<QuestionEditPage params={{ id: "1" }} />);

      await waitFor(() => {
        expect(screen.getByLabelText("제목")).toBeInTheDocument();
        expect(screen.getByLabelText("내용")).toBeInTheDocument();
        expect(screen.getByLabelText("카테고리")).toBeInTheDocument();
        expect(screen.getByLabelText("공개 범위")).toBeInTheDocument();
        expect(screen.getByLabelText("해결 여부")).toBeInTheDocument();
      });
    });

    it("수정 완료, 취소 버튼이 표시되어야 한다", async () => {
      mockFetchQuestion.mockResolvedValue(mockQuestion);

      render(<QuestionEditPage params={{ id: "1" }} />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "수정 완료" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "취소" })).toBeInTheDocument();
      });
    });
  });

  describe("권한 검증", () => {
    it("작성자가 아닌 사용자는 수정 페이지에 접근할 수 없어야 한다", async () => {
      mockFetchQuestion.mockResolvedValue(mockQuestion);
      mockGetCurrentUser.mockResolvedValue({ id: "user2", name: "이영희" });

      render(<QuestionEditPage params={{ id: "1" }} />);

      await waitFor(() => {
        expect(screen.getByText("수정 권한이 없습니다.")).toBeInTheDocument();
      });

      expect(screen.queryByLabelText("제목")).not.toBeInTheDocument();
    });

    it("작성자는 수정 폼이 표시되어야 한다", async () => {
      mockFetchQuestion.mockResolvedValue(mockQuestion);
      mockGetCurrentUser.mockResolvedValue({ id: "user1", name: "김철수" });

      render(<QuestionEditPage params={{ id: "1" }} />);

      await waitFor(() => {
        expect(screen.getByLabelText("제목")).toBeInTheDocument();
        expect(screen.queryByText("수정 권한이 없습니다.")).not.toBeInTheDocument();
      });
    });
  });

  describe("필수 입력 검증", () => {
    it("제목을 비우고 수정 완료를 클릭하면 에러 메시지가 표시되어야 한다", async () => {
      const user = userEvent.setup();
      mockFetchQuestion.mockResolvedValue(mockQuestion);

      render(<QuestionEditPage params={{ id: "1" }} />);

      await waitFor(() => {
        expect(screen.getByLabelText("제목")).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText("제목");
      await user.clear(titleInput);

      const submitButton = screen.getByRole("button", { name: "수정 완료" });
      await user.click(submitButton);

      expect(screen.getByText("제목을 입력해주세요.")).toBeInTheDocument();
      expect(mockUpdateQuestion).not.toHaveBeenCalled();
    });

    it("내용을 비우고 수정 완료를 클릭하면 에러 메시지가 표시되어야 한다", async () => {
      const user = userEvent.setup();
      mockFetchQuestion.mockResolvedValue(mockQuestion);

      render(<QuestionEditPage params={{ id: "1" }} />);

      await waitFor(() => {
        expect(screen.getByLabelText("내용")).toBeInTheDocument();
      });

      const contentTextarea = screen.getByLabelText("내용");
      await user.clear(contentTextarea);

      const submitButton = screen.getByRole("button", { name: "수정 완료" });
      await user.click(submitButton);

      expect(screen.getByText("내용을 입력해주세요.")).toBeInTheDocument();
      expect(mockUpdateQuestion).not.toHaveBeenCalled();
    });
  });

  describe("길이 검증", () => {
    it("제목이 2자 미만이면 에러 메시지가 표시되어야 한다", async () => {
      const user = userEvent.setup();
      mockFetchQuestion.mockResolvedValue(mockQuestion);

      render(<QuestionEditPage params={{ id: "1" }} />);

      await waitFor(() => {
        expect(screen.getByLabelText("제목")).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText("제목");
      await user.clear(titleInput);
      await user.type(titleInput, "a");
      await user.tab(); // blur 이벤트 발생

      expect(screen.getByText("제목은 2자 이상 50자 이하로 입력해주세요.")).toBeInTheDocument();
    });

    it("제목이 50자 초과이면 에러 메시지가 표시되어야 한다", async () => {
      const user = userEvent.setup();
      mockFetchQuestion.mockResolvedValue(mockQuestion);

      render(<QuestionEditPage params={{ id: "1" }} />);

      await waitFor(() => {
        expect(screen.getByLabelText("제목")).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText("제목");
      await user.clear(titleInput);
      const longTitle = "a".repeat(51);
      await user.type(titleInput, longTitle);
      await user.tab(); // blur 이벤트 발생

      expect(screen.getByText("제목은 2자 이상 50자 이하로 입력해주세요.")).toBeInTheDocument();
    });

    it("내용이 10자 미만이면 에러 메시지가 표시되어야 한다", async () => {
      const user = userEvent.setup();
      mockFetchQuestion.mockResolvedValue(mockQuestion);

      render(<QuestionEditPage params={{ id: "1" }} />);

      await waitFor(() => {
        expect(screen.getByLabelText("내용")).toBeInTheDocument();
      });

      const contentTextarea = screen.getByLabelText("내용");
      await user.clear(contentTextarea);
      await user.type(contentTextarea, "짧은내용");
      await user.tab(); // blur 이벤트 발생

      expect(screen.getByText("내용은 10자 이상 2000자 이하로 입력해주세요.")).toBeInTheDocument();
    });

    it("내용이 2000자 초과이면 에러 메시지가 표시되어야 한다", async () => {
      const user = userEvent.setup();
      mockFetchQuestion.mockResolvedValue(mockQuestion);

      render(<QuestionEditPage params={{ id: "1" }} />);

      await waitFor(() => {
        expect(screen.getByLabelText("내용")).toBeInTheDocument();
      });

      const contentTextarea = screen.getByLabelText("내용");
      await user.clear(contentTextarea);
      const longContent = "a".repeat(2001);
      await user.type(contentTextarea, longContent);
      await user.tab(); // blur 이벤트 발생

      expect(screen.getByText("내용은 10자 이상 2000자 이하로 입력해주세요.")).toBeInTheDocument();
    });
  });

  describe("수정 완료 시 동작", () => {
    it("모든 입력이 유효하면 질문이 수정되고 성공 메시지가 표시되어야 한다", async () => {
      const user = userEvent.setup();
      mockFetchQuestion.mockResolvedValue(mockQuestion);
      mockUpdateQuestion.mockResolvedValue({
        ...mockQuestion,
        title: "수정된 제목",
        content: "수정된 내용입니다. 자세히 알려주세요.",
      });

      render(<QuestionEditPage params={{ id: "1" }} />);

      await waitFor(() => {
        expect(screen.getByLabelText("제목")).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText("제목");
      const contentTextarea = screen.getByLabelText("내용");

      await user.clear(titleInput);
      await user.type(titleInput, "수정된 제목");
      await user.clear(contentTextarea);
      await user.type(contentTextarea, "수정된 내용입니다. 자세히 알려주세요.");

      const submitButton = screen.getByRole("button", { name: "수정 완료" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateQuestion).toHaveBeenCalledWith("1", {
          title: "수정된 제목",
          content: "수정된 내용입니다. 자세히 알려주세요.",
          category: "React",
          visibility: "전체 공개",
          isResolved: false,
        });
      });

      expect(screen.getByText("수정이 완료되었습니다.")).toBeInTheDocument();
    });

    it("해결 여부를 변경하면 변경된 값이 저장되어야 한다", async () => {
      const user = userEvent.setup();
      mockFetchQuestion.mockResolvedValue(mockQuestion);
      mockUpdateQuestion.mockResolvedValue({
        ...mockQuestion,
        isResolved: true,
      });

      render(<QuestionEditPage params={{ id: "1" }} />);

      await waitFor(() => {
        expect(screen.getByLabelText("해결 여부")).toBeInTheDocument();
      });

      const resolvedSelect = screen.getByLabelText("해결 여부");
      await user.selectOptions(resolvedSelect, "true");

      const submitButton = screen.getByRole("button", { name: "수정 완료" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateQuestion).toHaveBeenCalledWith("1", expect.objectContaining({
          isResolved: true,
        }));
      });
    });

    it("수정 성공 후 상세 페이지로 이동해야 한다", async () => {
      const user = userEvent.setup();
      mockFetchQuestion.mockResolvedValue(mockQuestion);
      mockUpdateQuestion.mockResolvedValue(mockQuestion);
      const mockPush = vi.fn();

      // useRouter mock
      vi.mock("next/navigation", () => ({
        useRouter: () => ({ push: mockPush }),
      }));

      render(<QuestionEditPage params={{ id: "1" }} />);

      await waitFor(() => {
        expect(screen.getByLabelText("제목")).toBeInTheDocument();
      });

      const submitButton = screen.getByRole("button", { name: "수정 완료" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/questions/1");
      });
    });
  });

  describe("수정 실패 시 동작", () => {
    it("서버 에러가 발생하면 에러 메시지가 표시되어야 한다", async () => {
      const user = userEvent.setup();
      mockFetchQuestion.mockResolvedValue(mockQuestion);
      mockUpdateQuestion.mockRejectedValue(new Error("서버 에러"));

      render(<QuestionEditPage params={{ id: "1" }} />);

      await waitFor(() => {
        expect(screen.getByLabelText("제목")).toBeInTheDocument();
      });

      const submitButton = screen.getByRole("button", { name: "수정 완료" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("수정에 실패했습니다. 다시 시도해주세요.")).toBeInTheDocument();
      });
    });
  });

  describe("취소 버튼", () => {
    it("취소 버튼을 클릭하면 상세 페이지로 이동해야 한다", async () => {
      const user = userEvent.setup();
      mockFetchQuestion.mockResolvedValue(mockQuestion);
      const mockPush = vi.fn();

      // useRouter mock
      vi.mock("next/navigation", () => ({
        useRouter: () => ({ push: mockPush }),
      }));

      render(<QuestionEditPage params={{ id: "1" }} />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "취소" })).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole("button", { name: "취소" });
      await user.click(cancelButton);

      expect(mockPush).toHaveBeenCalledWith("/questions/1");
    });
  });

  describe("로딩/에러 상태", () => {
    it("질문 데이터를 불러오는 중일 때 로딩 메시지가 표시되어야 한다", () => {
      mockFetchQuestion.mockReturnValue(new Promise(() => {})); // 무한 대기 상태

      render(<QuestionEditPage params={{ id: "1" }} />);

      expect(screen.getByText(/로딩/)).toBeInTheDocument();
    });

    it("질문을 찾을 수 없으면 에러 메시지가 표시되어야 한다", async () => {
      mockFetchQuestion.mockRejectedValue(new Error("Not Found"));

      render(<QuestionEditPage params={{ id: "1" }} />);

      await waitFor(() => {
        expect(screen.getByText("질문을 불러오지 못했습니다. 다시 시도해주세요.")).toBeInTheDocument();
      });
    });

    it("수정 중일 때 버튼이 비활성화되고 로딩 메시지가 표시되어야 한다", async () => {
      const user = userEvent.setup();
      mockFetchQuestion.mockResolvedValue(mockQuestion);
      mockUpdateQuestion.mockReturnValue(new Promise(() => {})); // 무한 대기 상태

      render(<QuestionEditPage params={{ id: "1" }} />);

      await waitFor(() => {
        expect(screen.getByLabelText("제목")).toBeInTheDocument();
      });

      const submitButton = screen.getByRole("button", { name: "수정 완료" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(screen.getByText(/수정 중/)).toBeInTheDocument();
      });
    });
  });

  describe("카테고리 및 공개 범위 변경", () => {
    it("카테고리를 변경하면 변경된 값이 저장되어야 한다", async () => {
      const user = userEvent.setup();
      mockFetchQuestion.mockResolvedValue(mockQuestion);
      mockUpdateQuestion.mockResolvedValue({
        ...mockQuestion,
        category: "JavaScript",
      });

      render(<QuestionEditPage params={{ id: "1" }} />);

      await waitFor(() => {
        expect(screen.getByLabelText("카테고리")).toBeInTheDocument();
      });

      const categorySelect = screen.getByLabelText("카테고리");
      await user.selectOptions(categorySelect, "JavaScript");

      const submitButton = screen.getByRole("button", { name: "수정 완료" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateQuestion).toHaveBeenCalledWith("1", expect.objectContaining({
          category: "JavaScript",
        }));
      });
    });

    it("공개 범위를 변경하면 변경된 값이 저장되어야 한다", async () => {
      const user = userEvent.setup();
      mockFetchQuestion.mockResolvedValue(mockQuestion);
      mockUpdateQuestion.mockResolvedValue({
        ...mockQuestion,
        visibility: "팀원만",
      });

      render(<QuestionEditPage params={{ id: "1" }} />);

      await waitFor(() => {
        expect(screen.getByLabelText("공개 범위")).toBeInTheDocument();
      });

      const visibilitySelect = screen.getByLabelText("공개 범위");
      await user.selectOptions(visibilitySelect, "팀원만");

      const submitButton = screen.getByRole("button", { name: "수정 완료" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateQuestion).toHaveBeenCalledWith("1", expect.objectContaining({
          visibility: "팀원만",
        }));
      });
    });
  });
});


