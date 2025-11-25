import { API_ENDPOINTS } from '../../config/api';

// 실제 서버와 통신하는 함수들
export async function fetchQuestion(id: string) {
  const response = await fetch(`${API_ENDPOINTS.questions}/${id}`, {
    cache: 'no-store',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch question');
  }
  
  const question = await response.json();
  
  // 현재 사용자의 좋아요 여부 확인
  const currentUser = await getCurrentUser();
  const likesResponse = await fetch(`${API_ENDPOINTS.likes}?questionId=${id}&userId=${currentUser.id}`);
  const likes = await likesResponse.json();
  
  return {
    ...question,
    isLikedByCurrentUser: likes.length > 0,
  };
}

export async function fetchComments(questionId: string) {
  const response = await fetch(`${API_ENDPOINTS.comments}?questionId=${questionId}`, {
    cache: 'no-store',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch comments');
  }
  
  return response.json();
}

export async function toggleLike(questionId: string) {
  const currentUser = await getCurrentUser();
  
  // 기존 좋아요 확인
  const likesResponse = await fetch(`${API_ENDPOINTS.likes}?questionId=${questionId}&userId=${currentUser.id}`);
  const likes = await likesResponse.json();
  
  if (likes.length > 0) {
    // 좋아요 취소
    await fetch(`${API_ENDPOINTS.likes}/${likes[0].id}`, {
      method: 'DELETE',
    });
  } else {
    // 좋아요 추가
    await fetch(API_ENDPOINTS.likes, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        questionId,
        userId: currentUser.id,
      }),
    });
  }
  
  // 업데이트된 좋아요 수 계산
  const allLikesResponse = await fetch(`${API_ENDPOINTS.likes}?questionId=${questionId}`);
  const allLikes = await allLikesResponse.json();
  
  return {
    likeCount: allLikes.length,
    isLikedByCurrentUser: likes.length === 0, // 토글되었으므로 반대
  };
}

export async function toggleResolved(questionId: string) {
  // 현재 질문 가져오기
  const questionResponse = await fetch(`${API_ENDPOINTS.questions}/${questionId}`);
  const question = await questionResponse.json();
  
  // 해결 상태 토글
  const response = await fetch(`${API_ENDPOINTS.questions}/${questionId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      isResolved: !question.isResolved,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to toggle resolved status');
  }
  
  return response.json();
}

export async function deleteQuestion(questionId: string) {
  const response = await fetch(`${API_ENDPOINTS.questions}/${questionId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete question');
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




