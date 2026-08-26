import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import SectionHeading from "@/components/ui/SectionHeading";
import ColumnSet from "@/components/skills/ColumnSet";
import ColumnParallax from "@/components/skills/ColumnParallax";
import { FALLBACK_STACK, mapStackCategories } from "@/lib/skills-data";

export default function Skills() {
  const categories = mapStackCategories(FALLBACK_STACK);

  return (
    <section id="skills" className="relative overflow-hidden bg-transparent py-24 md:py-32">
      <div className="mx-auto max-w-[88rem] px-5 md:px-10">
        <SectionHeading
          eyebrow="Tech Stack"
          title="The Working Stack"
          subtitle="Six layers along one request path. Width is attention here — open a column and it claims the room."
          align="left"
        />

        <div className="mt-12">
          <ColumnSet initialCategories={categories} />
          <ColumnParallax />
        </div>

        <div className="mt-6 flex justify-end">
          <Link
            href="/skills"
            className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            <span>See more</span>
            <span className="grid size-6 place-items-center rounded-full border border-hairline transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
