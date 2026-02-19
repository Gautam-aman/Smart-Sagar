import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function normalizePagePath(pathname) {
  if (!pathname || pathname === '/') {
    return '/index.html';
  }

  if (pathname.endsWith('/')) {
    return `${pathname}index.html`;
  }

  return pathname;
}

function isExternalUrl(value) {
  return /^(https?:|mailto:|tel:|javascript:|#|\/\/)/i.test(value);
}

function resolveLegacyAsset(value, pagePath) {
  if (!value || isExternalUrl(value)) {
    return value;
  }

  if (value.startsWith('/legacy/')) {
    return value;
  }

  if (value.startsWith('/')) {
    return value;
  }

  const absolute = new URL(value, `http://localhost/legacy${pagePath}`);
  return `${absolute.pathname}${absolute.search}${absolute.hash}`;
}

function resolveRouteHref(value, currentPath) {
  if (!value || isExternalUrl(value)) {
    return value;
  }

  const absolute = new URL(value, `http://localhost${currentPath}`);
  const pathname = absolute.pathname.startsWith('/legacy/')
    ? absolute.pathname.slice('/legacy'.length)
    : absolute.pathname;

  return `${pathname}${absolute.search}${absolute.hash}`;
}

async function loadScriptsSequentially(scripts, pagePath, marker) {
  for (const parsedScript of scripts) {
    await new Promise((resolve) => {
      const script = document.createElement('script');
      script.setAttribute('data-legacy', marker);

      for (const attr of parsedScript.attributes) {
        if (attr.name === 'src') {
          script.src = resolveLegacyAsset(attr.value, pagePath);
        } else {
          script.setAttribute(attr.name, attr.value);
        }
      }

      if (!parsedScript.src) {
        script.textContent = parsedScript.textContent;
      }

      script.onload = resolve;
      script.onerror = resolve;
      document.body.appendChild(script);

      if (!parsedScript.src) {
        resolve();
      }
    });
  }
}

export default function LegacyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [error, setError] = useState('');

  const pagePath = useMemo(
    () => normalizePagePath(decodeURIComponent(location.pathname)),
    [location.pathname]
  );

  useEffect(() => {
    let cancelled = false;
    const marker = `legacy-${Date.now()}`;

    async function hydrateLegacyPage() {
      setError('');

      const response = await fetch(`/legacy${pagePath}`, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Unable to load page: ${pagePath}`);
      }

      const html = await response.text();
      if (cancelled || !containerRef.current) {
        return;
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      document.title = doc.title || 'Sagar Saathi';
      containerRef.current.innerHTML = doc.body ? doc.body.innerHTML : html;

      containerRef.current
        .querySelectorAll('img[src], source[src], video[src], audio[src], iframe[src]')
        .forEach((node) => {
          const value = node.getAttribute('src');
          node.setAttribute('src', resolveLegacyAsset(value, pagePath));
        });

      containerRef.current.querySelectorAll('form[action]').forEach((node) => {
        const value = node.getAttribute('action');
        node.setAttribute('action', resolveLegacyAsset(value, pagePath));
      });

      const styleNodes = [];

      doc.querySelectorAll('link[rel="stylesheet"], link[rel="preconnect"], link[rel="icon"]').forEach((parsedLink) => {
        const link = document.createElement('link');
        for (const attr of parsedLink.attributes) {
          if (attr.name === 'href') {
            link.setAttribute('href', resolveLegacyAsset(attr.value, pagePath));
          } else {
            link.setAttribute(attr.name, attr.value);
          }
        }
        link.setAttribute('data-legacy', marker);
        document.head.appendChild(link);
        styleNodes.push(link);
      });

      doc.querySelectorAll('style').forEach((parsedStyle) => {
        const style = document.createElement('style');
        style.textContent = parsedStyle.textContent;
        style.setAttribute('data-legacy', marker);
        document.head.appendChild(style);
        styleNodes.push(style);
      });

      const themeLink = document.createElement('link');
      themeLink.rel = 'stylesheet';
      themeLink.href = '/ui-theme.css';
      themeLink.setAttribute('data-legacy', marker);
      document.head.appendChild(themeLink);
      styleNodes.push(themeLink);

      const scripts = Array.from(doc.querySelectorAll('script'));
      await loadScriptsSequentially(scripts, pagePath, marker);

      document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true }));
      window.dispatchEvent(new Event('load'));
    }

    hydrateLegacyPage().catch((err) => {
      if (!cancelled) {
        setError(err.message);
      }
    });

    return () => {
      cancelled = true;
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      document
        .querySelectorAll(`[data-legacy="${marker}"]`)
        .forEach((node) => node.remove());
    };
  }, [pagePath]);

  const handleClick = (event) => {
    const anchor = event.target.closest('a[href]');
    if (!anchor) {
      return;
    }

    const href = anchor.getAttribute('href');
    if (!href || isExternalUrl(href)) {
      return;
    }

    event.preventDefault();
    const route = resolveRouteHref(href, pagePath);
    navigate(route);
  };

  if (error) {
    return (
      <main className="app-shell">
        <div className="legacy-error">{error}</div>
      </main>
    );
  }

  return (
    <main className="app-shell" onClick={handleClick}>
      <div ref={containerRef} />
    </main>
  );
}
