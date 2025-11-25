"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { filterQuestions, sortQuestions } from "./utils/filter-sort";
import { fetchQuestions } from "./api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MessageCircle, Heart, Plus } from "lucide-react";

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

export default function QuestionListPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [resolvedFilter, setResolvedFilter] = useState("");
  const [sortOption, setSortOption] = useState("latest");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setIsLoading(true);
        const data = await fetchQuestions();
        setQuestions(data);
        setFilteredQuestions(data);
        setError(null);
      } catch (err) {
        setError("목록을 불러오지 못했습니다. 다시 시도해주세요.");
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, []);

  useEffect(() => {
    let result = [...questions];

    // 검색 필터
    if (searchTerm) {
      result = result.filter(
        (q) =>
          q.title.includes(searchTerm) || q.content.includes(searchTerm)
      );
    }

    // 카테고리 필터
    if (categoryFilter) {
      result = filterQuestions(result, { category: categoryFilter });
    }

    // 해결 여부 필터
    if (resolvedFilter === "resolved") {
      result = filterQuestions(result, { resolved: "resolved" });
    } else if (resolvedFilter === "unresolved") {
      result = filterQuestions(result, { resolved: "unresolved" });
    }

    // 정렬
    result = sortQuestions(result, sortOption as any);

    setFilteredQuestions(result);
  }, [questions, searchTerm, categoryFilter, resolvedFilter, sortOption]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 이미 useEffect에서 처리되므로 별도 로직 불필요
  };

  const handleCreateQuestion = () => {
    router.push("/questions/new");
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

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">질문 목록</h1>
          <p className="text-muted-foreground">궁금한 점을 자유롭게 질문하세요</p>
        </div>
        <Button onClick={handleCreateQuestion} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          질문 작성하기
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>검색 및 필터</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="search">제목/내용 검색</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="search"
                    type="text"
                    placeholder="검색어를 입력하세요..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" variant="secondary">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="category">카테고리</Label>
                <Select value={categoryFilter || undefined} onValueChange={(value) => setCategoryFilter(value)}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="전체" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="React">React</SelectItem>
                    <SelectItem value="JavaScript">JavaScript</SelectItem>
                    <SelectItem value="테스트">테스트</SelectItem>
                    <SelectItem value="기타">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="resolved">해결 여부</Label>
                <Select value={resolvedFilter || undefined} onValueChange={(value) => setResolvedFilter(value)}>
                  <SelectTrigger id="resolved">
                    <SelectValue placeholder="전체" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resolved">해결됨만</SelectItem>
                    <SelectItem value="unresolved">미해결만</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sort">정렬</Label>
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger id="sort">
                    <SelectValue placeholder="최신순" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">최신순</SelectItem>
                    <SelectItem value="likes">좋아요순</SelectItem>
                    <SelectItem value="comments">댓글 많은 순</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {filteredQuestions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">조건에 맞는 질문이 없습니다.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((question) => (
            <Card 
              key={question.id} 
              data-testid={`question-card-${question.id}`}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/questions/${question.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={question.isResolved ? "secondary" : "default"}>
                        {question.isResolved ? "해결됨" : "미해결"}
                      </Badge>
                      <Badge variant="outline">{question.category}</Badge>
                    </div>
                    <CardTitle className="text-2xl mb-2">{question.title}</CardTitle>
                    <CardDescription>
                      {question.author} · {question.createdAt}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>댓글 {question.commentCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>좋아요 {question.likeCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
