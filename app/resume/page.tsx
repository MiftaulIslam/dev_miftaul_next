import type { Metadata } from "next";
import ResumeDocument from "@/components/resume/ResumeDocument";
import ResumeToolbar from "@/components/resume/ResumeToolbar";
import ResumeIntroReset from "@/components/resume/ResumeIntroReset";
import { jsonLd, loadProfile, pageMetadata, personNode, PERSON_ID, SITE_URL, WEBSITE_ID } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = pageMetadata({
  title: "Resume — Full Stack Developer",
  description:
    "Resume of Miftaul Islam Shuvro, full stack developer in Dhaka — roles at Web Makers Ltd. and Solution Insurance Group, plus CreBrains, Meetyy and Axivo.",
  path: "/resume",
  type: "profile",
});

export default async function ResumePage() {
  const profile = await loadProfile();
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      personNode(profile),
      {
        "@type": "ProfilePage",
        "@id": `${SITE_URL}/resume`,
        url: `${SITE_URL}/resume`,
        name: "Resume of Miftaul Islam Shuvro",
        isPartOf: { "@id": WEBSITE_ID },
        mainEntity: { "@id": PERSON_ID },
      },
    ],
  };

  return (
    <main className="min-h-screen bg-slate-200 print:bg-white">
      <ResumeIntroReset />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }}
      />
      <ResumeToolbar />
      <div className="px-4 py-6 print:p-0">
        <ResumeDocument />
      </div>
    </main>
  );
}
