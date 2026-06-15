import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, ThumbsUp, ThumbsDown, Eye, Flame, PenLine, ArrowLeft } from "lucide-react";
import { useListPosts, useGetPost, useListComments, useCreatePost, useVotePost, useCreateComment } from "@/api/api";
import { useQueryClient } from "@tanstack/react-query";
import { getListPostsQueryKey, getGetPostQueryKey, getListCommentsQueryKey } from "@/api/api";

const BOARDS = [
  { value: "all", label: "전체" },
  { value: "free", label: "자유" },
  { value: "kbo", label: "KBO" },
  { value: "mlb", label: "MLB" },
  { value: "prospects", label: "유망주" },
  { value: "trades", label: "이적" },
];

const boardColor: Record<string, string> = {
  free: "text-green-400", kbo: "text-blue-400", mlb: "text-red-400",
  prospects: "text-purple-400", trades: "text-orange-400"
};

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const h = Math.floor(diff / 3600000);
  if (h > 24) return `${Math.floor(h/24)}일 전`;
  if (h > 0) return `${h}시간 전`;
  return `${Math.floor(diff/60000)}분 전`;
}

function PostDetail({ postId, onBack }: { postId: number; onBack: () => void }) {
  const qc = useQueryClient();
  const { data: post } = useGetPost(postId);
  const { data: comments } = useListComments(postId);
  const votePost = useVotePost();
  const createComment = useCreateComment(postId);
  const [commentText, setCommentText] = useState("");

  const handleVote = (type: "up" | "down") => {
    votePost.mutate({ id: postId, data: { type, userId: 1 } }, {
      onSuccess: () => qc.invalidateQueries({ queryKey: getGetPostQueryKey(postId) })
    });
  };

  const handleComment = () => {
    if (!commentText.trim()) return;
    createComment.mutate({ data: { content: commentText, authorId: 1 } }, {
      onSuccess: () => {
        setCommentText("");
        qc.invalidateQueries({ queryKey: getListCommentsQueryKey(postId) });
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" /> 목록으로
      </button>
      {post && (
        <Card className="bg-card border-card-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className={`text-xs ${boardColor[post.board] ?? ""}`}>{BOARDS.find(b => b.value === post.board)?.label ?? post.board}</Badge>
              {post.isHot && <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs flex items-center gap-1"><Flame className="w-3 h-3" /> HOT</Badge>}
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">{post.title}</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
              <span className="font-semibold text-foreground">{post.authorName}</span>
              <Badge variant="secondary" className="text-xs">{post.authorGrade}</Badge>
              <span>{timeAgo(post.createdAt)}</span>
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.views}</span>
            </div>
            <p className="text-foreground leading-relaxed whitespace-pre-wrap mb-6">{post.content}</p>
            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <Button size="sm" variant="outline" onClick={() => handleVote("up")} className="flex items-center gap-1 border-green-500/30 hover:bg-green-500/10 hover:text-green-400">
                <ThumbsUp className="w-4 h-4" /> {post.upvotes}
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleVote("down")} className="flex items-center gap-1 border-red-500/30 hover:bg-red-500/10 hover:text-red-400">
                <ThumbsDown className="w-4 h-4" /> {post.downvotes}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      <Card className="bg-card border-card-border">
        <CardHeader className="pb-3"><CardTitle className="text-white text-sm flex items-center gap-2"><MessageSquare className="w-4 h-4 text-primary" /> 댓글 {comments?.length ?? 0}개</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {comments?.map(c => (
            <div key={c.id} className="p-3 bg-muted/20 rounded-lg border border-border/30">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm text-white">{c.authorName}</span>
                <Badge variant="secondary" className="text-xs">{c.authorGrade}</Badge>
                <span className="text-xs text-muted-foreground">{timeAgo(c.createdAt)}</span>
              </div>
              <p className="text-sm text-foreground">{c.content}</p>
            </div>
          ))}
          <div className="flex gap-2 mt-4">
            <Input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="댓글 작성..." className="flex-1 bg-muted/30 border-border" onKeyDown={e => e.key === "Enter" && handleComment()} />
            <Button onClick={handleComment} disabled={createComment.isPending} className="bg-primary text-primary-foreground hover:bg-primary/90">등록</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function WritePost({ board, onCancel, onSuccess }: { board: string; onCancel: () => void; onSuccess: () => void }) {
  const qc = useQueryClient();
  const createPost = useCreatePost();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedBoard, setSelectedBoard] = useState(board === "all" ? "free" : board);

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;
    createPost.mutate({ data: { title, content, board: selectedBoard, authorId: 1 } }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListPostsQueryKey() });
        onSuccess();
      }
    });
  };

  return (
    <Card className="bg-card border-card-border animate-in fade-in duration-300">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">게시글 작성</h2>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">취소</button>
        </div>
        <div className="flex gap-2">
          {BOARDS.filter(b => b.value !== "all").map(b => (
            <button key={b.value} onClick={() => setSelectedBoard(b.value)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${selectedBoard === b.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
              {b.label}
            </button>
          ))}
        </div>
        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="제목" className="bg-muted/30 border-border" />
        <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="내용을 입력하세요..." rows={6} className="bg-muted/30 border-border" />
        <Button onClick={handleSubmit} disabled={createPost.isPending} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
          {createPost.isPending ? "작성 중..." : "게시글 등록"}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function Community() {
  const [activeBoard, setActiveBoard] = useState("all");
  const [selectedPost, setSelectedPost] = useState<number | null>(null);
  const [writing, setWriting] = useState(false);

  const { data: posts, isLoading } = useListPosts({
    board: activeBoard === "all" ? undefined : (activeBoard as any),
    sort: "latest",
    limit: 20,
  });

  if (selectedPost) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <PostDetail postId={selectedPost} onBack={() => setSelectedPost(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-1">야덕 토론장</h1>
          <p className="text-muted-foreground">야구 데이터로 논쟁하는 공간</p>
        </div>
        <Button onClick={() => setWriting(!writing)} variant="outline" className="border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground flex items-center gap-2">
          <PenLine className="w-4 h-4" /> {writing ? "취소" : "글쓰기"}
        </Button>
      </header>

      {writing && <WritePost board={activeBoard} onCancel={() => setWriting(false)} onSuccess={() => setWriting(false)} />}

      <Tabs value={activeBoard} onValueChange={setActiveBoard}>
        <TabsList className="bg-muted/50 border border-border flex-wrap h-auto gap-1 p-1">
          {BOARDS.map(b => <TabsTrigger key={b.value} value={b.value}>{b.label}</TabsTrigger>)}
        </TabsList>

        <TabsContent value={activeBoard} className="mt-4 space-y-3">
          {isLoading && [1,2,3,4,5].map(i => <Skeleton key={i} className="h-20 w-full" />)}
          {posts?.map(p => (
            <div
              key={p.id}
              className="p-4 bg-card rounded-lg border border-card-border hover:border-primary/40 transition-all cursor-pointer group"
              onClick={() => setSelectedPost(p.id)}
            >
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className={`text-xs ${boardColor[p.board] ?? ""}`}>{BOARDS.find(b => b.value === p.board)?.label ?? p.board}</Badge>
                {p.isHot && <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs flex items-center gap-1"><Flame className="w-3 h-3" /> HOT</Badge>}
                <span className="text-xs text-muted-foreground">{p.authorName}</span>
                <Badge variant="secondary" className="text-xs">{p.authorGrade}</Badge>
                <span className="text-xs text-muted-foreground">{timeAgo(p.createdAt)}</span>
              </div>
              <h3 className="text-base font-semibold text-white group-hover:text-primary transition-colors mb-2 truncate">{p.title}</h3>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {p.upvotes}</span>
                <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {p.commentCount}</span>
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {p.views}</span>
              </div>
            </div>
          ))}
          {posts?.length === 0 && <div className="text-center py-12 text-muted-foreground">게시글이 없습니다</div>}
        </TabsContent>
      </Tabs>
    </div>
  );
}
