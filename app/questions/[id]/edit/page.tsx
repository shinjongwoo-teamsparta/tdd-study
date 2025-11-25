"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Question = {
  id: string;
  title: string;
  content: string;
  category: string;
  visibility: string;
  isResolved: boolean;
  authorId: string;
};

type FormData = {
  title: string;
  content: string;
  category: string;
  visibility: string;
  isResolved: boolean;
};

type FormErrors = {
  title?: string;
  content?: string;
  category?: string;
  visibility?: string;
};

type QuestionEditPageProps = {
  params: { id: string };
};

export default function QuestionEditPage({ params }: QuestionEditPageProps) {
  const router = useRouter();
  const [question, setQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    content: "",
    category: "",
    visibility: "",
    isResolved: false,
  });
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const { fetchQuestion, getCurrentUser } = await import("./api");
        const [questionData, userData] = await Promise.all([
          fetchQuestion(params.id),
          getCurrentUser(),
        ]);

        setQuestion(questionData);
        setCurrentUser(userData);

        // 권한 확인
        if (userData.id !== questionData.authorId) {
          setHasPermission(false);
        } else {
          setFormData({
            title: questionData.title,
            content: questionData.content,
            category: questionData.category,
            visibility: questionData.visibility,
            isResolved: questionData.isResolved,
          });
        }

        setError(null);
      } catch (err) {
        setError("질문을 불러오지 못했습니다. 다시 시도해주세요.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [params.id]);

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };

    if (name === "title") {
      if (value.length < 2 || value.length > 50) {
        newErrors.title = "제목은 2자 이상 50자 이하로 입력해주세요.";
      } else {
        delete newErrors.title;
      }
    }

    if (name === "content") {
      if (value.length < 10 || value.length > 2000) {
        newErrors.content = "내용은 10자 이상 2000자 이하로 입력해주세요.";
      } else {
        delete newErrors.content;
      }
    }

    setErrors(newErrors);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === "isResolved") {
      setFormData({ ...formData, isResolved: value === "true" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCancel = () => {
    router.push(`/questions/${params.id}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "제목을 입력해주세요.";
    } else if (formData.title.length < 2 || formData.title.length > 50) {
      newErrors.title = "제목은 2자 이상 50자 이하로 입력해주세요.";
    }

    if (!formData.content.trim()) {
      newErrors.content = "내용을 입력해주세요.";
    } else if (formData.content.length < 10 || formData.content.length > 2000) {
      newErrors.content = "내용은 10자 이상 2000자 이하로 입력해주세요.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const { updateQuestion } = await import("./api");
      await updateQuestion(params.id, formData);

      setSubmitSuccess("수정이 완료되었습니다.");

      // 성공 후 상세 페이지로 이동
      router.push(`/questions/${params.id}`);
    } catch (err) {
      setSubmitError("수정에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!hasPermission) {
    return <div>수정 권한이 없습니다.</div>;
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">제목</label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {errors.title && <div>{errors.title}</div>}
        </div>

        <div>
          <label htmlFor="content">내용</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {errors.content && <div>{errors.content}</div>}
        </div>

        <div>
          <label htmlFor="category">카테고리</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="">선택하세요</option>
            <option value="JavaScript">JavaScript</option>
            <option value="React">React</option>
            <option value="테스트">테스트</option>
            <option value="기타">기타</option>
          </select>
          {errors.category && <div>{errors.category}</div>}
        </div>

        <div>
          <label htmlFor="visibility">공개 범위</label>
          <select
            id="visibility"
            name="visibility"
            value={formData.visibility}
            onChange={handleChange}
          >
            <option value="">선택하세요</option>
            <option value="전체 공개">전체 공개</option>
            <option value="팀원만">팀원만</option>
            <option value="비공개">비공개</option>
          </select>
          {errors.visibility && <div>{errors.visibility}</div>}
        </div>

        <div>
          <label htmlFor="isResolved">해결 여부</label>
          <select
            id="isResolved"
            name="isResolved"
            value={formData.isResolved.toString()}
            onChange={handleChange}
          >
            <option value="false">미해결</option>
            <option value="true">해결됨</option>
          </select>
        </div>

        {submitError && <div>{submitError}</div>}
        {submitSuccess && <div>{submitSuccess}</div>}
        {isSubmitting && <div>수정 중...</div>}

        <button type="submit" disabled={isSubmitting}>
          수정 완료
        </button>
        <button type="button" onClick={handleCancel}>
          취소
        </button>
      </form>
    </div>
  );
}


