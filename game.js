'use strict';
const ICONS=['✦','◆','●','▲','☾','✿','⬢','★'];
const LEVELS={
1:[0,0,0,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5],
2:[0,1,2,3,4,0,1,2,3,4,0,1,2,3,4,0,1,2,3,4,5,5,5],
3:[0,1,2,3,4,5,1,2,3,4,5,0,2,3,4,5,0,1,3,4,5,0,1,2,4,5,0,1,2,3,5,0,1,2,3,4]
};
const state={level:+localStorage.xhLevel||1,hand:[],removed:0,history:[],score:0};
const $=s=>document.querySelector(s);
function save(){localStorage.xhLevel=state.level}
function build(){
 state.hand=[];state.removed=0;state.history=[];$('#field').replaceChildren();
 const seq=[...LEVELS[state.level]];seq.sort(()=>Math.random()-.5);
 seq.forEach((v,i)=>{const b=document.createElement('button');b.className='tile';b.textContent=ICONS[v];b.dataset.v=v;b.onclick=()=>pick(b);b.style.setProperty('--x',(8+(i%6)*16)+'%');b.style.setProperty('--y',(8+Math.floor(i/6)*23)+'%');$('#field').append(b)});
 render();$('#level').textContent=state.level;$('#diff').textContent=['','入门','深思','☄️ 1% 极限'][state.level];
}
function pick(b){
 if(b.disabled)return;
 state.history.push([...state.hand]);state.hand.push(+b.dataset.v);b.disabled=true;b.classList.add('gone');state.removed++;
 for(const v of new Set(state.hand)){let n=state.hand.filter(x=>x===v).length;if(n>=3){state.hand=state.hand.filter(x=>x!==v);state.score+=30}}
 if(state.hand.length>=7){$('#msg').textContent='能量槽满了，重新来一局';$('#modal').showModal();return}
 if(state.removed===LEVELS[state.level].length){
   if(state.level===3)state.level=1;else state.level++;
   save();$('#msg').textContent='回路完成 ✦ 下一关';$('#modal').showModal();
 }
 render();
}
function render(){
 $('#score').textContent=state.score;$('#slots').replaceChildren(...Array.from({length:7},(_,i)=>{const s=document.createElement('span');s.textContent=state.hand[i]==null?'':ICONS[state.hand[i]];return s}));
}
$('#undo').onclick=()=>{if(!state.history.length)return;state.hand=state.history.pop();document.querySelectorAll('.tile').forEach(b=>{if(b.disabled&&!b.classList.contains('gone'))return});document.querySelectorAll('.tile').forEach(b=>b.disabled=false);state.removed=document.querySelectorAll('.tile.gone').length;render()};
$('#restart').onclick=()=>{build();$('#modal').close()};
$('#close').onclick=()=>$('#modal').close();
build();
