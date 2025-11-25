"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Heart, MessageCircle, Edit, Trash2, CheckCircle2 } from "lucide-react";

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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-destructive">{error}</div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">질문을 찾을 수 없습니다.</div>
      </div>
    );
  }

  const isAuthor = currentUser && currentUser.id === question.authorId;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Button 
        variant="outline" 
        onClick={() => router.push("/questions")}
        className="mb-6"
      >
        ← 목록으로
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant={question.isResolved ? "secondary" : "default"}>
                  {question.isResolved ? "해결됨" : "미해결"}
                </Badge>
                <Badge variant="outline">{question.category}</Badge>
              </div>
              <CardTitle className="text-3xl mb-3">{question.title}</CardTitle>
              <CardDescription className="text-base">
                {question.author} · {question.createdAt}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none mb-6">
            <p className="whitespace-pre-wrap text-base">{question.content}</p>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t">
            <Button
              variant={question.isLikedByCurrentUser ? "default" : "outline"}
              onClick={handleLikeToggle}
              data-liked={question.isLikedByCurrentUser}
              className="gap-2"
            >
              <Heart className={`h-4 w-4 ${question.isLikedByCurrentUser ? "fill-current" : ""}`} />
              좋아요 {question.likeCount}
            </Button>

            {isAuthor && (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleResolvedToggle}
                  className="gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  해결 여부 변경
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push(`/questions/${params.id}/edit`)}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  수정하기
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  삭제하기
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            댓글 {comments.length}
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                  <p className="mb-2">{comment.content}</p>
                  <div className="text-sm text-muted-foreground">
                    {comment.author} · {comment.createdAt}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

