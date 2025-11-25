// Mock API - 실제로는 서버와 통신하는 함수들
export async function fetchComments(questionId: string) {
  // Mock implementation
  return [];
}

export async function createComment(questionId: string, content: string) {
  // Mock implementation
  return {
    id: "new-comment",
    content,
    author: "Current User",
    authorId: "current-user-id",
    createdAt: new Date().toISOString(),
  };
}

export async function deleteComment(commentId: string) {
  // Mock implementation
  return { success: true };
}

export async function getCurrentUser() {
  // Mock implementation
  return { id: "current-user-id", name: "Current User" };
}




