// Adapted from the user-supplied flat-plane dice, 2026-11-23. See references/supplied.
import './three-r128.min.js';
import {DiceSoftwareRenderer} from './dice-software-renderer.js';
const THREE=globalThis.THREE;
    export class PolyhedralDiceEngine {
      constructor(container, options = {}) {
        this.container = container;
        this.sound = options.sound || {init(){},playImpact(){}};
        this.numberColor = options.numberColor || '#ffffff';
        this.onRollStart = options.onRollStart || (() => {});
        this.onRollComplete = options.onRollComplete || (() => {});

        this.dice = [];
        this.isRolling = false;
        this.rafId = null;
        this.lastTime = 0;
        this.materialCache = new Map();

        this._initScene();
        this._initLights();
        this._initShadowPlane();
        this._bindResize();
        this._startLoop();
      }

      _initScene() {
        const w = this.container.clientWidth || 800;
        const h = this.container.clientHeight || 600;

        this.scene = new THREE.Scene();
        // Narrow FOV straight-on camera facing the flat XY plane gives a clean flat-plane look
        // while still letting light bounces toward +Z pop gently toward the viewer!
        this.camera = new THREE.PerspectiveCamera(28, w / h, 0.5, 60);
        this.camera.position.set(0, 0, 16);
        this.camera.lookAt(0, 0, 0);

        try { this.renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        });this.renderer.domElement.dataset.renderer='webgl';}catch{this.renderer=new DiceSoftwareRenderer();}
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        this.renderer.setSize(w, h);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.18;

        this.container.innerHTML = '';
        this.container.appendChild(this.renderer.domElement);
      }

      _initLights() {
        // Soft ambient fill so matte/satin black facets never turn into flat silhouettes
        const ambient = new THREE.AmbientLight(0xdbeafe, 0.52);
        this.scene.add(ambient);

        // Main overhead-angled key light for crisp 3D facet highlights & soft flat drop shadow
        const keyLight = new THREE.DirectionalLight(0xfffaf0, 1.45);
        keyLight.position.set(4.5, 6.5, 16);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 2048;
        keyLight.shadow.mapSize.height = 2048;
        keyLight.shadow.camera.near = 2;
        keyLight.shadow.camera.far = 35;
        const d = 8.5;
        keyLight.shadow.camera.left = -d;
        keyLight.shadow.camera.right = d;
        keyLight.shadow.camera.top = d;
        keyLight.shadow.camera.bottom = -d;
        keyLight.shadow.bias = -0.0005;
        this.scene.add(keyLight);

        // Cool side rim light to sculpt the dark obsidian facets
        const rimLeft = new THREE.DirectionalLight(0x93c5fd, 0.85);
        rimLeft.position.set(-10, -4, 9);
        this.scene.add(rimLeft);

        // Warm subtle accent rim from bottom-right
        const rimRight = new THREE.DirectionalLight(0xfde68a, 0.45);
        rimRight.position.set(9, -8, 6);
        this.scene.add(rimRight);
      }

      _initShadowPlane() {
        // Transparent shadow catcher on Z = 0 flat plane
        const planeGeo = new THREE.PlaneGeometry(36, 36);
        const planeMat = new THREE.ShadowMaterial({ opacity: 0.48 });
        this.shadowPlane = new THREE.Mesh(planeGeo, planeMat);
        this.shadowPlane.position.z = 0;
        this.shadowPlane.receiveShadow = true;
        this.scene.add(this.shadowPlane);
      }

      setNumberColor(hexColor) {
        this.numberColor = hexColor;
        this.materialCache.clear();
        // Rebuild existing dice meshes in-place keeping current positions and orientations
        this.dice.forEach((die) => {
          const oldPos = die.mesh.position.clone();
          const oldQuat = die.mesh.quaternion.clone();
          this.scene.remove(die.mesh);
          const built = this._buildDieMesh(die.type);
          built.mesh.position.copy(oldPos);
          built.mesh.quaternion.copy(oldQuat);
          die.mesh = built.mesh;
          die.faceTargets = built.faceTargets;
          die.restZ = built.restZ;
          this.scene.add(die.mesh);
        });
      }

      /* -----------------------------------------------------------------------
         Black 3D Dice Material with Adjustable Number Color + Engraved BumpMap
         ----------------------------------------------------------------------- */
      _createFaceMaterial(label, shapeType = 'poly') {
        const key = `${this.numberColor}|${shapeType}|${label}`;
        if (this.materialCache.has(key)) return this.materialCache.get(key);

        const size = 256;

        // Color texture
        const cCanvas = document.createElement('canvas');
        cCanvas.width = size;
        cCanvas.height = size;
        const ctx = cCanvas.getContext('2d');

        // Bump texture for crisp engraved number indentation
        const bCanvas = document.createElement('canvas');
        bCanvas.width = size;
        bCanvas.height = size;
        const bCtx = bCanvas.getContext('2d');

        // Rich obsidian black facet gradient (subtle specular sheen toward edges for 3D depth)
        const grad = ctx.createRadialGradient(size * 0.5, size * 0.48, 12, size * 0.5, size * 0.5, size * 0.72);
        grad.addColorStop(0, '#171922');
        grad.addColorStop(0.75, '#10121a');
        grad.addColorStop(1, '#262b38');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);

        bCtx.fillStyle = '#e6e6e6';
        bCtx.fillRect(0, 0, size, size);

        if (shapeType === 'square') {
          ctx.strokeStyle = 'rgba(255,255,255,0.08)';
          ctx.lineWidth = 10;
          ctx.strokeRect(10, 10, size - 20, size - 20);
          bCtx.strokeStyle = '#999999';
          bCtx.lineWidth = 14;
          bCtx.strokeRect(7, 7, size - 14, size - 14);
        }

        const fontSize =
          shapeType === 'square' ? 122 :
          shapeType === 'kite' ? 84 :
          shapeType === 'tri20' ? 78 :
          shapeType === 'tri4' ? 82 : 94;

        const yPos = (shapeType === 'tri8' || shapeType === 'tri20' || shapeType === 'tri4')
          ? size * 0.53
          : size * 0.50;

        const str = String(label);

        // Draw engraved shadow + crisp colored number
        ctx.save();
        ctx.translate(size * 0.5, yPos);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `900 ${fontSize}px 'Inter', system-ui, sans-serif`;

        // Soft glow matching number color so dark-on-black or bright colors stay legible
        ctx.shadowColor = this.numberColor;
        ctx.shadowBlur = 6;
        ctx.fillStyle = this.numberColor;
        ctx.fillText(str, 0, 0);

        if (str === '6' || str === '9') {
          ctx.fillRect(-fontSize * 0.24, fontSize * 0.43, fontSize * 0.48, Math.max(4, fontSize * 0.08));
        }
        ctx.restore();

        // Bump map engraving
        bCtx.save();
        bCtx.translate(size * 0.5, yPos);
        bCtx.textAlign = 'center';
        bCtx.textBaseline = 'middle';
        bCtx.font = `900 ${fontSize}px 'Inter', system-ui, sans-serif`;
        bCtx.fillStyle = '#141414';
        bCtx.fillText(str, 0, 0);
        if (str === '6' || str === '9') {
          bCtx.fillRect(-fontSize * 0.24, fontSize * 0.43, fontSize * 0.48, Math.max(4, fontSize * 0.08));
        }
        bCtx.restore();

        const colorTex = new THREE.CanvasTexture(cCanvas);
        colorTex.anisotropy = 4;
        const bumpTex = new THREE.CanvasTexture(bCanvas);
        bumpTex.anisotropy = 4;

        const mat = new THREE.MeshStandardMaterial({
          map: colorTex,
          bumpMap: bumpTex,
          bumpScale: 0.042,
          metalness: 0.34,
          roughness: 0.28
        });

        this.materialCache.set(key, mat);
        return mat;
      }

      /* -----------------------------------------------------------------------
         Exact Orientation Helper: aligns face (tangentU, tangentV, normal)
         to World (+X, +Y, +Z) so the number faces camera dead-flat & upright!
         ----------------------------------------------------------------------- */
      _quatForFace(face) {
        const m = new THREE.Matrix4().makeBasis(face.tangentU, face.tangentV, face.normal);
        m.transpose(); // Inverse of orthonormal basis maps local basis -> world (X, Y, Z)
        return new THREE.Quaternion().setFromRotationMatrix(m);
      }

      _addEdgeHighlight(mesh, geometry) {
        const edges = new THREE.EdgesGeometry(geometry, 18);
        const lineMat = new THREE.LineBasicMaterial({
          color: 0x525b70,
          transparent: true,
          opacity: 0.42
        });
        mesh.add(new THREE.LineSegments(edges, lineMat));
      }

      _buildD6() {
        const size = 1.56;
        const geo = new THREE.BoxGeometry(size, size, size);
        // BoxGeometry groups: +X, -X, +Y, -Y, +Z, -Z with exact UV up-vectors
        const faceSpecs = [
          { value: 3, normal: new THREE.Vector3(1, 0, 0),  tangentU: new THREE.Vector3(0, 0, -1), tangentV: new THREE.Vector3(0, 1, 0) },
          { value: 4, normal: new THREE.Vector3(-1, 0, 0), tangentU: new THREE.Vector3(0, 0, 1),  tangentV: new THREE.Vector3(0, 1, 0) },
          { value: 1, normal: new THREE.Vector3(0, 1, 0),  tangentU: new THREE.Vector3(1, 0, 0),  tangentV: new THREE.Vector3(0, 0, -1) },
          { value: 6, normal: new THREE.Vector3(0, -1, 0), tangentU: new THREE.Vector3(1, 0, 0),  tangentV: new THREE.Vector3(0, 0, 1) },
          { value: 2, normal: new THREE.Vector3(0, 0, 1),  tangentU: new THREE.Vector3(1, 0, 0),  tangentV: new THREE.Vector3(0, 1, 0) },
          { value: 5, normal: new THREE.Vector3(0, 0, -1), tangentU: new THREE.Vector3(-1, 0, 0), tangentV: new THREE.Vector3(0, 1, 0) }
        ];
        const materials = faceSpecs.map((f) => this._createFaceMaterial(f.value, 'square'));
        const mesh = new THREE.Mesh(geo, materials);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this._addEdgeHighlight(mesh, geo);
        return { mesh, faceTargets: faceSpecs, restZ: size / 2 };
      }

      _buildD10() {
        const R = 1.18;
        const H = 1.18;
        const cos36 = Math.cos(Math.PI / 5);
        const h = H * ((1 - cos36) / (1 + cos36));

        const topPole = new THREE.Vector3(0, H, 0);
        const botPole = new THREE.Vector3(0, -H, 0);
        const ring = [];
        for (let k = 0; k < 10; k++) {
          const a = (k * Math.PI) / 5;
          const y = k % 2 === 0 ? h : -h;
          ring.push(new THREE.Vector3(R * Math.cos(a), y, R * Math.sin(a)));
        }

        const positions = [];
        const uvs = [];
        const geo = new THREE.BufferGeometry();
        const materials = [];
        const faceTargets = [];
        const topVals = [1, 3, 5, 7, 9];
        const botVals = [10, 2, 4, 6, 8];
        let groupStart = 0;

        const addKite = (pA, pB, pC, pD, val) => {
          const centroid = new THREE.Vector3().add(pA).add(pB).add(pC).add(pD).multiplyScalar(0.25);
          const e1 = new THREE.Vector3().subVectors(pB, pA);
          const e2 = new THREE.Vector3().subVectors(pC, pA);
          const n = new THREE.Vector3().crossVectors(e1, e2).normalize();

          let vA = pA, vB = pB, vC = pC, vD = pD;
          if (n.dot(centroid) < 0) {
            vB = pD;
            vD = pB;
            n.negate();
          }

          positions.push(
            vA.x, vA.y, vA.z, vB.x, vB.y, vB.z, vC.x, vC.y, vC.z,
            vA.x, vA.y, vA.z, vC.x, vC.y, vC.z, vD.x, vD.y, vD.z
          );
          uvs.push(
            0.50, 0.92, 0.14, 0.36, 0.50, 0.08,
            0.50, 0.92, 0.50, 0.08, 0.86, 0.36
          );

          // Local upright V goes from bottom tip vC toward pole vA
          const tangentV = new THREE.Vector3().subVectors(vA, vC).normalize();
          const tangentU = new THREE.Vector3().crossVectors(tangentV, n).normalize();

          geo.addGroup(groupStart, 6, materials.length);
          groupStart += 6;
          materials.push(this._createFaceMaterial(val, 'kite'));
          faceTargets.push({ value: val, normal: n, tangentU, tangentV });
        };

        for (let i = 0; i < 5; i++) {
          addKite(topPole, ring[(i * 2 + 2) % 10], ring[(i * 2 + 1) % 10], ring[(i * 2) % 10], topVals[i]);
        }
        for (let i = 0; i < 5; i++) {
          addKite(botPole, ring[(i * 2 + 1) % 10], ring[(i * 2 + 2) % 10], ring[(i * 2 + 3) % 10], botVals[i]);
        }

        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geo.computeVertexNormals();

        const mesh = new THREE.Mesh(geo, materials);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this._addEdgeHighlight(mesh, geo);

        const inradius = Math.abs(faceTargets[0].normal.dot(topPole));
        return { mesh, faceTargets, restZ: inradius };
      }

      _buildFacetedPolyhedron(baseGeo, shapeType, scaleUV) {
        const nonIdx = baseGeo.index ? baseGeo.toNonIndexed() : baseGeo;
        const pos = nonIdx.attributes.position;
        const triCount = pos.count / 3;

        const faceMap = new Map();
        for (let t = 0; t < triCount; t++) {
          const a = new THREE.Vector3().fromBufferAttribute(pos, t * 3);
          const b = new THREE.Vector3().fromBufferAttribute(pos, t * 3 + 1);
          const c = new THREE.Vector3().fromBufferAttribute(pos, t * 3 + 2);
          const n = new THREE.Vector3()
            .subVectors(b, a)
            .cross(new THREE.Vector3().subVectors(c, a))
            .normalize();

          const key = `${Math.round(n.x * 20)},${Math.round(n.y * 20)},${Math.round(n.z * 20)}`;
          if (!faceMap.has(key)) {
            faceMap.set(key, { normal: n, tris: [] });
          }
          faceMap.get(key).tris.push([a, b, c]);
        }

        const faces = Array.from(faceMap.values());
        const newPositions = [];
        const newUvs = [];
        const geo = new THREE.BufferGeometry();
        const materials = [];
        const faceTargets = [];

        let vertCursor = 0;
        let inradius = 1.0;

        faces.forEach((face, idx) => {
          const value = idx + 1;
          const n = face.normal;

          const center = new THREE.Vector3();
          let count = 0;
          face.tris.forEach((tri) => {
            tri.forEach((v) => {
              center.add(v);
              count++;
            });
          });
          center.divideScalar(count);
          inradius = center.length();

          // Align triangle/pentagon upright so a vertex points straight up (+tangentV)
          const firstVert = face.tris[0][0];
          const tangentV = new THREE.Vector3().subVectors(firstVert, center);
          // Project strictly onto plane perpendicular to n
          tangentV.addScaledVector(n, -tangentV.dot(n)).normalize();
          const tangentU = new THREE.Vector3().crossVectors(tangentV, n).normalize();

          let maxR = 0.001;
          face.tris.forEach((tri) => {
            tri.forEach((v) => {
              const d = v.distanceTo(center);
              if (d > maxR) maxR = d;
            });
          });

          const groupStart = vertCursor;
          face.tris.forEach((tri) => {
            tri.forEach((v) => {
              newPositions.push(v.x, v.y, v.z);
              const rel = new THREE.Vector3().subVectors(v, center);
              const u = 0.5 + (rel.dot(tangentU) / (maxR * scaleUV));
              const vCoord = 0.5 + (rel.dot(tangentV) / (maxR * scaleUV));
              newUvs.push(u, vCoord);
              vertCursor++;
            });
          });

          geo.addGroup(groupStart, vertCursor - groupStart, idx);
          materials.push(this._createFaceMaterial(value, shapeType));
          faceTargets.push({ value, normal: n.clone(), tangentU, tangentV });
        });

        geo.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
        geo.setAttribute('uv', new THREE.Float32BufferAttribute(newUvs, 2));
        geo.computeVertexNormals();

        const mesh = new THREE.Mesh(geo, materials);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this._addEdgeHighlight(mesh, geo);

        return { mesh, faceTargets, restZ: inradius };
      }

      _buildDieMesh(type) {
        switch (type) {
          case 'd4': return this._buildFacetedPolyhedron(new THREE.TetrahedronGeometry(1.38, 0), 'tri4', 2.25);
          case 'd6': return this._buildD6();
          case 'd8': return this._buildFacetedPolyhedron(new THREE.OctahedronGeometry(1.26, 0), 'tri8', 2.08);
          case 'd10': return this._buildD10();
          case 'd12': return this._buildFacetedPolyhedron(new THREE.DodecahedronGeometry(1.18, 0), 'poly', 2.05);
          case 'd20':
          default:
            return this._buildFacetedPolyhedron(new THREE.IcosahedronGeometry(1.28, 0), 'tri20', 2.15);
        }
      }

      /* -----------------------------------------------------------------------
         Compute visible XY bounds of the flat Z=0 plane at current viewport
         ----------------------------------------------------------------------- */
      _getPlaneBounds() {
        const vFov = (this.camera.fov * Math.PI) / 180;
        const halfH = Math.tan(vFov / 2) * this.camera.position.z;
        const halfW = halfH * this.camera.aspect;
        return {
          x: Math.max(2.6, halfW * 0.84),
          y: Math.max(2.2, halfH * 0.76)
        };
      }

      _getCenteredTargetPositions(count) {
        const cols = Math.min(count, 3);
        const rows = Math.ceil(count / 3);
        const spacingX = 2.55;
        const spacingY = 2.55;
        const targets = [];
        for (let idx = 0; idx < count; idx++) {
          const r = Math.floor(idx / 3);
          const c = idx % 3;
          const rowCount = r === rows - 1 ? count - r * 3 : cols;
          const x = (c - (rowCount - 1) / 2) * spacingX;
          const y = ((rows - 1) / 2 - r) * spacingY;
          targets.push({ x, y });
        }
        return targets;
      }

      setPoolPreview(types) {
        this._clearDice();
        const count = types.length;
        const cols = Math.min(count, 3);
        const rows = Math.ceil(count / 3);
        const spacingX = 2.65;
        const spacingY = 2.65;

        types.forEach((type, idx) => {
          const built = this._buildDieMesh(type);
          const r = Math.floor(idx / 3);
          const c = idx % 3;
          const rowCount = r === rows - 1 ? count - r * 3 : cols;
          const x = (c - (rowCount - 1) / 2) * spacingX;
          const y = ((rows - 1) / 2 - r) * spacingY;

          built.mesh.position.set(x, y, built.restZ);
          const topFace = built.faceTargets.reduce((best, f) => (f.value > best.value ? f : best), built.faceTargets[0]);
          const q = this._quatForFace(topFace);
          built.mesh.quaternion.copy(q);

          this.scene.add(built.mesh);
          this.dice.push({
            type,
            mesh: built.mesh,
            faceTargets: built.faceTargets,
            restZ: built.restZ,
            settled: true,
            value: topFace.value,
            pos: built.mesh.position.clone(),
            vel: new THREE.Vector3(),
            angVel: new THREE.Vector3(),
            targetQuat: q.clone(),
            settleProgress: 1
          });
        });
      }

      /**
       * Light, nimble flat-plane 3D roll.
       * @param {Array<string|{type: string, targetValue?: number}>} specs
       */
      roll(specs) {
        if (!specs || specs.length === 0) return;
        this.sound.init();
        this._clearDice();

        this.isRolling = true;
        this.onRollStart();

        const bounds = this._getPlaneBounds();
        const count = specs.length;
        const targetSlots = this._getCenteredTargetPositions(count);

        specs.forEach((spec, idx) => {
          const type = typeof spec === 'string' ? spec : spec.type;
          const requestedVal = typeof spec === 'object' ? spec.targetValue : null;
          const built = this._buildDieMesh(type);

          let chosenFace = null;
          if (requestedVal !== null && requestedVal !== undefined) {
            chosenFace = built.faceTargets.find((f) => f.value === requestedVal);
          }
          if (!chosenFace) {
            chosenFace = built.faceTargets[Math.floor(Math.random() * built.faceTargets.length)];
          }

          // Exact upright front-facing quaternion (0° roll tilt so result reads cleanly!)
          const targetQuat = this._quatForFace(chosenFace);
          const slot = targetSlots[idx];
          const targetPos = new THREE.Vector3(slot.x, slot.y, built.restZ);

          // Launch energetically from a random screen edge so dice roam widely across the screen
          const launchAngle = Math.random() * Math.PI * 2;
          const startPos = new THREE.Vector3(
            Math.cos(launchAngle) * bounds.x * 0.9,
            Math.sin(launchAngle) * bounds.y * 0.9,
            built.restZ + 2.4 + idx * 0.25
          );

          built.mesh.position.copy(startPos);
          built.mesh.rotation.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
          );

          // Strong, agile diagonal velocity to zip across the whole screen & ricochet off edges
          const aimAngle = launchAngle + Math.PI + (Math.random() - 0.5) * 1.15;
          const speedXY = 12.5 + Math.random() * 4.5;
          const vel = new THREE.Vector3(
            Math.cos(aimAngle) * speedXY,
            Math.sin(aimAngle) * speedXY,
            5.0 + Math.random() * 2.4
          );

          // Lively 3D tumbling spin
          const angVel = new THREE.Vector3(
            (Math.random() > 0.5 ? 1 : -1) * (12 + Math.random() * 8),
            (Math.random() > 0.5 ? 1 : -1) * (12 + Math.random() * 8),
            (Math.random() > 0.5 ? 1 : -1) * (8 + Math.random() * 6)
          );

          this.scene.add(built.mesh);
          this.dice.push({
            type,
            mesh: built.mesh,
            faceTargets: built.faceTargets,
            restZ: built.restZ,
            value: chosenFace.value,
            pos: startPos,
            vel,
            angVel,
            targetPos,
            targetQuat,
            bounces: 0,
            wallHits: 0,
            elapsed: 0,
            roamDuration: 0.78 + idx * 0.05,
            settleDuration: 0.85,
            settled: false,
            settling: false,
            settleElapsed: 0,
            settleStartPos: null,
            settleStartVel: null,
            freeQuat: null
          });
        });

        this.sound.playImpact(0.35, true);
      }

      _clearDice() {
        this.dice.forEach((d) => { this.scene.remove(d.mesh); d.mesh.traverse(o=>{o.geometry?.dispose();if(o.isLineSegments)o.material?.dispose();}); });
        this.dice = [];
      }

      _beginNaturalCenterRoll(d) {
        d.settling = true;
        d.settleElapsed = 0;
        d.settleStartPos = d.pos.clone();
        // Preserve exact XY momentum for C1-continuous curvature (no sudden direction snap!)
        // Clamp extreme tangential speed slightly so the curve stays inside screen bounds
        const maxEntrySpeed = 11.5;
        const xySpeed = Math.hypot(d.vel.x, d.vel.y);
        const scale = xySpeed > maxEntrySpeed ? maxEntrySpeed / xySpeed : 1.0;
        d.settleStartVel = new THREE.Vector2(d.vel.x * scale, d.vel.y * scale);
        // Adapt settle duration naturally to distance & speed so deceleration feels physical
        const distToCenter = Math.hypot(d.targetPos.x - d.pos.x, d.targetPos.y - d.pos.y);
        d.settleDuration = Math.min(1.05, Math.max(0.68, 0.58 + distToCenter * 0.075));
        d.freeQuat = d.mesh.quaternion.clone();
      }

      _stepPhysics(dt) {
        if (!this.isRolling) return;

        const gravityZ = -19.5;
        const bounds = this._getPlaneBounds();
        let allSettled = true;

        // Die-to-die elastic bounce while roaming freely
        for (let i = 0; i < this.dice.length; i++) {
          for (let j = i + 1; j < this.dice.length; j++) {
            const a = this.dice[i];
            const b = this.dice[j];
            if (a.settling || b.settling) continue;
            const dx = b.pos.x - a.pos.x;
            const dy = b.pos.y - a.pos.y;
            const dist = Math.hypot(dx, dy);
            const minDist = 2.25;
            if (dist < minDist && dist > 0.0001) {
              const nx = dx / dist;
              const ny = dy / dist;
              const push = (minDist - dist) * 0.52;
              a.pos.x -= nx * push;
              a.pos.y -= ny * push;
              b.pos.x += nx * push;
              b.pos.y += ny * push;

              const relVx = a.vel.x - b.vel.x;
              const relVy = a.vel.y - b.vel.y;
              const sep = relVx * nx + relVy * ny;
              if (sep > 0) {
                a.vel.x -= nx * sep * 0.72;
                a.vel.y -= ny * sep * 0.72;
                b.vel.x += nx * sep * 0.72;
                b.vel.y += ny * sep * 0.72;
                if (sep > 1.4) this.sound.playImpact(Math.min(0.75, sep / 12), false);
              }
            }
          }
        }

        this.dice.forEach((d) => {
          if (d.settled) return;
          allSettled = false;
          d.elapsed += dt;

          if (!d.settling) {
            // Phase 1: Energetic free roaming across the whole screen
            d.vel.z += gravityZ * dt;
            d.pos.addScaledVector(d.vel, dt);

            const drag = Math.pow(0.86, dt);
            d.vel.x *= drag;
            d.vel.y *= drag;

            // Light Z-plane bounces
            if (d.pos.z <= d.restZ) {
              d.pos.z = d.restZ;
              const impactSpeed = Math.abs(d.vel.z);
              if (impactSpeed > 0.9) {
                d.vel.z = Math.max(2.4, impactSpeed * 0.62);
                d.bounces++;
                this.sound.playImpact(Math.min(0.82, impactSpeed / 12), false);
              } else {
                d.vel.z = 2.0;
              }
            }

            // Crisp elastic ricochet off wide screen edges
            let hitWall = false;
            if (d.pos.x > bounds.x) {
              d.pos.x = bounds.x;
              if (d.vel.x > 0) { d.vel.x = -d.vel.x * 0.84; hitWall = true; }
            } else if (d.pos.x < -bounds.x) {
              d.pos.x = -bounds.x;
              if (d.vel.x < 0) { d.vel.x = -d.vel.x * 0.84; hitWall = true; }
            }

            if (d.pos.y > bounds.y) {
              d.pos.y = bounds.y;
              if (d.vel.y > 0) { d.vel.y = -d.vel.y * 0.84; hitWall = true; }
            } else if (d.pos.y < -bounds.y) {
              d.pos.y = -bounds.y;
              if (d.vel.y < 0) { d.vel.y = -d.vel.y * 0.84; hitWall = true; }
            }

            if (hitWall) {
              d.wallHits++;
              const wallSpeed = Math.hypot(d.vel.x, d.vel.y);
              this.sound.playImpact(Math.min(0.8, wallSpeed / 14), true);

              // After roaming enough, a natural wall ricochet seamlessly kicks off the roll into center!
              if (d.elapsed >= d.roamDuration * 0.72) {
                // Gently aim post-ricochet velocity somewhat inward so the arc feels 100% physical
                const toCenterX = d.targetPos.x - d.pos.x;
                const toCenterY = d.targetPos.y - d.pos.y;
                const distC = Math.hypot(toCenterX, toCenterY) || 1;
                const spd = Math.min(10.5, wallSpeed * 0.82);
                d.vel.x = d.vel.x * 0.45 + (toCenterX / distC) * spd * 0.55;
                d.vel.y = d.vel.y * 0.45 + (toCenterY / distC) * spd * 0.55;
                this._beginNaturalCenterRoll(d);
              }
            }

            d.mesh.position.copy(d.pos);
            const dq = new THREE.Quaternion().setFromEuler(
              new THREE.Euler(d.angVel.x * dt, d.angVel.y * dt, d.angVel.z * dt)
            );
            d.mesh.quaternion.premultiply(dq).normalize();

            // Fallback trigger if die didn't hit a wall right at roamDuration:
            // Trigger smoothly as soon as it is moving inward or slightly past roamDuration
            if (!d.settling) {
              const toCenterX = d.targetPos.x - d.pos.x;
              const toCenterY = d.targetPos.y - d.pos.y;
              const headingInward = (d.vel.x * toCenterX + d.vel.y * toCenterY) > 0;
              if ((d.elapsed >= d.roamDuration && headingInward) || d.elapsed >= d.roamDuration + 0.32) {
                this._beginNaturalCenterRoll(d);
              }
            }
          } else {
            // Phase 2: C1-continuous Cubic Hermite deceleration into dead center + real decaying Z-bounces!
            d.settleElapsed += dt;
            const T = d.settleDuration;
            const p = Math.min(1, d.settleElapsed / T);
            const p2 = p * p;
            const p3 = p2 * p;

            // Hermite basis functions (H(0)=P0, H'(0)=V0*T, H(1)=targetPos, H'(1)=0)
            const h00 = 2 * p3 - 3 * p2 + 1;
            const h10 = p3 - 2 * p2 + p;
            const h01 = -2 * p3 + 3 * p2;

            const prevX = d.pos.x;
            const prevY = d.pos.y;
            d.pos.x = h00 * d.settleStartPos.x + h10 * (d.settleStartVel.x * T) + h01 * d.targetPos.x;
            d.pos.y = h00 * d.settleStartPos.y + h10 * (d.settleStartVel.y * T) + h01 * d.targetPos.y;

            // Real decaying gravity bounces in Z during the roll-in (no artificial floating sine arc)
            if (p < 0.88) {
              d.vel.z += gravityZ * dt;
              d.pos.z += d.vel.z * dt;
              if (d.pos.z <= d.restZ) {
                d.pos.z = d.restZ;
                const impactSpeed = Math.abs(d.vel.z);
                if (impactSpeed > 0.85 && p < 0.72) {
                  // Diminishing light skips as it rolls toward center
                  d.vel.z = impactSpeed * (0.48 * (1 - p * 0.45));
                  this.sound.playImpact(Math.min(0.65, impactSpeed / 14), false);
                } else {
                  if (impactSpeed > 0.45) this.sound.playImpact(0.22, false);
                  d.vel.z = 0;
                }
              }
            } else {
              // Smoothly rest flush on the flat plane in the final 12%
              d.pos.z += (d.restZ - d.pos.z) * Math.min(1, dt * 18);
              d.vel.z = 0;
            }

            // Compute actual instantaneous XY speed to drive natural rolling tumble
            const vx = dt > 0.0001 ? (d.pos.x - prevX) / dt : 0;
            const vy = dt > 0.0001 ? (d.pos.y - prevY) / dt : 0;
            const rollAxisX = -vy * 0.95;
            const rollAxisY = vx * 0.95;

            // Keep spinning naturally with rolling motion, tapering off as it slows down
            const spinWeight = Math.pow(1 - p, 1.5);
            const dq = new THREE.Quaternion().setFromEuler(
              new THREE.Euler(
                (d.angVel.x * 0.45 * spinWeight + rollAxisX * 0.65) * dt,
                (d.angVel.y * 0.45 * spinWeight + rollAxisY * 0.65) * dt,
                d.angVel.z * 0.35 * spinWeight * dt
              )
            );
            d.freeQuat.premultiply(dq).normalize();

            // Smooth S-curve blend from natural rolling orientation into exact upright result face
            const rotBlend = p * p * (3 - 2 * p);
            d.mesh.position.copy(d.pos);
            d.mesh.quaternion.copy(d.freeQuat).slerp(d.targetQuat, Math.pow(rotBlend, 1.25));

            if (p >= 1) {
              d.pos.copy(d.targetPos);
              d.mesh.position.copy(d.targetPos);
              d.mesh.quaternion.copy(d.targetQuat);
              d.vel.set(0, 0, 0);
              d.settled = true;
            }
          }
        });

        if (allSettled) {
          this.isRolling = false;
          const results = this.dice.map((d) => ({ type: d.type, value: d.value }));
          this.onRollComplete(results);
        }
      }

      _bindResize() {
        this._resizeHandler = () => {
          const w = this.container.clientWidth;
          const h = this.container.clientHeight;
          if (!w || !h) return;
          this.camera.aspect = w / h;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize(w, h);
        };
        window.addEventListener('resize', this._resizeHandler);
      }

      _startLoop() {
        if (this.rafId) cancelAnimationFrame(this.rafId);
        this.lastTime = performance.now();

        const tick = (now) => {
          this.rafId = requestAnimationFrame(tick);
          const dt = document.hidden ? 0 : Math.min(0.04, (now - this.lastTime) / 1000);
          this.lastTime = now;

          if(!document.hidden){this._stepPhysics(dt);this.renderer.render(this.scene, this.camera);}
        };

        this.rafId = requestAnimationFrame(tick);
      }
      finish() {
        this.isRolling = false;
        this.dice.forEach(d => {d.pos.copy(d.targetPos);d.mesh.position.copy(d.targetPos);d.mesh.quaternion.copy(d.targetQuat);d.settled=true;});
        this.renderer.render(this.scene,this.camera);
        this.onRollComplete(this.dice.map(d=>({type:d.type,value:d.value})));
      }
      destroy() {
        cancelAnimationFrame(this.rafId);this.rafId=null;
        window.removeEventListener('resize',this._resizeHandler);
        this._clearDice();
        this.scene.traverse(obj=>{obj.geometry?.dispose();for(const m of (Array.isArray(obj.material)?obj.material:obj.material?[obj.material]:[])){m.map?.dispose();m.bumpMap?.dispose();m.dispose();}});
        for(const m of this.materialCache.values()){m.map?.dispose();m.bumpMap?.dispose();m.dispose();}this.materialCache.clear();
        this.renderer.dispose();this.renderer.forceContextLoss();this.renderer.domElement.remove();
      }

    }

