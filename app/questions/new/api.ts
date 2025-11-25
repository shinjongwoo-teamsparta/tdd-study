// Mock API - 실제로는 서버와 통신하는 함수들
export async function createQuestion(data: any) {
  // Mock implementation
  return {
    id: "new-id",
    ...data,
  };
}




