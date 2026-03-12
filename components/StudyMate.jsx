import { useState, useMemo } from "react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, Legend,
} from "recharts";

/* ============================================================
   StudyMate v4
   NEW: 구글 로그인, 아이 관리, 통계(주간/월간), 링보드
   ============================================================ */

const R = {
  bg:"#f5f4ef", surface:"#faf9f6", surface2:"#eeecea",
  border:"#e2dfd9", border2:"#cec9c2", muted:"#9c9890",
  subtle:"#6e6a63", text:"#3c3a35", textHi:"#1c1a16",
  blue9:"#0090ff", blue10:"#0081f1",
  blueA:"rgba(0,144,255,0.08)", blueBd:"rgba(0,144,255,0.22)",
  orange9:"#f76b15", orange10:"#ef5f00",
  orangeA:"rgba(247,107,21,0.09)", orangeBd:"rgba(247,107,21,0.25)",
  green9:"#30a46c", green10:"#299764",
  greenA:"rgba(48,164,108,0.09)", greenBd:"rgba(48,164,108,0.25)",
  red9:"#e54d2e", redA:"rgba(229,77,46,0.09)", redBd:"rgba(229,77,46,0.25)",
  amber9:"#ffb224", amberA:"rgba(255,178,36,0.10)", amberBd:"rgba(255,178,36,0.28)",
  purple9:"#8e4ec6",
};

const css = `
  @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{background:${R.bg};}
  button{font-family:'Pretendard',sans-serif;cursor:pointer;}
  input,textarea{font-family:'Pretendard',sans-serif;}
  .card{background:${R.surface};border:1px solid ${R.border};border-radius:14px;box-shadow:0 1px 3px rgba(60,50,30,0.07);}
  .btn{border:none;border-radius:9px;font-weight:700;transition:all .15s;}
  .btn:hover{filter:brightness(.95);}
  .btn:active{transform:scale(.97);}
  .nav-btn{border-radius:8px;padding:7px 14px;font-size:12px;font-weight:700;transition:all .15s;border:1px solid transparent;background:transparent;}
  .nav-btn:hover{background:${R.surface2};}
  .progress-bar{height:7px;border-radius:99px;background:${R.surface2};overflow:hidden;}
  .progress-fill{height:100%;border-radius:99px;transition:width .5s ease;}
  .quest-item{background:${R.surface};border:1px solid ${R.border};border-radius:12px;padding:14px 16px;display:flex;align-items:center;gap:13px;text-align:left;width:100%;transition:all .15s;cursor:pointer;}
  .quest-item:hover{border-color:${R.border2};box-shadow:0 2px 8px rgba(0,0,0,0.07);}
  .quest-done{background:${R.greenA};border-color:${R.greenBd}!important;}
  @keyframes pop{0%{transform:scale(1)}40%{transform:scale(1.18)}100%{transform:scale(1)}}
  @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  .fadein{animation:fadeIn .2s ease both;}
  .ring-track{fill:none;stroke:${R.surface2};stroke-linecap:round;}
  .ring-fill{fill:none;stroke-linecap:round;transition:stroke-dashoffset .6s ease;}
  input[type=range]{-webkit-appearance:none;height:5px;border-radius:99px;background:${R.surface2};}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:${R.orange9};cursor:pointer;}
`;

const FontLink = () => <style>{css}</style>;
const Tag = ({ children, color, bg, bd }) => (
  <span style={{ display:"inline-flex",alignItems:"center",borderRadius:6,padding:"3px 9px",fontSize:11,fontWeight:700,lineHeight:1.6, color, background:bg, border:`1px solid ${bd}` }}>{children}</span>
);

/* ── 샘플 데이터 ── */
const INIT_CHILDREN = [
  { id:1, name:"김민준", emoji:"🧒", wallet:320, grade:"초3" },
  { id:2, name:"김수아", emoji:"👧", wallet:180, grade:"초1" },
];

const SUBJECT_RADAR_TEMPLATE = [
  { subject:"국어", emoji:"📖", color:"#f76b15", data:[{area:"독해",score:80},{area:"글쓰기",score:55},{area:"독서",score:70},{area:"문법",score:60},{area:"어휘",score:85},{area:"받아쓰기",score:90}] },
  { subject:"영어", emoji:"🇬🇧", color:"#0090ff", data:[{area:"단어",score:75},{area:"독해",score:60},{area:"듣기",score:30},{area:"말하기",score:20},{area:"문법",score:65},{area:"쓰기",score:45}] },
  { subject:"수학", emoji:"🔢", color:"#30a46c", data:[{area:"개념",score:90},{area:"연산",score:95},{area:"유형",score:80},{area:"심화",score:55},{area:"사고력",score:40},{area:"서술형",score:60}] },
  { subject:"과학", emoji:"🔬", color:"#8e4ec6", data:[{area:"개념",score:50},{area:"암기",score:65},{area:"탐구",score:20},{area:"실험",score:15},{area:"문제풀이",score:45},{area:"응용",score:30}] },
  { subject:"사회", emoji:"🌍", color:"#ffb224", data:[{area:"개념",score:70},{area:"지리",score:65},{area:"역사",score:55},{area:"시사",score:40},{area:"암기",score:75},{area:"지도읽기",score:50}] },
];

const INIT_QUESTS = [
  { subject:"수학", area:"심화", task:"심화 문제집 2장 풀기", reward:50, emoji:"🔢", done:false },
  { subject:"영어", area:"단어", task:"단어장 1단원 암기",    reward:20, emoji:"🇬🇧", done:false },
  { subject:"국어", area:"독해", task:"독해 지문 1개 풀기",   reward:30, emoji:"📖", done:false },
  { subject:"수학", area:"연산", task:"연산 드릴 1장",        reward:15, emoji:"🔢", done:false },
  { subject:"영어", area:"문법", task:"문법 노트 정리",       reward:25, emoji:"🇬🇧", done:false },
];

const REWARDS_LIST = [
  {icon:"🎮",name:"게임 시간 30분",cost:100},{icon:"📺",name:"유튜브 30분",cost:80},
  {icon:"💰",name:"현금 1,000원",cost:200},{icon:"🍔",name:"치킨 쿠폰",cost:150},
  {icon:"🎁",name:"특별 선물",cost:500},{icon:"🏖️",name:"주말 나들이",cost:800},
];

const INIT_SCHEDULES = [
  { subject:"수학", area:"심화", task:"심화 문제집 2장", days:["월","수","금"], reward:50 },
  { subject:"영어", area:"단어", task:"단어장 1단원",    days:["매일"],         reward:20 },
  { subject:"국어", area:"독해", task:"독해 지문 1개",   days:["화","목"],       reward:30 },
];

const HISTORY_SAMPLE = [
  {desc:"수학 심화 퀘스트 완료",amount:+50,day:"오늘"},
  {desc:"영어 단어 암기",amount:+20,day:"오늘"},
  {desc:"게임시간 30분 교환",amount:-100,day:"어제"},
  {desc:"국어 독해 완료",amount:+30,day:"어제"},
  {desc:"주간 목표 달성 보너스 🎉",amount:+100,day:"월요일"},
];

/* 주간 달성률 샘플 데이터 */
const WEEK_STATS = [
  { day:"월", pct:85, carrot:120 },{ day:"화", pct:60, carrot:80 },
  { day:"수", pct:100, carrot:160 },{ day:"목", pct:40, carrot:55 },
  { day:"금", pct:75, carrot:100 },{ day:"토", pct:90, carrot:140 },
  { day:"일", pct:50, carrot:70 },
];

const MONTH_STATS = Array.from({length:4},(_,i)=>({
  week:`${i+1}주차`,
  국어: [72,65,80,58][i], 영어:[35,42,55,48][i],
  수학:[88,91,85,94][i], 과학:[30,35,42,38][i], 사회:[60,65,70,68][i],
}));

/* 링보드 — 4주치 데이터 (아이 2명) */
const RING_WEEKS = ["1주", "2주", "3주", "4주 (이번)"];
const RING_DATA_MINJON  = [72, 85, 68, 91];
const RING_DATA_SOOAH   = [55, 60, 78, 82];

const ALL_DAYS = ["월","화","수","목","금","토","일","매일"];

/* ══════════════════════════════════════════════════════════
   RING COMPONENT
══════════════════════════════════════════════════════════ */
function Ring({ pct, color, size=64, stroke=7, children }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size}>
        <circle className="ring-track" cx={size/2} cy={size/2} r={r} strokeWidth={stroke}/>
        <circle className="ring-fill" cx={size/2} cy={size/2} r={r}
          strokeWidth={stroke} stroke={color}
          strokeDasharray={circ} strokeDashoffset={offset}
          transform={`rotate(-90 ${size/2} ${size/2})`}/>
      </svg>
      <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center" }}>
        {children}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════════════════════ */
export default function StudyMate() {
  /* ── auth state ── */
  const [screen, setScreen]       = useState("login"); // "login" | "app"
  const [loginUser, setLoginUser] = useState(null);    // { name, email, avatar }

  /* ── app-level state ── */
  const [mode, setMode]         = useState("parent");
  const [childTab, setChildTab] = useState("quest");
  const [parentTab, setParentTab] = useState("dashboard");

  /* ── children management ── */
  const [children, setChildren]       = useState(INIT_CHILDREN);
  const [activeChildId, setActiveChildId] = useState(1);
  const activeChild = children.find(c => c.id === activeChildId) ?? children[0];

  /* ── per-child data (keyed by childId) ── */
  const [allRadar, setAllRadar]   = useState({ 1: JSON.parse(JSON.stringify(SUBJECT_RADAR_TEMPLATE)), 2: JSON.parse(JSON.stringify(SUBJECT_RADAR_TEMPLATE)) });
  const [allQuests, setAllQuests] = useState({ 1: INIT_QUESTS.map(q=>({...q})), 2: INIT_QUESTS.map(q=>({...q})) });
  const [wallets, setWallets]     = useState({ 1:320, 2:180 });

  const radarData = allRadar[activeChildId] ?? [];
  const quests    = allQuests[activeChildId] ?? [];
  const wallet    = wallets[activeChildId] ?? 0;

  const setRadarData = (fn) => setAllRadar(p => ({ ...p, [activeChildId]: typeof fn === "function" ? fn(p[activeChildId]) : fn }));
  const setQuests    = (fn) => setAllQuests(p => ({ ...p, [activeChildId]: typeof fn === "function" ? fn(p[activeChildId]) : fn }));
  const setWallet    = (fn) => setWallets(p => ({ ...p, [activeChildId]: typeof fn === "function" ? fn(p[activeChildId]) : fn }));

  const done = quests.filter(q=>q.done).length;
  const pct  = quests.length ? Math.round((done/quests.length)*100) : 0;

  const updateRadarScore = (subject, area, delta) => {
    setRadarData(prev => prev.map(s => s.subject !== subject ? s : {
      ...s, data: s.data.map(d => d.area !== area ? d : { ...d, score: Math.min(100, Math.max(0, d.score+delta)) })
    }));
  };

  const toggleQuest = (i) => {
    setQuests(prev => {
      const next = prev.map((q,idx) => idx===i ? {...q,done:!q.done} : q);
      const delta = next[i].done ? +next[i].reward : -next[i].reward;
      setWallet(w => w + delta);
      updateRadarScore(next[i].subject, next[i].area, next[i].done ? 5 : -5);
      return next;
    });
  };

  /* ── schedules ── */
  const [schedules, setSchedules]         = useState(INIT_SCHEDULES);
  const [editingSched, setEditingSched]   = useState(null);
  const [schedDraft, setSchedDraft]       = useState(null);

  const getAreasFor = (subj) => (radarData.find(s=>s.subject===subj)?.data.map(d=>d.area)) ?? [];
  const openNewSched  = () => { const s0 = radarData[0]?.subject; setSchedDraft({subject:s0,area:getAreasFor(s0)[0]||"",task:"",days:[],reward:20}); setEditingSched("new"); };
  const openEditSched = (i) => { setSchedDraft({...schedules[i],days:[...schedules[i].days]}); setEditingSched(i); };
  const cancelSched   = () => { setEditingSched(null); setSchedDraft(null); };
  const saveSched     = () => {
    if (!schedDraft?.task.trim()) return;
    if (editingSched==="new") setSchedules(p=>[...p,schedDraft]);
    else setSchedules(p=>p.map((s,i)=>i===editingSched?schedDraft:s));
    cancelSched();
  };
  const deleteSched = (i) => setSchedules(p=>p.filter((_,idx)=>idx!==i));
  const toggleDay   = (d) => setSchedDraft(prev => ({
    ...prev, days: prev.days.includes(d)
      ? prev.days.filter(x=>x!==d)
      : d==="매일" ? ["매일"] : prev.days.filter(x=>x!=="매일").concat(d),
  }));

  /* ── balance edit ── */
  const [editingSubj, setEditingSubj] = useState(null);
  const [editDraft, setEditDraft]     = useState(null);
  const openEdit  = (si) => { setEditDraft(JSON.parse(JSON.stringify(radarData[si]))); setEditingSubj(si); };
  const closeEdit = () => { setEditingSubj(null); setEditDraft(null); };
  const saveEdit  = () => { setRadarData(prev => prev.map((s,i)=>i===editingSubj?editDraft:s)); closeEdit(); };

  /* ── share modal ── */
  const [shareModal, setShareModal] = useState(false);
  const [shareMode, setShareMode]   = useState("proud");

  /* ── stats range ── */
  const [statsRange, setStatsRange] = useState("week"); // "week" | "month"

  /* ── child management modal ── */
  const [childModal, setChildModal]   = useState(false); // "add" | "edit" | false
  const [editingChild, setEditingChild] = useState(null);
  const [childDraft, setChildDraft]   = useState({ name:"", grade:"초1", emoji:"🧒" });

  const CHILD_EMOJIS = ["🧒","👦","👧","🧑","🐣","🦊","🐧","🐱"];
  const GRADES = ["유치원","초1","초2","초3","초4","초5","초6","중1","중2","중3"];

  const openAddChild = () => { setChildDraft({name:"",grade:"초1",emoji:"🧒"}); setEditingChild(null); setChildModal("add"); };
  const openEditChild = (c) => { setChildDraft({name:c.name,grade:c.grade,emoji:c.emoji}); setEditingChild(c.id); setChildModal("edit"); };
  const saveChild = () => {
    if (!childDraft.name.trim()) return;
    if (childModal === "add") {
      const newId = Math.max(...children.map(c=>c.id))+1;
      setChildren(p=>[...p,{id:newId,...childDraft,wallet:0}]);
      setAllRadar(p=>({...p,[newId]:JSON.parse(JSON.stringify(SUBJECT_RADAR_TEMPLATE))}));
      setAllQuests(p=>({...p,[newId]:INIT_QUESTS.map(q=>({...q}))}));
      setWallets(p=>({...p,[newId]:0}));
      setActiveChildId(newId);
    } else {
      setChildren(p=>p.map(c=>c.id===editingChild?{...c,...childDraft}:c));
    }
    setChildModal(false);
  };
  const removeChild = (id) => {
    if (children.length <= 1) return;
    setChildren(p=>p.filter(c=>c.id!==id));
    if (activeChildId===id) setActiveChildId(children.find(c=>c.id!==id).id);
  };

  /* ════════════ SHARED UI ════════════ */
  const NavTabs = ({ tabs, active, onSelect }) => (
    <div style={{ display:"flex",gap:4,marginBottom:20,flexWrap:"wrap" }}>
      {tabs.map(t => {
        const isActive = active===t.id;
        return (
          <button key={t.id} className="nav-btn" onClick={()=>onSelect(t.id)} style={{
            background:isActive?R.surface:"transparent", color:isActive?R.textHi:R.muted,
            borderColor:isActive?R.border:"transparent",
            boxShadow:isActive?"0 1px 3px rgba(0,0,0,0.08)":"none",
            fontWeight:isActive?700:600,
          }}>{t.label}</button>
        );
      })}
    </div>
  );

  /* ════════════ LOGIN SCREEN ════════════ */
  const LoginScreen = () => (
    <div style={{ minHeight:"100vh", background:R.bg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Pretendard',sans-serif" }}>
      <FontLink />
      <div className="card fadein" style={{ width:360, padding:"44px 36px", textAlign:"center" }}>
        {/* 로고 */}
        <div style={{ fontSize:40, marginBottom:10 }}>📚</div>
        <h1 style={{ fontSize:22, fontWeight:900, color:R.textHi, letterSpacing:-.5, marginBottom:6 }}>
          Study<span style={{color:R.orange9}}>Mate</span>
        </h1>
        <p style={{ fontSize:13, color:R.muted, marginBottom:36 }}>우리 아이 학습 밸런스 관리</p>

        <p style={{ fontSize:11, fontWeight:700, color:R.muted, marginBottom:14 }}>간편 로그인</p>

        {/* 구글 */}
        <button className="btn" onClick={() => { setLoginUser({name:"김지연",email:"jiyeon@gmail.com",avatar:"G"}); setScreen("app"); }} style={{
          width:"100%", background:"#fff", border:`1.5px solid ${R.border2}`,
          color:R.textHi, padding:"13px 16px", fontSize:14, fontWeight:700,
          display:"flex", alignItems:"center", justifyContent:"center", gap:10,
          marginBottom:10, borderRadius:12,
          boxShadow:"0 1px 4px rgba(0,0,0,0.08)",
        }}>
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.27 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-3.77-13.47-9.09l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Google 계정으로 로그인
        </button>

        {/* 카카오 */}
        <button className="btn" onClick={() => { setLoginUser({name:"김지연",email:"kakao",avatar:"K"}); setScreen("app"); }} style={{
          width:"100%", background:"#FEE500", border:"none",
          color:"#3C1E1E", padding:"13px 16px", fontSize:14, fontWeight:700,
          display:"flex", alignItems:"center", justifyContent:"center", gap:10,
          marginBottom:10, borderRadius:12,
        }}>
          <svg width="20" height="20" viewBox="0 0 40 40" fill="#3C1E1E">
            <path d="M20 4C11.163 4 4 9.81 4 17c0 4.583 2.852 8.616 7.19 11.055L9.7 34.7a.5.5 0 00.74.555l7.25-4.83A19.73 19.73 0 0020 30c8.837 0 16-5.81 16-13S28.837 4 20 4z"/>
          </svg>
          카카오로 로그인
        </button>

        {/* 네이버 */}
        <button className="btn" onClick={() => { setLoginUser({name:"김지연",email:"naver",avatar:"N"}); setScreen("app"); }} style={{
          width:"100%", background:"#03C75A", border:"none",
          color:"#fff", padding:"13px 16px", fontSize:14, fontWeight:700,
          display:"flex", alignItems:"center", justifyContent:"center", gap:10,
          borderRadius:12,
        }}>
          <span style={{ fontSize:16, fontWeight:900, fontFamily:"Arial" }}>N</span>
          네이버로 로그인
        </button>

        <div style={{ marginTop:28, padding:"16px", background:R.surface2, borderRadius:10 }}>
          <p style={{ fontSize:11, color:R.muted }}>👶 아이 계정은 부모가 <strong>설정 탭</strong>에서 초대할 수 있어요</p>
        </div>
      </div>
    </div>
  );

  /* ════════════ HEADER ════════════ */
  const Header = () => (
    <header style={{
      background:R.surface, borderBottom:`1px solid ${R.border}`,
      padding:"12px 20px", display:"flex", alignItems:"center", justifyContent:"space-between",
      position:"sticky", top:0, zIndex:100, boxShadow:"0 1px 0 rgba(0,0,0,0.04)",
      gap:10,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
        <span style={{ fontSize:17 }}>📚</span>
        <span style={{ fontSize:15, fontWeight:800, letterSpacing:-.4, color:R.textHi }}>
          Study<span style={{color:R.orange9}}>Mate</span>
        </span>
      </div>

      {/* 아이 선택 (부모모드에서만) */}
      {mode === "parent" && (
        <div style={{ display:"flex", gap:5, alignItems:"center" }}>
          {children.map(c => (
            <button key={c.id} onClick={()=>setActiveChildId(c.id)} className="btn" style={{
              padding:"5px 11px", fontSize:12, fontWeight:700,
              background: activeChildId===c.id ? R.orange9 : R.surface2,
              color: activeChildId===c.id ? "#fff" : R.muted,
              border:`1px solid ${activeChildId===c.id ? R.orange9 : R.border}`,
            }}>{c.emoji} {c.name}</button>
          ))}
        </div>
      )}

      {/* 모드 전환 */}
      <div style={{ display:"flex", background:R.surface2, borderRadius:10, padding:3, border:`1px solid ${R.border}`, flexShrink:0 }}>
        {[{id:"parent",label:"부모",icon:"👨‍👩‍👧"},{id:"child",label:"아이",icon:"🧒"}].map(m=>(
          <button key={m.id} className="btn" onClick={()=>setMode(m.id)} style={{
            background:mode===m.id?R.surface:"transparent", color:mode===m.id?R.textHi:R.muted,
            padding:"5px 13px", fontSize:11, fontWeight:700,
            boxShadow:mode===m.id?"0 1px 3px rgba(0,0,0,0.1)":"none", border:"none",
          }}>{m.icon} {m.label}</button>
        ))}
      </div>

      {/* 당근 */}
      <div style={{ display:"flex", alignItems:"center", gap:5, background:R.orangeA, border:`1px solid ${R.orangeBd}`, borderRadius:20, padding:"4px 11px", flexShrink:0 }}>
        <span style={{fontSize:13}}>🥕</span>
        <span style={{fontSize:12,fontWeight:800,color:R.orange10}}>{wallet.toLocaleString()}</span>
      </div>
    </header>
  );

  /* ════════════ CHILD MODE ════════════ */
  const ChildMode = () => (
    <div style={{ maxWidth:440, margin:"0 auto", padding:"24px 18px" }}>
      <NavTabs
        tabs={[{id:"quest",label:"⚔️ 퀘스트"},{id:"wallet",label:"🥕 지갑"},{id:"shop",label:"🎁 상점"}]}
        active={childTab} onSelect={setChildTab}
      />

      {childTab === "quest" && (
        <div className="fadein">
          <div className="card" style={{ padding:"20px 22px", marginBottom:14, display:"flex", alignItems:"center", gap:18 }}>
            <Ring pct={pct} color={pct>=80?R.green9:R.orange9} size={72} stroke={8}>
              <span style={{fontSize:14,fontWeight:900,color:pct>=80?R.green9:R.orange9}}>{pct}%</span>
            </Ring>
            <div>
              <p style={{fontSize:11,color:R.muted,marginBottom:3}}>오늘의 달성률</p>
              <p style={{fontSize:22,fontWeight:800,color:R.textHi}}>{done} <span style={{fontSize:13,color:R.muted,fontWeight:600}}>/ {quests.length} 퀘스트</span></p>
              <p style={{fontSize:11,color:R.muted,marginTop:4}}>🥕 {quests.filter(q=>!q.done).reduce((s,q)=>s+q.reward,0)}개 더 받을 수 있어요</p>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {quests.map((q,i) => (
              <button key={i} onClick={()=>toggleQuest(i)} className={`quest-item ${q.done?"quest-done":""}`}>
                <div style={{ width:32,height:32,borderRadius:"50%",flexShrink:0, background:q.done?R.greenA:R.surface2, border:`1.5px solid ${q.done?R.green9:R.border2}`, display:"flex",alignItems:"center",justifyContent:"center", fontSize:q.done?14:16,color:q.done?R.green9:"inherit",fontWeight:700 }}>
                  {q.done?"✓":q.emoji}
                </div>
                <div style={{flex:1}}>
                  <p style={{fontSize:13,fontWeight:700,color:q.done?R.green9:R.textHi,textDecoration:q.done?"line-through":"none"}}>{q.task}</p>
                  <p style={{fontSize:11,color:R.muted,marginTop:2}}>{q.subject} · {q.area}</p>
                </div>
                <Tag color={q.done?R.green10:R.orange10} bg={q.done?R.greenA:R.orangeA} bd={q.done?R.greenBd:R.orangeBd}>🥕 +{q.reward}</Tag>
              </button>
            ))}
          </div>
        </div>
      )}

      {childTab === "wallet" && (
        <div className="fadein">
          <div className="card" style={{padding:"28px 24px",textAlign:"center",marginBottom:14}}>
            <div style={{fontSize:38,marginBottom:6}}>🥕</div>
            <div style={{fontSize:40,fontWeight:900,color:R.orange10,letterSpacing:-1}}>{wallet.toLocaleString()}</div>
            <p style={{fontSize:13,color:R.muted,marginTop:5}}>당근 보유 중</p>
          </div>
          <div className="card" style={{padding:"18px 20px"}}>
            <p style={{fontSize:12,fontWeight:700,color:R.muted,marginBottom:12}}>이번 주 내역</p>
            {HISTORY_SAMPLE.map((h,i)=>(
              <div key={i}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0"}}>
                  <div><p style={{fontSize:13,fontWeight:600,color:R.text}}>{h.desc}</p><p style={{fontSize:11,color:R.muted,marginTop:2}}>{h.day}</p></div>
                  <span style={{fontSize:13,fontWeight:800,color:h.amount>0?R.green9:R.red9}}>{h.amount>0?"+":""}{h.amount} 🥕</span>
                </div>
                {i<HISTORY_SAMPLE.length-1&&<div style={{height:1,background:R.border}}/>}
              </div>
            ))}
          </div>
        </div>
      )}

      {childTab === "shop" && (
        <div className="fadein">
          <p style={{fontSize:12,color:R.muted,marginBottom:13}}>보유 중: <strong style={{color:R.orange10}}>🥕 {wallet}개</strong></p>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {REWARDS_LIST.map((r,i)=>{
              const ok=wallet>=r.cost;
              return (
                <div key={i} className="card" style={{padding:"14px 18px",display:"flex",alignItems:"center",gap:13,opacity:ok?1:.45}}>
                  <span style={{fontSize:22,flexShrink:0}}>{r.icon}</span>
                  <p style={{flex:1,fontSize:13,fontWeight:700,color:R.text}}>{r.name}</p>
                  <button className="btn" style={{background:ok?R.orange9:R.surface2,color:ok?"#fff":R.muted,padding:"7px 14px",fontSize:12,fontWeight:800,cursor:ok?"pointer":"not-allowed",border:`1px solid ${ok?R.orange9:R.border}`}}>🥕 {r.cost}</button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  /* ════════════ SHARE MODAL ════════════ */
  const ShareModal = () => {
    const weakAreas = radarData.flatMap(s=>s.data.filter(d=>d.score<40).map(d=>({subject:s.subject,...d}))).sort((a,b)=>a.score-b.score);
    const best = radarData.map(s=>({subject:s.subject,avg:Math.round(s.data.reduce((a,d)=>a+d.score,0)/s.data.length)})).sort((a,b)=>b.avg-a.avg)[0];
    return (
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.35)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,backdropFilter:"blur(4px)"}} onClick={()=>setShareModal(false)}>
        <div onClick={e=>e.stopPropagation()} className="card fadein" style={{width:340,padding:"28px 26px",boxShadow:"0 8px 40px rgba(0,0,0,0.18)"}}>
          <p style={{fontSize:15,fontWeight:800,color:R.textHi,marginBottom:4}}>📤 맘카페 공유하기</p>
          <p style={{fontSize:11,color:R.muted,marginBottom:18}}>워터마크가 포함된 리포트 이미지를 저장해요</p>
          <div style={{display:"flex",gap:8,marginBottom:18}}>
            {[{id:"proud",emoji:"🌟",label:"자랑 모드",desc:"잘하고 있어요!"},{id:"worry",emoji:"🤔",label:"고민 모드",desc:"이 부분 어떡하죠?"}].map(m=>(
              <button key={m.id} onClick={()=>setShareMode(m.id)} className="btn" style={{flex:1,padding:"12px 8px",textAlign:"center",background:shareMode===m.id?(m.id==="proud"?R.greenA:R.amberA):R.surface2,border:`1.5px solid ${shareMode===m.id?(m.id==="proud"?R.greenBd:R.amberBd):R.border}`,borderRadius:12}}>
                <div style={{fontSize:20,marginBottom:4}}>{m.emoji}</div>
                <div style={{fontSize:12,fontWeight:800,color:shareMode===m.id?R.textHi:R.muted}}>{m.label}</div>
                <div style={{fontSize:10,color:R.muted,marginTop:2}}>{m.desc}</div>
              </button>
            ))}
          </div>
          <div style={{background:shareMode==="proud"?"linear-gradient(135deg,#f0faf5,#e8f7ef)":"linear-gradient(135deg,#fffbf0,#fff3d6)",border:`1px solid ${shareMode==="proud"?R.greenBd:R.amberBd}`,borderRadius:14,padding:"16px 18px",marginBottom:16}}>
            {shareMode==="proud"?(<><p style={{fontSize:13,fontWeight:800,color:R.textHi,marginBottom:4}}>🌟 이번 주 {best?.subject} 학습 밸런스 완벽!</p><p style={{fontSize:11,color:R.subtle}}>국영수 균형 잡힌 학습 중이에요 💪</p></>):(<><p style={{fontSize:13,fontWeight:800,color:R.textHi,marginBottom:4}}>🤔 {weakAreas[0]?.subject} {weakAreas[0]?.area} 부분이 비었어요</p><p style={{fontSize:11,color:R.subtle}}>이 부분 채워줄 교재 추천 부탁드려요!</p></>)}
            <div style={{marginTop:10,paddingTop:8,borderTop:`1px solid ${shareMode==="proud"?R.greenBd:R.amberBd}`,fontSize:10,color:R.muted,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span>📚 StudyMate 학습 밸런스 리포트</span>
              <span style={{background:R.orange9,color:"#fff",borderRadius:4,padding:"1px 6px",fontSize:9,fontWeight:700}}>studymate.app</span>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <button className="btn" style={{background:"#FEE500",color:"#3C1E1E",padding:"11px",fontSize:13,fontWeight:800,width:"100%",border:"none"}}>💬 카카오톡으로 공유</button>
            <div style={{display:"flex",gap:8}}>
              <button className="btn" style={{flex:1,background:R.surface2,border:`1px solid ${R.border}`,color:R.text,padding:"10px",fontSize:12,fontWeight:700}}>📷 이미지 저장</button>
              <button className="btn" style={{flex:1,background:"#03C75A",color:"#fff",border:"none",padding:"10px",fontSize:12,fontWeight:700}}>N 네이버 카페</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ════════════ CHILD MODAL ════════════ */
  const ChildModal = () => (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.35)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,backdropFilter:"blur(4px)"}} onClick={()=>setChildModal(false)}>
      <div onClick={e=>e.stopPropagation()} className="card fadein" style={{width:340,padding:"28px 26px",boxShadow:"0 8px 40px rgba(0,0,0,0.18)"}}>
        <p style={{fontSize:15,fontWeight:800,color:R.textHi,marginBottom:20}}>{childModal==="add"?"👶 아이 추가":"✏️ 아이 정보 편집"}</p>

        {/* 이모지 선택 */}
        <p style={{fontSize:11,fontWeight:700,color:R.muted,marginBottom:8}}>프로필 이모지</p>
        <div style={{display:"flex",gap:8,marginBottom:18,flexWrap:"wrap"}}>
          {CHILD_EMOJIS.map(e=>(
            <button key={e} onClick={()=>setChildDraft(d=>({...d,emoji:e}))} className="btn" style={{
              width:38,height:38,fontSize:20,background:childDraft.emoji===e?R.orangeA:R.surface2,
              border:`1.5px solid ${childDraft.emoji===e?R.orangeBd:R.border}`,
            }}>{e}</button>
          ))}
        </div>

        {/* 이름 */}
        <p style={{fontSize:11,fontWeight:700,color:R.muted,marginBottom:6}}>이름 <span style={{color:R.red9}}>*</span></p>
        <input value={childDraft.name} onChange={e=>setChildDraft(d=>({...d,name:e.target.value}))}
          placeholder="예: 김민준"
          style={{width:"100%",border:`1px solid ${R.border2}`,borderRadius:8,padding:"9px 12px",fontSize:13,color:R.textHi,background:R.surface2,outline:"none",marginBottom:16}}
        />

        {/* 학년 */}
        <p style={{fontSize:11,fontWeight:700,color:R.muted,marginBottom:8}}>학년</p>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:22}}>
          {GRADES.map(g=>(
            <button key={g} onClick={()=>setChildDraft(d=>({...d,grade:g}))} className="btn" style={{
              padding:"5px 10px",fontSize:11,fontWeight:700,
              background:childDraft.grade===g?R.blue9:R.surface2,
              color:childDraft.grade===g?"#fff":R.muted,
              border:`1px solid ${childDraft.grade===g?R.blue9:R.border}`,
            }}>{g}</button>
          ))}
        </div>

        <div style={{display:"flex",gap:8}}>
          <button onClick={saveChild} className="btn" style={{flex:1,background:childDraft.name.trim()?R.blue9:R.border,color:childDraft.name.trim()?"#fff":R.muted,padding:"11px",fontSize:13,fontWeight:800,border:"none"}}>저장</button>
          <button onClick={()=>setChildModal(false)} className="btn" style={{background:R.surface2,border:`1px solid ${R.border}`,color:R.muted,padding:"11px 16px",fontSize:13,fontWeight:700}}>취소</button>
        </div>
      </div>
    </div>
  );

  /* ════════════ BALANCE TAB ════════════ */
  const BalanceTab = () => {
    const weakAreas = radarData.flatMap(s=>s.data.filter(d=>d.score<40).map(d=>({subject:s.subject,...d}))).sort((a,b)=>a.score-b.score).slice(0,3);
    return (
      <div className="fadein">
        <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:18}}>
          {weakAreas.length>0&&(
            <div style={{flex:1,background:R.redA,border:`1px solid ${R.redBd}`,borderRadius:12,padding:"11px 16px",fontSize:12,color:R.red9,fontWeight:600}}>
              ⚠️ {weakAreas.map(w=>`${w.subject} ${w.area}(${w.score}%)`).join(" · ")} 부족해요!
            </div>
          )}
          <button className="btn" onClick={()=>setShareModal(true)} style={{flexShrink:0,background:"linear-gradient(135deg,#f76b15,#ffb224)",color:"#fff",border:"none",padding:"10px 16px",fontSize:12,fontWeight:800,borderRadius:12,boxShadow:"0 2px 8px rgba(247,107,21,0.3)"}}>📤 공유</button>
        </div>
        <div style={{background:R.blueA,border:`1px solid ${R.blueBd}`,borderRadius:10,padding:"10px 14px",fontSize:12,color:R.blue10,fontWeight:600,marginBottom:16}}>
          📅 스케줄 세부 영역 연동 중 — 퀘스트 완료 시 점수 자동 반영
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          {radarData.map((subj,si) => {
            const avg=Math.round(subj.data.reduce((s,d)=>s+d.score,0)/subj.data.length);
            const weakest=subj.data.reduce((a,b)=>a.score<b.score?a:b);
            const avgColor=avg>=70?R.green9:avg>=45?R.amber9:R.red9;
            const isEditing=editingSubj===si;
            return (
              <div key={si} className="card" style={{padding:"16px 16px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                  <div style={{display:"flex",alignItems:"center",gap:5}}>
                    <span style={{fontSize:15}}>{subj.emoji}</span>
                    <span style={{fontSize:13,fontWeight:800,color:R.textHi}}>{subj.subject}</span>
                    <span style={{fontSize:13,fontWeight:800,color:avgColor}}>{avg}%</span>
                  </div>
                  <div style={{display:"flex",gap:4}}>
                    <button className="btn" onClick={()=>isEditing?closeEdit():openEdit(si)} style={{background:isEditing?R.surface2:R.blueA,color:isEditing?R.muted:R.blue9,border:`1px solid ${isEditing?R.border:R.blueBd}`,padding:"3px 8px",fontSize:10,fontWeight:700}}>{isEditing?"✕":"✏️"}</button>
                    {isEditing&&<button className="btn" onClick={saveEdit} style={{background:R.blue9,color:"#fff",border:"none",padding:"3px 8px",fontSize:10,fontWeight:700}}>저장</button>}
                  </div>
                </div>
                {!isEditing&&<p style={{fontSize:10,color:R.muted,marginBottom:6}}>부족: <span style={{color:R.red9,fontWeight:700}}>{weakest.area}({weakest.score}%)</span></p>}
                {isEditing&&editDraft&&(
                  <div style={{marginTop:8}}>
                    {editDraft.data.map((row,ai)=>(
                      <div key={ai} style={{display:"flex",alignItems:"center",gap:5,marginBottom:6}}>
                        <input value={row.area} onChange={e=>setEditDraft(d=>({...d,data:d.data.map((r,i)=>i===ai?{...r,area:e.target.value}:r)}))} style={{flex:"0 0 60px",border:`1px solid ${R.border2}`,borderRadius:6,padding:"4px 6px",fontSize:11,color:R.textHi,background:R.surface2,outline:"none"}}/>
                        <input type="range" min="0" max="100" value={row.score} onChange={e=>setEditDraft(d=>({...d,data:d.data.map((r,i)=>i===ai?{...r,score:Number(e.target.value)}:r)}))} style={{flex:1,accentColor:subj.color,cursor:"pointer"}}/>
                        <span style={{flex:"0 0 28px",fontSize:11,fontWeight:800,color:row.score>=70?R.green9:row.score>=40?R.amber9:R.red9}}>{row.score}%</span>
                        <button onClick={()=>editDraft.data.length>3&&setEditDraft(d=>({...d,data:d.data.filter((_,i)=>i!==ai)}))} style={{background:"none",border:"none",color:editDraft.data.length<=3?R.border2:R.red9,fontSize:13,cursor:editDraft.data.length<=3?"not-allowed":"pointer"}}>×</button>
                      </div>
                    ))}
                    <div style={{display:"flex",gap:6,marginTop:6}}>
                      <button onClick={()=>editDraft.data.length<8&&setEditDraft(d=>({...d,data:[...d.data,{area:"새영역",score:50}]}))} className="btn" style={{flex:1,background:R.greenA,border:`1px solid ${R.greenBd}`,color:R.green9,padding:"5px",fontSize:11,fontWeight:700}}>+ 추가</button>
                      <button onClick={()=>{setRadarData(p=>p.map((s,i)=>i===si?JSON.parse(JSON.stringify(SUBJECT_RADAR_TEMPLATE[si])):s));closeEdit();}} className="btn" style={{background:R.surface2,border:`1px solid ${R.border}`,color:R.muted,padding:"5px 10px",fontSize:11,fontWeight:700}}>↺</button>
                    </div>
                  </div>
                )}
                {!isEditing&&(
                  <ResponsiveContainer width="100%" height={170}>
                    <RadarChart data={subj.data} margin={{top:8,right:20,bottom:8,left:20}}>
                      <PolarGrid stroke={R.border2} strokeWidth={1}/>
                      <PolarAngleAxis dataKey="area" tick={{fontSize:9,fontFamily:"Pretendard,sans-serif",fill:R.subtle,fontWeight:600}}/>
                      <Radar dataKey="score" stroke={subj.color} fill={subj.color} fillOpacity={0.18} strokeWidth={2} dot={{r:2.5,fill:subj.color,strokeWidth:0}}/>
                      <Tooltip formatter={v=>[`${v}%`]} contentStyle={{background:R.surface,border:`1px solid ${R.border}`,borderRadius:8,fontSize:11,fontFamily:"Pretendard,sans-serif"}} labelStyle={{color:R.text,fontWeight:700}}/>
                    </RadarChart>
                  </ResponsiveContainer>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /* ════════════ SCHEDULE TAB ════════════ */
  const SchedForm = () => {
    if (!schedDraft) return null;
    const availAreas = getAreasFor(schedDraft.subject);
    return (
      <div className="card" style={{padding:"18px 20px",border:`1.5px solid ${R.blueBd}`,marginBottom:12}}>
        <p style={{fontSize:13,fontWeight:800,color:R.blue9,marginBottom:14}}>{editingSched==="new"?"➕ 새 스케줄 추가":"✏️ 스케줄 편집"}</p>
        <p style={{fontSize:11,fontWeight:700,color:R.muted,marginBottom:6}}>과목</p>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
          {radarData.map(s=>(
            <button key={s.subject} onClick={()=>setSchedDraft(d=>({...d,subject:s.subject,area:getAreasFor(s.subject)[0]||""}))} className="btn" style={{padding:"5px 11px",fontSize:12,fontWeight:700,background:schedDraft.subject===s.subject?R.blue9:R.surface2,color:schedDraft.subject===s.subject?"#fff":R.muted,border:`1px solid ${schedDraft.subject===s.subject?R.blue9:R.border}`}}>{s.subject}</button>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <p style={{fontSize:11,fontWeight:700,color:R.muted}}>세부 영역</p>
          <span style={{fontSize:10,color:R.blue9,fontWeight:600}}>📊 밸런스 차트 연동</span>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
          {availAreas.map(area=>{
            const score=radarData.find(s=>s.subject===schedDraft.subject)?.data.find(d=>d.area===area)?.score??0;
            const sc=score>=70?R.green9:score>=40?R.amber9:R.red9;
            const isActive=schedDraft.area===area;
            return (
              <button key={area} onClick={()=>setSchedDraft(d=>({...d,area}))} className="btn" style={{padding:"5px 10px",fontSize:11,fontWeight:700,background:isActive?R.blue9:R.surface2,color:isActive?"#fff":R.text,border:`1px solid ${isActive?R.blue9:R.border}`,display:"flex",alignItems:"center",gap:4}}>
                {area}<span style={{fontSize:9,fontWeight:800,color:isActive?"rgba(255,255,255,0.8)":sc,background:isActive?"rgba(255,255,255,0.18)":R.surface,borderRadius:3,padding:"1px 4px"}}>{score}%</span>
              </button>
            );
          })}
        </div>
        <p style={{fontSize:11,fontWeight:700,color:R.muted,marginBottom:6}}>과제 내용 <span style={{color:R.red9}}>*</span></p>
        <input value={schedDraft.task} onChange={e=>setSchedDraft(d=>({...d,task:e.target.value}))} placeholder="예: 심화 문제집 2장 풀기" style={{width:"100%",border:`1px solid ${R.border2}`,borderRadius:8,padding:"8px 12px",fontSize:13,color:R.textHi,background:R.surface2,outline:"none",marginBottom:12}}/>
        <p style={{fontSize:11,fontWeight:700,color:R.muted,marginBottom:6}}>반복 요일</p>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
          {ALL_DAYS.map(d=>{const active=schedDraft.days.includes(d);return(<button key={d} onClick={()=>toggleDay(d)} className="btn" style={{padding:"5px 10px",fontSize:11,fontWeight:700,background:active?R.blue9:R.surface2,color:active?"#fff":R.muted,border:`1px solid ${active?R.blue9:R.border}`}}>{d}</button>);})}
        </div>
        <p style={{fontSize:11,fontWeight:700,color:R.muted,marginBottom:6}}>당근 보상 — <span style={{color:R.orange9}}>🥕 {schedDraft.reward}개</span></p>
        <input type="range" min="5" max="200" step="5" value={schedDraft.reward} onChange={e=>setSchedDraft(d=>({...d,reward:Number(e.target.value)}))} style={{width:"100%",accentColor:R.orange9,marginBottom:16}}/>
        <div style={{display:"flex",gap:8}}>
          <button onClick={saveSched} className="btn" style={{flex:1,background:schedDraft.task.trim()?R.blue9:R.border,color:schedDraft.task.trim()?"#fff":R.muted,padding:"11px",fontSize:13,fontWeight:800,border:"none"}}>저장하기</button>
          <button onClick={cancelSched} className="btn" style={{background:R.surface2,border:`1px solid ${R.border}`,color:R.muted,padding:"11px 16px",fontSize:13,fontWeight:700}}>취소</button>
        </div>
      </div>
    );
  };

  const ScheduleTab = () => (
    <div className="fadein">
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
        <div style={{flex:1,background:R.greenA,border:`1px solid ${R.greenBd}`,borderRadius:10,padding:"10px 14px",fontSize:12,color:R.green10,fontWeight:600}}>💡 세부 영역 선택 시 밸런스 차트와 자동 연동돼요</div>
        <button onClick={openNewSched} className="btn" style={{background:R.blue9,color:"#fff",border:"none",padding:"10px 16px",fontSize:12,fontWeight:800,borderRadius:12,flexShrink:0,boxShadow:"0 2px 8px rgba(0,144,255,0.25)"}}>+ 추가</button>
      </div>
      {editingSched==="new"&&<SchedForm/>}
      <div style={{display:"flex",flexDirection:"column",gap:9}}>
        {schedules.length===0&&<div className="card" style={{padding:"32px",textAlign:"center",color:R.muted,fontSize:13}}>아직 스케줄이 없어요.<br/><span style={{color:R.blue9,fontWeight:700,cursor:"pointer"}} onClick={openNewSched}>+ 첫 스케줄 추가</span></div>}
        {schedules.map((s,i)=>{
          const score=radarData.find(r=>r.subject===s.subject)?.data.find(d=>d.area===s.area)?.score;
          const sc=score===undefined?R.muted:score>=70?R.green9:score>=40?R.amber9:R.red9;
          return editingSched===i?<SchedForm key={i}/>:(
            <div key={i} className="card" style={{padding:"14px 18px"}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3,flexWrap:"wrap"}}>
                    <p style={{fontSize:13,fontWeight:800,color:R.textHi}}>{s.subject}</p>
                    {s.area&&<span style={{background:R.blueA,border:`1px solid ${R.blueBd}`,color:R.blue10,borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:700,display:"flex",alignItems:"center",gap:3}}>{s.area}{score!==undefined&&<span style={{fontSize:10,fontWeight:800,color:sc}}>· {score}%</span>}</span>}
                    <Tag color={R.orange10} bg={R.orangeA} bd={R.orangeBd}>🥕 +{s.reward}</Tag>
                  </div>
                  <p style={{fontSize:12,color:R.subtle,marginBottom:7}}>{s.task}</p>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{s.days.map((d,j)=><span key={j} style={{background:R.surface2,border:`1px solid ${R.border2}`,borderRadius:5,padding:"2px 7px",fontSize:11,fontWeight:700,color:R.text}}>{d}</span>)}{s.days.length===0&&<span style={{fontSize:11,color:R.muted}}>요일 미설정</span>}</div>
                </div>
                <div style={{display:"flex",gap:5,flexShrink:0}}>
                  <button onClick={()=>openEditSched(i)} className="btn" style={{background:R.blueA,border:`1px solid ${R.blueBd}`,color:R.blue9,padding:"5px 9px",fontSize:11,fontWeight:700}}>✏️</button>
                  <button onClick={()=>deleteSched(i)} className="btn" style={{background:R.redA,border:`1px solid ${R.redBd}`,color:R.red9,padding:"5px 9px",fontSize:11,fontWeight:700}}>🗑️</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  /* ════════════ STATS TAB ════════════ */
  const StatsTab = () => (
    <div className="fadein">
      {/* 기간 선택 */}
      <div style={{display:"flex",gap:6,marginBottom:20}}>
        {[{id:"week",label:"📅 주간 통계"},{id:"month",label:"📆 월간 통계"}].map(r=>(
          <button key={r.id} onClick={()=>setStatsRange(r.id)} className="btn" style={{
            padding:"8px 18px",fontSize:12,fontWeight:700,
            background:statsRange===r.id?R.blue9:R.surface2,
            color:statsRange===r.id?"#fff":R.muted,
            border:`1px solid ${statsRange===r.id?R.blue9:R.border}`,
          }}>{r.label}</button>
        ))}
      </div>

      {statsRange === "week" && (
        <>
          {/* 이번 주 달성률 요약 */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
            {[
              {label:"이번 주 평균",value:`${Math.round(WEEK_STATS.reduce((s,d)=>s+d.pct,0)/7)}%`,color:R.green9},
              {label:"최고 달성일",value:"수요일",color:R.blue9},
              {label:"획득 당근",value:`🥕 ${WEEK_STATS.reduce((s,d)=>s+d.carrot,0)}`,color:R.orange10},
            ].map((s,i)=>(
              <div key={i} className="card" style={{padding:"14px 16px"}}>
                <p style={{fontSize:10,fontWeight:600,color:R.muted,marginBottom:4}}>{s.label}</p>
                <p style={{fontSize:17,fontWeight:800,color:s.color}}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* 일별 달성률 막대 */}
          <div className="card" style={{padding:"18px 20px",marginBottom:14}}>
            <p style={{fontSize:12,fontWeight:700,color:R.muted,marginBottom:14}}>일별 퀘스트 달성률</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={WEEK_STATS} margin={{top:5,right:10,left:-20,bottom:5}}>
                <CartesianGrid strokeDasharray="3 3" stroke={R.border} vertical={false}/>
                <XAxis dataKey="day" tick={{fontSize:11,fill:R.muted,fontFamily:"Pretendard,sans-serif"}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:R.muted,fontFamily:"Pretendard,sans-serif"}} domain={[0,100]} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:R.surface,border:`1px solid ${R.border}`,borderRadius:8,fontSize:11,fontFamily:"Pretendard,sans-serif"}} formatter={v=>[`${v}%`,"달성률"]}/>
                <Bar dataKey="pct" fill={R.blue9} radius={[5,5,0,0]} name="달성률"/>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 일별 당근 획득 */}
          <div className="card" style={{padding:"18px 20px"}}>
            <p style={{fontSize:12,fontWeight:700,color:R.muted,marginBottom:14}}>일별 🥕 당근 획득량</p>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={WEEK_STATS} margin={{top:5,right:10,left:-20,bottom:5}}>
                <CartesianGrid strokeDasharray="3 3" stroke={R.border} vertical={false}/>
                <XAxis dataKey="day" tick={{fontSize:11,fill:R.muted,fontFamily:"Pretendard,sans-serif"}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:R.muted,fontFamily:"Pretendard,sans-serif"}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:R.surface,border:`1px solid ${R.border}`,borderRadius:8,fontSize:11,fontFamily:"Pretendard,sans-serif"}} formatter={v=>[`${v}개`,"당근"]}/>
                <Line type="monotone" dataKey="carrot" stroke={R.orange9} strokeWidth={2.5} dot={{r:4,fill:R.orange9,strokeWidth:0}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {statsRange === "month" && (
        <>
          {/* 월간 요약 */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
            {[
              {label:"이번 달 총 퀘스트",value:"87개",color:R.blue9},
              {label:"평균 주간 달성률",value:"78%",color:R.green9},
              {label:"이번 달 당근",value:"🥕 1,240",color:R.orange10},
            ].map((s,i)=>(
              <div key={i} className="card" style={{padding:"14px 16px"}}>
                <p style={{fontSize:10,fontWeight:600,color:R.muted,marginBottom:4}}>{s.label}</p>
                <p style={{fontSize:17,fontWeight:800,color:s.color}}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* 주차별 과목 달성률 */}
          <div className="card" style={{padding:"18px 20px",marginBottom:14}}>
            <p style={{fontSize:12,fontWeight:700,color:R.muted,marginBottom:14}}>주차별 과목 달성률</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={MONTH_STATS} margin={{top:5,right:10,left:-20,bottom:5}}>
                <CartesianGrid strokeDasharray="3 3" stroke={R.border} vertical={false}/>
                <XAxis dataKey="week" tick={{fontSize:11,fill:R.muted,fontFamily:"Pretendard,sans-serif"}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:R.muted}} domain={[0,100]} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:R.surface,border:`1px solid ${R.border}`,borderRadius:8,fontSize:11,fontFamily:"Pretendard,sans-serif"}} formatter={v=>[`${v}%`]}/>
                <Legend wrapperStyle={{fontSize:11,fontFamily:"Pretendard,sans-serif"}}/>
                <Bar dataKey="국어" fill="#f76b15" radius={[3,3,0,0]}/>
                <Bar dataKey="영어" fill="#0090ff" radius={[3,3,0,0]}/>
                <Bar dataKey="수학" fill="#30a46c" radius={[3,3,0,0]}/>
                <Bar dataKey="과학" fill="#8e4ec6" radius={[3,3,0,0]}/>
                <Bar dataKey="사회" fill="#ffb224" radius={[3,3,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 과목별 성장 추세 */}
          <div className="card" style={{padding:"18px 20px"}}>
            <p style={{fontSize:12,fontWeight:700,color:R.muted,marginBottom:14}}>과목별 성장 추세</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={MONTH_STATS} margin={{top:5,right:10,left:-20,bottom:5}}>
                <CartesianGrid strokeDasharray="3 3" stroke={R.border} vertical={false}/>
                <XAxis dataKey="week" tick={{fontSize:11,fill:R.muted}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:R.muted}} domain={[0,100]} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:R.surface,border:`1px solid ${R.border}`,borderRadius:8,fontSize:11}} formatter={v=>[`${v}%`]}/>
                <Legend wrapperStyle={{fontSize:11,fontFamily:"Pretendard,sans-serif"}}/>
                <Line type="monotone" dataKey="국어" stroke="#f76b15" strokeWidth={2} dot={{r:3}}/>
                <Line type="monotone" dataKey="영어" stroke="#0090ff" strokeWidth={2} dot={{r:3}}/>
                <Line type="monotone" dataKey="수학" stroke="#30a46c" strokeWidth={2} dot={{r:3}}/>
                <Line type="monotone" dataKey="과학" stroke="#8e4ec6" strokeWidth={2} dot={{r:3}}/>
                <Line type="monotone" dataKey="사회" stroke="#ffb224" strokeWidth={2} dot={{r:3}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );

  /* ════════════ RING BOARD TAB ════════════ */
  const RingBoardTab = () => {
    const childrenRingData = children.map((c,ci) => ({
      ...c,
      weeks: ci===0 ? RING_DATA_MINJON : RING_DATA_SOOAH,
    }));
    const subjectRings = radarData.map(s => ({
      subject: s.subject, emoji: s.emoji, color: s.color,
      avg: Math.round(s.data.reduce((a,d)=>a+d.score,0)/s.data.length),
    }));

    return (
      <div className="fadein">
        <div style={{background:R.blueA,border:`1px solid ${R.blueBd}`,borderRadius:10,padding:"10px 14px",fontSize:12,color:R.blue10,fontWeight:600,marginBottom:20}}>
          📊 링보드 — 아이별 주간 달성률을 한눈에 비교해요
        </div>

        {/* 주간 달성률 링 비교 */}
        <div className="card" style={{padding:"22px 22px",marginBottom:16}}>
          <p style={{fontSize:13,fontWeight:800,color:R.textHi,marginBottom:18}}>📅 이번 달 주간 달성률</p>
          <div style={{display:"flex",gap:20,overflowX:"auto",paddingBottom:4}}>
            {childrenRingData.map((c) => (
              <div key={c.id} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14,minWidth:140}}>
                <div style={{fontSize:13,fontWeight:700,color:R.textHi}}>{c.emoji} {c.name}</div>
                <div style={{display:"flex",gap:12,alignItems:"flex-end"}}>
                  {RING_WEEKS.map((wk,wi) => {
                    const p = c.weeks[wi];
                    const col = p>=80?R.green9:p>=60?R.blue9:p>=40?R.amber9:R.red9;
                    const isThis = wi===3;
                    return (
                      <div key={wi} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
                        <Ring pct={p} color={col} size={isThis?68:54} stroke={isThis?8:6}>
                          <span style={{fontSize:isThis?12:10,fontWeight:900,color:col}}>{p}%</span>
                        </Ring>
                        <span style={{fontSize:10,fontWeight:isThis?700:500,color:isThis?R.textHi:R.muted}}>{wk}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 이번 주 아이별 달성률 상세 비교 */}
        <div className="card" style={{padding:"22px 22px",marginBottom:16}}>
          <p style={{fontSize:13,fontWeight:800,color:R.textHi,marginBottom:16}}>🔥 이번 주 달성률 비교</p>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {childrenRingData.map(c => {
              const p = c.weeks[3];
              const col = p>=80?R.green9:p>=60?R.blue9:p>=40?R.amber9:R.red9;
              return (
                <div key={c.id} style={{display:"flex",alignItems:"center",gap:14}}>
                  <Ring pct={p} color={col} size={52} stroke={6}>
                    <span style={{fontSize:10,fontWeight:900,color:col}}>{p}%</span>
                  </Ring>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                      <span style={{fontSize:13,fontWeight:700,color:R.textHi}}>{c.emoji} {c.name} <span style={{fontSize:11,color:R.muted}}>({c.grade})</span></span>
                      <span style={{fontSize:13,fontWeight:800,color:col}}>{p}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{width:`${p}%`,background:col}}/>
                    </div>
                    <p style={{fontSize:10,color:R.muted,marginTop:4}}>
                      {p>=80?"🌟 이번 주 목표 달성!":p>=60?"💪 잘 하고 있어요":p>=40?"📚 조금 더 힘내봐요":"⚠️ 오늘부터 다시 시작해요"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 과목별 링 현황 */}
        <div className="card" style={{padding:"22px 22px"}}>
          <p style={{fontSize:13,fontWeight:800,color:R.textHi,marginBottom:16}}>📚 {activeChild.name}의 과목별 밸런스</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
            {subjectRings.map((s,i) => (
              <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                <Ring pct={s.avg} color={s.color} size={58} stroke={7}>
                  <span style={{fontSize:11,fontWeight:900,color:s.color}}>{s.avg}%</span>
                </Ring>
                <span style={{fontSize:11,fontWeight:700,color:R.text}}>{s.emoji} {s.subject}</span>
              </div>
            ))}
          </div>
          {/* 가로 달성률 바 */}
          <div style={{marginTop:18,display:"flex",flexDirection:"column",gap:8}}>
            {subjectRings.sort((a,b)=>b.avg-a.avg).map((s,i)=>(
              <div key={i}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                  <span style={{fontSize:11,fontWeight:600,color:R.text}}>{s.emoji} {s.subject}</span>
                  <span style={{fontSize:11,fontWeight:800,color:s.color}}>{s.avg}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width:`${s.avg}%`,background:s.color}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  /* ════════════ CHILD MANAGEMENT TAB ════════════ */
  const ChildManageTab = () => (
    <div className="fadein">
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
        <p style={{flex:1,fontSize:12,color:R.muted}}>아이를 추가하거나 프로필을 수정할 수 있어요</p>
        <button onClick={openAddChild} className="btn" style={{background:R.blue9,color:"#fff",border:"none",padding:"9px 16px",fontSize:12,fontWeight:800,borderRadius:12,flexShrink:0,boxShadow:"0 2px 8px rgba(0,144,255,0.25)"}}>+ 아이 추가</button>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {children.map(c=>(
          <div key={c.id} className="card" style={{padding:"18px 20px",display:"flex",alignItems:"center",gap:14, border:activeChildId===c.id?`2px solid ${R.orange9}`:undefined}}>
            <div style={{width:52,height:52,borderRadius:"50%",background:activeChildId===c.id?R.orangeA:R.surface2,border:`2px solid ${activeChildId===c.id?R.orange9:R.border2}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>
              {c.emoji}
            </div>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:2}}>
                <p style={{fontSize:15,fontWeight:800,color:R.textHi}}>{c.name}</p>
                {activeChildId===c.id&&<span style={{background:R.orangeA,border:`1px solid ${R.orangeBd}`,color:R.orange9,borderRadius:20,padding:"2px 8px",fontSize:10,fontWeight:700}}>현재 선택</span>}
              </div>
              <p style={{fontSize:12,color:R.muted}}>{c.grade} · 🥕 {wallets[c.id]??0}개 보유</p>
            </div>
            <div style={{display:"flex",gap:6,flexShrink:0}}>
              <button onClick={()=>setActiveChildId(c.id)} className="btn" style={{background:activeChildId===c.id?R.orangeA:R.surface2,border:`1px solid ${activeChildId===c.id?R.orangeBd:R.border}`,color:activeChildId===c.id?R.orange9:R.muted,padding:"6px 11px",fontSize:11,fontWeight:700}}>선택</button>
              <button onClick={()=>openEditChild(c)} className="btn" style={{background:R.blueA,border:`1px solid ${R.blueBd}`,color:R.blue9,padding:"6px 11px",fontSize:11,fontWeight:700}}>✏️</button>
              {children.length>1&&<button onClick={()=>removeChild(c.id)} className="btn" style={{background:R.redA,border:`1px solid ${R.redBd}`,color:R.red9,padding:"6px 11px",fontSize:11,fontWeight:700}}>🗑️</button>}
            </div>
          </div>
        ))}
      </div>

      {/* 초대 코드 */}
      <div className="card" style={{padding:"20px 22px",marginTop:14}}>
        <p style={{fontSize:13,fontWeight:800,color:R.textHi,marginBottom:4}}>📱 아이 기기 연동</p>
        <p style={{fontSize:12,color:R.muted,marginBottom:14}}>아이 스마트폰에 StudyMate 앱 설치 후 아래 코드를 입력하면 아이 모드로 연결돼요</p>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {children.map((c,i)=>(
            <div key={c.id} style={{background:R.surface2,borderRadius:10,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <p style={{fontSize:11,color:R.muted,marginBottom:2}}>{c.emoji} {c.name} 연동 코드</p>
                <p style={{fontSize:22,fontWeight:900,letterSpacing:6,color:R.orange9}}>{4829+i*17}</p>
              </div>
              <button className="btn" style={{background:R.blue9,color:"#fff",border:"none",padding:"6px 14px",fontSize:11,fontWeight:700}}>복사</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ════════════ SETTINGS TAB ════════════ */
  const SettingsTab = () => (
    <div className="fadein" style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* 프로필 */}
      <div className="card" style={{padding:"20px 22px"}}>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
          <div style={{width:52,height:52,borderRadius:"50%",background:R.blueA,border:`2px solid ${R.blueBd}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:900,color:R.blue9,flexShrink:0}}>
            {loginUser?.avatar}
          </div>
          <div>
            <p style={{fontSize:15,fontWeight:800,color:R.textHi}}>{loginUser?.name}</p>
            <p style={{fontSize:12,color:R.muted}}>{loginUser?.email}</p>
          </div>
          <button onClick={()=>setScreen("login")} className="btn" style={{marginLeft:"auto",background:R.redA,border:`1px solid ${R.redBd}`,color:R.red9,padding:"6px 12px",fontSize:11,fontWeight:700}}>로그아웃</button>
        </div>
      </div>

      {/* 가족 공동 관리 */}
      <div className="card" style={{padding:"20px 22px"}}>
        <p style={{fontSize:14,fontWeight:800,color:R.textHi,marginBottom:4}}>👨‍👩‍👧 가족 공동 관리</p>
        <p style={{fontSize:12,color:R.muted,marginBottom:14}}>아빠·엄마가 함께 관리하면 승인 알림이 양쪽에 전달돼요</p>
        {[{name:"엄마 (나)",role:"관리자",avatar:"👩"},{name:"아빠",role:"공동 관리자",avatar:"👨"}].map((m,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:12,background:R.surface2,borderRadius:10,padding:"10px 14px",marginBottom:8}}>
            <span style={{fontSize:20}}>{m.avatar}</span>
            <div style={{flex:1}}><p style={{fontSize:13,fontWeight:700,color:R.textHi}}>{m.name}</p><p style={{fontSize:11,color:R.muted}}>{m.role}</p></div>
            <span style={{background:R.greenA,color:R.green9,border:`1px solid ${R.greenBd}`,borderRadius:20,padding:"2px 9px",fontSize:10,fontWeight:700}}>연결됨</span>
          </div>
        ))}
        <button className="btn" style={{width:"100%",background:"#FEE500",color:"#3C1E1E",padding:"11px",fontSize:13,fontWeight:800,border:"none",marginTop:4}}>💬 카카오톡으로 초대장 보내기</button>
      </div>

      {/* 친구 초대 리퍼럴 */}
      <div className="card" style={{padding:"20px 22px"}}>
        <p style={{fontSize:14,fontWeight:800,color:R.textHi,marginBottom:4}}>🎁 친구 초대하고 당근 받기</p>
        <p style={{fontSize:12,color:R.muted,marginBottom:14}}>친구가 가입하면 <strong style={{color:R.orange9}}>🥕 500개</strong> 지급!</p>
        <div style={{background:"linear-gradient(135deg,#fff8f0,#fff3e0)",border:`1px solid ${R.orangeBd}`,borderRadius:12,padding:"12px 16px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><p style={{fontSize:10,color:R.muted}}>내 초대 링크</p><p style={{fontSize:13,fontWeight:700,color:R.textHi}}>studymate.app/ref/mom</p></div>
          <button className="btn" style={{background:R.orange9,color:"#fff",padding:"6px 12px",fontSize:12,fontWeight:800,border:"none"}}>공유</button>
        </div>
        <div style={{display:"flex",justifyContent:"space-around"}}>
          {[{label:"초대 친구",value:"3명"},{label:"받은 당근",value:"🥕 1,500"},{label:"대기 중",value:"1명"}].map((s,i)=>(
            <div key={i} style={{textAlign:"center"}}><p style={{fontSize:15,fontWeight:800,color:R.orange10}}>{s.value}</p><p style={{fontSize:10,color:R.muted,marginTop:2}}>{s.label}</p></div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ════════════ PARENT MODE ════════════ */
  const ParentMode = () => (
    <div style={{maxWidth:680,margin:"0 auto",padding:"24px 20px"}}>
      <NavTabs
        tabs={[
          {id:"dashboard",label:"🏠 대시보드"},
          {id:"balance",label:"📊 밸런스"},
          {id:"schedule",label:"📅 스케줄"},
          {id:"stats",label:"📈 통계"},
          {id:"ringboard",label:"🏅 링보드"},
          {id:"children",label:"👶 아이 관리"},
          {id:"approve",label:"✅ 승인"},
          {id:"rewards",label:"🥕 보상"},
          {id:"settings",label:"⚙️ 설정"},
        ]}
        active={parentTab} onSelect={setParentTab}
      />

      {parentTab==="dashboard"&&(
        <div className="fadein">
          <div style={{background:"linear-gradient(135deg,rgba(247,107,21,0.08),rgba(255,178,36,0.08))",border:`1px solid ${R.orangeBd}`,borderRadius:12,padding:"12px 18px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:20}}>{activeChild.emoji}</span>
            <div><p style={{fontSize:13,fontWeight:800,color:R.textHi}}>{activeChild.name} <span style={{fontSize:11,color:R.muted,fontWeight:600}}>({activeChild.grade})</span></p><p style={{fontSize:11,color:R.muted}}>현재 보고 있는 아이</p></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
            {[{label:"오늘 달성률",value:pct+"%",color:R.green9},{label:"보유 당근",value:"🥕 "+wallet,color:R.orange10},{label:"승인 대기",value:"2건",color:R.red9}].map((s,i)=>(
              <div key={i} className="card" style={{padding:"14px 16px"}}><p style={{fontSize:10,fontWeight:600,color:R.muted,marginBottom:4}}>{s.label}</p><p style={{fontSize:18,fontWeight:800,color:s.color}}>{s.value}</p></div>
            ))}
          </div>
          <div className="card" style={{padding:"16px 20px"}}>
            <p style={{fontSize:12,fontWeight:700,color:R.muted,marginBottom:14}}>⚠️ 이번 주 부족한 영역</p>
            {[{subject:"영어",area:"말하기",pct:10},{subject:"과학",area:"실험/탐구",pct:22},{subject:"영어",area:"듣기",pct:28}].map((item,i,arr)=>(
              <div key={i} style={{marginBottom:i<arr.length-1?14:0}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:12,fontWeight:600,color:R.text}}>{item.subject} · {item.area}</span><span style={{fontSize:12,fontWeight:800,color:R.red9}}>{item.pct}%</span></div>
                <div className="progress-bar"><div className="progress-fill" style={{width:item.pct+"%",background:R.red9}}/></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {parentTab==="balance"&&<BalanceTab/>}
      {parentTab==="schedule"&&<ScheduleTab/>}
      {parentTab==="stats"&&<StatsTab/>}
      {parentTab==="ringboard"&&<RingBoardTab/>}
      {parentTab==="children"&&<ChildManageTab/>}

      {parentTab==="approve"&&(
        <div className="fadein" style={{display:"flex",flexDirection:"column",gap:12}}>
          {[{subject:"수학",task:"심화 2장 완료",time:"방금 전",emoji:"🔢"},{subject:"영어",task:"단어장 사진",time:"1시간 전",emoji:"🇬🇧"}].map((item,i)=>(
            <div key={i} className="card" style={{padding:"18px 20px"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}><span style={{fontSize:20}}>{item.emoji}</span><div><p style={{fontSize:13,fontWeight:700,color:R.textHi}}>{item.subject} — {item.task}</p><p style={{fontSize:11,color:R.muted,marginTop:2}}>{item.time} 업로드</p></div></div>
              <div style={{background:R.surface2,borderRadius:10,height:90,display:"flex",alignItems:"center",justifyContent:"center",color:R.muted,fontSize:12,marginBottom:12,border:`1px solid ${R.border}`}}>📷 업로드된 사진 미리보기</div>
              <div style={{display:"flex",gap:8}}>
                <button className="btn" style={{flex:1,background:R.greenA,border:`1px solid ${R.greenBd}`,color:R.green10,padding:"10px",fontSize:12,fontWeight:700}}>✅ 승인 · 당근 지급</button>
                <button className="btn" style={{flex:1,background:R.redA,border:`1px solid ${R.redBd}`,color:R.red9,padding:"10px",fontSize:12,fontWeight:700}}>🔄 재제출 요청</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {parentTab==="rewards"&&(
        <div className="fadein">
          <p style={{fontSize:12,color:R.muted,marginBottom:13}}>🥕 당근 1개 ≈ 5원 (수정 가능)</p>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {REWARDS_LIST.map((r,i)=>(
              <div key={i} className="card" style={{padding:"13px 18px",display:"flex",alignItems:"center",gap:13}}>
                <span style={{fontSize:20,flexShrink:0}}>{r.icon}</span>
                <p style={{flex:1,fontSize:13,fontWeight:700,color:R.text}}>{r.name}</p>
                <Tag color={R.orange10} bg={R.orangeA} bd={R.orangeBd}>🥕 {r.cost}</Tag>
              </div>
            ))}
          </div>
        </div>
      )}

      {parentTab==="settings"&&<SettingsTab/>}
    </div>
  );

  /* ════════════ RENDER ════════════ */
  if (screen === "login") return <LoginScreen />;

  return (
    <div style={{fontFamily:"'Pretendard',-apple-system,BlinkMacSystemFont,sans-serif",background:R.bg,minHeight:"100vh",color:R.text}}>
      <FontLink/>
      {shareModal&&<ShareModal/>}
      {childModal&&<ChildModal/>}
      <Header/>
      {mode==="child"?<ChildMode/>:<ParentMode/>}
    </div>
  );
}
