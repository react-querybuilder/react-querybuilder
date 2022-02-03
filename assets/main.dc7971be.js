var e=Object.defineProperty,t=Object.defineProperties,r=Object.getOwnPropertyDescriptors,a=Object.getOwnPropertySymbols,l=Object.prototype.hasOwnProperty,o=Object.prototype.propertyIsEnumerable,n=(t,r,a)=>r in t?e(t,r,{enumerable:!0,configurable:!0,writable:!0,value:a}):t[r]=a,s=(e,t)=>{for(var r in t||(t={}))l.call(t,r)&&n(e,r,t[r]);if(a)for(var r of a(t))o.call(t,r)&&n(e,r,t[r]);return e},c=(e,a)=>t(e,r(a));export function __vite_legacy_guard(){import("data:text/javascript,")}import{V as i,d as m,i as u,a as d,f as p,o as h,b as E,p as g,c as f,s as b,e as y,g as _,n as v,Q as k}from"./constants.d407188b.js";/* empty css                           */import{r as C,R as x,c as A,e as w,S as O,j as R,s as S,v as T,q as L,a as j,b as D,L as N,T as $,Q as P,d as I,C as V,B,f as z,g as Q,D as G,M as F,I as M,h as q,i as H,k as W}from"./vendor.db83fde5.js";const U={},J=function(e,t){return t&&0!==t.length?Promise.all(t.map((e=>{if((e=`/react-querybuilder/${e}`)in U)return;U[e]=!0;const t=e.endsWith(".css"),r=t?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${e}"]${r}`))return;const a=document.createElement("link");return a.rel=t?"stylesheet":"modulepreload",t||(a.as="script",a.crossOrigin=""),a.href=e,document.head.appendChild(a),t?new Promise(((e,t)=>{a.addEventListener("load",e),a.addEventListener("error",t)})):void 0}))).then((()=>e())):e()};var K=Object.defineProperty,X=Object.defineProperties,Y=Object.getOwnPropertyDescriptors,Z=Object.getOwnPropertySymbols,ee=Object.prototype.hasOwnProperty,te=Object.prototype.propertyIsEnumerable,re=(e,t,r)=>t in e?K(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r;const ae=C.exports.forwardRef((({className:e,title:t},r)=>x.createElement("span",{ref:r,className:e,title:t},x.createElement("i",{className:"bi bi-grip-vertical"}))));ae.displayName="BootstrapDragHandle";const le=({className:e,handleOnChange:t,title:r,label:a,checked:l,disabled:o})=>{const n=C.exports.useRef(`notToggle-${Math.random()}`);return x.createElement("div",{className:`form-check-inline form-switch ${e}`},x.createElement("input",{id:n.current,className:"form-check-input",type:"checkbox",onChange:e=>t(e.target.checked),checked:!!l,disabled:o}),x.createElement("label",{title:r,htmlFor:n.current,className:"form-check-label"},a))};le.displayName="BootstrapNotToggle";const oe=e=>{var t,r=e,{fieldData:a,operator:l,value:o,handleOnChange:n,title:s,className:c,type:m,inputType:u,values:d,disabled:p}=r,h=((e,t)=>{var r={};for(var a in e)ee.call(e,a)&&t.indexOf(a)<0&&(r[a]=e[a]);if(null!=e&&Z)for(var a of Z(e))t.indexOf(a)<0&&te.call(e,a)&&(r[a]=e[a]);return r})(r,["fieldData","operator","value","handleOnChange","title","className","type","inputType","values","disabled"]);if(C.exports.useEffect((()=>{"number"===u&&!["between","notBetween","in","notIn"].includes(l)&&"string"==typeof o&&o.includes(",")&&n("")}),[u,l,o,n]),"null"===l||"notNull"===l)return null;const E=null!=(t=null==a?void 0:a.placeholder)?t:"",g=["between","notBetween","in","notIn"].includes(l)?"text":u||"text";switch(m){case"select":case"multiselect":return x.createElement(i,(f=((e,t)=>{for(var r in t||(t={}))ee.call(t,r)&&re(e,r,t[r]);if(Z)for(var r of Z(t))te.call(t,r)&&re(e,r,t[r]);return e})({},h),X(f,Y({className:`${c} form-select form-select-sm`,title:s,handleOnChange:n,value:o,disabled:p,multiple:"multiselect"===m,options:d}))));case"textarea":return x.createElement("textarea",{value:o,title:s,className:c,disabled:p,placeholder:E,onChange:e=>n(e.target.value)});case"switch":return x.createElement("span",{className:`custom-control custom-switch ${c}`},x.createElement("input",{type:"checkbox",className:"form-check-input custom-control-input",title:s,disabled:p,onChange:e=>n(e.target.checked),checked:!!o}));case"checkbox":return x.createElement("input",{type:"checkbox",className:`form-check-input ${c}`,title:s,disabled:p,onChange:e=>n(e.target.checked),checked:!!o});case"radio":return x.createElement("span",{title:s},d.map((e=>x.createElement("div",{key:e.name,className:"form-check form-check-inline"},x.createElement("input",{className:"form-check-input",type:"radio",id:e.name,value:e.name,checked:o===e.name,disabled:p,onChange:e=>n(e.target.value)}),x.createElement("label",{className:"form-check-label",htmlFor:e.name},e.label)))))}var f;return x.createElement("input",{type:g,value:o,title:s,className:c,disabled:p,placeholder:E,onChange:e=>n(e.target.value)})};oe.displayName="BootstrapValueEditor";const ne=C.exports.lazy((()=>J((()=>import("./AntDActionElement.e6c012de.js")),["assets/AntDActionElement.e6c012de.js","assets/index.es.36e5afdb.js","assets/vendor.db83fde5.js"]))),se=C.exports.lazy((()=>J((()=>import("./AntDDragHandle.02b02094.js")),["assets/AntDDragHandle.02b02094.js","assets/index.es.36e5afdb.js","assets/vendor.db83fde5.js"]))),ce=C.exports.lazy((()=>J((()=>import("./AntDNotToggle.23252c7a.js")),["assets/AntDNotToggle.23252c7a.js","assets/index.es.36e5afdb.js","assets/vendor.db83fde5.js"]))),ie=C.exports.lazy((()=>J((()=>import("./AntDValueEditor.994e25f3.js")),["assets/AntDValueEditor.994e25f3.js","assets/index.es.36e5afdb.js","assets/vendor.db83fde5.js"]))),me=C.exports.lazy((()=>J((()=>import("./AntDValueSelector.8bfeebf8.js")),["assets/AntDValueSelector.8bfeebf8.js","assets/index.es.36e5afdb.js","assets/vendor.db83fde5.js"]))),ue=C.exports.lazy((()=>J((()=>import("./BootstrapDragHandle.f7bfc95a.js")),["assets/BootstrapDragHandle.f7bfc95a.js","assets/BootstrapDragHandle.430ddf3c.css","assets/github-fork-ribbon.4ace97a5.css","assets/constants.d407188b.js","assets/vendor.db83fde5.js"]))),de=C.exports.lazy((()=>J((()=>import("./BootstrapNotToggle.3d37180f.js")),["assets/BootstrapNotToggle.3d37180f.js","assets/github-fork-ribbon.4ace97a5.css","assets/constants.d407188b.js","assets/vendor.db83fde5.js"]))),pe=C.exports.lazy((()=>J((()=>import("./BootstrapValueEditor.17de30ce.js")),["assets/BootstrapValueEditor.17de30ce.js","assets/github-fork-ribbon.4ace97a5.css","assets/constants.d407188b.js","assets/vendor.db83fde5.js"]))),he=C.exports.lazy((()=>J((()=>import("./BulmaActionElement.3ba1efeb.js")),["assets/BulmaActionElement.3ba1efeb.js","assets/vendor.db83fde5.js","assets/index.es.9516a100.js"]))),Ee=C.exports.lazy((()=>J((()=>import("./BulmaNotToggle.5eb61037.js")),["assets/BulmaNotToggle.5eb61037.js","assets/vendor.db83fde5.js","assets/index.es.9516a100.js"]))),ge=C.exports.lazy((()=>J((()=>import("./BulmaValueEditor.99dd21df.js")),["assets/BulmaValueEditor.99dd21df.js","assets/vendor.db83fde5.js","assets/index.es.9516a100.js"]))),fe=C.exports.lazy((()=>J((()=>import("./BulmaValueSelector.4b1e8a4a.js")),["assets/BulmaValueSelector.4b1e8a4a.js","assets/vendor.db83fde5.js","assets/index.es.9516a100.js"]))),be=C.exports.lazy((()=>J((()=>import("./ChakraActionElement.732614b0.js")),["assets/ChakraActionElement.732614b0.js","assets/index.es.418fb53e.js","assets/vendor.db83fde5.js","assets/constants.d407188b.js"]))),ye=C.exports.lazy((()=>J((()=>import("./ChakraDragHandle.aa80fc88.js")),["assets/ChakraDragHandle.aa80fc88.js","assets/index.es.418fb53e.js","assets/vendor.db83fde5.js","assets/constants.d407188b.js"]))),_e=C.exports.lazy((()=>J((()=>import("./ChakraNotToggle.dc6eea1c.js")),["assets/ChakraNotToggle.dc6eea1c.js","assets/index.es.418fb53e.js","assets/vendor.db83fde5.js","assets/constants.d407188b.js"]))),ve=C.exports.lazy((()=>J((()=>import("./ChakraValueEditor.c189d00f.js")),["assets/ChakraValueEditor.c189d00f.js","assets/index.es.418fb53e.js","assets/vendor.db83fde5.js","assets/constants.d407188b.js"]))),ke=C.exports.lazy((()=>J((()=>import("./ChakraValueSelector.4e8fcce7.js")),["assets/ChakraValueSelector.4e8fcce7.js","assets/index.es.418fb53e.js","assets/vendor.db83fde5.js","assets/constants.d407188b.js"]))),Ce=C.exports.lazy((()=>J((()=>import("./MaterialActionElement.b6948d80.js")),["assets/MaterialActionElement.b6948d80.js","assets/index.es.6feaf959.js","assets/vendor.db83fde5.js"]))),xe=C.exports.lazy((()=>J((()=>import("./MaterialDragHandle.06307fe8.js")),["assets/MaterialDragHandle.06307fe8.js","assets/index.es.6feaf959.js","assets/vendor.db83fde5.js"]))),Ae=C.exports.lazy((()=>J((()=>import("./MaterialNotToggle.01d7ff05.js")),["assets/MaterialNotToggle.01d7ff05.js","assets/index.es.6feaf959.js","assets/vendor.db83fde5.js"]))),we=C.exports.lazy((()=>J((()=>import("./MaterialValueEditor.9805de57.js")),["assets/MaterialValueEditor.9805de57.js","assets/index.es.6feaf959.js","assets/vendor.db83fde5.js"]))),Oe=C.exports.lazy((()=>J((()=>import("./MaterialValueSelector.786c5186.js")),["assets/MaterialValueSelector.786c5186.js","assets/index.es.6feaf959.js","assets/vendor.db83fde5.js"]))),Re={default:{},bootstrap:{controlClassnames:{addGroup:"btn btn-secondary btn-sm",addRule:"btn btn-primary btn-sm",cloneGroup:"btn btn-secondary btn-sm",cloneRule:"btn btn-secondary btn-sm",lockGroup:"btn btn-secondary btn-sm",lockRule:"btn btn-secondary btn-sm",removeGroup:"btn btn-danger btn-sm",removeRule:"btn btn-danger btn-sm",combinators:"form-select form-select-sm",fields:"form-select form-select-sm",operators:"form-select form-select-sm",value:"form-control form-control-sm",valueSource:"form-select form-select-sm"},controlElements:{dragHandle:ue,notToggle:de,valueEditor:pe}},antd:{controlElements:{addGroupAction:ne,addRuleAction:ne,cloneGroupAction:ne,cloneRuleAction:ne,lockGroupAction:ne,lockRuleAction:ne,combinatorSelector:me,fieldSelector:me,notToggle:ce,operatorSelector:me,removeGroupAction:ne,removeRuleAction:ne,valueEditor:ie,dragHandle:se,valueSourceSelector:me}},material:{controlElements:{addGroupAction:Ce,addRuleAction:Ce,cloneGroupAction:Ce,cloneRuleAction:Ce,lockGroupAction:Ce,lockRuleAction:Ce,combinatorSelector:Oe,fieldSelector:Oe,notToggle:Ae,operatorSelector:Oe,removeGroupAction:Ce,removeRuleAction:Ce,valueEditor:we,dragHandle:xe,valueSourceSelector:Oe}},chakra:{controlElements:{addGroupAction:be,addRuleAction:be,cloneGroupAction:be,cloneRuleAction:be,lockGroupAction:be,lockRuleAction:be,combinatorSelector:ke,fieldSelector:ke,notToggle:_e,operatorSelector:ke,removeGroupAction:be,removeRuleAction:be,valueEditor:ve,dragHandle:ye,valueSourceSelector:ke}},bulma:{controlElements:{addGroupAction:he,addRuleAction:he,cloneGroupAction:he,cloneRuleAction:he,lockGroupAction:he,lockRuleAction:he,combinatorSelector:fe,fieldSelector:fe,notToggle:Ee,operatorSelector:fe,removeGroupAction:he,removeRuleAction:he,valueEditor:ge,valueSourceSelector:fe}}},{TextArea:Se}=M,{Header:Te,Sider:Le,Content:je}=N,{Option:De}=I,{Link:Ne,Text:$e,Title:Pe}=q,Ie=A(),Ve=w({config:{initialColorMode:"light",useSystemColorMode:!1}});O.registerLanguage("json",R),O.registerLanguage("json_without_ids",R),O.registerLanguage("mongodb",R),O.registerLanguage("parameterized",R),O.registerLanguage("parameterized_named",R),O.registerLanguage("sql",S);const Be=c(s({},T),{hljs:c(s({},T.hljs),{backgroundColor:"#eeeeee",border:"1px solid gray",borderRadius:4,fontFamily:"Consolas, 'Courier New', monospace",fontSize:"small",padding:"1rem",minWidth:405,whiteSpace:"pre-wrap"})}),ze=({children:e})=>x.createElement(x.Fragment,null,e),Qe=e=>{var t,r,a,l,o,n,s,c,i,u,d,p;return{showCombinatorsBetweenRules:"true"===(null!=(t=e.showCombinatorsBetweenRules)?t:`${m.showCombinatorsBetweenRules}`),showNotToggle:"true"===(null!=(r=e.showNotToggle)?r:`${m.showNotToggle}`),showCloneButtons:"true"===(null!=(a=e.showCloneButtons)?a:`${m.showCloneButtons}`),showLockButtons:"true"===(null!=(l=e.showLockButtons)?l:`${m.showLockButtons}`),resetOnFieldChange:"true"===(null!=(o=e.resetOnFieldChange)?o:`${m.resetOnFieldChange}`),resetOnOperatorChange:"true"===(null!=(n=e.resetOnOperatorChange)?n:`${m.resetOnOperatorChange}`),autoSelectField:"true"===(null!=(s=e.autoSelectField)?s:`${m.autoSelectField}`),addRuleToNewGroups:"true"===(null!=(c=e.addRuleToNewGroups)?c:`${m.addRuleToNewGroups}`),validateQuery:"true"===(null!=(i=e.validateQuery)?i:`${m.validateQuery}`),independentCombinators:"true"===(null!=(u=e.independentCombinators)?u:`${m.independentCombinators}`),enableDragAndDrop:"true"===(null!=(d=e.enableDragAndDrop)?d:`${m.enableDragAndDrop}`),disabled:"true"===(null!=(p=e.disabled)?p:`${m.disabled}`)}},Ge=Qe(L.parse(location.hash)),Fe=()=>{const[e,t]=C.exports.useState(u),[r,a]=C.exports.useState(d),[l,o]=C.exports.useState("json_without_ids"),[n,i]=C.exports.useState(Ge),[A,w]=C.exports.useState(!1),[R,S]=C.exports.useState(`SELECT *\n  FROM my_table\n WHERE ${p(u,"sql")};`),[T,j]=C.exports.useState(""),[M,q]=C.exports.useState("default"),[U,J]=C.exports.useState("Copy link"),K=C.exports.useMemo((()=>`#${L.stringify(n)}`),[n]);C.exports.useEffect((()=>{history.pushState(null,"",K);const e=e=>{var t;const r=Qe(L.parse(null!=(t=L.parseUrl(e.newURL,{parseFragmentIdentifier:!0}).fragmentIdentifier)?t:""));i(r)};return window.addEventListener("hashchange",e),()=>window.removeEventListener("hashchange",e)}),[K]);const X=C.exports.useCallback((e=>t=>i((r=>c(s({},r),{[e]:t})))),[]),Y=C.exports.useMemo((()=>["showCombinatorsBetweenRules","showNotToggle","showCloneButtons","showLockButtons","resetOnFieldChange","resetOnOperatorChange","autoSelectField","addRuleToNewGroups","validateQuery","independentCombinators","enableDragAndDrop","disabled"].map((e=>c(s({},h[e]),{default:m[e],checked:n[e],setter:X(e)})))),[n,X]),Z=C.exports.useCallback((()=>Y.forEach((e=>e.checked!==e.default?e.setter(e.default):null))),[Y]),ee=C.exports.useCallback((()=>Y.forEach((e=>e.setter(e.label!==h.disabled.label)))),[Y]),te=C.exports.useMemo((()=>n.validateQuery?{format:l,fields:E}:{format:l}),[l,n.validateQuery]),re=n.independentCombinators?r:e,ae=C.exports.useMemo((()=>"json_without_ids"===te.format||"mongodb"===te.format?JSON.stringify(JSON.parse(p(re,te)),null,2):"parameterized"===te.format||"parameterized_named"===te.format?JSON.stringify(p(re,te),null,2):p(re,te)),[te,re]),le=`with-${M}${n.validateQuery?" validateQuery":""}`,oe=C.exports.useCallback((()=>{try{const e=g(R),r=g(R,{independentCombinators:!0});t(e),a(r),w(!1),j("")}catch(e){j(e.message)}}),[R]),ne="material"===M?H:ze,se="chakra"===M?W:ze,ce=C.exports.useMemo((()=>c(s(c(s({},Re[M]),{fields:E}),n),{validator:n.validateQuery?f:void 0})),[M,n]),ie=C.exports.useMemo((()=>x.createElement("div",{className:"loading-placeholder"},x.createElement(D,null),x.createElement("div",null,"Loading ",b[M]," components..."))),[M]);return x.createElement(x.Fragment,null,x.createElement(N,null,x.createElement(Te,null,x.createElement(Pe,{level:3,style:{display:"inline-block"}},x.createElement("a",{href:y},"React Query Builder Demo"))),x.createElement(N,null,x.createElement(Le,{theme:"light",width:260,style:{padding:"1rem"}},x.createElement(Pe,{level:4},"Style"," ",x.createElement("a",{href:`${y}/docs/compat`,target:"_blank",rel:"noreferrer"},x.createElement($,{title:"Use first-party alternate QueryBuilder components designed for popular style libraries (click for documentation)",placement:"right"},x.createElement(P,null)))),x.createElement(I,{value:M,onChange:q,dropdownMatchSelectWidth:!1,style:{minWidth:100}},["default","bootstrap","material","antd","chakra","bulma"].map((e=>x.createElement(De,{key:e,value:e},b[e])))),x.createElement(Pe,{level:4,style:{marginTop:"1rem"}},"Options"," ",x.createElement("a",{href:`${y}/docs/api/querybuilder`,target:"_blank",rel:"noreferrer"},x.createElement($,{title:"Boolean props on the QueryBuilder component (click for documentation)",placement:"right"},x.createElement(P,null)))),x.createElement("div",null,Y.map((({checked:e,label:t,link:r,setter:a,title:l})=>x.createElement("div",{key:t},x.createElement(V,{checked:e,onChange:e=>a(e.target.checked)},t," ",x.createElement("a",{href:`${y}${r}`,target:"_blank",rel:"noreferrer"},x.createElement($,{title:`${l} (click for documentation)`,placement:"right"},x.createElement(P,null))))))),x.createElement("div",{style:{display:"flex",flexDirection:"row",justifyContent:"space-between",marginTop:"0.5rem"}},x.createElement($,{title:"Reset the options above to their default values",placement:"right"},x.createElement(B,{type:"default",onClick:Z},"Reset")),x.createElement($,{title:`Enable all features except "${h.disabled.label}"`,placement:"right"},x.createElement(B,{type:"default",onClick:ee},"Select all")),x.createElement($,{title:"Copy a URL that will load this demo with the options set as they are currently",placement:"right"},x.createElement(B,{type:"default",onClick:async()=>{try{await navigator.clipboard.writeText(`${location.origin}${location.pathname}${K}`),J("Copied!")}catch(e){console.error("Clipboard error",e)}setTimeout((()=>J("Copy link")),1214)}},U)))),x.createElement(Pe,{level:4,style:{marginTop:"1rem"}},"Export"," ",x.createElement("a",{href:`${y}/docs/api/export`,target:"_blank",rel:"noreferrer"},x.createElement($,{title:"The export format of the formatQuery function (click for documentation)",placement:"right"},x.createElement(P,null)))),x.createElement("div",{style:{display:"flex",justifyContent:"space-between",flexDirection:"column"}},_.map((({fmt:e,lbl:t})=>x.createElement(z,{key:e,checked:l===e,onChange:()=>o(e)},t," ",x.createElement($,{title:`formatQuery(query, "${e}")`,placement:"right"},x.createElement(P,null)))))),x.createElement(Pe,{level:4,style:{marginTop:"1rem"}},"Import"," ",x.createElement("a",{href:`${y}/docs/api/import`,target:"_blank",rel:"noreferrer"},x.createElement($,{title:"Use the parseSQL method to set the query from SQL (click for documentation)",placement:"right"},x.createElement(P,null)))),x.createElement(B,{onClick:()=>w(!0)},"Load from SQL"),x.createElement(Pe,{level:4,style:{marginTop:"1rem"}},"Installation"," ",x.createElement(Ne,{href:v,target:"_blank"},x.createElement(Q,null))),x.createElement("pre",null,"npm i react-querybuilder"),"OR",x.createElement("pre",null,"yarn add react-querybuilder"),x.createElement(Pe,{level:4,style:{marginTop:"1rem"}},"Links"),x.createElement("p",null,x.createElement("a",{href:"ie11.html"},"IE-compatible demo")),x.createElement("p",null,"UMD build: ",x.createElement("a",{href:"umd.html"},"demo")," / ",x.createElement("a",{href:`${y}/docs/umd`},"docs"))),x.createElement(je,{style:{backgroundColor:"#ffffff",padding:"1rem 1rem 0 0"}},x.createElement(se,{theme:Ve},x.createElement(ne,{theme:Ie},x.createElement(C.exports.Suspense,{fallback:ie},x.createElement("div",{className:le},x.createElement("form",{className:"form-inline",style:{marginTop:"1rem"}},n.independentCombinators?x.createElement(k,c(s({},ce),{independentCombinators:!0,key:M,query:r,onQueryChange:e=>a(e)})):x.createElement(k,c(s({},ce),{independentCombinators:!1,key:M,query:e,onQueryChange:e=>t(e)}))))))),"default"!==M&&x.createElement(x.Fragment,null,"To use the official React Query Builder components for ",b[M]," in your project, install"," ",x.createElement(Ne,{target:"_blank",href:`https://www.npmjs.com/package/@react-querybuilder/${M}`},"@react-querybuilder/",M),"."),x.createElement(G,null),x.createElement(O,{language:l,style:Be},ae)))),x.createElement(F,{title:"Load Query From SQL",visible:A,onOk:oe,onCancel:()=>w(!1)},x.createElement(Se,{value:R,onChange:e=>S(e.target.value),spellCheck:!1,style:{height:200,fontFamily:"monospace"}}),x.createElement($e,{italic:!0},"SQL string can either be the full ",x.createElement($e,{code:!0},"SELECT")," statement or the"," ",x.createElement($e,{code:!0},"WHERE"),' clause by itself (without the word "WHERE" -- just the clauses). A trailing semicolon is also optional.'),!!T&&x.createElement("pre",null,T)))};j.render(x.createElement(Fe,null),document.getElementById("app"));export{ae as B,le as a,oe as b};
//# sourceMappingURL=main.dc7971be.js.map
