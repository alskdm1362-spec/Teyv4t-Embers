/* A scene uses either viewport pixels or one uniformly scaled design canvas. */
export function sceneLayout(width,height,phase){
 width=Math.max(1,Number(width)||1);height=Math.max(1,Number(height)||1);
 if(['refine','cardReward','eventRemove'].includes(phase)){const k=uiScale(width,height);return {width:width/k,height:height/k,scale:k};}
 if(['title','recruit','arrival','joinDialogue'].includes(phase))return {width,height,scale:1};
 if(phase==='lobby')return {width:1280,height:720,scale:Math.min(width/1280,height/720)};
 const compact=width>height&&height<=500,w=compact?1100:1280,minHeight=compact?510:720;
 const scale=Math.min(width/w,height/minHeight);
 return {width:w,height:height/scale,scale};
}

/* Pixel-designed surfaces grow uniformly once the viewport is larger than the 1280×720 design size. */
export function uiScale(width,height){return Math.max(1,Math.min((Number(width)||1)/1280,(Number(height)||1)/720));}
