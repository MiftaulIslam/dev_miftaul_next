import { resumeContent, type ResumeEntry } from "@/lib/resume/content";

function ResumeHeading({ entry }: { entry: ResumeEntry }) {
  return (
    <h3 className="font-[Arial] text-[16px] font-bold leading-tight text-[#111111]">
      {entry.headingPrefix}
      {entry.headingEmphasis ? (
        entry.link ? (
          <a
            href={entry.link}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[#3758cf] transition-colors"
          >
            {entry.headingEmphasis}
          </a>
        ) : (
          <span className="underline">{entry.headingEmphasis}</span>
        )
      ) : null}
      {entry.headingSuffix}
    </h3>
  );
}

function ResumeEntryBlock({ entry }: { entry: ResumeEntry }) {
  return (
    <div className="mt-3 first:mt-0">
      <div className="flex items-baseline justify-between gap-4">
        <ResumeHeading entry={entry} />
        {entry.date ? (
          <p className="shrink-0 text-[14px] text-[#111111]">{entry.date}</p>
        ) : null}
      </div>
      {entry.subtitle ? (
        <p className="mt-1 text-[14px] text-[#111111]">{entry.subtitle}</p>
      ) : null}
      <ul className="mt-1 list-disc pl-6 text-[16px] leading-[1.35] text-[#111111]">
        {entry.bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
    </div>
  );
}

export default function ResumeDocument() {
  const basePaperClass =
    "mx-auto w-full max-w-[1200px] bg-white px-[58px] py-[40px] text-[#111111] shadow-[0_16px_42px_rgba(15,23,42,0.16)] print:max-w-none print:min-h-[297mm] print:shadow-none print:p-4";

  return (
    <div id="cv-print-root" className="space-y-8 print:space-y-0">
      <article className={`${basePaperClass}`}>
        <header>
          <h1 className="font-[Arial] text-[44px] font-bold leading-[0.95] tracking-[-0.02em] text-[#365fa9] md:text-[58px]">
            {resumeContent.name}
          </h1>
          <p className="mt-1 font-[Arial] text-[30px] font-semibold leading-none text-[#111111] md:text-[41px]">
            {resumeContent.title}
          </p>

          <p className="mt-3 text-[15px] text-[#111111]">
            {resumeContent.location} | {resumeContent.phone} |{" "}
            <a
              href={`mailto:${resumeContent.email}`}
              className="text-[#3758cf] underline"
            >
              {resumeContent.email}
            </a>
          </p>
          <p className="text-[15px] text-[#3758cf]">
            {resumeContent.links.map((link, index) => (
              <span key={link.label}>
                <a
                  className="underline"
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                </a>
                {index < resumeContent.links.length - 1 ? " | " : ""}
              </span>
            ))}
          </p>
          <p className="text-[16px] text-[#111111]">
            <span className="font-bold">Languages:</span>{" "}
            {resumeContent.languages}
          </p>
        </header>

        <section className="mt-5">
          <h2 className="font-[Arial] text-[20px] font-bold text-[#365fa9]">
            Summary
          </h2>
          <p className="mt-1 text-[16px] leading-[1.35] text-[#111111]">
            {resumeContent.summary}
          </p>
        </section>

        <section className="mt-4">
          <h2 className="font-[Arial] text-[20px] font-bold text-[#365fa9]">
            Skills
          </h2>
          <div className="mt-1 space-y-0.5 text-[16px] leading-[1.35] text-[#111111]">
            {resumeContent.skills.map((skill) => (
              <p key={skill.level}>
                <span className="font-bold">{skill.level}:</span> {skill.value}
              </p>
            ))}
          </div>
        </section>

        <section className="mt-4">
          <h2 className="font-[Arial] text-[20px] font-bold text-[#365fa9]">
            Experience
          </h2>
          <div className="mt-1 space-y-1.5">
            {resumeContent.experiences.map((experience) => (
              <ResumeEntryBlock
                key={`${experience.headingPrefix}${experience.date ?? experience.subtitle ?? ""}`}
                entry={experience}
              />
            ))}
          </div>
        </section>
        <section className="mt-5">
          <h2 className="font-[Arial] text-[20px] font-bold text-[#365fa9]">
            Projects
          </h2>
          <div className="mt-1 space-y-3">
            {resumeContent.projects.map((project) => (
              <ResumeEntryBlock
                key={project.headingPrefix + project.headingEmphasis}
                entry={project}
              />
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="font-[Arial] text-[20px] font-bold text-[#365fa9]">
            Education
          </h2>
          <div className="mt-1 text-[16px] leading-[1.3] text-[#111111]">
            <p className="text-[28px] font-bold leading-none md:text-[36px]">
              {resumeContent.education.degree}
            </p>
            <p>
              <span className="font-bold">Major:</span>{" "}
              {resumeContent.education.major}
            </p>
            <p>{resumeContent.education.institute}</p>
            <p>{resumeContent.education.duration}</p>
          </div>
        </section>
      </article>
    </div>
  );
}
