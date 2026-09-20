import fs from 'node:fs';import {execFileSync} from 'node:child_process';
const html=fs.readFileSync('index.html','utf8'),js=fs.readFileSync('game.js','utf8'),all=html+'\n'+js;
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
  ['gone-click-block',/pointer-events:none/]
];
for(const [n,re] of must)if(!re.test(all))throw new Error('QA failed: '+n);
if(/sdk\.crazygames|poki/i.test(all))throw new Error('QA failed: unexpected SDK residue');
if(/12\s*关|12\s*levels/i.test(fs.readFileSync('README.md','utf8')))throw new Error('QA failed: 12-level residue');
if(/state\.level===3\)state\.level=1/.test(js))throw new Error('QA failed: obsolete level-3 loop');
if(/normal play loops|正常播放.*循环/i.test(fs.readFileSync('README.md','utf8')))throw new Error('QA failed: stale README');

const layouts={
  1:[[0,0,0,1,1,2],[1,1,1,2,2,3],[2,2,2,3,3,4]],
  2:[[0,0,0,1,1,2,2,3],[1,1,1,2,2,3,3,4],[2,2,2,3,3,4,4,5]],
  3:[[0,0,0,1,1,1,2,2,3,3,4,4],[1,1,1,2,2,2,3,3,4,4,5,5],[2,2,2,3,3,3,4,4,5,5,0,0]]
};
const solutionPaths={
  1:[17,16,15,11,14,13,12,10,9,5,8,7,6,4,3,2,1,0],
  2:[23,22,21,15,20,19,14,18,17,16,13,12,11,6,10,9,8,7,5,2,1,0,4,3],
  3:[35,34,33,32,23,31,30,21,29,28,27,26,25,24,22,20,19,18,9,17,16,15,14,2,13,12,11,10,8,7,6,5,4,3,1,0]
};
const layouts={
  1:[[0,0,0,1,1,2],[1,1,1,2,2,3],[2,2,2,3,3,4]],
  2:[[0,0,0,1,1,2,2,3],[1,1,1,2,2,3,3,4],[2,2,2,3,3,4,4,5]],
  3:[[0,0,0,1,1,1,2,2,3,3,4,4],[1,1,1,2,2,2,3,3,4,4,5,5],[2,2,2,3,3,3,4,4,5,5,0,0]]
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
  return gone.size===values.length;
}
for(const level of [1,2,3])if(!verifySolution(level))throw new Error('QA failed: no verified solution path for level '+level);
console.log('All static QA checks passed, including verified solvability paths.');
