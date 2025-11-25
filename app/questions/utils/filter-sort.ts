export type Question = {
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

export type FilterOptions = {
  searchQuery?: string;
  category?: string;
  resolved?: "all" | "resolved" | "unresolved";
};

export type SortOption = "latest" | "likes" | "comments";

/**
 * 질문 목록 필터링
 * @param questions - 필터링할 질문 목록
 * @param options - 필터 옵션
 * @returns 필터링된 질문 목록
 */
export function filterQuestions(
  questions: Question[],
  options: FilterOptions
): Question[] {
  let filtered = [...questions];

  // 검색어 필터
  if (options.searchQuery && options.searchQuery.trim() !== "") {
    const query = options.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (q) =>
        q.title.toLowerCase().includes(query) ||
        q.content.toLowerCase().includes(query)
    );
  }

  // 카테고리 필터
  if (options.category && options.category !== "전체") {
    filtered = filtered.filter((q) => q.category === options.category);
  }

  // 해결 여부 필터
  if (options.resolved && options.resolved !== "all") {
    if (options.resolved === "resolved") {
      filtered = filtered.filter((q) => q.isResolved);
    } else if (options.resolved === "unresolved") {
      filtered = filtered.filter((q) => !q.isResolved);
    }
  }

  return filtered;
}

/**
 * 질문 목록 정렬
 * @param questions - 정렬할 질문 목록
 * @param sortBy - 정렬 기준
 * @returns 정렬된 질문 목록
 */
export function sortQuestions(
  questions: Question[],
  sortBy: SortOption = "latest"
): Question[] {
  const sorted = [...questions];

  switch (sortBy) {
    case "likes":
      return sorted.sort((a, b) => b.likeCount - a.likeCount);
    case "comments":
      return sorted.sort((a, b) => b.commentCount - a.commentCount);
    case "latest":
    default:
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }
}


