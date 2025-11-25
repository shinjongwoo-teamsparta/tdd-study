"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageCircle, Send, Trash2, AlertCircle } from "lucide-react";

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
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const isCommentValid = newCommentContent.trim().length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          댓글 {comments.length}개
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            아직 댓글이 없습니다.
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div 
                key={comment.id} 
                data-testid={`comment-${comment.id}`}
                className="p-4 rounded-lg border bg-card"
              >
                <p className="mb-3">{comment.content}</p>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {comment.author} · {comment.createdAt}
                  </div>
                  {currentUser && currentUser.id === comment.authorId && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(comment.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      삭제
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="comment-input">댓글 입력</Label>
            <Textarea
              id="comment-input"
              placeholder="댓글을 입력하세요..."
              value={newCommentContent}
              onChange={(e) => {
                setNewCommentContent(e.target.value);
                setValidationError(null);
              }}
              className={validationError ? "border-destructive" : ""}
            />
          </div>
          
          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}
          
          {submitError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}
          
          <Button
            type="submit"
            disabled={!isCommentValid || isSubmitting}
            className="w-full"
          >
            <Send className="mr-2 h-4 w-4" />
            댓글 등록
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default CommentSection;
