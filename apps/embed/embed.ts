import { EMBED_CONFIG } from './config';
import { chatBubbleIcon, closeIcon } from './icons';

(function() {
  let iframe: HTMLIFrameElement | null = null;
  let container: HTMLDivElement | null = null;
  let button: HTMLButtonElement | null = null;
  let isOpen = false;

  let bubbleColor = '#0f172a';
  let bubbleIconColor = '#ffffff';
  let bubbleSize = 60;
  // Desktop panel size/offset (the widget may resize it; bubble-config moves it).
  let panelHeight = 600;
  let panelBottom = '90px';
  let pageOverflow = '';
  const widgetOrigin = new URL(EMBED_CONFIG.WIDGET_URL).origin;

  // Get configuration from script tag
  let organizationId: string | null = null;
  let agentId: string | null = null;
  let position: 'bottom-right' | 'bottom-left' = EMBED_CONFIG.DEFAULT_POSITION;

  // Try to get the current script
  const currentScript = document.currentScript as HTMLScriptElement;
  if (currentScript) {
    organizationId = currentScript.getAttribute('data-organization-id');
    agentId = currentScript.getAttribute('data-agent-id');
    position = (currentScript.getAttribute('data-position') as 'bottom-right' | 'bottom-left') || EMBED_CONFIG.DEFAULT_POSITION;
  } else {
    // Fallback: find script tag by src
    const scripts = document.querySelectorAll('script[src*="embed"]');
    const embedScript = Array.from(scripts).find(script =>
      script.hasAttribute('data-organization-id')
    ) as HTMLScriptElement;

    if (embedScript) {
      organizationId = embedScript.getAttribute('data-organization-id');
      agentId = embedScript.getAttribute('data-agent-id');
      position = (embedScript.getAttribute('data-position') as 'bottom-right' | 'bottom-left') || EMBED_CONFIG.DEFAULT_POSITION;
    }
  }
  
  // Exit if no organization ID
  if (!organizationId) {
    console.error('Agenci: data-organization-id er påkrevd på script-taggen');
    return;
  }
  
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', render);
    } else {
      render();
    }
  }
  
  function render() {
    // Create floating action button
    button = document.createElement('button');
    button.id = 'echo-widget-button';
    button.innerHTML = chatBubbleIcon;
    button.style.cssText = `
      position: fixed;
      ${position === 'bottom-right' ? 'right: 20px;' : 'left: 20px;'}
      bottom: 20px;
      width: ${bubbleSize}px;
      height: ${bubbleSize}px;
      border-radius: 50%;
      background: ${bubbleColor};
      color: ${bubbleIconColor};
      border: none;
      cursor: pointer;
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
      transition: all 0.2s ease;
    `;
    
    button.addEventListener('click', toggleWidget);
    button.addEventListener('mouseenter', () => {
      if (button) button.style.transform = 'scale(1.05)';
    });
    button.addEventListener('mouseleave', () => {
      if (button) button.style.transform = 'scale(1)';
    });
    
    document.body.appendChild(button);
    
    // Create container (hidden by default)
    container = document.createElement('div');
    container.id = 'echo-widget-container';
    container.style.cssText = `
      position: fixed;
      ${position === 'bottom-right' ? 'right: 20px;' : 'left: 20px;'}
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
    `;
    
    // Create iframe
    iframe = document.createElement('iframe');
    iframe.src = buildWidgetUrl();
    iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
    `;
    // Add permissions for microphone and clipboard
    iframe.allow = 'microphone; clipboard-read; clipboard-write';
    
    container.appendChild(iframe);
    document.body.appendChild(container);
    
    // Handle messages from widget
    window.addEventListener('message', handleMessage);
    window.visualViewport?.addEventListener('resize', fitToViewport);
    window.visualViewport?.addEventListener('scroll', fitToViewport);
    window.addEventListener('resize', applyLayout);
  }
  
  function buildWidgetUrl(): string {
    const params = new URLSearchParams();
    params.append('organizationId', organizationId!);
    if (agentId) params.append('agentId', agentId);
    return `${EMBED_CONFIG.WIDGET_URL}?${params.toString()}`;
  }
  
  function handleMessage(event: MessageEvent) {
    if (event.origin !== new URL(EMBED_CONFIG.WIDGET_URL).origin) return;
    
    const { type, payload } = event.data;
    
    switch (type) {
      case 'close':
        hide();
        break;
      case 'agenci-widget-handshake':
        // The widget (re)loaded: tell it whether it is full screen.
        sendMode();
        break;
      case 'resize':
        if (payload.height) {
          panelHeight = payload.height;
          if (container && !isFullscreen()) container.style.height = `${panelHeight}px`;
        }
        break;
      case 'bubble-config':
        if (payload && button) {
          if (payload.color) {
            bubbleColor = payload.color;
            button.style.background = bubbleColor;
          }
          if (payload.iconColor) {
            bubbleIconColor = payload.iconColor;
            button.style.color = bubbleIconColor;
          }
          if (payload.size) {
            bubbleSize = payload.size;
            button.style.width = `${bubbleSize}px`;
            button.style.height = `${bubbleSize}px`;
            panelBottom = `${bubbleSize + 20}px`;
            if (container && !isFullscreen()) container.style.bottom = panelBottom;
          }
        }
        break;
    }
  }
  
  /** Phones get the chat full screen; a floating panel would be half hidden. */
  function isPhone() {
    return window.matchMedia('(max-width: 640px)').matches;
  }

  function isFullscreen() {
    return isOpen && isPhone();
  }

  function sendMode() {
    iframe?.contentWindow?.postMessage({ type: 'agenci:fullscreen', value: isFullscreen() }, widgetOrigin);
  }

  /** Full screen follows the visible viewport, so the on-screen keyboard never covers the input. */
  function fitToViewport() {
    if (!container || !isFullscreen()) return;
    const vv = window.visualViewport;
    container.style.top = `${vv ? vv.offsetTop : 0}px`;
    container.style.height = `${vv ? vv.height : window.innerHeight}px`;
  }

  function applyLayout() {
    if (!container) return;
    const side = position === 'bottom-right';
    if (isFullscreen()) {
      Object.assign(container.style, {
        top: '0', left: '0', right: '0', bottom: 'auto',
        width: '100%', maxWidth: 'none', maxHeight: 'none',
        borderRadius: '0', boxShadow: 'none',
      });
      fitToViewport();
      if (button) button.style.display = 'none';
      document.documentElement.style.overflow = 'hidden';
    } else {
      Object.assign(container.style, {
        top: 'auto', left: side ? 'auto' : '20px', right: side ? '20px' : 'auto', bottom: panelBottom,
        width: '400px', height: `${panelHeight}px`,
        maxWidth: 'calc(100vw - 40px)', maxHeight: 'calc(100vh - 110px)',
        borderRadius: '16px', boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)',
      });
      if (button) button.style.display = 'flex';
      document.documentElement.style.overflow = pageOverflow;
    }
    sendMode();
  }

  function toggleWidget() {
    if (isOpen) {
      hide();
    } else {
      show();
    }
  }
  
  function show() {
    if (container && button) {
      isOpen = true;
      pageOverflow = document.documentElement.style.overflow;
      container.style.display = 'block';
      applyLayout();
      // Trigger animation
      setTimeout(() => {
        if (container) {
          container.style.opacity = '1';
          container.style.transform = 'translateY(0)';
        }
      }, 10);
      // Change button icon to close
      button.innerHTML = closeIcon;
    }
  }
  
  function hide() {
    if (container && button) {
      isOpen = false;
      applyLayout();
      container.style.opacity = '0';
      container.style.transform = 'translateY(10px)';
      // Hide after animation
      setTimeout(() => {
        if (container) container.style.display = 'none';
      }, 300);
      // Change button icon back to chat
      button.innerHTML = chatBubbleIcon;
      button.style.background = bubbleColor;
      button.style.color = bubbleIconColor;
    }
  }
  
  function destroy() {
    window.removeEventListener('message', handleMessage);
    window.visualViewport?.removeEventListener('resize', fitToViewport);
    window.visualViewport?.removeEventListener('scroll', fitToViewport);
    window.removeEventListener('resize', applyLayout);
    if (isOpen) document.documentElement.style.overflow = pageOverflow;
    if (container) {
      container.remove();
      container = null;
      iframe = null;
    }
    if (button) {
      button.remove();
      button = null;
    }
    isOpen = false;
  }
  
  // Function to reinitialize with new config
  function reinit(newConfig: { organizationId?: string; position?: 'bottom-right' | 'bottom-left' }) {
    // Destroy existing widget
    destroy();
    
    // Update config
    if (newConfig.organizationId) {
      organizationId = newConfig.organizationId;
    }
    if (newConfig.position) {
      position = newConfig.position;
    }
    
    // Reinitialize
    init();
  }
  
  const api = { init: reinit, show, hide, destroy };
  (window as any).AgenciWidget = api;
  /** @deprecated Bruk window.AgenciWidget */
  (window as any).EchoWidget = api;
  
  // Auto-initialize
  init();
})();
