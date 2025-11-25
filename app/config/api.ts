// API 설정
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const API_ENDPOINTS = {
  questions: `${API_BASE_URL}/questions`,
  comments: `${API_BASE_URL}/comments`,
  users: `${API_BASE_URL}/users`,
  likes: `${API_BASE_URL}/likes`,
};

