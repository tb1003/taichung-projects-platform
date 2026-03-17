/**
 * 風格 4：暖陽品牌 - 琥珀／暖棕、與本站品牌一致
 */
import { Link } from "wouter";
import { ArrowLeft, Phone, MessageCircle, MapPin, Star } from "lucide-react";
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

interface AboutTeamStyle4Props { agent?: DemoAgentCard }
export default function AboutTeamStyle4({ agent: agentProp }: AboutTeamStyle4Props) {
  const a = agentProp ?? DEMO_AGENT;
  return (
    <div className="min-h-screen bg-amber-50/80">
      <div className="max-w-md mx-auto px-4 py-8">
        <Link href={agentProp ? "/about" : "/demo/about-team"}>
          <a className="inline-flex items-center gap-1 text-sm text-amber-800/70 hover:text-amber-900 mb-6">
            <ArrowLeft className="w-4 h-4" /> {agentProp ? "返回關於我們" : "返回 Demo 列表"}
          </a>
        </Link>

        <div className="bg-white rounded-2xl shadow-md border border-amber-100 overflow-hidden">
          <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 p-6 flex flex-col sm:flex-row gap-6 sm:gap-8">
            <div className="flex flex-col items-center sm:items-start shrink-0">
              {getDemoPhoto(a) && <img src={getDemoPhoto(a)} alt={a.name} className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-amber-200/80 shadow-sm" />}
              {!getDemoPhoto(a) && (
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-amber-100 flex items-center justify-center border-4 border-amber-200/50">
                  <span className="text-3xl font-bold text-amber-600">{a.name?.slice(0, 1) || "?"}</span>
                </div>
              )}
              <h1 className="text-xl font-bold text-amber-900 mt-3 text-center sm:text-left">{a.name}</h1>
              {a.title && <p className="text-amber-700 text-sm mt-0.5 text-center sm:text-left">{a.title}</p>}
              {(a.storeName || a.storeSub) && (
                <p className="text-amber-600/80 text-xs mt-1 flex items-center gap-1 text-center sm:text-left">
                  <MapPin className="w-3 h-3 shrink-0" />
                  {[a.storeName, a.storeSub].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-amber-800 mb-2">五大服務優勢</h2>
              {(a.serviceAdvantages && a.serviceAdvantages.filter(Boolean).length > 0) ? (
                <ul className="space-y-2">
                  {a.serviceAdvantages.filter(Boolean).map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
                      <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-amber-700/80">尚未填寫服務優勢</p>
              )}
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex gap-3">
              {a.phone && (
              <a href={`tel:${a.phone}`} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-700 transition-colors">
                <Phone className="w-4 h-4" /> 撥打
              </a>
              )}
              {(a.lineUrl || a.lineId) && (
              <a href={a.lineUrl || `https://line.me/ti/p/~${a.lineId}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#06C755] text-white font-semibold hover:opacity-90">
                <MessageCircle className="w-4 h-4" /> LINE
              </a>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-amber-900">為什麼找我</h2>
            </div>
            {getDemoIntro(a) && <p className="text-amber-900/80 text-sm leading-relaxed whitespace-pre-line">{getDemoIntro(a)}</p>}
            <div className="flex flex-wrap gap-2">
              {(a.tags || a.serviceAdvantages || []).filter(Boolean).map((t, i) => (
                <span key={i} className="text-xs text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                  {String(t)}
                </span>
              ))}
            </div>
            <AgentCardFullFields agent={a} variant="light" />
            <button type="button" onClick={() => downloadVCard(a)} className="w-full py-3 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-700 mt-4">
              存入手機聯絡人
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
