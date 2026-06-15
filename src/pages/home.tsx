import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  useGetTodayMatches,
  useGetHomeSummary,
  useGetAiMatchPredictions,
  useGetHomerunPredictions,
  useGetPopularPosts,
  useListTeams,
} from "@/api/api";
import { Trophy, Target, Zap, TrendingUp, Calendar, MessageSquare, Brain } from "lucide-react";

const boardLabel: Record<string, string> = { free: "자유", kbo: "KBO", mlb: "MLB", prospects: "유망주", trades: "이적" };

function getStatusBadge(status: string) {
  if (status === "live") return <Badge className="bg-red-500 text-white animate-pulse">LIVE</Badge>;
  if (status === "completed") return <Badge variant="outline" className="text-muted-foreground">종료</Badge>;
  return <Badge variant="secondary">예정</Badge>;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor(diff / 60000);
  if (h > 24) return `${Math.floor(h / 24)}일 전`;
  if (h > 0) return `${h}시간 전`;
  return `${m}분 전`;
}

export default function Home() {
  const { data: todayMatches, isLoading: matchesLoading } = useGetTodayMatches();
  const { data: summary } = useGetHomeSummary();
  const { data: aiPredictions } = useGetAiMatchPredictions();
  const { data: homerunCandidates } = useGetHomerunPredictions();
  const { data: popularPosts } = useGetPopularPosts({ limit: 5 });
  const { data: teams } = useListTeams();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-2">
        <h1 className="text-4xl font-bold tracking-tight text-white mb-1">
          야덕연구소 <span className="text-primary">커맨드센터</span>
        </h1>
        <p className="text-muted-foreground">실시간 KBO 데이터 분석 플랫폼</p>
      </header>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "오늘 경기", value: summary.todayMatchCount, icon: Calendar, color: "text-blue-400" },
            { label: "라이브 중", value: summary.liveMatchCount, icon: Zap, color: "text-red-400" },
            { label: "전체 게시글", value: summary.totalPostCount.toLocaleString(), icon: MessageSquare, color: "text-green-400" },
            { label: "진행 중 예측", value: summary.activePredictions, icon: Target, color: "text-primary" },
          ].map((stat) => (
            <Card key={stat.label} className="bg-card border-card-border">
              <CardContent className="p-4 flex items-center gap-3">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today Matches */}
        <Card className="lg:col-span-2 bg-card border-card-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-white">
              <Calendar className="w-5 h-5 text-primary" /> 오늘의 경기
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {matchesLoading && [1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            {todayMatches?.length === 0 && (
              <p className="text-muted-foreground text-center py-4">오늘 예정된 경기가 없습니다</p>
            )}
            {todayMatches?.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border border-border/50 hover:border-primary/40 transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <span className="font-bold text-white w-16 text-right">{m.homeTeamName}</span>
                  <div className="flex flex-col items-center gap-1">
                    {getStatusBadge(m.status)}
                    {m.status !== "scheduled" && (
                      <span className="text-xl font-black text-white">{m.homeScore ?? "-"} - {m.awayScore ?? "-"}</span>
                    )}
                    {m.status === "scheduled" && (
                      <span className="text-sm text-muted-foreground">{new Date(m.scheduledAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Seoul" })}</span>
                    )}
                    {m.status === "live" && m.inning && (
                      <span className="text-xs text-red-400">{m.inning}회{m.inningHalf}</span>
                    )}
                  </div>
                  <span className="font-bold text-white w-16">{m.awayTeamName}</span>
                </div>
                <span className="text-xs text-muted-foreground hidden md:block">{m.venue}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Team Standings */}
        <Card className="bg-card border-card-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-white">
              <Trophy className="w-5 h-5 text-primary" /> 팀 순위
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {teams?.slice(0, 10).map((t) => (
              <div key={t.id} className="flex items-center gap-3 py-1">
                <span className={`w-5 text-center font-bold ${t.rank === 1 ? "text-primary" : t.rank <= 3 ? "text-blue-400" : "text-muted-foreground"}`}>
                  {t.rank}
                </span>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: t.primaryColor }} />
                <span className="font-medium text-white flex-1 text-sm">{t.shortName}</span>
                <span className="text-xs text-muted-foreground">{t.wins}승{t.losses}패</span>
                <span className="text-xs font-bold text-primary">{t.winRate.toFixed(3)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Match Predictions */}
        <Card className="bg-card border-card-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-white">
              <Brain className="w-5 h-5 text-primary" /> AI 경기 예측
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!aiPredictions && <Skeleton className="h-20 w-full" />}
            {aiPredictions?.length === 0 && <p className="text-muted-foreground text-sm">오늘 예측할 경기가 없습니다</p>}
            {aiPredictions?.map((p) => (
              <div key={p.matchId} className="p-3 bg-muted/30 rounded-lg border border-border/40">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-white">{p.homeTeam} vs {p.awayTeam}</span>
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    {Math.round(p.confidence * 100)}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  예측 우승: <span className="text-primary font-semibold">{p.predictedWinner}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">{p.reasoning}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Homerun Candidates */}
        <Card className="bg-card border-card-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-white">
              <Target className="w-5 h-5 text-primary" /> 오늘의 홈런 예측
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {!homerunCandidates && <Skeleton className="h-20 w-full" />}
            {homerunCandidates?.slice(0, 5).map((c) => (
              <div key={c.playerId} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">{c.homeRuns}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">{c.playerName}</p>
                  <p className="text-xs text-muted-foreground">{c.teamName} · {c.recentForm}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-primary">{Math.round(c.probability * 100)}%</div>
                  <div className="text-xs text-muted-foreground">확률</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Popular Posts */}
      <Card className="bg-card border-card-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-white"><TrendingUp className="w-5 h-5 text-primary" /> 인기 게시글</span>
            <Link href="/community"><span className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer">전체보기</span></Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {!popularPosts && [1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
          {popularPosts?.map((p) => (
            <div key={p.id} className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg border border-border/30 hover:border-primary/30 transition-colors cursor-pointer">
              <div className="flex gap-2 items-center flex-shrink-0">
                {p.isHot && <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">HOT</Badge>}
                <Badge variant="outline" className="text-xs">{boardLabel[p.board] ?? p.board}</Badge>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm truncate">{p.title}</p>
                <p className="text-xs text-muted-foreground">{p.authorName} · {timeAgo(p.createdAt)} · 추천 {p.upvotes} · 댓글 {p.commentCount}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
