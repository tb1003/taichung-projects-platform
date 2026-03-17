/**
 * 流程層次說明：手風琴展開後，每項標題與深入解說內容直接顯示於卡片內
 * 用於房產工具詳情頁右欄，以及 /demo/* 流程頁
 */
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import type { ProcessStep } from "@/data/processSteps";

interface ProcessFlowContentProps {
  steps: ProcessStep[];
  className?: string;
}

export default function ProcessFlowContent({ steps, className }: ProcessFlowContentProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <h2 className="text-sm font-semibold text-muted-foreground mb-2">層次說明</h2>
      <Accordion type="multiple" className="space-y-2">
        {steps.map((step, idx) => (
          <AccordionItem key={step.id} value={step.id} className="border border-border rounded-xl bg-card overflow-hidden">
            <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30 [&>svg]:shrink-0">
              <span className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">{idx + 1}</span>
                {step.title}
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-4 pt-0">
              <ul className="space-y-4 mt-2">
                {step.children.map((sub) => (
                  <li key={sub.title} className="rounded-lg border border-border bg-muted/20 p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-2">{sub.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{sub.detail}</p>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
