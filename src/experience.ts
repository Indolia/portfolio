interface ExperienceEntry {
  id: string;
  company: string;
  companyUrl: string;
  role: string;
  period: string;
  summary: string;
  highlights: string[];
  tags: string[];
  iconClass: string;
}

const EXPERIENCE_ENTRIES: ExperienceEntry[] = [
  {
    id: "sophos",
    company: "Sophos",
    companyUrl: "https://www.sophos.com",
    role: "Senior Software Engineer · macOS, Windows & iOS",
    period: "Apr 2021 - Present",
    summary:
      "Leading development of secure endpoint and network access capabilities with a focus on reliability, performance, and enterprise UX.",
    highlights: [
      "Delivered secure access workflows for enterprise users across desktop and mobile clients.",
      "Improved app startup and reconnect behavior in networking-heavy scenarios.",
      "Collaborated with cross-functional teams on quality gates, telemetry, and release hardening."
    ],
    tags: ["Swift", "Objective-C", "C++", "Networking", "Security"],
    iconClass: "fa-shield-alt"
  },
  {
    id: "skuad-gojek",
    company: "Skuad (Consulting for Gojek)",
    companyUrl: "https://www.skuad.io",
    role: "Senior Software Engineer · iOS",
    period: "Feb 2020 - Apr 2021",
    summary:
      "Contributed to high-scale mobile product surfaces and SDK-driven features used by millions of users.",
    highlights: [
      "Built production iOS modules with a strong focus on responsiveness and maintainability.",
      "Partnered with product and QA to reduce regressions and stabilize release cycles.",
      "Enhanced developer velocity by improving reusable components and testing practices."
    ],
    tags: ["Swift", "UIKit", "Core Data", "SDK Integration"],
    iconClass: "fa-map-marker-alt"
  },
  {
    id: "click-labs",
    company: "Click Labs",
    companyUrl: "https://www.clicklabs.co",
    role: "Senior Software Engineer · iOS & iPadOS",
    period: "Dec 2018 - Jan 2020",
    summary:
      "Built communication-driven mobile experiences with strong emphasis on real-time interactions and polished UI.",
    highlights: [
      "Implemented chat and calling features with robust connection state handling.",
      "Supported white-label customization while preserving core platform stability.",
      "Improved test coverage for critical flows in messaging and authentication."
    ],
    tags: ["Swift", "WebRTC", "CallKit", "Real-Time"],
    iconClass: "fa-comment-dots"
  },
  {
    id: "chromeinfotech",
    company: "ChromeInfoTech",
    companyUrl: "https://www.chromeinfotech.com",
    role: "Software Engineer · iOS & iPadOS",
    period: "Jan 2015 - Oct 2018",
    summary:
      "Developed and shipped multiple mobile applications across consumer and enterprise domains.",
    highlights: [
      "Implemented reusable app architecture patterns for faster project onboarding.",
      "Integrated payment, mapping, and push notification services for product features.",
      "Delivered iterative UX improvements based on usage feedback and analytics."
    ],
    tags: ["Swift", "Objective-C", "APIs", "Mobile Architecture"],
    iconClass: "fa-mobile-alt"
  }
];

function createExperienceItem(entry: ExperienceEntry): HTMLLIElement {
  const listItem = document.createElement("li");
  listItem.className = "experience-item";

  const detailsId = `experience-details-${entry.id}`;
  const companyMarkup = entry.companyUrl
    ? `<a href="${entry.companyUrl}" target="_blank" rel="noopener">${entry.company}</a>`
    : entry.company;

  const highlights = entry.highlights.map((text) => `<p>${text}</p>`).join("");
  const tags = entry.tags
    .map((tag) => `<li class="experience-tag">${tag}</li>`)
    .join("");

  listItem.innerHTML = `
    <article class="experience-card" aria-labelledby="experience-company-${entry.id}">
      <header class="experience-head">
        <span class="experience-icon icon solid ${entry.iconClass}" aria-hidden="true"></span>
        <div>
          <h3 id="experience-company-${entry.id}" class="experience-company">${companyMarkup}</h3>
          <p class="experience-role">${entry.role}</p>
        </div>
        <time class="experience-date">${entry.period}</time>
      </header>
      <p class="experience-summary">${entry.summary}</p>
      <div class="experience-actions">
        <button
          type="button"
          class="experience-toggle"
          aria-expanded="false"
          aria-controls="${detailsId}"
        >
          View Highlights
        </button>
      </div>
      <div id="${detailsId}" class="experience-details" hidden>
        ${highlights}
        <ul class="experience-tags" aria-label="Key technologies">
          ${tags}
        </ul>
      </div>
    </article>
  `;

  return listItem;
}

function bindInteraction(listElement: HTMLOListElement): void {
  const buttons = listElement.querySelectorAll<HTMLButtonElement>(".experience-toggle");

  for (const button of buttons) {
    button.addEventListener("click", () => {
      const item = button.closest<HTMLElement>(".experience-item");
      const detailsId = button.getAttribute("aria-controls");
      if (!item || !detailsId) {
        return;
      }

      const details = document.getElementById(detailsId);
      if (!details) {
        return;
      }

      const isExpanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!isExpanded));
      button.textContent = isExpanded ? "View Highlights" : "Hide Highlights";
      item.classList.toggle("is-expanded", !isExpanded);
      details.toggleAttribute("hidden", isExpanded);
    });
  }
}

function bindRevealAnimation(listElement: HTMLOListElement): void {
  const items = listElement.querySelectorAll<HTMLElement>(".experience-item");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    for (const item of items) {
      item.classList.add("is-visible");
    }
    return;
  }

  const observer = new IntersectionObserver(
    (entries, io) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          continue;
        }

        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    },
    {
      threshold: 0.2,
      rootMargin: "0px 0px -10% 0px"
    }
  );

  for (const item of items) {
    observer.observe(item);
  }
}

export function initExperienceTimeline(): void {
  const timeline = document.querySelector<HTMLOListElement>("#experience-timeline");
  if (!timeline) {
    return;
  }

  const fragment = document.createDocumentFragment();

  for (const entry of EXPERIENCE_ENTRIES) {
    fragment.appendChild(createExperienceItem(entry));
  }

  timeline.appendChild(fragment);
  bindInteraction(timeline);
  bindRevealAnimation(timeline);
}
