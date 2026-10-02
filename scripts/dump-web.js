// Step 1 of the one-off data extraction: dumps the web app's data to JSON.
// Usage: node scripts/dump-web.js path/to/exam.html out.json
const load=require('./load-web.js');
const d=load(process.argv[2]);
const ser=o=>JSON.stringify(o,(k,v)=>typeof v==='function'?'__FN__'+v.toString():v);
require('fs').writeFileSync(process.argv[3],ser(d));
