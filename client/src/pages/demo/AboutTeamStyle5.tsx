/**
 * 風格 5：左圖右文 - 橫向資訊卡、大頭照在左
 */
import { Link } from "wouter";
import { ArrowLeft, Phone, MessageCircle, MapPin } from "lucide-react";
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

interface AboutTeamStyle5Props { agent?: DemoAgentCard }
export default function AboutTeamStyle5({ agent: agentProp }: AboutTeamStyle5Props) {
  const a = agentProp ?? DEMO_AGENT;
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href={agentProp ? "/about" : "/demo/about-team"}>
          <a className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> {agentProp ? "返回關於我們" : "返回 Demo 列表"}
          </a>
        </Link>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col sm:flex-row">
          <div className="sm:w-2/5 bg-slate-100 flex flex-col items-center justify-center p-6 sm:p-8">
            {getDemoPhoto(a) && <img src={getDemoPhoto(a)} alt={a.name} className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl object-cover shadow-md" />}
            {!getDemoPhoto(a) && (
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-slate-200 flex items-center justify-center">
                <span className="text-4xl font-bold text-slate-400">{a.name?.slice(0, 1) || "?"}</span>
              </div>
            )}
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-4 text-center">{a.name}</h1>
            {a.title && <p className="text-slate-500 text-sm mt-0.5 text-center">{a.title}</p>}
            {(a.storeName || a.storeSub) && (
              <p className="text-slate-400 text-xs mt-2 flex items-center gap-1 text-center">
                <MapPin className="w-3 h-3 shrink-0" />
                {a.storeName} · {a.storeSub}
              </p>
            )}
          </div>
          <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center">
            <h2 className="text-sm font-bold text-slate-700 mb-2">五大服務優勢</h2>
            {(a.serviceAdvantages && a.serviceAdvantages.filter(Boolean).length > 0) ? (
              <ul className="space-y-2 mb-4">
                {a.serviceAdvantages.filter(Boolean).map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 mb-4">尚未填寫服務優勢</p>
            )}
            <div className="flex flex-wrap gap-2 mt-0">
              <a href={`tel:${a.phone}`} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-medium hover:bg-slate-700">
                <Phone className="w-4 h-4" /> {a.phone}
              </a>
              <a href={a.lineUrl || `https://line.me/ti/p/~${a.lineId}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#06C755] text-white text-sm font-medium hover:opacity-90">
                <MessageCircle className="w-4 h-4" /> LINE
              </a>
            </div>
            {getDemoIntro(a) && <p className="text-slate-600 text-sm mt-4 leading-relaxed whitespace-pre-line">{getDemoIntro(a)}</p>}
            {(a.tags || a.serviceAdvantages || []).filter(Boolean).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {(a.tags || a.serviceAdvantages || []).filter(Boolean).map((t, i) => (
                <span key={i} className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">{String(t)}</span>
              ))}
            </div>
            )}
            <AgentCardFullFields agent={a} variant="light" />
            <button type="button" onClick={() => downloadVCard(a)} className="mt-6 w-full sm:w-auto py-2.5 px-6 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50">
              存入手機聯絡人
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
