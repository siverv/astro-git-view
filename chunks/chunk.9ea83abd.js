function m(){return new Intl.RelativeTimeFormat("en",{localeMatcher:"best fit",numeric:"always",style:"short"})}const n=m();function f(a){return a.toISOString().replace("T"," ").slice(0,-8)}function d(a){const e=Date.now()-a,l=1e3,i=60*l,o=60*i,s=24*o,c=30*s;let t;return Math.abs(e)<i?t=n.format(-e/l|0,"seconds"):Math.abs(e)<o?t=n.format(-e/i|0,"minutes"):Math.abs(e)<s?t=n.format(-e/o|0,"hour"):Math.abs(e)<c?t=n.format(-e/s|0,"day"):t=f(a),t}class r extends HTMLElement{connectedCallback(){const e=new Date(this.getAttribute("title"));this.textContent=d(e)}}window.customElements.get("relative-datetime")||(window.RelativeDateTimeElement=r,window.customElements.define("relative-datetime",r));