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
function solvable(level){
  const layers=layouts[level],stacks=layers[0].length,values=layers.flat(),full=(1<<(stacks*3))-1,memo=new Map();
  function dfs(gone,counts){
    if(gone===full)return true;
    const key=gone+'|'+counts.join(',');
    if(memo.has(key))return memo.get(key);
    const available=[];
    for(let s=0;s<stacks;s++){
      for(let layer=2;layer>=0;layer--){
        const id=layer*stacks+s;
        if(!(gone&(1<<id))){available.push(id);break;}
      }
    }
    for(const id of available){
      const v=values[id],next=counts.slice();
      next[v]++;
      if(next[v]>=3)next[v]-=3;
      const handSize=next.reduce((a,b)=>a+b,0);
      if(handSize<7&&dfs(gone|(1<<id),next)){memo.set(key,true);return true;}
    }
    memo.set(key,false);return false;
  }
  return dfs(0,Array(6).fill(0));
}
for(const level of [1,2,3])if(!solvable(level))throw new Error('QA failed: level '+level+' has no verified solution path');
console.log('All static QA checks passed, including solvability paths.');
