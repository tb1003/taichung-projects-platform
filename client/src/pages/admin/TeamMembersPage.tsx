/**
 * 團隊成員管理（獨立頁面）：新增／編輯／刪除
 * 支援：多筆執照+證照圖、大頭照最多5張輪播、多平台店鋪自訂名稱、自我介紹、聯絡電話、座右銘、YT、成交/得獎/學歷/興趣/宗教/旅遊、電子名片樣式
 */
import { useEffect, useState, useRef } from "react";
import { apiGet, apiPut, apiUploadTeamImage } from "./api";
import type { SiteContent, TeamMemberInAbout } from "./SiteContentPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Users, Upload, X } from "lucide-react";

const MAX_PHOTOS = 5;
const INTRO_MAX = 250;
const E_CARD_STYLES = [
  { value: "1", label: "風格 1：原版參考" },
  { value: "2", label: "風格 2：極簡白卡" },
  { value: "3", label: "風格 3：深色專業" },
  { value: "4", label: "風格 4：暖陽品牌" },
  { value: "5", label: "風格 5：左圖右文" },
  { value: "6", label: "風格 6：橫條卡片" },
  { value: "7", label: "風格 7：Bento 網格" },
  { value: "8", label: "風格 8：時間軸" },
  { value: "9", label: "風格 9：玻璃擬態" },
  { value: "10", label: "風格 10：雜誌編輯" },
];

/** 全形 → 半形（數字、英文、空格），輸入可混用但顯示與儲存為半形 */
function toHalfWidth(str: string): string {
  if (!str) return str;
  return str.replace(/[\uFF01-\uFF5E\u3000]/g, (ch) => {
    if (ch === "\u3000") return " ";
    return String.fromCharCode(ch.charCodeAt(0) - 0xFEE0);
  });
}

function normalizeMember(m: TeamMemberInAbout): TeamMemberInAbout {
  const photos = m.photos?.length ? m.photos : (m.photo ? [m.photo] : []);
  const licenses = m.licenses?.length ? m.licenses : (m.license ? [{ text: m.license }] : []);
  const storeLinks = m.storeLinks?.length
    ? m.storeLinks
    : m.storeUrl || m.storeLabel
      ? [{ name: m.storeLabel || "店鋪", url: m.storeUrl || "" }]
      : [];
  return {
    ...m,
    photos: photos.slice(0, MAX_PHOTOS),
    licenses,
    storeLinks,
  };
}

const MAX_SERVICE_ADVANTAGES = 5;
const MAX_SERVICE_ADVANTAGE_LEN = 15;

function emptyForm(order: number): TeamMemberInAbout {
  return {
    name: "",
    title: "",
    order,
    licenses: [],
    photos: [],
    storeLinks: [],
    education: {},
    workExperience: [],
    serviceAdvantages: [],
    eCardStyle: "1",
  };
}

export default function TeamMembersPage() {
  const [data, setData] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState<"add" | "edit" | null>(null);
  const [editIndex, setEditIndex] = useState<number>(-1);
  const [form, setForm] = useState<TeamMemberInAbout>(emptyForm(0));
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [photoDropActive, setPhotoDropActive] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const licenseImageInputRef = useRef<HTMLInputElement>(null);

  const teamMembers = data?.about?.teamMembers ?? [];

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiGet<SiteContent>("/api/admin/site-content");
      setData(res);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "載入失敗");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveTeamMembers = async (members: TeamMemberInAbout[]) => {
    if (!data) return;
    setSaving(true);
    try {
      const ordered = members.map((m, i) => ({ ...m, order: i }));
      await apiPut("/api/admin/site-content", {
        ...data,
        about: { ...data.about, teamMembers: ordered },
      });
      setData((prev) =>
        prev ? { ...prev, about: { ...prev.about, teamMembers: ordered } } : null
      );
      toast.success("已儲存");
      setModalOpen(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "儲存失敗");
    } finally {
      setSaving(false);
    }
  };

  const openAdd = () => {
    setForm(emptyForm(teamMembers.length));
    setEditIndex(-1);
    setModalOpen("add");
  };

  const openEdit = (index: number) => {
    const m = normalizeMember(teamMembers[index] || emptyForm(index));
    setForm({ ...m, order: index });
    setEditIndex(index);
    setModalOpen("edit");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const intro = form.intro?.slice(0, INTRO_MAX) ?? "";
    const toSave = { ...form, intro: intro || undefined };
    if (modalOpen === "add") {
      saveTeamMembers([...teamMembers, toSave]);
    } else if (modalOpen === "edit" && editIndex >= 0) {
      const next = [...teamMembers];
      next[editIndex] = { ...toSave, order: editIndex };
      saveTeamMembers(next);
    }
  };

  const handleDelete = () => {
    if (deleteIndex == null) return;
    const next = teamMembers.filter((_, i) => i !== deleteIndex).map((m, i) => ({ ...m, order: i }));
    saveTeamMembers(next);
    setDeleteIndex(null);
  };

  const uploadPhoto = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("請選擇圖片檔案");
      return;
    }
    setUploading("photo");
    try {
      const { url } = await apiUploadTeamImage(file);
      setForm((f) => {
        const current = (f.photos || []).length;
        if (current >= MAX_PHOTOS) return f;
        return { ...f, photos: [...(f.photos || []).slice(0, MAX_PHOTOS - 1), url] };
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "上傳失敗");
    } finally {
      setUploading(null);
    }
  };

  const handlePhotoDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPhotoDropActive(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) {
      toast.error("請拖曳圖片檔案");
      return;
    }
    for (const file of files) {
      if (uploading) break;
      await uploadPhoto(file);
    }
  };

  const uploadLicenseImage = async (file: File, licenseIndex: number) => {
    setUploading(`license-${licenseIndex}`);
    try {
      const { url } = await apiUploadTeamImage(file);
      setForm((f) => {
        const licenses = [...(f.licenses || [])];
        if (!licenses[licenseIndex]) licenses[licenseIndex] = { text: "" };
        licenses[licenseIndex] = { ...licenses[licenseIndex], imageUrl: url };
        return { ...f, licenses };
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "上傳失敗");
    } finally {
      setUploading(null);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-slate-500">
        載入中…
      </div>
    );
  }

  const displayPhoto = (m: TeamMemberInAbout) =>
    (m.photos?.length && m.photos[0]) || m.photo || null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          團隊成員（電子名片）
        </h1>
        <Button type="button" onClick={openAdd} className="bg-amber-600 hover:bg-amber-700">
          <Plus className="w-4 h-4 mr-2" />
          新增成員
        </Button>
      </div>
      <p className="text-sm text-slate-500 mb-4">
        此處編輯的成員會顯示於前台「關於我們」頁的團隊介紹（電子名片）。可新增多筆執照與證照圖、大頭照最多 5 張輪播、多個平台店鋪（591／5168／好房網等）並自訂名稱；電子名片僅顯示有填寫的欄位。
      </p>

      {teamMembers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-10 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">尚無團隊成員</p>
          <Button type="button" variant="outline" className="mt-4" onClick={openAdd}>
            新增第一筆成員
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {teamMembers.map((m, i) => {
            const photo = displayPhoto(m);
            return (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                {photo ? (
                  <img
                    src={photo}
                    alt=""
                    className="w-14 h-14 rounded-full object-cover border border-slate-100"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                    <Users className="w-7 h-7 text-slate-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800">{m.name || "（未填姓名）"}</p>
                  <p className="text-sm text-slate-500">
                    {[m.title, m.phone, (m.licenses?.length || m.license) ? "執照" : ""]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button type="button" variant="outline" size="sm" onClick={() => openEdit(i)}>
                    <Pencil className="w-3.5 h-3.5 mr-1" />
                    編輯
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setDeleteIndex(i)}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    刪除
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 新增／編輯 Modal：可捲動 */}
      <Dialog open={modalOpen !== null} onOpenChange={(open) => !open && setModalOpen(null)}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{modalOpen === "add" ? "新增成員" : "編輯成員"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1 overflow-hidden">
            <div className="space-y-6 overflow-y-auto pr-2 pb-4">
              {/* 基本 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>姓名</Label>
                  <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="姓名" />
                </div>
                <div className="space-y-1.5">
                  <Label>職稱</Label>
                  <Input value={form.title ?? ""} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="例：資深店長" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>聯絡電話</Label>
                  <Input value={form.phone ?? ""} onChange={(e) => setForm((f) => ({ ...f, phone: toHalfWidth(e.target.value) }))} placeholder="例：0970-090-223" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Line 連結</Label>
                  <Input value={form.lineUrl ?? ""} onChange={(e) => setForm((f) => ({ ...f, lineUrl: toHalfWidth(e.target.value) }))} placeholder="https://line.me/..." />
                </div>
              </div>

              {/* 大頭照（最多 5 張） */}
              <div className="space-y-2">
                <Label>大頭照（最多 5 張，可輪播）</Label>
                <div className="flex flex-wrap gap-2">
                  {(form.photos || []).map((url, idx) => (
                    <div key={idx} className="relative">
                      <img src={url} alt="" className="w-16 h-16 rounded-lg object-cover border" />
                      <button
                        type="button"
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs"
                        onClick={() => setForm((f) => ({ ...f, photos: (f.photos || []).filter((_, i) => i !== idx) }))}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {(form.photos?.length ?? 0) < MAX_PHOTOS && (
                    <>
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) uploadPhoto(f);
                          e.target.value = "";
                        }}
                      />
                      <div
                        role="button"
                        tabIndex={0}
                        className={`w-24 min-h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
                          photoDropActive
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-slate-200 text-slate-400 hover:border-primary hover:text-primary"
                        } ${uploading === "photo" ? "opacity-60 pointer-events-none" : ""}`}
                        onClick={() => photoInputRef.current?.click()}
                        onKeyDown={(e) => e.key === "Enter" && photoInputRef.current?.click()}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setPhotoDropActive(true);
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setPhotoDropActive(false);
                        }}
                        onDrop={handlePhotoDrop}
                      >
                        {uploading === "photo" ? (
                          <span className="text-xs">上傳中…</span>
                        ) : (
                          <>
                            <Upload className="w-6 h-6" />
                            <span className="text-xs">點選或拖曳圖片</span>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 執照（可多筆 + 證照圖片） */}
              <div className="space-y-2">
                <Label>執照（可多筆，每筆可上傳證照圖片）</Label>
                {(form.licenses || []).map((lic, idx) => (
                  <div key={idx} className="flex gap-2 items-start p-2 rounded-lg border bg-slate-50/50">
                    <Input
                      value={lic.text}
                      onChange={(e) =>
                        setForm((f) => {
                          const licenses = [...(f.licenses || [])];
                          if (!licenses[idx]) licenses[idx] = { text: "" };
                          licenses[idx] = { ...licenses[idx], text: e.target.value };
                          return { ...f, licenses };
                        })
                      }
                      placeholder="例：103中市經字第1304號"
                      className="flex-1"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      {lic.imageUrl && (
                        <img src={lic.imageUrl} alt="" className="w-10 h-10 rounded object-cover" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id={`license-img-${idx}`}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) uploadLicenseImage(f, idx);
                          e.target.value = "";
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById(`license-img-${idx}`)?.click()}
                        disabled={uploading === `license-${idx}`}
                      >
                        {uploading === `license-${idx}` ? "上傳中" : "圖片"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() =>
                          setForm((f) => ({ ...f, licenses: (f.licenses || []).filter((_, i) => i !== idx) }))
                        }
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setForm((f) => ({ ...f, licenses: [...(f.licenses || []), { text: "" }] }))}
                >
                  新增一筆執照
                </Button>
              </div>

              {/* 店鋪／平台（多筆，自訂名稱+連結） */}
              <div className="space-y-2">
                <Label>店鋪／平台（591、5168、好房網、永慶房仲網等，自訂名稱+連結）</Label>
                {(form.storeLinks || []).map((s, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input
                      value={s.name}
                      onChange={(e) =>
                        setForm((f) => {
                          const storeLinks = [...(f.storeLinks || [])];
                          storeLinks[idx] = { ...storeLinks[idx], name: e.target.value };
                          return { ...f, storeLinks };
                        })
                      }
                      placeholder="店鋪名稱（例：591店鋪）"
                      className="w-36"
                    />
                    <Input
                      value={s.url}
                      onChange={(e) =>
                        setForm((f) => {
                          const storeLinks = [...(f.storeLinks || [])];
                          storeLinks[idx] = { ...storeLinks[idx], url: toHalfWidth(e.target.value) };
                          return { ...f, storeLinks };
                        })
                      }
                      placeholder="https://..."
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-600 shrink-0"
                      onClick={() =>
                        setForm((f) => ({ ...f, storeLinks: (f.storeLinks || []).filter((_, i) => i !== idx) }))
                      }
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setForm((f) => ({ ...f, storeLinks: [...(f.storeLinks || []), { name: "", url: "" }] }))}
                >
                  新增平台連結
                </Button>
              </div>

              {/* 自我介紹（250 字）、座右銘、YT */}
              <div className="space-y-2">
                <Label>自我介紹（250 字以內，支援 HTML／MD）</Label>
                <Textarea
                  value={form.intro ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, intro: e.target.value.slice(0, INTRO_MAX) }))}
                  rows={4}
                  placeholder="簡短自介"
                />
                <p className="text-xs text-slate-500">{(form.intro?.length ?? 0)} / {INTRO_MAX}</p>
              </div>
              <div className="space-y-1.5">
                <Label>座右銘</Label>
                <Input value={form.motto ?? ""} onChange={(e) => setForm((f) => ({ ...f, motto: e.target.value }))} placeholder="座右銘" />
              </div>
              <div className="space-y-1.5">
                <Label>YT 頻道連結</Label>
                <Input value={form.ytChannelUrl ?? ""} onChange={(e) => setForm((f) => ({ ...f, ytChannelUrl: toHalfWidth(e.target.value) }))} placeholder="https://youtube.com/..." />
              </div>

              {/* 歷史成交、得獎、學歷、興趣、宗教、旅遊 */}
              <div className="space-y-1.5">
                <Label>歷史成交紀錄</Label>
                <Textarea value={form.transactionHistory ?? ""} onChange={(e) => setForm((f) => ({ ...f, transactionHistory: e.target.value }))} rows={2} placeholder="可簡述" />
              </div>
              <div className="space-y-1.5">
                <Label>得獎紀錄</Label>
                <Input value={form.awards ?? ""} onChange={(e) => setForm((f) => ({ ...f, awards: e.target.value }))} placeholder="得獎紀錄" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(["elementary", "juniorHigh", "highSchool", "university", "department", "graduateSchool"] as const).map((key) => (
                  <div key={key} className="space-y-1">
                    <Label>
                      {key === "elementary" && "國小"}
                      {key === "juniorHigh" && "國中"}
                      {key === "highSchool" && "高中"}
                      {key === "university" && "大學"}
                      {key === "department" && "科系"}
                      {key === "graduateSchool" && "研究所"}
                    </Label>
                    <Input
                      value={form.education?.[key] ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          education: { ...(f.education || {}), [key]: e.target.value },
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
              {/* 工作經歷（可新增多筆） */}
              <div className="space-y-2">
                <Label>工作經歷</Label>
                {(form.workExperience ?? []).map((we, idx) => (
                  <div key={idx} className="flex flex-wrap items-start gap-2 p-3 rounded-lg border border-border bg-muted/30">
                    <Input
                      value={we.company ?? ""}
                      onChange={(e) =>
                        setForm((f) => {
                          const list = [...(f.workExperience || [])];
                          list[idx] = { ...list[idx], company: e.target.value };
                          return { ...f, workExperience: list };
                        })
                      }
                      placeholder="公司／單位"
                      className="w-36"
                    />
                    <Input
                      value={we.title ?? ""}
                      onChange={(e) =>
                        setForm((f) => {
                          const list = [...(f.workExperience || [])];
                          list[idx] = { ...list[idx], title: e.target.value };
                          return { ...f, workExperience: list };
                        })
                      }
                      placeholder="職稱"
                      className="w-28"
                    />
                    <Input
                      value={we.period ?? ""}
                      onChange={(e) =>
                        setForm((f) => {
                          const list = [...(f.workExperience || [])];
                          list[idx] = { ...list[idx], period: e.target.value };
                          return { ...f, workExperience: list };
                        })
                      }
                      placeholder="期間（例：2020-2023）"
                      className="w-32"
                    />
                    <Input
                      value={we.desc ?? ""}
                      onChange={(e) =>
                        setForm((f) => {
                          const list = [...(f.workExperience || [])];
                          list[idx] = { ...list[idx], desc: e.target.value };
                          return { ...f, workExperience: list };
                        })
                      }
                      placeholder="簡述"
                      className="flex-1 min-w-0"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-600 shrink-0"
                      onClick={() =>
                        setForm((f) => ({ ...f, workExperience: (f.workExperience || []).filter((_, i) => i !== idx) }))
                      }
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      workExperience: [...(f.workExperience || []), { company: "", title: "", period: "", desc: "" }],
                    }))
                  }
                >
                  新增一筆工作經歷
                </Button>
              </div>
              {/* 五大服務優勢（每項最多 15 字） */}
              <div className="space-y-2">
                <Label>五大服務優勢（每個標籤不超過 15 字）</Label>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: MAX_SERVICE_ADVANTAGES }, (_, i) => (
                    <Input
                      key={i}
                      value={form.serviceAdvantages?.[i] ?? ""}
                      onChange={(e) => {
                        const val = e.target.value.slice(0, MAX_SERVICE_ADVANTAGE_LEN);
                        setForm((f) => {
                          const arr = [...(f.serviceAdvantages || [])];
                          arr[i] = val;
                          return { ...f, serviceAdvantages: arr.slice(0, MAX_SERVICE_ADVANTAGES) };
                        });
                      }}
                      placeholder={`優勢 ${i + 1}`}
                      className="w-44"
                      maxLength={MAX_SERVICE_ADVANTAGE_LEN}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">最多 5 個，每個 15 字以內</p>
              </div>
              <div className="space-y-1.5">
                <Label>興趣與休閒</Label>
                <Input value={form.interests ?? ""} onChange={(e) => setForm((f) => ({ ...f, interests: e.target.value }))} placeholder="興趣與休閒" />
              </div>
              <div className="space-y-1.5">
                <Label>宗教</Label>
                <Input value={form.religion ?? ""} onChange={(e) => setForm((f) => ({ ...f, religion: e.target.value }))} placeholder="選填" />
              </div>
              <div className="space-y-1.5">
                <Label>旅遊心得</Label>
                <Textarea value={form.travelNotes ?? ""} onChange={(e) => setForm((f) => ({ ...f, travelNotes: e.target.value }))} rows={2} placeholder="旅遊心得" />
              </div>
              <div className="space-y-1.5">
                <Label>其他（自由發揮）</Label>
                <Textarea value={form.other ?? ""} onChange={(e) => setForm((f) => ({ ...f, other: e.target.value }))} rows={2} placeholder="其他想補充的內容" />
              </div>

              {/* 電子名片樣式 */}
              <div className="space-y-1.5">
                <Label>電子名片樣式</Label>
                <select
                  value={form.eCardStyle ?? "1"}
                  onChange={(e) => setForm((f) => ({ ...f, eCardStyle: e.target.value }))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {E_CARD_STYLES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter className="border-t pt-4 mt-4 shrink-0">
              <Button type="button" variant="outline" onClick={() => setModalOpen(null)}>
                取消
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "儲存中…" : "儲存"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteIndex !== null} onOpenChange={(open) => !open && setDeleteIndex(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確定要刪除此成員？</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteIndex != null && teamMembers[deleteIndex]?.name
                ? `「${teamMembers[deleteIndex].name}」將從團隊成員中移除。`
                : "此成員將從團隊成員中移除。"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              刪除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
