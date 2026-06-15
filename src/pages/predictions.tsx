import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useListPredictions, useGetPredictionLeaderboard, useCreatePrediction, useListPlayers, useListTeams, getListPredictionsQueryKey } from "@/api/api";
import { useQueryClient } from "@tanstack/react-query";
import { Trophy, Target, CheckCircle, XCircle, Clock, Coins } from "lucide-react";

const PRED_TYPES = [
  { value: "homerun", label: "오늘 홈런", reward: 50, desc: "오늘 홈런을 칠 선수를 예측하세요" },
  { value: "mvp", label: "오늘 MVP", reward: 80, desc: "오늘 MVP를 받을 선수를 예측하세요" },
  { value: "weekly_batting", label: "이번 주 타격왕", reward: 150, desc: "이번 주 타율 1위를 예측하세요" },
  { value: "season_champion", label: "시즌 우승팀", reward: 500, desc: "2025 KBO 시즌 우승팀을 예측하세요" },
];

function StatusIcon({ isCorrect }: { isCorrect: boolean | null | undefined }) {
  if (isCorrect === true) return <CheckCircle className="w-4 h-4 text-green-400" />;
  if (isCorrect === false) return <XCircle className="w-4 h-4 text-red-400" />;
  return <Clock className="w-4 h-4 text-yellow-400" />;
}

export default function Predictions() {
  const qc = useQueryClient();
  const [activeType, setActiveType] = useState("homerun");
  const [selectedTarget, setSelectedTarget] = useState<{id: number; name: string} | null>(null);

  const { data: predictions, isLoading: predsLoading } = useListPredictions({ type: activeType as any });
  const { data: leaderboard } = useGetPredictionLeaderboard({ limit: 10 });
  const { data: players } = useListPlayers({ limit: 20 });
  const { data: teams } = useListTeams();
  const createPrediction = useCreatePrediction();

  const today = new Date().toISOString().split("T")[0];

  const currentType = PRED_TYPES.find(t => t.value === activeType)!;

  const handlePredict = () => {
    if (!selectedTarget) return;
    createPrediction.mutate({
      data: {
        type: activeType,
        userId: 1,
        targetId: selectedTarget.id,
        targetName: selectedTarget.name,
        date: today,
      }
    }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListPredictionsQueryKey() });
        setSelectedTarget(null);
      }
    });
  };

  const isTeamType = activeType === "season_champion";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-4xl font-bold tracking-tight text-white mb-1">떡상 예측소</h1>
        <p className="text-muted-foreground">예측 적중 시 포인트 획득! 실력을 증명하세요.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Prediction Form */}
          <Card className="bg-card border-card-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" /> 예측 참여
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Type selection */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {PRED_TYPES.map(t => (
                  <button
                    key={t.value}
                    onClick={() => { setActiveType(t.value); setSelectedTarget(null); }}
                    className={`p-3 rounded-lg border text-xs font-medium transition-all ${activeType === t.value ? "bg-primary text-primary-foreground border-primary" : "bg-muted/30 border-border text-muted-foreground hover:border-primary/40"}`}
                  >
                    <div className="font-bold mb-1">{t.label}</div>
                    <div className="flex items-center gap-1 justify-center">
                      <Coins className="w-3 h-3" /> {t.reward}P
                    </div>
                  </button>
                ))}
              </div>

              <p className="text-sm text-muted-foreground">{currentType.desc}</p>

              {/* Target selection */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">예측 대상 선택</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {isTeamType
                    ? teams?.map(t => (
                        <button key={t.id} onClick={() => setSelectedTarget({ id: t.id, name: t.name })}
                          className={`p-2 rounded border text-xs transition-all ${selectedTarget?.id === t.id ? "bg-primary text-primary-foreground border-primary" : "bg-muted/20 border-border text-foreground hover:border-primary/40"}`}>
                          {t.name}
                        </button>
                      ))
                    : players?.filter(p => p.position !== "투수").map(p => (
                        <button key={p.id} onClick={() => setSelectedTarget({ id: p.id, name: p.name })}
                          className={`p-2 rounded border text-xs transition-all flex flex-col items-start ${selectedTarget?.id === p.id ? "bg-primary text-primary-foreground border-primary" : "bg-muted/20 border-border text-foreground hover:border-primary/40"}`}>
                          <span className="font-semibold">{p.name}</span>
                          <span className="opacity-70">{p.teamName}</span>
                        </button>
                      ))
                  }
                </div>
              </div>

              {selectedTarget && (
                <div className="p-3 bg-primary/10 rounded-lg border border-primary/30">
                  <p className="text-sm text-primary font-medium">선택: {selectedTarget.name}</p>
                  <p className="text-xs text-muted-foreground">적중 시 {currentType.reward}포인트 획득</p>
                </div>
              )}

              <Button
                onClick={handlePredict}
                disabled={!selectedTarget || createPrediction.isPending}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {createPrediction.isPending ? "제출 중..." : "예측 제출"}
              </Button>
            </CardContent>
          </Card>

          {/* Predictions list */}
          <Card className="bg-card border-card-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm">{currentType.label} 예측 현황</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {predsLoading && [1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              {predictions?.slice(0, 10).map(p => (
                <div key={p.id} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg border border-border/30">
                  <StatusIcon isCorrect={p.isCorrect} />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-white">{p.userName}</span>
                    <span className="text-sm text-muted-foreground ml-2">→ {p.targetName}</span>
                  </div>
                  {p.isCorrect === true && p.pointsEarned && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">+{p.pointsEarned}P</Badge>
                  )}
                  <span className="text-xs text-muted-foreground">{p.date}</span>
                </div>
              ))}
              {predictions?.length === 0 && <p className="text-center text-muted-foreground text-sm py-4">아직 예측이 없습니다</p>}
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        <Card className="bg-card border-card-border h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-white">
              <Trophy className="w-5 h-5 text-primary" /> 예측 랭킹
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {leaderboard?.map((e, i) => (
              <div key={e.userId} className={`flex items-center gap-3 p-2 rounded-lg ${i === 0 ? "bg-primary/10 border border-primary/20" : ""}`}>
                <span className={`w-6 text-center font-bold text-sm ${i === 0 ? "text-primary" : i < 3 ? "text-blue-400" : "text-muted-foreground"}`}>
                  {e.rank}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm truncate">{e.userName}</p>
                  <p className="text-xs text-muted-foreground">{e.correctCount}/{e.totalCount} 적중 ({e.accuracy}%)</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">{e.totalPoints.toLocaleString()}P</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
