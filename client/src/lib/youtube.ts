export function extractYouTubeId(input: string | undefined | null): string | null {
  const raw = String(input || "").trim();
  if (!raw) return null;

  if (/^[a-zA-Z0-9_-]{6,32}$/.test(raw)) return raw;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");
  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return id && /^[a-zA-Z0-9_-]{6,32}$/.test(id) ? id : null;
  }

  if (host.endsWith("youtube.com")) {
    const v = url.searchParams.get("v");
    if (v && /^[a-zA-Z0-9_-]{6,32}$/.test(v)) return v;
    const parts = url.pathname.split("/").filter(Boolean);
    const idx = parts.findIndex((p) => p === "shorts" || p === "embed");
    if (idx !== -1) {
      const id = parts[idx + 1];
      return id && /^[a-zA-Z0-9_-]{6,32}$/.test(id) ? id : null;
    }
  }

  return null;
}

export function getYouTubeThumbUrl(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

/**
 * 建案影片嵌入網址。
 * 注意：勿使用已棄用的參數（例如 vq=hd1080），否則部分瀏覽器會出現 YouTube「錯誤 153／影片播放器設定錯誤」。
 * loop 必須搭配 playlist=同一影片 id 才會循環。
 * 建議傳入目前網站的 origin（例如 http://localhost:5173），可減少部分環境下的嵌入錯誤。
 */
export function getYouTubeEmbedUrl(
  id: string,
  opts?: { autoplay?: boolean; mute?: boolean; loop?: boolean; origin?: string }
): string {
  const params = new URLSearchParams();
  params.set("rel", "0");
  params.set("playsinline", "1");
  params.set("modestbranding", "1");
  if (opts?.origin?.trim()) params.set("origin", opts.origin.trim());
  if (opts?.autoplay) params.set("autoplay", "1");
  if (opts?.mute) params.set("mute", "1");
  if (opts?.loop) {
    params.set("loop", "1");
    params.set("playlist", id);
  }
  // 使用 www.youtube.com/embed；nocookie 與過時參數組合曾導致 Error 153
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

/** 透過 noembed 取得 YouTube 影片標題（未填寫時可當預設標題） */
export async function fetchYouTubeTitle(videoId: string): Promise<string> {
  const url = `https://noembed.com/embed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("無法取得影片標題");
  const data = (await res.json()) as { title?: string };
  const title = data?.title?.trim();
  return title || "YouTube 影片";
}

