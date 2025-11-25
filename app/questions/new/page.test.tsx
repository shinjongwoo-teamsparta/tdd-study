import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import QuestionNewPage from "./page";

// Mock API 함수
const mockCreateQuestion = vi.fn();

vi.mock("./api", () => ({
  createQuestion: (data: any) => mockCreateQuestion(data),
}));

describe("질문글 작성 페이지", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("입력 필드 표시", () => {
    it("제목, 내용, 카테고리, 공개 범위 입력 필드가 표시되어야 한다", () => {
      render(<QuestionNewPage />);

      expect(screen.getByLabelText("제목")).toBeInTheDocument();
      expect(screen.getByLabelText("내용")).toBeInTheDocument();
      expect(screen.getByLabelText("카테고리")).toBeInTheDocument();
      expect(screen.getByLabelText("공개 범위")).toBeInTheDocument();
    });

    it("카테고리 드롭다운에 올바른 옵션이 표시되어야 한다", () => {
      render(<QuestionNewPage />);

      const categorySelect = screen.getByLabelText("카테고리") as HTMLSelectElement;
      const options = Array.from(categorySelect.options).map((opt) => opt.value);

      expect(options).toContain("JavaScript");
      expect(options).toContain("React");
      expect(options).toContain("테스트");
      expect(options).toContain("기타");
    });

    it("공개 범위 드롭다운에 올바른 옵션이 표시되어야 한다", () => {
      render(<QuestionNewPage />);

      const visibilitySelect = screen.getByLabelText("공개 범위") as HTMLSelectElement;
      const options = Array.from(visibilitySelect.options).map((opt) => opt.value);

      expect(options).toContain("전체 공개");
      expect(options).toContain("팀원만");
      expect(options).toContain("비공개");
    });

    it("등록하기, 취소 버튼이 표시되어야 한다", () => {
      render(<QuestionNewPage />);

      expect(screen.getByRole("button", { name: "등록하기" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "취소" })).toBeInTheDocument();
    });
  });

  describe("필수 입력 검증", () => {
    it("제목이 비어 있는 상태에서 등록하기를 클릭하면 에러 메시지가 표시되어야 한다", async () => {
      const user = userEvent.setup();
      render(<QuestionNewPage />);

      const submitButton = screen.getByRole("button", { name: "등록하기" });
      await user.click(submitButton);

      expect(screen.getByText("제목을 입력해주세요.")).toBeInTheDocument();
      expect(mockCreateQuestion).not.toHaveBeenCalled();
    });

    it("내용이 비어 있는 상태에서 등록하기를 클릭하면 에러 메시지가 표시되어야 한다", async () => {
      const user = userEvent.setup();
      render(<QuestionNewPage />);

      const titleInput = screen.getByLabelText("제목");
      await user.type(titleInput, "테스트 제목");

      const submitButton = screen.getByRole("button", { name: "등록하기" });
      await user.click(submitButton);

      expect(screen.getByText("내용을 입력해주세요.")).toBeInTheDocument();
      expect(mockCreateQuestion).not.toHaveBeenCalled();
    });

    it("카테고리가 선택되지 않은 상태에서 등록하기를 클릭하면 에러 메시지가 표시되어야 한다", async () => {
      const user = userEvent.setup();
      render(<QuestionNewPage />);

      const titleInput = screen.getByLabelText("제목");
      const contentTextarea = screen.getByLabelText("내용");
      
      await user.type(titleInput, "테스트 제목");
      await user.type(contentTextarea, "테스트 내용입니다.");

      const submitButton = screen.getByRole("button", { name: "등록하기" });
      await user.click(submitButton);

      expect(screen.getByText("카테고리를 선택해주세요.")).toBeInTheDocument();
      expect(mockCreateQuestion).not.toHaveBeenCalled();
    });

    it("공개 범위가 선택되지 않은 상태에서 등록하기를 클릭하면 에러 메시지가 표시되어야 한다", async () => {
      const user = userEvent.setup();
      render(<QuestionNewPage />);

      const titleInput = screen.getByLabelText("제목");
      const contentTextarea = screen.getByLabelText("내용");
      const categorySelect = screen.getByLabelText("카테고리");
      
      await user.type(titleInput, "테스트 제목");
      await user.type(contentTextarea, "테스트 내용입니다.");
      await user.selectOptions(categorySelect, "React");

      const submitButton = screen.getByRole("button", { name: "등록하기" });
      await user.click(submitButton);

      expect(screen.getByText("공개 범위를 선택해주세요.")).toBeInTheDocument();
      expect(mockCreateQuestion).not.toHaveBeenCalled();
    });
  });

  describe("길이 검증", () => {
    it("제목이 2자 미만이면 에러 메시지가 표시되어야 한다", async () => {
      const user = userEvent.setup();
      render(<QuestionNewPage />);

      const titleInput = screen.getByLabelText("제목");
      await user.type(titleInput, "a");
      await user.tab(); // blur 이벤트 발생

      expect(screen.getByText("제목은 2자 이상 50자 이하로 입력해주세요.")).toBeInTheDocument();
    });

    it("제목이 50자 초과이면 에러 메시지가 표시되어야 한다", async () => {
      const user = userEvent.setup();
      render(<QuestionNewPage />);

      const titleInput = screen.getByLabelText("제목");
      const longTitle = "a".repeat(51);
      await user.type(titleInput, longTitle);
      await user.tab(); // blur 이벤트 발생

      expect(screen.getByText("제목은 2자 이상 50자 이하로 입력해주세요.")).toBeInTheDocument();
    });

    it("제목이 2자 이상 50자 이하이면 에러 메시지가 표시되지 않아야 한다", async () => {
      const user = userEvent.setup();
      render(<QuestionNewPage />);

      const titleInput = screen.getByLabelText("제목");
      await user.type(titleInput, "적절한 제목");
      await user.tab(); // blur 이벤트 발생

      expect(screen.queryByText("제목은 2자 이상 50자 이하로 입력해주세요.")).not.toBeInTheDocument();
    });

    it("내용이 10자 미만이면 에러 메시지가 표시되어야 한다", async () => {
      const user = userEvent.setup();
      render(<QuestionNewPage />);

      const contentTextarea = screen.getByLabelText("내용");
      await user.type(contentTextarea, "짧은내용");
      await user.tab(); // blur 이벤트 발생

      expect(screen.getByText("내용은 10자 이상 2000자 이하로 입력해주세요.")).toBeInTheDocument();
    });

    it("내용이 2000자 초과이면 에러 메시지가 표시되어야 한다", async () => {
      const user = userEvent.setup();
      render(<QuestionNewPage />);

      const contentTextarea = screen.getByLabelText("내용");
      const longContent = "a".repeat(2001);
      await user.type(contentTextarea, longContent);
      await user.tab(); // blur 이벤트 발생

      expect(screen.getByText("내용은 10자 이상 2000자 이하로 입력해주세요.")).toBeInTheDocument();
    });

    it("내용이 10자 이상 2000자 이하이면 에러 메시지가 표시되지 않아야 한다", async () => {
      const user = userEvent.setup();
      render(<QuestionNewPage />);

      const contentTextarea = screen.getByLabelText("내용");
      await user.type(contentTextarea, "적절한 길이의 내용입니다.");
      await user.tab(); // blur 이벤트 발생

      expect(screen.queryByText("내용은 10자 이상 2000자 이하로 입력해주세요.")).not.toBeInTheDocument();
    });
  });

  describe("등록 성공 시 동작", () => {
    it("모든 입력이 유효하면 질문이 등록되고 성공 메시지가 표시되어야 한다", async () => {
      const user = userEvent.setup();
      const createdQuestion = {
        id: "new-id",
        title: "새로운 질문",
        content: "질문 내용입니다. 자세히 알고 싶습니다.",
        category: "React",
        visibility: "전체 공개",
      };
      mockCreateQuestion.mockResolvedValue(createdQuestion);

      render(<QuestionNewPage />);

      const titleInput = screen.getByLabelText("제목");
      const contentTextarea = screen.getByLabelText("내용");
      const categorySelect = screen.getByLabelText("카테고리");
      const visibilitySelect = screen.getByLabelText("공개 범위");

      await user.type(titleInput, "새로운 질문");
      await user.type(contentTextarea, "질문 내용입니다. 자세히 알고 싶습니다.");
      await user.selectOptions(categorySelect, "React");
      await user.selectOptions(visibilitySelect, "전체 공개");

      const submitButton = screen.getByRole("button", { name: "등록하기" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreateQuestion).toHaveBeenCalledWith({
          title: "새로운 질문",
          content: "질문 내용입니다. 자세히 알고 싶습니다.",
          category: "React",
          visibility: "전체 공개",
        });
      });

      expect(screen.getByText("등록이 완료되었습니다.")).toBeInTheDocument();
    });

    it("등록 성공 후 상세 페이지로 이동해야 한다", async () => {
      const user = userEvent.setup();
      const createdQuestion = {
        id: "new-id",
        title: "새로운 질문",
        content: "질문 내용입니다.",
        category: "React",
        visibility: "전체 공개",
      };
      mockCreateQuestion.mockResolvedValue(createdQuestion);

      render(<QuestionNewPage />);

      const titleInput = screen.getByLabelText("제목");
      const contentTextarea = screen.getByLabelText("내용");
      const categorySelect = screen.getByLabelText("카테고리");
      const visibilitySelect = screen.getByLabelText("공개 범위");

      await user.type(titleInput, "새로운 질문");
      await user.type(contentTextarea, "질문 내용입니다. 자세히 알고 싶습니다.");
      await user.selectOptions(categorySelect, "React");
      await user.selectOptions(visibilitySelect, "전체 공개");

      const submitButton = screen.getByRole("button", { name: "등록하기" });
      await user.click(submitButton);

      await waitFor(() => {
        expect((global as any).mockPush).toHaveBeenCalledWith("/questions/new-id");
      });
    });
  });

  describe("등록 실패 시 동작", () => {
    it("서버 에러가 발생하면 에러 메시지가 표시되어야 한다", async () => {
      const user = userEvent.setup();
      mockCreateQuestion.mockRejectedValue(new Error("서버 에러"));

      render(<QuestionNewPage />);

      const titleInput = screen.getByLabelText("제목");
      const contentTextarea = screen.getByLabelText("내용");
      const categorySelect = screen.getByLabelText("카테고리");
      const visibilitySelect = screen.getByLabelText("공개 범위");

      await user.type(titleInput, "새로운 질문");
      await user.type(contentTextarea, "질문 내용입니다. 자세히 알고 싶습니다.");
      await user.selectOptions(categorySelect, "React");
      await user.selectOptions(visibilitySelect, "전체 공개");

      const submitButton = screen.getByRole("button", { name: "등록하기" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("등록에 실패했습니다. 다시 시도해주세요.")).toBeInTheDocument();
      });
    });
  });

  describe("취소 버튼", () => {
    it("취소 버튼을 클릭하면 목록 페이지로 이동해야 한다", async () => {
      const user = userEvent.setup();

      render(<QuestionNewPage />);

      const cancelButton = screen.getByRole("button", { name: "취소" });
      await user.click(cancelButton);

      expect((global as any).mockPush).toHaveBeenCalledWith("/questions");
    });
  });

  describe("임시 저장 기능 (선택)", () => {
    it("임시 저장 버튼이 표시되어야 한다", () => {
      render(<QuestionNewPage />);

      expect(screen.getByRole("button", { name: "임시 저장" })).toBeInTheDocument();
    });

    it("임시 저장 버튼을 클릭하면 입력값이 로컬스토리지에 저장되어야 한다", async () => {
      const user = userEvent.setup();
      const setItemSpy = vi.spyOn(Storage.prototype, "setItem");

      render(<QuestionNewPage />);

      const titleInput = screen.getByLabelText("제목");
      const contentTextarea = screen.getByLabelText("내용");

      await user.type(titleInput, "임시 저장 테스트");
      await user.type(contentTextarea, "임시 저장할 내용입니다.");

      const tempSaveButton = screen.getByRole("button", { name: "임시 저장" });
      await user.click(tempSaveButton);

      expect(setItemSpy).toHaveBeenCalledWith(
        "question-draft",
        expect.stringContaining("임시 저장 테스트")
      );

      setItemSpy.mockRestore();
    });

    it("임시 저장된 데이터가 있으면 불러오기 확인 메시지가 표시되어야 한다", () => {
      const getItemSpy = vi.spyOn(Storage.prototype, "getItem").mockReturnValue(
        JSON.stringify({
          title: "임시 저장된 제목",
          content: "임시 저장된 내용",
          category: "React",
          visibility: "전체 공개",
        })
      );

      render(<QuestionNewPage />);

      expect(screen.getByText("이전에 작성 중이던 내용이 있습니다. 불러오시겠습니까?")).toBeInTheDocument();

      getItemSpy.mockRestore();
    });

    it("임시 저장 불러오기를 확인하면 폼에 데이터가 채워져야 한다", async () => {
      const user = userEvent.setup();
      const getItemSpy = vi.spyOn(Storage.prototype, "getItem").mockReturnValue(
        JSON.stringify({
          title: "임시 저장된 제목",
          content: "임시 저장된 내용",
          category: "React",
          visibility: "전체 공개",
        })
      );

      render(<QuestionNewPage />);

      const confirmButton = screen.getByRole("button", { name: "불러오기" });
      await user.click(confirmButton);

      const titleInput = screen.getByLabelText("제목") as HTMLInputElement;
      const contentTextarea = screen.getByLabelText("내용") as HTMLTextAreaElement;

      expect(titleInput.value).toBe("임시 저장된 제목");
      expect(contentTextarea.value).toBe("임시 저장된 내용");

      getItemSpy.mockRestore();
    });
  });

  describe("로딩 상태", () => {
    it("등록 중일 때 버튼이 비활성화되고 로딩 메시지가 표시되어야 한다", async () => {
      const user = userEvent.setup();
      mockCreateQuestion.mockReturnValue(new Promise(() => {})); // 무한 대기 상태

      render(<QuestionNewPage />);

      const titleInput = screen.getByLabelText("제목");
      const contentTextarea = screen.getByLabelText("내용");
      const categorySelect = screen.getByLabelText("카테고리");
      const visibilitySelect = screen.getByLabelText("공개 범위");

      await user.type(titleInput, "새로운 질문");
      await user.type(contentTextarea, "질문 내용입니다. 자세히 알고 싶습니다.");
      await user.selectOptions(categorySelect, "React");
      await user.selectOptions(visibilitySelect, "전체 공개");

      const submitButton = screen.getByRole("button", { name: "등록하기" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(screen.getByText(/등록 중/)).toBeInTheDocument();
      });
    });
  });
});


