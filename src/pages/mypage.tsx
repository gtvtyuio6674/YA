import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetMe, useGetMyCards, useGetMyAchievements, useListNotifications } from "@/api/api";
import { Trophy, Star, Bell, CreditCard, User, Flame, Shield, Zap, Lock } from "lucide-react";

const GRADE_STYLES: Record<string, { color: string; bg: string; icon: React.ElementType; label: string }> = {
  rookie: { color: "text-gray-400", bg: "bg-gray-500/10 border-gray-500/20", icon: User, label: "루키" },
  semi_pro: { color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: Star, label: "세미프로" },
  pro: { color: "text-green-400", bg: "bg-green-500/10 border-green-500/20", icon: Flame, label: "프로" },
  elite: { color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", icon: Shield, label: "엘리트" },
  legend: { color: "text-primary", bg: "bg-primary/10 border-primary/30", icon: Zap, label: "레전드" },
};

const RARITY_STYLES: Record<string, string> = {
  normal: "from-gray-700 to-gray-900 border-gray-600",
  rare: "from-blue-900 to-blue-950 border-blue-500/50",
  epic: "from-purple-900 to-purple-950 border-purple-500/60",
  legendary: "from-yellow-900 to-amber-950 border-yellow-500/70",
};

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const h = Math.floor(diff / 3600000);
  if (h > 24) return `${Math.floor(h/24)}일 전`;
  if (h > 0) return `${h}시간 전`;
  return `${Math.floor(diff/60000)}분 전`;
}

export default function MyPage() {
  const { data: me, isLoading: meLoading } = useGetMe(1);
  const { data: cards, isLoading: cardsLoading } = useGetMyCards(1);
  const { data: achievements, isLoading: achLoading } = useGetMyAchievements(1);
  const { data: notifications } = useListNotifications(1, { limit: 20 });

  const gradeStyle = me?.grade ? GRADE_STYLES[me.grade] ?? GRADE_STYLES.rookie : GRADE_STYLES.rookie;
  const GradeIcon = gradeStyle.icon;

  const nextGradePoints: Record<string, number> = {
    rookie: 500, semi_pro: 2000, pro: 5000, elite: 15000, legend: Infinity
  };
  const gradeKeys = ["rookie", "semi_pro", "pro", "elite", "legend"];
  const currentGradeIdx = gradeKeys.indexOf(me?.grade ?? "rookie");
  const nextGrade = gradeKeys[currentGradeIdx + 1];
  const pointsToNext = nextGradePoints[me?.grade ?? "rookie"];
  const progress = me ? Math.min(100, ((me.points ?? 0) / pointsToNext) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-4xl font-bold tracking-tight text-white mb-1">마이페이지</h1>
        <p className="text-muted-foreground">내 야덕 등급과 수집 카드를 관리하세요</p>
      </header>

      {/* Profile Card */}
      {meLoading && <Skeleton className="h-48 w-full rounded-xl" />}
      {me && (
        <Card className="bg-card border-card-border overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary to-yellow-300" />
          <CardContent className="p-6">
            <div className="flex items-start gap-6 mb-6">
              <div className={`w-20 h-20 rounded-full ${gradeStyle.bg} border-2 flex items-center justify-center flex-shrink-0`}>
                <GradeIcon className={`w-10 h-10 ${gradeStyle.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-white">{me.username}</h2>
                  <Badge className={`${gradeStyle.bg} ${gradeStyle.color} border text-xs`}>{gradeStyle.label}</Badge>
                </div>
                <p className="text-muted-foreground text-sm mb-3">{me.bio ?? "소개글이 없습니다"}</p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-2xl font-black text-primary">{me.points?.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">포인트</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-2xl font-black text-white">{me.predictionAccuracy ?? 0}%</p>
                    <p className="text-xs text-muted-foreground">예측 적중률</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-2xl font-black text-white">{cards?.length ?? 0}</p>
                    <p className="text-xs text-muted-foreground">보유 카드</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Grade Progress */}
            {nextGrade && pointsToNext !== undefined && isFinite(pointsToNext) && (
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>{gradeStyle.label}</span>
                  <span>{(me.points ?? 0).toLocaleString()} / {pointsToNext.toLocaleString()}P → {GRADE_STYLES[nextGrade]?.label}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-yellow-400 transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="cards">
        <TabsList className="bg-muted/50 border border-border">
          <TabsTrigger value="cards" className="flex items-center gap-1.5"><CreditCard className="w-4 h-4" /> 선수 카드</TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-1.5"><Trophy className="w-4 h-4" /> 업적</TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1.5"><Bell className="w-4 h-4" /> 알림</TabsTrigger>
        </TabsList>

        {/* Player Cards */}
        <TabsContent value="cards" className="mt-4">
          {cardsLoading && <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-48 w-full" />)}</div>}
          {cards?.length === 0 && <div className="text-center py-12 text-muted-foreground">보유한 선수 카드가 없습니다<br /><span className="text-sm">예측 적중이나 커뮤니티 활동으로 카드를 획득하세요!</span></div>}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {cards?.map(card => (
              <div
                key={card.id}
                className={`relative rounded-xl border-2 bg-gradient-to-b ${RARITY_STYLES[card.rarity] ?? RARITY_STYLES.normal} p-4 flex flex-col items-center text-center hover:scale-105 transition-transform cursor-pointer`}
              >
                <Badge className={`absolute top-2 right-2 text-xs ${
                  card.rarity === "legendary" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                  card.rarity === "epic" ? "bg-purple-500/20 text-purple-400 border-purple-500/30" :
                  card.rarity === "rare" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                  "bg-gray-500/20 text-gray-400 border-gray-500/30"
                } border`}>{card.rarity}</Badge>
                <div className="w-16 h-16 rounded-full bg-muted/40 border-2 border-border flex items-center justify-center mb-3 mt-2 text-2xl font-black text-white">
                  {card.backNumber ?? "#"}
                </div>
                <p className="font-bold text-white text-sm mb-0.5">{card.playerName}</p>
                <p className="text-xs text-muted-foreground mb-2">{card.teamName}</p>
                <div className="grid grid-cols-2 gap-1 w-full text-xs">
                  <div className="bg-black/20 rounded p-1"><span className="text-muted-foreground">OVR</span><br /><span className="font-bold text-white">{card.overall}</span></div>
                  <div className="bg-black/20 rounded p-1"><span className="text-muted-foreground">POW</span><br /><span className="font-bold text-primary">{card.power}</span></div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Achievements */}
        <TabsContent value="achievements" className="mt-4">
          {achLoading && <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {achievements?.map(ach => (
              <div
                key={ach.id}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${ach.unlockedAt ? "bg-card border-card-border" : "bg-muted/20 border-border/30 opacity-60"}`}
              >
                <div className={`text-3xl w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${ach.unlockedAt ? "bg-primary/20 border border-primary/30" : "bg-muted/30 border-border"}`}>
                  {ach.unlockedAt ? ach.icon : <Lock className="w-5 h-5 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm">{ach.name}</p>
                  <p className="text-xs text-muted-foreground">{ach.description}</p>
                  {ach.unlockedAt && <p className="text-xs text-primary mt-0.5">달성: {new Date(ach.unlockedAt).toLocaleDateString("ko-KR")}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-primary">+{ach.points}P</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="mt-4 space-y-2">
          {notifications?.length === 0 && <div className="text-center py-12 text-muted-foreground">알림이 없습니다</div>}
          {notifications?.map(n => (
            <div key={n.id} className={`flex items-start gap-3 p-4 rounded-lg border transition-all ${!n.isRead ? "bg-primary/5 border-primary/20" : "bg-card border-card-border"}`}>
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!n.isRead ? "bg-primary" : "bg-muted"}`} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                <p className="text-xs text-muted-foreground mt-1">{timeAgo(n.createdAt)}</p>
              </div>
              <Badge variant={n.type === "achievement" ? "default" : "secondary"} className="text-xs flex-shrink-0">{n.type}</Badge>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
