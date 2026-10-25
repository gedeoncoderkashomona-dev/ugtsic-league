import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'UGTSIC League — Futebol Corporativo SESAP / G Trigueiro',
  description:
    'App de Futebol Society e Sorteio Inteligente para o setor de desenvolvimento da UGTSIC / SESAP / G Trigueiro.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'UGTSIC League',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#16a34a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-ugtsic-arena min-h-screen text-slate-900 antialiased pb-20 md:pb-8">
        <div id="ugtsic-app-root">{children}</div>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function cleanNetlifyBadges() {
                  try {
                    var selectors = [
                      '[data-netlify-deploy-drawer]',
                      'iframe[src*="netlify"]',
                      'a[href*="netlify.com"]',
                      '[id*="netlify"]',
                      '[class*="netlify"]'
                    ];
                    selectors.forEach(function(sel) {
                      document.querySelectorAll(sel).forEach(function(el) {
                        if (!el.closest('#ugtsic-app-root')) {
                          el.remove();
                        }
                      });
                    });
                    document.querySelectorAll('body > *').forEach(function(el) {
                      if (
                        el.id !== 'ugtsic-app-root' &&
                        el.tagName !== 'SCRIPT' &&
                        el.tagName !== 'STYLE' &&
                        el.tagName !== 'LINK' &&
                        el.tagName !== 'NEXT-ROUTE-ANNOUNCER'
                      ) {
                        var txt = (el.innerText || el.textContent || '').toLowerCase();
                        if (txt.indexOf('powered by netlify') !== -1 || txt.indexOf('netlify') !== -1 || el.shadowRoot) {
                          el.style.setProperty('display', 'none', 'important');
                          el.remove();
                        }
                      }
                    });
                  } catch (e) {}
                }
                cleanNetlifyBadges();
                setInterval(cleanNetlifyBadges, 800);
                if (typeof MutationObserver !== 'undefined') {
                  var obs = new MutationObserver(cleanNetlifyBadges);
                  obs.observe(document.documentElement, { childList: true, subtree: true });
                }
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
