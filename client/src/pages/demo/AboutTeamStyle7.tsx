/**
 * 風格 7：Bento 網格 - 區塊拼貼、現代感
 */
import { Link } from "wouter";
import { ArrowLeft, Phone, MessageCircle, Lightbulb, Crown } from "lucide-react";
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

interface AboutTeamStyle7Props { agent?: DemoAgentCard }
export default function AboutTeamStyle7({ agent: agentProp }: AboutTeamStyle7Props) {
  const a = agentProp ?? DEMO_AGENT;
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href={agentProp ? "/about" : "/demo/about-team"}>
          <a className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> {agentProp ? "返回關於我們" : "返回 Demo 列表"}
          </a>
        </Link>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 rounded-2xl bg-white border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row gap-4">
            <div className="flex flex-col items-center sm:items-start shrink-0">
              {getDemoPhoto(a) && <img src={getDemoPhoto(a)} alt={a.name} className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover" />}
              {!getDemoPhoto(a) && (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-slate-400">{a.name?.slice(0, 1) || "?"}</span>
                </div>
              )}
              <h1 className="font-bold text-slate-900 mt-2 text-center sm:text-left">{a.name}</h1>
              <p className="text-slate-500 text-xs mt-0.5 text-center sm:text-left">{a.title}</p>
              <p className="text-slate-400 text-[11px] mt-1 text-center sm:text-left">{a.storeName}</p>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xs font-bold text-slate-700 mb-2">五大服務優勢</h2>
              {(a.serviceAdvantages && a.serviceAdvantages.filter(Boolean).length > 0) ? (
                <ul className="space-y-1.5">
                  {a.serviceAdvantages.filter(Boolean).map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">尚未填寫服務優勢</p>
              )}
            </div>
          </div>
          <div className="col-span-2 sm:col-span-1 rounded-2xl bg-slate-800 text-white p-6 flex flex-col justify-center gap-3 shadow-sm">
            <a href={`tel:${a.phone}`} className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-medium">
              <Phone className="w-4 h-4" /> 撥打
            </a>
            <a href={a.lineUrl || `https://line.me/ti/p/~${a.lineId}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#06C755] hover:opacity-90 text-sm font-medium">
              <MessageCircle className="w-4 h-4" /> LINE
            </a>
            <button type="button" onClick={() => downloadVCard(a)} className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/30 text-sm font-medium hover:bg-white/10">
              存入手機聯絡人
            </button>
          </div>
          <div className="col-span-2 rounded-2xl bg-blue-50 border border-blue-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-800">為什麼找我</h2>
            </div>
            {getDemoIntro(a) && <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{getDemoIntro(a)}</p>}
            {(a.tags || a.serviceAdvantages || []).filter(Boolean).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {(a.tags || a.serviceAdvantages || []).filter(Boolean).map((t, i) => (
                <span key={i} className="text-xs text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">{String(t)}</span>
              ))}
            </div>
            )}
          </div>
          <div className="col-span-2">
            <AgentCardFullFields agent={a} variant="light" />
          </div>
          {a.featuredListings && a.featuredListings.length > 0 && (
            <div className="col-span-2 rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-bold text-slate-800">精選好案</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {a.featuredListings.slice(0, 2).map((item) => (
                  <div key={item.id} className="rounded-xl overflow-hidden border border-slate-100">
                    <img src={item.image} alt="" className="w-full h-20 object-cover" />
                    <p className="text-xs font-medium text-slate-800 p-2 line-clamp-2">{item.title}</p>
                    <p className="text-amber-600 font-bold text-sm px-2 pb-2">{item.price}{item.priceUnit}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
