import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const modules=['dist/maps.js','dist/engine.js','dist/snapshot.js','server/rooms.js'];
const strip=s=>s.replace(/^import .*;\n/gm,'').replace(/export (const|class|function|async function)/g,'$1');
const assets=Object.fromEntries(fs.readdirSync('dist').filter(n=>/\.(html|css|js)$/.test(n)).map(n=>['/'+n,{type:n.endsWith('.html')?'text/html; charset=utf-8':n.endsWith('.css')?'text/css; charset=utf-8':'application/javascript; charset=utf-8',content:read('dist/'+n)}]));
for(const name of fs.readdirSync('dist/audio'))if(name.endsWith('.wav'))assets['/audio/'+name]={type:'audio/wav',encoding:'base64',content:fs.readFileSync('dist/audio/'+name).toString('base64')};
fs.mkdirSync('dist/server',{recursive:true});fs.writeFileSync('dist/server/index.js',modules.map(p=>strip(read(p))).join('\n')+'\nconst STATIC_ASSETS='+JSON.stringify(assets)+';\n'+read('server/worker.js').replace(/^import .*;\n/gm,''));console.log('Built multiplayer Worker with '+Object.keys(assets).length+' client assets.');
