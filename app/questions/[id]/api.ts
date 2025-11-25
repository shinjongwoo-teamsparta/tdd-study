// Mock API - 실제로는 서버와 통신하는 함수들
export async function fetchQuestion(id: string) {
  // Mock implementation
  return {
    id,
    title: "Sample Question",
    content: "Sample content",
    category: "React",
    author: "Author",
    authorId: "author-id",
    createdAt: new Date().toISOString(),
    likeCount: 0,
    isResolved: false,
    isLikedByCurrentUser: false,
  };
}

export async function fetchComments(questionId: string) {
  // Mock implementation
  return [];
}

export async function toggleLike(questionId: string) {
  // Mock implementation
  return {
    likeCount: 1,
    isLikedByCurrentUser: true,
  };
}

export async function toggleResolved(questionId: string) {
  // Mock implementation
  return {
    isResolved: true,
  };
}

export async function deleteQuestion(questionId: string) {
  // Mock implementation
  return { success: true };
}

export async function getCurrentUser() {
  // Mock implementation
  return { id: "current-user-id", name: "Current User" };
}




