import { API_ENDPOINTS } from '../../../config/api';

// 실제 서버와 통신하는 함수들
export async function fetchComments(questionId: string) {
  const response = await fetch(`${API_ENDPOINTS.comments}?questionId=${questionId}`, {
    cache: 'no-store',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch comments');
  }
  
  return response.json();
}

export async function createComment(questionId: string, content: string) {
  const currentUser = await getCurrentUser();
  
  const response = await fetch(API_ENDPOINTS.comments, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      questionId,
      content,
      author: currentUser.name,
      authorId: currentUser.id,
      createdAt: new Date().toISOString(),
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create comment');
  }
  
  return response.json();
}

export async function deleteComment(commentId: string) {
  const response = await fetch(`${API_ENDPOINTS.comments}/${commentId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete comment');
  }
  
  return { success: true };
}

export async function getCurrentUser() {
  // 현재는 고정된 사용자 반환 (실제로는 인증 시스템과 연동)
  const response = await fetch(`${API_ENDPOINTS.users}/current-user-id`);
  
  if (!response.ok) {
    return { id: "current-user-id", name: "Current User" };
  }
  
  return response.json();
}




