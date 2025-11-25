import { API_ENDPOINTS } from '../../../config/api';

// 실제 서버와 통신하는 함수들
export async function fetchQuestion(id: string) {
  const response = await fetch(`${API_ENDPOINTS.questions}/${id}`, {
    cache: 'no-store',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch question');
  }
  
  return response.json();
}

export async function updateQuestion(id: string, data: any) {
  const response = await fetch(`${API_ENDPOINTS.questions}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update question');
  }
  
  return response.json();
}

export async function getCurrentUser() {
  // 현재는 고정된 사용자 반환 (실제로는 인증 시스템과 연동)
  const response = await fetch(`${API_ENDPOINTS.users}/current-user-id`);
  
  if (!response.ok) {
    return { id: "current-user-id", name: "Current User" };
  }
  
  return response.json();
}




