// Canvas fallback projects the supplied engine's same meshes, UVs and physics.
// It is used when this device cannot create a WebGL context.
const THREE=globalThis.THREE;
export class DiceSoftwareRenderer{
 constructor(){this.domElement=document.createElement('canvas');this.domElement.dataset.renderer='software-3d';this.ctx=this.domElement.getContext('2d');this.shadowMap={};this.ratio=1;}
 setPixelRatio(n){this.ratio=n;}
 setSize(w,h){this.w=w;this.h=h;this.domElement.width=Math.ceil(w*this.ratio);this.domElement.height=Math.ceil(h*this.ratio);this.domElement.style.width=w+'px';this.domElement.style.height=h+'px';}
 render(scene,camera){const c=this.ctx;c.setTransform(this.ratio,0,0,this.ratio,0,0);c.clearRect(0,0,this.w,this.h);scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);const triangles=[],project=v=>{const q=v.clone().project(camera);return[(q.x+1)*this.w/2,(1-q.y)*this.h/2];};
  for(const mesh of scene.children.filter(o=>o.isMesh&&(Array.isArray(o.material)||o.material.map))){const geo=mesh.geometry,pos=geo.attributes.position,uv=geo.attributes.uv,idx=geo.index;const count=idx?idx.count:pos.count,at=i=>idx?idx.getX(i):i;
   const shadow=project(new THREE.Vector3(mesh.position.x,mesh.position.y,0)),height=Math.max(0,mesh.position.z);c.save();c.globalAlpha=Math.max(.08,.3-height*.035);c.fillStyle='#000';c.filter='blur(7px)';c.beginPath();c.ellipse(shadow[0],shadow[1],this.h*.065,this.h*.045,0,0,Math.PI*2);c.fill();c.restore();
   for(let i=0;i<count;i+=3){const ids=[at(i),at(i+1),at(i+2)],v=ids.map(j=>new THREE.Vector3().fromBufferAttribute(pos,j).applyMatrix4(mesh.matrixWorld)),normal=new THREE.Vector3().subVectors(v[1],v[0]).cross(new THREE.Vector3().subVectors(v[2],v[0])).normalize(),center=v[0].clone().add(v[1]).add(v[2]).multiplyScalar(1/3);if(normal.dot(camera.position.clone().sub(center))<=0)continue;const group=geo.groups.find(g=>i>=g.start&&i<g.start+g.count),mat=Array.isArray(mesh.material)?mesh.material[group?.materialIndex||0]:mesh.material;triangles.push({v:v.map(project),uv:ids.map(j=>[uv.getX(j),1-uv.getY(j)]),image:mat.map?.image,z:center.z,light:Math.max(0,normal.dot(new THREE.Vector3(.25,.4,.9).normalize()))});}
  }
  triangles.sort((a,b)=>a.z-b.z);for(const t of triangles){const [a,b,d]=t.v;c.save();c.beginPath();c.moveTo(...a);c.lineTo(...b);c.lineTo(...d);c.closePath();c.clip();if(t.image){const iw=t.image.width,ih=t.image.height,[s0,s1,s2]=t.uv.map(([u,v])=>[u*iw,v*ih]),[x0,y0]=s0,[x1,y1]=s1,[x2,y2]=s2,den=x0*(y1-y2)+x1*(y2-y0)+x2*(y0-y1);if(Math.abs(den)>.001){const aa=(a[0]*(y1-y2)+b[0]*(y2-y0)+d[0]*(y0-y1))/den,bb=(a[1]*(y1-y2)+b[1]*(y2-y0)+d[1]*(y0-y1))/den,cc=(a[0]*(x2-x1)+b[0]*(x0-x2)+d[0]*(x1-x0))/den,dd=(a[1]*(x2-x1)+b[1]*(x0-x2)+d[1]*(x1-x0))/den,ee=(a[0]*(x1*y2-x2*y1)+b[0]*(x2*y0-x0*y2)+d[0]*(x0*y1-x1*y0))/den,ff=(a[1]*(x1*y2-x2*y1)+b[1]*(x2*y0-x0*y2)+d[1]*(x0*y1-x1*y0))/den;c.transform(aa,bb,cc,dd,ee,ff);c.drawImage(t.image,0,0);}}
   c.restore();c.save();c.beginPath();c.moveTo(...a);c.lineTo(...b);c.lineTo(...d);c.closePath();c.fillStyle=`rgba(157,189,219,${.05+t.light*.23})`;c.fill();c.strokeStyle=`rgba(157,189,219,${.12+t.light*.23})`;c.lineWidth=.65;c.stroke();c.restore();}
 }
 dispose(){}forceContextLoss(){}
}
