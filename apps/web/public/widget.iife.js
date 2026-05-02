(function(){"use strict";const s={WIDGET_URL:"https://agenci-widget-vol22.vercel.app",DEFAULT_POSITION:"bottom-right"},h=`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
</svg>`,E=`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="18" y1="6" x2="6" y2="18"></line>
  <line x1="6" y1="6" x2="18" y2="18"></line>
</svg>`;(function(){let n=null,t=null,e=null,c=!1,p="#0f172a",u="#ffffff",r=60,a=null,l=s.DEFAULT_POSITION;const g=document.currentScript;if(g)a=g.getAttribute("data-organization-id"),l=g.getAttribute("data-position")||s.DEFAULT_POSITION;else{const i=document.querySelectorAll('script[src*="embed"]'),d=Array.from(i).find(o=>o.hasAttribute("data-organization-id"));d&&(a=d.getAttribute("data-organization-id"),l=d.getAttribute("data-position")||s.DEFAULT_POSITION)}if(!a){console.error("Agenci: data-organization-id er påkrevd på script-taggen");return}function b(){document.readyState==="loading"?document.addEventListener("DOMContentLoaded",m):m()}function m(){e=document.createElement("button"),e.id="echo-widget-button",e.innerHTML=h,e.style.cssText=`
      position: fixed;
      ${l==="bottom-right"?"right: 20px;":"left: 20px;"}
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
    `,e.addEventListener("click",L),e.addEventListener("mouseenter",()=>{e&&(e.style.transform="scale(1.05)")}),e.addEventListener("mouseleave",()=>{e&&(e.style.transform="scale(1)")}),document.body.appendChild(e),t=document.createElement("div"),t.id="echo-widget-container",t.style.cssText=`
      position: fixed;
      ${l==="bottom-right"?"right: 20px;":"left: 20px;"}
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
    `,n=document.createElement("iframe"),n.src=I(),n.style.cssText=`
      width: 100%;
      height: 100%;
      border: none;
    `,n.allow="microphone; clipboard-read; clipboard-write",t.appendChild(n),document.body.appendChild(t),window.addEventListener("message",x)}function I(){const i=new URLSearchParams;return i.append("organizationId",a),`${s.WIDGET_URL}?${i.toString()}`}function x(i){if(i.origin!==new URL(s.WIDGET_URL).origin)return;const{type:d,payload:o}=i.data;switch(d){case"close":f();break;case"resize":o.height&&t&&(t.style.height=`${o.height}px`);break;case"bubble-config":o&&e&&(o.color&&(p=o.color,e.style.background=p),o.iconColor&&(u=o.iconColor,e.style.color=u),o.size&&(r=o.size,e.style.width=`${r}px`,e.style.height=`${r}px`,t&&(t.style.bottom=`${r+20}px`)));break}}function L(){c?f():y()}function y(){t&&e&&(c=!0,t.style.display="block",setTimeout(()=>{t&&(t.style.opacity="1",t.style.transform="translateY(0)")},10),e.innerHTML=E)}function f(){t&&e&&(c=!1,t.style.opacity="0",t.style.transform="translateY(10px)",setTimeout(()=>{t&&(t.style.display="none")},300),e.innerHTML=h,e.style.background=p,e.style.color=u)}function w(){window.removeEventListener("message",x),t&&(t.remove(),t=null,n=null),e&&(e.remove(),e=null),c=!1}function T(i){w(),i.organizationId&&(a=i.organizationId),i.position&&(l=i.position),b()}const v={init:T,show:y,hide:f,destroy:w};window.AgenciWidget=v,window.EchoWidget=v,b()})()})();
