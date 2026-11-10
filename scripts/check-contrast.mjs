import assert from 'node:assert/strict';
import {readFile, writeFile} from 'node:fs/promises';
const css=(await readFile('src/app/globals.css','utf8'))+'\n'+(await readFile('src/app/public-design.css','utf8'));
const tokens=Object.fromEntries([...css.matchAll(/--([a-z]+):\s*(#[0-9a-f]{6});/gi)].map(m=>[m[1],m[2]]));
const footer=[...css.matchAll(/\.site-footer\s*\{[^}]*background:\s*(#[0-9a-f]{6})/gi)].at(-1)?.[1];
assert.ok(footer,'Footer background must be found in the actual stylesheet');
assert.match(css,/input::placeholder,\s*textarea::placeholder\s*\{\s*color: var\(--muted\);\s*opacity: 1;/);
function luminance(hex){
  const channels=hex.slice(1).match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
  return channels.reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
}
function ratio(a,b){const values=[luminance(a),luminance(b)].sort((x,y)=>y-x);return (values[0]+.05)/(values[1]+.05);}
const checks=[];
for(const text of ['forest','rust','ink','muted'])for(const [surface,bg] of [['cream',tokens.cream],['white','#ffffff'],['peach',tokens.peach],['footer',footer]]){
  const contrast=ratio(tokens[text],bg); checks.push({text,surface,foreground:tokens[text],background:bg,ratio:Number(contrast.toFixed(2)),minimum:4.5,pass:contrast>=4.5});
}
const button=ratio('#ffffff',tokens.rust); checks.push({text:'white button label',surface:'rust',foreground:'#ffffff',background:tokens.rust,ratio:Number(button.toFixed(2)),minimum:4.5,pass:button>=4.5});
const report={date:new Date().toISOString(),method:'WCAG relative luminance ratios from the actual CSS tokens, explicit footer surface, and white button label. Placeholder color explicitly uses the muted token at full opacity.',checks,limitations:'Checks only these named solid-color pairs. Does not audit every component, imagery/gradients, disabled controls, focus area, or assistive-technology behavior; not a WCAG conformance claim.'};
await writeFile('docs/contrast.json',JSON.stringify(report,null,2)+'\n');
for(const check of checks)assert.ok(check.pass,`${check.text} on ${check.surface}: ${check.ratio}:1`);
console.log(`PASS ${checks.length} text/background pairs at 4.5:1 or greater; report: docs/contrast.json`);
