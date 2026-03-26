/**
 * Design: 暖陽台中 - 在地溫暖品牌風格
 * Navbar: 永慶黃色調頂部導航，含品牌標識與快速連結（內容可由後台網站設定）
 */
import { Link, useLocation } from "wouter";
import { Menu, X, GitCompareArrows, Phone } from "lucide-react";
import { useState } from "react";
import { useCompare } from "@/contexts/CompareContext";
import { Button } from "@/components/ui/button";
import { useSiteContent } from "@/hooks/useSiteContent";

const DEFAULT_LINE = "https://line.me/R/ti/p/@368bruzx";

export default function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { items } = useCompare();
  const { data: site } = useSiteContent();
  const brandName = site?.navbar.brandName ?? "永慶不動產";
  const brandSub = site?.navbar.brandSub ?? "西屯未來店 | 陳學韜";
  const lineUrl = site?.navbar.lineUrl ?? DEFAULT_LINE;

  const navLinks = [
    { href: "/", label: "首頁" },
    { href: "/projects", label: "建案總覽" },
    { href: "/zones", label: "重劃區介紹" },
    { href: "/compare", label: "建案比較" },
    { href: "/tools", label: "房產工具" },
    { href: "/tools/notes", label: "五義地產筆記" },
    { href: "/about", label: "關於我們" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container flex items-center justify-between h-16">
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm" style={{ fontFamily: "DM Sans" }}>YC</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground leading-tight">{brandName}</span>
            <span className="text-[10px] text-muted-foreground leading-tight">{brandSub}</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.slice(0, 4).map((link) => (
            <Link key={link.href} href={link.href}>
              <span
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location === link.href
                    ? "bg-primary/10 text-primary-foreground font-semibold"
                    : "text-foreground/70 hover:text-foreground hover:bg-muted"
                }`}
                style={location === link.href ? { color: "#9a7b00" } : {}}
              >
                {link.label}
                {link.href === "/compare" && items.length > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-primary text-primary-foreground">
                    {items.length}
                  </span>
                )}
              </span>
            </Link>
          ))}
          <Link href="/market-trends">
            <span
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.startsWith("/market-trends")
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-foreground/70 hover:text-foreground hover:bg-muted"
              }`}
              style={location.startsWith("/market-trends") ? { color: "#9a7b00" } : {}}
            >
              市場動態
            </span>
          </Link>
          {navLinks.slice(4).map((link) => (
            <Link key={link.href} href={link.href}>
              <span
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location === link.href
                    ? "bg-primary/10 text-primary-foreground font-semibold"
                    : "text-foreground/70 hover:text-foreground hover:bg-muted"
                }`}
                style={location === link.href ? { color: "#9a7b00" } : {}}
              >
                {link.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2">
          <Button asChild size="sm" className="bg-[#06C755] hover:bg-[#05b34d] text-white gap-1.5 rounded-full px-4">
            <a href={lineUrl} target="_blank" rel="noopener noreferrer">
              <Phone className="w-3.5 h-3.5" />
              預約看屋
            </a>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <Link href="/compare">
            <span className="relative p-2">
              <GitCompareArrows className="w-5 h-5 text-foreground/70" />
              {items.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] font-bold rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </span>
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-foreground/70"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-white animate-in slide-in-from-top-2 duration-200">
          <nav className="container py-3 flex flex-col gap-1">
            {navLinks.slice(0, 4).map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${
                    location === link.href
                      ? "bg-primary/10 font-semibold"
                      : "text-foreground/70 hover:bg-muted"
                  }`}
                  style={location === link.href ? { color: "#9a7b00" } : {}}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </span>
              </Link>
            ))}
            <Link href="/market-trends" onClick={() => setMobileOpen(false)}>
              <span
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${
                  location.startsWith("/market-trends")
                    ? "bg-primary/10 font-semibold"
                    : "text-foreground/70 hover:bg-muted"
                }`}
                style={location.startsWith("/market-trends") ? { color: "#9a7b00" } : {}}
              >
                市場動態
              </span>
            </Link>
            {navLinks.slice(4).map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${
                    location === link.href
                      ? "bg-primary/10 font-semibold"
                      : "text-foreground/70 hover:bg-muted"
                  }`}
                  style={location === link.href ? { color: "#9a7b00" } : {}}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </span>
              </Link>
            ))}
            <Button asChild className="mt-2 w-full bg-[#06C755] hover:bg-[#05b34d] text-white gap-2 rounded-full">
              <a href={lineUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" />
                Line 預約看屋
              </a>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
