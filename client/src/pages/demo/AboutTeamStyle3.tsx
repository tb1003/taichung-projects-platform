/**
 * 風格 3：深色專業 - 沉穩商務、深灰／炭黑、金或白字
 */
import { Link } from "wouter";
import { ArrowLeft, Phone, MessageCircle, MapPin, Lightbulb } from "lucide-react";
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

interface AboutTeamStyle3Props { agent?: DemoAgentCard }
export default function AboutTeamStyle3({ agent: agentProp }: AboutTeamStyle3Props) {
  const a = agentProp ?? DEMO_AGENT;
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-md mx-auto px-4 py-8">
        <Link href={agentProp ? "/about" : "/demo/about-team"}>
          <a className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200 mb-6">
            <ArrowLeft className="w-4 h-4" /> {agentProp ? "返回關於我們" : "返回 Demo 列表"}
          </a>
        </Link>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="p-6 flex flex-col sm:flex-row gap-6 sm:gap-8">
            <div className="flex flex-col items-center sm:items-start shrink-0">
              {getDemoPhoto(a) && <img src={getDemoPhoto(a)} alt={a.name} className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover ring-2 ring-amber-500/50" />}
              {!getDemoPhoto(a) && (
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-slate-700 flex items-center justify-center ring-2 ring-amber-500/30">
                  <span className="text-3xl font-bold text-slate-500">{a.name?.slice(0, 1) || "?"}</span>
                </div>
              )}
              <h1 className="text-xl sm:text-2xl font-bold text-white mt-3 text-center sm:text-left">{a.name}</h1>
              {a.title && <p className="text-amber-400 text-sm mt-0.5 text-center sm:text-left">{a.title}</p>}
              {(a.storeName || a.storeSub) && (
                <p className="text-slate-400 text-xs mt-1 flex items-center gap-1 text-center sm:text-left">
                  <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                  {[a.storeName, a.storeSub].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-slate-300 mb-2">五大服務優勢</h2>
              {(a.serviceAdvantages && a.serviceAdvantages.filter(Boolean).length > 0) ? (
                <ul className="space-y-2">
                  {a.serviceAdvantages.filter(Boolean).map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">尚未填寫服務優勢</p>
              )}
            </div>
          </div>
          <div className="px-6 pb-6 flex gap-3">
            {a.phone && (
              <a href={`tel:${a.phone}`} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-amber-500 text-slate-900 font-semibold hover:bg-amber-400 transition-colors">
                <Phone className="w-4 h-4" /> 撥打
              </a>
            )}
            {(a.lineUrl || a.lineId) && (
              <a href={a.lineUrl || `https://line.me/ti/p/~${a.lineId}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#06C755] text-white font-semibold hover:opacity-90">
                <MessageCircle className="w-4 h-4" /> LINE
              </a>
            )}
          </div>
          <div className="px-6 pb-6">
            {getDemoIntro(a) && (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <h2 className="text-sm font-semibold text-slate-300">為什麼找我</h2>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">{getDemoIntro(a)}</p>
                {(a.tags || a.serviceAdvantages || []).filter(Boolean).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {(a.tags || a.serviceAdvantages || []).filter(Boolean).map((t, i) => (
                      <span key={i} className="text-xs text-amber-200/90 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">
                        {String(t)}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
            <AgentCardFullFields agent={a} variant="dark" />
            <button type="button" onClick={() => downloadVCard(a)} className="mt-6 w-full py-3.5 rounded-xl bg-slate-700 text-slate-200 font-medium border border-slate-600 hover:bg-slate-600">
              存入手機聯絡人
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
