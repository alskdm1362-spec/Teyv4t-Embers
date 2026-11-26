/* A scene uses either viewport pixels or one uniformly scaled design canvas. */
export function sceneLayout(width,height,phase){
 width=Math.max(1,Number(width)||1);height=Math.max(1,Number(height)||1);
 if(['title','recruit','arrival','joinDialogue','refine','eventRemove'].includes(phase))return {width,height,scale:1};
 if(phase==='lobby')return {width:1280,height:720,scale:Math.min(width/1280,height/720)};
 const compact=width>height&&height<=500,w=compact?1100:1280,minHeight=compact?510:720;
 const scale=Math.min(width/w,height/minHeight);
 return {width:w,height:height/scale,scale};
}
