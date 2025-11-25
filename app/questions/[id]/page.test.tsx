import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import QuestionDetailPage from "./page";

// Mock 데이터 타입
type Question = {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  authorId: string;
  createdAt: string;
  likeCount: number;
  isResolved: boolean;
  isLikedByCurrentUser: boolean;
};

type Comment = {
  id: string;
  content: string;
  author: string;
  authorId: string;
  createdAt: string;
};

// Mock API 함수
const mockFetchQuestion = vi.fn();
const mockFetchComments = vi.fn();
const mockToggleLike = vi.fn();
const mockToggleResolved = vi.fn();
const mockDeleteQuestion = vi.fn();
const mockGetCurrentUser = vi.fn();

vi.mock("./api", () => ({
  fetchQuestion: (id: string) => mockFetchQuestion(id),
  fetchComments: (questionId: string) => mockFetchComments(questionId),
  toggleLike: (questionId: string) => mockToggleLike(questionId),
  toggleResolved: (questionId: string) => mockToggleResolved(questionId),
  deleteQuestion: (questionId: string) => mockDeleteQuestion(questionId),
  getCurrentUser: () => mockGetCurrentUser(),
}));

describe("질문글 상세 페이지", () => {
  const mockQuestion: Question = {
    id: "1",
    title: "React useState 사용법",
    content: "useState를 어떻게 사용하나요? 자세히 알려주세요.",
    category: "React",
    author: "김철수",
    authorId: "user1",
    createdAt: "2024-01-15",
    likeCount: 10,
    isResolved: false,
    isLikedByCurrentUser: false,
  };

  const mockComments: Comment[] = [
    {
      id: "c1",
      content: "useState는 함수형 컴포넌트에서 상태를 관리할 수 있게 해주는 Hook입니다.",
      author: "이영희",
      authorId: "user2",
      createdAt: "2024-01-15",
    },
    {
      id: "c2",
      content: "공식 문서를 참고하시면 더 자세히 알 수 있습니다.",
      author: "박민수",
      authorId: "user3",
      createdAt: "2024-01-16",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue({ id: "user1", name: "김철수" });
  });

  describe("상세 정보 표시", () => {
    it("질문의 제목, 카테고리, 작성자, 작성일, 내용, 해결 여부가 표시되어야 한다", async () => {
      mockFetchQuestion.mockResolvedValue(mockQuestion);
      mockFetchComments.mockResolvedValue(mockComments);

      render(<QuestionDetailPage params={{ id: "1" }} />);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "React useState 사용법" })).toBeInTheDocument();
        expect(screen.getByText("React")).toBeInTheDocument();
        expect(screen.getByText("김철수")).toBeInTheDocument();
        expect(screen.getByText("2024-01-15")).toBeInTheDocument();
        expect(screen.getByText("useState를 어떻게 사용하나요? 자세히 알려주세요.")).toBeInTheDocument();
        expect(screen.getByText("[미해결]")).toBeInTheDocument();
      });
    });

    it("해결된 질문은 [해결됨] 뱃지가 표시되어야 한다", async () => {
      const resolvedQuestion = { ...mockQuestion, isResolved: true };
      mockFetchQuestion.mockResolvedValue(resolvedQuestion);
      mockFetchComments.mockResolvedValue([]);

      render(<QuestionDetailPage params={{ id: "1" }} />);

      await waitFor(() => {
        expect(screen.getByText("[해결됨]")).toBeInTheDocument();
      });
    });

    it("좋아요 수가 표시되어야 한다", async () => {
      mockFetchQuestion.mockResolvedValue(mockQuestion);
      mockFetchComments.mockResolvedValue([]);

      render(<QuestionDetailPage params={{ id: "1" }} />);

      await waitFor(() => {
        expect(screen.getByText(/좋아요 10/)).toBeInTheDocument();
      });
    });
  });

  describe("좋아요 토글", () => {
    it("좋아요를 누르지 않은 상태에서 좋아요 버튼을 클릭하면 좋아요 수가 1 증가하고 버튼이 활성화되어야 한다", async () => {
      const user = userEvent.setup();
      mockFetchQuestion.mockResolvedValue(mockQuestion);
      mockFetchComments.mockResolvedValue([]);
      mockToggleLike.mockResolvedValue({ likeCount: 11, isLikedByCurrentUser: true });

      render(<QuestionDetailPage params={{ id: "1" }} />);

      await waitFor(() => {
        expect(screen.getByText(/좋아요 10/)).toBeInTheDocument();
      });

      const likeButton = screen.getByRole("button", { name: /좋아요/ });
      await user.click(likeButton);

      await waitFor(() => {
        expect(screen.getByText(/좋아요 11/)).toBeInTheDocument();
        expect(likeButton).toHaveAttribute("data-liked", "true");
      });
    });

    it("이미 좋아요를 누른 상태에서 버튼을 클릭하면 좋아요 수가 1 감소하고 버튼이 비활성화되어야 한다", async () => {
      const user = userEvent.setup();
      const likedQuestion = { ...mockQuestion, likeCount: 11, isLikedByCurrentUser: true };
      mockFetchQuestion.mockResolvedValue(likedQuestion);
      mockFetchComments.mockResolvedValue([]);
      mockToggleLike.mockResolvedValue({ likeCount: 10, isLikedByCurrentUser: false });

      render(<QuestionDetailPage params={{ id: "1" }} />);

      await waitFor(() => {
        expect(screen.getByText(/좋아요 11/)).toBeInTheDocument();
      });

      const likeButton = screen.getByRole("button", { name: /좋아요/ });
      expect(likeButton).toHaveAttribute("data-liked", "true");
      
      await user.click(likeButton);

      await waitFor(() => {
        expect(screen.getByText(/좋아요 10/)).toBeInTheDocument();
        expect(likeButton).toHaveAttribute("data-liked", "false");
      });
    });
  });

  describe("해결 여부 토글 (작성자만)", () => {
    it("작성자인 경우 해결 여부 토글 버튼이 표시되어야 한다", async () => {
      mockFetchQuestion.mockResolvedValue(mockQuestion);
      mockFetchComments.mockResolvedValue([]);
      mockGetCurrentUser.mockResolvedValue({ id: "user1", name: "김철수" });

      render(<QuestionDetailPage params={{ id: "1" }} />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /해결 여부 변경/ })).toBeInTheDocument();
      });
    });

    it("작성자가 아닌 경우 해결 여부 토글 버튼이 표시되지 않아야 한다", async () => {
      mockFetchQuestion.mockResolvedValue(mockQuestion);
      mockFetchComments.mockResolvedValue([]);
      mockGetCurrentUser.mockResolvedValue({ id: "user2", name: "이영희" });

      render(<QuestionDetailPage params={{ id: "1" }} />);

      await waitFor(() => {
        expect(screen.getByText("React useState 사용법")).toBeInTheDocument();
      });

      expect(screen.queryByRole("button", { name: /해결 여부 변경/ })).not.toBeInTheDocument();
    });

    it("작성자가 해결 여부 토글 버튼을 클릭하면 미해결 ↔ 해결됨으로 변경되어야 한다", async () => {
      const user = userEvent.setup();
      mockFetchQuestion.mockResolvedValue(mockQuestion);
      mockFetchComments.mockResolvedValue([]);
      mockGetCurrentUser.mockResolvedValue({ id: "user1", name: "김철수" });
      mockToggleResolved.mockResolvedValue({ isResolved: true });

      render(<QuestionDetailPage params={{ id: "1" }} />);

      await waitFor(() => {
        expect(screen.getByText("[미해결]")).toBeInTheDocument();
      });

      const toggleButton = screen.getByRole("button", { name: /해결 여부 변경/ });
      await user.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByText("[해결됨]")).toBeInTheDocument();
      });
    });
  });

  describe("수정/삭제 버튼 노출 조건", () => {
    it("작성자인 경우 수정하기, 삭제하기 버튼이 표시되어야 한다", async () => {
      mockFetchQuestion.mockResolvedValue(mockQuestion);
      mockFetchComments.mockResolvedValue([]);
      mockGetCurrentUser.mockResolvedValue({ id: "user1", name: "김철수" });

      render(<QuestionDetailPage params={{ id: "1" }} />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "수정하기" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "삭제하기" })).toBeInTheDocument();
      });
    });

    it("작성자가 아닌 경우 수정하기, 삭제하기 버튼이 표시되지 않아야 한다", async () => {
      mockFetchQuestion.mockResolvedValue(mockQuestion);
      mockFetchComments.mockResolvedValue([]);
      mockGetCurrentUser.mockResolvedValue({ id: "user2", name: "이영희" });

      render(<QuestionDetailPage params={{ id: "1" }} />);

      await waitFor(() => {
        expect(screen.getByText("React useState 사용법")).toBeInTheDocument();
      });

      expect(screen.queryByRole("button", { name: "수정하기" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "삭제하기" })).not.toBeInTheDocument();
    });
  });

  describe("질문 삭제", () => {
    it("작성자가 삭제하기 버튼을 클릭하면 확인 모달이 표시되어야 한다", async () => {
      const user = userEvent.setup();
      mockFetchQuestion.mockResolvedValue(mockQuestion);
      mockFetchComments.mockResolvedValue([]);
      mockGetCurrentUser.mockResolvedValue({ id: "user1", name: "김철수" });
      
      // window.confirm mock
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);

      render(<QuestionDetailPage params={{ id: "1" }} />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "삭제하기" })).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole("button", { name: "삭제하기" });
      await user.click(deleteButton);

      expect(confirmSpy).toHaveBeenCalledWith("정말 삭제하시겠습니까?");
      
      confirmSpy.mockRestore();
    });

    it("삭제 확인 시 질문이 삭제되고 목록 페이지로 이동해야 한다", async () => {
      const user = userEvent.setup();
      mockFetchQuestion.mockResolvedValue(mockQuestion);
      mockFetchComments.mockResolvedValue([]);
      mockGetCurrentUser.mockResolvedValue({ id: "user1", name: "김철수" });
      mockDeleteQuestion.mockResolvedValue({ success: true });
      
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
      const mockPush = vi.fn();
      
      // useRouter mock
      vi.mock("next/navigation", () => ({
        useRouter: () => ({ push: mockPush }),
      }));

      render(<QuestionDetailPage params={{ id: "1" }} />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "삭제하기" })).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole("button", { name: "삭제하기" });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(mockDeleteQuestion).toHaveBeenCalledWith("1");
        expect(mockPush).toHaveBeenCalledWith("/questions");
      });
      
      confirmSpy.mockRestore();
    });

    it("삭제 취소 시 질문이 삭제되지 않아야 한다", async () => {
      const user = userEvent.setup();
      mockFetchQuestion.mockResolvedValue(mockQuestion);
      mockFetchComments.mockResolvedValue([]);
      mockGetCurrentUser.mockResolvedValue({ id: "user1", name: "김철수" });
      
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);

      render(<QuestionDetailPage params={{ id: "1" }} />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "삭제하기" })).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole("button", { name: "삭제하기" });
      await user.click(deleteButton);

      expect(mockDeleteQuestion).not.toHaveBeenCalled();
      
      confirmSpy.mockRestore();
    });
  });

  describe("댓글 표시", () => {
    it("댓글 목록이 표시되어야 한다", async () => {
      mockFetchQuestion.mockResolvedValue(mockQuestion);
      mockFetchComments.mockResolvedValue(mockComments);

      render(<QuestionDetailPage params={{ id: "1" }} />);

      await waitFor(() => {
        expect(screen.getByText("useState는 함수형 컴포넌트에서 상태를 관리할 수 있게 해주는 Hook입니다.")).toBeInTheDocument();
        expect(screen.getByText("공식 문서를 참고하시면 더 자세히 알 수 있습니다.")).toBeInTheDocument();
      });
    });

    it("각 댓글에 내용, 작성자, 작성일이 표시되어야 한다", async () => {
      mockFetchQuestion.mockResolvedValue(mockQuestion);
      mockFetchComments.mockResolvedValue([mockComments[0]]);

      render(<QuestionDetailPage params={{ id: "1" }} />);

      await waitFor(() => {
        const comment = screen.getByTestId("comment-c1");
        expect(within(comment).getByText("useState는 함수형 컴포넌트에서 상태를 관리할 수 있게 해주는 Hook입니다.")).toBeInTheDocument();
        expect(within(comment).getByText("이영희")).toBeInTheDocument();
        expect(within(comment).getByText("2024-01-15")).toBeInTheDocument();
      });
    });

    it("댓글이 없으면 빈 상태 메시지가 표시되어야 한다", async () => {
      mockFetchQuestion.mockResolvedValue(mockQuestion);
      mockFetchComments.mockResolvedValue([]);

      render(<QuestionDetailPage params={{ id: "1" }} />);

      await waitFor(() => {
        expect(screen.getByText("아직 댓글이 없습니다.")).toBeInTheDocument();
      });
    });
  });

  describe("로딩/에러 상태", () => {
    it("질문 데이터를 불러오는 중일 때 로딩 메시지가 표시되어야 한다", () => {
      mockFetchQuestion.mockReturnValue(new Promise(() => {})); // 무한 대기 상태
      mockFetchComments.mockResolvedValue([]);

      render(<QuestionDetailPage params={{ id: "1" }} />);

      expect(screen.getByText(/로딩/)).toBeInTheDocument();
    });

    it("서버 에러가 발생하면 에러 메시지가 표시되어야 한다", async () => {
      mockFetchQuestion.mockRejectedValue(new Error("서버 에러"));
      mockFetchComments.mockResolvedValue([]);

      render(<QuestionDetailPage params={{ id: "1" }} />);

      await waitFor(() => {
        expect(screen.getByText("질문을 불러오지 못했습니다. 다시 시도해주세요.")).toBeInTheDocument();
      });
    });
  });
});


