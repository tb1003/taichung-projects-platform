/**
 * 業務維護總覽（僅 owner）：負責社區數、有維護數、圖/影片數、最近更新、維護度
 */
import { useEffect, useState } from "react";
import { apiGetMaintenance } from "./api";

type MaintenanceAgent = Awaited<ReturnType<typeof apiGetMaintenance>>["agents"][number];

export default function MaintenancePage() {
  const [data, setData] = useState<MaintenanceAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");

  useEffect(() => {
    apiGetMaintenance()
      .then((r) => setData(r.agents))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter ? data.filter((a) => a.grade === filter) : data;

  if (loading) return <p className="text-slate-500">載入中…</p>;

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-4">業務維護總覽</h1>
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setFilter("")}
          className={`px-3 py-1.5 rounded-lg text-sm ${filter === "" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-700"}`}
        >
          全部
        </button>
        {["積極", "一般", "待加強", "未開始"].map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setFilter(g)}
            className={`px-3 py-1.5 rounded-lg text-sm ${filter === g ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-700"}`}
          >
            {g}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left p-3 font-medium">姓名 / Email</th>
              <th className="text-left p-3 font-medium">負責社區數</th>
              <th className="text-left p-3 font-medium">有維護社區數</th>
              <th className="text-left p-3 font-medium">圖片 / 影片</th>
              <th className="text-left p-3 font-medium">最近更新</th>
              <th className="text-left p-3 font-medium">維護度</th>
              <th className="text-left p-3 font-medium">電子名片</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="p-4 text-slate-500">尚無資料</td></tr>
            )}
            {filtered.map((a) => (
              <tr key={a.agentId} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-3">
                  <div className="font-medium">{a.name || a.phone}</div>
                  <div className="text-slate-500 text-xs">{a.phone ?? "—"}</div>
                </td>
                <td className="p-3">{a.projectCount}</td>
                <td className="p-3">{a.maintainedProjectCount}</td>
                <td className="p-3">{a.imageCount} / {a.videoCount}</td>
                <td className="p-3 text-slate-600">
                  {a.lastActivityAt ? new Date(a.lastActivityAt).toLocaleDateString("zh-TW") : "—"}
                </td>
                <td className="p-3">
                  <span className={
                    a.grade === "積極" ? "text-green-600" :
                    a.grade === "一般" ? "text-slate-700" :
                    a.grade === "待加強" ? "text-amber-600" : "text-slate-400"
                  }>
                    {a.grade}
                  </span>
                </td>
                <td className="p-3">{a.eCardStatus === "published" ? "已顯示" : a.eCardStatus === "pending_review" ? "待審核" : "草稿"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.some((a) => a.projects?.length) && (
        <details className="mt-6">
          <summary className="cursor-pointer text-slate-700 font-medium">各業務負責社區明細</summary>
          <div className="mt-2 space-y-4">
            {data.map((a) => (
              <div key={a.agentId} className="bg-slate-50 rounded-lg p-4 text-sm">
                <div className="font-medium text-slate-800">{a.name || a.phone}</div>
                <ul className="mt-2 space-y-1 text-slate-600">
                  {a.projects?.map((p) => (
                    <li key={p.projectId}>
                      {p.projectName}（id: {p.projectId}）— 圖 {p.imageCount} / 影片 {p.videoCount}
                      {p.lastActivityAt && ` · 最後更新 ${new Date(p.lastActivityAt).toLocaleDateString("zh-TW")}`}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
