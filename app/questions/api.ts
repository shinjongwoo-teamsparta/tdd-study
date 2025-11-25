import { API_ENDPOINTS } from '../config/api';

// 실제 서버와 통신하는 함수들
export async function fetchQuestions() {
  const response = await fetch(API_ENDPOINTS.questions, {
    cache: 'no-store',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch questions');
  }
  
  return response.json();
}
