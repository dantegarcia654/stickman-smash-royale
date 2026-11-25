import http from 'node:http';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import worker from '../dist/server/index.js';
const args=process.argv.slice(2),value=(name,fallback)=>{const i=args.indexOf(name);return i>=0?args[i+1]:fallback;};
const port=Number(value('--port',8000)),host=value('--host','127.0.0.1');
fs.mkdirSync('.local',{recursive:true});const sqlite=new DatabaseSync('.local/rooms.sqlite');
sqlite.exec('CREATE TABLE IF NOT EXISTS local_migrations (name TEXT PRIMARY KEY)');
for(const file of fs.readdirSync('drizzle').filter(n=>n.endsWith('.sql')).sort()){if(!sqlite.prepare('SELECT name FROM local_migrations WHERE name = ?').get(file)){sqlite.exec(fs.readFileSync('drizzle/'+file,'utf8'));sqlite.prepare('INSERT INTO local_migrations VALUES (?)').run(file);}}
const DB={
 prepare(sql){
  return {bind(...args){
   return {
    async first(){return sqlite.prepare(sql).get(...args)||null;},
    async run(){const r=sqlite.prepare(sql).run(...args);return {meta:{changes:Number(r.changes)}};}
   };
  }};
 }
};
const server=http.createServer(async(req,res)=>{try{const chunks=[];for await(const chunk of req){chunks.push(chunk);if(chunks.reduce((n,c)=>n+c.length,0)>12000){res.writeHead(413);res.end();return;}}const method=req.method;const request=new Request('http://'+req.headers.host+req.url,{method,headers:req.headers,...(['GET','HEAD'].includes(method)?{}:{body:Buffer.concat(chunks)})});const response=await worker.fetch(request,{DB});res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));}catch{res.writeHead(500);res.end('Server error');}});
server.listen(port,host,()=>console.log(`Stickman multiplayer server: http://${host}:${port} (use --host 0.0.0.0 for devices on your Wi-Fi)`));
