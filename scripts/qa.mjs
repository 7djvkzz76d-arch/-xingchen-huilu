import fs from 'node:fs';import {execFileSync} from 'node:child_process';
const html=fs.readFileSync('index.html','utf8'),js=fs.readFileSync('game.js','utf8');
execFileSync(process.execPath,['--check','game.js']);
const must=[['viewport',/name="viewport"/],['level1',/1:\[/],['level2',/2:\[/],['level3',/3:\[/],['loop',/state\.level===3\)state\.level=1/],['three slots',/n>=3/],['seven slots',/length:7/],['no SDK',!/sdk\.crazygames|poki/i]];
for(const [n,re] of must)if(!re.test(html+js))throw new Error('QA failed: '+n);
if(/12\s*关|12\s*levels/i.test(html+js))throw new Error('QA failed: 12-level residue');
console.log('All static QA checks passed.');