import * as THREE from './assets/vendor/three/three.module.min.js';
import { OrbitControls } from './assets/vendor/three/OrbitControls.js';
import { RoundedBoxGeometry } from './assets/vendor/three/RoundedBoxGeometry.js';
import { HDRLoader } from './assets/vendor/three/HDRLoader.js';
import { EffectComposer } from './assets/vendor/three/EffectComposer.js';
import { RenderPass } from './assets/vendor/three/RenderPass.js';
import { SSAOPass } from './assets/vendor/three/SSAOPass.js';
import { OutputPass } from './assets/vendor/three/OutputPass.js';

const layout = window.APARTMENT_LAYOUT;
const stories = {
 living:['LIVING','낮은 가구, 넉넉한 여백','오크 바닥과 패브릭 소파, 둥근 석재 테이블. 중앙 복도에서 거실과 주방으로 이어지는 동선을 비웠습니다.'],
 kitchen:['KITCHEN','작지만 정돈된 주방','기존 영역에 주방을 모으고 식탁을 거실 쪽으로 연결했습니다. 설비 위치는 원도면 확인 후 조정이 필요합니다.'],
 master:['BEDROOM','휴식과 수납을 나누는 안방','안방 뒤쪽에 드레스룸을 두고, 그곳에서 부부욕실로 연결합니다. 침대 발치와 거실에서 들어오는 통로를 비웠습니다.'],
 bedroom:['SECOND ROOM','빛이 드는 작은 침실','후면 증축을 가정한 침실입니다. 침대와 수납장을 벽 쪽으로 모아 출입구 앞 공간을 확보했습니다.'],
 study:['STUDIO','침실과 서재를 함께','후면 침실군의 작은 방입니다. 싱글 침대와 책상을 양쪽 벽에 붙여 가운데 이동 공간을 확보하는 배치입니다.'],
 bath:['BATH','간결한 석재와 금속','주방과 가까운 기존 영역에 욕실을 배치한 검토안입니다. 배관·샤프트 위치는 확인되지 않았습니다.'],
 ensuite:['ENSUITE BATH','안방에서 이어지는 부부욕실','드레스룸 안쪽에 독립된 욕실을 두어 안방 동선을 짧게 잡은 검토안입니다. 배관·샤프트와 실제 증축 범위는 확인되지 않았습니다.'],
 entry:['ARRIVAL','공용 코어에서 집 안으로','공유 도면의 측면 진입을 참고했습니다. 현관에서 후면 침실과 전면 생활 공간으로 갈라지며 공용 코어는 세대 면적에서 제외했습니다.']
};
export const rooms = Object.fromEntries(Object.entries(layout.rooms).map(([id,r])=>[id,{...r,kicker:stories[id][0],title:stories[id][1],description:stories[id][2]}]));

export async function createTour(host, onInteraction, onError) {
  const loader = new THREE.TextureLoader();
  const files = ['oak-color.jpg','oak-normal.jpg','oak-roughness.jpg','fabric-normal.jpg'];
  const textures = await Promise.all(files.map(f=>loader.loadAsync('./assets/tour-materials/'+f)));
  const hdr = await new HDRLoader().loadAsync('./assets/tour-materials/studio.hdr');
  const park = await new HDRLoader().loadAsync('./assets/tour-materials/park.hdr');
  park.mapping=THREE.EquirectangularReflectionMapping;
  textures.push(hdr,park);
  textures.slice(0,4).forEach(t=>{t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3,4);});
  textures[0].colorSpace=THREE.SRGBColorSpace;
  const renderer = new THREE.WebGLRenderer({antialias:true});
  const mobileRendering = window.matchMedia('(pointer: coarse)').matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, mobileRendering ? 1.25 : 1.75));
  renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=.92;
  const canvas=renderer.domElement; canvas.tabIndex=0;
  canvas.setAttribute('aria-label','가상 아파트 3D 뷰어. 드래그로 둘러보기. 아래 버튼으로도 조작할 수 있습니다.');
  host.append(canvas);
  const scene=new THREE.Scene();scene.background=new THREE.Color('#e7e9e6');
  hdr.mapping=THREE.EquirectangularReflectionMapping;scene.environment=hdr;scene.environmentIntensity=.65;
  const camera=new THREE.PerspectiveCamera(42,1,.05,150);
  const composer=new EffectComposer(renderer);
  const renderPass=new RenderPass(scene,camera);
  const ambientOcclusion=new SSAOPass(scene,camera,1,1,16);
  ambientOcclusion.enabled = !mobileRendering;
  ambientOcclusion.kernelRadius=.35;
  ambientOcclusion.minDistance=.0003;
  ambientOcclusion.maxDistance=.045;
  const outputPass=new OutputPass();
  composer.addPass(renderPass);composer.addPass(ambientOcclusion);composer.addPass(outputPass);
  const controls=new OrbitControls(camera,canvas);
  controls.enableDamping=false;controls.enablePan=false;controls.minDistance=9;controls.maxDistance=27;
  controls.minPolarAngle=.15;controls.maxPolarAngle=Math.PI/2.35;controls.zoomSpeed=.7;
  const materials=[];
  function material(color,extra={}) {const m=new THREE.MeshStandardMaterial({color,roughness:.75,...extra});materials.push(m);return m;}
  const oak=material('#b99c76',{roughness:.48});
  const floor=material('#e2d2b6',{map:textures[0],normalMap:textures[1],roughnessMap:textures[2],normalScale:new THREE.Vector2(.22,.22),roughness:.75});
  const plaster=material('#eeeae2'),cream=material('#ddd3c4'),white=material('#f3f1e9');
  const stone=material('#bdb6a8',{roughness:.42}),dark=material('#292d2a',{roughness:.34});
  const brass=material('#ad9470',{metalness:.85,roughness:.3});
  const fabric=material('#c8c0b1',{normalMap:textures[3],normalScale:new THREE.Vector2(.2,.2),roughness:1});
  const sage=material('#899282',{normalMap:textures[3],normalScale:new THREE.Vector2(.12,.12)});
  const rug=material('#cfc6b5',{normalMap:textures[3],normalScale:new THREE.Vector2(.4,.4),roughness:1});
  const glass=material('#eef5f3',{transparent:true,opacity:.10,roughness:.08,depthWrite:false});
  const mirror=material('#ced4cf',{metalness:1,roughness:.12});
  const glow=material('#fff2dc',{emissive:'#ffdb9c',emissiveIntensity:1.3});
  const apartment=new THREE.Group(),walls=new THREE.Group(),windows=new THREE.Group(),outdoors=new THREE.Group();
  scene.add(apartment,outdoors);apartment.add(walls,windows);
  const unitBox=new THREE.BoxGeometry(1,1,1);
  function box(w,h,d,x,y,z,mat,parent=apartment,round=0) {
    const m=new THREE.Mesh(round?new RoundedBoxGeometry(w,h,d,3,Math.min(round,w/3,h/3,d/3)):unitBox,mat);
    if(!round)m.scale.set(w,h,d);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
  }
  function cylinder(r,h,x,y,z,mat,parent=apartment) {
    const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,40),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
  }
  function plant(x,z) {
    cylinder(.15,.3,x,.15,z,stone);cylinder(.014,.8,x,.6,z,oak);
    for(let i=0;i<9;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(.13,12,8),sage);m.scale.set(.7,.18,2);m.position.set(x+Math.sin(i*2.4)*.14,.5+i*.055,z+Math.cos(i*2.4)*.14);m.rotation.set(.2,i*2.4,.2);apartment.add(m);}
  }
  function bed(x,z,w,accent,angle=0) {
    const first=apartment.children.length;
    box(w+.1,.22,2.04,x,.19,z,oak,apartment,.05);
    box(w,.24,1.98,x,.4,z,white,apartment,.10);
    box(w+.12,1.0,.15,x,.57,z-1.05,fabric,apartment,.06);
    box(w+.035,.11,1.25,x,.55,z+.32,accent,apartment,.05);
    for(let i=0;i<(w>1.3?2:1);i++){const p=box(w>1.3?.61:.74,.17,.44,x+(w>1.3?(i-.5)*.72:0),.59,z-.66,cream,apartment,.07);p.rotation.x=-.14;}
    for(let i=0;i<4;i++)box(w,.016,.015,x,.612,z+.57+i*.08,cream,apartment,.004);
    if(angle){const parts=apartment.children.slice(first);const group=new THREE.Group();group.position.set(x,0,z);apartment.add(group);parts.forEach(part=>group.attach(part));group.rotation.y=angle;}
  }
  function chair(x,z,angle=0) {
    const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=angle;apartment.add(g);
    box(.46,.10,.46,0,.46,0,fabric,g,.04);box(.46,.34,.075,0,.69,-.19,oak,g,.03);
    for(const x of [-.17,.17])for(const z of [-.17,.17])box(.035,.42,.035,x,.23,z,dark,g);
  }
  function art(x,y,z,angle=0) {
    const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=angle;apartment.add(g);
    box(.85,.65,.04,0,0,0,oak,g);box(.80,.6,.045,0,0,.01,cream,g);
    const disc=cylinder(.19,.01,.10,0,0,sage,g);disc.rotation.x=Math.PI/2;disc.position.z=.04;
    box(.18,.36,.01,-.18,-.06,.04,white,g);
  }
  function tap(x,z){
    const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(x,.91,z-.18),new THREE.Vector3(x,1.17,z-.18),new THREE.Vector3(x,1.21,z-.08),new THREE.Vector3(x,1.12,z+.03)]);
    const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,24,.013,8,false),brass);mesh.castShadow=true;apartment.add(mesh);
  }
  // Re-entrant unit footprint: common core is excluded from floor and ceiling.
  const shape=new THREE.Shape();
  layout.footprint.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();
  function slab(mat,y,thickness=0,parent=apartment){
    const geo=thickness?new THREE.ExtrudeGeometry(shape,{depth:thickness,bevelEnabled:false}):new THREE.ShapeGeometry(shape);
    geo.rotateX(-Math.PI/2);const mesh=new THREE.Mesh(geo,mat);mesh.position.y=y;mesh.receiveShadow=true;mesh.castShadow=!!thickness;parent.add(mesh);return mesh;
  }
  textures.slice(0,3).forEach(t=>t.repeat.set(.48,.48));
  slab(white,-.25,.2);slab(floor,.003);
  const ceilingMat=plaster.clone();ceilingMat.side=THREE.DoubleSide;materials.push(ceilingMat);slab(ceilingMat,2.36,0,windows);
  for(const zone of [...layout.zones,...Object.values(layout.rooms).filter(r=>r.floor==='stone')]){const [x,z,a,b]=zone.bounds;box(a-x-.12,.018,b-z-.12,(x+a)/2,.02,(z+b)/2,stone);}
  box(1.65,.018,1.17,-.65,.024,-1.85,stone);
  layout.walls.forEach(([x,z,a,b])=>{
    if(z===b&&Math.abs(z)===6)return;
    const w=Math.max(.13,Math.abs(a-x)),d=Math.max(.13,Math.abs(b-z));
    box(w,layout.height,d,(x+a)/2,layout.height/2,(z+b)/2,plaster,walls);
    box(w+.012,.07,d+.012,(x+a)/2,.045,(z+b)/2,cream,walls);
  });
  for(const z of [-6,6]){
    const min=-3.6,max=z<0?1.5:3.6;
    box(max-min,.32,.14,(min+max)/2,.16,z,plaster,walls);box(max-min,.22,.14,(min+max)/2,2.24,z,plaster,windows);
    let edge=min;
    for(const [x,,w]of layout.windows.filter(v=>v[1]===z)){
      if(x-w/2>edge)box(x-w/2-edge,2.03,.14,(edge+x-w/2)/2,1.33,z,plaster,windows);edge=x+w/2;
      for(const dx of [-w/2,0,w/2])box(.045,1.79,.075,x+dx,1.23,z,dark,windows);
      for(const y of [.34,2.12])box(w,.055,.09,x,y,z,dark,windows);
      box(w,1.75,.02,x,1.23,z,glass,windows);
      for(const side of [-1,1])for(let i=0;i<5;i++)cylinder(.032,2.12,x+side*(w/2-.04-i*.054),1.12,z+(z>0?-.17:.17),fabric,windows);
    }
    if(edge<max)box(max-edge,2.03,.14,(edge+max)/2,1.33,z,plaster,windows);
  }
  for(const [x,z,o]of layout.doors){
    box(o==='v'?.13:.86,.27,o==='v'?.86:.13,x,2.215,z,plaster,windows);
    for(const sign of [-1,1])box(o==='v'?.15:.025,2.08,o==='v'?.025:.15,x+(o==='h'?sign*.425:0),1.04,z+(o==='v'?sign*.425:0),oak,windows);
  }
  // Opaque door separates the common core from the private unit.
  box(.04,2.04,.80,.21,1.02,-1.875,dark,windows);
  box(.035,.13,.035,.175,1,-1.56,brass,windows);
  // Main furniture is shared with the SVG, including its real occupancy envelope.
  box(2.85,.025,2.7,-1.88,.043,4.65,rug,apartment,.01);
  box(2.8,.018,2.55,1.86,.044,3.8,rug,apartment,.01);
  for(const f of layout.furniture){
    const {x,z,w,d}=f;
    if(f.type==='bed'){bed(x,z,w,sage,f.angle||0);continue;}
    if(f.type==='wardrobe'){
      box(w,2.18,d,x,1.11,z,cream,apartment,.014);
      box(.01,2.08,d+.015,x,1.1,z,oak);continue;
    }
    if(f.type==='sofa'){
      box(w,.28,d,x,.26,z,fabric,apartment,.10);box(.19,.63,d+.06,x-.32,.48,z,fabric,apartment,.08);
      for(const dz of [-.73,0,.73])box(.73,.18,.69,x+.07,.45,z+dz,cream,apartment,.07);
      for(const side of [-1,1]){box(w,.49,.15,x,.40,z+side*d/2,fabric,apartment,.06);const p=box(.17,.36,.40,x-.15,.71,z+side*.65,sage,apartment,.06);p.rotation.z=-.2;}
    }else if(f.type==='coffee'){
      cylinder(w/2,.09,x,.41,z,stone);cylinder(.25,.34,x,.2,z,stone);cylinder(.09,.13,x+.12,.52,z,cream);box(.24,.04,.18,x-.14,.48,z+.12,sage);
    }else if(f.type==='media'){
      box(w,.26,d,x,.25,z,oak,apartment,.025);box(.035,.68,1.15,x+.105,1.18,z,dark,apartment,.015);
    }else if(f.type==='dining'){
      box(w,.07,d,x,.76,z,oak,apartment,.14);
      for(const dx of [-.43,.43])box(.05,.7,.05,x+dx,.39,z,dark);
      cylinder(.14,.018,x,.806,z,white);
      cylinder(.02,.48,x,2.1,z,brass,windows);cylinder(.23,.1,x,1.84,z,glow,windows);
    }else if(f.type==='chair'){
      chair(x,z,Math.PI);
    }else if(f.type==='desk'){
      box(w,.055,d,x,.76,z,oak,apartment,.01);for(const dz of [-d*.38,d*.38])box(w,.72,.04,x,.37,z+dz,dark);
      const g=new THREE.Group();g.position.set(x-.40,0,z);apartment.add(g);
      chair(x-.37,z,-Math.PI/2);
    }else if(f.type==='counter'){
      box(w,.83,d,x,.43,z,cream,apartment,.015);box(w+.04,.045,d+.04,x,.87,z,stone,apartment,.015);
      box(w,.58,.31,x,1.96,z-.155,plaster);box(w-.1,.025,.16,x,1.65,z-.09,glow);
      for(let dx=-w/2+.55;dx<w/2;dx+=.55)box(.008,.75,.014,x+dx,.44,z+d/2+.01,oak);
      box(.52,.018,.40,x+.60,.90,z,white,apartment,.035);box(.44,.012,.32,x+.6,.913,z,dark,apartment,.04);tap(x+.6,z);
      box(.47,.012,.38,x-.6,.90,z,dark,apartment,.015);
    }else if(f.type==='fridge'){
      box(w,2.13,d,x,1.08,z,cream,apartment,.025);box(.025,.56,.025,x+w/2+.015,1.42,z+.20,brass);
    }
  }
  art(-3.50,1.63,4.55,Math.PI/2);art(3.5,1.65,3.72,-Math.PI/2);plant(-.65,5.65);
  for(const z of [2.75,4.81]){box(.35,.32,.30,3.18,.20,z,oak,apartment,.025);cylinder(.085,.18,3.18,.46,z,glow);}
  // Utility room: stacked laundry and closed storage, separate from the worktop.
  box(.64,1.75,.64,-3.14,.9,-.13,white,apartment,.025);
  for(const y of [.52,1.36]){const m=cylinder(.21,.025,-2.807,y,-.13,dark);m.rotation.z=Math.PI/2;}
  box(.30,2,.65,-2.40,1.02,-.13,oak);
  // Main bathroom: wet zone at rear, vanity and WC clear of the side door.
  box(1.45,.035,.65,-2.75,.045,-2.5,white,apartment,.02);
  box(.44,.40,.50,-3.24,.62,-1.1,oak,apartment,.015);
  box(.49,.07,.55,-3.24,.86,-1.1,stone,apartment,.025);box(.32,.075,.44,-3.24,.925,-1.1,white,apartment,.09);
  box(.026,.77,.52,-3.515,1.48,-1.10,mirror,apartment,.06);
  box(.57,.32,.38,-3.12,.22,-1.84,white,apartment,.12);box(.13,.56,.38,-3.4,.38,-1.84,white,apartment,.025);
  box(.75,1.96,.018,-3.14,1.03,-2.17,glass,windows);
  cylinder(.015,1.3,-3.4,1.3,-2.62,brass);cylinder(.11,.02,-3.24,1.98,-2.62,brass);
  // Ensuite is accessed through the dressing room, never through the kitchen.
  box(1.23,.03,.60,.95,.045,-.75,white,apartment,.025);
  box(.40,.44,.45,1.40,.6,.55,oak,apartment,.018);box(.44,.06,.49,1.40,.85,.55,stone,apartment,.015);
  box(.30,.07,.38,1.40,.91,.55,white,apartment,.07);box(.018,.70,.43,1.62,1.43,.55,mirror);
  box(.58,.33,.37,1.30,.22,-.20,white,apartment,.10);box(.12,.56,.37,1.56,.38,-.20,white,apartment,.015);
  box(.70,1.96,.018,1.20,1.03,-.43,glass,windows);
  cylinder(.015,1.25,.48,1.30,-1.05,brass);cylinder(.11,.02,.48,1.94,-.87,brass);
  // A narrow shoe cabinet sits outside the clear route between entry and bedrooms.
  box(1.30,2.1,.26,-.67,1.07,-2.34,cream);box(.018,1.12,.54,.105,1.48,-1.86,mirror);
  for(const [x,z]of [[-1.8,4.5],[1.8,3.5],[-.7,-.1],[-2.6,-1.5],[-2.3,-4.5],[.3,-4.5],[.95,.3]])cylinder(.043,.012,x,2.345,z,glow,windows);

  const ground=box(200,.1,200,0,-.34,0,material('#e7e9e6'),scene);ground.castShadow=false;
  scene.add(new THREE.HemisphereLight('#eef3ff','#b8a589',.65));
  const sun=new THREE.DirectionalLight('#fff1d7',2.6);sun.position.set(-3,7,9);sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-7;sun.shadow.camera.right=7;sun.shadow.camera.top=7;sun.shadow.camera.bottom=-7;sun.shadow.normalBias=.018;sun.shadow.bias=-.0002;sun.shadow.radius=3;scene.add(sun);
  const fill=new THREE.DirectionalLight('#e4ecff',.8);fill.position.set(0,5,-8);scene.add(fill);
  const bounce=new THREE.PointLight('#ffdfac',7,8,2);bounce.position.set(-1.5,2.15,.6);scene.add(bounce);

  let mode = 'overview', room = 'living', active = true, disposed = false;
  let frame = 0, transition = null, yaw = 0, pitch = 0, pointer = null;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function lookAround() {
    camera.lookAt(camera.position.x + Math.sin(yaw) * Math.cos(pitch), camera.position.y + Math.sin(pitch), camera.position.z + Math.cos(yaw) * Math.cos(pitch));
  }
  function render(time = performance.now()) {
    frame = 0;
    if (!active || disposed) return;
    if (transition) {
      const amount = Math.min((time - transition.start) / 850, 1);
      const ease = amount * amount * (3 - 2 * amount);
      camera.position.lerpVectors(transition.from, transition.to, ease);
      controls.target.lerpVectors(transition.fromTarget, transition.toTarget, ease);
      camera.lookAt(controls.target);
      if (amount === 1) { transition = null; if (mode === 'interior') lookAround(); }
    }
    composer.render();
    if (transition) frame = requestAnimationFrame(render);
  }
  function invalidate() { if (!frame && active && !disposed) frame = requestAnimationFrame(render); }
  function resize() {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false); composer.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix(); invalidate();
  }
  function setView(nextMode, nextRoom = room, animate = true) {
    mode = nextMode; room = nextRoom;
    controls.enabled = mode === 'overview'; walls.scale.y = mode === 'overview' ? .25 : 1;
    windows.visible = mode === 'interior'; outdoors.visible = mode === 'interior';
    ground.visible=mode==='overview';
    scene.background=mode==='overview'?new THREE.Color('#e7e9e6'):park;
    scene.backgroundBlurriness=mode==='overview'?0:.075;scene.backgroundIntensity=.65;
    const position = mode === 'overview' ? new THREE.Vector3(11.5, 15.5, 17) : new THREE.Vector3(...rooms[room].camera);
    const target = mode === 'overview' ? new THREE.Vector3(0, 0, 0) : new THREE.Vector3(...rooms[room].target);
    camera.fov = mode === 'overview' ? 40 : 70; camera.updateProjectionMatrix();
    const delta = target.clone().sub(position).normalize(); yaw = Math.atan2(delta.x, delta.z); pitch = Math.asin(delta.y);
    // Interior views stay at a fixed standing point; no collision-prone free walking.
    if (animate && !reducedMotion.matches) {
      transition = { from: camera.position.clone(), to: position, fromTarget: controls.target.clone(), toTarget: target, start: performance.now() };
    } else { transition = null; camera.position.copy(position); controls.target.copy(target); camera.lookAt(target); }
    canvas.dataset.view = mode; canvas.dataset.currentRoom = room; invalidate();
  }
  function rotate(amount) {
    transition = null;
    if (mode === 'overview') {
      const offset = camera.position.clone().sub(controls.target); offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), amount); camera.position.copy(controls.target).add(offset); controls.update();
    } else { yaw += amount; lookAround(); }
    invalidate();
  }
  function zoom(amount) {
    transition = null;
    if (mode === 'overview') {
      const offset = camera.position.clone().sub(controls.target); offset.setLength(THREE.MathUtils.clamp(offset.length() * amount, 9, 27)); camera.position.copy(controls.target).add(offset); controls.update();
    } else { camera.fov = THREE.MathUtils.clamp(camera.fov * amount, 45, 90); camera.updateProjectionMatrix(); }
    invalidate();
  }
  controls.addEventListener('change', invalidate);
  controls.addEventListener('start', () => { transition = null; onInteraction(); });
  canvas.addEventListener('pointerdown', event => {
    onInteraction(); transition = null;
    if (mode === 'interior' && event.isPrimary) { pointer = { id: event.pointerId, x: event.clientX, y: event.clientY }; canvas.setPointerCapture(event.pointerId); }
  });
  canvas.addEventListener('pointermove', event => {
    if (!pointer || event.pointerId !== pointer.id || mode !== 'interior') return;
    yaw -= (event.clientX - pointer.x) * .006; pitch = THREE.MathUtils.clamp(pitch + (event.clientY - pointer.y) * .005, -.9, .9);
    pointer.x = event.clientX; pointer.y = event.clientY; lookAround(); invalidate();
  });
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) canvas.addEventListener(name, () => { pointer = null; });
  canvas.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', '+', '-', '=', 'Home'].includes(event.key)) return;
    event.preventDefault(); onInteraction();
    if (event.key === 'Home') setView(mode, room, false);
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') rotate(event.key === 'ArrowLeft' ? -.18 : .18);
    else zoom(event.key === '-' ? 1.12 : .88);
  });
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); active = false; onError(); });
  const observer = new ResizeObserver(resize); observer.observe(host);
  setView('overview', 'living', false); resize();
  return {
    rooms, setView, rotate, zoom,
    setPalette(palette) {
      const cool = palette === 'cool';
      oak.color.set(cool ? '#a9a79e' : '#b99c76'); floor.color.set(cool ? '#c7cdd0' : '#e2d2b6');
      fabric.color.set(cool ? '#aeb7b4' : '#c8c0b1'); sage.color.set(cool ? '#667e88' : '#899282');
      plaster.color.set(cool ? '#e7e9e6' : '#eeeae2'); invalidate();
    },
    setActive(value) { active = value; if (value) invalidate(); else if (frame) { cancelAnimationFrame(frame); frame = 0; } },
    dispose() {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect(); controls.dispose();
      const geometries = new Set(); scene.traverse(object => { if (object.geometry) geometries.add(object.geometry); });
      geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose());
      renderer.dispose(); canvas.remove();
      renderPass.dispose(); ambientOcclusion.dispose(); outputPass.dispose(); composer.dispose();
    }
  };
}
