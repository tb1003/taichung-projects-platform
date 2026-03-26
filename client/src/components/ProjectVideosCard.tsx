import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { PlayCircle, ExternalLink } from "lucide-react";
import { extractYouTubeId, getYouTubeThumbUrl } from "@/lib/youtube";
import { loadYouTubeIframeAPI } from "@/lib/youtube-iframe-api";
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

  const itemsRef = useRef(items);
  itemsRef.current = items;
  const activeIdRef = useRef(activeId);
  activeIdRef.current = activeId;

  const playerId = useId().replace(/:/g, "");
  const playerIdAttr = `yt-player-${playerId}`;
  const playerRef = useRef<{
    loadVideoById: (id: string) => void;
    destroy: () => void;
    seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
    playVideo: () => void;
  } | null>(null);

  useEffect(() => {
    setActiveId(initial?.id ?? null);
  }, [initial?.id]);

  const active = items.find((v) => v.id === activeId) || initial;
  const activeYouTubeId = active ? (active.youtubeId || extractYouTubeId(active.url)) : null;
  const watchUrl =
    active && activeYouTubeId
      ? (String((active as YoutubeVideo).url || "").trim() || `https://www.youtube.com/watch?v=${activeYouTubeId}`)
      : "";

  const onEnded = useCallback(() => {
    const list = itemsRef.current;
    if (list.length === 0) return;
    const p = playerRef.current;
    if (list.length === 1) {
      p?.seekTo(0, true);
      p?.playVideo();
      return;
    }
    const cur = activeIdRef.current;
    const idx = Math.max(0, list.findIndex((v) => v.id === cur));
    const next = list[(idx + 1) % list.length];
    setActiveId(next.id);
  }, []);

  useEffect(() => {
    if (!items.length) {
      try {
        playerRef.current?.destroy();
      } catch {
        /* ignore */
      }
      playerRef.current = null;
      return;
    }
    if (!activeYouTubeId) return;

    let cancelled = false;

    const run = async () => {
      await loadYouTubeIframeAPI();
      if (cancelled) return;

      const w = window as Window & {
        YT: {
          Player: new (
            id: string,
            opts: {
              videoId: string;
              playerVars: Record<string, string | number>;
              events?: { onStateChange?: (e: { data: number }) => void };
            }
          ) => {
            loadVideoById: (id: string) => void;
            destroy: () => void;
            seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
            playVideo: () => void;
          };
          PlayerState: { ENDED: number };
        };
      };

      const origin = typeof window !== "undefined" ? window.location.origin : "";

      playerRef.current = new w.YT.Player(playerIdAttr, {
        videoId: activeYouTubeId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          rel: 0,
          playsinline: 1,
          modestbranding: 1,
          ...(origin ? { origin } : {}),
        },
        events: {
          onStateChange: (e) => {
            if (e.data === w.YT.PlayerState.ENDED) onEnded();
          },
        },
      });
    };

    void run();

    return () => {
      cancelled = true;
      try {
        playerRef.current?.destroy();
      } catch {
        /* ignore */
      }
      playerRef.current = null;
    };
  }, [activeYouTubeId, items.length, playerIdAttr, onEnded]);

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
              {watchUrl && (
                <a
                  className="text-xs text-primary hover:underline shrink-0 inline-flex items-center gap-1"
                  href={watchUrl}
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
              <div id={playerIdAttr} className="w-full h-full min-h-[200px]" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
                無法載入影片
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
