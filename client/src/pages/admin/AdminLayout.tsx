/**
 * 後台版面：側欄 + 登出；owner 與 agent 顯示不同選單
 * 小螢幕：漢堡按鈕 + Sheet 側欄；大螢幕（md+）：固定側欄
 */
import { useState, useEffect } from "react";
import { Link, useLocation, Redirect } from "wouter";
import { LayoutDashboard, Building2, MapPin, Users, FileText, ImageIcon, LogOut, UserCog, BarChart3, Newspaper, Sparkles, ClipboardList, Wrench, Info, UsersRound, Menu, PanelTop, PanelBottom, Home } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const ownerNav = [
  { href: "/admin", label: "首頁", icon: LayoutDashboard },
  { href: "/admin/projects", label: "建案總覽", icon: Building2 },
  { href: "/admin/project-images", label: "建案圖片及影片", icon: ImageIcon },
  { href: "/admin/zones", label: "重劃區介紹", icon: MapPin },
  { href: "/admin/market-news", label: "市場動態", icon: Newspaper },
  { href: "/admin/tool-blocks", label: "房產工具", icon: Wrench },
  { href: "/admin/kungfu", label: "五義地產筆記", icon: Sparkles },
  { href: "/admin/about", label: "關於我們", icon: Info },
  { href: "/admin/team-members", label: "團隊成員（電子名片）", icon: UsersRound },
  { href: "/admin/navbar", label: "頁首", icon: PanelTop },
  { href: "/admin/footer", label: "頁尾", icon: PanelBottom },
  { href: "/admin/home", label: "首頁內容", icon: Home },
  { href: "/admin/builders", label: "建設公司", icon: Users },
  { href: "/admin/mappings", label: "名稱對應表", icon: FileText },
  { href: "/admin/agents", label: "業務管理", icon: UserCog },
  { href: "/admin/maintenance", label: "維護總覽", icon: BarChart3 },
  { href: "/admin/audit", label: "審計紀錄", icon: ClipboardList },
];

const agentNav = [
  { href: "/admin/me", label: "我的資料與電子名片", icon: UserCog },
  { href: "/admin/project-images", label: "建案圖片及影片", icon: ImageIcon },
];

function getToken(): string | null {
  return sessionStorage.getItem("admin_token");
}

function getRole(): string | null {
  return sessionStorage.getItem("admin_role");
}

function NavContent({
  nav,
  location,
  onNavigate,
  onLogout,
}: {
  nav: typeof ownerNav;
  location: string;
  onNavigate?: () => void;
  onLogout: () => void;
}) {
  return (
    <>
      <nav className="flex-1 p-2 space-y-1 overflow-auto">
        {nav.map((item) => (
          <Link key={item.href} href={item.href}>
            <a
              onClick={onNavigate}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                location === item.href || (item.href !== "/admin" && location.startsWith(item.href.split("#")[0]))
                  ? "bg-amber-600 text-white"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </a>
          </Link>
        ))}
      </nav>
      <div className="p-2 border-t border-slate-700">
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
        >
          <LogOut className="w-4 h-4" />
          登出
        </button>
      </div>
    </>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const token = getToken();

  useEffect(() => {
    setSheetOpen(false);
  }, [location]);

  if (!token) {
    return <Redirect to="/admin/login" />;
  }

  const handleLogout = () => {
    sessionStorage.removeItem("admin_token");
    sessionStorage.removeItem("admin_role");
    window.location.href = "/admin/login";
  };

  const role = getRole();
  const nav = role === "agent" ? agentNav : ownerNav;
  const title = role === "agent" ? "業務後台" : "後台管理";

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* 小螢幕：漢堡 + Sheet 側欄 */}
      <div className="md:hidden flex items-center justify-between gap-2 h-14 px-4 bg-slate-800 text-white border-b border-slate-700 fixed top-0 left-0 right-0 z-40">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-white hover:bg-slate-700"
          onClick={() => setSheetOpen(true)}
          aria-label="開啟選單"
        >
          <Menu className="w-6 h-6" />
        </Button>
        <span className="font-bold text-lg">{title}</span>
        <div className="w-10" />
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="w-64 max-w-[85vw] p-0 border-0 bg-slate-800 text-white flex flex-col [&>button]:text-white [&>button]:right-3 [&>button]:top-3">
          <SheetTitle className="sr-only">{title}</SheetTitle>
          <div className="p-4 border-b border-slate-700">
            <span className="font-bold text-lg">{title}</span>
          </div>
          <NavContent nav={nav} location={location} onNavigate={() => setSheetOpen(false)} onLogout={handleLogout} />
        </SheetContent>
      </Sheet>

      {/* 大螢幕：固定側欄 */}
      <aside className="hidden md:flex w-56 shrink-0 bg-slate-800 text-white flex-col">
        <div className="p-4 border-b border-slate-700">
          <span className="font-bold text-lg">{title}</span>
        </div>
        <NavContent nav={nav} location={location} onLogout={handleLogout} />
      </aside>

      <main className="flex-1 overflow-auto p-4 md:p-6 pt-14 md:pt-6 min-h-screen">{children}</main>
    </div>
  );
}
