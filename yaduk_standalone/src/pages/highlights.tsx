import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useListHighlights, useLikeHighlight } from "@/api/api";
import { useQueryClient } from "@tanstack/react-query";
import { getListHighlightsQueryKey } from "@/api/api";
import { Play, Heart, Eye, X, Film, Shield, Zap } from "lucide-react";

const CATEGORIES = [
  { value: "all", label: "전체", icon: Film },
  { value: "legendary", label: "전설 경기", icon: Zap },
  { value: "walkoff_hr", label: "끝내기 홈런", icon: Zap },
  { value: "great_defense", label: "명수비", icon: Shield },
];

const catLabel: Record<string, string> = {
  all: "전체", legendary: "전설", walkoff_hr: "끝내기HR", great_defense: "명수비"
};

function VideoModal({ highlight, onClose }: { highlight: any; onClose: () => void }) {
  const qc = useQueryClient();
  const like = useLikeHighlight();

  const handleLike = () => {
    like.mutate({ id: highlight.id }, {
      onSuccess: () => qc.invalidateQueries({ queryKey: getListHighlightsQueryKey() })
    });
  };

  const embedId = highlight.videoUrl?.includes("watch?v=")
    ? highlight.videoUrl.split("watch?v=")[1].split("&")[0]
    : highlight.videoUrl?.split("/").pop();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-3xl bg-card rounded-xl border border-card-border p-4 mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-white text-lg truncate flex-1 mr-4">{highlight.title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-3 overflow-hidden">
          {embedId ? (
            <iframe
              src={`https://www.youtube.com/embed/${embedId}`}
              className="w-full h-full rounded-lg"
              allowFullScreen
              title={highlight.title}
            />
          ) : (
            <div className="text-muted-foreground text-sm">영상을 불러올 수 없습니다</div>
          )}
        </div>
        {highlight.description && <p className="text-sm text-muted-foreground mb-3">{highlight.description}</p>}
        <div className="flex items-center gap-4">
          <Button size="sm" variant="outline" onClick={handleLike} className="flex items-center gap-1 border-red-500/30 hover:bg-red-500/10 hover:text-red-400">
            <Heart className="w-4 h-4" /> {highlight.likes}
          </Button>
          <span className="flex items-center gap-1 text-sm text-muted-foreground"><Eye className="w-4 h-4" /> {highlight.views?.toLocaleString()}</span>
          <span className="text-sm text-muted-foreground">{highlight.uploaderName}</span>
        </div>
      </div>
    </div>
  );
}

export default function Highlights() {
  const [category, setCategory] = useState("all");
  const [selectedHighlight, setSelectedHighlight] = useState<any>(null);
  const qc = useQueryClient();
  const like = useLikeHighlight();

  const { data: highlights, isLoading } = useListHighlights({
    category: category === "all" ? undefined : (category as any),
    sort: "views",
    limit: 12,
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-4xl font-bold tracking-tight text-white mb-1">명장면 보관소</h1>
        <p className="text-muted-foreground">야구 역사에 남을 레전드 순간들</p>
      </header>

      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(c => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              category === c.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-white"
            }`}
          >
            <c.icon className="w-3.5 h-3.5" />
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading && [1,2,3,4,5,6].map(i => <Skeleton key={i} className="aspect-video w-full rounded-xl" />)}
        {highlights?.map(h => (
          <div
            key={h.id}
            className="group cursor-pointer bg-card rounded-xl border border-card-border overflow-hidden hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/10"
            onClick={() => setSelectedHighlight(h)}
          >
            <div className="relative aspect-video bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center overflow-hidden">
              {h.thumbnailUrl ? (
                <img src={h.thumbnailUrl} alt={h.title} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Film className="w-12 h-12" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center">
                  <Play className="w-7 h-7 text-primary-foreground ml-1" />
                </div>
              </div>
              <Badge className={`absolute top-2 left-2 text-xs border ${
                h.category === "legendary" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                h.category === "walkoff_hr" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                "bg-blue-500/20 text-blue-400 border-blue-500/30"
              }`}>{catLabel[h.category] ?? h.category}</Badge>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-white text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">{h.title}</h3>
              <p className="text-xs text-muted-foreground mb-2">{h.uploaderName}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {h.views?.toLocaleString()}</span>
                <button
                  className="flex items-center gap-1 hover:text-red-400 transition-colors"
                  onClick={e => {
                    e.stopPropagation();
                    like.mutate({ id: h.id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListHighlightsQueryKey() }) });
                  }}
                >
                  <Heart className="w-3 h-3" /> {h.likes?.toLocaleString()}
                </button>
              </div>
            </div>
          </div>
        ))}
        {highlights?.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">명장면이 없습니다</div>
        )}
      </div>

      {selectedHighlight && (
        <VideoModal highlight={selectedHighlight} onClose={() => setSelectedHighlight(null)} />
      )}
    </div>
  );
}
