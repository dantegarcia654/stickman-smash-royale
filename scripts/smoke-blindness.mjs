import assert from 'node:assert/strict';
const base=process.argv[2]||'http://127.0.0.1:8000',players=[],seq=[0,0,0,0,0];
const post=async(action,data)=>{const response=await fetch(base+'/api/rooms/'+action,{method:'POST',headers:{'content-type':'application/json',origin:base},body:JSON.stringify(data),signal:AbortSignal.timeout(15000)});const state=await response.json();assert(response.ok,action+': '+(state.error||response.status));return state;};
const auth=p=>({code:p.code,token:p.token});
const sync=(id,input={})=>post('sync',{...auth(players[id]),seq:++seq[id],input});
try{
 players.push(await post('create',{name:'QA Shade',type:10,mapId:'classic',stock:{}}));
 for(const [i,type] of [11,0,1,2].entries())players.push(await post('join',{code:players[0].code,name:'QA Sight '+i,type,stock:{}}));
 let state=await post('start',auth(players[0]));
 for(let step=0;step<30&&Math.hypot(state.game.fighters[1].x-state.game.fighters[0].x,state.game.fighters[1].y-state.game.fighters[0].y)>190;step++){
  const dx=state.game.fighters[0].x-state.game.fighters[1].x;await sync(1,{move:Math.sign(dx)});for(const id of [2,3,4])await sync(id);state=await sync(0);await new Promise(r=>setTimeout(r,90));
 }
 await sync(1);await new Promise(r=>setTimeout(r,100));state=await sync(0,{special:true});assert(state.game.fighters[0].blindAura>0);assert.equal(state.game.fighters[0].blindTime,0);assert(state.game.fighters[1].blindTime>0,'nearby guest is blinded');assert.equal(state.game.fighters[4].blindTime,0,'far guest keeps sight');
 const guest=await sync(1);assert.equal(guest.you,1);assert(guest.game.fighters[guest.you].blindTime>0);const caster=await sync(0);assert.equal(caster.you,0);assert.equal(caster.game.fighters[caster.you].blindTime,0);
 console.log('PASS: live five-session room; nearby guest receives per-player blindness, Shade and distant guest keep sight, and each device receives the correct viewer ID.');
}finally{for(const p of players)await post('leave',auth(p)).catch(()=>{});}
