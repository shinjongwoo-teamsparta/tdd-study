"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Save, X, AlertCircle, CheckCircle2 } from "lucide-react";

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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-destructive">{error}</div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">수정 권한이 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">질문 수정하기</h1>
        <p className="text-muted-foreground">
          질문 내용을 수정해주세요
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>질문 정보</CardTitle>
          <CardDescription>
            수정할 내용을 입력해주세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                name="title"
                type="text"
                placeholder="질문 제목을 입력하세요 (2-50자)"
                value={formData.title}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">내용</Label>
              <Textarea
                id="content"
                name="content"
                placeholder="질문 내용을 상세히 입력하세요 (10-2000자)"
                value={formData.content}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.content ? "border-destructive min-h-[200px]" : "min-h-[200px]"}
              />
              {errors.content && (
                <p className="text-sm text-destructive">{errors.content}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">카테고리</Label>
                <Select
                  name="category"
                  value={formData.category}
                  onValueChange={(value) => 
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger 
                    id="category"
                    className={errors.category ? "border-destructive" : ""}
                  >
                    <SelectValue placeholder="선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JavaScript">JavaScript</SelectItem>
                    <SelectItem value="React">React</SelectItem>
                    <SelectItem value="테스트">테스트</SelectItem>
                    <SelectItem value="기타">기타</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility">공개 범위</Label>
                <Select
                  name="visibility"
                  value={formData.visibility}
                  onValueChange={(value) => 
                    setFormData({ ...formData, visibility: value })
                  }
                >
                  <SelectTrigger 
                    id="visibility"
                    className={errors.visibility ? "border-destructive" : ""}
                  >
                    <SelectValue placeholder="선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="전체 공개">전체 공개</SelectItem>
                    <SelectItem value="팀원만">팀원만</SelectItem>
                    <SelectItem value="비공개">비공개</SelectItem>
                  </SelectContent>
                </Select>
                {errors.visibility && (
                  <p className="text-sm text-destructive">{errors.visibility}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="isResolved">해결 여부</Label>
                <Select
                  name="isResolved"
                  value={formData.isResolved.toString()}
                  onValueChange={(value) => 
                    setFormData({ ...formData, isResolved: value === "true" })
                  }
                >
                  <SelectTrigger id="isResolved">
                    <SelectValue placeholder="선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">미해결</SelectItem>
                    <SelectItem value="true">해결됨</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {submitError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            {submitSuccess && (
              <Alert variant="success">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{submitSuccess}</AlertDescription>
              </Alert>
            )}

            {isSubmitting && (
              <Alert>
                <AlertDescription>수정 중...</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1"
              >
                <Save className="mr-2 h-4 w-4" />
                수정 완료
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={handleCancel}
              >
                <X className="mr-2 h-4 w-4" />
                취소
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


