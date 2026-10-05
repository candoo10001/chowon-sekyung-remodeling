/* Planning study: proportions, structure and common core remain unverified. */
(() => {
  const plan={width:7.2,depth:12,height:2.35,
    footprint:[[-3.6,-6],[1.5,-6],[1.5,-2.5],[.2,-2.5],[.2,-1.2],[1.7,-1.2],[1.7,1.1],[3.6,1.1],[3.6,6],[-3.6,6]],
    rooms:{
      living:{name:'거실',bounds:[-3.6,2.2,-.15,6],label:[-1.85,4.2],camera:[-.65,1.5,2.8],target:[-2.3,1,4.8]},
      kitchen:{name:'주방 · 다이닝',bounds:[-3.6,.4,-.5,3.3],label:[-2,1.3],camera:[-.7,1.5,2.1],target:[-2.65,1,.7]},
      master:{name:'안방',bounds:[-.15,2.5,3.6,6],label:[1.55,4.2],camera:[.45,1.5,5.1],target:[2.35,.8,3.7]},
      bedroom:{name:'침실 2',bounds:[-.9,-6,1.5,-3.1],label:[.3,-4.6],camera:[.82,1.5,-3.5],target:[-.15,.8,-5.05]},
      study:{name:'서재',bounds:[-3.6,-6,-.9,-3.1],label:[-2.25,-4.6],camera:[-2.2,1.5,-3.45],target:[-2.3,.85,-5]},
      bath:{name:'공용 욕실',bounds:[-3.6,-2.9,-1.9,-.7],label:[-2.75,-1.8],camera:[-2.15,1.5,-1.2],target:[-3,.95,-2.1],floor:'stone'},
      ensuite:{name:'부부욕실',bounds:[.2,-1.2,1.7,1.1],label:[.95,-.1],camera:[.64,1.5,.78],target:[1.18,.86,-.22],floor:'stone'},
      entry:{name:'현관',bounds:[-1.5,-2.5,.2,-1.2],label:[-.6,-1.85],camera:[-.15,1.5,-1.83],target:[-1.05,1.15,-.4]}
    },
    zones:[{name:'드레스룸',bounds:[.2,1.1,3.6,2.5],label:[1.8,1.75]},{name:'다용도 · 수납',bounds:[-3.6,-.7,-2,.4],label:[-2.8,-.07]},{name:'발코니',bounds:[2.2,5.1,3.6,6],label:[2.9,5.6]}],
    walls:[
      [-3.6,-6,-3.6,6],[-3.6,-6,1.5,-6],[1.5,-6,1.5,-2.5],
      [1.5,-2.5,.2,-2.5],[.2,-2.5,.2,-2.3],[.2,-1.45,.2,-1.2],[.2,-1.2,1.7,-1.2],[1.7,-1.2,1.7,1.1],[1.7,1.1,3.6,1.1],[3.6,1.1,3.6,6],[-3.6,6,3.6,6],
      [-.9,-6,-.9,-3.1],[-3.6,-3.1,-1.85,-3.1],[-1,-3.1,.3,-3.1],[1.15,-3.1,1.5,-3.1],
      [-3.6,-2.9,-1.9,-2.9],[-1.9,-2.9,-1.9,-2.1],[-1.9,-1.25,-1.9,-.7],[-3.6,-.7,-1.9,-.7],
      [-2,-.7,-2,-.4],[-2,.25,-2,.4],[-3.6,.4,-1.2,.4],
      [.2,-1.2,.2,1.1],[.2,1.1,.35,1.1],[1.15,1.1,1.7,1.1],
      [-.15,2.5,-.15,2.6],[-.15,3.45,-.15,6],[-.15,2.5,1,2.5],[2.5,2.5,3.6,2.5],
      [2.2,5.1,3.6,5.1],[2.2,5.1,2.2,5.2],[2.2,5.95,2.2,6]
    ],
    doors:[[-1.425,-3.1,'h',-1],[.725,-3.1,'h',-1],[-1.9,-1.675,'v',-1],[.2,-1.875,'v',1],[.75,1.1,'h',1],[-.15,3.025,'v',1]],
    windows:[[-2.25,-6,2.15],[.3,-6,1.85],[-1.85,6,2.85],[.95,6,1.75],[2.9,6,1]],
    fixtures:[
      {type:'shower',x:-2.75,z:-2.5,w:1.45,d:.65},{type:'basin',x:-3.24,z:-1.1,w:.49,d:.55},{type:'wc',x:-3.12,z:-1.84,w:.57,d:.38},
      {type:'shower',x:.95,z:-.75,w:1.23,d:.6},{type:'basin',x:1.4,z:.55,w:.44,d:.49},{type:'wc',x:1.3,z:-.2,w:.58,d:.37}
    ],
    furniture:[
      {type:'sofa',x:-3,z:4.55,w:.85,d:2.35},{type:'coffee',x:-1.78,z:4.65,w:.8,d:.8},{type:'media',x:-.36,z:4.75,w:.28,d:1.55},{type:'dining',x:-1.85,z:2.45,w:1.2,d:.72},
      {type:'counter',x:-2.35,z:.75,w:2.3,d:.62},{type:'fridge',x:-3.19,z:1.8,w:.64,d:.64},
      {type:'chair',x:-2.18,z:3.08,w:.46,d:.46},{type:'chair',x:-1.52,z:3.08,w:.46,d:.46},
      {type:'bed',x:2.43,z:3.72,w:1.5,d:2,angle:-Math.PI/2},{type:'bed',x:-.3,z:-4.83,w:1,d:2},{type:'bookshelf',x:-3.42,z:-4.55,w:.34,d:2.4},{type:'armchair',x:-2.35,z:-5.05,w:.75,d:.75},
      {type:'desk',x:-1.45,z:-4.25,w:.55,d:1.1},
      {type:'wardrobe',x:3.23,z:1.8,w:.55,d:1.15},{type:'wardrobe',x:2.05,z:1.445,w:1.5,d:.55},{type:'wardrobe',x:1.15,z:-4.62,w:.5,d:1.2}
    ]
  };
  const X=x=>230+x*42,Y=z=>285+z*42;
  const rect=(x,z,w,d,fill,attrs='')=>`<rect x="${X(x)}" y="${Y(z)}" width="${w*42}" height="${d*42}" fill="${fill}" ${attrs}/>`;
  const text=(name,x,z,size=11)=>`<text x="${X(x)}" y="${Y(z)}" text-anchor="middle" fill="#2e4438" font-size="${size}" font-weight="600">${name}</text>`;
  const wall=([x,z,a,b])=>`<path d="M${X(x)},${Y(z)} L${X(a)},${Y(b)}" stroke="#39483f" stroke-width="5"/>`;
  const original=()=>{
    const b=[[-3.6,-3.6,3.6,-3.6],[-3.6,-3.6,-3.6,4.5],[3.6,-3.6,3.6,4.5],[-3.6,4.5,3.6,4.5],[.15,-3.6,.15,-1.05],[.15,-1.05,3.6,-1.05],[1.3,-1.05,1.3,.4],[-.15,.4,3.6,.4],[-.15,.4,-.15,3.6],[-3.6,3.6,3.6,3.6]];
    return rect(-3.6,-3.6,7.2,7.2,'#efeae0')+rect(-3.6,3.6,7.2,.9,'#e1e8df')+b.map(wall).join('')+[['주방 · 식당',-2,-1.6],['작은방',1.8,-2.3],['욕실',2.4,-.25],['거실',-1.9,2],['안방',1.8,2],['현관',-.65,-3.1],['발코니',0,4.1]].map(a=>text(...a)).join('');
  };
  const svg=mode=>{
    const outline=plan.footprint.map(([x,z])=>`${X(x)},${Y(z)}`).join(' '),old=mode==='old',analysis=mode==='analysis';
    let drawing=old?original():`<polygon points="${outline}" fill="#f4f0e6" stroke="#465249" stroke-width="2"/>`;
    if(!old){
      drawing+=rect(1.76,-5.8,1.65,6.6,'#e6e9e6','rx="5"')+text('공용 코어',2.55,-3.45,10)+text('세대 외부',2.55,-3.05,9);
      drawing+=[...plan.zones,...Object.values(plan.rooms).filter(r=>r.floor==='stone')].map(r=>rect(r.bounds[0],r.bounds[1],r.bounds[2]-r.bounds[0],r.bounds[3]-r.bounds[1],'#e3e9e1')).join('');
      drawing+=plan.walls.map(wall).join('');
      drawing+=plan.windows.map(([x,z,w])=>`<path d="M${X(x-w/2)},${Y(z)} h${w*42}" stroke="#729ba4" stroke-width="5"/>`).join('');
      drawing+=plan.doors.map(([x,z,o,side])=>o==='v'?`<path d="M${X(x)},${Y(z-.425)} h${side*33.6} a33.6,33.6 0 0 ${side<0?0:1} ${-side*33.6},33.6" fill="none" stroke="#859285"/>`:`<path d="M${X(x-.425)},${Y(z)} v${side*33.6} a33.6,33.6 0 0 ${side<0?1:0} 33.6,${-side*33.6}" fill="none" stroke="#859285"/>`).join('');
      if(!analysis)drawing+=plan.furniture.map(f=>rect(f.x-(f.angle?f.d:f.w)/2,f.z-(f.angle?f.w:f.d)/2,f.angle?f.d:f.w,f.angle?f.w:f.d,['bed','sofa','armchair'].includes(f.type)?'#d3d7cc':'#d4bfa0','rx="3" stroke="#aeb4a7" stroke-width=".7"')).join('');
      if(!analysis)drawing+=plan.fixtures.map(f=>rect(f.x-f.w/2,f.z-f.d/2,f.w,f.d,f.type==='shower'?'#dae5e4':'#fff','rx="4" stroke="#8a9c93" stroke-width="1"')).join('');
      if(analysis)drawing+=`<path d="M${X(2.2)},${Y(-1.85)} H${X(-.75)} V${Y(2.8)}" stroke="#aa7535" stroke-width="9" opacity=".35" fill="none"/>`+text('연결 동선',-.75,.05,9)+text('후면 침실군',-1.05,-5.5,10);
      drawing+=[...Object.values(plan.rooms),...plan.zones].map(r=>text(r.name,...r.label,r.name.length>7?9:11)).join('');
    }
    return `<svg viewBox="0 0 460 620" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${old?'기존 공개 평면 참고도':'공개 리모델링 검토 도면에서 착안한 계단형 평면'}"><rect width="460" height="620" fill="#fafbf8"/>${text(old?'기존 2침실 · 인테리어 공개 평면 참고':'공개 검토도 참고 · 현재 승인 여부 미확인',0,-6.5,10)}${drawing}${text(old?'치수 없는 공개 이미지에서 공간 관계만 재작성':'가구 배치 검토안 · 그림의 축척/치수는 시공 기준 아님',0,6.9,9)}${text('세대별 구조·설비·코어 확인 필요',0,7.4,9)}</svg>`;
  };
  const common={badge:'공개 검토도 참고안',ratio:'승인 여부 미확인',specOld:'전용 49.68㎡ · 공급 약 19평',specNew:'최종 전용·공급면적 미확인',specIncrease:'2026.02 공유 도면과 05월 보도 면적 상이',specBalcony:'서비스 면적은 별도 확인 필요',features:['직사각형에 방을 나열하지 않고 공용 코어를 피해 꺾이는 외곽','뒤쪽 침실 2개 → 중간 현관·욕실·주방 → 앞쪽 거실·안방','공용 욕실 + 부부욕실 + 드레스룸 + 다용도 수납','치수·구조·배관은 미검증 · 현재 확정 계획으로 사용 불가']};
  window.APARTMENT_LAYOUT=plan;
  window.floorPlanData={
    type59A:{...common,layout:'코어를 피한 수평증축',code:'PLAN STUDY / SHARED 2D + 3D',title:'동선과 생활 공간을 나눈 검토안',desc:'초원세경 게시판에 공유된 리모델링 도면의 단계별 공간 구성을 참고했습니다. 기존 좌측 주방·거실과 우측 안방 관계를 살리고, 후면 침실군·중간 서비스 공간·측면 진입을 검토합니다. 가구와 설비는 별도 배치한 가정이며 해당 도면의 승인 여부는 확인되지 않았습니다.',svg:svg('plan')},
    type59B:{...common,layout:'동선 · 서비스 공간',code:'CIRCULATION / SERVICE ZONES',title:'현관에서 거실까지, 방을 통과하지 않는 길',desc:'현관은 공용 코어 측에서 들어오고, 중앙 연결 공간에서 각 방과 욕실로 분기합니다. 주방을 가로질러 방에 들어가지 않도록 가구를 벽 쪽으로 모았습니다. 깊어진 중앙부의 자연채광 한계와 설비 이동 검토는 여전히 남습니다.',svg:svg('analysis')},
    type49old:{...common,layout:'기존 2침실 배치',code:'EXISTING / PUBLISHED REFERENCE',title:'기존 19평형 · 공개 평면 참고도',desc:'오늘의집 시공사례에 연결된 한샘라임인테리어의 2017년 평면을 단순화했습니다. 뒤쪽 현관·주방·작은방, 오른쪽 중간 욕실, 앞쪽 거실·안방과 발코니 구성입니다. 치수와 내력벽 정보는 확인되지 않았습니다.',svg:svg('old')}
  };
})();
