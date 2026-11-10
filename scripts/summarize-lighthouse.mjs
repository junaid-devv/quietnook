import {readFile,writeFile} from "node:fs/promises";
const files=[1,2,3].map(i=>`output/lighthouse-static-hero-mobile-${i}.json`);
const reports=await Promise.all(files.map(async file=>({file,report:JSON.parse(await readFile(file,"utf8"))})));
const runs=reports.map(({file,report:r})=>({file,date:r.fetchTime,requestedUrl:r.requestedUrl,
  scores:Object.fromEntries(Object.entries(r.categories).map(([name,c])=>[name,Math.round(c.score*100)])),
  lcp_ms:r.audits['largest-contentful-paint'].numericValue,
  cls:r.audits['cumulative-layout-shift'].numericValue,
  tbt_ms:r.audits['total-blocking-time'].numericValue,
  transferred_bytes:r.audits['total-byte-weight'].numericValue,
  settings:{formFactor:r.configSettings.formFactor,throttlingMethod:r.configSettings.throttlingMethod,throttling:r.configSettings.throttling,screenEmulation:r.configSettings.screenEmulation},
}));
const median=values=>[...values].sort((a,b)=>a-b)[Math.floor(values.length/2)];
const summary={date:new Date().toISOString(),environment:"Windows, Node 22.15, connected Next.js production-mode build, loopback port 3004, Lighthouse 12.8.2, simulated mobile throttling; static responsive hero; no public deployment",runs,
  median:{scores:Object.fromEntries(Object.keys(runs[0].scores).map(key=>[key,median(runs.map(r=>r.scores[key]))])),lcp_ms:median(runs.map(r=>r.lcp_ms)),cls:median(runs.map(r=>r.cls)),tbt_ms:median(runs.map(r=>r.tbt_ms)),transferred_bytes:median(runs.map(r=>r.transferred_bytes))},
  earlier_runs:[{file:"output/lighthouse-mobile-1.json",note:"Baseline: staging noindex intentionally reduces SEO score; request-time hero optimization"},{file:"output/lighthouse-final-mobile-1.json",note:"Intermediate hero-priority run overlapped automated tests; retained for transparency, excluded from final consistent three-run median"}],
  interruptions:["An attempted second final run failed to start because the disk was full. It produced no valid measurement. Only task-generated build caches were cleared before retrying."],
  limitations:["Lab LCP/CLS are not real-user 75th-percentile measurements. INP and field Core Web Vitals remain unavailable without real traffic.","Local serving omits deployed CDN/hosting latency and cannot establish WCAG conformance.","The 26-route SEO audit is separate; Lighthouse category scores here apply only to the homepage.","Only default-hero assets are measured; remeasure after selecting other hero/media, analytics, ads or integrations."]};
await writeFile("docs/lighthouse-summary.json",JSON.stringify(summary,null,2));
console.log(JSON.stringify(summary.median,null,2));
