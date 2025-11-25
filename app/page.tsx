"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, BookOpen } from "lucide-react";

export default function Page() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-4">TDD 질문 게시판</h1>
        <p className="text-xl text-muted-foreground mb-12">
          TDD와 테스트에 관한 질문을 자유롭게 공유하고 토론하세요
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <BookOpen className="h-12 w-12 mb-4 text-primary mx-auto" />
              <CardTitle>질문 목록 보기</CardTitle>
              <CardDescription>
                다른 사람들의 질문과 답변을 확인해보세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => router.push("/questions")}
                className="w-full"
              >
                질문 목록으로
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <MessageCircle className="h-12 w-12 mb-4 text-primary mx-auto" />
              <CardTitle>질문하기</CardTitle>
              <CardDescription>
                궁금한 점을 질문하고 답변을 받아보세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => router.push("/questions/new")}
                className="w-full"
              >
                질문 작성하기
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="bg-muted p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">환영합니다!</h2>
          <p className="text-muted-foreground">
            이 게시판은 TDD(Test-Driven Development)와 테스트 관련 질문을 공유하는 곳입니다.
            <br />
            질문을 작성하고, 다른 사람들의 질문에 답변하며 함께 성장해요.
          </p>
        </div>
      </div>
    </div>
  );
}
