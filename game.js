'use strict';

const storage={
  get(key,fallback){try{const v=localStorage.getItem(key);return v===null?fallback:v}catch{return fallback}},
  set(key,value){try{localStorage.setItem(key,String(value))}catch{}},
};
const num=(key,fallback,min,max)=>{const n=Number(storage.get(key,fallback));return Number.isFinite(n)?Math.min(max,Math.max(min,n)):fallback};

const ICONS=['✦','◆','●','▲','☾','✿','⬢','★'];
const TEXT={
  zh:{level:['','入门','深思','☄️ 1% 极限'],hint:'可点击发光星块',energy:'能量槽 · 三颗同星坍缩',share:'↗ 分享战绩',undo:'↩ 撤回',restart:'↻ 重开',retry:'重新挑战',next:'进入下一关',continue:'继续',score:'分数',route:'回路',shareDone:'✓ 已复制',
    shareProgress:l=>'我正在挑战《星屑回路》，当前完成到第 '+l+' 关 ✦',
    shareFinish:'我完成了《星屑回路》全部 3 个回路 ✦',
    full:'能量槽满了，本局结束。\\n观察堆叠关系，再试一次。',
    nextMsg:'回路完成 ✦ 下一关已解锁',
    finishMsg:'恭喜你！你完成了《星屑回路》的终极挑战 ✦',
    successMsg:'🏆 通关成功！\\n你已经完成全部 3 个回路。'},
  en:{level:['','Beginner','Think Deep','☄️ 1% Extreme'],hint:'Tap a glowing star tile',energy:'Energy · Three matching stars collapse',share:'↗ Share Result',undo:'↩ Undo',restart:'↻ Restart',retry:'Try Again',next:'Next Level',continue:'Continue',score:'Score',route:'Circuit',shareDone:'✓ Copied',
    shareProgress:l=>'I\'m challenging Star Dust Circuit — reached Circuit '+l+' ✦',
    shareFinish:'I completed all 3 circuits in Star Dust Circuit ✦',
    full:'Energy is full.\\nStudy the stack and try again.',
    nextMsg:'Circuit complete ✦ Next level unlocked',
    finishMsg:'Congratulations! You completed the ultimate Star Dust Circuit ✦',
    successMsg:'🏆 Complete!\\nYou finished all 3 circuits.'}
};
let currentLang=/^zh(?:-|$)/i.test(navigator.language||'')?'zh':'en';
const t=key=>TEXT[currentLang][key];
function setLocale(locale){
  currentLang=/^zh(?:-|$)/i.test(locale||'')?'zh':'en';
  document.documentElement.lang=currentLang==='zh'?'zh-CN':'en';
  $('#diff').textContent=t('level')[state.level];
  $('.brand').innerHTML=currentLang==='zh'?'✦ 星屑<i>回路</i>':'✦ Star Dust <i>Circuit</i>';
  document.querySelector('.foot').textContent=currentLang==='zh'?'原创三消益智玩法 · 第3关为极限难度目标':'Original match-3 puzzle · Circuit 3 is the extreme challenge';
  $('#field').setAttribute('aria-label',currentLang==='zh'?'星屑回路棋盘':'Star Dust Circuit board');
  $('#slots').setAttribute('aria-label',currentLang==='zh'?'能量槽':'Energy slots');
  $('#hint').textContent=t('hint');
  document.querySelector('.bar span:first-child').innerHTML=t('route')+' <b id="level">'+state.level+'</b>/3';
  document.querySelectorAll('.bar')[1].firstElementChild.textContent=t('energy');
  $('#share').textContent=t('share');$('#undo').textContent=t('undo');$('#restart').textContent=t('restart');
  $('#share').setAttribute('aria-label',t('share'));$('#undo').setAttribute('aria-label',t('undo'));$('#restart').setAttribute('aria-label',t('restart'));
  document.querySelector('.stats').childNodes[0].textContent=t('score')+' ';
  $('#close').textContent=t('continue');
  render();
}
window.XingchenHuilu={setLocale};
const LEVELS={
  1:{stacks:6,cols:3},
  2:{stacks:8,cols:4},
  3:{stacks:12,cols:3}
};
const state={
  level:num('xhLevel',1,1,3),
  hand:[],gone:new Set(),history:[],score:num('xhScore',0,0,Number.MAX_SAFE_INTEGER),modalMode:'',tiles:[]
};
const $=s=>document.querySelector(s);

function save(){storage.set('xhLevel',state.level);storage.set('xhScore',state.score)}

function render(){
  $('#score').textContent=state.score;
  $('#level').textContent=state.level;
  $('#diff').textContent=t('level')[state.level];
  $('#hint').textContent=t('hint');
  $('#slots').replaceChildren(...Array.from({length:7},(_,i)=>{
    const s=document.createElement('span');s.textContent=state.hand[i]==null?'':ICONS[state.hand[i]];return s;
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
  const cols=cfg.cols,rows=Math.ceil(cfg.stacks/cols);
  for(let i=0;i<cfg.stacks;i++){
    const col=i%cols,row=Math.floor(i/cols);
    const x=10+(col*(80/(cols-1||1)));
    const y=rows===1?50:14+(row*(72/(rows-1)));
    for(let layer=0;layer<3;layer++){
      const id=layer*cfg.stacks+i;
      const tile={id,stack:i,layer,v:values[id]};
      state.tiles[id]=tile;
      const b=document.createElement('button');
      b.className='tile';
      b.type='button';
      b.textContent=ICONS[tile.v];
      b.dataset.id=id;
      b.style.setProperty('--x',x+'%');
      b.style.setProperty('--y',y+'%');
      b.style.setProperty('--lift',(layer*3)+'px');
      b.style.zIndex=layer+1;
      $('#field').append(b);
    }
  }
  syncTiles();render();
}

function isAvailable(tile){
  if(!tile)return false;
  for(const other of state.tiles){
    if(other.stack===tile.stack&&other.layer>tile.layer&&!state.gone.has(other.id))return false;
  }
  return true;
}

function syncTiles(){
  document.querySelectorAll('.tile').forEach(b=>{
    const tile=state.tiles[+b.dataset.id],gone=state.gone.has(+b.dataset.id);
    const available=!gone&&isAvailable(tile);
    b.classList.toggle('gone',gone);
    b.classList.toggle('locked',!gone&&!available);
    b.setAttribute('aria-disabled',String(!available));
  });
}

function shareResult(){
  const completed=state.modalMode==='finish'||state.modalMode==='finished';
  const text=completed?t('shareFinish'):t('shareProgress')(state.level);
  if(navigator.share){navigator.share({title:currentLang==='zh'?'星屑回路':'Star Dust Circuit',text,url:location.href}).catch(()=>{});return}
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(text+' '+location.href).then(()=>{
      const old=$('#share').textContent;$('#share').textContent=t('shareDone');setTimeout(()=>$('#share').textContent=old,1400);
    }).catch(()=>{});
  }
}

function showModal(message,mode,buttonText){
  state.modalMode=mode;$('#modal').classList.toggle('finish',mode==='finish');
  $('#msg').textContent=message;$('#close').textContent=buttonText;$('#modal').showModal();
}

function pick(b){
  const id=+b.dataset.id,tile=state.tiles[id];
  if(state.gone.has(id)||!isAvailable(tile))return;
  state.history.push({hand:[...state.hand],gone:[...state.gone],score:state.score});
  state.hand.push(tile.v);state.gone.add(id);

  let cleared=false;
  for(const v of new Set(state.hand)){
    if(state.hand.filter(x=>x===v).length>=3){
      state.hand=state.hand.filter(x=>x!==v);
      state.score+=30;
      cleared=true;
    }
  }
  syncTiles();render();

  if(state.hand.length>=7){showModal('能量槽满了，本局结束。\n观察堆叠关系，再试一次。','retry','重新挑战');return}
  if(state.gone.size===state.tiles.length){
    if(state.level===3){
      state.modalMode='finish';$('#modal').classList.add('finish');
      $('#msg').textContent=t('finishMsg');
      $('#close').textContent=t('continue');$('#modal').showModal();save();return;
    }
    state.level+=1;save();showModal(t('nextMsg'),'next',t('next'));return;
  }
  if(cleared)save();
}

$('#field').addEventListener('click',e=>{const b=e.target.closest('.tile');if(b)pick(b)});
$('#share').onclick=shareResult;
$('#undo').onclick=()=>{
  const h=state.history.pop();if(!h)return;
  state.hand=h.hand;state.gone=new Set(h.gone);state.score=h.score;syncTiles();save();render();
};
$('#restart').onclick=()=>{build();if($('#modal').open)$('#modal').close()};
$('#close').onclick=()=>{
  const mode=state.modalMode;$('#modal').close();
  if(mode==='next'||mode==='retry')build();
  else if(mode==='finish'){
    $('#msg').textContent='🏆 通关成功！\n你已经完成全部 3 个回路。';
    $('#close').textContent='重新开始';state.modalMode='finished';$('#modal').showModal();
  }else if(mode==='finished'){
    $('#modal').classList.remove('finish');state.level=1;state.score=0;save();build();
  }
};
build();
