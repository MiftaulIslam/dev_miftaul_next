import type { Metadata } from "next";
import HomeExperience from "@/components/home/HomeExperience";
import {
  jsonLd,
  loadProfile,
  pageMetadata,
  personNode,
  PERSON_ID,
  SITE_URL,
  websiteNode,
  WEBSITE_ID,
} from "@/lib/seo";

/**
 * Static with a one-minute refresh: the dashboard's settings edits show within
 * a minute without making every visit wait on the database.
 */
export const revalidate = 60;

const TITLE = "Miftaul Islam Shuvro — Full Stack Developer (React, Node.js, AWS)";
const DESCRIPTION =
  "Full stack developer in Dhaka building SaaS platforms with React, Next.js, Node.js, NestJS, GraphQL and AWS. Case studies: CreBrains, Heobz, Hex Housing.";

export const metadata: Metadata = {
  ...pageMetadata({ title: TITLE, description: DESCRIPTION, path: "/", type: "profile" }),
  title: { absolute: TITLE },
};

export default async function Home() {
  const profile = await loadProfile();

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      personNode(profile),
      websiteNode(),
      {
        "@type": "ProfilePage",
        "@id": `${SITE_URL}/#profilepage`,
        url: `${SITE_URL}/`,
        name: TITLE,
        description: DESCRIPTION,
        isPartOf: { "@id": WEBSITE_ID },
        mainEntity: { "@id": PERSON_ID },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(graph) }} />
      <HomeExperience initialProfile={profile} />
    </>
  );
}
