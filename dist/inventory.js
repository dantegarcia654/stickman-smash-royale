export const FLOWER_KEY='stickman-smash-royale:fire-flowers:v1';
export const ITEM_NAMES={flower:'FIRE FLOWER',star:'SUPER STAR'};
const empty=()=>({version:2,flowers:0,stars:0,wins:0,claimed:[]});
const number=n=>Number.isSafeInteger(n)&&n>=0;
export class RewardInventory {
 constructor(storage){this.storage=storage;this.persisted=!!storage;this.state=empty();this.reload();}
 reload(){if(!this.storage)return this.state;try{const raw=JSON.parse(this.storage.getItem(FLOWER_KEY)||'null');if(!raw){this.state=empty();return this.state;}const claimed=Array.isArray(raw.claimed)?raw.claimed.map(c=>typeof c==='string'?{id:c,type:'flower'}:c).filter(c=>c&&typeof c.id==='string'&&['flower','star'].includes(c.type)).slice(-128):[];if(raw.version===2&&number(raw.flowers)&&number(raw.stars)&&number(raw.wins))this.state={version:2,flowers:raw.flowers,stars:raw.stars,wins:raw.wins,claimed};else if(number(raw.count)&&Array.isArray(raw.claimed))this.state={version:2,flowers:raw.count,stars:0,wins:claimed.length,claimed};else this.state=empty();}catch{this.storage=null;this.persisted=false;}return this.state;}
 get count(){return this.state.flowers;}
 get total(){return this.state.flowers+this.state.stars;}
 get nextReward(){return this.state.wins%2===0?'flower':'star';}
 countOf(type){return type==='star'?this.state.stars:type==='flower'?this.state.flowers:0;}
 awardType(id){return this.state.claimed.find(c=>c.id===id)?.type||null;}
 save(){try{if(!this.storage)throw new Error('Session storage only');this.storage.setItem(FLOWER_KEY,JSON.stringify(this.state));this.persisted=true;}catch{this.storage=null;this.persisted=false;}}
 award(id,firstPlace){this.reload();if(!firstPlace||!id||this.awardType(id))return false;const type=this.nextReward;this.state[type==='star'?'stars':'flowers']++;this.state.wins++;this.state.claimed=[...this.state.claimed,{id,type}].slice(-128);this.save();return type;}
 spend(type='flower'){this.reload();if(this.countOf(type)<1)return false;this.state[type==='star'?'stars':'flowers']--;this.save();return true;}
}
export {RewardInventory as FlowerInventory};
export const flowerIcon=`<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 39v21M32 53Q9 52 12 40q17-2 20 13M32 54q22-1 20-13-17-2-20 13" fill="#72d570" stroke="#2d9b5b" stroke-width="3"/><path d="M32 5q12-9 17 5 16 0 13 14 6 15-9 20-4 11-17 4-12 7-19-4Q1 43 4 28-2 14 12 10 17-4 32 5z" fill="#ff7945" stroke="#ffc65c" stroke-width="3"/><ellipse cx="32" cy="25" rx="17" ry="13" fill="#fff3c4"/><path d="M26 21v7m12-7v7" stroke="#263347" stroke-width="4" stroke-linecap="round"/></svg>`;

export const starIcon=`<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 3l9 18 20 3-14 15 3 21-18-10-18 10 3-21L3 24l20-3z" fill="#ffe45b" stroke="#ffb846" stroke-width="3"/><path d="M26 27v9m12-9v9" stroke="#263347" stroke-width="4" stroke-linecap="round"/></svg>`;
