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
console.log('All static QA checks passed.');
