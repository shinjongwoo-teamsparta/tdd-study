"use client";

import { useState, useEffect } from "react";

type Comment = {
  id: string;
  content: string;
  author: string;
  authorId: string;
  createdAt: string;
};

type CommentSectionProps = {
  questionId: string;
};

export function CommentSection({ questionId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentContent, setNewCommentContent] = useState("");
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const { fetchComments, getCurrentUser } = await import("./api");
        const [commentsData, userData] = await Promise.all([
          fetchComments(questionId),
          getCurrentUser(),
        ]);
        setComments(commentsData);
        setCurrentUser(userData);
        setError(null);
      } catch (err) {
        setError("댓글을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [questionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedContent = newCommentContent.trim();
    
    if (!trimmedContent) {
      setValidationError("댓글 내용을 입력하세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setValidationError(null);
      
      const { createComment } = await import("./api");
      const newComment = await createComment(questionId, trimmedContent);
      
      setComments([...comments, newComment]);
      setNewCommentContent("");
    } catch (err) {
      setSubmitError("댓글 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    const confirmed = window.confirm("댓글을 삭제하시겠습니까?");
    
    if (!confirmed) {
      return;
    }

    try {
      const { deleteComment } = await import("./api");
      await deleteComment(commentId);
      setComments(comments.filter((c) => c.id !== commentId));
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

  const isCommentValid = newCommentContent.trim().length > 0;

  return (
    <div>
      <h3>댓글 {comments.length}개</h3>
      
      {comments.length === 0 ? (
        <div>아직 댓글이 없습니다.</div>
      ) : (
        <div>
          {comments.map((comment) => (
            <div key={comment.id} data-testid={`comment-${comment.id}`}>
              <div>{comment.content}</div>
              <div>{comment.author}</div>
              <div>{comment.createdAt}</div>
              {currentUser && currentUser.id === comment.authorId && (
                <button onClick={() => handleDelete(comment.id)}>삭제</button>
              )}
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="comment-input">댓글 입력</label>
          <textarea
            id="comment-input"
            value={newCommentContent}
            onChange={(e) => {
              setNewCommentContent(e.target.value);
              setValidationError(null);
            }}
          />
        </div>
        
        {validationError && <div>{validationError}</div>}
        {submitError && <div>{submitError}</div>}
        
        <button
          type="submit"
          disabled={!isCommentValid || isSubmitting}
        >
          댓글 등록
        </button>
      </form>
    </div>
  );
}

export default CommentSection;
