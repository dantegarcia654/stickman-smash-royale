import {mountPhoneShell,standaloneMode,playViewportHeight} from './dist/phone-shell.js';
import {CombatAudio} from './dist/combat-audio.js';
import {instructionsHTML} from './dist/instructions.js';
import {canSeeFighter,drawBlindness} from './dist/vision.js';
import {bindTouchControls} from './dist/touch-controls.js';
import {computeView,screenToWorld} from './dist/viewport.js';
import {unpackGame,packGame} from './dist/snapshot.js';
import {MAPS,getMap} from './dist/maps.js';
import {drawBackdrop,drawTerrain,drawWater} from './dist/maps-render.js';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {randomUUID} from 'node:crypto';
import {Game,FIGHTERS,PLATFORMS,ARMORS} from './dist/engine.js';
import {victoryTrophy} from './dist/trophy.js';
import {RewardInventory,FLOWER_KEY,flowerIcon,starIcon,ITEM_NAMES} from './dist/inventory.js';
const nodes=new Map(),classes=()=>({add(){},remove(){},toggle(){}});
const gradient={addColorStop(){}};
const ctx=new Proxy({},{get:(o,key)=>o[key]??(String(key).startsWith('create')?()=>gradient:()=>{}),set:(o,key,value)=>(o[key]=value,true)});
const node=id=>{if(!nodes.has(id))nodes.set(id,{id,style:{},classList:classes(),textContent:'',innerHTML:'',hidden:true,dataset:{},events:{},setAttribute(){},replaceChildren(){},addEventListener(t,fn){this.events[t]=fn;},getContext:()=>ctx});return nodes.get(id);};
const cards=FIGHTERS.map((_,i)=>({...node('card'+i),dataset:{choice:String(i)}}));
const actions=['left','right','jump','climb','swim','flower','special','activate','command','fire'].map(action=>({...node('action-'+action),dataset:{action}}));
const storageMap=new Map(),storage={getItem:k=>storageMap.get(k)||null,setItem:(k,v)=>storageMap.set(k,v)};
const document={createElement:tag=>({...node("created-"+Math.random()),tagName:tag}),getElementById:node,body:{classList:classes()},addEventListener(){},querySelector:s=>s==='.result'?node('result'):s.startsWith('[data-action=')?actions.find(n=>n.dataset.action===s.slice(13,-1)):node(s),querySelectorAll:s=>s==='.fighter-card'?cards:s==='[data-action]'?actions:[]};
let introOptions;
const appMath=Object.create(Math);appMath.random=()=>.99;
const sandbox={mountPhoneShell,standaloneMode,playViewportHeight,CombatAudio,instructionsHTML,Math:appMath,canSeeFighter,drawBlindness,bindTouchControls,computeView,screenToWorld,unpackGame,packGame,NetworkRoom:class {},mountMontage:opts=>{introOptions=opts;return {close(){}};},performance,MAPS,getMap,drawBackdrop,drawTerrain,drawWater,Game,FIGHTERS,PLATFORMS,ARMORS,victoryTrophy,RewardInventory,FLOWER_KEY,flowerIcon,starIcon,ITEM_NAMES,document,window:{localStorage:storage,events:{},addEventListener(t,fn){this.events[t]=fn;}},matchMedia:()=>({matches:false}),devicePixelRatio:1,innerWidth:1200,innerHeight:740,requestAnimationFrame(){},crypto:{randomUUID},console,assert};
const source=fs.readFileSync('dist/game.js','utf8').replace(/^import .*;\n/gm,'');
const run=vm.createContext(sandbox);vm.runInContext(source,run);
vm.runInContext(`
choice=9;start();assert.equal(game.player.baseType,9);assert.equal(game.fighters.length,5);
keys={KeyX:true};pressed={KeyZ:true};frame(100);assert.equal($('hud-name').textContent,'KAIDOG');assert(game.bullets.some(b=>b.atomic));assert.equal(game.beams.length,1);
game.player.lives=1;game.eliminate(game.player);keys={};pressed={};frame(200);assert(!game.over);assert($('ability').textContent.includes('SPECTATING')||$('ability').textContent.includes('WATCHING'));assert($('overlay').hidden);
const survivor=game.fighters[2];for(const f of game.fighters.filter(f=>f.alive&&f!==survivor)){f.lives=1;game.eliminate(f);}frame(300);assert(game.over);assert.equal(game.winnerId,survivor.id);assert(!$('winner-trophy').hidden);assert($('result-title').innerHTML.includes(FIGHTERS[survivor.baseType].name));assert.equal(flowerInventory.count,0);assert($('flower-award').hidden);
start();for(const f of game.fighters.slice(1)){f.lives=1;game.eliminate(f);}frame(400);assert(game.won);assert.equal(flowerInventory.count,1);assert(!$('flower-award').hidden);$('flower-save').onclick();assert.equal(flowerInventory.count,1);$('flower-next').onclick();start();assert(!game.player.fireFlower);assert.equal(flowerInventory.count,1);pressed={KeyR:true};frame(500);assert(game.player.fireFlower);assert.equal(game.player.flowerShots,5);assert.equal(flowerInventory.count,0);pointer.used=true;pointer.x=game.player.x-200;pointer.y=game.player.y-30;keys={KeyF:true};frame(900);assert.equal(game.player.flowerShots,4);assert(game.bullets.some(b=>b.mini&&b.vx<0));keys={};
for(const f of game.fighters.slice(1)){f.lives=1;game.eliminate(f);}frame(1000);assert.equal(lastAwardType,'star');assert.equal(flowerInventory.countOf('star'),1);$('flower-next').onclick();start();assert.equal(game.player.starTime,0);pressed={KeyR:true};frame(1100);assert(game.player.starTime>9.9);assert.equal(flowerInventory.countOf('star'),0);assert(game.player.starUsed);const hp=game.player.hp;game.hit(game.player,1000,0,0,1);assert.equal(game.player.hp,hp);keys={KeyF:true};frame(1500);assert(game.player.charge>0);keys={};
`,run);
vm.runInContext(`for(const m of MAPS){selectMap(m.id);start();assert.equal(game.map.id,m.id);frame(last+16);assert.equal($('map-current').textContent,m.name.toUpperCase());assert.equal(document.querySelector('[data-action=swim]').hidden,m.water===undefined);}selectMap('ocean');start();game.player.x=560;game.player.y=775;keys={KeyL:true};for(let i=0;i<15;i++)frame(last+16);assert(game.player.y<775);assert.equal(game.player.lives,5);`,run);
vm.runInContext(`
const remote=new Game(0,()=>.99,'city');remote.fighters[1].type=remote.fighters[1].baseType=9;
const roomState={code:'ABC234',phase:'waiting',mapId:'city',you:1,host:false,matchId:'network-app-check',players:[{id:0,type:0,name:'Host',connected:true},{id:1,type:9,name:'Guest',connected:true}],game:null,stock:{flower:0,star:0},spent:{flower:0,star:0}};
let sent=null;net={lastOk:performance.now(),input:{},capture(v){sent=v;},leave(){}};receiveRoom(roomState);assert(!$('room-panel').hidden);assert($('room-start').hidden);assert.equal($('room-code-display').textContent,'ABC234');
roomState.phase='playing';roomState.game=packGame(remote);receiveRoom(roomState);assert.equal(game.player.id,1);assert.equal(game.player.type,9);assert($('room-panel').hidden);keys={KeyX:true};pressed={};const bulletCount=game.bullets.length;frame(last+16);assert(sent.fire);assert.equal(game.bullets.length,bulletCount);assert.equal($('hud-name').textContent,'KAIDOG');
remote.over=true;remote.winnerId=1;remote.lastDefeated=0;for(const f of remote.fighters)if(f.id!==1){f.alive=false;f.lives=0;}roomState.phase='finished';roomState.game=packGame(remote);receiveRoom(roomState);assert(game.won);assert(!$('flower-award').hidden);assert.equal($('again').textContent,'RETURN TO LOBBY');const awards=flowerInventory.total;receiveRoom(roomState);assert.equal(flowerInventory.total,awards);leaveOnline();assert.equal(net,null);assert(!$('lobby').hidden);
`,run);
vm.runInContext(`choice=10;start();pressed={KeyZ:true};keys={};frame(last+16);assert(game.player.blindAura>5.9);choice=11;start();keys={KeyX:true};pressed={};frame(last+16);assert.equal($('hud-name').textContent,'IVORY');assert.equal(document.querySelector('[data-action=fire]').textContent,'PUNCH');assert(!game.bullets.some(b=>b.owner===0));`,run);
vm.runInContext(`
// Actual touch callbacks drive the same game input on a small phone viewport.
innerWidth=390;innerHeight=844;touch=true;choice=0;start();syncInputMode();$('move-stick').getBoundingClientRect=()=>({left:0,top:0,width:120,height:120});
const finger=(id,x=60,y=60)=>({pointerId:id,clientX:x,clientY:y,preventDefault(){}});
$('move-stick').onpointerdown(finger(31,110,60));document.querySelector('[data-action=fire]').onpointerdown(finger(32));document.querySelector('[data-action=jump]').onpointerdown(finger(33));frame(last+16);assert(game.player.vx>0);assert(game.player.vy<0);assert(game.bullets.some(b=>b.owner===0));assert(!$('touch').hidden);assert(view.clip.y>0);document.querySelector('[data-action=jump]').onpointerup(finger(33));assert(keys.KeyX);assert(touchAxes.x>0);document.querySelector('[data-action=fire]').onpointercancel(finger(32));$('move-stick').onlostpointercapture(finger(31));assert(!keys.KeyX);assert.equal(touchAxes.x,0);
// Touch Fire Flower aims toward a rival without requiring a mouse.
start();pointer.used=false;touchAimUntil=0;game.player.x=600;game.player.y=700;const enemy=game.fighters[1];enemy.x=650;enemy.y=620;game.fighters.slice(2).forEach(f=>{f.x=1200;f.y=700;});game.activateItem(game.player,'flower');document.querySelector('[data-action=flower]').onpointerdown(finger(34));frame(last+16);const shot=game.bullets.find(b=>b.owner===0&&b.mini);assert(shot);assert(shot.vy<0);assert.equal(game.player.flowerShots,4);touchController.reset();
// Joystick's vertical axis climbs instead of triggering an unwanted jump.
choice=3;start();game.player.x=700;game.player.y=700;game.vines=[{x:700,bottom:700,top:340,age:1,life:12,owner:0}];$('move-stick').onpointerdown(finger(35,60,0));frame(last+16);assert(game.player.climbing);assert(game.player.vy<0);assert.equal(game.player.jumps,0);touchController.reset();
// Keyboard remains usable, and changing input mode can hide the thumb controls.
$('input-mode').onclick();assert(!touch);assert($('touch').hidden);keys={KeyD:true};frame(last+16);assert(game.player.vx>0);keys={};
`,run);
vm.runInContext(`
touch=true;choice=0;start();syncInputMode();const tap=(id)=>({pointerId:id,pointerType:'touch',button:0,clientX:200,clientY:300,preventDefault(){}});canvas.events.pointerdown(tap(70));assert(pointer.down);window.events.pointerup(tap(71));assert(pointer.down);window.events.pointerup(tap(70));assert(!pointer.down);$('move-stick').onpointerdown(finger(72,110,60));document.querySelector('[data-action=fire]').onpointerdown(finger(73));window.events.orientationchange();assert(!keys.KeyX);assert.equal(touchAxes.x,0);assert.equal(Object.keys(pressed).length,0);
`,run);
vm.runInContext(`
touch=true;choice=0;start();pointer.used=false;pointer.down=false;touchAimUntil=0;game.player.x=600;game.player.y=700;game.player.blindTime=10;game.fighters.slice(1).forEach((f,i)=>{f.x=900+i*80;f.y=500;});keys={KeyX:true};frame(last+16);assert($('loot-status').innerHTML.includes('BLINDED'));assert.equal(($('radar').innerHTML.match(/<span/g)||[]).length,1);const blindShot=game.bullets.find(b=>b.owner===0);assert(blindShot);assert.equal(blindShot.vy,0);keys={};game.player.blindTime=0;updateHud();assert(!$('loot-status').innerHTML.includes('BLINDED'));
`,run);
vm.runInContext('game=null;',run);introOptions.onClose();vm.runInContext(`assert(helpOpen);assert(!$('help-panel').hidden);for(const f of FIGHTERS)assert($('help-content').innerHTML.includes(f.name));closeHelp();assert(!helpOpen);assert($('help-panel').hidden);`,run);
console.log('PASS: app integration checks cover Kaidog rendering and controls, spectator mode, bot-winner trophy, player-only award, and save/use flow. Browser visuals are not covered by this harness.');
