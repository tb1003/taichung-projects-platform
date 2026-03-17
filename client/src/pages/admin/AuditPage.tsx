/**
 * 後台：審計紀錄（owner 專用），顯示所有新增／修改／刪除的時間與操作者
 */
import { useEffect, useState } from "react";
import { apiGetAudit, type AuditEntry } from "./api";
import { ClipboardList } from "lucide-react";

const ACTION_LABEL: Record<string, string> = {
  create: "新增",
  update: "修改",
  delete: "刪除",
};

const ENTITY_LABEL: Record<string, string> = {
  "market-news": "市場動態",
  "site-content": "網站設定",
  kungfu: "五義地產筆記",
  project: "建案",
  zone: "重劃區",
  builder: "建設公司",
  "zone-name-map": "重劃區名稱對應表",
  "builder-name-map": "建設公司名稱對應表",
  "project-images": "建案圖片",
  "project-videos": "建案影片",
  "agent-approve": "業務審核",
  "agent-ecard": "業務電子名片",
  "agent-assign": "建案指派",
  "agent-me": "業務本人資料",
};

function formatAt(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("zh-TW", { dateStyle: "short", timeStyle: "medium" });
  } catch {
    return iso;
  }
}

function formatBy(by: string): string {
  if (by === "owner") return "管理員";
  if (by.startsWith("agent:")) return `業務 ${by.slice(6)}`;
  return by;
}

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    apiGetAudit(300)
      .then((r) => setEntries(r.entries))
      .catch((e) => setError(e.message ?? "載入失敗"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ClipboardList className="w-6 h-6 text-amber-600" />
        <h1 className="text-2xl font-bold">審計紀錄</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        後台所有新增、修改、刪除皆會記錄時間與操作者，僅管理員可查看。
      </p>
      {error && <p className="text-destructive text-sm">{error}</p>}
      {loading ? (
        <p className="text-muted-foreground">載入中…</p>
      ) : (
        <div className="rounded-lg border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium w-36">時間</th>
                <th className="text-left p-3 font-medium w-24">操作</th>
                <th className="text-left p-3 font-medium w-28">項目</th>
                <th className="text-left p-3 font-medium w-24">操作者</th>
                <th className="text-left p-3 font-medium">說明</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-muted-foreground text-center">
                    尚無紀錄
                  </td>
                </tr>
              ) : (
                entries.map((e, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-3 text-muted-foreground">{formatAt(e.at)}</td>
                    <td className="p-3">
                      <span
                        className={
                          e.action === "create"
                            ? "text-green-600"
                            : e.action === "delete"
                              ? "text-destructive"
                              : "text-amber-600"
                        }
                      >
                        {ACTION_LABEL[e.action] ?? e.action}
                      </span>
                    </td>
                    <td className="p-3">{ENTITY_LABEL[e.entity] ?? e.entity}</td>
                    <td className="p-3">{formatBy(e.by)}</td>
                    <td className="p-3 text-muted-foreground">
                      {e.entityId && <span className="text-foreground">{e.entityId}</span>}
                      {e.detail && (
                        <span>
                          {e.entityId ? " · " : ""}
                          {e.detail}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
