'use strict';
const ICONS=['✦','◆','●','▲','☾','✿','⬢','★'];
const LEVELS={1:[0,0,0,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5],2:[0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5],3:[0,0,0,0,0,0,1,1,1,1,1,1,2,2,2,2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,5,5,5,5,5,5]};
const state={level:+localStorage.xhLevel||1,hand:[],gone:new Set(),history:[],score:0};
const $=s=>document.querySelector(s);
function save(){localStorage.xhLevel=state.level}
function render(){$('#score').textContent=state.score;$('#slots').replaceChildren(...Array.from({length:7},(_,i)=>{const s=document.createElement('span');s.textContent=state.hand[i]==null?'':ICONS[state.hand[i]];return s}))}
function build(){state.hand=[];state.gone=new Set();state.history=[];$('#field').replaceChildren();const seq=[...LEVELS[state.level]].sort(()=>Math.random()-.5);seq.forEach((v,i)=>{const b=document.createElement('button');b.className='tile';b.textContent=ICONS[v];b.dataset.v=v;b.dataset.id=i;b.onclick=()=>pick(b);b.style.setProperty('--x',(8+(i%6)*16)+'%');b.style.setProperty('--y',(8+Math.floor(i/6)*23)+'%');$('#field').append(b)});$('#level').textContent=state.level;$('#diff').textContent=['','入门','深思','☄️ 1% 极限'][state.level];render()}
function syncTiles(){document.querySelectorAll('.tile').forEach(b=>b.classList.toggle('gone',state.gone.has(+b.dataset.id)))}
function pick(b){const id=+b.dataset.id;if(state.gone.has(id))return;state.history.push({hand:[...state.hand],gone:[...state.gone]});state.hand.push(+b.dataset.v);state.gone.add(id);for(const v of new Set(state.hand))if(state.hand.filter(x=>x===v).length>=3){state.hand=state.hand.filter(x=>x!==v);state.score+=30}syncTiles();if(state.hand.length>=7){$('#msg').textContent='能量槽满了，重新来一局';$('#modal').showModal();render();return}if(state.gone.size===LEVELS[state.level].length){state.level=state.level===3?1:state.level+1;save();$('#msg').textContent='回路完成 ✦ 下一关';$('#modal').showModal()}render()}
$('#undo').onclick=()=>{const h=state.history.pop();if(!h)return;state.hand=h.hand;state.gone=new Set(h.gone);syncTiles();render()};
$('#restart').onclick=()=>{build();$('#modal').close()};$('#close').onclick=()=>$('#modal').close();build();
