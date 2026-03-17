import { useMemo } from 'react';

export interface SloganWithCategory {
  category: string;
  text: string;
}

export function useRandomSlogans(
  projectId: string | number,
  slogans: any = {}
): SloganWithCategory[] {
  return useMemo(() => {
    let sloganArray: SloganWithCategory[] = [];

    // 處理物件格式（分類結構）
    if (typeof slogans === 'object' && !Array.isArray(slogans)) {
      sloganArray = Object.entries(slogans)
        .filter(([, text]) => typeof text === 'string' && text.trim())
        .map(([category, text]) => ({ category, text: text as string }));
    }
    // 處理陣列格式（舊格式，無分類）
    else if (Array.isArray(slogans)) {
      sloganArray = slogans
        .filter((text) => typeof text === 'string' && text.trim())
        .map((text) => ({ category: '其他', text }));
    }

    if (sloganArray.length === 0) return [];
    if (sloganArray.length <= 3) return sloganArray;

    // 使用 projectId 作為種子進行偽隨機排序
    const seed = typeof projectId === 'string'
      ? projectId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      : projectId;

    const shuffled = [...sloganArray].sort((a, b) => {
      const hashA = (seed + a.text.charCodeAt(0)) % 100;
      const hashB = (seed + b.text.charCodeAt(0)) % 100;
      return hashA - hashB;
    });

    return shuffled.slice(0, 3);
  }, [projectId, slogans]);
}
