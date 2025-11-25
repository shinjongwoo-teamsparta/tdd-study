import { API_ENDPOINTS } from '../../config/api';

// 실제 서버와 통신하는 함수들
export async function createQuestion(data: any) {
  const response = await fetch(API_ENDPOINTS.questions, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...data,
      createdAt: new Date().toISOString(),
      likeCount: 0,
      isResolved: false,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create question');
  }
  
  return response.json();
}




