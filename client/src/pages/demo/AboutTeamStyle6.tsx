/**
 * 風格 6：橫條卡片 - 緊湊、多成員並列適用
 */
import { Link } from "wouter";
import { ArrowLeft, Phone, MessageCircle } from "lucide-react";
import { DEMO_AGENT, buildVCardData, getDemoPhoto, getDemoIntro, type DemoAgentCard } from "./aboutTeamDemoData";
import AgentCardFullFields from "./AgentCardFullFields";

function downloadVCard(agent: DemoAgentCard) {
  const blob = new Blob([buildVCardData(agent)], { type: "text/vcard;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${agent.name}_名片.vcf`;
  a.click();
  URL.revokeObjectURL(a.href);
}

interface AboutTeamStyle6Props { agent?: DemoAgentCard }
export default function AboutTeamStyle6({ agent: agentProp }: AboutTeamStyle6Props) {
  const a = agentProp ?? DEMO_AGENT;
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href={agentProp ? "/about" : "/demo/about-team"}>
          <a className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> {agentProp ? "返回關於我們" : "返回 Demo 列表"}
          </a>
        </Link>

        <h2 className="text-lg font-bold text-slate-800 mb-4">團隊介紹</h2>
        <div className="space-y-3">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 p-5">
            <div className="flex flex-col items-center sm:items-start shrink-0">
              {getDemoPhoto(a) && <img src={getDemoPhoto(a)} alt={a.name} className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border border-slate-100" />}
              {!getDemoPhoto(a) && (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-slate-400">{a.name?.slice(0, 1) || "?"}</span>
                </div>
              )}
              <h3 className="font-semibold text-slate-900 mt-2 text-center sm:text-left">{a.name}</h3>
              <p className="text-slate-500 text-xs mt-0.5 text-center sm:text-left">{a.title}{a.storeName ? ` · ${a.storeName}` : ""}</p>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xs font-bold text-slate-600 mb-2">五大服務優勢</h2>
              {(a.serviceAdvantages && a.serviceAdvantages.filter(Boolean).length > 0) ? (
                <ul className="space-y-1.5">
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
            <div className="flex flex-col gap-2 shrink-0 sm:border-l sm:border-slate-200 sm:pl-4">
              <a href={`tel:${a.phone}`} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 text-white text-xs font-medium hover:bg-slate-700">
                <Phone className="w-3.5 h-3.5" /> 撥打
              </a>
              <a href={a.lineUrl || `https://line.me/ti/p/~${a.lineId}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#06C755] text-white text-xs font-medium hover:opacity-90">
                <MessageCircle className="w-3.5 h-3.5" /> LINE
              </a>
            </div>
          </div>
        </div>
        {(a.tags || a.serviceAdvantages || []).filter(Boolean).length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {(a.tags || a.serviceAdvantages || []).filter(Boolean).map((t, i) => (
            <span key={i} className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">{String(t)}</span>
          ))}
        </div>
        )}
        <AgentCardFullFields agent={a} variant="light" />
        <button type="button" onClick={() => downloadVCard(a)} className="mt-6 py-2.5 px-5 rounded-lg border border-slate-300 text-slate-700 text-sm hover:bg-slate-50">
          存入手機聯絡人
        </button>
      </div>
    </div>
  );
}
