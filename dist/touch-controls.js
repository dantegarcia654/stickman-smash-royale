// Pointer ownership keeps movement and action fingers independent.
export function bindTouchControls({buttons,stick,nub,onKey,onMove}){
 const owners=new Map(),held=new Map();let stickPointer=null;
 const release=(id)=>{const key=owners.get(id);if(key){owners.delete(id);const ids=held.get(key);ids?.delete(id);if(!ids?.size){held.delete(key);onKey(key,false);}}};
 const mappings={left:'KeyA',right:'KeyD',jump:'Space',climb:'KeyW',down:'KeyS',swim:'KeyL',flower:'KeyF',special:'KeyZ',activate:'KeyR',command:'KeyQ',fire:'KeyX'};
 for(const button of buttons){const key=mappings[button.dataset.action];if(!key)continue;button.onpointerdown=e=>{if(button.disabled)return;e.preventDefault();if(owners.has(e.pointerId))return;button.setPointerCapture?.(e.pointerId);owners.set(e.pointerId,key);if(!held.has(key)){held.set(key,new Set());onKey(key,true);}held.get(key).add(e.pointerId);button.dataset.held='true';};button.onpointerup=button.onpointercancel=button.onlostpointercapture=e=>{release(e.pointerId);button.dataset.held=held.has(key)?'true':'false';};button.oncontextmenu=e=>e.preventDefault();}
 const move=e=>{const box=stick.getBoundingClientRect(),radius=Math.max(1,box.width*.34),dx=e.clientX-(box.left+box.width/2),dy=e.clientY-(box.top+box.height/2),distance=Math.hypot(dx,dy),factor=distance>radius?radius/distance:1,x=dx*factor/radius,y=dy*factor/radius;nub.style.transform=`translate(${x*radius}px,${y*radius}px)`;onMove(Math.abs(x)<.2?0:x,Math.abs(y)<.35?0:y);};
 stick.onpointerdown=e=>{e.preventDefault();if(stickPointer!==null)return;stickPointer=e.pointerId;stick.setPointerCapture?.(e.pointerId);move(e);};stick.onpointermove=e=>{if(e.pointerId===stickPointer){e.preventDefault();move(e);}};
 const releaseStick=e=>{if(e&&e.pointerId!==stickPointer)return;stickPointer=null;nub.style.transform='translate(0px,0px)';onMove(0,0);};
 stick.onpointerup=stick.onpointercancel=stick.onlostpointercapture=releaseStick;
 function reset(){for(const key of held.keys())onKey(key,false);held.clear();owners.clear();for(const b of buttons)b.dataset.held='false';releaseStick();}
 return {reset};
}
