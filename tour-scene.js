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
 study:['LIBRARY','책과 사색을 위한 서재','벽면 가득 채운 원목 서가와 아늑한 1인 리딩 체어. 오롯이 독서와 집필에 몰입할 수 있도록 서재 본연의 공간으로 완성했습니다.'],
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
  const renderer = new THREE.WebGLRenderer({antialias:true});
  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 2));
  renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.02;
  const canvas=renderer.domElement; canvas.tabIndex=0;
  canvas.setAttribute('aria-label','가상 아파트 3D 뷰어. 드래그로 둘러보기. 아래 버튼으로도 조작할 수 있습니다.');
  host.append(canvas);
  textures.slice(0,4).forEach(t=>{
    t.wrapS=t.wrapT=THREE.RepeatWrapping;
    t.repeat.set(3,4);
    t.anisotropy=maxAnisotropy;
    t.generateMipmaps=true;
    t.minFilter=THREE.LinearMipmapLinearFilter;
    t.magFilter=THREE.LinearFilter;
  });
  textures[0].colorSpace=THREE.SRGBColorSpace;
  const scene=new THREE.Scene();scene.background=new THREE.Color('#e7e9e6');
  hdr.mapping=THREE.EquirectangularReflectionMapping;scene.environment=hdr;scene.environmentIntensity=1.15;
  const camera=new THREE.PerspectiveCamera(42,1,.05,150);
  const composer=new EffectComposer(renderer);
  const renderPass=new RenderPass(scene,camera);
  const mobileRendering = window.matchMedia('(pointer: coarse)').matches;
  const ambientOcclusion=new SSAOPass(scene,camera,1,1,32);
  ambientOcclusion.enabled = !mobileRendering;
  ambientOcclusion.kernelRadius=0.65;
  ambientOcclusion.minDistance=0.005;
  ambientOcclusion.maxDistance=0.24;
  const outputPass=new OutputPass();
  composer.addPass(renderPass);composer.addPass(ambientOcclusion);composer.addPass(outputPass);
  const controls=new OrbitControls(camera,canvas);
  controls.enableDamping=false;controls.enablePan=false;controls.minDistance=9;controls.maxDistance=27;
  controls.minPolarAngle=.15;controls.maxPolarAngle=Math.PI/2.35;controls.zoomSpeed=.7;

  function createMarbleTexture() {
    const c = document.createElement('canvas');
    c.width = 1024; c.height = 1024;
    const ctx = c.getContext('2d');
    if (!ctx) return null;
    ctx.fillStyle = '#f7f4ed'; ctx.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 50; i++) {
      const x = (i * 149) % 1024, y = (i * 197) % 1024, r = 80 + (i % 6) * 40;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(230, 224, 212, 0.40)');
      g.addColorStop(1, 'rgba(247, 244, 237, 0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    const veins = [
      { color: 'rgba(145, 137, 126, 0.28)', w: 4.5 },
      { color: 'rgba(180, 155, 120, 0.22)', w: 2.5 },
      { color: 'rgba(125, 118, 108, 0.18)', w: 2 }
    ];
    veins.forEach((v, vi) => {
      for (let j = 0; j < 4; j++) {
        ctx.strokeStyle = v.color; ctx.lineWidth = v.w; ctx.beginPath();
        let x = (vi * 320 + j * 240 + 60) % 1024, y = 0;
        ctx.moveTo(x, y);
        while (y < 1024) {
          y += 35;
          x += Math.sin(y * 0.025 + j) * 24 + ((j % 2) ? 8 : -8);
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    });
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = maxAnisotropy;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }
  const marbleTexture = createMarbleTexture();

  const materials=[];
  function material(color,extra={}) {const m=new THREE.MeshPhysicalMaterial({color,roughness:.5,...extra});materials.push(m);return m;}
  const oakTexture = textures[0].clone();
  oakTexture.wrapS = oakTexture.wrapT = THREE.RepeatWrapping;
  oakTexture.repeat.set(2.5, 2.5);
  const oak=material('#ba9e7c',{map:oakTexture,normalMap:textures[1],roughnessMap:textures[2],normalScale:new THREE.Vector2(.10,.10),roughness:.38,clearcoat:.18,clearcoatRoughness:.22});
  const floor=material('#e8dac0',{map:textures[0],normalMap:textures[1],roughnessMap:textures[2],normalScale:new THREE.Vector2(.14,.14),roughness:.32,metalness:.02,clearcoat:.36,clearcoatRoughness:.20,reflectivity:.55});
  const plaster=material('#f3f0e8',{roughness:.82});
  const cream=material('#e5ded0',{normalMap:textures[3],normalScale:new THREE.Vector2(.12,.12),roughness:.72,sheen:.75,sheenColor:new THREE.Color('#faf5ea'),sheenRoughness:.35});
  const white=material('#faf9f5',{roughness:.68,clearcoat:.15});
  const ceramic=material('#ffffff',{roughness:.06,metalness:.02,clearcoat:1.0,clearcoatRoughness:.03,reflectivity:.92});
  const baseboard=material('#ede8de',{roughness:.5,clearcoat:.15});
  const stone=material('#ede7dc',{...(marbleTexture ? {map:marbleTexture} : {}),roughness:.14,metalness:.02,clearcoat:.88,clearcoatRoughness:.06,reflectivity:.85});
  const dark=material('#1f2220',{metalness:.72,roughness:.26,clearcoat:.18});
  const brass=material('#cca562',{metalness:.94,roughness:.20,clearcoat:.35,clearcoatRoughness:.12});
  const fabric=material('#cec6b8',{normalMap:textures[3],normalScale:new THREE.Vector2(.18,.18),roughness:.82,sheen:.92,sheenRoughness:.35,sheenColor:new THREE.Color('#f4f0e6')});
  const sage=material('#7e8c7c',{normalMap:textures[3],normalScale:new THREE.Vector2(.14,.14),roughness:.76,sheen:.65,sheenRoughness:.40,sheenColor:new THREE.Color('#9eb09b')});
  const rug=material('#d4cbba',{normalMap:textures[3],normalScale:new THREE.Vector2(.25,.25),roughness:.94,sheen:.85,sheenRoughness:.50,sheenColor:new THREE.Color('#eee9dd')});
  const glass=material('#eef6f5',{transmission:.90,opacity:1,transparent:true,ior:1.52,roughness:.04,metalness:.02,depthWrite:false});
  const mirror=material('#e4e8e5',{metalness:.98,roughness:.04,clearcoat:1,clearcoatRoughness:.02});
  const glow=material('#fff4e2',{emissive:new THREE.Color('#ffdfa6'),emissiveIntensity:2.2,roughness:.2});
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
    cylinder(.17,.38,x,.19,z,white);
    cylinder(.15,.02,x,.36,z,dark);
    cylinder(.014,.9,x,.72,z,oak);
    for(let i=0;i<11;i++){
      const angle=i*2.15,dist=.15+(i%3)*.04,height=.48+i*.055;
      const leaf=new THREE.Mesh(new THREE.SphereGeometry(.14,14,10),sage);
      leaf.scale.set(.75,.08,1.8);leaf.position.set(x+Math.sin(angle)*dist,height,z+Math.cos(angle)*dist);
      leaf.rotation.set(.35+(i%2)*.12,angle,.25);leaf.castShadow=true;apartment.add(leaf);
    }
  }
  function bed(x,z,w,accent,angle=0) {
    const first=apartment.children.length;
    const isDouble=w>1.3,count=isDouble?2:1;
    box(w+.06,.08,2.06,x,.04,z,dark,apartment);
    box(w+.12,.18,2.08,x,.17,z,oak,apartment,.03);
    box(w+.16,1.05,.16,x,.60,z-1.05,fabric,apartment,.06);
    for(let c=-1;c<=1;c++)box(.008,.95,.015,x+c*(w*.28),.62,z-.97,dark,apartment);
    box(w,.26,1.96,x,.39,z,white,apartment,.06);
    box(w+.04,.14,1.32,x,.51,z+.28,cream,apartment,.08);
    box(w+.05,.04,.42,x,.59,z+.72,accent,apartment,.04);
    for(let i=0;i<count;i++){
      const px=isDouble?x+(i-.5)*.74:x;
      const p1=box(isDouble?.62:.72,.20,.32,px,.61,z-.72,cream,apartment,.08);p1.rotation.x=-.32;
      const p2=box(isDouble?.58:.68,.16,.34,px,.55,z-.44,white,apartment,.07);p2.rotation.x=-.10;
    }
    box(isDouble?.46:.38,.12,.22,x,.57,z-.30,sage,apartment,.05);
    for(const side of [-1,1]){
      const nx=x+side*(w/2+.32),nz=z-.85;
      box(.38,.24,.34,nx,.30,nz,oak,apartment,.02);
      box(.39,.022,.35,nx,.43,nz,stone,apartment,.01);
      cylinder(.055,.015,nx,.45,nz,brass);cylinder(.008,.22,nx,.56,nz,brass);cylinder(.085,.13,nx,.64,nz,glow);
    }
    if(angle){const parts=apartment.children.slice(first);const group=new THREE.Group();group.position.set(x,0,z);apartment.add(group);parts.forEach(part=>group.attach(part));group.rotation.y=angle;}
  }
  function chair(x,z,angle=0) {
    const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=angle;apartment.add(g);
    box(.46,.08,.46,0,.45,0,fabric,g,.05);
    box(.44,.32,.08,0,.68,-.19,fabric,g,.04);
    for(const px of [-.16,.16])for(const pz of [-.16,.16])cylinder(.014,.44,px,.22,pz,dark,g);
  }
  function art(x,y,z,angle=0) {
    const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=angle;apartment.add(g);
    box(.92,.72,.035,0,0,0,dark,g,.005);
    box(.88,.68,.038,0,0,.004,white,g);
    box(.80,.60,.042,0,0,.008,cream,g);
    const arch=cylinder(.22,.012,.12,.04,.044,sage,g);arch.rotation.x=Math.PI/2;
    box(.30,.18,.012,-.14,-.10,.046,oak,g,.005);
    box(.14,.32,.010,.10,-.06,.048,brass,g,.005);
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
  textures.slice(0,3).forEach(t=>t.repeat.set(1.4,1.4));
  slab(white,-.25,.2);slab(floor,.003);
  const ceilingMat=plaster.clone();ceilingMat.side=THREE.DoubleSide;materials.push(ceilingMat);slab(ceilingMat,2.36,0,windows);
  for(const zone of [...layout.zones,...Object.values(layout.rooms).filter(r=>r.floor==='stone')]){const [x,z,a,b]=zone.bounds;box(a-x-.12,.018,b-z-.12,(x+a)/2,.02,(z+b)/2,stone);}
  box(1.65,.018,1.17,-.65,.024,-1.85,stone);
  layout.walls.forEach(([x,z,a,b])=>{
    if(z===b&&Math.abs(z)===6)return;
    const w=Math.max(.13,Math.abs(a-x)),d=Math.max(.13,Math.abs(b-z));
    box(w,layout.height,d,(x+a)/2,layout.height/2,(z+b)/2,plaster,walls);
    box(w+.016,.075,d+.016,(x+a)/2,.038,(z+b)/2,baseboard,walls);
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
      for(const px of [-w/2+.10,w/2-.10])for(const pz of [-d/2+.10,d/2-.10])cylinder(.016,.08,x+px,.04,z+pz,dark);
      box(w,.14,d,x,.13,z,fabric,apartment,.05);
      box(.22,.64,d+.04,x-.34,.50,z,fabric,apartment,.06);
      for(const dz of [-.73,0,.73]){
        box(.76,.16,.70,x+.08,.28,z+dz,cream,apartment,.07);
        const b=box(.16,.38,.68,x-.20,.58,z+dz,cream,apartment,.08);b.rotation.z=.14;
      }
      for(const side of [-1,1]){
        box(w,.34,.18,x,.30,z+side*d/2,fabric,apartment,.06);
        const p=box(.15,.32,.32,x-.10,.46,z+side*.62,sage,apartment,.07);p.rotation.set(-.18,side*.25,-.22);
      }
      box(.55,.025,.50,x+.15,.37,z-.65,cream,apartment,.015);
      box(.35,.18,.50,x+.42,.29,z-.65,cream,apartment,.015);
    }else if(f.type==='coffee'){
      cylinder(w/2,.035,x,.32,z,stone);
      cylinder(w/2-.02,.015,x,.295,z,dark);
      for(let a=0;a<3;a++){
        const ang=a*Math.PI*2/3;
        cylinder(.012,.28,x+Math.cos(ang)*(w/2-.08),.14,z+Math.sin(ang)*(w/2-.08),dark);
      }
      cylinder(.24,.030,x+.42,.38,z+.18,oak);
      cylinder(.24,.012,x+.42,.40,z+.18,brass);
      cylinder(.012,.36,x+.42,.18,z+.18,brass);
      box(.22,.025,.16,x-.10,.35,z-.06,dark,apartment,.005);
      box(.19,.020,.14,x-.08,.37,z-.06,white,apartment,.005);
      cylinder(.045,.065,x+.12,.37,z-.08,glass);
      cylinder(.030,.045,x+.12,.36,z-.08,glow);
      cylinder(.09,.025,x+.42,.41,z+.18,cream);
    }else if(f.type==='media'){
      for(let dz=-.75;dz<=.75;dz+=.06)box(.012,1.25,.035,x+.105,1.30,z+dz,oak);
      box(w,.28,d,x,.28,z,oak,apartment,.02);
      box(.025,.78,1.40,x+.085,1.30,z,dark,apartment,.01);
      box(.008,.74,1.36,x+.072,1.30,z,mirror,apartment);
      box(.04,.045,.82,x+.075,.85,z,dark,apartment,.01);
      cylinder(.05,.16,x,1.44,z+.45,cream);
      cylinder(.04,.10,x,1.41,z-.45,stone);
    }else if(f.type==='dining'){
      box(w,.055,d,x,.76,z,oak,apartment,.04);
      for(const dx of [-w/2+.14,w/2-.14]){
        for(const dz of [-d/2+.12,d/2-.12])cylinder(.018,.73,x+dx,.37,z+dz,dark);
      }
      cylinder(.065,.18,x,.87,z,cream);
      cylinder(.005,.32,x,1.05,z,dark);cylinder(.004,.28,x+.02,1.02,z+.02,dark);
      cylinder(.006,.65,x,2.05,z,brass,windows);
      cylinder(.08,.02,x,1.72,z,brass,windows);
      const globe=new THREE.Mesh(new THREE.SphereGeometry(.14,24,16),glow);
      globe.position.set(x,1.62,z);windows.add(globe);
    }else if(f.type==='chair'){
      chair(x,z,Math.PI);
    }else if(f.type==='desk'){
      box(w,.055,d,x,.76,z,oak,apartment,.02);
      for(const dz of [-d*.38,d*.38])box(w*.85,.72,.035,x,.36,z+dz,dark);
      box(w*.75,.09,.40,x,.67,z+d*.22,oak,apartment,.01);
      box(.32,.010,.24,x,.768,z,dark,apartment,.005);
      box(.24,.008,.18,x,.778,z,white,apartment,.003);
      cylinder(.045,.012,x+.16,.775,z-.24,brass);
      cylinder(.006,.35,x+.16,.94,z-.24,brass);
      box(.08,.018,.14,x+.10,1.10,z-.24,glow);
      chair(x-.32,z,Math.PI/2);
    }else if(f.type==='bookshelf'){
      const bw=w,bd=d;
      box(bw,2.15,bd,x,1.10,z,oak,apartment,.01);
      box(bw-.04,2.11,.02,x,1.10,z-bd/2+.015,dark,apartment);
      const bookColors=[dark,brass,sage,cream,oak,white];
      for(let s=0;s<5;s++){
        const sy=0.28+s*0.42;
        box(bw-.02,.025,bd-.02,x,sy,z,oak,apartment);
        const bookCount=Math.floor(bd/0.14)+3;
        let bz=z-bd/2+.12;
        for(let b=0;b<bookCount;b++){
          if(bz>z+bd/2-.15)break;
          const bookWidth=0.028+((b*7)%5)*0.012;
          const bookHeight=0.22+((b*11)%6)*0.022;
          const bookDepth=bw-0.08;
          const bookMat=bookColors[(s*3+b)%bookColors.length];
          const bk=box(bookDepth,bookHeight,bookWidth,x,sy+bookHeight/2+0.012,bz,bookMat,apartment,.003);
          if(b%4===3&&b<bookCount-1)bk.rotation.x=0.15;
          bz+=bookWidth+0.008;
        }
      }
      box(bw-.04,.015,bd-.06,x,2.15,z,glow);
    }else if(f.type==='armchair'){
      const ag=new THREE.Group();ag.position.set(x,0,z);ag.rotation.y=.35;apartment.add(ag);
      cylinder(.58,.008,0,.024,0,rug,ag);
      for(const px of [-.20,.20])for(const pz of [-.20,.20])cylinder(.014,.26,px,.13,pz,dark,ag);
      box(.64,.14,.64,0,.33,0,sage,ag,.06);
      const back=box(.62,.58,.14,0,.68,-.26,sage,ag,.06);back.rotation.x=-0.15;
      for(const side of [-1,1])box(.12,.24,.60,side*.32,.48,0,sage,ag,.04);
      const pillow=box(.36,.18,.12,0,.45,-.16,cream,ag,.04);pillow.rotation.x=-0.18;
      cylinder(.16,.022,.55,.44,-.15,oak,ag);
      cylinder(.012,.42,.55,.22,-.15,brass,ag);
      cylinder(.04,.06,.55,.48,-.15,white,ag);
      cylinder(.10,.015,-.55,.03,-.40,brass,ag);
      cylinder(.010,1.45,-.55,.75,-.40,brass,ag);
      cylinder(.010,.45,-.35,1.48,-.30,brass,ag);
      cylinder(.08,.10,-.18,1.42,-.20,glow,ag);
    }else if(f.type==='counter'){
      box(w-.04,.08,d-.06,x,.04,z,dark,apartment);
      box(w,.76,d,x,.46,z,cream,apartment,.015);
      box(w+.04,.05,d+.05,x,.87,z,stone,apartment,.015);
      box(.05,.84,d+.05,x-w/2-.02,.45,z,stone,apartment,.01);
      box(w,.55,.025,x,1.35,z-.29,stone);
      box(w,.60,.32,x,1.95,z-.15,plaster);
      box(w-.08,.018,.08,x,1.64,z-.15,glow);
      for(let dx=-w/2+.45;dx<w/2;dx+=.45)box(.006,.68,.012,x+dx,.46,z+d/2+.01,brass);
      box(.52,.010,.42,x-.55,.90,z,dark,apartment,.01);
      cylinder(.08,.012,x-.65,.906,z,glow);cylinder(.06,.012,x-.45,.906,z,glow);
      box(.54,.020,.40,x+.55,.895,z,dark,apartment,.02);
      box(.46,.015,.34,x+.55,.905,z,ceramic,apartment,.03);tap(x+.55,z);
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
  box(1.45,.035,.65,-2.75,.045,-2.5,ceramic,apartment,.02);
  box(.44,.40,.50,-3.24,.62,-1.1,oak,apartment,.015);
  box(.49,.07,.55,-3.24,.86,-1.1,stone,apartment,.025);box(.32,.075,.44,-3.24,.925,-1.1,ceramic,apartment,.09);
  box(.015,.82,.56,-3.52,1.48,-1.10,glow,apartment);box(.026,.77,.52,-3.515,1.48,-1.10,mirror,apartment,.06);
  box(.57,.32,.38,-3.12,.22,-1.84,ceramic,apartment,.12);box(.13,.56,.38,-3.4,.38,-1.84,ceramic,apartment,.025);
  box(.75,1.96,.018,-3.14,1.03,-2.17,glass,windows);
  cylinder(.015,1.3,-3.4,1.3,-2.62,brass);cylinder(.11,.02,-3.24,1.98,-2.62,brass);
  // Ensuite is accessed through the dressing room, never through the kitchen.
  box(1.23,.03,.60,.95,.045,-.75,ceramic,apartment,.025);
  box(.40,.44,.45,1.40,.6,.55,oak,apartment,.018);box(.44,.06,.49,1.40,.85,.55,stone,apartment,.015);
  box(.30,.07,.38,1.40,.91,.55,ceramic,apartment,.07);box(.012,.74,.47,1.625,1.43,.55,glow);box(.018,.70,.43,1.62,1.43,.55,mirror);
  box(.58,.33,.37,1.30,.22,-.20,ceramic,apartment,.10);box(.12,.56,.37,1.56,.38,-.20,ceramic,apartment,.015);
  box(.70,1.96,.018,1.20,1.03,-.43,glass,windows);
  cylinder(.015,1.25,.48,1.30,-1.05,brass);cylinder(.11,.02,.48,1.94,-.87,brass);
  // A narrow shoe cabinet sits outside the clear route between entry and bedrooms.
  box(1.30,2.1,.26,-.67,1.07,-2.34,cream);box(.018,1.12,.54,.105,1.48,-1.86,mirror);
  for(const [x,z]of [[-1.8,4.5],[1.8,3.5],[-.7,-.1],[-2.6,-1.5],[-2.3,-4.5],[.3,-4.5],[.95,.3]]){
    cylinder(.052,.006,x,2.355,z,white,windows);
    cylinder(.036,.006,x,2.350,z,glow,windows);
  }

  const ground=box(200,.1,200,0,-.34,0,material('#e7e9e6'),scene);ground.castShadow=false;
  const hemi=new THREE.HemisphereLight('#f2f7ff','#cfbea7',.85);scene.add(hemi);
  const sun=new THREE.DirectionalLight('#fff3df',2.8);sun.position.set(-3.5,7.5,8.5);sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-7.5;sun.shadow.camera.right=7.5;sun.shadow.camera.top=7.5;sun.shadow.camera.bottom=-7.5;sun.shadow.camera.near=1;sun.shadow.camera.far=28;sun.shadow.normalBias=.020;sun.shadow.bias=-.0002;sun.shadow.radius=2.8;scene.add(sun);
  const fill=new THREE.DirectionalLight('#dce6fa',.85);fill.position.set(2,6,-7);scene.add(fill);

  const interiorLights = [
    new THREE.PointLight('#ffe4be', 3.0, 7.0, 2),
    new THREE.PointLight('#ffdea2', 3.2, 5.5, 2),
    new THREE.PointLight('#ffd69c', 2.4, 4.5, 2),
    new THREE.PointLight('#ffe2bc', 2.0, 4.2, 2),
    new THREE.PointLight('#ffdfb0', 2.0, 4.2, 2),
    new THREE.PointLight('#fff1da', 1.8, 3.5, 2)
  ];
  const interiorPositions = [
    [-1.8, 2.2, 4.2],
    [-0.6, 2.0, 0.4],
    [2.0, 1.6, 3.8],
    [-2.0, 1.8, -3.8],
    [-0.6, 2.1, -1.8],
    [-3.2, 1.7, -1.1]
  ];
  interiorLights.forEach((light, i) => {
    light.position.set(...interiorPositions[i]);
    light.castShadow = false;
    apartment.add(light);
  });

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
      oak.color.set(cool ? '#9e9c93' : '#ba9e7c');
      floor.color.set(cool ? '#c0c6c8' : '#e8dac0');
      fabric.color.set(cool ? '#a8b0ae' : '#cec6b8');
      sage.color.set(cool ? '#5e757d' : '#7e8c7c');
      plaster.color.set(cool ? '#e6e8e5' : '#f3f0e8');
      baseboard.color.set(cool ? '#e2e4e1' : '#ede8de');
      invalidate();
    },
    setDaylight(timeOfDay) {
      if (timeOfDay === 'morning') {
        sun.color.set('#ffdda8');
        sun.intensity = 2.5;
        sun.position.set(-8, 5, 6);
        fill.color.set('#e5eeff');
        fill.intensity = 0.75;
        hemi.color.set('#f4f8ff');
        hemi.groundColor.set('#c4b49d');
        interiorLights[0].intensity = 2.0;
        interiorLights[1].intensity = 2.2;
        interiorLights[2].intensity = 1.6;
        interiorLights[3].intensity = 1.4;
        interiorLights[4].intensity = 1.4;
        interiorLights[5].intensity = 1.2;
        renderer.toneMappingExposure = 0.98;
      } else if (timeOfDay === 'evening') {
        sun.color.set('#ff8840');
        sun.intensity = 2.2;
        sun.position.set(-9, 3, 4);
        fill.color.set('#a0b4db');
        fill.intensity = 0.55;
        hemi.color.set('#ffd1a8');
        hemi.groundColor.set('#8c7662');
        interiorLights[0].intensity = 3.8;
        interiorLights[1].intensity = 4.0;
        interiorLights[2].intensity = 3.2;
        interiorLights[3].intensity = 2.8;
        interiorLights[4].intensity = 2.8;
        interiorLights[5].intensity = 2.5;
        renderer.toneMappingExposure = 0.94;
      } else {
        sun.color.set('#fff3df');
        sun.intensity = 2.8;
        sun.position.set(-3.5, 7.5, 8.5);
        fill.color.set('#dce6fa');
        fill.intensity = 0.85;
        hemi.color.set('#f2f7ff');
        hemi.groundColor.set('#cfbea7');
        interiorLights[0].intensity = 3.0;
        interiorLights[1].intensity = 3.2;
        interiorLights[2].intensity = 2.4;
        interiorLights[3].intensity = 2.0;
        interiorLights[4].intensity = 2.0;
        interiorLights[5].intensity = 1.8;
        renderer.toneMappingExposure = 1.02;
      }
      invalidate();
    },
    setActive(value) { active = value; if (value) invalidate(); else if (frame) { cancelAnimationFrame(frame); frame = 0; } },
    dispose() {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect(); controls.dispose();
      const geometries = new Set(); scene.traverse(object => { if (object.geometry) geometries.add(object.geometry); });
      geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose());
      if (marbleTexture) marbleTexture.dispose();
      if (oakTexture) oakTexture.dispose();
      renderer.dispose(); canvas.remove();
      renderPass.dispose(); ambientOcclusion.dispose(); outputPass.dispose(); composer.dispose();
    }
  };
}
