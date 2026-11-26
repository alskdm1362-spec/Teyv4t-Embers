// Canvas effects use viewport coordinates and must obey their card list's clip.
export function intersectBounds(a,b){
 const left=Math.max(a.left,b.left),top=Math.max(a.top,b.top),right=Math.min(a.right,b.right),bottom=Math.min(a.bottom,b.bottom);
 return right>left&&bottom>top?{left,top,right,bottom,width:right-left,height:bottom-top}:null;
}
