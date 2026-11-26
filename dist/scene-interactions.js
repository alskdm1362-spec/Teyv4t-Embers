// Depth uses feet on the battlefield, never party order. Dragging a roster is not a selection.
export function sortSceneDepth(root=document){
 for(const field of root.querySelectorAll?.('.battle-field,.event-field')||[]){
  const units=[...field.querySelectorAll('.allies>.fighter,.enemies>.enemy')];
  const foot=el=>(el.querySelector('.sprite')||el).getBoundingClientRect().bottom;
  units.sort((a,b)=>foot(a)-foot(b));units.forEach((el,i)=>el.style.zIndex=String(20+i));
 }
}
const connected=new WeakMap();
export function connectDragRails(root=document){for(const rail of root.querySelectorAll('[data-drag-scroll]')){
 if(connected.has(rail)){connected.get(rail)();continue;}let drag=null,suppress=false,resetTimer;
 const edges=()=>{rail.dataset.atStart=String(rail.scrollLeft<2);rail.dataset.atEnd=String(rail.scrollLeft+rail.clientWidth>=rail.scrollWidth-2);};
 connected.set(rail,edges);rail.addEventListener('scroll',edges,{passive:true});rail.addEventListener('load',edges,true);edges();
 rail.addEventListener('pointerdown',e=>{if(e.button!==0)return;clearTimeout(resetTimer);suppress=false;drag={id:e.pointerId,x:e.clientX,start:rail.scrollLeft,moved:false};});
 rail.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x;if(!drag.moved&&Math.abs(dx)<6)return;if(!drag.moved){drag.moved=true;rail.setPointerCapture(e.pointerId);rail.classList.add('is-dragging');}e.preventDefault();rail.scrollLeft=drag.start-dx;edges();});
 const finish=()=>{if(!drag)return;suppress=drag.moved;drag=null;rail.classList.remove('is-dragging');resetTimer=setTimeout(()=>suppress=false,250);};
 rail.addEventListener('pointerup',finish);rail.addEventListener('pointercancel',finish);
 rail.addEventListener('click',e=>{if(suppress){suppress=false;e.preventDefault();e.stopImmediatePropagation();}},true);
 rail.addEventListener('keydown',e=>{if(e.target!==rail)return;if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();rail.scrollLeft=e.key==='Home'?0:e.key==='End'?rail.scrollWidth:rail.scrollLeft+(e.key==='ArrowLeft'?-180:180);edges();}});
 }}
