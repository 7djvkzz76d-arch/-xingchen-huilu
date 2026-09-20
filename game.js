'use strict';
const ICONS=['✦','◆','●','▲','☾','✿','⬢','★'];
const LEVELS={
  1:[0,0,0,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5],
  2:[0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5],
  3:[0,0,0,0,0,0,1,1,1,1,1,1,2,2,2,2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,5,5,5,5,5,5]
};
const state={
  level:Math.min(3,Math.max(1,+localStorage.xhLevel||1)),
  hand:[],gone:new Set(),history:[],score:+localStorage.xhScore||0,modalMode:''
};
const $=s=>document.querySelector(s);
function save(){localStorage.xhLevel=state.level;localStorage.xhScore=state.score}
function render(){
  $('#score').textContent=state.score;
  $('#level').textContent=state.level;
  $('#diff').textContent=['','入门','深思','☄️ 1% 极限'][state.level];
  $('#slots').replaceChildren(...Array.from({length:7},(_,i)=>{
    const s=document.createElement('span');s.textContent=state.hand[i]==null?'':ICONS[state.hand[i]];return s;
  }));
}
function build(){
  state.hand=[];state.gone=new Set();state.history=[];state.modalMode='';
  $('#field').replaceChildren();
  const seq=[...LEVELS[state.level]].sort(()=>Math.random()-.5);
  const cols=6;
  seq.forEach((v,i)=>{
    const b=document.createElement('button');
    b.className='tile';b.textContent=ICONS[v];b.dataset.v=v;b.dataset.id=i;
    b.onclick=()=>pick(b);
    b.style.setProperty('--x',(9+(i%cols)*16.4)+'%');
    b.style.setProperty('--y',(9+Math.floor(i/cols)*16.4)+'%');
    $('#field').append(b);
  });
  render();
}
function syncTiles(){
  document.querySelectorAll('.tile').forEach(b=>b.classList.toggle('gone',state.gone.has(+b.dataset.id)));
}
function showModal(message,mode,buttonText){
  state.modalMode=mode;$('#msg').textContent=message;$('#close').textContent=buttonText;$('#modal').showModal();
}
function pick(b){
  const id=+b.dataset.id;if(state.gone.has(id))return;
  state.history.push({hand:[...state.hand],gone:[...state.gone],score:state.score});
  state.hand.push(+b.dataset.v);state.gone.add(id);
  for(const v of new Set(state.hand)){
    if(state.hand.filter(x=>x===v).length>=3){
      state.hand=state.hand.filter(x=>x!==v);state.score+=30;
    }
  }
  syncTiles();render();
  if(state.hand.length>=7){showModal('能量槽满了，本局结束。','retry','重新挑战');return}
  if(state.gone.size===LEVELS[state.level].length){
    state.level=state.level===3?1:state.level+1;save();
    showModal(state.level===1?'极限回路完成 ✦ 回到第1关':'回路完成 ✦ 下一关已解锁','next','进入下一关');
  }
}
$('#undo').onclick=()=>{
  const h=state.history.pop();if(!h)return;
  state.hand=h.hand;state.gone=new Set(h.gone);state.score=h.score;syncTiles();save();render();
};
$('#restart').onclick=()=>{build();$('#modal').close()};
$('#close').onclick=()=>{
  const mode=state.modalMode;$('#modal').close();
  if(mode==='next')build();
  else if(mode==='retry')build();
};
build();
