/**
 * 風格 10：雜誌編輯 - 大標、留白、個人品牌感
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

interface AboutTeamStyle10Props { agent?: DemoAgentCard }
export default function AboutTeamStyle10({ agent: agentProp }: AboutTeamStyle10Props) {
  const a = agentProp ?? DEMO_AGENT;
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-12 sm:py-20">
        <Link href={agentProp ? "/about" : "/demo/about-team"}>
          <a className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-12">
            <ArrowLeft className="w-4 h-4" /> {agentProp ? "返回關於我們" : "返回 Demo 列表"}
          </a>
        </Link>

        <div className="space-y-16">
          <header className="flex flex-col sm:flex-row gap-8 sm:gap-12 items-start">
            <div className="flex flex-col items-center sm:items-start shrink-0">
              {getDemoPhoto(a) && <img src={getDemoPhoto(a)} alt={a.name} className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover" />}
              {!getDemoPhoto(a) && (
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-slate-200 flex items-center justify-center">
                  <span className="text-4xl font-black text-slate-400">{a.name?.slice(0, 1) || "?"}</span>
                </div>
              )}
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-4 text-center sm:text-left">
                {a.name}
              </h1>
              <p className="text-xl text-slate-500 font-medium mt-1 text-center sm:text-left">{a.title}</p>
              <p className="text-slate-400 mt-0.5 text-center sm:text-left">{a.storeName} · {a.storeSub}</p>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-slate-700 mb-3">五大服務優勢</h2>
              {(a.serviceAdvantages && a.serviceAdvantages.filter(Boolean).length > 0) ? (
                <ul className="space-y-2">
                  {a.serviceAdvantages.filter(Boolean).map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">尚未填寫服務優勢</p>
              )}
            </div>
          </header>

          <div className="border-t border-slate-200 pt-12">
            {getDemoIntro(a) && (
              <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-line text-center max-w-xl mx-auto">
                {getDemoIntro(a)}
              </p>
            )}
            {(a.tags || a.serviceAdvantages || []).filter(Boolean).length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {(a.tags || a.serviceAdvantages || []).filter(Boolean).map((t, i) => (
                <span key={i} className="text-sm text-slate-500 border border-slate-200 px-4 py-2 rounded-full">
                  {String(t)}
                </span>
              ))}
            </div>
            )}
          </div>

          <AgentCardFullFields agent={a} variant="light" />

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {a.phone && (
            <a href={`tel:${a.phone}`} className="inline-flex items-center justify-center gap-2 py-4 px-8 rounded-full bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors">
              <Phone className="w-5 h-5" /> 撥打
            </a>
            )}
            {(a.lineUrl || a.lineId) && (
            <a href={a.lineUrl || `https://line.me/ti/p/~${a.lineId}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 py-4 px-8 rounded-full border-2 border-slate-900 text-slate-900 font-semibold hover:bg-slate-50 transition-colors">
              <MessageCircle className="w-5 h-5" /> 加 LINE
            </a>
            )}
          </div>

          <div className="pt-8">
            <button type="button" onClick={() => downloadVCard(a)} className="w-full sm:w-auto block sm:inline-block text-center py-3 px-8 rounded-full border border-slate-300 text-slate-600 font-medium hover:bg-slate-50">
              存入手機聯絡人
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
