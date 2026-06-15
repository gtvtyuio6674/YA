import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useListMatches, useGetTodayMatches } from "@/api/api";
import { Brain, MapPin, Clock } from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  if (status === "live") return <Badge className="bg-red-500 text-white text-xs animate-pulse">LIVE</Badge>;
  if (status === "completed") return <Badge variant="outline" className="text-muted-foreground text-xs">종료</Badge>;
  return <Badge variant="secondary" className="text-xs">예정</Badge>;
}

function MatchCard({ match }: { match: any }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className="p-5 bg-card rounded-xl border border-card-border hover:border-primary/40 transition-all cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          {/* Home team */}
          <div className="flex-1 text-right">
            <div className="flex items-center justify-end gap-2">
              <span className="font-bold text-xl text-white">{match.homeTeamName}</span>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: match.homeTeamColor }} />
            </div>
          </div>

          {/* Score / Status */}
          <div className="flex flex-col items-center gap-1 min-w-[100px]">
            <StatusBadge status={match.status} />
            {match.status !== "scheduled" ? (
              <span className="text-3xl font-black text-white">{match.homeScore ?? "?"} - {match.awayScore ?? "?"}</span>
            ) : (
              <span className="text-lg font-bold text-muted-foreground">VS</span>
            )}
            {match.status === "live" && match.inning && (
              <span className="text-xs text-red-400 font-semibold">{match.inning}회 {match.inningHalf}</span>
            )}
            {match.status === "scheduled" && (
              <span className="text-sm text-muted-foreground">
                {new Date(match.scheduledAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Seoul" })}
              </span>
            )}
          </div>

          {/* Away team */}
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: match.awayTeamColor }} />
              <span className="font-bold text-xl text-white">{match.awayTeamName}</span>
            </div>
          </div>
        </div>

        <div className="text-right hidden md:block">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" /> {match.venue}
          </div>
        </div>
      </div>

      {/* AI Summary */}
      {expanded && match.aiSummary && (
        <div className="mt-4 pt-4 border-t border-border/40">
          <div className="flex items-start gap-2">
            <Brain className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-foreground leading-relaxed">{match.aiSummary}</p>
          </div>
        </div>
      )}
      {expanded && !match.aiSummary && (
        <div className="mt-4 pt-4 border-t border-border/40">
          <p className="text-xs text-muted-foreground">경기 종료 후 AI 분석이 제공됩니다</p>
        </div>
      )}
    </div>
  );
}

export default function Matches() {
  const { data: todayMatches, isLoading: todayLoading } = useGetTodayMatches();
  const { data: allMatches, isLoading: allLoading } = useListMatches({ limit: 20 });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-4xl font-bold tracking-tight text-white mb-1">경기 연구실</h1>
        <p className="text-muted-foreground">실시간 스코어 및 AI 경기 분석</p>
      </header>

      <Tabs defaultValue="today">
        <TabsList className="bg-muted/50 border border-border">
          <TabsTrigger value="today">오늘 경기</TabsTrigger>
          <TabsTrigger value="all">전체 경기</TabsTrigger>
          <TabsTrigger value="live">라이브</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-6 space-y-4">
          {todayLoading && [1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
          {todayMatches?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">오늘 예정된 경기가 없습니다</div>
          )}
          {todayMatches?.map(m => <MatchCard key={m.id} match={m} />)}
        </TabsContent>

        <TabsContent value="all" className="mt-6 space-y-4">
          {allLoading && [1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
          {allMatches?.map(m => <MatchCard key={m.id} match={m} />)}
        </TabsContent>

        <TabsContent value="live" className="mt-6 space-y-4">
          {allMatches?.filter(m => m.status === "live").map(m => <MatchCard key={m.id} match={m} />)}
          {allMatches?.filter(m => m.status === "live").length === 0 && (
            <div className="text-center py-12 text-muted-foreground">현재 진행 중인 경기가 없습니다</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
