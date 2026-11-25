const clamp=(n,a,b)=>a>b?(a+b)/2:Math.max(a,Math.min(b,n));
export function computeView({width,height,touch=false,playing=false,player={x:700,y:535}}){
 width=Math.max(1,width);height=Math.max(1,height);
 if(!touch||!playing){const scale=Math.min(width/1400,height/850);return {scale,ox:(width-1400*scale)/2,oy:(height-850*scale)/2,clip:{x:0,y:0,w:width,h:height}};}
 const portrait=height>width,top=portrait?118:64,bottom=portrait?220:width>=700&&height>=650?194:154,space=Math.max(80,height-top-bottom),scale=Math.max(.1,portrait&&width<700?width/760:Math.min(width/(portrait?760:1400),space/(portrait?850:400))),visibleW=width/scale,visibleH=space/scale;
 const cx=visibleW>=1400?700:clamp(player.x,visibleW/2,1400-visibleW/2),cy=visibleH>=850?425:clamp(player.y-100,visibleH/2,850-visibleH/2);
 return {scale,ox:width/2-cx*scale,oy:top+space/2-cy*scale,clip:{x:0,y:top,w:width,h:space}};
}
export function screenToWorld(x,y,view){return {x:(x-view.ox)/view.scale,y:(y-view.oy)/view.scale};}
