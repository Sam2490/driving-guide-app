// Loads the web app's script in a sandbox and returns its data objects.
const fs=require('fs'),vm=require('vm');
module.exports=function load(file){
  const h=fs.readFileSync(file,'utf8');
  let code=[...h.matchAll(/<script>([\s\S]*?)<\/script>/g)].pop()[1];
  code=code.replace("ReactDOM.createRoot(document.getElementById('root')).render(html`<${App}/>`);",
   "globalThis.__d={Q,IMG,SA,BOOK,GUIDE,GUIDE_L,I18N,GT,STEPS,SCH,CITY,TIRES,P,GR,LANGS,BR,N,MIN,PASS,LV,HP,PER,RK,NL,ORDER};");
  const noop=()=>null;
  const ctx={localStorage:{getItem:()=>null,setItem:noop},document:{documentElement:{setAttribute:noop}},
    React:{useState:noop,createElement:noop,createContext:()=>({}),useContext:noop,useEffect:noop,useRef:noop,Fragment:'f'},
    htm:{bind:()=>noop},ReactDOM:{},navigator:{},window:{},console};
  vm.createContext(ctx);vm.runInContext(code,ctx);
  if(!ctx.__d) throw new Error('marker not found');
  return ctx.__d;
};
