'use strict';
const ICONS=['✦','◆','●','▲','☾','✿','⬢','★'];
const LEVELS={
1:[0,0,0,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5],
2:[0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5],
3:[0,0,0,0,0,0,1,1,1,1,1,1,2,2,2,2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,5,5,5,5,5,5]
};
const state={level:+localStorage.xhLevel||1,hand:[],removed:0,history:[],score:0};
const $=s=>document.querySelector(s);
function save(){localStorage.xhLevel=state.level}
function render(){
 $('#score').textContent=state.score;
 $('#slots').replaceChildren(...Array.from({length:7},(_,i)=>{const s=document.createElement('span');s.textContent=state.hand[i]==null?'':ICONS[state.hand[i]];return s}));
}
function build(){
 state.hand=[];state.removed=0;state.history=[];$('#field').replaceChildren();
 const seq=[...LEVELS[state.level]].sort(()=>Math.random()-.5);
 seq.forEach((v,i)=>{const b=document.createElement('button');b.className='tile';b.textContent=ICONS[v];b.dataset.v=v;b.dataset.gone='0';b.onclick=()=>pick(b);b.style.setProperty('--x',(8+(i%6)*16)+'%');b.style.setProperty('--y',(8+Math.floor(i/6)*23)+'%');$('#field').append(b)});
 $('#level').textContent=state.level;$('#diff').textContent=['','入门','深思','☄️ 1% 极限'][state.level];render();
}
function pick(b){
 if(b.dataset.gone==='1')return;
 state.history.push({hand:[...state.hand],removed:state.removed});
 state.hand.push(+b.dataset.v);b.dataset.gone='1';b.classList.add('gone');state.removed++;
 for(const v of new Set(state.hand))if(state.hand.filter(x=>x===v).length>=3){state.hand=state.hand.filter(x=>x!==v);state.score+=30}
 if(state.hand.length>=7){$('#msg').textContent='能量槽满了，重新来一局';$('#modal').showModal();render();return}
 if(state.removed===LEVELS[state.level].length){
   state.level=state.level===3?1:state.level+1;save();$('#msg').textContent='回路完成 ✦ 下一关';$('#modal').showModal();
 }
 render();
}
$('#undo').onclick=()=>{
 const h=state.history.pop();if(!h)return;
 state.hand=h.hand;state.removed=h.removed;
 document.querySelectorAll('.tile').forEach((b,i)=>{b.dataset.gone=i>=state.removed?'1':'0';b.classList.toggle('gone',i>=state.removed)});
 render();
};
$('#restart').onclick=()=>{build();$('#modal').close()};
$('#close').onclick=()=>$('#modal').close();
build();
