const state={db:null,screen:"welcome",date:new Date(),parentDate:new Date(),parentToken:null,lastDayKey:null,childLastTotal:null,cfgMonth:new Date(),cfgPickMode:"start",inConfig:false};
const parentIdleMs=15*60*1000;
let parentLastActivity=0, parentLastTouch=0, parentTouchInFlight=false;
function setParentToken(token){state.parentToken=token;parentLastActivity=Date.now();parentLastTouch=Date.now()}
function revokeParentSession(){const token=state.parentToken;state.parentToken=null;if(token)req("/api/punktacja/parent/logout",{method:"POST",headers:{Authorization:"Bearer "+token},body:"{}"}).catch(()=>{})}
async function touchParentSession(){if(!state.parentToken||parentTouchInFlight)return;parentTouchInFlight=true;const token=state.parentToken;try{await req("/api/punktacja/parent/session",{headers:{Authorization:"Bearer "+token}});parentLastTouch=Date.now()}catch(_){if(state.parentToken===token)showScreen("welcome")}finally{parentTouchInFlight=false}}
function noteParentActivity(){if(state.screen!=="parent"||!state.parentToken)return;const now=Date.now();if(now-parentLastActivity>=parentIdleMs){showScreen("welcome");return}parentLastActivity=now;if(now-parentLastTouch>=60*1000)touchParentSession()}
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const dateKey=d=>{const x=new Date(d);return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-${String(x.getDate()).padStart(2,"0")}`};
const parseDate=s=>{const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d)};
const fmtDate=d=>d.toLocaleDateString("pl-PL",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
async function req(url,opts={}){const {headers={},...rest}=opts;const r=await fetch(url,{cache:"no-store",...rest,headers:{"Content-Type":"application/json",...headers}});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||"Błąd serwera");return j}
const RAFCIA_WOW_RESET_KEY="rafciaWowReset:2026-10-08"
function rafciaPrepareWowForNextChildOpen(){try{if(localStorage.getItem(RAFCIA_WOW_RESET_KEY)==="1")return;localStorage.removeItem("rafciaChildSeenPoints:"+dateKey(new Date()));localStorage.setItem(RAFCIA_WOW_RESET_KEY,"1")}catch(e){}}
async function load(){state.db=await req("/api/punktacja");rafciaPrepareWowForNextChildOpen();return state.db}

function rec(k){return state.db.records?.[k]||{tasks:{},extras:{},challenges:{}}}
function taskState(r,id){const v=r?.tasks?.[id];return v===true||v==="done"?"done":v===false||v==="missed"?"missed":"pending"}
function dayPoints(k){const r=rec(k);let n=0;for(const t of state.db.tasks||[]){const s=taskState(r,t.id);if(s==="done")n+=Number(t.points)||0;else if(s==="missed")n-=Number(t.points)||0}for(const e of state.db.extras||[])if(r.extras?.[e.id])n+=+e.points;for(const c of state.db.challenges||[])if(r.challenges?.[c.id])n+=+c.points;if(questionDayStatuses()[k]==="done")n+=questionDayPoints();for(const b of state.db.bonusPoints||[])if(String(b.createdAt||"").slice(0,10)===k)n+=Number(b.points)||0;return n}
function totalPoints(){let n=0;const bonuses=state.db.bonusPoints||[];const keys=new Set([...Object.keys(state.db.records||{}),...Object.keys(questionDayStatuses()),...bonuses.map(x=>String(x.createdAt||"").slice(0,10)).filter(Boolean)]);for(const k of keys)n+=dayPoints(k);for(const x of state.db.redemptions||[])if(x.status==="approved")n-=+x.cost;for(const x of state.db.consequences||[])n-=+x.points;return n}
function activeGame(){return !!state.db?.settings?.gameStarted && (state.db?.settings?.status||"active")==="active"}
function scheduledGame(){return (state.db?.settings?.status||"")==="scheduled"}
function finishedGame(){return (state.db?.settings?.status||"")==="finished"}
function scheduleStartLabel(){const s=state.db?.settings?.startDate;return s?parseDate(s).toLocaleDateString("pl-PL",{day:"numeric",month:"long",year:"numeric"}):"Dzisiaj"}
function scheduleEndLabel(){const s=state.db?.settings?.endDate;return s?parseDate(s).toLocaleDateString("pl-PL",{day:"numeric",month:"long",year:"numeric"}):"Bez daty końcowej"}
function syncGameDay(){const k=dateKey(new Date());if(state.lastDayKey===null){state.lastDayKey=k;return false}if(k===state.lastDayKey)return false;const prev=state.lastDayKey;state.lastDayKey=k;state.date=new Date();if(dateKey(state.parentDate)===prev)state.parentDate=new Date();return true}
function handleDayBoundary(){if(!syncGameDay())return;if(state.screen==="child"&&activeGame())renderChild();if(state.screen==="parent"&&state.parentToken){renderParent();renderConfigConsequences();ensureConfigButton()}}
function challengeDone(id){return Object.values(state.db.records||{}).some(r=>r.challenges?.[id]===true)}
function rafciaTodayPositivePoints(k=dateKey(new Date())){const r=rec(k);let n=0;for(const t of state.db?.tasks||[])if(taskState(r,t.id)==="done")n+=Number(t.points)||0;for(const e of state.db?.extras||[])if(r.extras?.[e.id])n+=Number(e.points)||0;for(const c of state.db?.challenges||[])if(r.challenges?.[c.id])n+=Number(c.points)||0;return n;}
function rafciaGetWowPending(){try{const x=JSON.parse(localStorage.getItem("rafciaWowPending")||"null");return x&&Number(x.delta)>0?x:null}catch(e){return null}}
function rafciaQueueWow(delta){delta=Number(delta)||0;if(delta<=0)return;const old=rafciaGetWowPending();try{localStorage.setItem("rafciaWowPending",JSON.stringify({delta:(old?.delta||0)+delta,createdAt:Date.now()}))}catch(e){}}
function rafciaQueueSad(delta){delta=Number(delta)||0;if(delta<=0)return;try{const old=JSON.parse(localStorage.getItem("rafciaSadPending")||"null");localStorage.setItem("rafciaSadPending",JSON.stringify({delta:(old?.delta||0)+delta,createdAt:Date.now()}))}catch(e){}}
function rafciaTakeWowAmount(){const pending=rafciaGetWowPending();if(pending){try{localStorage.removeItem("rafciaWowPending")}catch(e){}return Math.round(pending.delta)}const k=dateKey(new Date()),seenKey="rafciaChildSeenPoints:"+k;let seen=null;try{const raw=localStorage.getItem(seenKey);if(raw!==null)seen=Number(raw)}catch(e){}const current=rafciaTodayPositivePoints(k);if(seen===null){try{localStorage.setItem(seenKey,String(current))}catch(e){}return current>0?Math.round(current):0}if(current>seen){try{localStorage.setItem(seenKey,String(current))}catch(e){}return Math.round(current-seen)}try{localStorage.setItem(seenKey,String(current))}catch(e){}return 0;}
function rafciaShowWow(points){if(!points||points<=0)return;const old=document.getElementById("rafciaWowOverlay");if(old)old.remove();const overlay=document.createElement("div");overlay.id="rafciaWowOverlay";overlay.innerHTML=`<div class="wowBackdrop"></div><div class="wowBurst wowBurstA"></div><div class="wowBurst wowBurstB"></div><div class="wowConfetti"></div><div class="wowContent"><div class="wowSmall">✨ RAFCIU! ✨</div><div class="wowTitle">BRAWO!</div><div class="wowPoints"><span>+</span>${points}<b>PKT</b></div><div class="wowSubtitle">Rodzic docenił Twoje starania! 💪</div></div>`;document.body.appendChild(overlay);const conf=overlay.querySelector(".wowConfetti"),symbols=["✦","★","✧","●","◆","🎉","⭐","⚡"];for(let i=0;i<54;i++){const p=document.createElement("i");p.textContent=symbols[i%symbols.length];p.style.setProperty("--x",(Math.random()*100)+"vw");p.style.setProperty("--r",(Math.random()*720-360)+"deg");p.style.setProperty("--d",(1.15+Math.random()*1.25)+"s");p.style.setProperty("--s",(0.65+Math.random()*1.35).toFixed(2));p.style.setProperty("--delay",(Math.random()*0.18)+"s");conf.appendChild(p)}requestAnimationFrame(()=>overlay.classList.add("show"));setTimeout(()=>overlay.classList.add("fade"),2150);setTimeout(()=>overlay.remove(),2850);}
function rafciaTakeSadAmount(){try{const x=JSON.parse(localStorage.getItem("rafciaSadPending")||"null");if(x&&Number(x.delta)>0){localStorage.removeItem("rafciaSadPending");return Math.round(Number(x.delta))}}catch(e){}return 0}
function rafciaShowSad(points){
 if(!points||points<=0)return;
 const old=document.getElementById("rafciaSadOverlay");if(old)old.remove();
 const overlay=document.createElement("div");overlay.id="rafciaSadOverlay";
 overlay.innerHTML=`<div class="sadRain"></div><div class="sadContent"><div class="sadSmall">OHO, RAFCIU…</div><div class="sadTitle">−${points}</div><div class="sadUnit">PKT</div><div class="sadSubtitle">Konsekwencja od rodzica</div><div class="sadNote">Każdy dzień to nowa szansa, żeby poprawić wynik.</div></div>`;
 document.body.appendChild(overlay);
 const rain=overlay.querySelector(".sadRain"),drops=["💧","💦","❄","🧊","·","💧"];
 for(let i=0;i<58;i++){const d=document.createElement("i");d.textContent=drops[i%drops.length];d.style.setProperty("--x",(Math.random()*100)+"vw");d.style.setProperty("--delay",(Math.random()*.8)+"s");d.style.setProperty("--duration",(1.5+Math.random()*1.8)+"s");d.style.setProperty("--size",(12+Math.random()*24)+"px");rain.appendChild(d)}
 requestAnimationFrame(()=>overlay.classList.add("show"));setTimeout(()=>overlay.classList.add("fade"),2800);setTimeout(()=>overlay.remove(),3450);
}
function rafciaMaybeShowWow(){if(state.screen!=="child"||!activeGame())return;const sad=rafciaTakeSadAmount();if(sad>0){setTimeout(()=>rafciaShowSad(sad),180);return}const points=rafciaTakeWowAmount();if(points>0)setTimeout(()=>rafciaShowWow(points),180);}
async function showScreen(name){if(name!=="parent"&&state.parentToken)revokeParentSession();document.body.classList.toggle("child-scene-active",name==="child");state.screen=name;if(name==="parent"||name==="child"||name==="welcome")state.inConfig=false;document.querySelectorAll(".screen").forEach(s=>s.classList.add("hidden"));const target=$(name+"Screen");if(!target)return;target.classList.remove("hidden");document.querySelectorAll(".navBtn").forEach(b=>b.classList.toggle("active",b.dataset.screen===name));if(name==="child"){try{state.db=await req("/api/punktacja")}catch(e){console.error("Nie udało się odświeżyć danych panelu dziecka:",e)}state.childLastTotal=totalPoints();renderChild();rafciaMaybeShowWow()}if(name==="parent")renderParent()}
function gameDateRange(){
  const s=state.db?.settings||{};
  const start=s.startDate||((s.gameStarted)?dateKey(new Date()):"");
  const end=s.endDate||"";
  return {start,end};
}
const missionColors=[
  {name:"Żółty",color:"#e6b82e"},
  {name:"Granatowy",color:"#123d63"},
  {name:"Czerwony",color:"#e65353"},
  {name:"Niebieski",color:"#168fe8"},
  {name:"Różowy",color:"#d94fc0"}
];
function sortedMissions(){
  return (state.db?.challenges||[])
    .filter(c=>c.active!==false&&c.start&&c.end)
    .slice()
    .sort((a,b)=>String(a.start).localeCompare(String(b.start))||
      (Number(a.createdAt)||0)-(Number(b.createdAt)||0)||
      String(a.id).localeCompare(String(b.id)));
}
// Kolor wynika wyłącznie z kolejności misji nakładających się na dany dzień.
// Nazwa misji nie ma żadnego wpływu na kolor.
function missionsForDay(k){
  return sortedMissions().filter(c=>k>=c.start&&k<=c.end);
}
function missionColor(c,k=dateKey(new Date())){
  const active=missionsForDay(k);
  const index=active.findIndex(x=>x.id===c.id);
  return missionColors[Math.max(0,index)%missionColors.length];
}
function missionConcurrencyCount(candidate){
  const all=sortedMissions().filter(c=>c.id!==candidate.id);
  const checkpoints=[candidate.start,...all.map(c=>c.start).filter(k=>k>=candidate.start&&k<=candidate.end)];
  return Math.max(0,...checkpoints.map(k=>
    1+all.filter(c=>k>=c.start&&k<=c.end).length
  ));
}
function activeStatusLegend(){
  const today=dateKey(new Date());
  const {start,end}=gameDateRange();
  const gameOn=!!start&&today>=start&&(!end||today<=end);
  const active=sortedMissions();
  const items=[];
  if(gameOn){items.push(`<span class="statusLegendItem"><i style="--legend-color:#35c46f"></i><b>Gra</b><small>${parseDate(start).toLocaleDateString("pl-PL",{day:"numeric",month:"short"})} – ${end?parseDate(end).toLocaleDateString("pl-PL",{day:"numeric",month:"short"}):"bez końca"}</small></span>`)}
  active.forEach(c=>{const mc=missionColor(c,today);items.push(`<span class="statusLegendItem"><i style="--legend-color:${mc.color}"></i><b>${esc(c.name)}</b><small>${parseDate(c.start).toLocaleDateString("pl-PL",{day:"numeric",month:"short"})} – ${parseDate(c.end).toLocaleDateString("pl-PL",{day:"numeric",month:"short"})}</small></span>`)});
  return items.length?items.join(""):"<span class='statusLegendEmpty'>Brak zaplanowanych misji • gra nie jest obecnie aktywna</span>";
}
function paintCalendarLegend(targetId){
  const map={calendarGrid:"childCalendarLegend",pCalendar:"pCalendarLegend"};
  const el=$(map[targetId]); if(el)el.innerHTML=activeStatusLegend();
}
function calendarDayLayers(k){
  const {start,end}=gameDateRange();
  const gameOn=!!start&&k>=start&&(!end||k<=end);
  const missions=sortedMissions().filter(c=>k>=c.start&&k<=c.end);
  let h=gameOn?`<span class="calendarFill calendarGame" title="Gra"></span>`:"";
  const n=missions.length;
  missions.forEach((c,i)=>{
    const top=45+(i*(55/n));
    const height=55/n;
    const mc=missionColor(c,k);
    h+=`<span class="calendarFill calendarMission" style="top:${top}%;height:${height}%;--mission-color:${mc.color}" title="${esc(c.name)}"></span>`;
  });
  return {html:h,missions,gameOn};
}
function renderCalendar(targetId,date,click){
  const y=date.getFullYear(),m=date.getMonth(),first=new Date(y,m,1),days=new Date(y,m+1,0).getDate(),off=(first.getDay()+6)%7;
  const label=$(targetId==="calendarGrid"?"monthLabel":"pMonth");
  if(label)label.textContent=first.toLocaleDateString("pl-PL",{month:"long",year:"numeric"});
  let h="";
  for(let i=0;i<off;i++)h+="<div></div>";
  for(let d=1;d<=days;d++){
    const x=new Date(y,m,d),k=dateKey(x),p=dayPoints(k),r=rec(k),touched=Object.keys(r.tasks||{}).length||Object.keys(r.extras||{}).length||Object.keys(r.challenges||{}).length;
    const layers=calendarDayLayers(k);
    const cls=["day",k===dateKey(date)?"selected":"",k===dateKey(new Date())?"today":"",touched?"hasData":"",p<0?"negative":"",layers.gameOn?"hasGame":"",layers.missions.length?"hasMissions":""].filter(Boolean).join(" ");
    const missionNames=layers.missions.map(c=>c.name).join(" • ");
    const title=[layers.gameOn?"Gra":"",missionNames].filter(Boolean).join(" • ");
    h+=`<button type="button" class="${cls}" data-calday="${k}" title="${esc(title)}">${layers.html}<b>${d}</b>${p!==0?`<span class="pts">${p>0?"+":""}${p}</span>`:""}</button>`;
  }
  const el=$(targetId);
  if(!el)return;
  el.innerHTML=h;
  el.querySelectorAll("[data-calday]").forEach(b=>b.onclick=()=>click(parseDate(b.dataset.calday)));
  paintCalendarLegend(targetId);
}
const DEFAULT_QUESTION_DAY="Co było dziś najprzyjemniejszą częścią Twojego dnia?";
function questionDayText(){return String(state.db?.settings?.questionOfTheDay||state.db?.configLibrary?.question?.slice(-1)[0]||DEFAULT_QUESTION_DAY).trim()}
function questionDayPoints(){const n=Number(state.db?.settings?.questionOfTheDayPoints);return Number.isFinite(n)&&n>=0?Math.round(n):10}
function questionDayStatuses(){return state.db?.settings?.questionOfTheDayStatus||{}}
function questionDayAnswers(){return state.db?.settings?.questionOfTheDayAnswers||{}}
function renderChildQuestionDay(k=dateKey(state.date)){
 const text=questionDayText(),el=$("childQuestionDayText"),status=$("childQuestionDayStatus");if(!el)return;
 el.textContent=text||DEFAULT_QUESTION_DAY;
 const s=questionDayStatuses()[k];status.textContent=s==="done"?`✅ +${questionDayPoints()} pkt`:s==="missed"?"🌱 Omówione z rodzicem":`🎯 Zdobądź ${questionDayPoints()} pkt`;
 status.classList.toggle("isDone",s==="done");status.classList.toggle("isMissed",s==="missed");
 const answer=questionDayAnswers()[k]||{};const wrap=$("childQuestionAnswerWrap"),field=$("childQuestionAnswer");if(wrap&&field){wrap.classList.toggle("hidden",!!answer.answer);if(answer.answer)field.value="";field.disabled=!!answer.answer;const msg=$("childQuestionAnswerStatus");if(msg)msg.textContent=answer.answer?"Odpowiedź wysłana do rodzica.":"Napisz swoją odpowiedź i wyślij ją rodzicowi.";const send=$("sendChildQuestionAnswer");if(send)send.disabled=!!answer.answer;}
}
async function saveQuestionDay(){
 if(!state.parentToken)return alert("Najpierw wejdź do panelu rodzica.");
 const input=$("questionDayInput"),value=input.value.trim(),points=Math.max(0,Math.round(Number($("questionDayPointsInput").value)||0));
 if(!value)return alert("Wpisz treść nowego pytania.");
 try{await req("/api/punktacja/parent/settings",{method:"POST",headers:{Authorization:"Bearer "+state.parentToken},body:JSON.stringify({questionOfTheDay:value,questionOfTheDayPoints:points})});state.db=await req("/api/punktacja");const saved=String(state.db?.settings?.questionOfTheDay||"").trim();if(saved!==value)throw new Error("Serwer nie potwierdził zapisania nowego pytania. Zapisano: "+(saved||"(brak pytania)"));input.value=saved;$("questionDayPointsInput").value=questionDayPoints();$("questionDaySaveMsg").textContent="Zapisano pytanie i punktację.";renderDailyParent();renderChildQuestionDay(dateKey(state.date));setTimeout(()=>{const el=$("questionDaySaveMsg");if(el)el.textContent=""},3500)}catch(e){$("questionDaySaveMsg").textContent="Błąd zapisu: "+e.message;alert("Nie udało się trwale zapisać pytania: "+e.message)}
}
async function setQuestionDayStatus(status){
 if(!state.parentToken)return;const k=dateKey(state.parentDate),map={...questionDayStatuses(),[k]:status};
 try{const j=await req("/api/punktacja/parent/settings",{method:"POST",headers:{Authorization:"Bearer "+state.parentToken},body:JSON.stringify({questionOfTheDayStatus:map})});state.db=j.data||j;renderDailyParent();renderChildQuestionDay(dateKey(state.date))}catch(e){alert("Nie udało się zapisać statusu pytania: "+e.message)}
}
function renderParentQuestionDay(){const text=questionDayText(),k=dateKey(state.parentDate),status=questionDayStatuses()[k],el=$("parentDayQuestion"),actions=$("parentDayQuestionActions");if(!el||!actions)return;el.textContent=text||DEFAULT_QUESTION_DAY;actions.classList.toggle("hidden",!text);actions.querySelectorAll("[data-question-status]").forEach(b=>{b.classList.toggle("onDone",status==="done"&&b.dataset.questionStatus==="done");b.classList.toggle("onMissed",status==="missed"&&b.dataset.questionStatus==="missed");b.onclick=()=>setQuestionDayStatus(b.dataset.questionStatus)});const answer=questionDayAnswers()[k]||{};const box=$("parentDayQuestionAnswer");if(box)box.innerHTML=answer.answer?`<div class="questionAnswerReceived"><b>✍️ Odpowiedź dziecka</b><p>${esc(answer.answer)}</p><small>${answer.submittedAt?new Date(answer.submittedAt).toLocaleString("pl-PL"):""}</small></div>`:"<p class='muted'>Dziecko nie wysłało jeszcze odpowiedzi na to pytanie.</p>";}
async function sendChildQuestionAnswer(){const field=$("childQuestionAnswer"),answer=field?.value.trim();if(!answer)return alert("Napisz najpierw odpowiedź.");try{const j=await req("/api/punktacja/question-answer",{method:"POST",body:JSON.stringify({date:dateKey(state.date),answer})});state.db=j.data||j;renderChildQuestionDay(dateKey(state.date));alert("Odpowiedź została wysłana do rodzica.");}catch(e){alert("Nie udało się wysłać odpowiedzi: "+e.message)}}

function renderChild(){const waiting=!activeGame();$("childWaiting").classList.toggle("hidden",!waiting);$("childActive").classList.toggle("hidden",waiting);if(waiting){const icon=$("childWaitingIcon"),title=$("childWaitingTitle"),text=$("childWaitingText"),dateEl=$("childWaitingDate");if(finishedGame()){icon.textContent="🏁";title.textContent="Gra została zakończona";text.textContent="Okres gry dobiegł końca. Wynik i historia zostały zachowane.";dateEl.textContent=state.db.settings.endDate?`Koniec gry: ${scheduleEndLabel()}`:""}else if(scheduledGame()){icon.textContent="⏳";title.textContent="Gra jest zaplanowana";text.textContent="Panel dziecka pojawi się automatycznie w wybranym dniu rozpoczęcia.";dateEl.textContent=`Start gry: ${scheduleStartLabel()}${state.db.settings.endDate?` • koniec: ${scheduleEndLabel()}`:" • bez daty końcowej"}`}else{icon.textContent="🌱";title.textContent="Gra jeszcze nie została uruchomiona";text.textContent="Rodzic najpierw przygotuje zasady gry. Gdy gra zostanie uruchomiona, Twój panel pojawi się tutaj.";dateEl.textContent=""}return;}const k=dateKey(state.date),r=rec(k),dp=dayPoints(k);renderChildConsequences();$("childDateTitle").textContent=state.date.toLocaleDateString("pl-PL",{weekday:"long",day:"numeric",month:"long",year:"numeric"});$("selectedDayLabel").textContent=state.date.toLocaleDateString("pl-PL",{day:"numeric",month:"long",year:"numeric"});$("dayPoints").textContent=dp>0?`+${dp}`:dp;$("selectedDayScore").textContent=(dp>0?"+":"")+dp+" pkt";renderCalendar("calendarGrid",state.date,d=>{state.date=d;renderChild()});
const tasks=(state.db.tasks||[]).filter(x=>x.active!==false);$("childTasks").innerHTML=tasks.length?tasks.map(t=>{const s=taskState(r,t.id);return `<div class="item ${s}"><span>${esc(t.icon||"📋")}</span><span class="name">${esc(t.name)}</span><span class="stateText">${s==="done"?"✅ wykonany":s==="missed"?"❌ niewykonany":"⏳ czeka na ocenę"}</span><span class="pts">${s==="done"?"+" : "0 "}${t.points}</span></div>`}).join(""):"<p class='muted'>Rodzic nie dodał jeszcze obowiązków.</p>";
const extras=(state.db.extras||[]).filter(x=>x.active!==false);$("childExtras").innerHTML=extras.length?extras.map(e=>`<div class="item ${r.extras?.[e.id]?"done":"pending"}"><span>${esc(e.icon||"⭐")}</span><span class="name">${esc(e.name)}</span><span class="stateText">${r.extras?.[e.id]?"✅ zaliczone":"⏳ czeka na ocenę"}</span><span class="pts">+${e.points}</span></div>`).join(""):"<p class='muted'>Brak czynności ekstra.</p>";renderChildQuestionDay(k);
const cs=(state.db.challenges||[]).filter(c=>c.active!==false&&k>=c.start&&k<=c.end);$("childChallenges").innerHTML=cs.length?cs.map(c=>{const bookMission=/^przeczytaj\s+ksi[aąż]k[ęe]/i.test(String(c.name||"").trim());const missionClass=bookMission?"bookMission":"";return `<div class="item ${challengeDone(c.id)?"done":"pending"} ${missionClass}"><span>🚀</span><span class="name"><b>${esc(c.name)}</b><small>${c.start} → ${c.end}</small></span><span class="stateText">${challengeDone(c.id)?"✅ zaliczone":"⏳ w toku"}</span><span class="pts">+${c.points}</span></div>`}).join(""):"<p class='muted'>Brak aktywnych misji w tym dniu.</p>";
renderChildStats();renderRafciaExpedition();renderRewards()}
function renderChildConsequences(){
 const el=$("childConsequences"); if(!el)return;
 const list=state.db.consequences||[];
 const bonuses=state.db.bonusPoints||[];const bonusEl=$("childBonusPoints");if(bonusEl)bonusEl.innerHTML=bonuses.length?bonuses.slice().reverse().map(x=>`<div class="childBonusPoint"><b>⭐ +${Number(x.points)||0} pkt</b><span>${esc(x.note||`Dodano ${Number(x.points)||0} punktów`)}</span><small>${new Date(x.createdAt||Date.now()).toLocaleString("pl-PL")}</small></div>`).join(""):"";
 const total=list.reduce((n,c)=>n+(Number(c.points)||0),0);
 const totalEl=$("consequenceTotal"); if(totalEl)totalEl.textContent=total;
 el.innerHTML=list.length?list.slice().reverse().map(c=>`<div class="childConsequence"><div class="childBomb">💣</div><div class="childConsequenceText"><b>${esc(c.reason)}</b><small>Konsekwencja karna • ${new Date(c.createdAt||Date.now()).toLocaleString("pl-PL")}</small></div><strong>−${c.points} pkt</strong></div>`).join(""):"<div class='childNoConsequences'>🌱 Brak konsekwencji karnych — tak trzymaj!</div>";
}
const rafciaTravelerLevels=[
 {days:5,name:"Latarka turystyczna",desc:"Każdy odkrywca musi umieć znaleźć drogę po zmroku. Przyda się w namiocie, lesie i podczas wieczornych wypraw.",type:"flashlight"},
 {days:10,name:"Kuchenka turystyczna",desc:"Ciepły posiłek nawet daleko od domu. Kuchenki używamy wyłącznie pod opieką dorosłego.",type:"stove"},
 {days:20,name:"Apteczka podróżnika",desc:"Prawdziwy podróżnik pamięta o bezpieczeństwie. Apteczka pomaga przygotować się na drobne niespodzianki w trasie.",type:"firstaid"},
 {days:35,name:"Lornetka turystyczna",desc:"Obserwuj ptaki, zwierzęta i odległe szczyty. Nie wszystko, co ciekawe, znajduje się tuż obok!",type:"binoculars"},
 {days:50,name:"Namiot wyprawowy",desc:"Własna baza wyprawowa! Czas zaplanować nocleg pod gwiazdami – oczywiście z dorosłym.",type:"tent"},
 {days:75,name:"Śpiwór turystyczny",desc:"Po długiej wędrówce trzeba odpocząć. Dobry śpiwór to podstawa wygodnego noclegu w terenie.",type:"sleepingbag"},
 {days:100,name:"Plecak wyprawowy",desc:"Wszystko, co potrzebne, możesz zabrać ze sobą. Przed Tobą coraz dłuższe i ciekawsze wyprawy!",type:"backpack"},
 {days:150,name:"Hamak z moskitierą",desc:"Wyprawowy luksus! Odpoczynek wśród drzew, z dala od zgiełku i komarów.",type:"hammock"},
 {days:200,name:"Nawigacja turystyczna",desc:"Dobry odkrywca potrafi zaplanować trasę i odnaleźć drogę. Zawsze wędruj z dorosłym.",type:"gps"},
 {days:300,name:"Zestaw energii słonecznej",desc:"Mała baza wyprawowa może korzystać z energii słońca. To sprzęt dla naprawdę doświadczonego podróżnika.",type:"solar"}
];
const rafciaMountainGoals=[
 {name:"Góra Kościuszki",continent:"Australia",height:"2 228 m",points:300,desc:"Najwyższy szczyt Australii kontynentalnej, nazwany na cześć polskiego bohatera Tadeusza Kościuszki. Leży w Górach Śnieżnych i prowadzą na niego popularne szlaki turystyczne. W wariancie obejmującym całą Oceanię najwyższym szczytem jest Puncak Jaya."},
 {name:"Masyw Vinsona",continent:"Antarktyda",height:"4 892 m",points:600,desc:"Najwyższy szczyt mroźnej Antarktydy. Leży w Górach Ellswortha, pośród ogromnych lodowych przestrzeni."},
 {name:"Elbrus",continent:"Europa",height:"5 642 m",points:1000,desc:"Potężny, wygasły wulkan w Kaukazie. Jego dwa wierzchołki przez większą część roku pokrywa śnieg."},
 {name:"Kilimandżaro",continent:"Afryka",height:"5 895 m",points:1600,desc:"Wielka, samotna góra w Tanzanii. U jej podnóża rosną tropikalne lasy, a wysoko na szczycie leży śnieg."},
 {name:"Denali",continent:"Ameryka Północna",height:"6 190 m",points:2500,desc:"Najwyższa góra Ameryki Północnej, położona na Alasce. Jej masyw wznosi się ponad dziką, rozległą krainą."},
 {name:"Aconcagua",continent:"Ameryka Południowa",height:"6 961 m",points:3800,desc:"Najwyższy szczyt obu Ameryk. Leży w argentyńskich Andach, niedaleko granicy z Chile."},
 {name:"Mount Everest",continent:"Azja",height:"8 849 m",points:7000,desc:"Najwyższa góra Ziemi, położona w Himalajach na granicy Nepalu i Chin. Wielki finał wyprawy Rafcia!"}
];
function rafciaPositiveLifetimePoints(){
 let n=0;const records=state.db?.records||{};
 for(const [k,r] of Object.entries(records)){
  for(const t of state.db.tasks||[])if(taskState(r,t.id)==="done")n+=Number(t.points)||0;
  for(const e of state.db.extras||[])if(r.extras?.[e.id])n+=Number(e.points)||0;
  for(const c of state.db.challenges||[])if(r.challenges?.[c.id])n+=Number(c.points)||0;
  if(questionDayStatuses()[k]==="done")n+=questionDayPoints();
 }
 for(const b of state.db.bonusPoints||[])n+=Math.max(0,Number(b.points)||0);
 return Math.max(0,Math.floor(n));
}
function rafciaPerfectDay(k){
 const tasks=(state.db?.tasks||[]).filter(t=>t.active!==false);if(!tasks.length)return false;
 const r=rec(k);return tasks.every(t=>taskState(r,t.id)==="done");
}
function rafciaStreakStats(){
 const start=state.db?.settings?.startDate||Object.keys(state.db?.records||{}).sort()[0];
 if(!start)return {current:0,best:0};
 const today=dateKey(new Date()),tasks=(state.db?.tasks||[]).filter(t=>t.active!==false);
 let cursor=parseDate(start),best=0,run=0;
 while(dateKey(cursor)<=today){const k=dateKey(cursor);if(rafciaPerfectDay(k)){run++;best=Math.max(best,run)}else run=0;cursor.setDate(cursor.getDate()+1)}
 // Dzień w trakcie realizacji nie przerywa serii, ale choć jedno oznaczenie „niewykonane” już ją przerywa.
 const todayRecord=rec(today),todayHasMissed=tasks.some(t=>taskState(todayRecord,t.id)==="missed");
 let anchor=parseDate(today);if(!rafciaPerfectDay(today))anchor.setDate(anchor.getDate()-1);
 let current=0;if(!todayHasMissed){while(dateKey(anchor)>=start&&rafciaPerfectDay(dateKey(anchor))){current++;anchor.setDate(anchor.getDate()-1)}}
 return {current,best};
}
function rafciaSvg(type){
 const common='viewBox="0 0 120 90" role="img" aria-hidden="true"';
 const art={
 flashlight:'<g transform="rotate(-28 60 45)"><rect x="22" y="35" width="70" height="22" rx="9" fill="#35566a" stroke="#203b4b" stroke-width="4"/><rect x="13" y="30" width="18" height="32" rx="5" fill="#e6a83f" stroke="#8c5b25" stroke-width="3"/><path d="M92 36 L111 28 L111 64 L92 56Z" fill="#f8d875" stroke="#9b6a2d" stroke-width="3"/><path d="M45 38v16M55 38v16M65 38v16" stroke="#8ca8b5" stroke-width="3"/></g>',
 stove:'<ellipse cx="60" cy="69" rx="38" ry="9" fill="#9b6a35"/><path d="M39 61L45 36H75L81 61Z" fill="#3f8291" stroke="#24515c" stroke-width="4"/><rect x="34" y="28" width="52" height="9" rx="4" fill="#e0a33c" stroke="#875a25" stroke-width="3"/><path d="M49 26q-8-15 3-20q-1 10 8 12q7-10 12-7q-2 12-9 15" fill="#f5a53a" stroke="#d46d2d" stroke-width="2"/>',
 firstaid:'<rect x="20" y="25" width="80" height="52" rx="10" fill="#d94b48" stroke="#943431" stroke-width="4"/><path d="M43 25v-8q0-7 8-7h18q8 0 8 7v8" fill="none" stroke="#943431" stroke-width="5"/><rect x="53" y="35" width="14" height="32" rx="2" fill="white"/><rect x="44" y="44" width="32" height="14" rx="2" fill="white"/>',
 binoculars:'<g fill="#3e6571" stroke="#203e49" stroke-width="4"><path d="M18 28q0-8 9-8h18q8 0 8 9v39q0 9-9 9H27q-9 0-9-9Z"/><path d="M67 29q0-9 8-9h18q9 0 9 8v40q0 9-9 9H76q-9 0-9-9Z"/></g><g fill="#f1c35b" stroke="#855b2d" stroke-width="3"><circle cx="36" cy="49" r="12"/><circle cx="84" cy="49" r="12"/></g><path d="M51 36h18v25H51Z" fill="#607d83" stroke="#203e49" stroke-width="3"/>',
 tent:'<path d="M10 73L58 12L110 73Z" fill="#d7a94f" stroke="#79522e" stroke-width="4"/><path d="M58 12L61 73H10Z" fill="#5c9270"/><path d="M61 73L77 45L95 73Z" fill="#385c49"/><path d="M58 12v61" stroke="#f2d38b" stroke-width="3"/>',
 sleepingbag:'<path d="M40 10q-22 8-22 35v20q0 16 18 16h48q18 0 18-16V45q0-27-22-35Z" fill="#547f9b" stroke="#294e65" stroke-width="4"/><path d="M35 18q25 15 50 0M28 38h64M28 55h64" fill="none" stroke="#b9d5dc" stroke-width="4"/><path d="M45 12q15 13 30 0" fill="#f0c56b" stroke="#94662e" stroke-width="3"/>',
 backpack:'<path d="M37 19q0-13 23-13t23 13v12H37Z" fill="#c78a45" stroke="#76502e" stroke-width="4"/><rect x="23" y="26" width="74" height="58" rx="18" fill="#b9783d" stroke="#76502e" stroke-width="4"/><rect x="39" y="48" width="42" height="28" rx="7" fill="#e0b16a" stroke="#76502e" stroke-width="3"/><path d="M48 52l12-9 12 9-12 10Z" fill="#4f8794"/><path d="M18 36q-8 17 2 35M102 36q8 17-2 35" fill="none" stroke="#76502e" stroke-width="6"/>',
 hammock:'<path d="M10 20L25 77M110 20L95 77" stroke="#6b5436" stroke-width="6"/><path d="M17 42Q60 82 103 42L94 60Q60 89 26 60Z" fill="#d66d63" stroke="#8e4541" stroke-width="4"/><path d="M20 44Q60 74 100 44" fill="none" stroke="#f5d18c" stroke-width="4"/>',
 gps:'<rect x="30" y="8" width="60" height="75" rx="12" fill="#455e64" stroke="#233b42" stroke-width="4"/><rect x="38" y="18" width="44" height="43" rx="5" fill="#b8d8c2" stroke="#203b40" stroke-width="3"/><path d="M44 51l12-17 8 10 10-14" fill="none" stroke="#397c63" stroke-width="4"/><circle cx="60" cy="72" r="5" fill="#e9ba53"/>',
 solar:'<rect x="12" y="24" width="96" height="52" rx="8" fill="#3e586c" stroke="#233d50" stroke-width="4"/><g fill="#77a9bd" stroke="#d6e7e8" stroke-width="2"><path d="M22 33h20v14H22ZM49 33h20v14H49ZM76 33h20v14H76ZM22 53h20v14H22ZM49 53h20v14H49ZM76 53h20v14H76Z"/></g><circle cx="60" cy="12" r="7" fill="#f5c44e"/>'
 };
 return `<svg ${common}>${art[type]||art.backpack}</svg>`;
}
function rafciaMountainArt(i,locked){
 const cols=[['#8fc3d8','#eff7f3'],['#91b9d0','#f6f6ed'],['#78a9b9','#f1f1e6'],['#86b6c4','#f8f5e8'],['#8bb5cb','#f7f5ec'],['#7097ad','#f7f5ed'],['#7898b7','#ffffff']][i];
 return `<svg viewBox="0 0 180 112" role="img" aria-label="Ilustracja górska"><defs><linearGradient id="sky${i}" x2="0" y2="1"><stop stop-color="${cols[0]}"/><stop offset="1" stop-color="#e8e3c9"/></linearGradient></defs><rect width="180" height="112" rx="12" fill="url(#sky${i})"/><circle cx="143" cy="25" r="12" fill="#f7d57b"/><path d="M0 91L48 29L75 61L106 14L180 95V112H0Z" fill="#688d78"/><path d="M48 29L34 48L49 43L58 51L75 61Z" fill="#f7f5e9"/><path d="M106 14L83 51L104 43L116 54L132 42L153 62Z" fill="#fffdf4"/><path d="M0 91Q40 75 77 91T180 88V112H0Z" fill="#4d7961"/>${locked?'<rect width="180" height="112" rx="12" fill="#d9d9d9" opacity=".58"/>':''}</svg>`;
}
function rafciaOpenDetail(kind,index){
 const item=kind==="gear"?rafciaTravelerLevels[index]:rafciaMountainGoals[index];if(!item)return;
 const unlocked=kind==="gear"?rafciaStreakStats().best>=item.days:rafciaPositiveLifetimePoints()>=item.points;if(!unlocked)return;
 const art=kind==="gear"?rafciaSvg(item.type):rafciaMountainArt(index,!unlocked);
 const modal=document.createElement("div");modal.className="rafciaExpeditionModal";modal.innerHTML=`<div class="rafciaExpeditionModalCard"><button class="expeditionModalClose" type="button" aria-label="Zamknij">×</button><div class="expeditionModalArt">${art}</div><span class="eyebrow">${kind==="gear"?`POZIOM PODRÓŻNIKA • ${item.days} DNI`:`${item.continent.toUpperCase()} • ${item.height}`}</span><h2>${esc(item.name)}</h2><p>${esc(item.desc)}</p><div class="expeditionModalStatus">${unlocked?`<strong>✓ ZDOBYTE!</strong>`:kind==="gear"?`Jeszcze ${Math.max(0,item.days-rafciaStreakStats().best)} dni do zdobycia`:`Jeszcze ${Math.max(0,item.points-rafciaPositiveLifetimePoints())} pkt do odkrycia`}</div></div>`;
 document.body.appendChild(modal);modal.addEventListener("click",e=>{if(e.target===modal||e.target.closest(".expeditionModalClose"))modal.remove()});
}
function rafciaMysteryArt(kind="gear"){
 if(kind==="gear") return `<svg viewBox="0 0 120 90" aria-hidden="true"><defs><linearGradient id="mysteryWood" x2="0" y2="1"><stop stop-color="#c98b45"/><stop offset="1" stop-color="#754522"/></linearGradient></defs><path d="M18 38h84v43H18z" fill="url(#mysteryWood)" stroke="#5f3b20" stroke-width="5"/><path d="M13 35q0-9 10-9h74q10 0 10 9v12H13z" fill="#e0ad5e" stroke="#704522" stroke-width="5"/><path d="M51 27h18v55H51z" fill="#f0cb7c" stroke="#80552c" stroke-width="3"/><rect x="51" y="45" width="18" height="15" rx="4" fill="#6c5133"/><text x="60" y="57" font-size="13" text-anchor="middle" fill="#ffe9b5">?</text></svg>`;
 return `<svg viewBox="0 0 180 112" aria-hidden="true"><rect width="180" height="112" rx="12" fill="#d9e2df"/><path d="M0 95L45 40l24 28 36-53 75 80v17H0z" fill="#849b94"/><path d="M105 15L87 49l18-8 13 12 15-12 18 20z" fill="#eef1e9"/><circle cx="90" cy="55" r="28" fill="#f6f0dc" opacity=".92"/><text x="90" y="68" font-size="38" font-weight="900" text-anchor="middle" fill="#687d78">?</text></svg>`;
}
function renderRafciaExpedition(){
 const host=$("rafciaExpeditionPanels");if(!host)return;
 const childName=String(state.db?.settings?.childName||"").trim();
 const heading=$("rafciaExpeditionTitle");if(heading)heading.textContent=childName?`Wielka Wyprawa ${childName}`:"Wielka Wyprawa";
 const streak=rafciaStreakStats(),points=rafciaPositiveLifetimePoints();
 const levelIndex=rafciaTravelerLevels.filter(x=>streak.best>=x.days).length;
 const currentLevel=levelIndex,nextGear=rafciaTravelerLevels[levelIndex]||null;
 const prevThreshold=levelIndex?rafciaTravelerLevels[levelIndex-1].days:0;
 const progress=nextGear?Math.max(0,Math.min(100,(streak.current-prevThreshold)/(nextGear.days-prevThreshold)*100)):100;
 const unlockedMountains=rafciaMountainGoals.filter(x=>points>=x.points).length;
 const nextMountain=rafciaMountainGoals[unlockedMountains]||null;
 const prevMountain=unlockedMountains?rafciaMountainGoals[unlockedMountains-1].points:0;
 const mountainProgress=nextMountain?Math.max(0,Math.min(100,(points-prevMountain)/(nextMountain.points-prevMountain)*100)):100;
 const gearCards=rafciaTravelerLevels.map((g,i)=>{const won=streak.best>=g.days;return `<button type="button" class="expeditionGearItem ${won?'is-earned':'is-locked'}" ${won?`data-expedition-kind="gear" data-expedition-index="${i}"`:'disabled aria-label="Tajemnicza nagroda"'}><span class="expeditionGearArt">${won?rafciaSvg(g.type):rafciaMysteryArt('gear')}</span><span class="expeditionGearName">${won?esc(g.name):'Tajemnicza nagroda'}</span><small>${won?'✓ W plecaku':`Zamknięta skrzynia • ${g.days} dni`}</small></button>`}).join("");
 const mountainCards=rafciaMountainGoals.map((m,i)=>{const won=points>=m.points;return `<button type="button" class="expeditionMountainItem ${won?'is-earned':'is-locked'}" ${won?`data-expedition-kind="mountain" data-expedition-index="${i}"`:'disabled aria-label="Nieodkryty szczyt"'}>${won?rafciaMountainArt(i,false):rafciaMysteryArt('mountain')}<b>${won?esc(m.name):'Nieodkryty szczyt'}</b><small>${won?`${esc(m.continent)} • ${m.height}`:'Tajemnica'}</small><span>${won?'✓ Pieczątka zdobyta':'???'}</span></button>`}).join("");
 const levelBadge=currentLevel?`<div class="travelerRankBadge earned"><span class="rankBadgeIcon">✦</span><small>ZDOBYTY TYTUŁ</small><strong>Poziom ${currentLevel}</strong><b>Podróżnik</b></div>`:`<div class="travelerRankBadge future"><span class="rankBadgeIcon">🧭</span><small>TWÓJ PIERWSZY CEL</small><strong>Przyszły</strong><b>Podróżnik</b><span class="rankBadgeHint">Twoja wyprawa czeka na start!</span></div>`;
 host.innerHTML=`<article class="expeditionPanel expeditionTraveler"><div class="expeditionPanelHead"><span class="expeditionPanelIcon">🎒</span><div><span class="eyebrow">REGULARNOŚĆ NAGRADZANA PRZYGODĄ</span><h3>Poziomy Podróżnika</h3><p>Wykonuj wszystkie obowiązki i zdobywaj sprzęt do wyprawy.</p></div></div><div class="expeditionLevelSummary"><div class="expeditionChest"><svg class="expeditionChestIcon" viewBox="0 0 96 76" role="img" aria-label="Skrzynia podróżnika"><defs><linearGradient id="chestWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c88a45"/><stop offset="1" stop-color="#8d542d"/></linearGradient><linearGradient id="chestGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe8a0"/><stop offset="1" stop-color="#c58b32"/></linearGradient></defs><path d="M13 29 Q13 13 29 10 H67 Q83 13 83 29 V35 H13Z" fill="#9a6336" stroke="#684326" stroke-width="3"/><path d="M17 29 Q17 17 30 15 H66 Q79 17 79 29Z" fill="url(#chestWood)" stroke="#e5b66e" stroke-width="2"/><rect x="10" y="30" width="76" height="37" rx="7" fill="url(#chestWood)" stroke="#684326" stroke-width="3"/><path d="M17 34 V63 M79 34 V63" stroke="#e8bd77" stroke-width="5" opacity=".9"/><path d="M10 43 H86 M10 57 H86" stroke="#704629" stroke-width="2" opacity=".75"/><rect x="41" y="34" width="14" height="24" rx="4" fill="url(#chestGold)" stroke="#805522" stroke-width="2"/><path d="M44 36 V31 Q48 23 52 31 V36" fill="none" stroke="#f8dfa0" stroke-width="4" stroke-linecap="round"/><circle cx="48" cy="45" r="2.5" fill="#704629"/><path d="M19 68 H77" stroke="#704629" stroke-width="4" stroke-linecap="round"/></svg><small>${currentLevel?'PLECAK RAFCIA':'TAJEMNICZA SKRZYNIA'}</small></div><div class="expeditionLevelText">${levelBadge}<span>Najdłuższa seria: ${streak.best} dni</span></div></div><div class="expeditionProgressTitle"><b>${nextGear?'Do kolejnej skrzyni':'Wszystkie skrzynie zdobyte!'}</b><strong>${nextGear?`${Math.max(0,nextGear.days-streak.current)} dni`:'BRAWO!'}</strong></div><div class="expeditionProgress"><i style="width:${progress}%"></i></div><small class="expeditionProgressFoot">${nextGear?`${streak.current} / ${nextGear.days} dni aktualnej serii`:'Ukończono całą kolekcję sprzętu'}</small><div class="expeditionCollectionHead"><b>🎒 Plecak Rafcia</b><span>${levelIndex} / ${rafciaTravelerLevels.length} przedmiotów</span></div><div class="expeditionGearGrid">${gearCards}</div><div class="expeditionPanelFoot">Każda zdobyta rzecz zostaje w Twoim plecaku na zawsze. Zawartość kolejnych skrzyń jest tajemnicą!</div></article>
 <article class="expeditionPanel expeditionPassport"><div class="expeditionPanelHead"><span class="expeditionPanelIcon">📖</span><div><span class="eyebrow">WIELKIE SZCZYTY ŚWIATA</span><h3>Paszport Odkrywcy</h3><p>Zdobywaj punkty i zbieraj pieczątki z najwyższych gór kontynentów.</p></div></div><div class="expeditionPassportSummary"><div class="expeditionPassportBook">${unlockedMountains?rafciaMountainArt(unlockedMountains-1,false):rafciaMysteryArt('mountain')}<span>✦ PASZPORT ODKRYWCY ✦</span></div><div class="expeditionMountainGoal"><small>NAJBLIŻSZE ODKRYCIE</small><strong>${nextMountain?'Tajemniczy szczyt':'Wyprawa ukończona!'}</strong><span>${nextMountain?'Nazwa i położenie czekają na odkrycie.':'Zdobyłeś wszystkie kontynenty!'}</span><b>${nextMountain?`${Math.max(0,nextMountain.points-points).toLocaleString('pl-PL')} pkt do odkrycia`:'7 / 7 szczytów'}</b><div class="expeditionProgress blue"><i style="width:${mountainProgress}%"></i></div><small>${points.toLocaleString('pl-PL')} / ${nextMountain?nextMountain.points.toLocaleString('pl-PL'):'7 000'} pkt</small></div></div><div class="expeditionCollectionHead"><b>🗺️ Twoje zdobyte szczyty</b><span>${unlockedMountains} / 7</span></div><div class="expeditionMountainGrid">${mountainCards}</div><div class="expeditionPanelFoot">Każdy szczyt odkryjesz dopiero po zdobyciu wymaganej liczby punktów. Ostatnia tajemnica czeka na 7 000 pkt!</div></article>`;
 host.querySelectorAll("[data-expedition-kind]").forEach(b=>b.addEventListener("click",()=>rafciaOpenDetail(b.dataset.expeditionKind,Number(b.dataset.expeditionIndex))));
}
function renderChildStats(){
  const total=totalPoints();
  $("totalPoints").textContent=total;
  const todayKey=dateKey(state.date);
  const todayRecord=rec(todayKey);
  const activeTasks=(state.db.tasks||[]).filter(x=>x.active!==false);
  const taskTotal=activeTasks.length;
  const taskDone=activeTasks.filter(t=>taskState(todayRecord,t.id)==="done").length;
  const goalPercent=taskTotal?Math.round(taskDone/taskTotal*100):0;
  $("completion").textContent=goalPercent+"%";
  let days=0;
  for(const r of Object.values(state.db.records||{})){
    const touched=Object.values(r.tasks||{}).some(v=>v===true||v==="done"||v===false||v==="missed");
    if(touched)days++;
  }
  $("streak").textContent=days;
  const thresholds=(state.db.rewards||[]).filter(x=>x.active!==false).map(x=>+x.cost).filter(x=>x>total).sort((a,b)=>a-b);
  $("rewardHint").textContent=thresholds.length?thresholds[0]-total+" pkt":"0 pkt";
  const goalPercentEl=$("goalPercent"); if(goalPercentEl)goalPercentEl.textContent=goalPercent+"%";
  const goalRing=$("goalPercent")?.parentElement;
  if(goalRing)goalRing.style.background=`conic-gradient(#158af0 ${goalPercent*3.6}deg,#dceaf2 ${goalPercent*3.6}deg)`;
  const goalBar=$("goalBar"); if(goalBar)goalBar.style.width=goalPercent+"%";
  const todayPoints=dayPoints(todayKey);
  const goalPointsText=$("goalPointsText"); if(goalPointsText)goalPointsText.textContent=(todayPoints>0?"+":"")+todayPoints+" pkt";
  const streakBig=$("streakBig"); if(streakBig)streakBig.textContent=days;
  const goalMessage=document.querySelector(".goalMessage");
  if(goalMessage){
    goalMessage.textContent=goalPercent>=100?"🎉 Wszystkie obowiązki wykonane! Świetna robota!":goalPercent>=50?"💪 Jesteś już w połowie drogi!":"🐱 Każde zaliczone zadanie przybliża Cię do celu.";
  }
  renderChart($("miniChart"));
}
function renderChart(el){
 if(!el)return;
 // V10.78: nowa, mobilna droga nagród z interaktywnymi kartami; desktop pozostaje bez zmian.
 if(window.matchMedia('(max-width: 700px)').matches){
   const total=totalPoints();
   const rewards=(state.db.rewards||[]).filter(r=>r.active!==false).slice().sort((a,b)=>(Number(a.cost)||0)-(Number(b.cost)||0));
   el.classList.add('rewardRoadChart','rewardRoadMobileV78');
   if(!rewards.length){el.innerHTML="<div class='roadEmpty'><span>🗺️</span><b>Twoja przygoda zacznie się tutaj!</b><small>Rodzic nie ustalił jeszcze nagród.</small></div>";return;}
   const positions=[{x:43,y:76},{x:30,y:66},{x:69,y:60},{x:33,y:50},{x:69,y:40},{x:56,y:30},{x:69,y:20},{x:81,y:14}];
   const nodes=rewards.map((r,i)=>{
     const cost=Number(r.cost)||0,missing=Math.max(0,cost-total),done=total>=cost;
     const pending=(state.db.redemptions||[]).some(x=>x.rewardId===r.id&&x.status==='pending');
     const pt=positions[i]||{x:i%2?30:68,y:Math.max(7,86-i*10)};
     return `<div class="v78RewardNode ${done?'isDone':''} ${pending?'isPending':''}" role="button" tabindex="0" style="--x:${pt.x}%;--y:${pt.y}%" data-road-reward="${esc(r.id)}" data-reward-ready="${done&&!pending?'1':'0'}" aria-expanded="false" aria-label="${esc(r.name)}, ${cost} punktów. Dotknij, aby zobaczyć szczegóły"><span class="v78RewardIcon">${esc(r.icon||'🎁')}</span><span class="v78RewardText"><b>${esc(r.name)}</b><small>${cost} pkt</small><span class="v78RewardBar"><i style="width:${Math.min(100,Math.max(0,total/Math.max(1,cost)*100))}%"></i></span><em>${pending?'⏳ Prośba wysłana':done?'🎁 Nagroda gotowa do odebrania':'Jeszcze '+missing+' pkt'}</em>${done&&!pending?`<button type="button" class="v78RedeemBtn" data-redeem-reward="${esc(r.id)}">Poproś o nagrodę</button>`:''}</span><span class="v79MiniProgress">${done&&!pending?'🎁 Odbierz!':Math.min(total,cost)+'/'+cost}</span></div>`;
   }).join('');
   const next=rewards.find(r=>Number(r.cost)>total),nextCost=next?Number(next.cost):Math.max(1,...rewards.map(r=>Number(r.cost)||0)),missing=next?Math.max(0,nextCost-total):0;
   el.innerHTML=`<div class="roadScene v78MobileScene"><div class="v78MapTop"><span>⭐ ${total} pkt</span></div><div class="v78Path" aria-hidden="true"></div><div class="v78StartMarker">🚶‍♂️ 🐈‍⬛<small>Start!</small></div>${nodes}<div class="v78GoalBar"><b>${next?'Jeszcze '+missing+' pkt':'Wszystkie nagrody odblokowane!'}</b><div class="v78GoalTrack"><i style="width:${Math.min(100,total/Math.max(1,nextCost)*100)}%"></i></div><small>${next?'Następna: '+esc(next.name):'Możesz poprosić o nagrodę'}</small></div></div>`;
   let v78DescriptionTimer=null;
   el.querySelectorAll('[data-road-reward]').forEach(node=>{const toggle=()=>{if(v78DescriptionTimer)clearTimeout(v78DescriptionTimer);el.querySelectorAll('.v78RewardNode.isExpanded').forEach(x=>{x.classList.remove('isExpanded');x.setAttribute('aria-expanded','false')});node.classList.add('isExpanded');node.setAttribute('aria-expanded','true');v78DescriptionTimer=setTimeout(()=>{if(node.isConnected){node.classList.remove('isExpanded');node.setAttribute('aria-expanded','false')}},4000)};node.addEventListener('click',e=>{if(e.target.closest('[data-redeem-reward]'))return;toggle()});node.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target===node){e.preventDefault();toggle()}})});el.querySelectorAll('[data-redeem-reward]').forEach(btn=>btn.addEventListener('click',async e=>{e.stopPropagation();if(v78DescriptionTimer)clearTimeout(v78DescriptionTimer);try{const j=await req('/api/punktacja/reward-request',{method:'POST',body:JSON.stringify({rewardId:btn.dataset.redeemReward})});state.db=j.data||j;renderChildStats();renderRewards();renderChart(el)}catch(err){alert(err.message)}}));
   return;
 }

 // V10.49 — karty nagród ustawione nad ikonami, równomiernie wzdłuż szlaku. 
 if(!el)return;
 const total=totalPoints();
 const rewards=(state.db.rewards||[]).filter(r=>r.active!==false).slice().sort((a,b)=>(Number(a.cost)||0)-(Number(b.cost)||0));
 el.classList.add("rewardRoadChart");
 if(!rewards.length){el.innerHTML="<div class='roadEmpty'><span>🗺️</span><b>Twoja przygoda zacznie się tutaj!</b><small>Rodzic nie ustalił jeszcze nagród.</small></div>";return}
 const max=Math.max(1,...rewards.map(r=>Number(r.cost)||0));
 const pct=Math.max(0,Math.min(100,total/max*100));
 // V10.46: oddzielne, ręcznie dopasowane współrzędne markerów i kart.
 // Dzięki temu karty nie są zakotwiczone na środku medalionu i nie nachodzą na sąsiednie.
 const scenicStops=[
   // Środki medalionów na bitmapie, od początku szlaku do szczytu.
   {x:24,y:80}, {x:35,y:68}, {x:51,y:57}, {x:62,y:47},
   {x:69,y:42}, {x:77,y:36}, {x:83,y:24}, {x:92,y:18}
 ];
 const cardSpots=[
   // Karty wyśrodkowane nad właściwymi medalionami; pierwsze dwie nie wchodzą na chłopca.
   // Przy szczycie kolejne karty są rozdzielone także w pionie.
   {x:26,y:64}, {x:35,y:52}, {x:51,y:41}, {x:62,y:31},
   {x:73,y:25}, {x:77,y:17}, {x:82,y:12}, {x:92,y:8}
 ];
 const points=rewards.map((r,i)=>{
   if(rewards.length===1)return scenicStops[0];
   if(i<scenicStops.length)return scenicStops[i];
   const t=i/(rewards.length-1)*(scenicStops.length-1),lo=Math.floor(t),hi=Math.min(scenicStops.length-1,lo+1),f=t-lo;
   return {x:scenicStops[lo].x+(scenicStops[hi].x-scenicStops[lo].x)*f,y:scenicStops[lo].y+(scenicStops[hi].y-scenicStops[lo].y)*f};
 });
 const roadNodes=rewards.map((r,i)=>{
   const pt=points[i], card=cardSpots[Math.min(i,cardSpots.length-1)], cost=Number(r.cost)||0, done=total>=cost;
   const pending=(state.db.redemptions||[]).some(x=>x.rewardId===r.id&&x.status==="pending");
   const missing=Math.max(0,cost-total);
   const marker = esc(r.icon||'🎁');
   return `<div class="roadStopMarker roadStopMarker-${i} ${done?'reached':''} ${pending?'pending':''}" style="--marker-x:${pt.x}%;--marker-y:${pt.y}%;left:${pt.x}%;top:${pt.y}%"><span class="roadStopDot" title="${esc(r.name)} — ${cost} pkt" aria-label="${esc(r.name)} — ${cost} punktów; ${done?'nagroda zdobyta':pending?'prośba oczekuje na rodzica':'nagroda zablokowana'}">${marker}</span></div>
      <div class="roadRewardCard roadRewardCard-${i}" style="--card-x:${card.x}%;--card-y:${card.y}%;--marker-x:${pt.x}%;--marker-y:${pt.y}%;left:${card.x}%;top:${card.y}%"><div class="roadRewardIcon">${esc(r.icon||'🎁')}</div><div class="roadRewardInfo"><b>${esc(r.name)}</b><small>${cost} pkt</small></div>
      <button type="button" data-road-reward="${esc(r.id)}" ${!done||pending?'disabled':''}>${pending?'⏳ Czeka na rodzica':done?'🎁 Odbierz nagrodę':'Jeszcze '+missing+' pkt'}</button></div>`;
 }).join('');
 const next=rewards.find(r=>Number(r.cost)>total);
 const nextCost=next?Number(next.cost):max;
 const progress=next?Math.min(100,Math.max(0,total/Math.max(1,nextCost)*100)):100;
 const missing=next?Math.max(0,nextCost-total):0;
 const earned=rewards.filter(r=>(Number(r.cost)||0)<=total).length;
 const settings=state.db.settings||{};
 const startDate=settings.startDate||"";
 const daysPlayed=startDate?Math.max(1,Math.floor((new Date(dateKey(new Date()))-new Date(startDate+"T00:00:00"))/86400000)+1):0;
 // Tło bitmapowe zawiera już sam szlak i medaliony — nie rysujemy na nim drugiej drogi.
 el.innerHTML=`<div class="roadScene bitmapRewardScene">
   <div class="roadTotal"><span>⭐</span><div><small>Twoje punkty</small><b>${total}</b></div></div>
   ${roadNodes}
   <div class="roadProgressPanel">
     <div class="roadProgressHeading"><b>${next?'Do następnej nagrody':'Wszystkie nagrody odblokowane!'}</b><strong>${next?missing+' pkt do celu':'Brawo!'}</strong></div>
     <div class="roadProgressBar"><i style="width:${progress}%"></i></div>
     <div class="roadProgressFoot"><span>${total} / ${nextCost} pkt</span><span>${next?`Następna: ${esc(next.name)}`:'Możesz poprosić o dostępną nagrodę'}</span></div>
     <div class="roadMiniStats">
       <div class="roadMiniStat"><span>🏆</span><small>Zdobyte nagrody</small><b>${earned}/${rewards.length}</b></div>
       <div class="roadMiniStat"><span>📅</span><small>Dni gry</small><b>${daysPlayed}</b></div>
       <div class="roadMiniStat"><span>⭐</span><small>Twoje punkty</small><b>${total}</b></div>
     </div>
   </div>
 </div>`;
 el.querySelectorAll("[data-road-reward]").forEach(b=>b.onclick=async()=>{try{const j=await req("/api/punktacja/reward-request",{method:"POST",body:JSON.stringify({rewardId:b.dataset.roadReward})});state.db=j.data||j;renderChildStats();renderRewards();renderChart(el)}catch(e){alert(e.message)}})
}
function renderRewards(){const total=totalPoints();$("rewardsList").innerHTML=(state.db.rewards||[]).filter(x=>x.active!==false).slice().sort((a,b)=>(+a.cost)-(+b.cost)).map(r=>{const cost=+r.cost,pct=Math.min(100,Math.max(0,Math.round(total/cost*100))),missing=Math.max(0,cost-total),enough=total>=cost,pending=(state.db.redemptions||[]).some(x=>x.rewardId===r.id&&x.status==="pending");return `<div class="reward"><div class="rewardIcon">${esc(r.icon||"🎁")}</div><strong>${esc(r.name)}</strong><small>${cost} pkt</small><div class="bar"><i style="width:${pct}%"></i></div><small>${enough?"🎉 Nagroda odblokowana!":"Brakuje "+missing+" pkt"}</small><button type="button" data-reward="${r.id}" ${!enough||pending?"disabled":""}>${pending?"Czeka na rodzica":enough?"Poproś o nagrodę":"Zbieraj dalej"}</button></div>`}).join("")||"<p class='muted'>Rodzic nie dodał jeszcze nagród.</p>";document.querySelectorAll("[data-reward]").forEach(b=>b.onclick=async()=>{try{const j=await req("/api/punktacja/reward-request",{method:"POST",body:JSON.stringify({rewardId:b.dataset.reward})});state.db=j.data||j;renderChild()}catch(e){alert(e.message)}})}
function rows(arr,type){return (arr||[]).filter(x=>x.active!==false).map(x=>`<div class="manageRow"><span class="manageIcon">${esc(x.icon||"🚀")}</span><span class="grow"><b>${esc(x.name)}</b>${type==="challenge"?`<small>${x.start} → ${x.end}</small>`:""}</span><strong>${x.points||x.cost} pkt</strong><button class="delete" type="button" data-del="${type}:${x.id}">🗑</button></div>`).join("")||"<p class='muted empty'>Nie dodano jeszcze żadnych pozycji. Kliknij „＋” aby dodać pierwszą.</p>"}
function renderManagement(){$("parentTasks").innerHTML=rows(state.db.tasks,"task");$("parentExtras").innerHTML=rows(state.db.extras,"extra");$("parentRewards").innerHTML=rows(state.db.rewards,"reward");$("parentChallenges").innerHTML=rows(state.db.challenges,"challenge");const missionBtn=document.querySelector("[data-open-add=challenge]");const todayKey=dateKey(new Date());const activeMissionCount=(state.db.challenges||[]).filter(x=>x.active!==false&&x.end>=todayKey).length;if(missionBtn){missionBtn.disabled=activeMissionCount>=5;missionBtn.title=activeMissionCount>=5?"Można zaplanować maksymalnie 5 misji jednocześnie":"Możesz zaplanować do 5 misji";}let missionNote=$("missionLimitNote");if(!missionNote&&missionBtn){missionNote=document.createElement("p");missionNote.id="missionLimitNote";missionNote.className="missionLimitNote";missionBtn.parentElement.after(missionNote)}if(missionNote)missionNote.textContent=`Zaplanowane misje: ${activeMissionCount}/5. Kolor każdej misji jest stały w kalendarzu.`;document.querySelectorAll("[data-del]").forEach(b=>b.onclick=async()=>{if(!confirm("Usunąć ten element?"))return;const [kind,id]=b.dataset.del.split(":");try{const j=await req("/api/punktacja/parent/delete",{method:"POST",headers:{Authorization:"Bearer "+state.parentToken},body:JSON.stringify({kind,id})});state.db=j.data||j;renderParent()}catch(e){alert(e.message)}})}
function renderConfigConsequences(){
 const el=$("configConsequences");if(!el)return;
 const list=state.db.consequences||[];
 el.innerHTML=list.length?list.slice().reverse().map(c=>`<div class="consequenceManageRow"><span class="bombIcon">💣</span><span class="grow"><b>${esc(c.reason)}</b><small>${new Date(c.createdAt||Date.now()).toLocaleString("pl-PL")}</small></span><strong>−${c.points} pkt</strong><button class="editConsequenceBtn" type="button" data-edit-consequence="${esc(c.id)}">✏️ Edytuj</button><button class="delete consequenceDelete" type="button" data-delete-consequence="${esc(c.id)}">🗑 Usuń</button></div>`).join(""):"<p class='muted empty'>Brak konsekwencji karnych w tej grze.</p>";
 el.querySelectorAll("[data-edit-consequence]").forEach(b=>b.onclick=async()=>{
  const c=(state.db.consequences||[]).find(x=>String(x.id)===b.dataset.editConsequence);if(!c)return;
  const reason=prompt("Zmień opis konsekwencji:",c.reason);if(reason===null)return;
  const pointsRaw=prompt("Ile punktów odjąć?",String(c.points));if(pointsRaw===null)return;
  const points=Number(pointsRaw);if(!reason.trim()||!Number.isFinite(points)||points<=0)return alert("Wpisz opis i liczbę punktów większą od zera.");
  try{const j=await req("/api/punktacja/parent/consequence/edit",{method:"POST",headers:{Authorization:"Bearer "+state.parentToken},body:JSON.stringify({id:c.id,reason:reason.trim(),points:Math.round(points)})});state.db=j.data||j;renderConfigConsequences();renderParentConsequences()}
  catch(e){alert("Nie udało się edytować konsekwencji. Sprawdź trasę /api/punktacja/parent/consequence/edit w serwerze: "+e.message)}
 });
 renderParentBonuses();
 el.querySelectorAll("[data-delete-consequence]").forEach(b=>b.onclick=async()=>{
  const c=(state.db.consequences||[]).find(x=>String(x.id)===b.dataset.deleteConsequence);if(!c)return;
  if(!confirm(`Usunąć konsekwencję „${c.reason}” i przywrócić ${c.points} pkt?`))return;
  try{const j=await req("/api/punktacja/parent/delete",{method:"POST",headers:{Authorization:"Bearer "+state.parentToken},body:JSON.stringify({kind:"consequence",id:c.id})});state.db=j.data||j;renderConfigConsequences();renderParentConsequences();renderDailyParent()}
  catch(e){alert("Nie udało się usunąć konsekwencji. Serwer musi obsługiwać kind=consequence: "+e.message)}
 });
}
function renderParent(){if(!state.parentToken){$("parentPin").classList.remove("hidden");$("parentPanel").classList.add("hidden");return}$("parentPin").classList.add("hidden");$("parentPanel").classList.remove("hidden");if(activeGame()&&state.inConfig){$("setupPanel").classList.remove("hidden");$("dailyPanel").classList.add("hidden");renderManagement();renderConfigConsequences();renderConfigCalendar();if($("questionDayInput")&&document.activeElement!==$("questionDayInput"))$("questionDayInput").value=questionDayText();if($("questionDayPointsInput")&&document.activeElement!==$("questionDayPointsInput"))$("questionDayPointsInput").value=questionDayPoints()}else if(activeGame()){$("setupPanel").classList.add("hidden");$("dailyPanel").classList.remove("hidden");renderDailyParent()}else{$("setupPanel").classList.remove("hidden");$("dailyPanel").classList.add("hidden");renderManagement();renderConfigConsequences();renderConfigCalendar();if($("questionDayInput")&&document.activeElement!==$("questionDayInput"))$("questionDayInput").value=questionDayText();if($("questionDayPointsInput")&&document.activeElement!==$("questionDayPointsInput"))$("questionDayPointsInput").value=questionDayPoints()}renderConfigMode();syncParentDailyToolbar()}
function renderDailyParent(){
 const k=dateKey(state.parentDate),r=rec(k);
 $("parentDayTitle").textContent=fmtDate(state.parentDate);$("parentDayPoints").textContent=dayPoints(k);
 renderCalendar("pCalendar",state.parentDate,d=>{state.parentDate=d;renderDailyParent()});
 const taskHtml=(state.db.tasks||[]).filter(x=>x.active!==false).map(t=>{
   const s=taskState(r,t.id); const doneCls=s==="done"?"onDone":""; const missedCls=s==="missed"?"onMissed":""; const pendingCls=s==="pending"?"onPending":"";
   return `<div class="dayRow"><div class="grow"><b>${esc(t.icon||"📋")} ${esc(t.name)}</b><small>${t.points} pkt</small></div><div class="seg"><button type="button" class="${doneCls}" data-dayaction="task:${t.id}:done">✅ Wykonany</button><button type="button" class="${missedCls}" data-dayaction="task:${t.id}:missed">❌ Niewykonany</button><button type="button" class="${pendingCls}" data-dayaction="task:${t.id}:pending">⏳ Nie rozliczono</button></div></div>`;
 }).join("");
 $("parentDayTasks").innerHTML=taskHtml||"<p class='muted'>Brak obowiązków.</p>";
 const extraHtml=(state.db.extras||[]).filter(x=>x.active!==false).map(e=>{
   const on=!!r.extras?.[e.id]; const cls=on?"onDone":""; const status=on?"off":"done"; const label=on?"↩ Cofnij":"✅ Zaliczone";
   return `<div class="dayRow"><div class="grow"><b>${esc(e.icon||"⭐")} ${esc(e.name)}</b><small>+${e.points} pkt</small></div><div class="seg"><button type="button" class="${cls}" data-dayaction="extra:${e.id}:${status}">${label}</button></div></div>`;
 }).join("");
 $("parentDayExtras").innerHTML=extraHtml||"<p class='muted'>Brak czynności ekstra.</p>";
 renderParentQuestionDay();
 const cs=(state.db.challenges||[]).filter(c=>c.active!==false&&k>=c.start&&k<=c.end);
 $("parentDayChallenges").innerHTML=cs.length?cs.map(c=>{
   const on=!!r.challenges?.[c.id]; const cls=on?"onDone":""; const label=on?"✅ Zaliczone":"🏁 Zaliczone";
   return `<div class="dayRow"><div class="grow"><b>🚀 ${esc(c.name)}</b><small>${c.start} → ${c.end} • +${c.points} pkt</small></div><div class="seg"><button type="button" class="${cls}" data-dayaction="challenge:${c.id}:done">${label}</button></div></div>`;
 }).join(""):"<p class='muted'>Brak aktywnych misji.</p>";
 bindDayActions();renderPendingRewards();renderParentBonuses();
}
function renderParentBonuses(){const el=$("parentBonusHistory");if(!el)return;const a=state.db.bonusPoints||[];el.innerHTML=a.length?a.slice().reverse().map(x=>`<div class="consequenceManageRow"><span class="bombIcon">⭐</span><span class="grow"><b>${Number(x.points)||0} pkt</b><small>${esc(x.note||"Dodano punkty")} • ${new Date(x.createdAt||Date.now()).toLocaleString("pl-PL")}</small></span><strong>+${Number(x.points)||0} pkt</strong></div>`).join(""):"<p class='muted empty'>Nie dodano dodatkowych punktów.</p>";}
async function addBonusPoints(e){e.preventDefault();const points=Number($("bonusPointsAmount").value),note=$("bonusPointsNote").value.trim();if(!Number.isInteger(points)||points<=0)return alert("Wpisz liczbę punktów większą od zera.");try{const j=await req("/api/punktacja/parent/bonus",{method:"POST",headers:{Authorization:"Bearer "+state.parentToken},body:JSON.stringify({points,note})});state.db=j.data||j;rafciaQueueWow(points);$("bonusPointsAmount").value="";$("bonusPointsNote").value="";renderDailyParent();renderChildConsequences();renderParentBonuses();}catch(err){alert("Nie udało się dodać punktów: "+err.message)}}
function renderParentConsequences(){
 const el=$("parentConsequences"); if(!el)return;
 const list=state.db.consequences||[];
 el.innerHTML=list.length?list.slice().reverse().map(c=>`<div class="consequenceManageRow"><span class="bombIcon">💣</span><span class="grow"><b>${esc(c.reason)}</b><small>${new Date(c.createdAt||Date.now()).toLocaleString("pl-PL")}</small></span><strong>−${c.points} pkt</strong></div>`).join(""):"<p class='muted empty'>Brak konsekwencji karnych w tej grze.</p>";
}

function bindDayActions(){document.querySelectorAll("[data-dayaction]").forEach(b=>b.onclick=async()=>{const [kind,id,status]=b.dataset.dayaction.split(":");try{const before=totalPoints();const j=await req("/api/punktacja/parent/day",{method:"POST",headers:{Authorization:"Bearer "+state.parentToken},body:JSON.stringify({date:dateKey(state.parentDate),kind,id,status})});state.db=j.data||j;const after=totalPoints();if(after>before)rafciaQueueWow(after-before);renderDailyParent()}catch(e){alert(e.message)}})}
function renderPendingRewards(){
 const all=state.db.redemptions||[];
 const pending=all.filter(x=>x.status==="pending");
 $("pendingRewards").innerHTML=pending.length?pending.map(x=>`<div class="dayRow"><b>🎁 ${esc(x.rewardName||x.rewardId)}</b><small>${x.cost} pkt • prośba dziecka</small><div class="seg"><button type="button" class="onDone" data-reward-action="${esc(x.id)}:approve">✅ Przyznaj</button><button type="button" class="onMissed" data-reward-action="${esc(x.id)}:reject">❌ Odrzuć</button></div></div>`).join(""):"<p class='muted'>Brak oczekujących próśb.</p>";
 const used=all.filter(x=>x.status==="approved"||x.status==="reversed").slice().sort((a,b)=>String(b.approvedAt||b.requestedAt||"").localeCompare(String(a.approvedAt||a.requestedAt||"")));
 const usedEl=$("usedRewards");
 if(usedEl) usedEl.innerHTML=used.length?used.map(x=>{
   const reversed=x.status==="reversed";
   const when=x.approvedAt?new Date(x.approvedAt).toLocaleString("pl-PL"):"";
   return `<div class="dayRow usedRewardRow"><div class="grow"><b>🎁 ${esc(x.rewardName||x.rewardId)}</b><small>${Number(x.cost)||0} pkt • ${reversed?"cofnięto wykorzystanie":"wykorzystano"}${when?" • "+esc(when):""}</small></div>${reversed?`<span class="usedRewardBadge">↩ Cofnięto</span>`:`<button type="button" class="onMissed" data-reward-reverse="${esc(x.id)}">↩ Cofnij wykorzystanie</button>`}</div>`;
 }).join(""):"<p class='muted'>Nie wykorzystano jeszcze żadnej nagrody w tej grze.</p>";
 document.querySelectorAll("[data-reward-action]").forEach(b=>b.onclick=async()=>{const [id,action]=b.dataset.rewardAction.split(":");try{const j=await req("/api/punktacja/parent/reward",{method:"POST",headers:{Authorization:"Bearer "+state.parentToken},body:JSON.stringify({id,action})});state.db=j.data||j;renderDailyParent()}catch(e){alert(e.message)}});
 document.querySelectorAll("[data-reward-reverse]").forEach(b=>b.onclick=async()=>{
   const item=all.find(x=>x.id===b.dataset.rewardReverse); if(!item)return;
   if(!confirm(`Cofnąć wykorzystanie nagrody „${item.rewardName||"nagroda"}”? ${Number(item.cost)||0} pkt wróci na konto dziecka.`))return;
   b.disabled=true;
   try{const j=await req("/api/punktacja/parent/reward-reverse",{method:"POST",headers:{Authorization:"Bearer "+state.parentToken},body:JSON.stringify({id:item.id})});state.db=j.data||j;renderDailyParent()}
   catch(e){alert(e.message);b.disabled=false}
 });
}
async function add(kind,item){
  if(!state.parentToken){
    alert("Najpierw wejdź do panelu rodzica.");
    return false;
  }

  const payload={
    kind,
    type:kind,
    item,
    name:item?.name||"",
    points:item?.points,
    cost:item?.cost,
    icon:item?.icon||"",
    start:item?.start||"",
    end:item?.end||""
  };

  if(!payload.name.trim()){
    alert("Podaj nazwę.");
    return false;
  }

  if(kind!=="reward" && !(Number(payload.points)>0)){
    alert("Podaj liczbę punktów większą od 0.");
    return false;
  }

  if(kind==="reward" && !(Number(payload.cost)>0)){
    alert("Podaj próg punktowy większy od 0.");
    return false;
  }
  if(kind==="challenge"){
    if(!item.start||!item.end||item.end<item.start){
      alert("Sprawdź zakres dat misji."); return false;
    }
    const concurrent=missionConcurrencyCount(item);
    if(concurrent>5){
      alert("Może odbywać się maksymalnie 5 misji jednocześnie. Zmień termin tej misji.");
      return false;
    }
  }

  try{
    const j=await req("/api/punktacja/parent/add",{
      method:"POST",
      headers:{Authorization:"Bearer "+state.parentToken},
      body:JSON.stringify(payload)
    });

    state.db=j.data||j;
    renderManagement();
    return true;
  }catch(e){
    console.error("Dodawanie elementu:",e);
    alert(e.message);
    return false;
  }
}
const suggestionData={
 task:[
  ['Umyć zęby rano i wieczorem',5,'📋'],
  ['Spakować plecak',5,'🎒'],
  ['Zjeść śniadanie i lekarstwa bez wrzasków',5,'📋'],
  ['Brudne ubrania wrzucam do kosza na pranie',5,'📋'],
  ['Nie spóźnić się do szkoły',5,'📋'],
  ['Nie straszę kotów',5,'📋'],
  ['Wstać rano z uśmiechem na twarzy i być miły dla rodziców',5,'📋']
 ],
 extra:[
  ['Wynieść śmieci',10,'🗑️'],
  ['Pomóc rodzicom w wybranej przez nich czynności',30,'🤝'],
  ['Dobra ocena (4, 5, 6)',50,'⭐']
 ],
 challenge:[
  ['Przeczytaj książkę',100,'🚀'],
  ['3 wyjścia na dwór',100,'🚀'],
  ['Nauczyć się tabliczki mnożenia',150,'🚀']
 ],
 reward:[
  ['2 godziny PlayStation w tygodniu',100,'🎮'],
  ['Możliwość oglądania czegoś od 21 do 22 w tygodniu',150,'🎁'],
  ['Wizyta w McDonald',250,'🍔'],
  ['Kupno czegoś za 100 złotych',500,'🎁'],
  ['Kupno FC 27',1000,'🎁']
 ]
};

const rewardIconOptions=[
 ['📋','Obowiązek'],
 ['🪥','Szczoteczka'],
 ['🎒','Plecak'],
 ['🍎','Śniadanie'],
 ['💊','Lekarstwa'],
 ['👕','Ubrania'],
 ['🧺','Pranie'],
 ['⏰','Punktualność'],
 ['🐱','Kot'],
 ['😊','Uśmiech'],
 ['🏠','Dom'],
 ['🧹','Sprzątanie'],
 ['🗑️','Śmieci'],
 ['🤝','Pomoc'],
 ['⭐','Gwiazda'],
 ['🏅','Dobra ocena'],
 ['🚀','Misja'],
 ['📚','Książka'],
 ['📖','Czytanie'],
 ['🌳','Spacer'],
 ['🚶','Wyjście'],
 ['🧮','Matematyka'],
 ['🎯','Cel'],
 ['🏁','Meta'],
 ['📅','Termin'],
 ['💡','Nauka'],
 ['🧠','Myślenie'],
 ['✏️','Pisanie'],
 ['🎨','Plastyka'],
 ['⚽','Piłka'],
 ['🚲','Rower'],
 ['🏃','Sport'],
 ['🎁','Prezent'],
 ['🎮','Pad'],
 ['🕹️','Joystick'],
 ['🎧','Słuchawki'],
 ['🖥️','Komputer'],
 ['🎲','Gra planszowa'],
 ['🎬','Film'],
 ['🍿','Popcorn'],
 ['🍔','Hamburger'],
 ['🍕','Pizza'],
 ['🍟','Frytki'],
 ['🍦','Lody'],
 ['🍩','Pączek'],
 ['🍜','Makaron'],
 ['🍣','Sushi'],
 ['🏆','Trofeum'],
 ['💎','Klejnot'],
 ['🪙','Moneta'],
 ['🧸','Maskotka'],
 ['🤖','Robot'],
 ['🚗','Samochodzik'],
 ['🎢','Park rozrywki'],
 ['🎳','Kręgle'],
 ['🎉','Niespodzianka'],
 ['🌈','Tęcza'],
 ['☀️','Słońce'],
 ['🌙','Księżyc'],
 ['❤️','Serce'],
 ['🔥','Ogień'],
 ['💪','Siła'],
 ['🦊','Lis'],
 ['🐶','Pies']
];
function refreshRewardIconPicker(){
 const grid=$("rewardIconGrid"); if(!grid)return;
 const selected=$("modalIconInput").value.trim();
 grid.querySelectorAll("[data-reward-icon]").forEach(b=>{
   const active=b.dataset.rewardIcon===selected;
   b.classList.toggle("selected",active);
   b.setAttribute("aria-pressed",active?"true":"false");
 });
}
function initRewardIconPicker(){
 const grid=$("rewardIconGrid"); if(!grid||grid.dataset.ready)return;
 grid.dataset.ready="1";
 grid.innerHTML=rewardIconOptions.map(([icon,label])=>`<button type="button" class="rewardIconChoice" data-reward-icon="${icon}" aria-label="${label}" title="${label}" aria-pressed="false"><span>${icon}</span><small>${label}</small></button>`).join("");
 grid.querySelectorAll("[data-reward-icon]").forEach(b=>b.addEventListener("click",()=>{$("modalIconInput").value=b.dataset.rewardIcon;refreshRewardIconPicker()}));
 $("modalIconInput").addEventListener("input",refreshRewardIconPicker);
}
let modalKind=null;
function openAddModal(kind){modalKind=kind;const meta={task:['📋','CODZIENNIE','Dodaj codzienny obowiązek','Wybierz propozycję albo wpisz własny obowiązek.'],extra:['⭐','BONUS','Dodaj czynność ekstra','Wybierz propozycję albo dodaj własny bonus.'],challenge:['🚀','WYZWANIE','Dodaj misję czasową','Ustal termin i liczbę punktów za wykonanie misji.'],reward:['🎁','CEL','Dodaj nagrodę','Ustal próg punktowy, po którym nagroda będzie dostępna.']}[kind];$("modalIcon").textContent=meta[0];$("modalEyebrow").textContent=meta[1];$("modalTitle").textContent=meta[2];$("modalHint").textContent=meta[3];$("challengeDates").classList.toggle("hidden",kind!=="challenge");$("modalPoints").value=kind==='reward'?[100,250,500][0]:kind==='challenge'?50:10;$("modalIconInput").value=kind==='reward'?'🎁':kind==='extra'?'⭐':kind==='challenge'?'🚀':'📋';$("modalName").value='';$("rewardIconPicker").classList.remove('hidden');initRewardIconPicker();refreshRewardIconPicker();const box=$("suggestions");const previous=(state.db?.configLibrary?.[kind]||[]).map(x=>[x.name,kind==="reward"?x.cost:(kind==="task"?5:x.points),x.icon||"⭐"]);const stock=suggestionData[kind]||[];const all=[...previous.filter(x=>!stock.some(y=>y[0]===x[0])),...stock];box.innerHTML=all.map((s,i)=>`<button type="button" class="suggestion" data-suggestion="${i}"><span>${esc(s[2])}</span>${esc(s[0])}<b>${s[1]} pkt</b></button>`).join("");box.querySelectorAll(".suggestion").forEach(b=>b.onclick=()=>{const s=all[+b.dataset.suggestion];$("modalName").value=s[0];$("modalPoints").value=s[1];$("modalIconInput").value=s[2];refreshRewardIconPicker()});if(kind==='challenge'){const today=dateKey(new Date());$("modalStart").value=today;const end=new Date();end.setDate(end.getDate()+30);$("modalEnd").value=dateKey(end)}$("addModal").classList.remove('hidden');setTimeout(()=>$("modalName").focus(),50)}
function closeAddModal(){$("addModal").classList.add('hidden');modalKind=null}
function bindForms(){$("saveQuestionDay").onclick=saveQuestionDay;const qInput=$("questionDayInput"),qPoints=$("questionDayPointsInput");if(qInput)qInput.addEventListener("change",saveQuestionDay);if(qPoints)qPoints.addEventListener("change",saveQuestionDay);$("genericAddForm").onsubmit=async e=>{e.preventDefault();if(!modalKind)return;const name=$("modalName").value.trim();const points=+$("modalPoints").value;let item={name,icon:$("modalIconInput").value||'⭐'};if(modalKind==='reward')item.cost=points;else item.points=points;if(modalKind==='challenge'){item.start=$("modalStart").value;item.end=$("modalEnd").value;if(!item.start||!item.end||item.end<item.start)return alert('Sprawdź zakres dat.')}if(await add(modalKind,item))closeAddModal()};document.querySelectorAll('[data-open-add]').forEach(b=>b.onclick=()=>openAddModal(b.dataset.openAdd));$("closeAdd").onclick=closeAddModal;$("cancelAdd").onclick=closeAddModal}
async function login(){const pin=$("pinInput").value.trim();try{const j=await req("/api/punktacja/parent/login",{method:"POST",body:JSON.stringify({pin})});setParentToken(j.token);$("pinError").textContent="";$("parentPin").classList.add('hidden');showScreen("parent");renderParent()}catch(e){$("pinError").textContent=e.message}}
async function openParentAccess(){
  try{
    const db=await load();
    const needsSetup=!db.pinSet;
    $("parentPin").classList.remove("hidden");
    $("parentPanel").classList.add("hidden");
    $("pinLoginContent").classList.toggle("hidden",needsSetup);
    $("pinSetupContent").classList.toggle("hidden",!needsSetup);
    $("pinError").textContent="";$("pinSetupError").textContent="";
    $("pinInput").value="";$("newPinInput").value="";$("newPinConfirm").value="";
    setTimeout(()=>$(needsSetup?"newPinInput":"pinInput").focus(),50);
  }catch(e){alert(e.message||"Nie udało się odczytać ustawień.")}
}
async function setupPin(){
  const pin=$("newPinInput").value.trim(), confirmPin=$("newPinConfirm").value.trim();
  if(!/^\d{6,12}$/.test(pin)) return $("pinSetupError").textContent="PIN powinien zawierać od 6 do 12 cyfr.";
  if(pin!==confirmPin) return $("pinSetupError").textContent="PIN-y nie są identyczne.";
  try{
    const j=await req("/api/punktacja/parent/setup-pin",{method:"POST",body:JSON.stringify({pin})});
    setParentToken(j.token);state.db=j.data||await load();$("pinSetupError").textContent="";$("parentPin").classList.add("hidden");showScreen("parent");renderParent();
  }catch(e){$("pinSetupError").textContent=e.message}
}
function openPinChange(){if(!state.parentToken)return;$("changePinCurrent").value="";$("changePinInput").value="";$("changePinConfirm").value="";$("pinChangeError").textContent="";$("pinChangeModal").classList.remove("hidden");setTimeout(()=>$("changePinCurrent").focus(),50)}
function closePinChange(){$("pinChangeModal")?.classList.add("hidden")}
async function changePin(){
  const currentPin=$("changePinCurrent").value.trim(), pin=$("changePinInput").value.trim(), confirmPin=$("changePinConfirm").value.trim();
  if(!/^\d{6,12}$/.test(pin)) return $("pinChangeError").textContent="PIN powinien zawierać od 6 do 12 cyfr.";
  if(pin!==confirmPin) return $("pinChangeError").textContent="PIN-y nie są identyczne.";
  try{
    const j=await req("/api/punktacja/parent/change-pin",{method:"POST",headers:{Authorization:"Bearer "+state.parentToken},body:JSON.stringify({currentPin,newPin:pin})});
    setParentToken(j.token);state.db=j.data;closePinChange();alert("PIN rodzica został zmieniony.");
  }catch(e){$("pinChangeError").textContent=e.message}
}
function openConsequenceModal(){
 if(!state.parentToken)return;
 $("consequenceReason").value="";$("consequenceCustom").value="";$("consequencePoints").value="";
 document.querySelectorAll("[data-consequence-points]").forEach(b=>b.classList.remove("selected"));
 $("consequenceModal").classList.remove("hidden");
 setTimeout(()=>$("consequenceReason").focus(),50);
}
const __oldOpenConsequenceModal=openConsequenceModal;openConsequenceModal=function(){__oldOpenConsequenceModal();const sug=$("consequenceSuggestions");if(!sug)return;const old=state.db?.configLibrary?.consequence||[];sug.innerHTML=old.map((x,i)=>`<button type="button" class="suggestion" data-old-consequence="${i}">${esc(x.reason)} <b>${Number(x.points)||0} pkt</b></button>`).join("");sug.querySelectorAll("[data-old-consequence]").forEach(b=>b.onclick=()=>{const x=old[Number(b.dataset.oldConsequence)];$("consequenceReason").value=x.reason;$("consequenceCustom").value=Number(x.points)||"";});};
function closeConsequenceModal(){$("consequenceModal")?.classList.add("hidden")}
async function addConsequence(){
 const reason=$("consequenceReason").value.trim();
 const custom=$("consequenceCustom").value.trim();
 const preset=$("consequencePoints").value.trim();
 const points=Number(custom||preset);
 if(!reason)return $("consequenceError").textContent="Napisz krótko, za co odjęto punkty.";
 if(!Number.isFinite(points)||points<=0)return $("consequenceError").textContent="Wybierz liczbę punktów albo wpisz własną.";
 if(!confirm(`Odjąć ${Math.round(points)} pkt za: ${reason}?\n\nKonsekwencja zostanie zapisana do końca tej gry.`))return;
 const wasConfig=!$("setupPanel").classList.contains("hidden");
 try{const j=await req("/api/punktacja/parent/consequence",{method:"POST",headers:{Authorization:"Bearer "+state.parentToken},body:JSON.stringify({reason,points:Math.round(points)})});state.db=j.data||j;rafciaQueueSad(Math.round(points));closeConsequenceModal();if(wasConfig){renderManagement();renderConfigConsequences();renderConfigMode()}else{renderDailyParent()}}catch(e){$("consequenceError").textContent=e.message}}
async function startGame(){if(!state.parentToken)return;try{const j=await req("/api/punktacja/parent/start",{method:"POST",headers:{Authorization:"Bearer "+state.parentToken},body:JSON.stringify({mode:"immediate"})});state.db=j.data||j;renderConfigMode();if(activeGame()){showScreen("child")}else{renderParent();showDailyConfig();alert("Gra została zaplanowana. Rozpocznie się w wybranym dniu.");}}catch(e){alert(e.message)}}
async function scheduleGame(){if(!state.parentToken)return;const start=cfgStartDate;const end=cfgEndDate;if(!start)return alert("Wybierz dzień rozpoczęcia gry.");if(end&&end<start)return alert("Data zakończenia nie może być wcześniejsza niż początek gry.");try{const j=await req("/api/punktacja/parent/start",{method:"POST",headers:{Authorization:"Bearer "+state.parentToken},body:JSON.stringify({mode:"scheduled",startDate:start,endDate:end})});state.db=j.data||j;alert(start<=dateKey(new Date())?"Gra została uruchomiona od dzisiaj.":`Gra została zaplanowana od ${parseDate(start).toLocaleDateString("pl-PL")}.`);renderParent();renderConfigCalendar(true);}catch(e){alert(e.message)}}

async function openNewGame(){
  try{
    state.db=await load();
    const firstRun=!state.db.pinSet;
    $("newGamePinGate").classList.toggle("hidden",firstRun);
    $("newGameDetails").classList.toggle("hidden",!firstRun);
    $("newGameInitialPin").classList.toggle("hidden",!firstRun);
    $("newGameSaveChoice").classList.toggle("hidden",firstRun);
    $("newGameFirstStartActions").classList.toggle("hidden",!firstRun);
    $("newGamePinError").textContent="";$("newGameFirstPinError").textContent="";
    $("newGameCurrentPin").value="";$("newGameFirstPin").value="";$("newGameFirstPinConfirm").value="";
    $("newGameChildName").value="";$("newGameStartDate").value=dateKey(new Date());
    $("newGameDuration").value="1";updateNewGameEndDate();
    $("newGameModal").classList.remove("hidden");
    if(firstRun)setTimeout(()=>$("newGameChildName")?.focus(),60);
    else setTimeout(()=>$("newGameCurrentPin")?.focus(),60);
  }catch(e){alert("Nie udało się otworzyć konfiguracji nowej gry: "+e.message)}
}
function closeNewGame(){$("newGameModal")?.classList.add("hidden")}
function cancelNewGame(){closeNewGame();if(state.screen==="welcome")revokeParentSession()}
function updateNewGameEndDate(){
  const start=$("newGameStartDate")?.value, duration=$("newGameDuration")?.value, end=$("newGameEndDate");
  if(!start||!end||duration==="custom")return;
  const [y,m,d]=start.split("-").map(Number);const targetMonth=m-1+Number(duration);const lastDay=new Date(y,targetMonth+1,0).getDate();
  const anniversary=new Date(y,targetMonth,Math.min(d,lastDay));anniversary.setDate(anniversary.getDate()-1);
  end.value=dateKey(anniversary);
}
async function authorizeNewGame(){
  const pin=$("newGameCurrentPin").value.trim();
  if(!/^\d{4,12}$/.test(pin))return $("newGamePinError").textContent="Wpisz dotychczasowy PIN rodzica.";
  try{
    const j=await req("/api/punktacja/parent/login",{method:"POST",body:JSON.stringify({pin})});
    setParentToken(j.token);$("newGamePinError").textContent="";$("newGamePinGate").classList.add("hidden");$("newGameDetails").classList.remove("hidden");
    await refreshNewGameArchives();setTimeout(()=>$("newGameChildName")?.focus(),50);
  }catch(e){$("newGamePinError").textContent=e.message||"Nieprawidłowy PIN."}
}
async function refreshNewGameArchives(){const el=$("newGameArchives");if(!el)return;el.innerHTML="<small>Ładowanie archiwum…</small>";try{const j=await req("/api/punktacja/parent/archives",{headers:{Authorization:"Bearer "+state.parentToken}});const a=j.archives||[];el.innerHTML=a.length?"<b>Archiwum poprzednich gier</b>"+a.map(x=>`<div class="newGameArchiveRow"><span><b>${esc(x.label||"Gra archiwalna")}</b><br><small>${esc(x.savedAtLabel||"")}</small></span><button type="button" data-archive-load="${esc(x.id)}">Wczytaj tę grę</button></div>`).join(""):"<small>Nie ma jeszcze zapisanych archiwalnych gier.</small>";el.querySelectorAll("[data-archive-load]").forEach(b=>b.onclick=async()=>{if(!confirm("Wczytać archiwalną grę? Zastąpi ona aktualny stan."))return;try{const out=await req("/api/punktacja/parent/archive/load",{method:"POST",headers:{Authorization:"Bearer "+state.parentToken},body:JSON.stringify({id:b.dataset.archiveLoad})});state.db=out.data;closeNewGame();renderParent();alert("Archiwalna gra została przywrócona.")}catch(e){alert(e.message)}})}catch(e){el.textContent="Nie udało się pobrać archiwum: "+e.message}}
async function beginNewGame(saveCurrent){
  const childName=$("newGameChildName")?.value.trim()||"";
  if(!childName)return alert("Wpisz imię dziecka rozpoczynającego nową grę.");
  if(childName.length>40)return alert("Imię może mieć maksymalnie 40 znaków.");
  const startDate=$("newGameStartDate").value,endDate=$("newGameEndDate").value;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(startDate))return alert("Wybierz poprawną datę rozpoczęcia.");
  if(!/^\d{4}-\d{2}-\d{2}$/.test(endDate)||endDate<startDate)return alert("Data zakończenia musi być poprawna i nie może poprzedzać daty rozpoczęcia.");
  const firstRun=!state.db?.pinSet;
  let firstPin="";
  if(firstRun){
    firstPin=$("newGameFirstPin").value.trim();const confirmPin=$("newGameFirstPinConfirm").value.trim();
    if(!/^\d{6,12}$/.test(firstPin))return $("newGameFirstPinError").textContent="PIN powinien zawierać od 6 do 12 cyfr.";
    if(firstPin!==confirmPin)return $("newGameFirstPinError").textContent="Wpisane PIN-y nie są identyczne.";
  }else if(!state.parentToken){return alert("Najpierw potwierdź PIN rodzica.")}
  const msg=firstRun?"To będzie pierwsza gra. Zapiszemy imię podróżnika, daty gry i nowy PIN rodzica.":(saveCurrent?"Obecna gra zostanie zapisana w archiwum przed rozpoczęciem nowej.":"Obecna gra NIE zostanie zapisana do archiwum. Jej historia i wyniki zostaną utracone. Podpowiedzi z konfiguracji zostaną zachowane.");
  if(!confirm(msg+"\n\nKontynuować?"))return;
  try{
    const endpoint=firstRun?"/api/punktacja/parent/first-game":"/api/punktacja/parent/new-game";
    const headers=firstRun?{}:{Authorization:"Bearer "+state.parentToken};
    const body={saveCurrent:!!saveCurrent,startDate,endDate,childName};if(firstRun)body.pin=firstPin;
    const j=await req(endpoint,{method:"POST",headers,body:JSON.stringify(body)});
    if(j.token)setParentToken(j.token);state.db=j.data;state.inConfig=false;closeNewGame();initConfigDates();renderParent();renderConfigCalendar(true);
    if(firstRun){showDailyConfig();alert("Pierwsza konfiguracja została utworzona. Ustaw teraz obowiązki, nagrody i pozostałe zasady. Na dole konfiguracji znajdziesz przycisk „Rozpocznij pierwszą grę”.");}
    else{alert(saveCurrent?"Poprzednia gra została zarchiwizowana. Możesz teraz skonfigurować nową grę.":"Nowa gra została utworzona. Poprzednia historia nie została zachowana.");}
  }catch(e){alert("Nie udało się rozpocząć nowej gry. Bieżący stan nie został wyczyszczony.\n"+e.message)}
}

function downloadSave(){
  if(!state.db) return;
  const gameData=JSON.parse(JSON.stringify(state.db));
  delete gameData.parentPin; delete gameData.pinSet;
  const save={
    format:"system-rafcia-save",
    version:2,
    savedAt:new Date().toISOString(),
    data:gameData
  };
  const blob=new Blob([JSON.stringify(save,null,2)],{type:"application/json;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  const stamp=new Date().toISOString().slice(0,19).replace(/[T:]/g,"-");
  a.href=url;a.download=`system-rafcia-save-${stamp}.json`;
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

async function loadSaveFile(file){
  if(!file||!state.parentToken)return;
  try{
    const text=await file.text();
    const parsed=JSON.parse(text);
    const data=parsed?.format==="system-rafcia-save" ? parsed.data : parsed;
    if(!data || typeof data!=="object") throw new Error("Plik nie zawiera poprawnego zapisu Systemu Rafcia.");
    if(!Array.isArray(data.tasks)||!Array.isArray(data.extras)||!Array.isArray(data.challenges)||!Array.isArray(data.rewards)||typeof data.records!=="object") throw new Error("To nie jest poprawny plik zapisu Systemu Rafcia.");
    if(!confirm("Wczytanie zapisu zastąpi obecny stan gry i wszystkie konfiguracje. Kontynuować?")) return;
    const j=await req("/api/punktacja/parent/load",{method:"POST",headers:{Authorization:"Bearer "+state.parentToken},body:JSON.stringify({data})});
    state.db=j.data||j;
    alert("Zapis został wczytany. System Rafcia używa teraz stanu z pliku.");
    showScreen("parent");
    renderParent();
  }catch(e){
    console.error("Wczytywanie zapisu:",e);
    alert(e.message||"Nie udało się wczytać zapisu.");
  }finally{
    const input=$("loadGameFile");if(input)input.value="";
  }
}

async function resetGame(){
  if(!state.parentToken)return;
  const ok=confirm("UWAGA! Gra zostanie zatrzymana, a wszystkie obowiązki, bonusy, misje, nagrody i historię punktów zostaną usunięte. PIN rodzica pozostanie bez zmian.\n\nJeżeli chcesz zachować obecny stan, najpierw użyj „Zapisz stan gry”.\n\nKontynuować reset?");
  if(!ok)return;
  try{
    const j=await req("/api/punktacja/parent/reset",{method:"POST",headers:{Authorization:"Bearer "+state.parentToken},body:"{}"});
    state.db=j.data||j;
    showScreen("parent");
    renderParent();
  }catch(e){alert(e.message)}
}

async function stopGame(){await resetGame()}
function renderConfigMode(){
 const editing=activeGame();
 const startBar=$("referenceStartBar");
 const configBack=$("configBackToDaily");
 const configToParent=$("configToParent");
 const startGameBtn=$("startGame");
 const firstSetupBar=$("firstSetupStartBar");
 const laterSetupBar=$("laterSetupStartBar");
 const firstSetupPending=!!state.db?.settings?.firstSetupPending;
 const waitingToStart=!editing&&(state.db?.settings?.status||"setup")==="setup";
 if(startBar) startBar.classList.toggle("hidden",editing||firstSetupPending);
 if(configBack) configBack.classList.toggle("hidden",!editing);
 if(startGameBtn) startGameBtn.disabled=editing;
 if(firstSetupBar) firstSetupBar.classList.toggle("hidden",!firstSetupPending);
 if(laterSetupBar) laterSetupBar.classList.toggle("hidden",!waitingToStart||firstSetupPending);
}

let cfgStartDate="",cfgEndDate="",cfgEndMode="none";
function initConfigDates(){cfgStartDate=state.db?.settings?.startDate||dateKey(new Date());cfgEndDate=state.db?.settings?.endDate||"";cfgEndMode=cfgEndDate?"custom":"none";state.cfgPickMode="start";state.cfgMonth=parseDate(cfgStartDate)}
function addMonthsKey(key,n){const d=parseDate(key);d.setMonth(d.getMonth()+n);return dateKey(d)}
function renderConfigCalendar(reset=false){
  if(reset||!cfgStartDate)initConfigDates();
  const draw=()=>{
    const d=state.cfgMonth,y=d.getFullYear(),m=d.getMonth(),first=new Date(y,m,1),days=new Date(y,m+1,0).getDate(),off=(first.getDay()+6)%7;
    $("cfgMonth").textContent=first.toLocaleDateString("pl-PL",{month:"long",year:"numeric"});
    let h="";
    for(let i=0;i<off;i++)h+="<div></div>";
    const gameStart=cfgStartDate||dateKey(new Date());
    const gameEnd=cfgEndDate||"";
    for(let day=1;day<=days;day++){
      const x=new Date(y,m,day),k=dateKey(x);
      const gameOn=!!gameStart&&k>=gameStart&&(!gameEnd||k<=gameEnd);
      const missions=(state.db?.challenges||[]).filter(c=>c.active!==false&&c.start&&c.end&&k>=c.start&&k<=c.end);
      const cls=["miniDay",k===cfgStartDate?"cfgStart":"",k===cfgEndDate?"cfgEnd":"",k===dateKey(new Date())?"today":"",gameOn?"hasGame":"",missions.length?"hasMissions":""].filter(Boolean).join(" ");
      let layers=gameOn?`<span class="calendarFill calendarGame" title="Gra"></span>`:"";
      const n=missions.length;
      missions.forEach((c,i)=>{
        const top=45+i*(55/n),height=55/n,mc=missionColor(c,k);
        layers+=`<span class="calendarFill calendarMission" style="top:${top}%;height:${height}%;--mission-color:${mc.color}" title="${esc(c.name)}"></span>`;
      });
      const names=missions.map(c=>c.name).join(" • ");
      h+=`<button type="button" class="${cls}" data-cfgday="${k}" title="${esc([gameOn?"Gra":"",names].filter(Boolean).join(" • "))}">${layers}<b>${day}</b></button>`;
    }
    $("cfgCalendar").innerHTML=h;
    const cfgLegend=$("cfgCalendarLegend");
    if(cfgLegend)cfgLegend.innerHTML=activeStatusLegend();
    $("cfgStartLabel").textContent=parseDate(cfgStartDate).toLocaleDateString("pl-PL",{day:"numeric",month:"long",year:"numeric"});
    $("cfgEndLabel").textContent=cfgEndDate?parseDate(cfgEndDate).toLocaleDateString("pl-PL",{day:"numeric",month:"long",year:"numeric"}):"Bez daty końcowej";
    $("cfgPickStart").classList.toggle("active",state.cfgPickMode==="start");
    $("cfgPickEnd").classList.toggle("active",state.cfgPickMode==="end");
    $("cfgCalendar").querySelectorAll("[data-cfgday]").forEach(b=>b.onclick=()=>{
      const k=b.dataset.cfgday;
      if(k<dateKey(new Date()))return alert("Nie można rozpocząć gry w dniu, który już minął.");
      if(state.cfgPickMode==="start"){cfgStartDate=k;if(cfgEndDate&&cfgEndDate<k)cfgEndDate=""}
      else{if(k<cfgStartDate)return alert("Koniec gry nie może być wcześniejszy niż początek.");cfgEndDate=k;cfgEndMode="custom"}
      draw();
    });
  };
  $("cfgPrev").onclick=()=>{state.cfgMonth.setMonth(state.cfgMonth.getMonth()-1);draw()};
  $("cfgNext").onclick=()=>{state.cfgMonth.setMonth(state.cfgMonth.getMonth()+1);draw()};
  draw();
}
function syncParentDailyToolbar(){
  const bar=$("parentDailyToolbar");
  if(bar) bar.classList.toggle("hidden",!activeGame()||state.inConfig);
}
function showDailyConfig(){
  if(!state.parentToken){
    alert("Najpierw zaloguj się jako rodzic.");
    return;
  }
  // Konfiguracja ma być dostępna z panelu rodzica także wtedy, gdy gra jest
  // zaplanowana lub właśnie oczekuje na start. Nie cofamy użytkownika do
  // widoku rodzica i nie blokujemy przycisku.
  state.inConfig=true;
  syncParentDailyToolbar();
  const daily=$("dailyPanel");
  const setup=$("setupPanel");
  if(daily) daily.classList.add("hidden");
  if(setup) setup.classList.remove("hidden");
  renderManagement();
  renderConfigConsequences();
  renderConfigCalendar();
  renderConfigMode();
  window.scrollTo({top:0,behavior:"smooth"});
}

function showDailyPanel(){
  // Przed uruchomieniem gry nie ma jeszcze codziennego raportu.
  if(!activeGame()) return;
  state.inConfig=false;
  syncParentDailyToolbar();
  const setup=$("setupPanel");
  const daily=$("dailyPanel");
  if(setup) setup.classList.add("hidden");
  if(daily) daily.classList.remove("hidden");
  renderDailyParent();
  window.scrollTo({top:0,behavior:"smooth"});
}

function ensureConfigButton(){
  const btn=$("openConfigToolbar");
  if(btn) btn.onclick=showDailyConfig;
}

function bindNavigation(){
  const on=(id,event,fn)=>{const el=$(id);if(el)el[event]=fn};
  document.addEventListener("pointerdown",noteParentActivity,true);
  document.addEventListener("keydown",noteParentActivity,true);
  setInterval(()=>{if(state.screen==="parent"&&state.parentToken&&Date.now()-parentLastActivity>=parentIdleMs)showScreen("welcome")},15000);

  // Okno jest wspólne dla ekranu startowego i panelu rodzica.
  // W HTML leży wewnątrz parentScreen, który na starcie jest ukryty.
  const newGameModal=$("newGameModal");
  if(newGameModal)document.body.appendChild(newGameModal);

  on("homeBtn","onclick",()=>showScreen("welcome"));
  on("goParent","onclick",()=>{showScreen("parent");openParentAccess()});
  on("goChild","onclick",e=>{e?.preventDefault?.();e?.stopPropagation?.();showScreen("child")});
  // Obsługa w fazie capture zabezpiecza kliknięcie przed nakładającymi się hotspotami ilustracji.
  document.addEventListener("click",e=>{
    const trigger=e.target.closest?.("#welcomeNewGame");
    if(!trigger)return;
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
    openNewGame();
  },true);
  on("newGameVerifyPin","onclick",authorizeNewGame);
  on("newGameDuration","onchange",updateNewGameEndDate);
  on("newGameStartDate","onchange",updateNewGameEndDate);
  on("newGameFirstStart","onclick",()=>beginNewGame(false));
  document.addEventListener("click",e=>{const child=e.target.closest?.("#goChild");if(child){e.preventDefault();e.stopPropagation();showScreen("child")}},true);
  on("closePin","onclick",()=>showScreen("welcome"));
  on("pinForm","onsubmit",e=>{e.preventDefault();login()});
  on("pinSetupForm","onsubmit",e=>{e.preventDefault();setupPin()});
  on("changePinBtn","onclick",openPinChange);
  on("closePinChange","onclick",closePinChange);
  on("cancelPinChange","onclick",closePinChange);
  on("pinChangeForm","onsubmit",e=>{e.preventDefault();changePin()});
  on("childToParent","onclick",()=>{showScreen("parent");openParentAccess()});
  on("startGame","onclick",startGame);
  on("stopGame","onclick",stopGame);
  on("saveGame","onclick",downloadSave);
  on("loadGame","onclick",()=>$("loadGameFile")?.click());
  on("loadGameFile","onchange",e=>loadSaveFile(e.target.files?.[0]));
  on("configSaveGame","onclick",downloadSave);
  on("configLoadGame","onclick",()=>$("configLoadGameFile")?.click());
  on("configLoadGameFile","onchange",e=>loadSaveFile(e.target.files?.[0]));
  on("newGameBtn","onclick",openNewGame);on("closeNewGame","onclick",cancelNewGame);on("newGameCancel","onclick",cancelNewGame);on("newGameSaveAndStart","onclick",()=>beginNewGame(true));on("newGameNoSave","onclick",()=>beginNewGame(false));
  on("addConsequenceBtn","onclick",openConsequenceModal);
  on("configAddConsequence","onclick",openConsequenceModal);
  on("closeConsequence","onclick",closeConsequenceModal);
  on("cancelConsequence","onclick",closeConsequenceModal);
  on("consequenceForm","onsubmit",e=>{e.preventDefault();addConsequence()});
  on("bonusPointsForm","onsubmit",addBonusPoints);
  on("sendChildQuestionAnswer","onclick",sendChildQuestionAnswer);
  document.querySelectorAll("[data-consequence-points]").forEach(b=>b.onclick=()=>{document.querySelectorAll("[data-consequence-points]").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");$("consequencePoints").value=b.dataset.consequencePoints;$("consequenceCustom").value=""});
  on("configBackToDaily","onclick",showDailyPanel);
  on("configToParent","onclick",showDailyPanel);
  on("parentToChild","onclick",()=>showScreen("child"));
  on("panelNavDaily","onclick",showDailyPanel);
  on("aboutGameBtn","onclick",()=>{$("aboutGameModal")?.classList.remove("hidden");document.body.classList.add("aboutGameOpen")});
  on("closeAboutGame","onclick",()=>{$("aboutGameModal")?.classList.add("hidden");document.body.classList.remove("aboutGameOpen")});
  on("toolbarSaveGame","onclick",downloadSave);
  on("toolbarLoadGame","onclick",()=>$("loadGameFile")?.click());
  on("toolbarNewGame","onclick",openNewGame);
  on("openConfigToolbar","onclick",showDailyConfig);

  on("openConfig","onclick",e=>{e.preventDefault();e.stopPropagation();showDailyConfig()});
  on("childTopToParent","onclick",()=>{showScreen("parent");openParentAccess()});
  on("prevMonth","onclick",()=>{state.date.setMonth(state.date.getMonth()-1);renderChild()});
  on("nextMonth","onclick",()=>{state.date.setMonth(state.date.getMonth()+1);renderChild()});
  on("pPrev","onclick",()=>{state.parentDate.setMonth(state.parentDate.getMonth()-1);renderDailyParent()});
  on("pNext","onclick",()=>{state.parentDate.setMonth(state.parentDate.getMonth()+1);renderDailyParent()});

  on("aboutGameModal","onclick",e=>{if(e.target?.id==="aboutGameModal"){$("aboutGameModal").classList.add("hidden");document.body.classList.remove("aboutGameOpen")}});
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&$("aboutGameModal")&&!$("aboutGameModal").classList.contains("hidden")){$("aboutGameModal").classList.add("hidden");document.body.classList.remove("aboutGameOpen")}});
  // Delegacja kliknięcia: działa także wtedy, gdy panel został przebudowany przez render.
  document.addEventListener("click",e=>{
    const btn=e.target.closest("#openConfig");
    if(btn){e.preventDefault();e.stopPropagation();showDailyConfig();return;}
    const back=e.target.closest("#configBackToDaily,#configToParent");
    if(back){e.preventDefault();showDailyPanel();return;}
  });

  ensureConfigButton();
  renderConfigCalendar();
  on("cfgPickStart","onclick",()=>{state.cfgPickMode="start";renderConfigCalendar()});
  on("cfgPickEnd","onclick",()=>{state.cfgPickMode="end";renderConfigCalendar()});
  on("cfgEnd1","onclick",()=>{if(!cfgStartDate)return;cfgEndDate=addMonthsKey(cfgStartDate,1);cfgEndMode="preset";renderConfigCalendar()});
  on("cfgEnd2","onclick",()=>{if(!cfgStartDate)return;cfgEndDate=addMonthsKey(cfgStartDate,2);cfgEndMode="preset";renderConfigCalendar()});
  on("cfgEndCustom","onclick",()=>{state.cfgPickMode="end";alert("Teraz kliknij na kalendarzu wybrany dzień zakończenia gry.");renderConfigCalendar()});
  on("cfgEndNone","onclick",()=>{cfgEndDate="";cfgEndMode="none";renderConfigCalendar()});
  on("startGame","onclick",startGame);
  on("startFirstConfiguredGame","onclick",()=>{if(!confirm("Czy wszystkie obowiązki i zasady są już gotowe? Rozpocząć pierwszą grę?"))return;startGame()});
  on("startLaterConfiguredGame","onclick",()=>{if(!confirm("Czy konfiguracja nowej gry jest gotowa? Rozpocząć grę?"))return;startGame()});
  on("scheduleGame","onclick",scheduleGame);
}
(async()=>{try{await load();state.lastDayKey=dateKey(new Date());bindForms();bindNavigation();ensureConfigButton();showScreen("welcome");setInterval(async()=>{try{handleDayBoundary();const previousChildTotal=state.screen==="child"?(state.childLastTotal??totalPoints()):null;await load();if(state.screen==="child"){const currentChildTotal=totalPoints();if(previousChildTotal!==null&&currentChildTotal>previousChildTotal){try{localStorage.removeItem("rafciaWowPending")}catch(e){}rafciaShowWow(currentChildTotal-previousChildTotal)}state.childLastTotal=currentChildTotal;renderChild()}else if(state.screen==="parent"&&state.parentToken){renderParent();if(activeGame()){renderDailyParent();renderConfigConsequences();ensureConfigButton()}else renderConfigCalendar()}}catch(e){}},5000);document.addEventListener("visibilitychange",()=>{if(!document.hidden)handleDayBoundary()});window.addEventListener("focus",handleDayBoundary)}catch(e){document.body.innerHTML=`<main class="fatal"><h2>Nie udało się połączyć z serwerem</h2><p>${esc(e.message)}</p></main>`}})();


/* ===== V10.24 — niezawodna nawigacja paneli =====
   Ten blok celowo działa w fazie CAPTURE, dzięki czemu kliknięcia nadal
   działają nawet po ponownym renderowaniu panelu albo zmianie jego zawartości. */
window.showScreen = showScreen;
window.showDailyConfig = showDailyConfig;
window.showDailyPanel = showDailyPanel;

(function installReliableNavigation(){
  if(window.__rafciaReliableNavigationInstalled)return;
  window.__rafciaReliableNavigationInstalled=true;
  document.addEventListener('click',function(e){
    const child=e.target.closest && e.target.closest('#goChild');
    if(child){
      e.preventDefault();
      e.stopPropagation();
      showScreen('child');
      return;
    }
    const parent=e.target.closest && e.target.closest('#goParent');
    if(parent){
      e.preventDefault();
      e.stopPropagation();
      showScreen('parent');
      openParentAccess();
      return;
    }
    const toChild=e.target.closest && e.target.closest('#parentToChild');
    if(toChild){
      e.preventDefault();
      e.stopPropagation();
      showScreen('child');
      return;
    }
    const config=e.target.closest && e.target.closest('#openConfig');
    if(config){
      e.preventDefault();
      e.stopPropagation();
      showDailyConfig();
      return;
    }
    const back=e.target.closest && e.target.closest('#configToParent,#configBackToDaily');
    if(back){
      e.preventDefault();
      e.stopPropagation();
      showDailyPanel();
      return;
    }
  },true);
})();
