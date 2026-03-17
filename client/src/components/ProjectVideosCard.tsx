import { useEffect, useMemo, useState } from "react";
import { PlayCircle, ExternalLink } from "lucide-react";
import { extractYouTubeId, getYouTubeEmbedUrl, getYouTubeThumbUrl } from "@/lib/youtube";
import type { ProjectVideo } from "@/lib/types";

type YoutubeVideo = ProjectVideo & { platform: "youtube" };

function firstVisible(videos: ProjectVideo[]): ProjectVideo | null {
  const list = videos.filter((v) => v && (v.visible ?? true));
  return list.length ? list[0] : null;
}

export default function ProjectVideosCard({ videos }: { videos: ProjectVideo[] }) {
  const items = useMemo(() => (Array.isArray(videos) ? videos.filter((v) => (v.visible ?? true)) : []), [videos]);
  const initial = firstVisible(items);
  const [activeId, setActiveId] = useState<string | null>(initial?.id ?? null);

  useEffect(() => {
    setActiveId(initial?.id ?? null);
  }, [initial?.id]);

  const active = items.find((v) => v.id === activeId) || initial;
  const activeYouTubeId = active ? (active.youtubeId || extractYouTubeId(active.url)) : null;
  const iframeSrc = activeYouTubeId
    ? getYouTubeEmbedUrl(activeYouTubeId, { autoplay: true, mute: true, loop: true })
    : "";

  if (!items.length) return null;

  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-4">
      <div className="flex items-center gap-2">
        <PlayCircle className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-card-foreground">建案影片</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left list */}
        <div className="md:col-span-1 space-y-2 max-h-[340px] overflow-auto pr-1">
          {items.map((v) => {
            const ytId = v.youtubeId || extractYouTubeId(v.url);
            const thumb = ytId ? getYouTubeThumbUrl(ytId) : null;
            const isActive = v.id === (active?.id ?? "");
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setActiveId(v.id)}
                className={`w-full text-left flex gap-3 rounded-lg border px-3 py-2 transition-colors ${
                  isActive ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                }`}
              >
                <div className="w-20 h-12 rounded-md overflow-hidden bg-muted shrink-0 border border-border/50">
                  {thumb ? (
                    <img src={thumb} alt="" className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <PlayCircle className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-card-foreground line-clamp-2">{v.title}</p>
                  {v.desc && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{v.desc}</p>}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right player */}
        <div className="md:col-span-2 space-y-2">
          {active && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-card-foreground truncate">{active.title}</p>
              {(active as YoutubeVideo).url && (
                <a
                  className="text-xs text-primary hover:underline shrink-0 inline-flex items-center gap-1"
                  href={(active as YoutubeVideo).url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  在 YouTube 開啟
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          <div className="rounded-xl overflow-hidden border border-border bg-muted aspect-video">
            {activeYouTubeId ? (
              <iframe
                key={iframeSrc}
                src={iframeSrc}
                className="w-full h-full"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                title={active?.title || "YouTube video"}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
                無法載入影片
              </div>
            )}
          </div>

          <p className="text-[11px] text-muted-foreground">
            影片將自動播放、靜音並循環播放。若未自動播放，請點擊播放器開始播放。
          </p>
        </div>
      </div>
    </div>
  );
}

