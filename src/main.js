import './style.css';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

const canvas = document.querySelector('#garden');
const ctx = canvas.getContext('2d');
const video = document.querySelector('#camera');
const statusText = document.querySelector('#statusText');
const statusDot = document.querySelector('.status');
const intro = document.querySelector('#intro');
const hint = document.querySelector('#hint');
const stats = document.querySelector('#stats');
const permission = document.querySelector('#permission');
const cameraFrame = document.querySelector('#cameraFrame');
let w=0,h=0,dpr=1,started=false,camOn=false,handLandmarker=null,lastVideoTime=-1,lastSeen=0;
let pointer={x:.5,y:.65,active:false,still:0,lastX:.5,lastY:.65};
let flowers=[],particles=[],stars=[],lastTime=0,elapsed=0,bloomCount=0,audioCtx=null,soundOn=false;
const palette=['#f8b8d9','#b9a7ff','#8ce5ef','#ffd4a1','#e8a7ff','#a9f4d0'];
function resize(){dpr=Math.min(devicePixelRatio||1,2);w=innerWidth;h=innerHeight;canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);seedGarden();}
function rand(a,b){return a+Math.random()*(b-a)}
function seedGarden(){flowers=[];stars=[];for(let i=0;i<Math.max(35,Math.floor(w/20));i++){flowers.push({x:rand(0,w),baseY:rand(h*.72,h*1.03),height:rand(35,h*.25),size:rand(5,17),phase:rand(0,Math.PI*2),color:palette[Math.floor(Math.random()*palette.length)],growth:rand(.1,.55),target:.25,age:rand(0,10),petals:Math.floor(rand(5,9)),sway:rand(.4,1.4)});}for(let i=0;i<130;i++)stars.push({x:rand(0,w),y:rand(0,h),r:rand(.3,1.5),a:rand(.15,.7),p:rand(0,7)});}
function setStatus(text,awake=false){statusText.textContent=text;statusDot.classList.toggle('awake',awake)}
function activate(){started=true;intro.classList.add('hidden');hint.textContent=camOn?'Raise your hand to shape the garden · Hold still to deepen the bloom':'Move your mouse or touch to awaken flowers · Hold still to help them bloom';setStatus('Garden listening',true)}
function spawnParticles(x,y,n=5,color){for(let i=0;i<n;i++)particles.push({x,y,vx:rand(-.7,.7),vy:rand(-1.8,-.2),life:rand(.7,1.8),max:1.8,r:rand(1,3),color:color||palette[Math.floor(Math.random()*palette.length)]});}
function drawFlower(f,dt){f.age+=dt;const sway=Math.sin(elapsed*f.sway+f.phase)*12;const x=f.x+sway,y=f.baseY-f.height*f.growth;const bloom=f.growth;ctx.save();ctx.lineCap='round';ctx.strokeStyle=f.color+'99';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(f.x,f.baseY);ctx.quadraticCurveTo(f.x+sway*.6,f.baseY-f.height*.45,x,y);ctx.stroke();if(bloom>.12){ctx.translate(x,y);ctx.rotate(Math.sin(elapsed*.5+f.phase)*.12);const petals=f.petals;for(let p=0;p<petals;p++){ctx.rotate(Math.PI*2/petals);ctx.globalAlpha=.25+.6*bloom;ctx.fillStyle=f.color;ctx.shadowColor=f.color;ctx.shadowBlur=12*bloom;ctx.beginPath();ctx.ellipse(0,-f.size*.72*bloom,f.size*.42*bloom,f.size*.8*bloom,0,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;ctx.shadowBlur=18*bloom;ctx.fillStyle='#fff4d9';ctx.beginPath();ctx.arc(0,0,Math.max(1,f.size*.18*bloom),0,Math.PI*2);ctx.fill();}ctx.restore();return{x,y};}
function draw(t){const dt=Math.min((t-lastTime)/1000||0,.04);lastTime=t;elapsed+=dt;ctx.clearRect(0,0,w,h);const bg=ctx.createRadialGradient(w*.5,h*.75,0,w*.5,h*.75,Math.max(w,h)*.8);bg.addColorStop(0,'#20213d');bg.addColorStop(.55,'#10152b');bg.addColorStop(1,'#080b18');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
for(const s of stars){ctx.globalAlpha=s.a*(.65+.35*Math.sin(elapsed+s.p));ctx.fillStyle='#d8d8ff';ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
const px=pointer.x*w,py=pointer.y*h;let still=pointer.still;for(const f of flowers){const dx=f.x-px,dy=(f.baseY-f.height*.5)-py,dist=Math.hypot(dx,dy);f.target=.18+(pointer.active?Math.max(0,1-dist/Math.min(w*.42,h*.55))*.75:0)+Math.min(still/4,.35);f.target=Math.min(1,f.target);f.growth+=(f.target-f.growth)*(1-Math.exp(-dt*1.5));const pos=drawFlower(f,dt);if(pointer.active&&dist<55&&Math.random()<dt*1.5)spawnParticles(pos.x,pos.y,1,f.color);}
for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.life-=dt;p.x+=p.vx*60*dt;p.y+=p.vy*60*dt;p.vy+=.15*dt*60;ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=10;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();if(p.life<=0)particles.splice(i,1);}ctx.globalAlpha=1;ctx.shadowBlur=0;
const grown=flowers.filter(f=>f.growth>.72).length;stats.textContent=`${grown} blooms · ${Math.round(pointer.active?100:0)}% presence`;requestAnimationFrame(draw);}
function movePointer(x,y){const dx=x-pointer.lastX,dy=y-pointer.lastY;const speed=Math.hypot(dx,dy);pointer.still=speed<.003?pointer.still+.05:0;pointer.lastX=pointer.x;pointer.lastY=pointer.y;pointer.x=x;pointer.y=y;pointer.active=true;lastSeen=performance.now();if(!started)activate();}
canvas.addEventListener('pointermove',e=>{movePointer(e.clientX/w,e.clientY/h)});canvas.addEventListener('pointerdown',e=>{movePointer(e.clientX/w,e.clientY/h);spawnParticles(e.clientX,e.clientY,24)});canvas.addEventListener('pointerleave',()=>{if(!camOn){pointer.active=false;setStatus('Garden resting')}});
document.querySelector('#startBtn').addEventListener('click',activate);
document.querySelector('#resetBtn').addEventListener('click',()=>{pointer.active=false;pointer.still=0;particles=[];seedGarden();setStatus('Garden resting');intro.classList.remove('hidden');started=false;});
document.querySelector('#soundBtn').addEventListener('click',async e=>{soundOn=!soundOn;e.currentTarget.textContent=`Sound: ${soundOn?'on':'off'}`;e.currentTarget.classList.toggle('active',soundOn);e.currentTarget.setAttribute('aria-pressed',String(soundOn));if(soundOn){audioCtx ||= new AudioContext();await audioCtx.resume();} });
async function enableCamera(){try{permission.textContent='Requesting camera permission…';const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'},audio:false});video.srcObject=stream;await video.play();camOn=true;cameraFrame.classList.add('visible');cameraFrame.appendChild(video);document.querySelector('#cameraBtn').textContent='Camera enabled';document.querySelector('#cameraBtn').classList.add('active');permission.textContent='';const vision=await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm');handLandmarker=await HandLandmarker.createFromOptions(vision,{baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',delegate:'GPU'},runningMode:'VIDEO',numHands:2});hint.textContent='Move your hand in view of the camera to grow flowers';setStatus('Camera active',true);cameraLoop();}catch(err){permission.textContent=`Camera unavailable: ${err.message}. You can still interact with mouse or touch.`;}}
function cameraLoop(){if(!camOn)return;if(video.currentTime!==lastVideoTime&&handLandmarker){lastVideoTime=video.currentTime;const result=handLandmarker.detectForVideo(video,performance.now());if(result.landmarks?.length){const lm=result.landmarks[0][8];movePointer(1-lm.x,lm.y);setStatus('Presence detected',true);}else if(performance.now()-lastSeen>1800){pointer.active=false;setStatus('Garden resting');}}requestAnimationFrame(cameraLoop);}
document.querySelector('#cameraBtn').addEventListener('click',enableCamera);
window.addEventListener('resize',resize);resize();requestAnimationFrame(draw);
