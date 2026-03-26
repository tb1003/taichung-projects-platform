/**
 * 動態載入 YouTube IFrame API（僅瀏覽器）。
 * 用於監聽播放結束、串接同建案多支影片等。
 */
let apiPromise: Promise<void> | null = null;

export function loadYouTubeIframeAPI(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  const w = window as Window & {
    YT?: { Player?: unknown; PlayerState?: { ENDED: number } };
    onYouTubeIframeAPIReady?: () => void;
  };

  if (w.YT?.Player) return Promise.resolve();
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve) => {
    const done = () => resolve();
    if (w.onYouTubeIframeAPIReady) {
      const old = w.onYouTubeIframeAPIReady;
      w.onYouTubeIframeAPIReady = () => {
        old();
        done();
      };
    } else {
      w.onYouTubeIframeAPIReady = done;
    }
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const first = document.getElementsByTagName("script")[0];
      first.parentNode?.insertBefore(tag, first);
    }
  });

  return apiPromise;
}
