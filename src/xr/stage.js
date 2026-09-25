import * as THREE from 'three';

const materialColors = {
  'Structural steel': 0x84908e, 'Reinforced concrete': 0x8c8b7e,
  'Laminated glass': 0x75c1c9, 'Cross-laminated wood': 0x9b6c46,
  'Spider silk': 0xe5c8b7, 'Mycelium + fiber': 0xa4b581,
  'Bone lattice': 0xd5c9a4, 'Cellular composite': 0x8c91a8,
  'Programmable matter': 0x9e85c5, 'Mixed / realistic': 0x888c83,
};

function makeLabel(text, accent) {
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(9,12,13,.68)'; ctx.fillRect(0,0,1024,256);
  ctx.strokeStyle = accent; ctx.lineWidth = 2; ctx.strokeRect(2,2,1020,252);
  ctx.fillStyle = '#d9ebaa'; ctx.font = '20px monospace'; ctx.fillText('ELSEWHERE   /   WORLD STUDY', 36, 57);
  ctx.fillStyle = '#f1f0e9'; ctx.font = '52px sans-serif'; ctx.fillText(text.slice(0,28), 36, 130);
  ctx.fillStyle = '#b1b7ac'; ctx.font = '19px monospace'; ctx.fillText('SELECT  TELEPORT    ·    SQUEEZE  SCALE    ·    THUMBSTICK  MOVE', 36, 201);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(new THREE.PlaneGeometry(5.3,1.32), new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:THREE.DoubleSide}));
}

function city(world, root, palette, materialColor, scene, pickables) {
  const ground = new THREE.Mesh(new THREE.CircleGeometry(35, 72), new THREE.MeshStandardMaterial({color:0x111717,roughness:.82,metalness:.18}));
  ground.rotation.x=-Math.PI/2; ground.position.y=-.07; root.add(ground);
  const road = new THREE.Mesh(new THREE.RingGeometry(6.8,7.3,96), new THREE.MeshBasicMaterial({color:palette[1],transparent:true,opacity:.42,side:THREE.DoubleSide}));
  road.rotation.x=-Math.PI/2; road.position.y=-.045; root.add(road);
  const boxGeometry=new THREE.BoxGeometry(1,1,1), count=110;
  const instanced=new THREE.InstancedMesh(boxGeometry,new THREE.MeshStandardMaterial({color:materialColor,roughness:.48,metalness:.43}),count);
  const dummy=new THREE.Object3D(), color=new THREE.Color();
  for(let i=0;i<count;i++){
    const angle=i*2.399, radius=8+(i%11)*1.45, x=Math.cos(angle)*radius,z=Math.sin(angle)*radius;
    const h=2.2+((i*37)%21)*.34, width=.7+(i%5)*.19;
    dummy.position.set(x,h/2-.05,z);dummy.scale.set(width,h,width);dummy.rotation.y=angle*.2;dummy.updateMatrix();instanced.setMatrixAt(i,dummy.matrix);
    color.set(i%7===0?palette[1]:materialColor);instanced.setColorAt(i,color);
    if(i<20){const specimen=new THREE.Mesh(new THREE.BoxGeometry(.22,.22,.22),new THREE.MeshStandardMaterial({color:palette[1],emissive:palette[1],emissiveIntensity:.62}));specimen.position.set(x,h+.16,z);specimen.userData.pickable=true;root.add(specimen);pickables.push(specimen);}
  }
  root.add(instanced);
  const path=new THREE.Mesh(new THREE.RingGeometry(18.5,18.58,96),new THREE.MeshBasicMaterial({color:palette[0],transparent:true,opacity:.62,side:THREE.DoubleSide}));path.rotation.x=-Math.PI/2;path.position.y=.01;root.add(path);
}

function web(world, root, palette, pickables) {
  const lines=[];const count=26;
  for(let i=0;i<count;i++){
    const angle=2*Math.PI*i/count,r=8+(i%5)*.18;
    lines.push(0,2,0,Math.cos(angle)*r,1.2+(i%4)*.24,Math.sin(angle)*r);
    if(i%2===0){const next=2*Math.PI*((i+2)%count)/count;lines.push(Math.cos(angle)*r,1.2+(i%4)*.24,Math.sin(angle)*r,Math.cos(next)*r,1.2+((i+2)%4)*.24,Math.sin(next)*r);}
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(lines,3));
  const silk=new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color:palette[1],transparent:true,opacity:.82}));root.add(silk);
  const nodeGeo=new THREE.IcosahedronGeometry(.11,1);
  for(let i=0;i<18;i++){const angle=i*2.399,r=2+(i%6)*1.15;const node=new THREE.Mesh(nodeGeo,new THREE.MeshStandardMaterial({color:palette[i%3],emissive:palette[i%3],emissiveIntensity:.38,roughness:.38}));node.position.set(Math.cos(angle)*r,1.2+(i%5)*.37,Math.sin(angle)*r);node.userData.pickable=true;root.add(node);pickables.push(node);}
  const floor=new THREE.Mesh(new THREE.CircleGeometry(17,64),new THREE.MeshStandardMaterial({color:0x111719,roughness:.94}));floor.rotation.x=-Math.PI/2;floor.position.y=-.1;root.add(floor);
}

function specimen(world, root, palette, baseColor, pickables) {
  const floor=new THREE.Mesh(new THREE.CircleGeometry(19,64),new THREE.MeshStandardMaterial({color:0x111719,roughness:.9}));floor.rotation.x=-Math.PI/2;floor.position.y=-.1;root.add(floor);
  const count=68;
  for(let i=0;i<count;i++){
    const angle=i*2.399,r=1.8+(i%12)*.9,size=.18+(i%5)*.11;
    let mesh;
    if(world.id==='micro'||world.id==='laboratory'||world.id==='alien') mesh=new THREE.Mesh(new THREE.TorusGeometry(size,.025,7,24),new THREE.MeshStandardMaterial({color:palette[i%3],emissive:palette[i%3],emissiveIntensity:.23,metalness:.35,roughness:.42}));
    else mesh=new THREE.Mesh(new THREE.DodecahedronGeometry(size,0),new THREE.MeshStandardMaterial({color:i%4?baseColor:palette[1],roughness:.49,metalness:.2}));
    mesh.position.set(Math.cos(angle)*r,size-.02,Math.sin(angle)*r);mesh.rotation.set(angle*.7,angle,.18);mesh.userData.pickable=true;root.add(mesh);if(i<30)pickables.push(mesh);
  }
}

function addAtmosphere(scene, root, palette, world, event, intensity) {
  const count=900, positions=new Float32Array(count*3), velocities=[];
  const water=/flood|water|rain|wind|hurricane/i.test(event), fire=/fire|heat|wildfire/i.test(event);
  for(let i=0;i<count;i++){positions[i*3]=(Math.random()-.5)*42;positions[i*3+1]=Math.random()*19+.2;positions[i*3+2]=(Math.random()-.5)*42;velocities.push((Math.random()-.5)*.018,fire?.018+Math.random()*.035:water?-.04-Math.random()*.08:(Math.random()-.5)*.012);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(positions,3));
  const points=new THREE.Points(geo,new THREE.PointsMaterial({color:fire?0xffa46d:water?0xa7d6db:palette[1],size:.035+intensity/4000,transparent:true,opacity:.52,depthWrite:false}));scene.add(points);
  const sun=new THREE.PointLight(fire?0xff7248:palette[1],fire?2.4:1.5,42);sun.position.set(-4,7,-3);scene.add(sun);
  return ()=>{const p=geo.attributes.position.array;for(let i=0;i<count;i++){p[i*3]+=velocities[i*2];p[i*3+1]+=velocities[i*2+1];if(p[i*3+1]>20)p[i*3+1]=.2;if(p[i*3+1]<.15)p[i*3+1]=19;}geo.attributes.position.needsUpdate=true;points.rotation.y+=water?.0005:.00015;};
}

export async function enterWorld(world, settings = {}, sessionPromise = null) {
  if(!navigator.xr) return false;
  let session;
  try {
    // requestSession is called from the user's click handler to retain WebXR activation.
    session=await (sessionPromise||navigator.xr.requestSession('immersive-vr',{optionalFeatures:['local-floor','bounded-floor','hand-tracking']}));
  } catch { return false; }

  const palette=world.palette.map(c=>new THREE.Color(c));
  let renderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});}catch(error){await session.end();throw error;}
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
  renderer.xr.enabled=true;renderer.xr.setReferenceSpaceType('local-floor');
  renderer.xr.setFoveation?.(.65);
  const canvas=renderer.domElement;canvas.className='xr-world-canvas';document.body.append(canvas);
  const environment=settings.environment||world.environment;
  const cold=/frozen|−\d|below zero/i.test(environment),warm=/3\d°C|4\d°C/i.test(environment);
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x07090b);scene.fog=new THREE.FogExp2(cold?0x101821:warm?0x21140f:0x090d0e,.019);
  const camera=new THREE.PerspectiveCamera(70,window.innerWidth/window.innerHeight,.08,160);
  camera.position.set(0,0,0);camera.lookAt(0,0,-1);
  const ambient=new THREE.HemisphereLight(0xd6e2d8,0x18201d,1.5);scene.add(ambient);
  const key=new THREE.DirectionalLight(cold?0xc9e1ff:warm?0xffbd85:0xffe9c1,2.2);key.position.set(-7,12,5);scene.add(key);
  const root=new THREE.Group();scene.add(root);const pickables=[];
  const baseColor=materialColors[settings.material]||materialColors['Mixed / realistic'];
  const webWorld=world.category==='Organic'&&(world.id==='silk'||settings.material==='Spider silk'||settings.material==='Mycelium + fiber');
  if(webWorld)web(world,root,palette,pickables);
  else if(world.category==='Laboratory'||world.category==='Experimental'||world.id==='bone'||world.id==='chitin')specimen(world,root,palette,baseColor,pickables);
  else city(world,root,palette,baseColor,scene,pickables);
  const label=makeLabel(world.name,world.palette[0]);label.position.set(0,3.2,-4.7);scene.add(label);
  const updateAtmosphere=addAtmosphere(scene,root,palette,world,settings.event||world.event,settings.intensity||58);
  const controllers=[];const raycaster=new THREE.Raycaster();raycaster.far=28;const floorPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0);const hitPoint=new THREE.Vector3();
  let scaleIndex=0,scaleFactor=1;const scaleLevels=[1,2.6,8,21];let stopped=false;
  const feedback=(message)=>{window.dispatchEvent(new CustomEvent('elsewhere-xr-message',{detail:message}));};
  function pulse(inputSource){try{inputSource?.gamepad?.hapticActuators?.[0]?.pulse(.35,45);}catch{}}
  for(let i=0;i<2;i++){
    const controller=renderer.xr.getController(i);scene.add(controller);controllers.push(controller);
    const beam=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,-7)]),new THREE.LineBasicMaterial({color:0xd9ebaa,transparent:true,opacity:.55}));controller.add(beam);
    controller.addEventListener('selectstart',()=>{
      if(controller.userData.grabbed){root.attach(controller.userData.grabbed);controller.userData.grabbed=null;feedback('Object released · its material state stays changed');pulse(controller.userData.inputSource);return;}
      raycaster.setFromXRController(controller);
      const hit=raycaster.intersectObjects(pickables,false)[0];
      if(hit){controller.attach(hit.object);controller.userData.grabbed=hit.object;feedback('Object grabbed · select again to release');pulse(controller.userData.inputSource);return;}
      const direction=new THREE.Vector3(0,0,-1).applyQuaternion(controller.quaternion),origin=controller.getWorldPosition(new THREE.Vector3());
      raycaster.set(origin,direction);if(raycaster.ray.intersectPlane(floorPlane,hitPoint)&&hitPoint.length()<31){
        const reference=renderer.xr.getReferenceSpace();const offset=reference.getOffsetReferenceSpace(new XRRigidTransform({x:-hitPoint.x,y:0,z:-hitPoint.z}));renderer.xr.setReferenceSpace(offset);feedback('Moved through the world');pulse(controller.userData.inputSource);
      }
    });
    controller.addEventListener('squeezestart',()=>{scaleIndex=(scaleIndex+1)%scaleLevels.length;scaleFactor=scaleLevels[scaleIndex];root.scale.setScalar(scaleFactor);feedback(['World scale','Building scale','Material scale','Fiber scale'][scaleIndex]);pulse(controller.userData.inputSource);});
  }
  await renderer.xr.setSession(session);
  for(let i=0;i<2;i++)controllers[i].userData.inputSource=session.inputSources[i];
  const clock=new THREE.Clock();let lastMove=0;
  renderer.setAnimationLoop(()=>{
    const delta=Math.min(clock.getDelta(),.05),elapsed=clock.elapsedTime;
    updateAtmosphere();
    label.position.y=3.2+Math.sin(elapsed*.38)*.06;label.quaternion.copy(renderer.xr.getCamera(camera).quaternion);
    const gamepad=Array.from(session.inputSources).find(input=>input.gamepad)?.gamepad;
    if(gamepad&&Math.abs(gamepad.axes[2]||0)+Math.abs(gamepad.axes[3]||0)>.25&&elapsed-lastMove>.045){
      const forward=gamepad.axes[3]||0,side=gamepad.axes[2]||0;const yaw=renderer.xr.getCamera(camera).rotation.y;
      const dx=(side*Math.cos(yaw)-forward*Math.sin(yaw))*delta*3, dz=(forward*Math.cos(yaw)+side*Math.sin(yaw))*delta*3;
      const space=renderer.xr.getReferenceSpace();renderer.xr.setReferenceSpace(space.getOffsetReferenceSpace(new XRRigidTransform({x:-dx,y:0,z:-dz})));lastMove=elapsed;
    }
    renderer.render(scene,camera);
  });
  function cleanup(){if(stopped)return;stopped=true;renderer.setAnimationLoop(null);canvas.remove();scene.traverse(object=>{object.geometry?.dispose();if(object.material){for(const m of (Array.isArray(object.material)?object.material:[object.material])){m.map?.dispose();m.dispose();}}});renderer.dispose();window.removeEventListener('resize',resize);window.dispatchEvent(new Event('elsewhere-xr-ended'));}
  function resize(){if(renderer.xr.isPresenting)return;camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();renderer.setSize(window.innerWidth,window.innerHeight);}
  window.addEventListener('resize',resize);session.addEventListener('end',cleanup,{once:true});
  return {session,stop:()=>session.end(),get scale(){return scaleFactor;}};
}
