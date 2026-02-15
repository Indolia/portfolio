(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const s of o.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&r(s)}).observe(document,{childList:!0,subtree:!0});function t(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function r(i){if(i.ep)return;i.ep=!0;const o=t(i);fetch(i.href,o)}})();const c="preferred-theme",p="theme-toggle";function d(){return window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}function a(e,n=!0){document.documentElement.setAttribute("data-theme",e),n&&localStorage.setItem(c,e);const t=document.querySelector(`#${p} i`);t&&(t.className=e==="dark"?"fas fa-sun":"fas fa-moon")}function m(){const e=document.getElementById(p),n=localStorage.getItem(c);if(n)a(n,!0);else{a(d(),!1);const t=window.matchMedia("(prefers-color-scheme: dark)"),r=i=>{localStorage.getItem(c)||a(i.matches?"dark":"light",!1)};typeof t.addEventListener=="function"?t.addEventListener("change",r):typeof t.addListener=="function"&&t.addListener(r)}e&&e.addEventListener("click",()=>{const r=(document.documentElement.getAttribute("data-theme")||d())==="dark"?"light":"dark";a(r,!0)})}const u=[{id:"sophos",company:"Sophos",companyUrl:"https://www.sophos.com",role:"Senior Software Engineer · macOS, Windows & iOS",period:"Apr 2021 - Present",summary:"Leading development of secure endpoint and network access capabilities with a focus on reliability, performance, and enterprise UX.",highlights:["Delivered secure access workflows for enterprise users across desktop and mobile clients.","Improved app startup and reconnect behavior in networking-heavy scenarios.","Collaborated with cross-functional teams on quality gates, telemetry, and release hardening."],tags:["Swift","Objective-C","C++","Networking","Security"],iconClass:"fa-shield-alt"},{id:"skuad-gojek",company:"Skuad (Consulting for Gojek)",companyUrl:"https://www.skuad.io",role:"Senior Software Engineer · iOS",period:"Feb 2020 - Apr 2021",summary:"Contributed to high-scale mobile product surfaces and SDK-driven features used by millions of users.",highlights:["Built production iOS modules with a strong focus on responsiveness and maintainability.","Partnered with product and QA to reduce regressions and stabilize release cycles.","Enhanced developer velocity by improving reusable components and testing practices."],tags:["Swift","UIKit","Core Data","SDK Integration"],iconClass:"fa-map-marker-alt"},{id:"click-labs",company:"Click Labs",companyUrl:"https://www.clicklabs.co",role:"Senior Software Engineer · iOS & iPadOS",period:"Dec 2018 - Jan 2020",summary:"Built communication-driven mobile experiences with strong emphasis on real-time interactions and polished UI.",highlights:["Implemented chat and calling features with robust connection state handling.","Supported white-label customization while preserving core platform stability.","Improved test coverage for critical flows in messaging and authentication."],tags:["Swift","WebRTC","CallKit","Real-Time"],iconClass:"fa-comment-dots"},{id:"chromeinfotech",company:"ChromeInfoTech",companyUrl:"https://www.chromeinfotech.com",role:"Software Engineer · iOS & iPadOS",period:"Jan 2015 - Oct 2018",summary:"Developed and shipped multiple mobile applications across consumer and enterprise domains.",highlights:["Implemented reusable app architecture patterns for faster project onboarding.","Integrated payment, mapping, and push notification services for product features.","Delivered iterative UX improvements based on usage feedback and analytics."],tags:["Swift","Objective-C","APIs","Mobile Architecture"],iconClass:"fa-mobile-alt"}];function f(e){const n=document.createElement("li");n.className="experience-item";const t=`experience-details-${e.id}`,r=e.companyUrl?`<a href="${e.companyUrl}" target="_blank" rel="noopener">${e.company}</a>`:e.company,i=e.highlights.map(s=>`<p>${s}</p>`).join(""),o=e.tags.map(s=>`<li class="experience-tag">${s}</li>`).join("");return n.innerHTML=`
    <article class="experience-card" aria-labelledby="experience-company-${e.id}">
      <header class="experience-head">
        <span class="experience-icon icon solid ${e.iconClass}" aria-hidden="true"></span>
        <div>
          <h3 id="experience-company-${e.id}" class="experience-company">${r}</h3>
          <p class="experience-role">${e.role}</p>
        </div>
        <time class="experience-date">${e.period}</time>
      </header>
      <p class="experience-summary">${e.summary}</p>
      <div class="experience-actions">
        <button
          type="button"
          class="experience-toggle"
          aria-expanded="false"
          aria-controls="${t}"
          aria-label="View Highlights"
        >
          <span class="toggle-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" focusable="false" aria-hidden="true">
              <polyline points="6 9 12 15 18 9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <span class="label">View</span>
        </button>
      </div>
      <div id="${t}" class="experience-details" hidden>
        ${i}
        <ul class="experience-tags" aria-label="Key technologies">
          ${o}
        </ul>
      </div>
    </article>
  `,n}function h(e){const n=e.querySelectorAll(".experience-toggle");for(const t of n)t.addEventListener("click",()=>{const r=t.closest(".experience-item"),i=t.getAttribute("aria-controls");if(!r||!i)return;const o=document.getElementById(i);if(!o)return;const s=t.getAttribute("aria-expanded")==="true";t.setAttribute("aria-expanded",String(!s));const l=t.querySelector(".label");l?l.textContent=s?"View":"Hide":t.textContent=s?"View":"Hide",t.setAttribute("aria-label",s?"View Highlights":"Hide Highlights"),r.classList.toggle("is-expanded",!s),o.toggleAttribute("hidden",s)})}function g(e){const n=e.querySelectorAll(".experience-item");if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){for(const r of n)r.classList.add("is-visible");return}const t=new IntersectionObserver((r,i)=>{for(const o of r)o.isIntersecting&&(o.target.classList.add("is-visible"),i.unobserve(o.target))},{threshold:.2,rootMargin:"0px 0px -10% 0px"});for(const r of n)t.observe(r)}function b(){const e=document.querySelector("#experience-timeline");if(!e)return;const n=document.createDocumentFragment();for(const t of u)n.appendChild(f(t));e.appendChild(n),h(e),g(e)}m();b();
