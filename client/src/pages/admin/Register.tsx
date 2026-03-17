/**
 * 業務註冊：必填行動電話（登入用）、密碼、姓名、公司、聯絡電話、LINE ID；選填名片（可選擇圖片／拍照／拖曳上傳）；送出後待管理員認證
 */
import { useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { apiRegister, apiUploadRegisterCard } from "./api";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

const inputClass = "w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 mb-3";

export default function AdminRegister() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [lineId, setLineId] = useState("");
  const [email, setEmail] = useState("");
  const [cardImageUrl, setCardImageUrl] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("請選擇圖片檔案");
      return;
    }
    setError("");
    setUploading(true);
    try {
      const { url } = await apiUploadRegisterCard(file);
      setCardImageUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "上傳失敗");
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) uploadFile(f);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) uploadFile(f);
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const onDragLeave = () => setDragOver(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiRegister({
        phone: phone.trim(),
        password,
        name: name.trim(),
        company: company.trim(),
        lineId: lineId.trim(),
        ...(email.trim() ? { email: email.trim() } : {}),
        ...(cardImageUrl.trim() ? { cardImageUrl: cardImageUrl.trim() } : {}),
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "註冊失敗");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-800">
        <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl text-center">
          <p className="text-slate-800 font-medium">註冊成功</p>
          <p className="text-sm text-slate-500 mt-2">請填寫電子名片，完成後送出審核。認證通過後即可使用完整後台功能。</p>
          <button
            type="button"
            onClick={() => setLocation("/admin/me")}
            className="mt-4 w-full py-2 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700"
          >
            填寫電子名片
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-800">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h1 className="text-xl font-bold text-slate-800 mb-2">業務註冊</h1>
        <p className="text-sm text-slate-500 mb-4">必填：行動電話、密碼、姓名、公司、LINE ID。同一電話或 LINE ID 不可重複註冊。送出後可立即填寫電子名片。</p>
        <form onSubmit={handleSubmit} className="space-y-0">
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="行動電話（登入用）*" required className={inputClass} />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="密碼 *" required className={inputClass} />
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="姓名 *" required className={inputClass} />
          <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="公司 *" required className={inputClass} />
          <input type="text" value={lineId} onChange={(e) => setLineId(e.target.value)} placeholder="LINE ID *" required className={inputClass} />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="信箱（選填，用於電子名片）" className={inputClass} />

          <div className="mb-3">
            <span className="block text-sm text-slate-600 mb-1">名片（選填）</span>
            <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={onFileChange} />
            <input type="file" ref={cameraInputRef} accept="image/*" capture="environment" className="hidden" onChange={onFileChange} />
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${dragOver ? "border-amber-500 bg-amber-50" : "border-slate-300 bg-slate-50"}`}
            >
              {cardImageUrl ? (
                <div className="space-y-2">
                  <img src={cardImageUrl.startsWith("http") ? cardImageUrl : `${API_BASE}${cardImageUrl}`} alt="名片預覽" className="max-h-32 mx-auto object-contain rounded" />
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="text-sm py-1.5 px-3 rounded bg-slate-200 text-slate-700 hover:bg-slate-300 disabled:opacity-50">更換圖片</button>
                    <button type="button" onClick={() => setCardImageUrl("")} className="text-sm py-1.5 px-3 rounded bg-red-100 text-red-700 hover:bg-red-200">移除</button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-slate-500 mb-2">拖曳圖片到這裡，或</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="text-sm py-1.5 px-3 rounded bg-amber-100 text-amber-800 hover:bg-amber-200 disabled:opacity-50">選擇圖片</button>
                    <button type="button" onClick={() => cameraInputRef.current?.click()} disabled={uploading} className="text-sm py-1.5 px-3 rounded bg-amber-100 text-amber-800 hover:bg-amber-200 disabled:opacity-50">拍照上傳</button>
                  </div>
                  {uploading && <p className="text-xs text-slate-500 mt-2">上傳中…</p>}
                </>
              )}
            </div>
          </div>

          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full py-2 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 disabled:opacity-50"
          >
            {loading ? "送出中…" : "註冊"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          <Link href="/admin/login"><a className="text-amber-600 hover:underline">返回登入</a></Link>
        </p>
      </div>
    </div>
  );
}
