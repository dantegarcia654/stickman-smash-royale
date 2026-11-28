import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import {roomRoute} from './server/rooms.js';
import {Game} from './dist/engine.js';
import {packGame,unpackGame} from './dist/snapshot.js';
import {mountMontage} from './dist/montage.js';
const db=new DatabaseSync(':memory:');db.exec(fs.readFileSync('drizzle/0000_multiplayer_rooms.sql','utf8'));
const DB={
 prepare(sql){
  return {bind(...values){
   return {
    async first(){return db.prepare(sql).get(...values)||null;},
    async run(){const r=db.prepare(sql).run(...values);return {meta:{changes:Number(r.changes)}};}
   };
  }};
 }
};
let now=100000;const api=async(action,body)=>{const r=await roomRoute(new Request('https://test.local/api/rooms/'+action,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)}),{DB},()=>now);return {status:r.status,data:await r.json()};};
const create=async(type=0,stock={flower:1,star:2})=>{const r=await api('create',{name:'Host',type,mapId:'ocean',stock});assert.equal(r.status,201);return r.data;};
const auth=p=>({code:p.code,token:p.token});const sync=async(p,input={},seq=1)=>{now+=100;const r=await api('sync',{...auth(p),seq,input});assert.equal(r.status,200,JSON.stringify(r.data));return r.data;};
const edit=(code,fn)=>{const r=db.prepare('SELECT data FROM rooms WHERE code=?').get(code),room=JSON.parse(r.data);fn(room);db.prepare('UPDATE rooms SET data=? WHERE code=?').run(JSON.stringify(room),code);};
const host=await create();assert.equal(host.you,0);assert.equal(host.game,null);assert(!JSON.stringify(host.players).includes('key'));
assert.equal((await api('start',auth(host))).status,409);
assert.equal((await api('join',{code:host.code,type:0})).status,409);
const guest=(await api('join',{code:host.code,type:4,name:'Guest',stock:{flower:1,star:2}})).data;assert.equal(guest.you,1);
assert.equal((await api('start',auth(guest))).status,403);
assert.equal((await api('sync',{code:host.code,token:'not-a-session'})).status,401);
assert.equal((await api('start',auth(host))).data.phase,'playing');
assert.equal((await api('join',{code:host.code,type:3})).status,409);
let state=await sync(guest,{move:1,jump:true},1);const g=unpackGame(state.game,()=>.99,1);assert.equal(g.player.id,1);assert(g.player.vx>0);assert(g.player.vy<0);assert.equal(g.fighters[0].vx,0);assert.equal(g.fighters.length,5);assert.equal(new Set(g.fighters.map(f=>f.baseType)).size,5);assert(g.fighters.every(f=>f.lives===5));
state=await sync(guest,{move:0,special:true,aim:0},2);assert.equal(state.game.portals.length,2);
const before=state.game.fighters[1].cool;state=await sync(host,{},1);assert(state.game.fighters[1].cool<before);assert.equal(state.game.portals.length,2);
state=await sync(guest,{activate:'star'},3);assert.equal(state.spent.star,1);assert.equal(state.stock.star,1);assert(state.game.fighters[1].starTime>9);
state=await sync(guest,{activate:'star'},3);assert.equal(state.spent.star,1);
edit(host.code,room=>{for(const f of room.game.fighters){f.stun=100;f.x=700;f.y=510;}room.game.fighters[1].starTime=0;});
state=await sync(guest,{activate:'star'},4);assert.equal(state.spent.star,1);assert.equal(state.game.fighters[1].starTime,0);
state=await sync(guest,{activate:'flower'},5);assert.equal(state.spent.flower,1);assert.equal(state.game.fighters[1].flowerShots,5);
edit(host.code,room=>{room.game.fighters[1].stun=0;});
for(let i=0;i<20;i++)state=await sync(guest,{flower:true,itemAim:0},6+i);assert.equal(state.game.fighters[1].flowerShots,0);
// Another connected client sees the same lives and game clock, and winner is relative to the viewer.
state=await sync(host,{},2);assert.equal(state.game.fighters[1].flowerShots,0);assert.equal(state.you,0);
edit(host.code,room=>{for(const f of room.game.fighters)if(f.id!==1){f.lives=1;f.y=950;f.starTime=0;f.stun=100;}});
// Ocean clamps sinking fighters; use zero health plus the storm to force their final elimination.
edit(host.code,room=>{for(const f of room.game.fighters)if(f.id!==1){f.x=-100;f.hp=.01;}});
state=await sync(guest,{},27);assert.equal(state.phase,'finished');assert.equal(state.game.winnerId,1);assert(unpackGame(state.game,()=>.99,1).playerIsChampion);assert(!unpackGame(state.game,()=>.99,0).playerIsChampion);
const crowded=await create(9);const racers=await Promise.all([api('join',{code:crowded.code,type:1}),api('join',{code:crowded.code,type:1})]);assert.deepEqual(racers.map(x=>x.status).sort(),[200,409]);for(const type of [2,3,4])assert.equal((await api('join',{code:crowded.code,type})).status,200);assert.equal((await api('join',{code:crowded.code,type:5})).status,409);assert.equal((await sync(crowded)).players.length,5);
const leaving=await create();await api('leave',auth(leaving));assert.equal((await api('join',{code:leaving.code,type:1})).status,409);
const expired=await create();now+=30*60*1000+1;assert.equal((await api('sync',auth(expired))).status,404);
const disconnected=await create();await api('join',{code:disconnected.code,type:1});await api('start',auth(disconnected));now+=7000;state=await sync(disconnected,{},1);assert.equal(state.players[1].connected,false);assert.equal(state.game.fighters[1].human,false);
const shade=await create(10);const ivory=(await api('join',{code:shade.code,type:11,name:'Ivory'})).data;await api('start',auth(shade));edit(shade.code,room=>{room.game.fighters[0].x=600;room.game.fighters[0].y=700;room.game.fighters[1].x=720;room.game.fighters[1].y=700;room.game.fighters.slice(2).forEach(f=>{f.x=1200;f.stun=100;});});state=await sync(shade,{special:true},1);assert(state.game.fighters[0].blindAura>5.8);assert.equal(state.game.fighters[0].blindTime,0);assert(state.game.fighters[1].blindTime>4.8&&state.game.fighters[1].blindTime<=5);assert.equal(unpackGame(state.game,()=>.99,0).player.blindTime,0);assert(unpackGame(state.game,()=>.99,1).player.blindTime>4.8);state=await sync(ivory,{fire:true},1);assert(state.game.fighters[1].charge>0);assert(!state.game.bullets.some(b=>b.owner===1));assert.equal(state.game.fighters[1].type,11);
const titan=await create(12);await api('join',{code:titan.code,type:0,name:'Titan Rival'});await api('start',auth(titan));edit(titan.code,room=>{room.game.fighters[0].x=600;room.game.fighters[0].y=700;room.game.fighters[1].x=700;room.game.fighters[1].y=700;room.game.fighters.slice(2).forEach(f=>{f.x=1300;f.stun=100;});});state=await sync(titan,{fire:true,special:true,aim:0},1);assert.equal(state.game.fighters[0].type,12);assert.equal(state.game.fighters.length,5);assert(state.game.beams.length);assert(state.game.fx.some(f=>f.shockwave));assert(state.game.fighters[1].hp<100);assert(state.game.fighters[0].cool>4.8);
const snapshotGame=new Game(5,()=>.99);snapshotGame.shoot(snapshotGame.player,0);snapshotGame.player.slashHits.add(1);const restored=unpackGame(JSON.parse(JSON.stringify(packGame(snapshotGame))),()=>.99,0);assert(restored.player.slashHits instanceof Set);assert(restored.player.slashHits.has(1));assert(restored.player.touching instanceof Set);restored.update(.01,{fire:true});
// Intro auto-completes, skips with Space without triggering game input, and replays.
let handlers=[],rafs=new Map(),id=0;globalThis.window={addEventListener:(type,fn,capture)=>handlers.push({type,fn,capture})};globalThis.requestAnimationFrame=fn=>{rafs.set(++id,fn);return id;};globalThis.cancelAnimationFrame=i=>rafs.delete(i);
const bits=new Map(),root={hidden:true,dataset:{},style:{setProperty(){}},querySelector(sel){if(!bits.has(sel))bits.set(sel,{});return bits.get(sel);}},button={},replay={};let closed=0;
const montage=mountMontage({root,button,replay,sprite:i=>'<svg>'+i+'</svg>',onClose:()=>closed++});assert(montage.active);let stopped=0,prevented=0;handlers[0].fn({code:'Space',preventDefault:()=>prevented++,stopImmediatePropagation:()=>stopped++});assert.equal(closed,1);assert.equal(stopped,1);assert.equal(prevented,1);assert(!montage.active);replay.onclick();assert(montage.active);button.onclick();assert.equal(closed,2);replay.onclick();[...rafs.values()].at(-1)(performance.now()+23000);assert(!montage.active);assert.equal(closed,3);
const quiet=mountMontage({root,button,replay,sprite:()=>'',reduced:true});assert(!quiet.active);
console.log('PASS: multiplayer rooms, five-player capacity, concurrent joins, authentication, human input isolation, authoritative snapshots, powers, item limits, remote winner, expiry/disconnection fallback, and skippable montage.');
