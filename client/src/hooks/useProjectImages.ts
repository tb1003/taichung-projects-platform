/**
 * 前台：取得建案圖片（外觀／公設／格局），從 API 讀取
 */
import { useEffect, useState } from "react";

export interface ProjectImages {
  exterior: string[];
  amenity: string[];
  layout: string[];
}

export function useProjectImages(projectId: number): { images: ProjectImages; loading: boolean } {
  const [images, setImages] = useState<ProjectImages>({ exterior: [], amenity: [], layout: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setImages({ exterior: [], amenity: [], layout: [] });
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/public/projects/${projectId}/images`)
      .then((res) => (res.ok ? res.json() : { exterior: [], amenity: [], layout: [] }))
      .then((data) => ({
        exterior: Array.isArray(data.exterior) ? data.exterior : [],
        amenity: Array.isArray(data.amenity) ? data.amenity : [],
        layout: Array.isArray(data.layout) ? data.layout : [],
      }))
      .then(setImages)
      .catch(() => setImages({ exterior: [], amenity: [], layout: [] }))
      .finally(() => setLoading(false));
  }, [projectId]);

  return { images, loading };
}
