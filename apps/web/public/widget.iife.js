(function(){"use strict";const s={WIDGET_URL:"https://agenci-widget-vol22.vercel.app",DEFAULT_POSITION:"bottom-right"},b=`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
</svg>`,E=`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="18" y1="6" x2="6" y2="18"></line>
  <line x1="6" y1="6" x2="18" y2="18"></line>
</svg>`;(function(){let n=null,e=null,t=null,c=!1,p="#0f172a",u="#ffffff",r=60,l=null,g=null,d=s.DEFAULT_POSITION;const f=document.currentScript;if(f)l=f.getAttribute("data-organization-id"),g=f.getAttribute("data-agent-id"),d=f.getAttribute("data-position")||s.DEFAULT_POSITION;else{const i=document.querySelectorAll('script[src*="embed"]'),a=Array.from(i).find(o=>o.hasAttribute("data-organization-id"));a&&(l=a.getAttribute("data-organization-id"),g=a.getAttribute("data-agent-id"),d=a.getAttribute("data-position")||s.DEFAULT_POSITION)}if(!l){console.error("Agenci: data-organization-id er påkrevd på script-taggen");return}function m(){document.readyState==="loading"?document.addEventListener("DOMContentLoaded",x):x()}function x(){t=document.createElement("button"),t.id="echo-widget-button",t.innerHTML=b,t.style.cssText=`
      position: fixed;
      ${d==="bottom-right"?"right: 20px;":"left: 20px;"}
      bottom: 20px;
      width: ${r}px;
      height: ${r}px;
      border-radius: 50%;
      background: ${p};
      color: ${u};
      border: none;
      cursor: pointer;
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
      transition: all 0.2s ease;
    `,t.addEventListener("click",T),t.addEventListener("mouseenter",()=>{t&&(t.style.transform="scale(1.05)")}),t.addEventListener("mouseleave",()=>{t&&(t.style.transform="scale(1)")}),document.body.appendChild(t),e=document.createElement("div"),e.id="echo-widget-container",e.style.cssText=`
      position: fixed;
      ${d==="bottom-right"?"right: 20px;":"left: 20px;"}
      bottom: 90px;
      width: 400px;
      height: 600px;
      max-width: calc(100vw - 40px);
      max-height: calc(100vh - 110px);
      z-index: 999998;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
      display: none;
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.3s ease;
    `,n=document.createElement("iframe"),n.src=L(),n.style.cssText=`
      width: 100%;
      height: 100%;
      border: none;
    `,n.allow="microphone; clipboard-read; clipboard-write",e.appendChild(n),document.body.appendChild(e),window.addEventListener("message",y)}function L(){const i=new URLSearchParams;return i.append("organizationId",l),g&&i.append("agentId",g),`${s.WIDGET_URL}?${i.toString()}`}function y(i){if(i.origin!==new URL(s.WIDGET_URL).origin)return;const{type:a,payload:o}=i.data;switch(a){case"close":h();break;case"resize":o.height&&e&&(e.style.height=`${o.height}px`);break;case"bubble-config":o&&t&&(o.color&&(p=o.color,t.style.background=p),o.iconColor&&(u=o.iconColor,t.style.color=u),o.size&&(r=o.size,t.style.width=`${r}px`,t.style.height=`${r}px`,e&&(e.style.bottom=`${r+20}px`)));break}}function T(){c?h():w()}function w(){e&&t&&(c=!0,e.style.display="block",setTimeout(()=>{e&&(e.style.opacity="1",e.style.transform="translateY(0)")},10),t.innerHTML=E)}function h(){e&&t&&(c=!1,e.style.opacity="0",e.style.transform="translateY(10px)",setTimeout(()=>{e&&(e.style.display="none")},300),t.innerHTML=b,t.style.background=p,t.style.color=u)}function v(){window.removeEventListener("message",y),e&&(e.remove(),e=null,n=null),t&&(t.remove(),t=null),c=!1}function k(i){v(),i.organizationId&&(l=i.organizationId),i.position&&(d=i.position),m()}const I={init:k,show:w,hide:h,destroy:v};window.AgenciWidget=I,window.EchoWidget=I,m()})()})();
