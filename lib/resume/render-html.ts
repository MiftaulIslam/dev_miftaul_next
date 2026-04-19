import { resumeContent } from "@/lib/resume/content";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderEntry(entry: {
  headingPrefix: string;
  headingEmphasis?: string;
  headingSuffix?: string;
  date?: string;
  subtitle?: string;
  bullets: string[];
}) {
  const heading = `${escapeHtml(entry.headingPrefix)}${
    entry.headingEmphasis ? `<span class="underline">${escapeHtml(entry.headingEmphasis)}</span>` : ""
  }${entry.headingSuffix ? escapeHtml(entry.headingSuffix) : ""}`;

  const right = entry.date ? `<div class="entry-date">${escapeHtml(entry.date)}</div>` : "";
  const subtitle = entry.subtitle ? `<div class="entry-subtitle">${escapeHtml(entry.subtitle)}</div>` : "";
  const bullets = entry.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("");

  return `
    <div class="entry">
      <div class="entry-head">
        <h3>${heading}</h3>
        ${right}
      </div>
      ${subtitle}
      <ul>${bullets}</ul>
    </div>
  `;
}

export function renderResumeHtml() {
  const links = resumeContent.links
    .map(
      (link, index) =>
        `<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>${
          index < resumeContent.links.length - 1 ? " | " : ""
        }`,
    )
    .join("");

  const skills = resumeContent.skills
    .map((skill) => `<p><strong>${escapeHtml(skill.level)}:</strong> ${escapeHtml(skill.value)}</p>`)
    .join("");

  const experiences = resumeContent.experiences.map(renderEntry).join("");
  const projects = resumeContent.projects.map(renderEntry).join("");

  return `
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${escapeHtml(resumeContent.name)} Resume</title>
      <style>
        * { box-sizing: border-box; }
        html, body {
          margin: 0;
          padding: 0;
          background: #ffffff;
          color: #111111;
          font-family: Arial, Helvetica, sans-serif;
        }
        .page {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          padding: 14mm 16mm;
          page-break-after: always;
        }
        .page:last-child { page-break-after: auto; }

        h1 {
          margin: 0;
          color: #365fa9;
          font-size: 58px;
          line-height: 0.95;
          letter-spacing: -0.02em;
        }
        .title {
          margin-top: 4px;
          font-size: 41px;
          font-weight: 600;
          line-height: 1;
        }
        .contact, .links, .languages {
          font-size: 15px;
          line-height: 1.3;
        }
        .contact { margin-top: 10px; }
        .contact a, .links a {
          color: #3758cf;
          text-decoration: underline;
        }
        .section {
          margin-top: 16px;
        }
        .section h2 {
          margin: 0;
          color: #365fa9;
          font-size: 20px;
          line-height: 1.2;
        }
        .section p, .section li {
          font-size: 16px;
          line-height: 1.35;
          margin: 0;
        }
        .entry {
          margin-top: 11px;
        }
        .entry-head {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 12px;
        }
        .entry h3 {
          margin: 0;
          font-size: 16px;
          line-height: 1.1;
          font-weight: 700;
        }
        .entry-date {
          flex-shrink: 0;
          font-size: 14px;
        }
        .entry-subtitle {
          margin-top: 3px;
          font-size: 14px;
        }
        .entry ul {
          margin: 4px 0 0;
          padding-left: 22px;
        }
        .entry li {
          margin: 0;
        }
        .underline { text-decoration: underline; }
        .edu-degree {
          margin: 2px 0 0;
          font-size: 36px;
          line-height: 1;
          font-weight: 700;
        }
      </style>
    </head>
    <body>
      <section class="page">
        <header>
          <h1>${escapeHtml(resumeContent.name)}</h1>
          <p class="title">${escapeHtml(resumeContent.title)}</p>
          <p class="contact">
            ${escapeHtml(resumeContent.location)} | ${escapeHtml(resumeContent.phone)} |
            <a href="mailto:${escapeHtml(resumeContent.email)}">${escapeHtml(resumeContent.email)}</a>
          </p>
          <p class="links">${links}</p>
          <p class="languages"><strong>Languages:</strong> ${escapeHtml(resumeContent.languages)}</p>
        </header>

        <section class="section">
          <h2>Summary</h2>
          <p>${escapeHtml(resumeContent.summary)}</p>
        </section>

        <section class="section">
          <h2>Skills</h2>
          ${skills}
        </section>

        <section class="section">
          <h2>Experience</h2>
          ${experiences}
        </section>
      </section>

      <section class="page">
        <section class="section" style="margin-top:0;">
          <h2>Projects</h2>
          ${projects}
        </section>

        <section class="section" style="margin-top: 28px;">
          <h2>Education</h2>
          <p class="edu-degree">${escapeHtml(resumeContent.education.degree)}</p>
          <p><strong>Major:</strong> ${escapeHtml(resumeContent.education.major)}</p>
          <p>${escapeHtml(resumeContent.education.institute)}</p>
          <p>${escapeHtml(resumeContent.education.duration)}</p>
        </section>
      </section>
    </body>
  </html>
  `;
}

