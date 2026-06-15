import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, User, Send, Sparkles, RefreshCw } from "lucide-react";

const SUGGESTED = [
  "오늘 경기 KBO 분석해줘",
  "이번 시즌 타격왕 예측해줘",
  "KIA vs LG 데이터 비교",
  "2024 드래프트 유망주 분석",
  "메이저리그 추신수 레전드 기록",
];

type Message = { id: number; role: "user" | "assistant"; content: string; timestamp: Date };

let idCounter = 0;
function nextId() { return ++idCounter; }

const RESPONSES: Record<string, string> = {
  default: "죄송해요, 야구 관련 질문에 집중하겠습니다! KBO나 MLB 선수, 팀, 경기 분석에 대해 물어보세요. 🔥",
};

async function fakeAiResponse(message: string): Promise<string> {
  await new Promise(r => setTimeout(r, 800 + Math.random() * 600));
  const lower = message.toLowerCase();
  if (lower.includes("kia") || lower.includes("기아")) return "KIA 타이거즈는 2024 시즌 강력한 타선을 바탕으로 우승 후보로 꼽히고 있습니다. 특히 최형우의 베테랑 리더십과 신인 투수들의 성장이 돋보입니다. 평균 팀 타율은 0.285로 리그 최고 수준이며, 홈런 생산력도 상위권입니다. 가을야구 진출 가능성은 매우 높습니다! ⚾";
  if (lower.includes("lg")) return "LG 트윈스는 안정적인 투수진과 균형 잡힌 타선으로 2연패를 노리고 있습니다. 불펜 평균 ERA가 3.2로 리그 최고 수준이며, 특히 마무리 고우석의 세이브 성공률은 90%를 넘습니다. 홈구장 잠실에서의 홈 승률이 특히 높아 포스트시즌에서도 강세를 보일 전망입니다.";
  if (lower.includes("홈런") || lower.includes("homerun")) return "올 시즌 홈런 예측 TOP 5입니다:\n\n1. 노시환 (한화) - OPS 1.012, 홈런 페이스 42개\n2. 최정 (SSG) - 통산 홈런 역대 1위, 현재 페이스 35개\n3. 로하스 (KT) - 외국인 타자 홈런 레이스 선두\n4. 페르난데스 (한화) - 우타 홈런 생산력 최상\n5. 채은성 (LG) - 중장거리 타자로 부상 💪";
  if (lower.includes("타율") || lower.includes("batting")) return "현재 타율 상위권 분석:\n\n🥇 이정후 스타일의 컨택 히터들이 주목받고 있습니다. 리그 평균 타율은 0.267이며, 0.330 이상 타자들이 진정한 타격왕 후보입니다. 선구안(BB/K)이 높은 타자들이 장기적으로 안정적인 타율을 유지하는 경향이 있습니다.";
  if (lower.includes("mlb") || lower.includes("메이저")) return "MLB 현황 분석:\n\n현재 한국인 메이저리거들의 성적이 주목받고 있습니다. 오타니 쇼헤이의 도저히 따라올 수 없는 퍼포먼스가 계속되고 있으며, 투수/타자 이도류 기록을 경신 중입니다. KBO 출신 선수들의 메이저리그 적응력도 점점 높아지는 추세입니다. ⚾🇺🇸";
  if (lower.includes("예측") || lower.includes("우승")) return "🏆 2025 KBO 우승팀 AI 예측:\n\n1위 KIA 타이거즈 (32.5%)\n2위 LG 트윈스 (28.1%)\n3위 삼성 라이온즈 (15.3%)\n4위 SSG 랜더스 (12.7%)\n5위 KT 위즈 (11.4%)\n\n분석 근거: 팀 ERA, 타선 OPS, 불펜 강도, 부상 이력, 구단 총 연봉 등 15개 지표를 종합했습니다.";
  return `"${message}"에 대한 분석입니다:\n\n야구 데이터는 단순한 숫자 이상의 이야기를 담고 있습니다. KBO는 10개 팀 144경기 시즌으로, 데이터 기반 분석이 점점 중요해지고 있습니다. 선수 WAR, FIP, wRC+ 같은 세이버메트릭스 지표를 활용하면 더 정확한 선수 평가가 가능합니다. 더 구체적인 선수나 팀에 대해 물어보시면 자세한 분석을 제공해드릴게요! 🔬⚾`;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: nextId(),
      role: "assistant",
      content: "안녕하세요! 저는 야덕연구소 AI 야구박사입니다. KBO, MLB 선수 분석, 경기 예측, 데이터 분석 등 야구에 관한 무엇이든 물어보세요! ⚾",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { id: nextId(), role: "user", content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const reply = await fakeAiResponse(text);
      const aiMsg: Message = { id: nextId(), role: "assistant", content: reply, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const reset = () => {
    setMessages([{
      id: nextId(), role: "assistant",
      content: "안녕하세요! 저는 야덕연구소 AI 야구박사입니다. KBO, MLB 선수 분석, 경기 예측, 데이터 분석 등 야구에 관한 무엇이든 물어보세요! ⚾",
      timestamp: new Date()
    }]);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">AI 야구박사</h1>
          <p className="text-muted-foreground text-sm">KBO·MLB 전문 AI 분석가와 대화하세요</p>
        </div>
        <Button size="sm" variant="outline" onClick={reset} className="flex items-center gap-1 border-border text-muted-foreground hover:text-white">
          <RefreshCw className="w-3.5 h-3.5" /> 새 대화
        </Button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {messages.map(msg => (
          <div key={msg.id} className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "assistant" ? "bg-primary/20 border border-primary/30" : "bg-muted border border-border"}`}>
              {msg.role === "assistant" ? <Bot className="w-4 h-4 text-primary" /> : <User className="w-4 h-4 text-foreground" />}
            </div>
            <div className={`max-w-[75%] rounded-xl p-3.5 ${msg.role === "assistant" ? "bg-card border border-card-border" : "bg-primary/10 border border-primary/20"}`}>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              <p className="text-xs text-muted-foreground mt-1.5">{msg.timestamp.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/20 border border-primary/30">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-card border border-card-border rounded-xl p-3.5">
              <div className="flex gap-1.5 items-center">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts */}
      {messages.length <= 1 && (
        <div className="flex gap-2 flex-wrap mb-3">
          {SUGGESTED.map(s => (
            <button key={s} onClick={() => sendMessage(s)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card text-xs text-muted-foreground hover:border-primary/40 hover:text-white transition-all">
              <Sparkles className="w-3 h-3 text-primary" /> {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="야구에 대해 무엇이든 물어보세요..."
          className="flex-1 bg-muted/40 border-border focus:border-primary/60"
          disabled={loading}
        />
        <Button type="submit" disabled={loading || !input.trim()} className="bg-primary text-primary-foreground hover:bg-primary/90 px-4">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
