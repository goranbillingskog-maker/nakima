import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="sv">
      <head>
        <script
          id="domain-lock"
          dangerouslySetInnerHTML={{
            __html: `try{var host=window.location.hostname;var isAllowed=(host==='nakima.se'||host==='www.nakima.se'||host==='localhost'||host==='127.0.0.1'||host.endsWith('.vercel.app')||host.endsWith('.local'));if(!isAllowed){window.location.replace('https://nakima.se'+window.location.pathname+window.location.search);}}catch(e){}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
