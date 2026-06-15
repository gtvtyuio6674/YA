import React from "react";
import { Button } from "@/components/ui/button";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md p-8 bg-card rounded-2xl border border-border shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-primary mb-2">야덕연구소</h1>
          <p className="text-muted-foreground">연구소에 입장하세요</p>
        </div>
        
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">이메일</label>
            <input type="email" className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="hello@yaduk.kr" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">비밀번호</label>
            <input type="password" className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="••••••••" />
          </div>
          <Button className="w-full bg-primary text-primary-foreground font-bold hover:bg-primary/90 mt-4">
            로그인
          </Button>
        </form>
      </div>
    </div>
  );
}
