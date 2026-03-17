/**
 * 關於我們 － 單一團隊成員電子名片頁（/about/card/:index）
 * 依成員的 eCardStyle 渲染對應風格，資料來自 site-content teamMembers
 */
import { useRoute, Link } from "wouter";
import { useSiteContent } from "@/hooks/useSiteContent";
import type { TeamMemberInAbout } from "@/pages/admin/SiteContentPage";
import type { DemoAgentCard } from "@/pages/demo/aboutTeamDemoData";
import AboutTeamStyle1 from "@/pages/demo/AboutTeamStyle1";
import AboutTeamStyle2 from "@/pages/demo/AboutTeamStyle2";
import AboutTeamStyle3 from "@/pages/demo/AboutTeamStyle3";
import AboutTeamStyle4 from "@/pages/demo/AboutTeamStyle4";
import AboutTeamStyle5 from "@/pages/demo/AboutTeamStyle5";
import AboutTeamStyle6 from "@/pages/demo/AboutTeamStyle6";
import AboutTeamStyle7 from "@/pages/demo/AboutTeamStyle7";
import AboutTeamStyle8 from "@/pages/demo/AboutTeamStyle8";
import AboutTeamStyle9 from "@/pages/demo/AboutTeamStyle9";
import AboutTeamStyle10 from "@/pages/demo/AboutTeamStyle10";

const STYLE_MAP: Record<string, React.ComponentType<{ agent?: DemoAgentCard }>> = {
  "1": AboutTeamStyle1,
  "2": AboutTeamStyle2,
  "3": AboutTeamStyle3,
  "4": AboutTeamStyle4,
  "5": AboutTeamStyle5,
  "6": AboutTeamStyle6,
  "7": AboutTeamStyle7,
  "8": AboutTeamStyle8,
  "9": AboutTeamStyle9,
  "10": AboutTeamStyle10,
};

function memberToCard(m: TeamMemberInAbout): DemoAgentCard {
  const photos = (m.photos?.length ? m.photos : m.photo ? [m.photo] : []) as string[];
  return {
    name: m.name,
    title: m.title,
    photo: photos[0],
    photos,
    lineUrl: m.lineUrl,
    phone: m.phone,
    intro: m.intro,
    motto: m.motto,
    ytChannelUrl: m.ytChannelUrl,
    transactionHistory: m.transactionHistory,
    awards: m.awards,
    education: m.education,
    workExperience: m.workExperience,
    interests: m.interests,
    religion: m.religion,
    travelNotes: m.travelNotes,
    other: m.other,
    serviceAdvantages: m.serviceAdvantages,
    licenses: m.licenses?.length ? m.licenses : (m.license ? [{ text: m.license }] : undefined),
    license: m.license,
    storeLinks: m.storeLinks?.length ? m.storeLinks : undefined,
  };
}

export default function AboutCardPage() {
  const [, params] = useRoute("/about/card/:index");
  const index = params?.index != null ? Number(params.index) : NaN;
  const { data, loading } = useSiteContent();
  const teamMembers = (data?.about as { teamMembers?: TeamMemberInAbout[] })?.teamMembers ?? [];
  const member = Number.isInteger(index) && index >= 0 && index < teamMembers.length ? teamMembers[index] : null;
  const styleKey = (member?.eCardStyle || "1").toString();
  const StyleComponent = STYLE_MAP[styleKey] || AboutTeamStyle1;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        載入中…
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-muted-foreground">找不到該成員的電子名片</p>
        <Link href="/about">
          <a className="text-primary hover:underline">返回關於我們</a>
        </Link>
      </div>
    );
  }

  const agent = memberToCard(member);
  return <StyleComponent agent={agent} />;
}
