import sharp from "sharp";
import { writeFile } from "node:fs/promises";
const variants=[];
for(const width of [480,768,1280,1536]){
  for(const format of ["avif","webp"]){
    const output=`public/images/hero-nook-${width}.${format}`;
    const pipeline=sharp("public/images/hero-nook.webp").resize({width,withoutEnlargement:true});
    const info=await (format==="avif"?pipeline.avif({quality:50,effort:6}):pipeline.webp({quality:76})).toFile(output);
    variants.push({path:`/${output.replace(/^public\//,"")}`,width:info.width,height:info.height,bytes:info.size,format});
  }
}
await writeFile("docs/hero-variants.json",JSON.stringify({source:"/images/hero-nook.webp",provenance:"Derived from the independently generated hero recorded in asset-manifest.json; same rights and alt text.",variants},null,2));
console.log("Prepared responsive static hero variants; no request-time transformation needed for the default hero.");
