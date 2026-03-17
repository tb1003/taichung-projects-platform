/**
 * 風格 2：極簡白卡 - 留白、柔和陰影、最少裝飾
 */
import { Link } from "wouter";
import { ArrowLeft, Phone, MessageCircle, MapPin } from "lucide-react";
import { DEMO_AGENT, buildVCardData, getDemoPhoto, getDemoIntro, type DemoAgentCard } from "./aboutTeamDemoData";
import AgentCardFullFields from "./AgentCardFullFields";

function downloadVCard(agent: DemoAgentCard) {
  const blob = new Blob([buildVCardData(agent)], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${agent.name}_名片.vcf`;
  a.click();
  URL.revokeObjectURL(url);
}

interface AboutTeamStyle2Props { agent?: DemoAgentCard }
export default function AboutTeamStyle2({ agent: agentProp }: AboutTeamStyle2Props) {
  const a = agentProp ?? DEMO_AGENT;
  const photo = getDemoPhoto(a);
  const intro = getDemoIntro(a);
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        <Link href={agentProp ? "/about" : "/demo/about-team"}>
          <a className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> {agentProp ? "返回關於我們" : "返回 Demo 列表"}
          </a>
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {/* 左：放大照片＋姓名職稱；右：五大服務優勢 */}
          <div className="p-6 flex flex-col sm:flex-row gap-6 sm:gap-8">
            <div className="flex flex-col items-center sm:items-start shrink-0">
              {photo && <img src={photo} alt={a.name} className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border border-slate-100 shadow-sm" />}
              {!photo && (
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-slate-100 flex items-center justify-center">
                  <span className="text-3xl font-bold text-slate-400">{a.name?.slice(0, 1) || "?"}</span>
                </div>
              )}
              <h1 className="text-xl font-semibold text-slate-900 mt-3 text-center sm:text-left">{a.name}</h1>
              {a.title && <p className="text-slate-500 text-sm mt-0.5 text-center sm:text-left">{a.title}</p>}
              {(a.storeName || a.storeSub) && (
                <p className="text-slate-400 text-xs mt-1 flex items-center justify-center sm:justify-start gap-1 text-center sm:text-left">
                  <MapPin className="w-3 h-3 shrink-0" />
                  {[a.storeName, a.storeSub].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-slate-700 mb-2">五大服務優勢</h2>
              {(a.serviceAdvantages && a.serviceAdvantages.filter(Boolean).length > 0) ? (
                <ul className="space-y-2">
                  {a.serviceAdvantages.filter(Boolean).map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">尚未填寫服務優勢</p>
              )}
            </div>
          </div>
          <div className="px-6 pb-6 space-y-3">
            {a.phone && (
              <a href={`tel:${a.phone}`} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors">
                <Phone className="w-4 h-4" /> {a.phone}
              </a>
            )}
            {(a.lineUrl || a.lineId) && (
              <a href={a.lineUrl || `https://line.me/ti/p/~${a.lineId}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#06C755] text-white text-sm font-medium hover:opacity-90 transition-opacity">
                <MessageCircle className="w-4 h-4" /> 加 LINE
              </a>
            )}
          </div>
          <div className="px-6 pb-8">
            {intro && <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{intro}</p>}
            {(a.tags || a.serviceAdvantages || []).filter(Boolean).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {(a.tags || a.serviceAdvantages || []).filter(Boolean).map((t, i) => (
                  <span key={i} className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">{String(t)}</span>
                ))}
              </div>
            )}
            <AgentCardFullFields agent={a} variant="light" />
            <button
              type="button"
              onClick={() => downloadVCard(a)}
              className="mt-6 w-full py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
            >
              存入手機聯絡人
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
