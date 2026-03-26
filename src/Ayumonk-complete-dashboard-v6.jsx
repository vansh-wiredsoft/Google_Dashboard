import { useState, useEffect, useRef } from "react";

// ─── BRAND COLORS ─────────────────────────────────────────────────────────────
const C = {
  bg:"#0b160c", card:"#111e12", border:"#1e3d20",
  g1:"#2C5F2D", g2:"#4A8C2A", g3:"#6DB33F", g4:"#97C95C",
  white:"#FFFFFF", cream:"#E8F0E0", muted:"#6B8F60",
  orange:"#E8924A", blue:"#4A90C4", purple:"#8B6FCB",
  gold:"#D4A843", teal:"#3AADA8", red:"#E05050", pink:"#f472b6",
};

// ─── PWA HELPERS & CONSTANTS ─────────────────────────────────────────────────
// In production these come from:
//   navigator.serviceWorker  (Service Worker API)
//   window.PushManager       (Web Push API)
//   window.indexedDB         (offline storage)
//
// Offline sync queue (simulated — production uses IndexedDB + Background Sync)
const OFFLINE_QUEUE_KEY = "ayumonk_offline_queue";

// Detect iOS manually (beforeinstallprompt not available)
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

// Detect if running in standalone PWA mode (installed)
const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;

// Push permission state
const getPushPermission = () =>
  typeof Notification !== "undefined" ? Notification.permission : "default";

// ─── LOGO SVG ─────────────────────────────────────────────────────────────────
const AyuLogo = ({ size=32 }) => (
  <svg width={size*1.65} height={size*0.72} viewBox="0 0 120 52" fill="none">
    <path d="M60 26C60 26 48 4 30 4 14 4 4 14 4 26 4 38 14 48 30 48 48 48 60 26 60 26Z"
      stroke="#4a7c2f" strokeWidth="5" fill="none" strokeLinecap="round"/>
    <path d="M60 26C60 26 72 4 90 4 106 4 116 14 116 26 116 38 106 48 90 48 72 48 60 26 60 26Z"
      stroke="#6db33f" strokeWidth="5" fill="none" strokeLinecap="round"/>
    <path d="M88 6C92 2 100 4 98 12 96 18 88 20 84 16 80 12 82 8 88 6Z" fill="#4a7c2f"/>
  </svg>
);

// ─── WELLNESS PARAMS ──────────────────────────────────────────────────────────
// ─── WELLNESS PARAMS WITH QUESTION-LEVEL SCORES & THRESHOLDS ─────────────────
// Each KPI has:
//   questions: individual question scores (simulated) + threshold for precision triggers
//   suggestions.kpiLevel: shown when overall KPI average_score is in risk/moderate band
//   suggestions.questionLevel: shown when a specific question score crosses threshold
const PARAMS = [
  { id:"sleep", label:"Sleep", icon:"🌙", color:"#7c6af7", weight:0.20, baseline:2.8, sfDomain:"Mental Health", inverse:false,
    questions:[
      { key:"SLEEP_Q1", label:"How well do you fall asleep?",    score:2.8, thresholdBelow:3.0, reverse:false },
      { key:"SLEEP_Q2", label:"How many hours do you sleep?",    score:2.1, thresholdBelow:2.5, reverse:false },
      { key:"SLEEP_Q3", label:"Do you wake up refreshed?",       score:2.4, thresholdBelow:2.5, reverse:false },
    ],
    suggestions:{
      kpiLevel:{
        aahar:"Warm turmeric milk at bedtime. Early dinner by 7PM.",
        vihar:"Digital detox from 9PM. Fixed wake-up alarm at 6AM.",
        aushadh:"Brahmi + Ashwagandha capsule at bedtime. Jatamansi oil on temples.",
      },
      questionLevel:[
        { key:"SLEEP_Q2", condition:"Sleep duration < 2.5", triggerMode:"question_score",
          aahar:"Eat last meal by 6:30PM. Avoid heavy protein at night.",
          vihar:"Strict 10PM alarm. Blackout curtains. Sleep mask.",
          aushadh:"Valerian root tea 30 min before bed." },
        { key:"SLEEP_Q3", condition:"Not refreshed < 2.5", triggerMode:"question_score",
          aahar:"Banana + warm milk protein combo before bed.",
          vihar:"Yoga Nidra 20-min audio. Cool room temperature.",
          aushadh:"Ashwagandha churna with ghee at bedtime." },
      ]
    }
  },
  { id:"stress", label:"Stress", icon:"🧘", color:"#f97316", weight:0.15, baseline:3.4, sfDomain:"Role Emotional", inverse:true,
    questions:[
      { key:"STRESS_Q1", label:"How often do you feel overwhelmed?",  score:3.8, thresholdAbove:3.5, reverse:true },
      { key:"STRESS_Q2", label:"Does stress disrupt your sleep?",      score:2.3, thresholdBelow:2.5, reverse:false },
      { key:"STRESS_Q3", label:"Can you unwind after work?",           score:2.9, thresholdBelow:3.0, reverse:false },
    ],
    suggestions:{
      kpiLevel:{
        aahar:"Reduce processed sugar. Ashwagandha latte in morning.",
        vihar:"5-min Anulom Vilom morning. Nature walk on weekends.",
        aushadh:"Shankhpushpi syrup. Adaptogenic herb blend.",
      },
      questionLevel:[
        { key:"STRESS_Q1", condition:"Overwhelmed score > 3.5 (reverse)", triggerMode:"question_score",
          aahar:"Sattvic diet: fruits, nuts, no processed food.",
          vihar:"10-min journaling at night. Phone-free hour after dinner.",
          aushadh:"Brahmi ghrita one teaspoon in warm water." },
        { key:"STRESS_Q2", condition:"Stress disrupting sleep < 2.5", triggerMode:"both",
          aahar:"Tart cherry juice in evening. Chamomile tea.",
          vihar:"Progressive muscle relaxation before bed.",
          aushadh:"Jatamansi + Brahmi combination capsule." },
      ]
    }
  },
  { id:"nutrition", label:"Nutrition", icon:"🥗", color:"#22c55e", weight:0.15, baseline:3.1, sfDomain:"General Health", inverse:false,
    questions:[
      { key:"NUTRITION_Q1", label:"How often do you eat home-cooked meals?", score:2.0, thresholdBelow:2.5, reverse:false },
      { key:"NUTRITION_Q2", label:"How many servings of veg do you eat?",    score:2.6, thresholdBelow:3.0, reverse:false },
      { key:"NUTRITION_Q3", label:"Do you avoid fried/processed snacks?",    score:2.8, thresholdBelow:3.0, reverse:false },
    ],
    suggestions:{
      kpiLevel:{
        aahar:"Seasonal vegetables + dals. Rainbow plate principle.",
        vihar:"Cook at home 5 nights/week. Eat slowly, chew 20x.",
        aushadh:"Triphala churna after dinner. Digestive enzyme support.",
      },
      questionLevel:[
        { key:"NUTRITION_Q1", condition:"Home-cooked meals < 2.5", triggerMode:"question_score",
          aahar:"Batch-cook dal + rice on weekends. Carry tiffin daily.",
          vihar:"Weekly meal plan Sunday using Ayumonk guide.",
          aushadh:"Digestive enzyme supplement with restaurant meals." },
      ]
    }
  },
  { id:"hydration", label:"Hydration", icon:"💧", color:"#38bdf8", weight:0.10, baseline:3.0, sfDomain:"Vitality", inverse:false,
    questions:[
      { key:"HYDRATION_Q1", label:"How many glasses of water per day?",    score:2.3, thresholdBelow:2.5, reverse:false },
      { key:"HYDRATION_Q2", label:"Do you feel thirsty frequently?",       score:3.6, thresholdAbove:3.5, reverse:true },
    ],
    suggestions:{
      kpiLevel:{
        aahar:"Jeera water each morning. 8 glasses/day minimum.",
        vihar:"Set phone alarm every 90 min as water reminder.",
        aushadh:"Coconut water electrolytes in summer.",
      },
      questionLevel:[
        { key:"HYDRATION_Q1", condition:"Water intake < 2.5 (< 4 glasses)", triggerMode:"question_score",
          aahar:"Jeera-infused water on waking. Coconut water at noon.",
          vihar:"Phone alarm every 90 minutes for water reminder.",
          aushadh:"Electrolyte powder in one glass daily." },
      ]
    }
  },
  { id:"digestion", label:"Digestion", icon:"🫁", color:"#a3e635", weight:0.10, baseline:3.2, sfDomain:"General Health", inverse:false,
    questions:[
      { key:"DIGESTION_Q1", label:"Do you experience bloating or gas?",    score:3.7, thresholdAbove:3.5, reverse:true },
      { key:"DIGESTION_Q2", label:"Do you have regular bowel movements?",  score:2.8, thresholdBelow:3.0, reverse:false },
    ],
    suggestions:{
      kpiLevel:{
        aahar:"Ginger-lemon tea post lunch. Warm water always.",
        vihar:"10-min walk after dinner. Vajrasana pose after meals.",
        aushadh:"Hingvastak churna before meals. Trikatu blend.",
      },
      questionLevel:[
        { key:"DIGESTION_Q1", condition:"Bloating/gas > 3.5 (reverse)", triggerMode:"question_score",
          aahar:"Avoid pulses at dinner. Fennel seed water after meals.",
          vihar:"Vajrasana for 10 min after every meal.",
          aushadh:"Hingvastak churna before meals. Triphala at bedtime." },
      ]
    }
  },
  { id:"activity",  label:"Activity",     icon:"🏃", color:"#fb923c", weight:0.10, baseline:2.9, sfDomain:"Physical Func.", inverse:false,
    questions:[
      { key:"ACTIVITY_Q1", label:"Minutes of daily movement?",         score:2.5, thresholdBelow:3.0, reverse:false },
      { key:"ACTIVITY_Q2", label:"Do you do structured exercise?",      score:1.9, thresholdBelow:2.0, reverse:false },
    ],
    suggestions:{
      kpiLevel:{
        aahar:"Light banana or dates pre-workout. Stay hydrated.",
        vihar:"20-min desk yoga at 11AM. Always take stairs.",
        aushadh:"Mahanarayan oil massage weekly.",
      },
      questionLevel:[
        { key:"ACTIVITY_Q2", condition:"No structured exercise < 2.0", triggerMode:"question_score",
          aahar:"Light banana pre-workout. Stay hydrated throughout.",
          vihar:"Start with 15-min walk. Take stairs always.",
          aushadh:"Mahanarayan oil self-massage every Sunday." },
      ]
    }
  },
  { id:"pain",      label:"Pain/Posture", icon:"🦴", color:"#e879f9", weight:0.10, baseline:3.3, sfDomain:"Bodily Pain", inverse:true,
    questions:[
      { key:"PAIN_Q1", label:"Do you experience back or neck pain?",    score:3.9, thresholdAbove:3.5, reverse:true },
      { key:"PAIN_Q2", label:"Is your desk setup ergonomic?",           score:2.6, thresholdBelow:2.5, reverse:false },
    ],
    suggestions:{
      kpiLevel:{
        aahar:"Anti-inflammatory diet. Turmeric golden milk.",
        vihar:"Shoulder rolls every 45 min. Ergonomic chair audit.",
        aushadh:"Mahamash tailam topical. Shallaki supplement.",
      },
      questionLevel:[
        { key:"PAIN_Q1", condition:"Back/neck pain > 3.5 (reverse)", triggerMode:"question_score",
          aahar:"Anti-inflammatory foods: ginger, turmeric, omega-3.",
          vihar:"Neck stretch + shoulder roll every 45 min.",
          aushadh:"Mahamash tailam oil massage twice weekly." },
      ]
    }
  },
  { id:"energy",    label:"Energy",       icon:"⚡", color:"#fbbf24", weight:0.10, baseline:3.1, sfDomain:"Role Physical", inverse:false,
    questions:[
      { key:"ENERGY_Q1", label:"Afternoon energy levels?",              score:1.9, thresholdBelow:2.0, reverse:false },
      { key:"ENERGY_Q2", label:"Do you wake up with energy?",           score:2.5, thresholdBelow:3.0, reverse:false },
    ],
    suggestions:{
      kpiLevel:{
        aahar:"Reduce afternoon carb load. Soak almonds overnight.",
        vihar:"10-min power nap at lunch. Sunlight exposure morning.",
        aushadh:"Chyawanprash every morning. Shilajit with warm milk.",
      },
      questionLevel:[
        { key:"ENERGY_Q1", condition:"Afternoon energy < 2.0 (always drained)", triggerMode:"question_score",
          aahar:"Soaked almonds in morning. Avoid post-lunch carbs.",
          vihar:"10-min power nap at 1PM. Morning sunlight 5 min.",
          aushadh:"Chyawanprash 1 tsp on empty stomach. Shilajit in warm milk." },
      ]
    }
  },
  { id:"emotional", label:"Emotional",    icon:"💚", color:"#34d399", weight:0.00, baseline:3.0, sfDomain:"Role Emotional", inverse:false,
    questions:[
      { key:"EMOTIONAL_Q1", label:"Do you feel emotionally balanced?",  score:2.8, thresholdBelow:3.0, reverse:false },
      { key:"EMOTIONAL_Q2", label:"Do you feel connected with others?", score:3.2, thresholdBelow:3.0, reverse:false },
    ],
    suggestions:{
      kpiLevel:{
        aahar:"Eat with family or a friend. Social meals boost mood.",
        vihar:"Gratitude journal 3 entries nightly. Disconnect from news.",
        aushadh:"None needed — lifestyle is the medicine.",
      },
      questionLevel:[]
    }
  },
  { id:"social",    label:"Social",       icon:"👨‍👩‍👧", color:"#f472b6", weight:0.00, baseline:2.8, sfDomain:"Social Func.", inverse:false,
    questions:[
      { key:"SOCIAL_Q1", label:"Shared family meals per week?",         score:2.2, thresholdBelow:2.5, reverse:false },
      { key:"SOCIAL_Q2", label:"Quality time with friends?",            score:2.4, thresholdBelow:2.5, reverse:false },
    ],
    suggestions:{
      kpiLevel:{
        aahar:"Shared meal ritual. Cook together as a family.",
        vihar:"Family meal 3x/week. One outdoor group activity monthly.",
        aushadh:"Community and belonging are the deepest healing.",
      },
      questionLevel:[]
    }
  },
];

// ─── GENERATED TREND DATA ─────────────────────────────────────────────────────
const clamp=(v,mn=1,mx=5)=>Math.min(mx,Math.max(mn,v));
const genSeries=(base,n,grow=0.06)=>{let v=base;return Array.from({length:n},()=>{v=clamp(v+(Math.random()-0.32)*0.4+grow);return +v.toFixed(2);});};
const DAILY={},WEEKLY={},MONTHLY={};
PARAMS.forEach(p=>{DAILY[p.id]=genSeries(p.baseline,30,0.04);WEEKLY[p.id]=genSeries(p.baseline,12,0.07);MONTHLY[p.id]=genSeries(p.baseline,6,0.12);});
const ALL_VIEWS=[DAILY,WEEKLY,MONTHLY];
const ALL_LABELS=[Array.from({length:30},(_,i)=>`D${i+1}`),Array.from({length:12},(_,i)=>`W${i+1}`),["Jan","Feb","Mar","Apr","May","Jun"]];
const computeIndex=scores=>+(PARAMS.reduce((s,p)=>s+(scores[p.id]||0)*p.weight,0)*20).toFixed(1);

// ─── HR DATA ──────────────────────────────────────────────────────────────────
const DEPTS=["Engineering","Marketing","Finance","HR","Operations","Product"];
const LOCATIONS=["Delhi","Mumbai","Bengaluru","Hyderabad","Pune"];
const AGE_BANDS=["20-25","26-30","31-35","36-40","41-50","50+"];
const GENDERS=["Male","Female","Other"];
const HR_ROWS=Array.from({length:240},(_,i)=>({
  dept:DEPTS[i%6],loc:LOCATIONS[i%5],age:AGE_BANDS[i%6],gender:GENDERS[i%3],
  wellnessIndex:+(58+Math.random()*30).toFixed(1),productivity:+(60+Math.random()*30).toFixed(1),
  engagement:+(55+Math.random()*35).toFixed(1),absenteeism:+(2+Math.random()*5).toFixed(1),
  sleep:+(2.8+Math.random()*1.5).toFixed(2),stress:+(2.5+Math.random()*2).toFixed(2),nutrition:+(3.0+Math.random()*1.5).toFixed(2),
}));

// ─── CHALLENGE DEFINITIONS ────────────────────────────────────────────────────
// ─── COMPANY KPI SCHEDULE ─────────────────────────────────────────────────────
// Production: fetched from GET /api/company/kpi-schedule (PostgreSQL: company_kpi_schedule)
// Rule: a challenge is shown ONLY when today falls within [kpi_start_date … kpi_end_date]
//       for the employee's company. If the KPI window hasn't started yet → "upcoming".
//       If it has ended → "ended" (challenge hidden, streak preserved, history accessible).
const _today = new Date();
const _d = (y,m,day) => new Date(y,m-1,day);

const COMPANY_KPI_SCHEDULE = [
  { kpi:"hydration", start:_d(2025,1,1),  end:_d(2025,12,31), theme:"Corporate Vitality",   programLabel:"Jan – Dec 2025" },
  { kpi:"sleep",     start:_d(2025,2,1),  end:_d(2025,12,31), theme:"Stress & Recovery",    programLabel:"Feb – Dec 2025" },
  { kpi:"activity",  start:_d(2025,3,1),  end:_d(2025,9,30),  theme:"Movement Drive Q2–Q3", programLabel:"Mar – Sep 2025" },
  { kpi:"nutrition", start:_d(2025,3,1),  end:_d(2025,6,30),  theme:"Metabolism Reset",     programLabel:"Mar – Jun 2025" },
  { kpi:"stress",    start:_d(2025,5,1),  end:_d(2025,10,31), theme:"Stress & Recovery",    programLabel:"May – Oct 2025" },
  { kpi:"emotional", start:_d(2025,7,1),  end:_d(2025,12,31), theme:"Mind & Mood",           programLabel:"Jul – Dec 2025" },
];

const _kpiStatus = e => _today < e.start ? "upcoming" : _today > e.end ? "ended" : "active";
const KPI_SCHEDULE_MAP = Object.fromEntries(
  COMPANY_KPI_SCHEDULE.map(e => [e.kpi, { ...e, status: _kpiStatus(e) }])
);
const isKpiActive = kpiId => KPI_SCHEDULE_MAP[kpiId]?.status === "active";
const _fmtDate = dt => dt.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"2-digit"});

// ─── CHALLENGE DEFINITIONS ────────────────────────────────────────────────────
const CHALLENGE_DEFS=[
  {id:"water",  icon:"💧",label:"Hydration Mission",  kpi:"hydration", color:"#38bdf8",xp:20,
   type:"counter",target:8,unit:"glasses",desc:"Drink 8 glasses today. Tap + after each glass."},
  {id:"sleep",  icon:"🌙",label:"Sleep Before 10PM",  kpi:"sleep",     color:"#7c6af7",xp:25,
   type:"toggle",options:["Committed to sleep by 10PM ✓"],desc:"One tap to commit. No screens 1 hr before."},
  {id:"activity",icon:"🏃",label:"Move Your Body",     kpi:"activity",  color:"#fb923c",xp:30,
   type:"choice",options:["🚶 Walk 15min","🧘 Yoga 20min","🏋️ Gym Session"],desc:"Pick what you did today — any one counts!"},
  {id:"nutrition",icon:"🥗",label:"Eat Well Today",    kpi:"nutrition", color:"#22c55e",xp:25,
   type:"multi",options:["🍎 Ate Fruits/Veggies","🍳 Home Cooked Meal"],desc:"Tap all that apply from today."},
  {id:"breathing",icon:"🧘",label:"4-7-8 Breathing",   kpi:"stress",    color:"#f97316",xp:20,
   type:"timer",duration:120,desc:"Inhale 4s → Hold 7s → Exhale 8s. 3 cycles. Tap Start."},
  {id:"mood",   icon:"💚",label:"Daily Mood Check",    kpi:"emotional", color:"#34d399",xp:10,
   type:"rating",options:["😞","😕","😐","🙂","😄"],desc:"How are you feeling right now?"},
];

const BADGES=[
  {id:"h1",label:"Hydration Hero", icon:"💧",earned:true, level:"Gold",  color:"#38bdf8"},
  {id:"s1",label:"Sleep Master",   icon:"🌙",earned:true, level:"Silver",color:"#7c6af7"},
  {id:"st",label:"Stress Buster",  icon:"🧘",earned:false,level:"Bronze",color:"#f97316"},
  {id:"g1",label:"Green Eater",    icon:"🥗",earned:true, level:"Bronze",color:"#22c55e"},
  {id:"a1",label:"Active Star",    icon:"🏃",earned:false,level:"Silver",color:"#fb923c"},
  {id:"b1",label:"Banyan Legend",  icon:"🌳",earned:false,level:"Legend",color:"#d4a843"},
];

// ─── SVG CHARTS ───────────────────────────────────────────────────────────────
// ─── PWA: INSTALL BANNER ──────────────────────────────────────────────────────
// Shows when the app is NOT installed (not in standalone mode).
// Android: captures beforeinstallprompt and shows custom Ayumonk banner.
// iOS:     shows manual Add-to-Home-Screen guide sheet.
function PWAInstallBanner({ onDismiss }) {
  const [ios]      = useState(isIOS());
  const [step, setStep] = useState(1); // ios guide: step 1/2/3
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(()=>{
    const handler = e => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", ()=>setInstalled(true));
    return ()=>{ window.removeEventListener("beforeinstallprompt", handler); };
  },[]);

  const handleAndroidInstall = async () => {
    if(!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if(outcome === "accepted") setInstalled(true);
    onDismiss();
  };

  if(installed) return (
    <div style={{background:"rgba(107,179,63,0.15)",border:"1px solid rgba(107,179,63,0.4)",borderRadius:12,padding:"12px 18px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
      <span style={{fontSize:20}}>✅</span>
      <div>
        <div style={{fontSize:11,fontWeight:700,color:C.g3}}>AyuMonk installed!</div>
        <div style={{fontSize:9,color:C.muted}}>Open from your home screen for the best experience and notifications.</div>
      </div>
    </div>
  );

  if(ios) return (
    <div style={{background:"rgba(74,140,42,0.08)",border:"1px solid rgba(107,179,63,0.3)",borderRadius:12,padding:"14px 18px",marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:20}}>📲</span>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:C.g3}}>Install AyuMonk on your iPhone</div>
            <div style={{fontSize:9,color:C.muted}}>3 steps · Takes 15 seconds · Enables push notifications</div>
          </div>
        </div>
        <button onClick={onDismiss} style={{background:"transparent",border:"none",color:C.muted,cursor:"pointer",fontSize:16,padding:"0 4px"}}>✕</button>
      </div>
      <div style={{display:"flex",gap:8}}>
        {[
          ["1","Tap the Share button","□↑","rgba(74,144,196,0.15)","#4A90C4"],
          ["2","Scroll and tap 'Add to Home Screen'","⊞+","rgba(107,179,63,0.15)",C.g3],
          ["3","Tap 'Add' in the top right","✓","rgba(212,168,67,0.15)",C.gold],
        ].map(([n,label,ico,bg,col])=>(
          <div key={n} style={{flex:1,background:bg,border:`1px solid ${col}44`,borderRadius:10,padding:"8px 10px",textAlign:"center",
            opacity:step>=parseInt(n)?1:0.45,cursor:"pointer",transition:"opacity 0.2s"}}
            onClick={()=>setStep(Math.max(step,parseInt(n)+1))}>
            <div style={{fontSize:20,marginBottom:4}}>{ico}</div>
            <div style={{fontSize:8,fontWeight:700,color:col,marginBottom:3}}>Step {n}</div>
            <div style={{fontSize:7.5,color:"rgba(255,255,255,0.5)",lineHeight:1.4}}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // Android / Desktop — show custom install button
  return (
    <div style={{background:"rgba(74,140,42,0.08)",border:"1px solid rgba(107,179,63,0.3)",borderRadius:12,padding:"12px 18px",marginBottom:14,display:"flex",alignItems:"center",gap:14}}>
      <span style={{fontSize:28,flexShrink:0}}>📲</span>
      <div style={{flex:1}}>
        <div style={{fontSize:11,fontWeight:700,color:C.g3,marginBottom:2}}>Install AyuMonk on your device</div>
        <div style={{fontSize:9,color:C.muted}}>Add to home screen for daily reminders, offline access, and an app-like experience. No App Store required.</div>
      </div>
      <div style={{display:"flex",gap:8,flexShrink:0}}>
        <button onClick={handleAndroidInstall}
          style={{padding:"7px 18px",borderRadius:9,background:`linear-gradient(135deg,${C.g1},${C.g2})`,border:"none",color:"#fff",fontWeight:700,fontSize:10,cursor:"pointer"}}>
          Install Now
        </button>
        <button onClick={onDismiss}
          style={{padding:"7px 10px",borderRadius:9,background:"transparent",border:"1px solid rgba(255,255,255,0.1)",color:C.muted,fontSize:10,cursor:"pointer"}}>
          Later
        </button>
      </div>
    </div>
  );
}

// ─── PWA: OFFLINE BADGE ────────────────────────────────────────────────────────
// Persistent status bar shown when device is offline.
// Queued completions display in a mini list so employee knows they'll sync.
function PWAOfflineBadge({ queueCount=0 }) {
  return (
    <div style={{
      background:"rgba(232,160,32,0.12)",border:"1px solid rgba(232,160,32,0.35)",
      borderRadius:9,padding:"6px 14px",marginBottom:12,
      display:"flex",alignItems:"center",gap:10
    }}>
      <span style={{fontSize:14}}>📡</span>
      <div style={{flex:1}}>
        <span style={{fontSize:10,fontWeight:700,color:C.gold}}>You're offline</span>
        <span style={{fontSize:9,color:C.muted,marginLeft:8}}>
          {queueCount>0
            ? `${queueCount} challenge completion${queueCount>1?"s":""} queued — will sync when you reconnect`
            : "Showing cached data · Changes will sync when reconnected"}
        </span>
      </div>
      <span style={{fontSize:9,color:"rgba(232,160,32,0.6)",fontWeight:600}}>OFFLINE</span>
    </div>
  );
}

// ─── PWA: PUSH PERMISSION PROMPT ───────────────────────────────────────────────
// Shows after install when notification permission is "default" (not yet asked).
function PWAPushPrompt({ onAllow, onSkip }) {
  const [loading, setLoading] = useState(false);
  const handleAllow = async () => {
    setLoading(true);
    try {
      // Production: Notification.requestPermission() + serviceWorker.pushManager.subscribe()
      await new Promise(r=>setTimeout(r,1200));
      onAllow();
    } catch(e) { onSkip(); }
    setLoading(false);
  };
  return (
    <div style={{
      position:"fixed",bottom:0,left:0,right:0,zIndex:1000,
      background:C.card,borderTop:`2px solid ${C.g2}`,
      padding:"18px 22px",display:"flex",alignItems:"center",gap:16,
      boxShadow:"0 -4px 24px rgba(0,0,0,0.5)"
    }}>
      <span style={{fontSize:32,flexShrink:0}}>🔔</span>
      <div style={{flex:1}}>
        <div style={{fontSize:13,fontWeight:700,color:"#fff",marginBottom:4}}>Enable wellness reminders?</div>
        <div style={{fontSize:9.5,color:C.muted,lineHeight:1.5}}>
          Get notified about daily challenges, streaks at risk, and badge milestones — straight to your notification shade.
          <br/>
          <span style={{color:C.g3}}>These appear in your phone shutter even when the app is closed.</span>
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:6,flexShrink:0}}>
        <button onClick={handleAllow} disabled={loading}
          style={{padding:"9px 22px",borderRadius:10,background:`linear-gradient(135deg,${C.g1},${C.g2})`,border:"none",color:"#fff",fontWeight:700,fontSize:11,cursor:"pointer",opacity:loading?0.7:1}}>
          {loading?"Enabling…":"Enable Reminders"}
        </button>
        <button onClick={onSkip}
          style={{padding:"7px 22px",borderRadius:10,background:"transparent",border:"1px solid rgba(255,255,255,0.1)",color:C.muted,fontSize:10,cursor:"pointer"}}>
          Not Now
        </button>
      </div>
    </div>
  );
}

// ─── SVG CHARTS ───────────────────────────────────────────────────────────────
function DonutChart({slices,size=130,cVal,cSub}){
  const cx=size/2,cy=size/2,r=size/2-10,ir=size/2-30;
  const total=slices.reduce((a,s)=>a+s.v,0);
  let angle=-Math.PI/2;
  return(
    <svg width={size} height={size}>
      {slices.map((s,i)=>{
        const sw=(s.v/total)*2*Math.PI;
        const x1=cx+r*Math.cos(angle),y1=cy+r*Math.sin(angle);
        angle+=sw;
        const x2=cx+r*Math.cos(angle),y2=cy+r*Math.sin(angle);
        const ix1=cx+ir*Math.cos(angle-sw),iy1=cy+ir*Math.sin(angle-sw);
        const ix2=cx+ir*Math.cos(angle),iy2=cy+ir*Math.sin(angle);
        const lg=sw>Math.PI?1:0;
        return <path key={i} d={`M${ix1},${iy1}L${x1},${y1}A${r},${r} 0 ${lg},1 ${x2},${y2}L${ix2},${iy2}A${ir},${ir} 0 ${lg},0 ${ix1},${iy1}Z`} fill={s.c} stroke={C.bg} strokeWidth="2"/>;
      })}
      {cVal&&<><text x={cx} y={cy-4} textAnchor="middle" fontSize="22" fontWeight="800" fill="#fff">{cVal}</text>
      <text x={cx} y={cy+14} textAnchor="middle" fontSize="9" fill={C.muted}>{cSub}</text></>}
    </svg>
  );
}

function Sparkline({values,color,w=110,h=28}){
  if(!values||values.length<2)return null;
  const mn=Math.min(...values)-0.2,mx=Math.max(...values)+0.2;
  const pts=values.map((v,i)=>[(i/(values.length-1))*w,h-((v-mn)/(mx-mn))*h]);
  const line=pts.map(([x,y])=>`${x},${y}`).join(" ");
  const area=`${pts[0][0]},${h} `+line+` ${pts[pts.length-1][0]},${h}`;
  return(
    <svg width={w} height={h} style={{overflow:"visible"}}>
      <polygon points={area} fill={color} opacity="0.1"/>
      <polyline points={line} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="3" fill={color}/>
    </svg>
  );
}

function MultiLine({series,labels,h=90,highlighted=[]}){
  if(!series||!series.length)return null;
  const all=series.flatMap(s=>s.vals);
  const mn=Math.min(...all)-0.3,mx=Math.max(...all)+0.3;
  const W=460,H=h;
  const px=i=>16+(i/(series[0].vals.length-1))*(W-24);
  const py=v=>6+((mx-v)/(mx-mn))*(H-14);
  return(
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{overflow:"visible"}}>
      {series.map((s,si)=>{
        const pts=s.vals.map((v,i)=>[px(i),py(v)]);
        const line=pts.map(([x,y])=>`${x},${y}`).join(" ");
        const area=`${pts[0][0]},${H} `+line+` ${pts[pts.length-1][0]},${H}`;
        const hi=highlighted.includes(s.id);
        return <g key={si}>
          {hi&&<polygon points={area} fill={s.c} opacity="0.06"/>}
          <polyline points={line} fill="none" stroke={s.c} strokeWidth={hi?2.5:1} strokeLinecap="round" strokeLinejoin="round" opacity={hi?1:0.28}/>
          <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r={hi?4:2.5} fill={s.c} opacity={hi?1:0.4}/>
        </g>;
      })}
      {labels&&labels.filter((_,i)=>i%Math.ceil(labels.length/7)===0).map((l,i)=>{
        const idx=labels.indexOf(l);
        return <text key={i} x={px(idx)} y={H+2} fontSize="7" fill="rgba(255,255,255,0.2)" textAnchor="middle">{l}</text>;
      })}
    </svg>
  );
}

function BarChart({data,color="#6db33f",h=80}){
  const max=Math.max(...data.map(d=>d.v),1);
  return(
    <div style={{display:"flex",alignItems:"flex-end",gap:4,height:h}}>
      {data.map((d,i)=>(
        <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
          <span style={{fontSize:8,color,fontWeight:700}}>{d.v}</span>
          <div style={{width:"100%",borderRadius:"3px 3px 0 0",background:color,opacity:0.75,height:`${Math.max(4,(d.v/max)*62)}px`,transition:"height 0.5s"}}/>
          <span style={{fontSize:7,color:"rgba(255,255,255,0.3)",textAlign:"center"}}>{d.l.slice(0,5)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── SHARED UI ────────────────────────────────────────────────────────────────
const Card=({children,style={},color,onClick})=>(
  <div onClick={onClick} style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${color||"rgba(255,255,255,0.07)"}`,
    borderRadius:14,padding:"14px 16px",position:"relative",overflow:"hidden",
    cursor:onClick?"pointer":"default",transition:"all 0.2s",...style}}
    onMouseEnter={onClick?e=>{e.currentTarget.style.borderColor=(color||"#6db33f")+"88";e.currentTarget.style.transform="translateY(-1px)";}:undefined}
    onMouseLeave={onClick?e=>{e.currentTarget.style.borderColor=color||"rgba(255,255,255,0.07)";e.currentTarget.style.transform="";}:undefined}
  >{children}</div>
);

const Btn=({children,active,color="#6db33f",onClick,disabled,style={}})=>(
  <button disabled={disabled} onClick={onClick} style={{
    background:active?color:"transparent",color:active?"#fff":color,
    border:`1.5px solid ${color}`,borderRadius:9,padding:"7px 14px",
    fontSize:11,fontWeight:600,cursor:disabled?"not-allowed":"pointer",
    opacity:disabled?0.45:1,transition:"all 0.2s",...style
  }}>{children}</button>
);

// ─── WELLNESS DASHBOARD ───────────────────────────────────────────────────────
function WellnessDashboard({viewData,labels,timeView,setTimeView}){
  const [selectedKPI,setSelectedKPI]=useState(null);
  const [mood,setMood]=useState(null);
  const VIEWS=["Daily","Weekly","Monthly"];

  const scores={},first={};
  PARAMS.forEach(p=>{scores[p.id]=viewData[p.id][viewData[p.id].length-1];first[p.id]=viewData[p.id][0];});
  const currIdx=computeIndex(scores);
  const baseIdx=computeIndex(first);
  const idxDelta=((currIdx-baseIdx)/baseIdx*100).toFixed(0);

  const improvements=PARAMS.map(p=>{
    const curr=viewData[p.id][viewData[p.id].length-1];
    const prev=viewData[p.id][Math.max(0,viewData[p.id].length-4)];
    const pct=p.inverse?-(curr-prev)/prev*100:(curr-prev)/prev*100;
    return{...p,pct};
  }).sort((a,b)=>b.pct-a.pct);
  const topTwo=improvements.slice(0,2);
  const weakParams=improvements.slice(-3);

  const pieSlices=PARAMS.filter(p=>p.weight>0).map(p=>({l:p.label,v:scores[p.id]*p.weight*20,c:p.color}));
  const sp=selectedKPI?PARAMS.find(p=>p.id===selectedKPI):null;

  return(
    <div>
      {/* KPI STRIP */}
      <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:8,marginBottom:18,scrollbarWidth:"none"}}>
        {PARAMS.map(p=>{
          const curr=viewData[p.id][viewData[p.id].length-1];
          const pct=p.inverse?-(curr-p.baseline)/p.baseline*100:(curr-p.baseline)/p.baseline*100;
          const sel=selectedKPI===p.id;
          return(
            <div key={p.id} onClick={()=>setSelectedKPI(sel?null:p.id)} style={{
              minWidth:88,background:sel?p.color+"22":"rgba(255,255,255,0.03)",
              border:`1px solid ${sel?p.color:p.color+"33"}`,borderRadius:12,padding:"10px 8px",
              cursor:"pointer",transition:"all 0.2s",flexShrink:0,textAlign:"center"
            }}>
              <div style={{fontSize:18,marginBottom:3}}>{p.icon}</div>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",marginBottom:3}}>{p.label}</div>
              <div style={{fontSize:16,fontWeight:800,color:p.color,lineHeight:1}}>{curr.toFixed(1)}</div>
              <div style={{fontSize:10,fontWeight:700,marginTop:3,color:pct>=0?"#4ade80":"#f87171"}}>{pct>=0?"▲":"▼"}{Math.abs(pct).toFixed(0)}%</div>
              <div style={{marginTop:4}}><Sparkline values={viewData[p.id].slice(-7)} color={p.color} w={74} h={16}/></div>
            </div>
          );
        })}
      </div>

      {/* MAIN 3-COL GRID */}
      <div style={{display:"grid",gridTemplateColumns:"190px 1fr 210px",gap:14,marginBottom:16}}>

        {/* PIE: Wellness Index */}
        <Card>
          <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8,textAlign:"center"}}>Wellness Index</div>
          <div style={{display:"flex",justifyContent:"center"}}>
            <DonutChart slices={pieSlices} size={130} cVal={currIdx} cSub="/ 100"/>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center",marginTop:8}}>
            {pieSlices.map(s=>(
              <div key={s.l} style={{display:"flex",alignItems:"center",gap:2,fontSize:8,color:"rgba(255,255,255,0.38)"}}>
                <span style={{width:5,height:5,borderRadius:1,background:s.c,display:"inline-block"}}/>
                {s.l}
              </div>
            ))}
          </div>
          <div style={{textAlign:"center",marginTop:8}}>
            <span style={{background:"#16a34a22",borderRadius:8,padding:"3px 10px",fontSize:11,fontWeight:700,color:"#4ade80"}}>▲ {idxDelta}% from baseline</span>
          </div>
        </Card>

        {/* TREND LINES */}
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div>
              <div style={{fontSize:12,fontWeight:700}}>Wellness Trends</div>
              <div style={{fontSize:9,color:C.muted}}>Bold lines = most improved recently</div>
            </div>
            <div style={{display:"flex",gap:3,background:"rgba(0,0,0,0.3)",borderRadius:8,padding:3}}>
              {VIEWS.map((v,i)=>(
                <button key={v} onClick={()=>setTimeView(i)} style={{
                  padding:"4px 10px",borderRadius:6,border:"none",fontSize:9,fontWeight:600,cursor:"pointer",
                  background:timeView===i?C.g3:"transparent",color:timeView===i?"#fff":"rgba(255,255,255,0.4)"
                }}>{v}</button>
              ))}
            </div>
          </div>
          <MultiLine h={96} labels={labels}
            series={PARAMS.map(p=>({id:p.id,c:p.color,vals:viewData[p.id]}))}
            highlighted={topTwo.map(t=>t.id)}
          />
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:10}}>
            {topTwo.map(p=>(
              <div key={p.id} style={{display:"flex",alignItems:"center",gap:4,background:p.color+"22",borderRadius:8,padding:"3px 9px"}}>
                <span style={{fontSize:10}}>{p.icon}</span>
                <span style={{fontSize:9,color:p.color,fontWeight:700}}>{p.label} ▲{p.pct.toFixed(0)}%</span>
              </div>
            ))}
            <span style={{fontSize:9,color:"rgba(255,255,255,0.25)",padding:"3px 0"}}>← tap any KPI tile to see full detail</span>
          </div>
        </Card>

        {/* DOSHA + MOOD */}
        <Card>
          <div style={{fontSize:11,fontWeight:700,marginBottom:6}}>Dosha Profile</div>
          <div style={{display:"flex",justifyContent:"center",marginBottom:8}}>
            <DonutChart slices={[{l:"Vata",v:30,c:"#38bdf8"},{l:"Pitta",v:34,c:"#f97316"},{l:"Kapha",v:36,c:"#22c55e"}]} size={108}/>
          </div>
          {[["Vata","#38bdf8",30],["Pitta","#f97316",34],["Kapha","#22c55e",36]].map(([l,c,v])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
              <div style={{display:"flex",alignItems:"center",gap:5}}>
                <span style={{width:7,height:7,borderRadius:2,background:c,display:"inline-block"}}/>
                <span style={{fontSize:10,color:"rgba(255,255,255,0.55)"}}>{l}</span>
              </div>
              <span style={{fontSize:11,fontWeight:700,color:c}}>{v}%</span>
            </div>
          ))}
          <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid rgba(255,255,255,0.06)"}}>
            <div style={{fontSize:9,color:C.muted,marginBottom:6}}>Today's Mood Check</div>
            <div style={{display:"flex",gap:4,justifyContent:"center"}}>
              {["😞","😕","😐","🙂","😄"].map((em,i)=>(
                <button key={i} onClick={()=>setMood(i)} style={{
                  fontSize:20,border:"none",background:mood===i?"rgba(107,179,63,0.3)":"transparent",
                  cursor:"pointer",borderRadius:6,padding:"2px 4px",
                  outline:mood===i?"2px solid "+C.g3:"none",transition:"all 0.15s"
                }}>{em}</button>
              ))}
            </div>
            {mood!==null&&<div style={{fontSize:9,color:C.g3,textAlign:"center",marginTop:4}}>✓ Mood logged!</div>}
          </div>
        </Card>
      </div>

      {/* KPI DRILL-DOWN — TWO-TIER SUGGESTION ENGINE */}
      {sp&&(()=>{
        // ── Score helpers ─────────────────────────────────────────────────────
        const kpiAvg = scores[sp.id];
        const riskBand = kpiAvg >= 4.0 ? "good" : kpiAvg >= 3.0 ? "moderate" : "risk";

        // Question-level triggers: check each question score against its threshold
        const questionTriggers = (sp.questions||[]).filter(q => {
          if(q.thresholdBelow != null && q.score < q.thresholdBelow) return true;
          if(q.thresholdAbove != null && q.score > q.thresholdAbove) return true;
          return false;
        });

        // Precision suggestions from triggered questions
        const questionSuggestions = (sp.suggestions?.questionLevel||[]).filter(s =>
          questionTriggers.find(q => q.key === s.key)
        );

        const showKpiSugg = riskBand !== "good";
        const riskCol = riskBand === "risk" ? "#f87171" : riskBand === "moderate" ? C.gold : C.g3;

        return(
          <Card style={{marginBottom:16,borderColor:sp.color+"44",background:sp.color+"07"}}>
            {/* HEADER ROW */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
              <div>
                <div style={{fontSize:14,fontWeight:800}}>{sp.icon} {sp.label} — {VIEWS[timeView]} Detail</div>
                <div style={{display:"flex",gap:6,marginTop:4,flexWrap:"wrap"}}>
                  <span style={{fontSize:9,background:riskCol+"22",color:riskCol,borderRadius:5,padding:"1px 8px",fontWeight:700,textTransform:"uppercase"}}>
                    KPI {riskBand} · avg {kpiAvg.toFixed(2)}
                  </span>
                  {questionTriggers.length>0&&(
                    <span style={{fontSize:9,background:"rgba(251,191,36,0.18)",color:C.gold,borderRadius:5,padding:"1px 8px",fontWeight:700}}>
                      ⚡ {questionTriggers.length} question{questionTriggers.length>1?"s":""} flagged
                    </span>
                  )}
                </div>
              </div>
              <div style={{display:"flex",gap:20,alignItems:"center"}}>
                {[["Baseline",sp.baseline.toFixed(1)],["Current",kpiAvg.toFixed(1)],["Best",Math.max(...viewData[sp.id]).toFixed(1)],["Lowest",Math.min(...viewData[sp.id]).toFixed(1)]].map(([l,v])=>(
                  <div key={l} style={{textAlign:"center"}}>
                    <div style={{fontSize:9,color:C.muted,textTransform:"uppercase"}}>{l}</div>
                    <div style={{fontSize:19,fontWeight:800,color:sp.color}}>{v}</div>
                  </div>
                ))}
                <button onClick={()=>setSelectedKPI(null)} style={{background:"transparent",border:"none",color:C.muted,cursor:"pointer",fontSize:18,paddingLeft:8}}>✕</button>
              </div>
            </div>

            <MultiLine h={65} labels={labels} series={[{id:sp.id,vals:viewData[sp.id],c:sp.color}]} highlighted={[sp.id]}/>

            {/* QUESTION SCORES TABLE */}
            {(sp.questions||[]).length>0&&(
              <div style={{marginTop:14,marginBottom:2}}>
                <div style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:0.8,marginBottom:6}}>
                  Individual Question Scores
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:4}}>
                  {(sp.questions||[]).map(q=>{
                    const triggered = (q.thresholdBelow!=null&&q.score<q.thresholdBelow)||(q.thresholdAbove!=null&&q.score>q.thresholdAbove);
                    const pct = ((q.score-1)/4)*100;
                    return(
                      <div key={q.key} style={{display:"grid",gridTemplateColumns:"24px 1fr 90px 60px",alignItems:"center",gap:8,padding:"4px 0"}}>
                        <span style={{fontSize:12,textAlign:"center"}}>{triggered?"⚡":"✓"}</span>
                        <div>
                          <div style={{fontSize:9.5,color:triggered?"rgba(251,191,36,0.9)":"rgba(255,255,255,0.55)"}}>{q.label}</div>
                          <div style={{height:3,borderRadius:3,background:"rgba(255,255,255,0.06)",marginTop:3}}>
                            <div style={{height:"100%",borderRadius:3,width:`${pct}%`,
                              background:triggered?`linear-gradient(90deg,#f87171,${C.gold})`:`linear-gradient(90deg,${sp.color}88,${sp.color})`,
                              transition:"width 0.4s"}}/>
                          </div>
                        </div>
                        <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",textAlign:"center"}}>
                          {q.thresholdBelow!=null?`threshold < ${q.thresholdBelow}`:`threshold > ${q.thresholdAbove}`}
                        </div>
                        <div style={{textAlign:"right"}}>
                          <span style={{fontSize:13,fontWeight:800,color:triggered?"#f87171":sp.color}}>{q.score.toFixed(1)}</span>
                          {triggered&&<span style={{fontSize:8,color:C.gold,marginLeft:4,fontWeight:700}}>flagged</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TIER 1 — KPI-LEVEL SUGGESTIONS */}
            {showKpiSugg&&sp.suggestions?.kpiLevel&&(
              <div style={{marginTop:14}}>
                <div style={{fontSize:9,fontWeight:700,color:riskCol,textTransform:"uppercase",letterSpacing:0.8,marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
                  <span style={{background:riskCol+"22",borderRadius:5,padding:"1px 8px"}}>Tier 1 — KPI-Level Suggestions</span>
                  <span style={{fontWeight:400,color:C.muted,textTransform:"none"}}>triggered because KPI average is {riskBand}</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                  {[["🥗 Aahar",sp.suggestions.kpiLevel.aahar,C.g3],
                    ["🏃 Vihar",sp.suggestions.kpiLevel.vihar,C.blue],
                    ["🌿 Aushadh",sp.suggestions.kpiLevel.aushadh,C.gold]].map(([lbl,val,col])=>(
                    <div key={lbl} style={{background:col+"0f",borderRadius:10,padding:"8px 12px",border:`1px solid ${col}30`}}>
                      <div style={{fontSize:10,fontWeight:700,color:col,marginBottom:4}}>{lbl}</div>
                      <div style={{fontSize:9,color:"rgba(255,255,255,0.6)",lineHeight:1.5}}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TIER 2 — QUESTION-LEVEL PRECISION SUGGESTIONS */}
            {questionSuggestions.length>0&&(
              <div style={{marginTop:12}}>
                <div style={{fontSize:9,fontWeight:700,color:C.gold,textTransform:"uppercase",letterSpacing:0.8,marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
                  <span style={{background:"rgba(212,168,67,0.15)",borderRadius:5,padding:"1px 8px"}}>Tier 2 — Precision Suggestions</span>
                  <span style={{fontWeight:400,color:C.muted,textTransform:"none"}}>triggered by specific question scores below threshold</span>
                </div>
                {questionSuggestions.map(qs=>{
                  const q = (sp.questions||[]).find(q=>q.key===qs.key);
                  return(
                    <div key={qs.key} style={{marginBottom:10,padding:"10px 12px",background:"rgba(212,168,67,0.05)",borderRadius:10,border:"1px solid rgba(212,168,67,0.18)"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                        <span style={{fontSize:11}}>⚡</span>
                        <div>
                          <div style={{fontSize:9.5,fontWeight:700,color:C.gold}}>{q?.label}</div>
                          <div style={{fontSize:8,color:C.muted}}>score: {q?.score?.toFixed(1)} · {qs.condition} · mode: {qs.triggerMode}</div>
                        </div>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                        {[["🥗 Aahar",qs.aahar,C.g3],["🏃 Vihar",qs.vihar,C.blue],["🌿 Aushadh",qs.aushadh,C.gold]].map(([lbl,val,col])=>(
                          <div key={lbl} style={{background:col+"0a",borderRadius:8,padding:"6px 10px",border:`1px solid ${col}25`}}>
                            <div style={{fontSize:9,fontWeight:700,color:col,marginBottom:3}}>{lbl}</div>
                            <div style={{fontSize:8.5,color:"rgba(255,255,255,0.55)",lineHeight:1.5}}>{val}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!showKpiSugg&&questionSuggestions.length===0&&(
              <div style={{marginTop:14,textAlign:"center",padding:"12px 0",color:C.g3,fontSize:10}}>
                ✓ This KPI is in good shape. Keep it up!
              </div>
            )}
          </Card>
        );
      })()}

      {/* LIFESTYLE SUGGESTIONS — TWO-TIER OVERVIEW */}
      <Card style={{background:"rgba(107,179,63,0.04)",borderColor:"rgba(107,179,63,0.14)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <div style={{fontSize:11,fontWeight:700,color:C.g3}}>🌿 Ayumonk Lifestyle Suggestions — Focus Areas This Week</div>
          <div style={{display:"flex",gap:6}}>
            <span style={{fontSize:8,background:"rgba(107,179,63,0.15)",color:C.g3,borderRadius:5,padding:"2px 8px",fontWeight:700}}>Tier 1 = KPI risk</span>
            <span style={{fontSize:8,background:"rgba(212,168,67,0.15)",color:C.gold,borderRadius:5,padding:"2px 8px",fontWeight:700}}>Tier 2 = Question score</span>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:10}}>
          {weakParams.map(p=>{
            // Compute question-level triggers for this KPI
            const qTrigs = (p.questions||[]).filter(q =>
              (q.thresholdBelow!=null&&q.score<q.thresholdBelow)||(q.thresholdAbove!=null&&q.score>q.thresholdAbove)
            );
            const kpiAvg = scores[p.id];
            const riskBand = kpiAvg>=4.0?"good":kpiAvg>=3.0?"moderate":"risk";
            const riskCol = riskBand==="risk"?"#f87171":C.gold;
            return(
              <div key={p.id} style={{background:"rgba(255,255,255,0.025)",borderRadius:10,padding:"10px 14px",borderLeft:`3px solid ${p.color}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                  <div style={{fontSize:11,fontWeight:700,color:p.color}}>{p.icon} {p.label}</div>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"flex-end"}}>
                    {riskBand!=="good"&&(
                      <span style={{fontSize:7.5,background:riskCol+"22",color:riskCol,borderRadius:4,padding:"1px 6px",fontWeight:700}}>T1 · KPI {riskBand}</span>
                    )}
                    {qTrigs.length>0&&(
                      <span style={{fontSize:7.5,background:"rgba(212,168,67,0.18)",color:C.gold,borderRadius:4,padding:"1px 6px",fontWeight:700}}>T2 · {qTrigs.length}Q flagged</span>
                    )}
                  </div>
                </div>
                {/* Show KPI-level suggestion preview */}
                {riskBand!=="good"&&p.suggestions?.kpiLevel&&(
                  <div style={{fontSize:8.5,color:"rgba(255,255,255,0.5)",lineHeight:1.55,marginBottom:qTrigs.length>0?6:0}}>
                    {p.suggestions.kpiLevel.aahar}
                  </div>
                )}
                {/* Show flagged question pills */}
                {qTrigs.length>0&&(
                  <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:4}}>
                    {qTrigs.map(q=>(
                      <span key={q.key} style={{fontSize:7.5,background:"rgba(251,191,36,0.1)",color:C.gold,borderRadius:4,padding:"1px 6px",border:"1px solid rgba(251,191,36,0.2)"}}>
                        ⚡ {q.label.length>28?q.label.slice(0,28)+"…":q.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ─── CHALLENGES DASHBOARD ─────────────────────────────────────────────────────
function ChallengeDashboard({ isOnline=true, onOfflineQueue=()=>{} }){
  const [cs,setCs]=useState({
    water:{count:0},sleep:{done:false},activity:{chosen:null},
    nutrition:{chosen:[]},breathing:{timer:120,done:false},mood:{rating:null},
  });
  const [timerOn,setTimerOn]=useState(false);
  const timerRef=useRef(null);

  useEffect(()=>{
    if(timerOn&&cs.breathing.timer>0){
      timerRef.current=setInterval(()=>{
        setCs(prev=>{
          const t=prev.breathing.timer-1;
          if(t<=0){setTimerOn(false);return{...prev,breathing:{timer:0,done:true}};}
          return{...prev,breathing:{...prev.breathing,timer:t}};
        });
      },1000);
    }
    return()=>clearInterval(timerRef.current);
  },[timerOn]);

  const upd=(id,obj)=>setCs(prev=>({...prev,[id]:{...prev[id],...obj}}));
  const fmt=s=>`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

  const isDone=id=>{
    const s=cs[id];
    if(id==="water")return s.count>=8;
    if(id==="sleep")return s.done;
    if(id==="activity")return s.chosen!==null;
    if(id==="nutrition")return s.chosen?.length>=1;
    if(id==="breathing")return s.done;
    if(id==="mood")return s.rating!==null;
    return false;
  };

  const getXP=id=>{
    const def=CHALLENGE_DEFS.find(c=>c.id===id);
    if(!isDone(id))return 0;
    if(id==="nutrition")return Math.round(def.xp*(cs.nutrition.chosen?.length||0)/def.options.length);
    return def.xp;
  };

  // ── Offline-aware completion handler ──────────────────────────────────────
  // Production: POST /api/challenges/complete
  //   If online  → direct API call
  //   If offline → write to IndexedDB offline queue; Service Worker Background
  //                Sync flushes it when connectivity returns
  const [offlineCount, setOfflineCount] = useState(0);
  const handleCompletion = (challengeId) => {
    if(!isOnline){
      setOfflineCount(p=>p+1);
      onOfflineQueue(1);
      // Production: idb.add('offline_queue', { type:'challenge_complete', challengeId, date: new Date() })
    }
    // UI state updates happen regardless (optimistic update)
  };

  // ── SCHEDULE-GATED CHALLENGE LISTS ───────────────────────────────────────
  // Only challenges whose mapped KPI is ACTIVE (today between start and end date)
  // are shown as interactive cards. Upcoming and ended are shown as info-only rows.
  const activeChallenges  = CHALLENGE_DEFS.filter(c => isKpiActive(c.kpi));
  const upcomingChallenges= CHALLENGE_DEFS.filter(c => KPI_SCHEDULE_MAP[c.kpi]?.status==="upcoming");
  const endedChallenges   = CHALLENGE_DEFS.filter(c => KPI_SCHEDULE_MAP[c.kpi]?.status==="ended");

  // Progress counts are based only on active challenges
  const done=activeChallenges.filter(c=>isDone(c.id)).length;
  const xpToday=activeChallenges.reduce((s,c)=>s+getXP(c.id),0);

  return(
    <div>
      {/* STATS BAR */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
        {[
          ["🔥 Streak","7 Days","Day 8 unlocks a badge!",C.orange],
          ["⭐ XP Today",`${340+xpToday} pts`,"Complete all 6 for bonus",C.gold],
          ["🌱 Level","Banyan Sapling","3 more days → Banyan Tree",C.g3],
          ["✅ Progress",`${done} / ${activeChallenges.length}`,"Active KPI challenges today",C.blue],
        ].map(([lbl,val,sub,col])=>(
          <Card key={lbl} color={col+"33"} style={{padding:"12px 14px"}}>
            <div style={{fontSize:9,color:C.muted,marginBottom:3}}>{lbl}</div>
            <div style={{fontSize:20,fontWeight:800,color:col}}>{val}</div>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.28)",marginTop:2}}>{sub}</div>
          </Card>
        ))}
      </div>

      {/* OFFLINE SYNC STATUS */}
      {!isOnline&&(
        <div style={{background:"rgba(232,160,32,0.08)",border:"1px solid rgba(232,160,32,0.25)",borderRadius:9,padding:"7px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:13}}>📡</span>
          <div style={{flex:1,fontSize:9,color:C.gold}}>
            You're offline. Challenge completions are saved locally and will sync automatically when you reconnect.
            {offlineCount>0&&<span style={{marginLeft:6,fontWeight:700}}>{offlineCount} queued</span>}
          </div>
          <span style={{fontSize:8,color:"rgba(232,160,32,0.5)",fontWeight:700}}>BACKGROUND SYNC ON</span>
        </div>
      )}

      {/* PROGRESS BAR */}
      <div style={{marginBottom:18}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.muted,marginBottom:5}}>
          <span>Today's completion</span><span>{done}/{activeChallenges.length} active challenges · {xpToday} XP earned today</span>
        </div>
        <div style={{height:6,borderRadius:6,background:"rgba(255,255,255,0.06)"}}>
          <div style={{height:"100%",borderRadius:6,width:`${activeChallenges.length>0?(done/activeChallenges.length)*100:0}%`,background:`linear-gradient(90deg,${C.g2},${C.g3})`,transition:"width 0.5s ease"}}/>
        </div>
      </div>

      {/* ACTIVE CHALLENGES GRID */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
        <div style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,0.45)"}}>
          Today's Challenges
          <span style={{fontSize:9,fontWeight:400,color:"rgba(255,255,255,0.25)",marginLeft:8}}>— 1 to 3 taps each. Shown only for your company's active KPI programs.</span>
        </div>
        <div style={{marginLeft:"auto",background:"rgba(107,179,63,0.12)",border:"1px solid rgba(107,179,63,0.3)",borderRadius:8,padding:"3px 10px",fontSize:9,color:C.g3,fontWeight:600,whiteSpace:"nowrap"}}>
          {activeChallenges.length} active · {upcomingChallenges.length} upcoming · {endedChallenges.length} ended
        </div>
      </div>

      {activeChallenges.length===0&&(
        <Card style={{padding:"24px",textAlign:"center",marginBottom:22,borderColor:"rgba(255,255,255,0.08)"}}>
          <div style={{fontSize:28,marginBottom:8}}>📅</div>
          <div style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.5)",marginBottom:4}}>No active challenges right now</div>
          <div style={{fontSize:10,color:C.muted}}>Your company hasn't started any KPI programs yet. Check the upcoming programs below.</div>
        </Card>
      )}

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(290px,1fr))",gap:12,marginBottom:22}}>
        {activeChallenges.map(ch=>{
          const done_ch=isDone(ch.id);
          const xp=getXP(ch.id);
          const s=cs[ch.id];
          return(
            <Card key={ch.id} color={done_ch?ch.color+"66":ch.color+"22"} style={{background:done_ch?ch.color+"0e":"rgba(255,255,255,0.025)"}}>
              {done_ch&&<div style={{position:"absolute",top:10,right:12,fontSize:10,fontWeight:700,color:ch.color}}>✓ +{xp} XP</div>}
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <span style={{fontSize:24}}>{ch.icon}</span>
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:done_ch?ch.color:"#fff"}}>{ch.label}</div>
                  <div style={{fontSize:9,color:ch.color,opacity:0.7}}>{ch.kpi} KPI · {ch.xp} XP available</div>
                </div>
              </div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.42)",marginBottom:10,lineHeight:1.5}}>{ch.desc}</div>

              {/* COUNTER */}
              {ch.type==="counter"&&(
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                    <Btn active={s.count>=ch.target} color={ch.color} disabled={s.count>=ch.target}
                      onClick={()=>upd(ch.id,{count:Math.min(ch.target,s.count+1)})}>+ 1 Glass</Btn>
                    <span style={{fontSize:15,fontWeight:800,color:ch.color}}>{s.count} / {ch.target}</span>
                    {s.count>0&&<button onClick={()=>upd(ch.id,{count:Math.max(0,s.count-1)})}
                      style={{background:"transparent",border:"1px solid rgba(255,255,255,0.1)",color:C.muted,borderRadius:6,padding:"4px 8px",cursor:"pointer",fontSize:10}}>−</button>}
                  </div>
                  <div style={{height:5,borderRadius:5,background:"rgba(255,255,255,0.06)"}}>
                    <div style={{height:"100%",borderRadius:5,width:`${(s.count/ch.target)*100}%`,background:ch.color,transition:"width 0.3s"}}/>
                  </div>
                </div>
              )}
              {/* TOGGLE */}
              {ch.type==="toggle"&&(
                <Btn active={s.done} color={ch.color} onClick={()=>upd(ch.id,{done:!s.done})}>
                  {s.done?"✓ "+ch.options[0]:"⬜ "+ch.options[0]}
                </Btn>
              )}
              {/* CHOICE — pick one */}
              {ch.type==="choice"&&(
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {ch.options.map((opt,i)=>(
                    <Btn key={i} active={s.chosen===i} color={ch.color} onClick={()=>upd(ch.id,{chosen:s.chosen===i?null:i})}>{opt}</Btn>
                  ))}
                </div>
              )}
              {/* MULTI — pick any */}
              {ch.type==="multi"&&(
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {ch.options.map((opt,i)=>{
                    const sel=(s.chosen||[]).includes(i);
                    return(
                      <Btn key={i} active={sel} color={ch.color} onClick={()=>{
                        const arr=s.chosen||[];
                        upd(ch.id,{chosen:sel?arr.filter(x=>x!==i):[...arr,i]});
                      }}>{opt}</Btn>
                    );
                  })}
                </div>
              )}
              {/* TIMER */}
              {ch.type==="timer"&&(
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  {!s.done?(
                    <>
                      <Btn active={timerOn} color={ch.color} disabled={timerOn} onClick={()=>setTimerOn(true)}>
                        {timerOn?"⏳ Breathing...":"▶ Start Timer"}
                      </Btn>
                      <span style={{fontSize:22,fontWeight:800,color:ch.color,fontFamily:"monospace"}}>{fmt(s.timer)}</span>
                    </>
                  ):(
                    <span style={{fontSize:12,fontWeight:700,color:ch.color}}>✓ Breathing complete! Well done.</span>
                  )}
                </div>
              )}
              {/* RATING */}
              {ch.type==="rating"&&(
                <div style={{display:"flex",gap:8}}>
                  {ch.options.map((em,i)=>(
                    <button key={i} onClick={()=>upd(ch.id,{rating:i})} style={{
                      fontSize:24,border:"none",background:s.rating===i?"rgba(52,211,153,0.25)":"transparent",
                      cursor:"pointer",borderRadius:8,padding:"4px 6px",
                      outline:s.rating===i?"2px solid "+ch.color:"none",transition:"all 0.15s"
                    }}>{em}</button>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* BADGES + LEADERBOARD */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Card>
          <div style={{fontSize:12,fontWeight:700,marginBottom:12}}>🏅 My Badges</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {BADGES.map(b=>(
              <div key={b.id} style={{
                background:b.earned?b.color+"22":"rgba(255,255,255,0.02)",
                border:`1px solid ${b.earned?b.color+"55":"rgba(255,255,255,0.06)"}`,
                borderRadius:10,padding:"8px 12px",textAlign:"center",minWidth:90,
                opacity:b.earned?1:0.4
              }}>
                <div style={{fontSize:22,marginBottom:3}}>{b.icon}</div>
                <div style={{fontSize:9,fontWeight:700,color:b.earned?b.color:"rgba(255,255,255,0.35)"}}>{b.label}</div>
                <div style={{fontSize:8,color:"rgba(255,255,255,0.28)"}}>{b.level}{!b.earned&&" 🔒"}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div style={{fontSize:12,fontWeight:700,marginBottom:12}}>🏆 Weekly Leaderboard</div>
          {[["1st","Priya S.","Engineering","Delhi","+42%",C.gold],
            ["2nd","Rahul M.","Product","Mumbai","+38%","#94a3b8"],
            ["3rd","Anjali K.","HR","BLR","+35%",C.orange],
            ["4th ⬅ You","Amit R.","Finance","Delhi","+31%",C.g3],
            ["5th","Sneha P.","Marketing","Pune","+28%","rgba(255,255,255,0.3)"],
          ].map(([rank,name,dept,loc,pct,col])=>(
            <div key={rank} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
              <div style={{width:64,fontSize:11,fontWeight:700,color:col}}>{rank}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:11,color:rank.includes("You")?"#6db33f":"#fff"}}>{name}</div>
                <div style={{fontSize:9,color:C.muted}}>{dept} · {loc}</div>
              </div>
              <div style={{fontSize:13,fontWeight:700,color:col}}>{pct}</div>
            </div>
          ))}
        </Card>
      </div>

      {/* KPI PROGRAM SCHEDULE TIMELINE */}
      <Card style={{marginTop:14,borderColor:"rgba(107,179,63,0.18)",background:"rgba(107,179,63,0.03)"}}>
        <div style={{fontSize:12,fontWeight:700,color:C.g3,marginBottom:12}}>
          📅 KPI Program Schedule — Your Company
          <span style={{fontSize:9,fontWeight:400,color:C.muted,marginLeft:8}}>Challenges appear and disappear based on these windows</span>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {COMPANY_KPI_SCHEDULE.map(e=>{
            const st=e.status||_kpiStatus(e);
            const ch=CHALLENGE_DEFS.find(c=>c.kpi===e.kpi);
            const totalDays=Math.ceil((e.end-e.start)/(1000*60*60*24));
            const elapsed=Math.max(0,Math.ceil((_today-e.start)/(1000*60*60*24)));
            const pct=Math.min(100,Math.max(0,Math.round((elapsed/totalDays)*100)));
            const col = st==="active"?C.g3 : st==="upcoming"?C.blue : "rgba(255,255,255,0.18)";
            const badge = st==="active"
              ? <span style={{background:"rgba(107,179,63,0.2)",color:C.g3,borderRadius:5,padding:"1px 7px",fontSize:8,fontWeight:700}}>● ACTIVE</span>
              : st==="upcoming"
              ? <span style={{background:"rgba(74,144,196,0.2)",color:C.blue,borderRadius:5,padding:"1px 7px",fontSize:8,fontWeight:700}}>⏳ UPCOMING</span>
              : <span style={{background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.3)",borderRadius:5,padding:"1px 7px",fontSize:8,fontWeight:700}}>✓ ENDED</span>;
            return(
              <div key={e.kpi} style={{display:"grid",gridTemplateColumns:"28px 130px 1fr 120px 60px",alignItems:"center",gap:10,padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                <span style={{fontSize:16}}>{ch?.icon||"🔹"}</span>
                <div>
                  <div style={{fontSize:10,fontWeight:700,color:col}}>{ch?.label||e.kpi}</div>
                  <div style={{fontSize:8,color:C.muted}}>{e.theme}</div>
                </div>
                <div>
                  <div style={{height:5,borderRadius:5,background:"rgba(255,255,255,0.06)",overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pct}%`,borderRadius:5,
                      background: st==="active"?`linear-gradient(90deg,${C.g2},${C.g3})` : st==="upcoming"?"transparent" : "rgba(255,255,255,0.15)",
                      transition:"width 0.4s"}}/>
                  </div>
                </div>
                <div style={{fontSize:8,color:"rgba(255,255,255,0.3)",textAlign:"center"}}>
                  {_fmtDate(e.start)} → {_fmtDate(e.end)}
                </div>
                <div style={{textAlign:"right"}}>{badge}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* UPCOMING CHALLENGES — info only, non-interactive */}
      {upcomingChallenges.length>0&&(
        <div style={{marginTop:14}}>
          <div style={{fontSize:11,fontWeight:700,color:C.blue,marginBottom:8}}>
            ⏳ Coming Soon <span style={{fontSize:9,fontWeight:400,color:C.muted}}>— not yet active for your company</span>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {upcomingChallenges.map(ch=>{
              const sch=KPI_SCHEDULE_MAP[ch.kpi];
              return(
                <div key={ch.id} style={{background:"rgba(74,144,196,0.06)",border:"1px dashed rgba(74,144,196,0.25)",borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,minWidth:200,opacity:0.75}}>
                  <span style={{fontSize:20}}>{ch.icon}</span>
                  <div>
                    <div style={{fontSize:10,fontWeight:700,color:C.blue}}>{ch.label}</div>
                    <div style={{fontSize:8,color:C.muted}}>Starts {_fmtDate(sch.start)} · {sch.programLabel}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ENDED CHALLENGES — archived view */}
      {endedChallenges.length>0&&(
        <div style={{marginTop:14}}>
          <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.28)",marginBottom:8}}>
            ✓ Completed Programs <span style={{fontSize:9,fontWeight:400,color:C.muted}}>— streaks and XP preserved</span>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {endedChallenges.map(ch=>{
              const sch=KPI_SCHEDULE_MAP[ch.kpi];
              return(
                <div key={ch.id} style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,minWidth:200,opacity:0.45}}>
                  <span style={{fontSize:20,filter:"grayscale(1)"}}>{ch.icon}</span>
                  <div>
                    <div style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.35)"}}>{ch.label}</div>
                    <div style={{fontSize:8,color:C.muted}}>Ended {_fmtDate(sch.end)} · {sch.programLabel}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── REMINDER SETTINGS PANEL ───────────────────────────────────────────
          Maps to: reminder_settings table (PostgreSQL)
          API:  GET/PATCH /api/reminders/settings
               POST /api/reminders/push/subscribe
               POST /api/reminders/snooze
          RLS:  user_id = current_app_user_id() — own row only
      ──────────────────────────────────────────────────────────────────────── */}
      <ReminderSettings/>
    </div>
  );
}

// ─── REMINDER SETTINGS COMPONENT ─────────────────────────────────────────────
function ReminderSettings(){
  // State mirrors reminder_settings table columns
  const [settings, setSettings] = useState({
    is_enabled:        false,
    channel:           "email",
    reminder_time:     "20:00",
    timezone:          Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
    remind_on_incomplete:  true,
    remind_streak_at_risk: true,
    remind_window_closing: true,
    remind_window_opening: true,
    remind_milestone_near: true,
    snooze_until:      null,
  });
  const [saved, setSaved]   = useState(false);
  const [pushGranted, setPushGranted] = useState(false);
  const [pushPending, setPushPending] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [activeHistory, setActiveHistory] = useState(false);

  // Simulated reminder log (production: GET /api/reminders/history)
  const REMINDER_HISTORY = [
    { type:"daily_incomplete", icon:"📋", label:"Daily Challenge Reminder",    channel:"email", time:"Yesterday 8:00 PM", status:"sent",       statusCol:C.g3 },
    { type:"streak_risk",      icon:"🔥", label:"Streak At Risk Alert",        channel:"push",  time:"2 days ago 9:00 PM",status:"sent",       statusCol:C.g3 },
    { type:"window_closing",   icon:"📅", label:"Hydration Program Closing",   channel:"email", time:"3 days ago 8:00 AM",status:"sent",       statusCol:C.g3 },
    { type:"daily_incomplete", icon:"📋", label:"Daily Challenge Reminder",    channel:"email", time:"4 days ago 8:00 PM", status:"suppressed", statusCol:C.muted },
    { type:"milestone_near",   icon:"🏅", label:"Badge Milestone — 7-Day",    channel:"push",  time:"5 days ago 8:00 AM", status:"sent",       statusCol:C.g3 },
    { type:"window_opening",   icon:"🌱", label:"Sleep Program Starting Soon", channel:"email", time:"6 days ago 8:00 AM", status:"failed",     statusCol:C.red },
  ];

  const upd = (key, val) => { setSettings(p=>({...p,[key]:val})); setSaved(false); };

  const handleSave = () => {
    // Production: PATCH /api/reminders/settings  body: settings
    setSaved(true);
    setTimeout(()=>setSaved(false), 2500);
  };

  const handlePushRequest = async () => {
    setPushPending(true);
    try {
      // Production: navigator.serviceWorker + pushManager.subscribe + POST /api/reminders/push/subscribe
      await new Promise(r=>setTimeout(r,1200)); // simulate permission prompt
      setPushGranted(true);
      upd("channel","push");
    } catch(e) { }
    setPushPending(false);
  };

  const handleSnooze = (hours) => {
    const until = new Date(Date.now() + hours*3600*1000);
    upd("snooze_until", until.toISOString());
    setSaved(false);
  };

  const isSnoozing = settings.snooze_until && new Date(settings.snooze_until) > new Date();
  const snoozeEnds = isSnoozing ? new Date(settings.snooze_until).toLocaleString("en-IN",{hour:"2-digit",minute:"2-digit",day:"numeric",month:"short"}) : null;

  const REMINDER_TYPES = [
    { key:"remind_on_incomplete",  icon:"📋", label:"Daily challenge reminder",      sub:"Fires at your set time if any challenge is uncomplete" },
    { key:"remind_streak_at_risk", icon:"🔥", label:"Streak at risk alert",          sub:"Fires at 9PM if your streak ≥ 3 days and today isn't done" },
    { key:"remind_window_closing", icon:"📅", label:"Program ending soon",           sub:"Once, 3 days before a KPI window closes" },
    { key:"remind_window_opening", icon:"🌱", label:"New program starting tomorrow", sub:"Once, day before a new KPI window opens" },
    { key:"remind_milestone_near", icon:"🏅", label:"Badge milestone alert",         sub:"When you're 1 day away from a 7/14/21/30-day badge" },
  ];

  const CHANNELS = [
    { id:"email",    icon:"📧", label:"Email",         note:"Works immediately" },
    { id:"push",     icon:"🔔", label:"Browser Push",  note:pushGranted?"Enabled":"Needs permission" },
    { id:"whatsapp", icon:"💬", label:"WhatsApp",      note:"Phase 3 — coming soon" },
  ];

  return (
    <Card style={{marginTop:14, borderColor: settings.is_enabled ? "rgba(107,179,63,0.3)" : "rgba(255,255,255,0.07)", background:"rgba(0,0,0,0.2)"}}>

      {/* ── HEADER ROW ──────────────────────────────────────────────────── */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom: expanded ? 18 : 0}}>
        <span style={{fontSize:20}}>🔔</span>
        <div style={{flex:1}}>
          <div style={{fontSize:12,fontWeight:700,color:"#fff"}}>Reminder Settings</div>
          <div style={{fontSize:9,color:C.muted,marginTop:2}}>
            {isSnoozing
              ? `⏸ Snoozed until ${snoozeEnds}`
              : settings.is_enabled
              ? `Active · ${settings.channel} · ${settings.reminder_time} ${settings.timezone}`
              : "Reminders are off"}
          </div>
        </div>
        {/* Master toggle */}
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:9,color:settings.is_enabled?C.g3:C.muted,fontWeight:600}}>
            {settings.is_enabled?"ON":"OFF"}
          </span>
          <button
            onClick={()=>upd("is_enabled",!settings.is_enabled)}
            style={{
              width:42, height:24, borderRadius:12, border:"none", cursor:"pointer",
              background: settings.is_enabled ? C.g2 : "rgba(255,255,255,0.12)",
              position:"relative", transition:"background 0.25s"
            }}>
            <span style={{
              position:"absolute", top:3, borderRadius:9,
              width:18, height:18, background:"#fff",
              left: settings.is_enabled ? 21 : 3,
              transition:"left 0.2s", display:"block"
            }}/>
          </button>
        </div>
        <button
          onClick={()=>setExpanded(p=>!p)}
          style={{background:"transparent",border:"1px solid rgba(255,255,255,0.1)",color:C.muted,borderRadius:8,padding:"4px 12px",cursor:"pointer",fontSize:10,marginLeft:4}}>
          {expanded?"▲ Collapse":"▼ Configure"}
        </button>
      </div>

      {expanded && (
        <div style={{opacity: settings.is_enabled ? 1 : 0.38, pointerEvents: settings.is_enabled ? "auto" : "none", transition:"opacity 0.2s"}}>

          {/* ── CHANNEL + TIME + TIMEZONE ─────────────────────────────── */}
          <div style={{marginBottom:16}}>
            <div style={{fontSize:9,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:0.8,marginBottom:8}}>Delivery Channel</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
              {CHANNELS.map(ch=>(
                <button key={ch.id}
                  disabled={ch.id==="whatsapp"}
                  onClick={()=>{ if(ch.id==="push"&&!pushGranted){ handlePushRequest(); return; } upd("channel",ch.id); }}
                  style={{
                    padding:"8px 14px",borderRadius:10,cursor:ch.id==="whatsapp"?"not-allowed":"pointer",
                    border:`1px solid ${settings.channel===ch.id?C.g3:"rgba(255,255,255,0.1)"}`,
                    background:settings.channel===ch.id?"rgba(107,179,63,0.12)":"rgba(255,255,255,0.03)",
                    display:"flex",flexDirection:"column",alignItems:"center",gap:3,minWidth:90,
                    opacity:ch.id==="whatsapp"?0.4:1,transition:"all 0.15s"
                  }}>
                  <span style={{fontSize:18}}>{ch.icon}</span>
                  <span style={{fontSize:10,fontWeight:700,color:settings.channel===ch.id?C.g3:"#fff"}}>{ch.label}</span>
                  <span style={{fontSize:8,color:C.muted}}>{ch.note}</span>
                  {ch.id==="push"&&pushPending&&<span style={{fontSize:8,color:C.gold}}>Requesting…</span>}
                  {ch.id==="push"&&pushGranted&&!pushPending&&<span style={{fontSize:8,color:C.g3}}>✓ Enabled</span>}
                </button>
              ))}
            </div>

            {/* PWA PUSH INFO BOX */}
            {settings.channel==="push"&&(
              <div style={{background:"rgba(107,179,63,0.06)",border:"1px solid rgba(107,179,63,0.2)",borderRadius:10,padding:"10px 14px",marginBottom:12}}>
                <div style={{fontSize:9,fontWeight:700,color:C.g3,marginBottom:6}}>📲 How Browser Push Works</div>
                <div style={{display:"flex",flexDirection:"column",gap:4}}>
                  {[
                    ["Android Chrome / Edge","✅ Works from browser tab — no home screen install needed"],
                    ["iOS Safari 16.4+","⚠️ Requires Add to Home Screen first — then works identically to native"],
                    ["Desktop Chrome / Firefox","✅ Works as desktop notification in system tray"],
                    ["iOS Safari < 16.4","❌ Not supported — use Email channel instead"],
                  ].map(([platform, status])=>(
                    <div key={platform} style={{display:"flex",gap:10,alignItems:"center",fontSize:8.5}}>
                      <span style={{minWidth:160,color:"rgba(255,255,255,0.55)"}}>{platform}</span>
                      <span style={{color: status.startsWith("✅")?C.g3 : status.startsWith("⚠️")?C.gold:"#f87171"}}>{status}</span>
                    </div>
                  ))}
                </div>
                {!pushGranted&&(
                  <button onClick={handlePushRequest} disabled={pushPending}
                    style={{marginTop:10,padding:"6px 16px",borderRadius:8,background:`linear-gradient(135deg,${C.g1},${C.g2})`,border:"none",color:"#fff",fontWeight:700,fontSize:9,cursor:"pointer",opacity:pushPending?0.7:1}}>
                    {pushPending?"Requesting permission…":"Enable Browser Push Now"}
                  </button>
                )}
                {pushGranted&&<div style={{marginTop:8,fontSize:8.5,color:C.g3,fontWeight:600}}>✅ Browser push enabled — notifications will appear in your shutter</div>}
              </div>
            )}

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div>
                <div style={{fontSize:9,color:C.muted,marginBottom:4,fontWeight:600,textTransform:"uppercase",letterSpacing:0.8}}>Reminder Time</div>
                <input
                  type="time"
                  value={settings.reminder_time}
                  onChange={e=>upd("reminder_time",e.target.value)}
                  style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",color:"#fff",borderRadius:8,padding:"7px 10px",fontSize:13,fontWeight:700,outline:"none",cursor:"pointer"}}
                />
                <div style={{fontSize:8,color:C.muted,marginTop:3}}>Daily challenge reminder fires at this time</div>
              </div>
              <div>
                <div style={{fontSize:9,color:C.muted,marginBottom:4,fontWeight:600,textTransform:"uppercase",letterSpacing:0.8}}>Timezone</div>
                <div style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,padding:"7px 10px",fontSize:11,color:"rgba(255,255,255,0.7)"}}>
                  {settings.timezone}
                </div>
                <div style={{fontSize:8,color:C.muted,marginTop:3}}>Auto-detected from your browser</div>
              </div>
            </div>
          </div>

          {/* ── REMINDER TYPE TOGGLES ─────────────────────────────────── */}
          <div style={{marginBottom:16}}>
            <div style={{fontSize:9,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:0.8,marginBottom:8}}>Which Reminders to Receive</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {REMINDER_TYPES.map(rt=>(
                <div key={rt.key} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 12px",background:"rgba(255,255,255,0.03)",borderRadius:8,border:`1px solid ${settings[rt.key]?"rgba(107,179,63,0.2)":"rgba(255,255,255,0.06)"}`}}>
                  <span style={{fontSize:16,flexShrink:0}}>{rt.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:10,fontWeight:700,color:settings[rt.key]?"#fff":"rgba(255,255,255,0.4)"}}>{rt.label}</div>
                    <div style={{fontSize:8,color:C.muted,marginTop:1}}>{rt.sub}</div>
                  </div>
                  <button
                    onClick={()=>upd(rt.key,!settings[rt.key])}
                    style={{
                      width:36,height:20,borderRadius:10,border:"none",cursor:"pointer",flexShrink:0,
                      background:settings[rt.key]?C.g2:"rgba(255,255,255,0.1)",
                      position:"relative",transition:"background 0.2s"
                    }}>
                    <span style={{
                      position:"absolute",top:2,width:16,height:16,borderRadius:8,background:"#fff",
                      left:settings[rt.key]?18:2,transition:"left 0.18s",display:"block"
                    }}/>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ── SNOOZE CONTROLS ───────────────────────────────────────── */}
          <div style={{marginBottom:16,padding:"10px 14px",background:"rgba(255,255,255,0.025)",borderRadius:10,border:"1px solid rgba(255,255,255,0.07)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <div>
                <div style={{fontSize:10,fontWeight:700,color:"#fff"}}>⏸ Snooze All Reminders</div>
                <div style={{fontSize:8,color:C.muted,marginTop:2}}>
                  {isSnoozing ? `Snoozed until ${snoozeEnds}` : "Temporarily pause all notifications"}
                </div>
              </div>
              {isSnoozing&&(
                <button onClick={()=>upd("snooze_until",null)}
                  style={{background:"rgba(240,80,80,0.15)",border:"1px solid rgba(240,80,80,0.3)",color:"#f87171",borderRadius:8,padding:"4px 10px",cursor:"pointer",fontSize:9}}>
                  Cancel Snooze
                </button>
              )}
            </div>
            {!isSnoozing&&(
              <div style={{display:"flex",gap:6}}>
                {[["24h","24 hours",24],["48h","2 days",48],["7d","1 week",168]].map(([lbl,tip,hrs])=>(
                  <button key={lbl} onClick={()=>handleSnooze(hrs)}
                    style={{padding:"5px 14px",borderRadius:8,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"rgba(255,255,255,0.55)",cursor:"pointer",fontSize:10,transition:"all 0.15s"}}>
                    {lbl} <span style={{fontSize:8,color:C.muted,marginLeft:2}}>{tip}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── SAVE BUTTON ───────────────────────────────────────────── */}
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
            <button onClick={handleSave}
              style={{
                padding:"9px 28px",borderRadius:10,border:"none",cursor:"pointer",fontWeight:700,fontSize:12,
                background:saved?C.g2:`linear-gradient(135deg,${C.g1},${C.g2})`,
                color:"#fff",transition:"all 0.2s"
              }}>
              {saved ? "✓ Saved!" : "Save Preferences"}
            </button>
            <div style={{fontSize:9,color:C.muted}}>
              Preferences saved to your account · Applied across all devices
            </div>
          </div>

          {/* ── REMINDER HISTORY ─────────────────────────────────────── */}
          <div>
            <button
              onClick={()=>setActiveHistory(p=>!p)}
              style={{background:"transparent",border:"none",color:C.muted,cursor:"pointer",fontSize:9,fontWeight:600,textDecoration:"underline",padding:0,marginBottom:8}}>
              {activeHistory ? "▲ Hide reminder history" : "▼ Show last 7 reminders"}
            </button>
            {activeHistory&&(
              <div style={{display:"flex",flexDirection:"column",gap:4}}>
                {REMINDER_HISTORY.map((r,i)=>(
                  <div key={i} style={{display:"grid",gridTemplateColumns:"28px 1fr 70px 80px 60px",alignItems:"center",gap:8,padding:"6px 10px",background:"rgba(255,255,255,0.02)",borderRadius:8}}>
                    <span style={{fontSize:14,textAlign:"center"}}>{r.icon}</span>
                    <div>
                      <div style={{fontSize:9.5,color:"rgba(255,255,255,0.65)",fontWeight:600}}>{r.label}</div>
                      <div style={{fontSize:8,color:C.muted}}>{r.time}</div>
                    </div>
                    <span style={{fontSize:8,color:C.muted,textAlign:"center"}}>{r.channel}</span>
                    <div style={{fontSize:8,color:C.muted,textAlign:"center"}}/>
                    <span style={{
                      fontSize:8,fontWeight:700,textAlign:"right",color:r.statusCol,
                      background:r.statusCol+"18",borderRadius:4,padding:"1px 6px",whiteSpace:"nowrap"
                    }}>{r.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </Card>
  );
}

// ─── HR ANALYTICS DASHBOARD ───────────────────────────────────────────────────
function HRDashboard(){
  const [fD,setFD]=useState("All");const [fL,setFL]=useState("All");const [fA,setFA]=useState("All");const [fG,setFG]=useState("All");
  const [cxo,setCxo]=useState("productivity"),[well,setWell]=useState("wellnessIndex");
  const filtered=HR_ROWS.filter(r=>(fD==="All"||r.dept===fD)&&(fL==="All"||r.loc===fL)&&(fA==="All"||r.age===fA)&&(fG==="All"||r.gender===fG));
  const avg=m=>+(filtered.reduce((s,r)=>s+r[m],0)/Math.max(filtered.length,1)).toFixed(1);
  const agg=(key,m)=>{const mp={};filtered.forEach(r=>{if(!mp[r[key]])mp[r[key]]=[];mp[r[key]].push(r[m]);});return Object.entries(mp).map(([k,v])=>({l:k,v:+(v.reduce((a,b)=>a+b,0)/v.length).toFixed(1)}));};

  const Sel=({label,value,onChange,opts})=>(
    <div style={{display:"flex",flexDirection:"column",gap:3}}>
      <label style={{fontSize:8,color:C.muted,textTransform:"uppercase",letterSpacing:0.8}}>{label}</label>
      <select value={value} onChange={e=>onChange(e.target.value)} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"#fff",padding:"5px 10px",borderRadius:8,fontSize:11,cursor:"pointer"}}>
        <option value="All">All</option>{opts.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
  const Toggle=({options,value,onChange,colors})=>(
    <div style={{display:"flex",gap:3,background:"rgba(0,0,0,0.3)",borderRadius:8,padding:3,flexWrap:"wrap"}}>
      {options.map((o,i)=>(
        <button key={o} onClick={()=>onChange(o)} style={{padding:"4px 10px",borderRadius:6,border:"none",fontSize:9,fontWeight:600,cursor:"pointer",background:value===o?(colors?colors[i]:C.g3):"transparent",color:value===o?"#fff":"rgba(255,255,255,0.4)",transition:"all 0.2s"}}>
          {o.charAt(0).toUpperCase()+o.slice(1)}
        </button>
      ))}
    </div>
  );

  return(
    <div>
      {/* FILTERS */}
      <div style={{display:"flex",gap:12,flexWrap:"wrap",background:"rgba(255,255,255,0.02)",borderRadius:12,padding:"12px 16px",marginBottom:18,alignItems:"flex-end"}}>
        <Sel label="Department" value={fD} onChange={setFD} opts={DEPTS}/>
        <Sel label="Location"   value={fL} onChange={setFL} opts={LOCATIONS}/>
        <Sel label="Age Band"   value={fA} onChange={setFA} opts={AGE_BANDS}/>
        <Sel label="Gender"     value={fG} onChange={setFG} opts={GENDERS}/>
        <div style={{marginLeft:"auto",fontSize:11,color:C.muted}}>
          <span style={{color:C.g3,fontWeight:700,fontSize:16}}>{filtered.length}</span> employees selected
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(148px,1fr))",gap:10,marginBottom:18}}>
        {[["🌿","Avg Wellness",avg("wellnessIndex"),"/ 100",C.g3],["🎯","Productivity",avg("productivity")+"%","self-reported",C.blue],["💬","Engagement",avg("engagement")+"%","Gallup Q12",C.purple],["📅","Absenteeism",avg("absenteeism")+" d","per month",C.red],["🌙","Sleep Score",avg("sleep"),"out of 5",C.purple],["🧘","Stress Score",avg("stress"),"lower is better",C.orange]].map(([icon,lbl,val,sub,col])=>(
          <Card key={lbl} color={col+"33"} style={{padding:"12px 14px"}}>
            <div style={{fontSize:20,marginBottom:3}}>{icon}</div>
            <div style={{fontSize:9,color:C.muted,marginBottom:2}}>{lbl}</div>
            <div style={{fontSize:20,fontWeight:800,color:col}}>{val}</div>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.28)"}}>{sub}</div>
          </Card>
        ))}
      </div>

      {/* CHART ROW */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:16}}>
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:700}}>Wellness by Dimension</div>
            <Toggle options={["wellnessIndex","sleep","stress","nutrition"]} value={well} onChange={setWell} colors={[C.g3,C.purple,C.orange,"#22c55e"]}/>
          </div>
          <div style={{fontSize:9,color:C.muted,marginBottom:6}}>By Department</div>
          <BarChart data={agg("dept",well)} color={C.g3} h={75}/>
          <div style={{fontSize:9,color:C.muted,marginTop:12,marginBottom:6}}>By Location</div>
          <BarChart data={agg("loc",well)} color={C.teal} h={75}/>
        </Card>
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:700}}>CXO Performance Metrics</div>
            <Toggle options={["productivity","engagement","absenteeism"]} value={cxo} onChange={setCxo} colors={[C.blue,C.orange,C.red]}/>
          </div>
          <div style={{fontSize:9,color:C.muted,marginBottom:6}}>By Department</div>
          <BarChart data={agg("dept",cxo)} color={C.blue} h={75}/>
          <div style={{fontSize:9,color:C.muted,marginTop:12,marginBottom:6}}>By Age Band</div>
          <BarChart data={agg("age",cxo)} color={C.purple} h={75}/>
        </Card>
      </div>

      {/* GENDER BREAKDOWN + SCATTER */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        <Card>
          <div style={{fontSize:12,fontWeight:700,marginBottom:12}}>Gender-wise Wellness & Productivity</div>
          {["Male","Female","Other"].map((g,i)=>{
            const rows=filtered.filter(r=>r.gender===g);
            if(!rows.length)return null;
            const wi=+(rows.reduce((s,r)=>s+r.wellnessIndex,0)/rows.length).toFixed(1);
            const pr=+(rows.reduce((s,r)=>s+r.productivity,0)/rows.length).toFixed(1);
            const cols=["#38bdf8","#f472b6","#a3e635"];
            return(
              <div key={g} style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:11,color:cols[i],fontWeight:600}}>{g}</span>
                  <span style={{fontSize:10,color:C.muted}}>Wellness: <b style={{color:cols[i]}}>{wi}</b> | Productivity: <b style={{color:cols[i]}}>{pr}%</b></span>
                </div>
                <div style={{height:5,borderRadius:5,background:"rgba(255,255,255,0.06)"}}>
                  <div style={{height:"100%",width:`${wi}%`,borderRadius:5,background:`linear-gradient(90deg,${cols[i]},${cols[i]}88)`}}/>
                </div>
              </div>
            );
          })}
        </Card>
        <Card>
          <div style={{fontSize:12,fontWeight:700,marginBottom:8}}>Wellness ↔ Productivity Correlation</div>
          <div style={{fontSize:9,color:C.muted,marginBottom:6}}>Each bubble = dept avg · size = headcount</div>
          <svg width="100%" height={130} viewBox="0 0 300 130">
            {DEPTS.map((d,i)=>{
              const rows=filtered.filter(r=>r.dept===d);
              if(!rows.length)return null;
              const wi=rows.reduce((s,r)=>s+r.wellnessIndex,0)/rows.length;
              const pr=rows.reduce((s,r)=>s+r.productivity,0)/rows.length;
              const cols=[C.blue,"#22c55e",C.orange,C.teal,C.pink,C.gold];
              const x=20+(wi/100)*260,y=120-(pr/100)*110;
              return <g key={d}><circle cx={x} cy={y} r={Math.sqrt(rows.length)*1.6+4} fill={cols[i]} opacity="0.5"/>
                <text x={x} y={y+3.5} textAnchor="middle" fontSize="7" fill="#fff">{d.slice(0,3)}</text></g>;
            })}
            <line x1="20" y1="120" x2="280" y2="120" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
            <line x1="20" y1="10"  x2="20"  y2="120" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
            <text x="150" y="129" textAnchor="middle" fontSize="7.5" fill={C.muted}>Wellness Index →</text>
          </svg>
        </Card>
      </div>

      {/* HEATMAP */}
      <Card>
        <div style={{fontSize:12,fontWeight:700,marginBottom:12}}>📊 Location × Department Wellness Heatmap</div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:400}}>
            <thead>
              <tr>
                <th style={{padding:"8px 12px",fontSize:9,color:C.muted,textAlign:"left"}}>↓ Location / Dept →</th>
                {DEPTS.map(d=><th key={d} style={{padding:"8px 8px",fontSize:9,color:C.muted,fontWeight:600,textAlign:"center"}}>{d.slice(0,6)}</th>)}
              </tr>
            </thead>
            <tbody>
              {LOCATIONS.map(loc=>(
                <tr key={loc}>
                  <td style={{padding:"6px 12px",fontSize:10,color:"rgba(255,255,255,0.5)",fontWeight:600}}>{loc}</td>
                  {DEPTS.map(dept=>{
                    const rows=HR_ROWS.filter(r=>r.loc===loc&&r.dept===dept);
                    const wi=rows.length?+(rows.reduce((s,r)=>s+r.wellnessIndex,0)/rows.length).toFixed(0):null;
                    if(!wi)return <td key={dept} style={{padding:"4px 8px"}}><div style={{background:"rgba(255,255,255,0.03)",borderRadius:6,padding:"3px 0",textAlign:"center",fontSize:9,color:"rgba(255,255,255,0.15)"}}>—</div></td>;
                    const inten=Math.max(0,(wi-50)/40);
                    return <td key={dept} style={{padding:"4px 8px",textAlign:"center"}}>
                      <div style={{background:`rgba(107,179,63,${inten*0.65+0.1})`,borderRadius:6,padding:"3px 0",fontSize:10,fontWeight:700,color:"#fff"}}>{wi}</div>
                    </td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App(){
  const [tab,setTab]               = useState("wellness");
  const [timeView,setTimeView]     = useState(1);

  // ── PWA state ──────────────────────────────────────────────────────────────
  const [isOnline,setIsOnline]     = useState(navigator.onLine);
  const [offlineQueue,setOfflineQueue] = useState(0);       // pending syncs
  const [showInstall,setShowInstall]   = useState(!isStandalone()); // hide if already installed
  const [pushPermission,setPushPerm]   = useState(getPushPermission());
  const [showPushPrompt,setShowPushPrompt] = useState(false);
  const [pwaInstallDone,setPwaInstallDone] = useState(isStandalone());

  // Track online/offline status
  useEffect(()=>{
    const goOnline  = ()=>{ setIsOnline(true);  setOfflineQueue(0); };
    const goOffline = ()=>  setIsOnline(false);
    window.addEventListener("online",  goOnline);
    window.addEventListener("offline", goOffline);
    return ()=>{
      window.removeEventListener("online",  goOnline);
      window.removeEventListener("offline", goOffline);
    };
  },[]);

  // After PWA install: wait 3 seconds, then offer push permission (if not granted)
  useEffect(()=>{
    if(pwaInstallDone && pushPermission === "default"){
      const t = setTimeout(()=>setShowPushPrompt(true), 3000);
      return ()=>clearTimeout(t);
    }
  },[pwaInstallDone, pushPermission]);

  const handlePushAllow = () => {
    setPushPerm("granted");
    setShowPushPrompt(false);
    // Production: call POST /api/reminders/push/subscribe with the subscription object
  };

  const vd=ALL_VIEWS[timeView];
  const lb=ALL_LABELS[timeView];

  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Outfit','Nunito','Segoe UI',sans-serif",color:"#fff",paddingBottom:showPushPrompt?120:0}}>

      {/* ── PWA PUSH PERMISSION BOTTOM SHEET ─────────────────────────────── */}
      {showPushPrompt&&(
        <PWAPushPrompt
          onAllow={handlePushAllow}
          onSkip={()=>setShowPushPrompt(false)}
        />
      )}

      {/* HEADER */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 22px",borderBottom:"1px solid rgba(255,255,255,0.06)",background:"rgba(255,255,255,0.01)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <AyuLogo size={32}/>
          <div>
            <div style={{fontWeight:800,fontSize:14,background:"linear-gradient(90deg,#4a7c2f,#6db33f)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:0.5}}>AYUMONK</div>
            <div style={{fontSize:8,color:"rgba(255,255,255,0.28)",letterSpacing:1}}>WELLNESS INTELLIGENCE PLATFORM</div>
          </div>
        </div>

        <div style={{display:"flex",gap:4,background:"rgba(0,0,0,0.4)",borderRadius:12,padding:4}}>
          {[["wellness","🌿 My Wellness"],["challenges","🎯 Challenges"],["hr","👔 HR Analytics"]].map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)} style={{padding:"7px 16px",borderRadius:9,border:"none",fontSize:11,fontWeight:600,cursor:"pointer",background:tab===id?"linear-gradient(135deg,#2C5F2D,#6db33f)":"transparent",color:tab===id?"#fff":"rgba(255,255,255,0.38)",transition:"all 0.25s"}}>{label}</button>
          ))}
        </div>

        {/* Right: date + PWA status badges */}
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {/* Push status badge */}
          {pushPermission==="granted"
            ? <span style={{fontSize:8,background:"rgba(107,179,63,0.15)",color:C.g3,borderRadius:5,padding:"2px 7px",fontWeight:600}}>🔔 Push ON</span>
            : <button onClick={()=>setShowPushPrompt(true)}
                style={{fontSize:8,background:"rgba(232,160,32,0.12)",color:C.gold,borderRadius:5,padding:"2px 7px",border:"1px solid rgba(232,160,32,0.3)",cursor:"pointer",fontWeight:600}}>
                🔔 Enable reminders
              </button>
          }
          {/* PWA install badge */}
          {isStandalone()
            ? <span style={{fontSize:8,background:"rgba(107,179,63,0.12)",color:C.g3,borderRadius:5,padding:"2px 7px",fontWeight:600}}>📲 Installed</span>
            : null
          }
          {/* Offline badge */}
          {!isOnline && (
            <span style={{fontSize:8,background:"rgba(232,160,32,0.18)",color:C.gold,borderRadius:5,padding:"2px 7px",fontWeight:700}}>📡 OFFLINE</span>
          )}
          <div style={{fontSize:9,color:"rgba(255,255,255,0.2)"}}>
            {new Date().toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",year:"2-digit"})}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{padding:"18px 22px"}}>

        {/* ── PWA INSTALL BANNER (only if not yet installed) ──────────────── */}
        {showInstall&&!isStandalone()&&(
          <PWAInstallBanner
            onDismiss={()=>{ setShowInstall(false); setPwaInstallDone(true); }}
          />
        )}

        {/* ── OFFLINE STATUS BAR ───────────────────────────────────────────── */}
        {!isOnline&&<PWAOfflineBadge queueCount={offlineQueue}/>}

        <div style={{fontSize:10,color:"rgba(255,255,255,0.28)",marginBottom:14,borderBottom:"1px solid rgba(255,255,255,0.05)",paddingBottom:10}}>
          {tab==="wellness"&&"🌿 Your Personal Wellness Journey — Nutrition · Lifestyle · Wellness · Dosha-aligned Ayurveda"}
          {tab==="challenges"&&"🎯 Daily Challenges — 1 to 3 taps to complete · Earn XP · Build Streaks · Unlock Badges"}
          {tab==="hr"&&"👔 HR Intelligence Centre — Population Health Analytics · CXO Metrics · Location & Department Insights"}
        </div>

        {tab==="wellness"&&<WellnessDashboard viewData={vd} labels={lb} timeView={timeView} setTimeView={setTimeView}/>}
        {tab==="challenges"&&<ChallengeDashboard isOnline={isOnline} onOfflineQueue={(n)=>setOfflineQueue(p=>p+n)}/>}
        {tab==="hr"&&<HRDashboard/>}
      </div>

      <div style={{padding:"10px 22px",borderTop:"1px solid rgba(255,255,255,0.05)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontSize:8,color:"rgba(255,255,255,0.16)"}}>WHO MHW · SF-12 · Gallup Q12 · UN SDGs · SHRM · Ayurveda Tridosha · W3C PWA</div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <span style={{fontSize:7,color:"rgba(107,179,63,0.4)",background:"rgba(107,179,63,0.06)",borderRadius:4,padding:"1px 6px"}}>PWA v6.0</span>
          <div style={{fontSize:8,color:"rgba(255,255,255,0.14)"}}>ayumonk.com/corporate © 2025</div>
        </div>
      </div>
    </div>
  );
}
