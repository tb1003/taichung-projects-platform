/**
 * 後台登入：管理員（帳號+密碼）或業務（行動電話+密碼），成功後寫入 token/role 並跳轉
 */
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { apiLogin } from "./api";

type Mode = "owner" | "agent";

export default function AdminLogin() {
  const [mode, setMode] = useState<Mode>("owner");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body = mode === "agent" ? { phone: phone.trim(), password } : { username: username.trim(), password };
      const result = await apiLogin(body);
      if (result.ok) {
        // 業務未認證或需填寫電子名片時導向「我的資料與電子名片」，否則進後台首頁
        const agent = result.agent as { status?: string; eCardStatus?: string; resume?: Record<string, unknown> } | undefined;
        const isPending = agent?.status === "pending";
        const needCompleteECard = result.role === "agent" && (isPending || (agent?.eCardStatus === "draft" && !agent?.resume?.name));
        setLocation(needCompleteECard ? "/admin/me" : "/admin");
        return;
      }
      setError(result.error || "登入失敗");
    } catch (err) {
      setError(err instanceof Error ? err.message : "連線錯誤");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-800">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h1 className="text-xl font-bold text-slate-800 mb-2">後台登入</h1>
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setMode("owner")}
            className={`flex-1 py-1.5 rounded-lg text-sm font-medium ${mode === "owner" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-600"}`}
          >
            管理員
          </button>
          <button
            type="button"
            onClick={() => setMode("agent")}
            className={`flex-1 py-1.5 rounded-lg text-sm font-medium ${mode === "agent" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-600"}`}
          >
            業務
          </button>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          {mode === "owner" ? "請輸入管理員帳號與密碼" : "請輸入業務行動電話與密碼。業務帳號需經管理員認證且完成基本資料後才能登入。"}
        </p>
        <form onSubmit={handleSubmit}>
          {mode === "owner" && (
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="管理員帳號"
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 mb-3"
            />
          )}
          {mode === "agent" && (
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="行動電話"
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 mb-3"
            />
          )}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="密碼"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
            autoFocus={mode === "owner"}
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full py-2 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 disabled:opacity-50"
          >
            {loading ? "登入中…" : "登入"}
          </button>
        </form>
        {mode === "agent" && (
          <p className="mt-4 text-center text-sm text-slate-500">
            尚未註冊？{" "}
            <Link href="/admin/register"><a className="text-amber-600 hover:underline">業務註冊</a></Link>
          </p>
        )}
      </div>
    </div>
  );
}
