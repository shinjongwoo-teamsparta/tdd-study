"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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

type QuestionDetailPageProps = {
  params: { id: string };
};

export default function QuestionDetailPage({ params }: QuestionDetailPageProps) {
  const router = useRouter();
  const [question, setQuestion] = useState<Question | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const { fetchQuestion, fetchComments, getCurrentUser } = await import("./api");
        const [questionData, commentsData, userData] = await Promise.all([
          fetchQuestion(params.id),
          fetchComments(params.id),
          getCurrentUser(),
        ]);
        setQuestion(questionData);
        setComments(commentsData);
        setCurrentUser(userData);
        setError(null);
      } catch (err) {
        setError("질문을 불러오지 못했습니다. 다시 시도해주세요.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [params.id]);

  const handleLikeToggle = async () => {
    if (!question) return;

    try {
      const { toggleLike } = await import("./api");
      const result = await toggleLike(params.id);
      setQuestion({
        ...question,
        likeCount: result.likeCount,
        isLikedByCurrentUser: result.isLikedByCurrentUser,
      });
    } catch (err) {
      // 에러 처리
    }
  };

  const handleResolvedToggle = async () => {
    if (!question) return;

    try {
      const { toggleResolved } = await import("./api");
      const result = await toggleResolved(params.id);
      setQuestion({
        ...question,
        isResolved: result.isResolved,
      });
    } catch (err) {
      // 에러 처리
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("정말 삭제하시겠습니까?");
    
    if (!confirmed) {
      return;
    }

    try {
      const { deleteQuestion } = await import("./api");
      await deleteQuestion(params.id);
      router.push("/questions");
    } catch (err) {
      // 에러 처리
    }
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!question) {
    return <div>질문을 찾을 수 없습니다.</div>;
  }

  const isAuthor = currentUser && currentUser.id === question.authorId;

  return (
    <div>
      <h1>{question.title}</h1>
      <div>{question.category}</div>
      <div>{question.author}</div>
      <div>{question.createdAt}</div>
      <div>{question.isResolved ? "[해결됨]" : "[미해결]"}</div>
      <div>{question.content}</div>
      
      <button
        onClick={handleLikeToggle}
        data-liked={question.isLikedByCurrentUser}
      >
        좋아요 {question.likeCount}
      </button>

      {isAuthor && (
        <>
          <button onClick={handleResolvedToggle}>해결 여부 변경</button>
          <button onClick={() => {/* 수정 페이지로 이동 */}}>수정하기</button>
          <button onClick={handleDelete}>삭제하기</button>
        </>
      )}

      <div>
        {comments.length === 0 ? (
          <div>아직 댓글이 없습니다.</div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} data-testid={`comment-${comment.id}`}>
              <div>{comment.content}</div>
              <div>{comment.author}</div>
              <div>{comment.createdAt}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

