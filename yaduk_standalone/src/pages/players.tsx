import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, TrendingUp, Award } from "lucide-react";
import { useListPlayers, useGetPlayer, useGetPlayerStats, useGetPlayerRecentGames } from "@/api/api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";

function PlayerDetail({ playerId, onBack }: { playerId: number; onBack: () => void }) {
  const { data: player } = useGetPlayer(playerId);
  const { data: stats } = useGetPlayerStats(playerId);
  const { data: recent } = useGetPlayerRecentGames(playerId);

  const chartData = recent?.slice().reverse().map((g, i) => ({
    date: g.date.slice(5),
    avg: g.battingAvg ? Number((g.battingAvg * 1000).toFixed(0)) : undefined,
    hr: g.homeRuns,
    era: g.era,
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <button onClick={onBack} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
        ← 목록으로
      </button>
      {player && (
        <div className="p-6 bg-card rounded-xl border border-card-border">
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black"
              style={{ background: `linear-gradient(135deg, ${player.teamColor || "#1a1a2e"}, #0a0e1a)` }}
            >
              {player.backNumber ?? "#"}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">{player.name}</h2>
              <p className="text-muted-foreground">{player.teamName} · {player.position}</p>
              <div className="flex gap-2 mt-2">
                {player.nationality !== "KR" && <Badge variant="outline">외국인</Badge>}
                <Badge className="bg-primary/20 text-primary border-primary/30">{player.position}</Badge>
              </div>
            </div>
          </div>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {player?.position !== "투수" ? [
            { label: "타율", value: stats.battingAvg?.toFixed(3) },
            { label: "홈런", value: stats.homeRuns },
            { label: "타점", value: stats.rbi },
            { label: "OPS", value: stats.ops?.toFixed(3) },
            { label: "WAR", value: stats.war?.toFixed(1) },
            { label: "출루율", value: stats.obp?.toFixed(3) },
            { label: "장타율", value: stats.slg?.toFixed(3) },
            { label: "경기", value: stats.games },
          ] : [
            { label: "ERA", value: stats.era?.toFixed(2) },
            { label: "승", value: stats.wins },
            { label: "패", value: stats.losses },
            { label: "WHIP", value: stats.whip?.toFixed(2) },
            { label: "WAR", value: stats.war?.toFixed(1) },
            { label: "이닝", value: stats.inningsPitched },
            { label: "경기", value: stats.games },
          ].map((s) => (
            <Card key={s.label} className="bg-muted/30 border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-black text-white">{s.value ?? "-"}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {stats?.aiReport && (
        <Card className="bg-card border-primary/30 border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-primary">AI 선수 분석 리포트</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{stats.aiReport}</p>
          </CardContent>
        </Card>
      )}

      {chartData && chartData.length > 0 && (
        <Card className="bg-card border-card-border">
          <CardContent className="p-4">
            <p className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> 최근 10경기 트렌드
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" tick={{ fill: "#aaa", fontSize: 11 }} />
                <YAxis tick={{ fill: "#aaa", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#0f1629", border: "1px solid #333", color: "#fff" }} />
                {player?.position !== "투수"
                  ? <Line type="monotone" dataKey="avg" stroke="#D4AF37" strokeWidth={2} dot={{ fill: "#D4AF37" }} name="타율x1000" />
                  : <Line type="monotone" dataKey="era" stroke="#D4AF37" strokeWidth={2} dot={{ fill: "#D4AF37" }} name="ERA" />
                }
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {recent && (
        <Card className="bg-card border-card-border">
          <CardContent className="p-4">
            <p className="text-sm font-bold text-white mb-3">최근 10경기 기록</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground text-xs border-b border-border">
                    <th className="text-left py-2">날짜</th>
                    <th className="text-center py-2">상대</th>
                    <th className="text-center py-2">결과</th>
                    {player?.position !== "투수" ? (
                      <>
                        <th className="text-center py-2">타수</th>
                        <th className="text-center py-2">안타</th>
                        <th className="text-center py-2">홈런</th>
                        <th className="text-center py-2">타점</th>
                      </>
                    ) : (
                      <>
                        <th className="text-center py-2">이닝</th>
                        <th className="text-center py-2">ERA</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {recent.map((g, i) => (
                    <tr key={i} className="border-b border-border/30 hover:bg-muted/20">
                      <td className="py-2 text-muted-foreground">{g.date}</td>
                      <td className="py-2 text-center">{g.opponent}</td>
                      <td className="py-2 text-center">
                        <span className={g.result === "승" ? "text-blue-400 font-bold" : "text-red-400 font-bold"}>{g.result}</span>
                      </td>
                      {player?.position !== "투수" ? (
                        <>
                          <td className="py-2 text-center text-white">{g.atBats ?? "-"}</td>
                          <td className="py-2 text-center text-white">{g.hits ?? "-"}</td>
                          <td className="py-2 text-center text-primary font-bold">{g.homeRuns ?? "-"}</td>
                          <td className="py-2 text-center text-white">{g.rbi ?? "-"}</td>
                        </>
                      ) : (
                        <>
                          <td className="py-2 text-center text-white">{g.inningsPitched ?? "-"}</td>
                          <td className="py-2 text-center text-white">{g.era ?? "-"}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function Players() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [query, setQuery] = useState("");

  const { data: players, isLoading } = useListPlayers({ search: query || undefined, limit: 30 });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(search);
  };

  if (selectedId) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <PlayerDetail playerId={selectedId} onBack={() => setSelectedId(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-1">선수 연구실</h1>
          <p className="text-muted-foreground">모든 선수의 세부 데이터를 분석하세요</p>
        </div>
        <form onSubmit={handleSearch} className="relative w-full md:w-72">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="선수 이름 검색..."
            className="pl-9 bg-muted/50 border-border"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </form>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading && [1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="h-40 w-full" />)}
        {players?.map((p) => (
          <Card
            key={p.id}
            className="bg-card border-card-border hover:border-primary/50 transition-all cursor-pointer group hover:shadow-lg hover:shadow-primary/10"
            onClick={() => setSelectedId(p.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black flex-shrink-0 transition-transform group-hover:scale-110"
                  style={{ background: `linear-gradient(135deg, ${p.teamColor || "#1a1a2e"}, #0a0e1a)` }}
                >
                  {p.backNumber ?? "#"}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-lg text-white truncate">{p.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">{p.teamName} · {p.position}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {p.position !== "투수" ? (
                  <>
                    <div><div className="text-xs text-muted-foreground">AVG</div><div className="font-bold text-white">{p.battingAvg?.toFixed(3) ?? "-"}</div></div>
                    <div><div className="text-xs text-muted-foreground">HR</div><div className="font-bold text-white">{p.homeRuns ?? "-"}</div></div>
                    <div><div className="text-xs text-muted-foreground">OPS</div><div className="font-bold text-white">{p.ops?.toFixed(3) ?? "-"}</div></div>
                    <div><div className="text-xs text-muted-foreground">WAR</div><div className="font-bold text-primary">{p.war?.toFixed(1) ?? "-"}</div></div>
                  </>
                ) : (
                  <>
                    <div><div className="text-xs text-muted-foreground">ERA</div><div className="font-bold text-white">{p.era?.toFixed(2) ?? "-"}</div></div>
                    <div><div className="text-xs text-muted-foreground">WAR</div><div className="font-bold text-primary">{p.war?.toFixed(1) ?? "-"}</div></div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {players?.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">검색 결과가 없습니다</div>
        )}
      </div>
    </div>
  );
}
