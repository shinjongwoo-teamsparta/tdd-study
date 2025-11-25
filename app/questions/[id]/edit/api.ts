// Mock API - 실제로는 서버와 통신하는 함수들
export async function fetchQuestion(id: string) {
  // Mock implementation
  return {
    id,
    title: "Sample Question",
    content: "Sample content",
    category: "React",
    visibility: "전체 공개",
    isResolved: false,
    authorId: "author-id",
  };
}

export async function updateQuestion(id: string, data: any) {
  // Mock implementation
  return {
    id,
    ...data,
  };
}

export async function getCurrentUser() {
  // Mock implementation
  return { id: "current-user-id", name: "Current User" };
}




