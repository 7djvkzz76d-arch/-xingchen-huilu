import fs from 'node:fs';import {execFileSync} from 'node:child_process';
const html=fs.readFileSync('index.html','utf8'),js=fs.readFileSync('game.js','utf8'),manifest=fs.readFileSync('manifest.webmanifest','utf8'),all=html+'\n'+js+'\n'+manifest;
execFileSync(process.execPath,['--check','game.js']);
const must=[
  ['viewport',/name="viewport"/],
  ['level1',/1:\{stacks:6/],
  ['level2',/2:\{stacks:8/],
  ['level3',/3:\{stacks:12/],
  ['three-match',/length>=3/],
  ['seven-slots',/length:7/],
  ['layer-availability',/isAvailable\(tile\)/],
  ['locked-state',/classList\.toggle\('locked'/],
  ['terminal-level3',/state\.level===3/],
  ['finish-message',/通关成功/],
  ['gone-click-block',/pointer-events:none/],
  ['manifest',/manifest\.webmanifest/],
  ['accessible-actions',/aria-label="撤回上一步"/],
  ['share-action',/id="share"/],
  ['share-handler',/function shareResult\(\)/]
];
for(const [n,re] of must)if(!re.test(all))throw new Error('QA failed: '+n);
if(!/<svg\s+xmlns=/.test(fs.readFileSync('icon.svg','utf8')))throw new Error('QA failed: icon');
if(/sdk\.crazygames|poki/i.test(all))throw new Error('QA failed: unexpected SDK residue');
if(/12\s*关|12\s*levels/i.test(fs.readFileSync('README.md','utf8')))throw new Error('QA failed: 12-level residue');
if(/state\.level===3\)state\.level=1/.test(js))throw new Error('QA failed: obsolete level-3 loop');
if(/normal play loops|正常播放.*循环/i.test(fs.readFileSync('README.md','utf8')))throw new Error('QA failed: stale README');

const layouts={
  1:[[5,5,5,4,4,3],[4,3,3,2,2,1],[2,1,1,0,0,0]],
  2:[[1,0,0,1,1,0,4,5],[5,5,4,4,3,3,2,1],[3,2,2,1,1,0,0,0]],
  3:[[5,5,1,5,4,4,4,3,3,0,3,2],[2,2,1,1,0,0,5,5,5,2,4,1],[4,4,3,3,3,2,2,1,1,0,0,0]]
};
const solutionPaths={
  1:[12,6,0,13,14,17,11,5,7,8,1,2,15,9,3,16,10,4],
  2:[16,8,0,17,9,19,20,1,21,22,11,12,13,3,14,18,4,6,10,2,5,23,15,7],
  3:[24,12,0,25,13,1,29,17,5,26,14,2,31,19,7,27,15,3,28,16,4,33,32,35,23,11,21,30,9,18,20,6,8,34,22,10]
};

function verifySolution(level){
  const layers=layouts[level],stacks=layers[0].length,values=layers.flat(),path=solutionPaths[level];
  const gone=new Set(),counts=Array(6).fill(0);
  for(const id of path){
    if(gone.has(id))return false;
    const stack=id%stacks,layer=Math.floor(id/stacks);
    for(let higher=layer+1;higher<3;higher++){
      if(!gone.has(higher*stacks+stack))return false;
    }
    gone.add(id);
    const v=values[id];
    counts[v]++;
    if(counts[v]===3)counts[v]=0;
    if(counts.reduce((a,b)=>a+b,0)>=7)return false;
  }
  return gone.size===values.length && counts.every(n=>n===0);
}
for(const level of [1,2,3])if(!verifySolution(level))throw new Error('QA failed: no verified solution path for level '+level);
console.log('All static QA checks passed, including verified solvability paths.');
