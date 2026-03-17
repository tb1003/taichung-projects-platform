/**
 * 業務管理（僅 owner）：列表、認證、電子名片狀態、新增業務
 */
import { useEffect, useState } from "react";
import { apiGetAgents, apiApproveAgent, apiSetECardStatus, apiRegister, type AgentSafe } from "./api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AgentsListPage() {
  const [agents, setAgents] = useState<AgentSafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newLineId, setNewLineId] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  const load = async () => {
    try {
      const { agents: list } = await apiGetAgents();
      setAgents(list);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "載入失敗");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await apiApproveAgent(id);
      toast.success("已認證通過");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "操作失敗");
    }
  };

  const handleECardStatus = async (id: string, status: string) => {
    try {
      await apiSetECardStatus(id, status);
      toast.success("已更新電子名片狀態");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "操作失敗");
    }
  };

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    if (!newPhone.trim() || !newPassword || !newName.trim() || !newCompany.trim() || !newLineId.trim()) {
      setAddError("請填寫所有必填欄位：行動電話、密碼、姓名、公司、LINE ID");
      return;
    }
    setAddLoading(true);
    try {
      await apiRegister({
        phone: newPhone.trim(),
        password: newPassword,
        name: newName.trim(),
        company: newCompany.trim(),
        lineId: newLineId.trim(),
        ...(newEmail.trim() ? { email: newEmail.trim() } : {}),
      });
      toast.success("已新增業務，請通知該同仁使用行動電話與密碼登入並填寫電子名片，再由您在此頁認證通過");
      setAddOpen(false);
      setNewPhone("");
      setNewPassword("");
      setNewName("");
      setNewCompany("");
      setNewLineId("");
      setNewEmail("");
      load();
    } catch (e) {
      setAddError(e instanceof Error ? e.message : "新增失敗");
    } finally {
      setAddLoading(false);
    }
  };

  if (loading) return <p className="text-slate-500">載入中…</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-slate-800">業務管理</h1>
        <Dialog open={addOpen} onOpenChange={(open) => { setAddOpen(open); if (!open) setAddError(""); }}>
          <DialogTrigger asChild>
            <Button type="button" variant="default" className="bg-amber-600 hover:bg-amber-700">
              新增業務
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新增業務</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-slate-500 mb-3">必填：行動電話、密碼、姓名、公司、LINE ID（同一電話或 LINE ID 不可重複）。建立後同仁可登入填寫電子名片，再由您在此頁認證通過。</p>
            <form onSubmit={handleAddAgent} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="new-agent-phone">行動電話（登入用）*</Label>
                <Input id="new-agent-phone" type="tel" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="同仁的行動電話" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-agent-password">初始密碼 *</Label>
                <Input id="new-agent-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="請設定初始密碼並轉知同仁" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-agent-name">姓名 *</Label>
                <Input id="new-agent-name" type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="同仁姓名" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-agent-company">公司 *</Label>
                <Input id="new-agent-company" type="text" value={newCompany} onChange={(e) => setNewCompany(e.target.value)} placeholder="公司名稱" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-agent-lineid">LINE ID *</Label>
                <Input id="new-agent-lineid" type="text" value={newLineId} onChange={(e) => setNewLineId(e.target.value)} placeholder="LINE ID" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-agent-email">信箱（選填，用於電子名片）</Label>
                <Input id="new-agent-email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="同仁的信箱" />
              </div>
              {addError && <p className="text-sm text-red-600">{addError}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                  取消
                </Button>
                <Button type="submit" disabled={addLoading}>
                  {addLoading ? "新增中…" : "新增"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left p-3 font-medium">行動電話 / 姓名</th>
              <th className="text-left p-3 font-medium">狀態</th>
              <th className="text-left p-3 font-medium">電子名片</th>
              <th className="text-left p-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {agents.length === 0 && (
              <tr><td colSpan={4} className="p-4 text-slate-500">尚無業務帳號</td></tr>
            )}
            {agents.map((a) => (
              <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-3">
                  <div>{(a as Record<string, unknown>).phone ?? (a.resume as Record<string, unknown>)?.phone ?? "—"}</div>
                  {(a.resume as Record<string, unknown>)?.name && (
                    <div className="text-slate-500">{(a.resume as Record<string, unknown>).name as string}</div>
                  )}
                </td>
                <td className="p-3">
                  <span className={a.status === "approved" ? "text-green-600" : "text-amber-600"}>
                    {a.status === "approved" ? "已認證" : "待認證"}
                  </span>
                </td>
                <td className="p-3">{a.eCardStatus === "published" ? "已顯示" : a.eCardStatus === "pending_review" ? "待審核" : "草稿"}</td>
                <td className="p-3 flex flex-wrap gap-2">
                  {a.status !== "approved" && (
                    <button
                      type="button"
                      onClick={() => handleApprove(a.id)}
                      className="px-2 py-1 rounded bg-green-600 text-white text-xs hover:bg-green-700"
                    >
                      認證通過
                    </button>
                  )}
                  {a.status === "approved" && a.eCardStatus === "pending_review" && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleECardStatus(a.id, "published")}
                        className="px-2 py-1 rounded bg-amber-600 text-white text-xs hover:bg-amber-700"
                      >
                        通過顯示
                      </button>
                      <button
                        type="button"
                        onClick={() => handleECardStatus(a.id, "draft")}
                        className="px-2 py-1 rounded bg-slate-200 text-slate-700 text-xs hover:bg-slate-300"
                      >
                        退回草稿
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
