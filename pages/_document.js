import Document_, { Head, Main, NextScript } from 'next/document'
import { GA_ID } from '../lib/metrics'

export default class Document extends Document_ {
  render() {
    return (
      <html lang="en">
        <Head />
        <body>
          <Main />
          <NextScript />
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `
            }}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                !function(g,s,q,r,d){r=g[r]=g[r]||function(){(r.q=r.q||[]).push(
                arguments)};d=s.createElement(q);q=s.getElementsByTagName(q)[0];
                d.src='//d1l6p2sc9645hc.cloudfront.net/tracker.js';q.parentNode.
                insertBefore(d,q)}(window,document,'script','_gs');

                _gs('GSN-501242-S');
                _gs('set', 'trackLocal', true);
              `
            }}
          />
        </body>
      </html>
    )
  }
}
