import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommentSection } from "./CommentSection";

// Mock 데이터 타입
type Comment = {
  id: string;
  content: string;
  author: string;
  authorId: string;
  createdAt: string;
};

// Mock API 함수
const mockFetchComments = vi.fn();
const mockCreateComment = vi.fn();
const mockDeleteComment = vi.fn();
const mockGetCurrentUser = vi.fn();

vi.mock("./api", () => ({
  fetchComments: (questionId: string) => mockFetchComments(questionId),
  createComment: (questionId: string, content: string) => mockCreateComment(questionId, content),
  deleteComment: (commentId: string) => mockDeleteComment(commentId),
  getCurrentUser: () => mockGetCurrentUser(),
}));

describe("댓글 섹션 컴포넌트", () => {
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

  describe("댓글 목록 표시", () => {
    it("댓글 목록이 표시되어야 한다", async () => {
      mockFetchComments.mockResolvedValue(mockComments);

      render(<CommentSection questionId="1" />);

      await waitFor(() => {
        expect(screen.getByText("useState는 함수형 컴포넌트에서 상태를 관리할 수 있게 해주는 Hook입니다.")).toBeInTheDocument();
        expect(screen.getByText("공식 문서를 참고하시면 더 자세히 알 수 있습니다.")).toBeInTheDocument();
      });
    });

    it("각 댓글에 내용, 작성자, 작성일이 표시되어야 한다", async () => {
      mockFetchComments.mockResolvedValue([mockComments[0]]);

      render(<CommentSection questionId="1" />);

      await waitFor(() => {
        const comment = screen.getByTestId("comment-c1");
        expect(within(comment).getByText("useState는 함수형 컴포넌트에서 상태를 관리할 수 있게 해주는 Hook입니다.")).toBeInTheDocument();
        expect(within(comment).getByText("이영희")).toBeInTheDocument();
        expect(within(comment).getByText("2024-01-15")).toBeInTheDocument();
      });
    });

    it("댓글이 없으면 빈 상태 메시지가 표시되어야 한다", async () => {
      mockFetchComments.mockResolvedValue([]);

      render(<CommentSection questionId="1" />);

      await waitFor(() => {
        expect(screen.getByText("아직 댓글이 없습니다.")).toBeInTheDocument();
      });
    });

    it("댓글 수가 표시되어야 한다", async () => {
      mockFetchComments.mockResolvedValue(mockComments);

      render(<CommentSection questionId="1" />);

      await waitFor(() => {
        expect(screen.getByText("댓글 2개")).toBeInTheDocument();
      });
    });
  });

  describe("댓글 작성", () => {
    it("댓글 입력란과 등록 버튼이 표시되어야 한다", async () => {
      mockFetchComments.mockResolvedValue([]);

      render(<CommentSection questionId="1" />);

      await waitFor(() => {
        expect(screen.getByLabelText("댓글 입력")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "댓글 등록" })).toBeInTheDocument();
      });
    });

    it("댓글을 입력하고 등록 버튼을 클릭하면 새로운 댓글이 추가되어야 한다", async () => {
      const user = userEvent.setup();
      mockFetchComments.mockResolvedValue([]);
      const newComment: Comment = {
        id: "c3",
        content: "새로운 댓글입니다.",
        author: "김철수",
        authorId: "user1",
        createdAt: "2024-01-17",
      };
      mockCreateComment.mockResolvedValue(newComment);

      render(<CommentSection questionId="1" />);

      await waitFor(() => {
        expect(screen.getByLabelText("댓글 입력")).toBeInTheDocument();
      });

      const commentInput = screen.getByLabelText("댓글 입력");
      const submitButton = screen.getByRole("button", { name: "댓글 등록" });

      await user.type(commentInput, "새로운 댓글입니다.");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreateComment).toHaveBeenCalledWith("1", "새로운 댓글입니다.");
        expect(screen.getByText("새로운 댓글입니다.")).toBeInTheDocument();
      });
    });

    it("댓글 등록 후 입력란이 비워져야 한다", async () => {
      const user = userEvent.setup();
      mockFetchComments.mockResolvedValue([]);
      mockCreateComment.mockResolvedValue({
        id: "c3",
        content: "새로운 댓글입니다.",
        author: "김철수",
        authorId: "user1",
        createdAt: "2024-01-17",
      });

      render(<CommentSection questionId="1" />);

      await waitFor(() => {
        expect(screen.getByLabelText("댓글 입력")).toBeInTheDocument();
      });

      const commentInput = screen.getByLabelText("댓글 입력") as HTMLTextAreaElement;
      const submitButton = screen.getByRole("button", { name: "댓글 등록" });

      await user.type(commentInput, "새로운 댓글입니다.");
      await user.click(submitButton);

      await waitFor(() => {
        expect(commentInput.value).toBe("");
      });
    });
  });

  describe("댓글 입력 검증", () => {
    it("댓글 입력란이 비어 있으면 등록 버튼이 비활성화되어야 한다", async () => {
      mockFetchComments.mockResolvedValue([]);

      render(<CommentSection questionId="1" />);

      await waitFor(() => {
        const submitButton = screen.getByRole("button", { name: "댓글 등록" });
        expect(submitButton).toBeDisabled();
      });
    });

    it("댓글 입력란에 공백만 있으면 등록 버튼이 비활성화되어야 한다", async () => {
      const user = userEvent.setup();
      mockFetchComments.mockResolvedValue([]);

      render(<CommentSection questionId="1" />);

      await waitFor(() => {
        expect(screen.getByLabelText("댓글 입력")).toBeInTheDocument();
      });

      const commentInput = screen.getByLabelText("댓글 입력");
      await user.type(commentInput, "   ");

      const submitButton = screen.getByRole("button", { name: "댓글 등록" });
      expect(submitButton).toBeDisabled();
    });

    it("댓글 입력란에 1자 이상 텍스트가 있으면 등록 버튼이 활성화되어야 한다", async () => {
      const user = userEvent.setup();
      mockFetchComments.mockResolvedValue([]);

      render(<CommentSection questionId="1" />);

      await waitFor(() => {
        expect(screen.getByLabelText("댓글 입력")).toBeInTheDocument();
      });

      const commentInput = screen.getByLabelText("댓글 입력");
      await user.type(commentInput, "댓글");

      const submitButton = screen.getByRole("button", { name: "댓글 등록" });
      expect(submitButton).toBeEnabled();
    });

    it("댓글 입력란이 비어 있는 상태에서 등록 버튼을 클릭하면 에러 메시지가 표시되어야 한다", async () => {
      const user = userEvent.setup();
      mockFetchComments.mockResolvedValue([]);

      render(<CommentSection questionId="1" />);

      await waitFor(() => {
        expect(screen.getByLabelText("댓글 입력")).toBeInTheDocument();
      });

      const submitButton = screen.getByRole("button", { name: "댓글 등록" });
      // 버튼이 비활성화되어 있더라도 강제로 클릭 시도
      submitButton.removeAttribute("disabled");
      await user.click(submitButton);

      expect(screen.getByText("댓글 내용을 입력하세요.")).toBeInTheDocument();
      expect(mockCreateComment).not.toHaveBeenCalled();
    });
  });

  describe("댓글 삭제 (작성자만)", () => {
    it("자신이 작성한 댓글에는 삭제 버튼이 표시되어야 한다", async () => {
      mockFetchComments.mockResolvedValue([
        {
          id: "c1",
          content: "내가 작성한 댓글",
          author: "김철수",
          authorId: "user1",
          createdAt: "2024-01-15",
        },
      ]);
      mockGetCurrentUser.mockResolvedValue({ id: "user1", name: "김철수" });

      render(<CommentSection questionId="1" />);

      await waitFor(() => {
        const comment = screen.getByTestId("comment-c1");
        expect(within(comment).getByRole("button", { name: "삭제" })).toBeInTheDocument();
      });
    });

    it("다른 사람이 작성한 댓글에는 삭제 버튼이 표시되지 않아야 한다", async () => {
      mockFetchComments.mockResolvedValue([
        {
          id: "c1",
          content: "다른 사람이 작성한 댓글",
          author: "이영희",
          authorId: "user2",
          createdAt: "2024-01-15",
        },
      ]);
      mockGetCurrentUser.mockResolvedValue({ id: "user1", name: "김철수" });

      render(<CommentSection questionId="1" />);

      await waitFor(() => {
        const comment = screen.getByTestId("comment-c1");
        expect(within(comment).queryByRole("button", { name: "삭제" })).not.toBeInTheDocument();
      });
    });

    it("삭제 버튼을 클릭하면 확인 메시지가 표시되어야 한다", async () => {
      const user = userEvent.setup();
      mockFetchComments.mockResolvedValue([
        {
          id: "c1",
          content: "내가 작성한 댓글",
          author: "김철수",
          authorId: "user1",
          createdAt: "2024-01-15",
        },
      ]);
      mockGetCurrentUser.mockResolvedValue({ id: "user1", name: "김철수" });

      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);

      render(<CommentSection questionId="1" />);

      await waitFor(() => {
        expect(screen.getByTestId("comment-c1")).toBeInTheDocument();
      });

      const deleteButton = within(screen.getByTestId("comment-c1")).getByRole("button", { name: "삭제" });
      await user.click(deleteButton);

      expect(confirmSpy).toHaveBeenCalledWith("댓글을 삭제하시겠습니까?");

      confirmSpy.mockRestore();
    });

    it("삭제 확인 시 댓글이 목록에서 제거되어야 한다", async () => {
      const user = userEvent.setup();
      mockFetchComments.mockResolvedValue([
        {
          id: "c1",
          content: "내가 작성한 댓글",
          author: "김철수",
          authorId: "user1",
          createdAt: "2024-01-15",
        },
      ]);
      mockGetCurrentUser.mockResolvedValue({ id: "user1", name: "김철수" });
      mockDeleteComment.mockResolvedValue({ success: true });

      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

      render(<CommentSection questionId="1" />);

      await waitFor(() => {
        expect(screen.getByTestId("comment-c1")).toBeInTheDocument();
      });

      const deleteButton = within(screen.getByTestId("comment-c1")).getByRole("button", { name: "삭제" });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(mockDeleteComment).toHaveBeenCalledWith("c1");
        expect(screen.queryByTestId("comment-c1")).not.toBeInTheDocument();
      });

      confirmSpy.mockRestore();
    });

    it("삭제 취소 시 댓글이 유지되어야 한다", async () => {
      const user = userEvent.setup();
      mockFetchComments.mockResolvedValue([
        {
          id: "c1",
          content: "내가 작성한 댓글",
          author: "김철수",
          authorId: "user1",
          createdAt: "2024-01-15",
        },
      ]);
      mockGetCurrentUser.mockResolvedValue({ id: "user1", name: "김철수" });

      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);

      render(<CommentSection questionId="1" />);

      await waitFor(() => {
        expect(screen.getByTestId("comment-c1")).toBeInTheDocument();
      });

      const deleteButton = within(screen.getByTestId("comment-c1")).getByRole("button", { name: "삭제" });
      await user.click(deleteButton);

      expect(mockDeleteComment).not.toHaveBeenCalled();
      expect(screen.getByTestId("comment-c1")).toBeInTheDocument();

      confirmSpy.mockRestore();
    });
  });

  describe("로딩/에러 상태", () => {
    it("댓글을 불러오는 중일 때 로딩 메시지가 표시되어야 한다", () => {
      mockFetchComments.mockReturnValue(new Promise(() => {})); // 무한 대기 상태

      render(<CommentSection questionId="1" />);

      expect(screen.getByText(/로딩/)).toBeInTheDocument();
    });

    it("댓글 불러오기 실패 시 에러 메시지가 표시되어야 한다", async () => {
      mockFetchComments.mockRejectedValue(new Error("서버 에러"));

      render(<CommentSection questionId="1" />);

      await waitFor(() => {
        expect(screen.getByText("댓글을 불러오지 못했습니다.")).toBeInTheDocument();
      });
    });

    it("댓글 등록 중일 때 버튼이 비활성화되어야 한다", async () => {
      const user = userEvent.setup();
      mockFetchComments.mockResolvedValue([]);
      mockCreateComment.mockReturnValue(new Promise(() => {})); // 무한 대기 상태

      render(<CommentSection questionId="1" />);

      await waitFor(() => {
        expect(screen.getByLabelText("댓글 입력")).toBeInTheDocument();
      });

      const commentInput = screen.getByLabelText("댓글 입력");
      const submitButton = screen.getByRole("button", { name: "댓글 등록" });

      await user.type(commentInput, "새로운 댓글");
      await user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });

    it("댓글 등록 실패 시 에러 메시지가 표시되어야 한다", async () => {
      const user = userEvent.setup();
      mockFetchComments.mockResolvedValue([]);
      mockCreateComment.mockRejectedValue(new Error("서버 에러"));

      render(<CommentSection questionId="1" />);

      await waitFor(() => {
        expect(screen.getByLabelText("댓글 입력")).toBeInTheDocument();
      });

      const commentInput = screen.getByLabelText("댓글 입력");
      const submitButton = screen.getByRole("button", { name: "댓글 등록" });

      await user.type(commentInput, "새로운 댓글");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("댓글 등록에 실패했습니다.")).toBeInTheDocument();
      });
    });
  });
});


