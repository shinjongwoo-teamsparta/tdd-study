"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { filterQuestions, sortQuestions } from "./utils/filter-sort";
import { fetchQuestions } from "./api";

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
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>질문 목록</h1>

      <button onClick={handleCreateQuestion}>질문 작성하기</button>

      <form onSubmit={handleSearch}>
        <div>
          <label htmlFor="search">제목/내용 검색</label>
          <input
            id="search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">검색</button>
        </div>
      </form>

      <div>
        <label htmlFor="category">카테고리</label>
        <select
          id="category"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">전체</option>
          <option value="React">React</option>
          <option value="JavaScript">JavaScript</option>
          <option value="테스트">테스트</option>
          <option value="기타">기타</option>
        </select>
      </div>

      <div>
        <label htmlFor="resolved">해결 여부</label>
        <select
          id="resolved"
          value={resolvedFilter}
          onChange={(e) => setResolvedFilter(e.target.value)}
        >
          <option value="">전체</option>
          <option value="resolved">해결됨만</option>
          <option value="unresolved">미해결만</option>
        </select>
      </div>

      <div>
        <label htmlFor="sort">정렬</label>
        <select
          id="sort"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="latest">최신순</option>
          <option value="likes">좋아요순</option>
          <option value="comments">댓글 많은 순</option>
        </select>
      </div>

      {filteredQuestions.length === 0 ? (
        <div>조건에 맞는 질문이 없습니다.</div>
      ) : (
        <div>
          {filteredQuestions.map((question) => (
            <div key={question.id} data-testid={`question-card-${question.id}`}>
              <h2>{question.title}</h2>
              <div>{question.category}</div>
              <div>{question.author}</div>
              <div>{question.createdAt}</div>
              <div>댓글 {question.commentCount}</div>
              <div>좋아요 {question.likeCount}</div>
              <div>{question.isResolved ? "[해결됨]" : "[미해결]"}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
