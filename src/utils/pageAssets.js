import { useEffect } from 'react';

function loadStylesheet(href, marker) {
  return new Promise((resolve) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.setAttribute('data-react-asset', marker);
    link.onload = resolve;
    link.onerror = resolve;
    document.head.appendChild(link);
  });
}

function loadScript(src, marker) {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.setAttribute('data-react-asset', marker);
    script.onload = resolve;
    script.onerror = resolve;
    document.body.appendChild(script);
  });
}

export function usePageAssets({ styles = [], scripts = [], fireReadyEvents = true }) {
  useEffect(() => {
    let cancelled = false;
    const marker = `asset-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const stylesWithTheme = [...styles, '/ui-theme.css'];

    async function run() {
      for (const href of stylesWithTheme) {
        if (cancelled) return;
        await loadStylesheet(href, marker);
      }

      for (const src of scripts) {
        if (cancelled) return;
        await loadScript(src, marker);
      }

      if (!cancelled && fireReadyEvents) {
        document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true }));
        window.dispatchEvent(new Event('load'));
      }
    }

    run();

    return () => {
      cancelled = true;
      document
        .querySelectorAll(`[data-react-asset="${marker}"]`)
        .forEach((el) => el.remove());
    };
  }, [fireReadyEvents, scripts, styles]);
}
