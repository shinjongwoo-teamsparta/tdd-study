import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import QuestionListPage from "./page";

// Mock 데이터 타입
type Question = {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  createdAt: string;
  commentCount: number;
  likeCount: number;
  isResolved: boolean;
};

// Mock API 함수
const mockFetchQuestions = vi.fn();

vi.mock("./api", () => ({
  fetchQuestions: () => mockFetchQuestions(),
}));

describe("질문글 목록 페이지", () => {
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
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("기본 목록 표시", () => {
    it("최신순으로 정렬된 질문 목록이 표시되어야 한다", async () => {
      mockFetchQuestions.mockResolvedValue(mockQuestions);
      
      render(<QuestionListPage />);

      await waitFor(() => {
        expect(screen.getByText("React useState 사용법")).toBeInTheDocument();
        expect(screen.getByText("Vitest로 비동기 테스트하기")).toBeInTheDocument();
        expect(screen.getByText("JavaScript 클로저란?")).toBeInTheDocument();
      });
    });

    it("각 질문 카드에 제목, 카테고리, 작성자, 작성일, 댓글 수, 좋아요 수, 해결 여부가 표시되어야 한다", async () => {
      mockFetchQuestions.mockResolvedValue([mockQuestions[0]]);
      
      render(<QuestionListPage />);

      await waitFor(() => {
        const questionCard = screen.getByTestId("question-card-1");
        expect(within(questionCard).getByText("React useState 사용법")).toBeInTheDocument();
        expect(within(questionCard).getByText("React")).toBeInTheDocument();
        expect(within(questionCard).getByText("김철수")).toBeInTheDocument();
        expect(within(questionCard).getByText("2024-01-15")).toBeInTheDocument();
        expect(within(questionCard).getByText(/댓글 5/)).toBeInTheDocument();
        expect(within(questionCard).getByText(/좋아요 10/)).toBeInTheDocument();
        expect(within(questionCard).getByText("[미해결]")).toBeInTheDocument();
      });
    });

    it("해결된 질문은 [해결됨] 뱃지가 표시되어야 한다", async () => {
      mockFetchQuestions.mockResolvedValue([mockQuestions[1]]);
      
      render(<QuestionListPage />);

      await waitFor(() => {
        const questionCard = screen.getByTestId("question-card-2");
        expect(within(questionCard).getByText("[해결됨]")).toBeInTheDocument();
      });
    });
  });

  describe("검색 기능", () => {
    it("검색어를 입력하고 검색하면 제목에 검색어가 포함된 질문만 표시되어야 한다", async () => {
      const user = userEvent.setup();
      mockFetchQuestions.mockResolvedValue(mockQuestions);
      
      render(<QuestionListPage />);

      const searchInput = screen.getByLabelText("제목/내용 검색");
      await user.type(searchInput, "React");
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(screen.getByText("React useState 사용법")).toBeInTheDocument();
        expect(screen.queryByText("JavaScript 클로저란?")).not.toBeInTheDocument();
      });
    });

    it("검색어를 입력하고 검색 버튼을 클릭하면 내용에 검색어가 포함된 질문이 표시되어야 한다", async () => {
      const user = userEvent.setup();
      mockFetchQuestions.mockResolvedValue(mockQuestions);
      
      render(<QuestionListPage />);

      const searchInput = screen.getByLabelText("제목/내용 검색");
      const searchButton = screen.getByRole("button", { name: "검색" });
      
      await user.type(searchInput, "비동기");
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText("Vitest로 비동기 테스트하기")).toBeInTheDocument();
        expect(screen.queryByText("React useState 사용법")).not.toBeInTheDocument();
      });
    });
  });

  describe("필터 기능", () => {
    it("카테고리 필터를 선택하면 해당 카테고리의 질문만 표시되어야 한다", async () => {
      const user = userEvent.setup();
      mockFetchQuestions.mockResolvedValue(mockQuestions);
      
      render(<QuestionListPage />);

      const categoryFilter = screen.getByLabelText("카테고리");
      await user.selectOptions(categoryFilter, "React");

      await waitFor(() => {
        expect(screen.getByText("React useState 사용법")).toBeInTheDocument();
        expect(screen.queryByText("JavaScript 클로저란?")).not.toBeInTheDocument();
      });
    });

    it("해결 여부 필터를 '미해결만'으로 선택하면 미해결 질문만 표시되어야 한다", async () => {
      const user = userEvent.setup();
      mockFetchQuestions.mockResolvedValue(mockQuestions);
      
      render(<QuestionListPage />);

      const resolvedFilter = screen.getByLabelText("해결 여부");
      await user.selectOptions(resolvedFilter, "unresolved");

      await waitFor(() => {
        expect(screen.getByText("React useState 사용법")).toBeInTheDocument();
        expect(screen.getByText("JavaScript 클로저란?")).toBeInTheDocument();
        expect(screen.queryByText("Vitest로 비동기 테스트하기")).not.toBeInTheDocument();
      });
    });

    it("해결 여부 필터를 '해결됨만'으로 선택하면 해결된 질문만 표시되어야 한다", async () => {
      const user = userEvent.setup();
      mockFetchQuestions.mockResolvedValue(mockQuestions);
      
      render(<QuestionListPage />);

      const resolvedFilter = screen.getByLabelText("해결 여부");
      await user.selectOptions(resolvedFilter, "resolved");

      await waitFor(() => {
        expect(screen.getByText("Vitest로 비동기 테스트하기")).toBeInTheDocument();
        expect(screen.queryByText("React useState 사용법")).not.toBeInTheDocument();
      });
    });

    it("카테고리와 해결 여부 필터를 동시에 적용하면 두 조건을 모두 만족하는 질문만 표시되어야 한다", async () => {
      const user = userEvent.setup();
      mockFetchQuestions.mockResolvedValue(mockQuestions);
      
      render(<QuestionListPage />);

      const categoryFilter = screen.getByLabelText("카테고리");
      const resolvedFilter = screen.getByLabelText("해결 여부");
      
      await user.selectOptions(categoryFilter, "테스트");
      await user.selectOptions(resolvedFilter, "resolved");

      await waitFor(() => {
        expect(screen.getByText("Vitest로 비동기 테스트하기")).toBeInTheDocument();
        expect(screen.queryByText("React useState 사용법")).not.toBeInTheDocument();
        expect(screen.queryByText("JavaScript 클로저란?")).not.toBeInTheDocument();
      });
    });
  });

  describe("정렬 기능", () => {
    it("정렬 옵션을 '좋아요순'으로 변경하면 좋아요 수가 많은 순서로 정렬되어야 한다", async () => {
      const user = userEvent.setup();
      mockFetchQuestions.mockResolvedValue(mockQuestions);
      
      render(<QuestionListPage />);

      const sortSelect = screen.getByLabelText("정렬");
      await user.selectOptions(sortSelect, "likes");

      await waitFor(() => {
        const questionCards = screen.getAllByTestId(/question-card-/);
        expect(within(questionCards[0]).getByText("JavaScript 클로저란?")).toBeInTheDocument(); // 15 likes
        expect(within(questionCards[1]).getByText("React useState 사용법")).toBeInTheDocument(); // 10 likes
        expect(within(questionCards[2]).getByText("Vitest로 비동기 테스트하기")).toBeInTheDocument(); // 7 likes
      });
    });

    it("정렬 옵션을 '댓글 많은 순'으로 변경하면 댓글 수가 많은 순서로 정렬되어야 한다", async () => {
      const user = userEvent.setup();
      mockFetchQuestions.mockResolvedValue(mockQuestions);
      
      render(<QuestionListPage />);

      const sortSelect = screen.getByLabelText("정렬");
      await user.selectOptions(sortSelect, "comments");

      await waitFor(() => {
        const questionCards = screen.getAllByTestId(/question-card-/);
        expect(within(questionCards[0]).getByText("JavaScript 클로저란?")).toBeInTheDocument(); // 8 comments
        expect(within(questionCards[1]).getByText("React useState 사용법")).toBeInTheDocument(); // 5 comments
        expect(within(questionCards[2]).getByText("Vitest로 비동기 테스트하기")).toBeInTheDocument(); // 3 comments
      });
    });

    it("정렬 옵션을 '최신순'으로 변경하면 작성일 최신 순서로 정렬되어야 한다", async () => {
      const user = userEvent.setup();
      mockFetchQuestions.mockResolvedValue(mockQuestions);
      
      render(<QuestionListPage />);

      const sortSelect = screen.getByLabelText("정렬");
      await user.selectOptions(sortSelect, "latest");

      await waitFor(() => {
        const questionCards = screen.getAllByTestId(/question-card-/);
        expect(within(questionCards[0]).getByText("React useState 사용법")).toBeInTheDocument();
        expect(within(questionCards[1]).getByText("Vitest로 비동기 테스트하기")).toBeInTheDocument();
        expect(within(questionCards[2]).getByText("JavaScript 클로저란?")).toBeInTheDocument();
      });
    });
  });

  describe("빈 상태", () => {
    it("검색/필터 결과에 해당하는 질문이 없으면 안내 메시지가 표시되어야 한다", async () => {
      mockFetchQuestions.mockResolvedValue([]);
      
      render(<QuestionListPage />);

      await waitFor(() => {
        expect(screen.getByText("조건에 맞는 질문이 없습니다.")).toBeInTheDocument();
      });
    });
  });

  describe("로딩/에러 상태", () => {
    it("질문 목록 데이터를 불러오는 중일 때 로딩 메시지가 표시되어야 한다", () => {
      mockFetchQuestions.mockReturnValue(new Promise(() => {})); // 무한 대기 상태
      
      render(<QuestionListPage />);

      expect(screen.getByText(/로딩/)).toBeInTheDocument();
    });

    it("서버 에러가 발생하면 에러 메시지가 표시되어야 한다", async () => {
      mockFetchQuestions.mockRejectedValue(new Error("서버 에러"));
      
      render(<QuestionListPage />);

      await waitFor(() => {
        expect(screen.getByText("목록을 불러오지 못했습니다. 다시 시도해주세요.")).toBeInTheDocument();
      });
    });
  });

  describe("질문 작성 버튼", () => {
    it("'질문 작성하기' 버튼이 표시되어야 한다", async () => {
      mockFetchQuestions.mockResolvedValue(mockQuestions);
      
      render(<QuestionListPage />);

      expect(screen.getByRole("button", { name: "질문 작성하기" })).toBeInTheDocument();
    });
  });
});

