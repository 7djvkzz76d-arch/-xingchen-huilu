'use strict';

// Safari/private-mode/webview-safe persistence. Gameplay must never fail just because storage is unavailable.
const storage={
  get(key,fallback){try{const v=localStorage.getItem(key);return v===null?fallback:v}catch{return fallback}},
  set(key,value){try{localStorage.setItem(key,String(value))}catch{}},
};
const num=(key,fallback,min,max)=>{const n=Number(storage.get(key,fallback));return Number.isFinite(n)?Math.min(max,Math.max(min,n)):fallback};

const ICONS=['✦','◆','●','▲','☾','✿','⬢','★'];
const LEVELS={
  1:{stacks:6,cols:3},
  2:{stacks:8,cols:4},
  3:{stacks:12,cols:6}
};

const state={
  level:num('xhLevel',1,1,3),
  hand:[],gone:new Set(),history:[],score:num('xhScore',0,0,Number.MAX_SAFE_INTEGER),modalMode:'',tiles:[]
};
const $=s=>document.querySelector(s);

function save(){
  storage.set('xhLevel',state.level);
  storage.set('xhScore',state.score);
}

function render(){
  $('#score').textContent=state.score;
  $('#level').textContent=state.level;
  $('#diff').textContent=['','入门','深思','☄️ 1% 极限'][state.level];
  $('#slots').replaceChildren(...Array.from({length:7},(_,i)=>{
    const s=document.createElement('span');
    s.textContent=state.hand[i]==null?'':ICONS[state.hand[i]];
    return s;
  }));
}

function layerValues(level,layer,count){
  const presets={
    1:[[5,5,5,4,4,3],[4,3,3,2,2,1],[2,1,1,0,0,0]],
    2:[[1,0,0,1,1,0,4,5],[5,5,4,4,3,3,2,1],[3,2,2,1,1,0,0,0]],
    3:[[5,5,1,5,4,4,4,3,3,0,3,2],[2,2,1,1,0,0,5,5,5,2,4,1],[4,4,3,3,3,2,2,1,1,0,0,0]]
  };
  return presets[level][layer].slice(0,count);
}

function build(){
  const cfg=LEVELS[state.level];
  state.hand=[];state.gone=new Set();state.history=[];state.modalMode='';state.tiles=[];
  $('#field').replaceChildren();

  const values=[0,1,2].flatMap(layer=>layerValues(state.level,layer,cfg.stacks));
  const cols=cfg.cols;
  for(let i=0;i<cfg.stacks;i++){
    const x=9+(i%cols)*(82/(cols-1||1));
    const y=18+Math.floor(i/cols)*64;
    for(let layer=0;layer<3;layer++){
      const id=layer*cfg.stacks+i;
      const tile={id,stack:i,layer,v:values[id]};
      state.tiles.push(tile);
      const b=document.createElement('button');
      b.className='tile';
      b.textContent=ICONS[tile.v];
      b.dataset.v=tile.v;
      b.dataset.id=id;
      b.dataset.stack=i;
      b.dataset.layer=layer;
      b.style.setProperty('--x',x+'%');
      b.style.setProperty('--y',y+'%');
      b.style.setProperty('--lift',(layer*3)+'px');
      b.style.zIndex=layer+1;
      b.onclick=()=>pick(b);
      $('#field').append(b);
    }
  }
  syncTiles();
  render();
}

function isAvailable(tile){
  for(const other of state.tiles){
    if(other.stack===tile.stack && other.layer>tile.layer && !state.gone.has(other.id))return false;
  }
  return true;
}

function syncTiles(){
  document.querySelectorAll('.tile').forEach(b=>{
    const id=+b.dataset.id;
    const tile=state.tiles[id];
    const gone=state.gone.has(id);
    const available=!gone&&isAvailable(tile);
    b.classList.toggle('gone',gone);
    b.classList.toggle('locked',!gone&&!available);
    b.disabled=!gone&&!available;
  });
}

function shareResult(){
  const text=state.level===3&&state.modalMode==='finish'
    ? '我完成了《星屑回路》全部 3 个回路 ✦'
    : '我正在挑战《星屑回路》，当前完成到第 '+state.level+' 关 ✦';
  if(navigator.share){
    navigator.share({title:'星屑回路',text,url:location.href}).catch(()=>{});
    return;
  }
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(text+' '+location.href).then(()=>{
      const old=$('#share').textContent;
      $('#share').textContent='✓ 已复制';
      setTimeout(()=>$('#share').textContent=old,1400);
    }).catch(()=>{});
  }
}

function showModal(message,mode,buttonText){
  state.modalMode=mode;
  $('#modal').classList.toggle('finish',mode==='finish');
  $('#msg').textContent=message;
  $('#close').textContent=buttonText;
  $('#modal').showModal();
}

function pick(b){
  const id=+b.dataset.id;
  const tile=state.tiles[id];
  if(state.gone.has(id)||!isAvailable(tile))return;

  state.history.push({
    hand:[...state.hand],
    gone:[...state.gone],
    score:state.score
  });

  state.hand.push(tile.v);
  state.gone.add(id);

  let cleared=false;
  for(const v of new Set(state.hand)){
    if(state.hand.filter(x=>x===v).length>=3){
      state.hand=state.hand.filter(x=>x!==v);
      state.score+=30;
      cleared=true;
    }
  }

  syncTiles();
  render();

  if(state.hand.length>=7){
    showModal('能量槽满了，本局结束。\n观察堆叠关系，再试一次。','retry','重新挑战');
    return;
  }

  if(state.gone.size===state.tiles.length){
    if(state.level===3){
      state.modalMode='finish';
      $('#modal').classList.add('finish');
      $('#msg').textContent='恭喜你！你完成了《星屑回路》的终极挑战 ✦';
      $('#close').textContent='查看结果';
      $('#modal').showModal();
      save();
      return;
    }
    state.level+=1;
    save();
    showModal('回路完成 ✦ 下一关已解锁','next','进入下一关');
    return;
  }

  if(cleared)save();
}

$('#share').onclick=shareResult;

$('#undo').onclick=()=>{
  const h=state.history.pop();
  if(!h)return;
  state.hand=h.hand;
  state.gone=new Set(h.gone);
  state.score=h.score;
  syncTiles();
  save();
  render();
};

$('#restart').onclick=()=>{
  build();
  $('#modal').close();
};

$('#close').onclick=()=>{
  const mode=state.modalMode;
  $('#modal').close();
  if(mode==='next'||mode==='retry')build();
  else if(mode==='finish'){
    $('#msg').textContent='🏆 通关成功！\n你已经完成全部 3 个回路。';
    $('#close').textContent='重新开始';
    state.modalMode='finished';
    $('#modal').showModal();
  }else if(mode==='finished'){
    $('#modal').classList.remove('finish');
    state.level=1;
    state.score=0;
    save();
    build();
  }
};

build();
