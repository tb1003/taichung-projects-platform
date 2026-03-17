/**
 * 出售土地流程：層次說明展開後，各項解說直接顯示於卡片內
 * 路徑：/demo/land-selling-process
 */
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import ProcessFlowContent from "@/components/ProcessFlowContent";
import { landSellingProcessSteps } from "@/data/processSteps";

export default function LandSellingDemo() {
  return (
    <div className="min-h-screen pb-20">
      <div className="border-b border-border bg-muted/30">
        <div className="container py-6">
          <Link href="/tools">
            <a className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              返回房產工具
            </a>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mt-4">出售土地流程</h1>
          <p className="text-muted-foreground text-sm mt-1">依步驟展開，即可在卡片內查看各項說明。</p>
        </div>
      </div>
      <div className="container py-6">
        <ProcessFlowContent steps={landSellingProcessSteps} />
      </div>
    </div>
  );
}
