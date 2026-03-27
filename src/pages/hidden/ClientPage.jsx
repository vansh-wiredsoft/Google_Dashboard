import { useState, useEffect, useRef } from "react";

// ─── BRAND COLORS ─────────────────────────────────────────────────────────────
const C = {
  bg:"#0b160c", card:"#111e12", border:"#1e3d20",
  g1:"#2C5F2D", g2:"#4A8C2A", g3:"#6DB33F", g4:"#97C95C",
  white:"#FFFFFF", cream:"#E8F0E0", muted:"#6B8F60",
  orange:"#E8924A", blue:"#4A90C4", purple:"#8B6FCB",
  gold:"#D4A843", teal:"#3AADA8", red:"#E05050", pink:"#f472b6",
};

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
const PARAMS = [
  { id:"sleep",    label:"Sleep",        icon:"🌙", color:"#7c6af7", weight:0.20, baseline:2.8, sfDomain:"Mental Health",
    tip:"Fix 10PM bedtime. No screens 1hr before. Practice 4-7-8 breathing.",
    aahar:"Warm turmeric milk at bedtime. Avoid caffeine after 3PM.",
    vihar:"Digital detox from 9PM. Fixed wake-up alarm at 6AM.",
    aushadh:"Brahmi + Ashwagandha capsule at bedtime. Jatamansi oil on temples.", inverse:false },
  { id:"stress",   label:"Stress",       icon:"🧘", color:"#f97316", weight:0.15, baseline:3.4, sfDomain:"Role Emotional",
    tip:"10-min Anulom Vilom morning. Mid-day 5-min mindfulness break.",
    aahar:"Reduce processed sugar. Ashwagandha latte in morning.",
    vihar:"5-min mindfulness at 1PM. Nature walk on weekends.",
    aushadh:"Shankhpushpi syrup. Adaptogenic herb blend.", inverse:true },
  { id:"nutrition",label:"Nutrition",    icon:"🥗", color:"#22c55e", weight:0.15, baseline:3.1, sfDomain:"General Health",
    tip:"2 servings seasonal veg daily. Reduce refined sugar. Home-cooked dinner 5x/week.",
    aahar:"Seasonal vegetables + dals. Rainbow plate principle.",
    vihar:"Cook at home 5 nights/week. Eat slowly, chew 20x.",
    aushadh:"Triphala churna. Digestive enzyme support.", inverse:false },
  { id:"hydration",label:"Hydration",    icon:"💧", color:"#38bdf8", weight:0.10, baseline:3.0, sfDomain:"Vitality",
    tip:"Start day with 500ml warm water. Set hourly reminders. Jeera-infused water.",
    aahar:"Jeera water each morning. 8 glasses/day minimum.",
    vihar:"Set phone alarm every 90 min as water reminder.",
    aushadh:"Coconut water electrolytes in summer.", inverse:false },
  { id:"digestion",label:"Digestion",    icon:"🫁", color:"#a3e635", weight:0.10, baseline:3.2, sfDomain:"General Health",
    tip:"Walk 10 min post meals. Add ginger-cumin tea. Avoid cold water with food.",
    aahar:"Ginger-lemon tea post lunch. Warm water always.",
    vihar:"10-min walk after dinner. Vajrasana pose after meals.",
    aushadh:"Hingvastak churna before meals. Trikatu blend.", inverse:false },
  { id:"activity", label:"Activity",     icon:"🏃", color:"#fb923c", weight:0.10, baseline:2.9, sfDomain:"Physical Func.",
    tip:"20-min desk yoga. Take stairs. 15-min evening walk.",
    aahar:"Light banana or dates pre-workout. Stay hydrated.",
    vihar:"20-min desk yoga at 11AM. Always take stairs.",
    aushadh:"Mahanarayan oil massage weekly.", inverse:false },
  { id:"pain",     label:"Pain/Posture", icon:"🦴", color:"#e879f9", weight:0.10, baseline:3.3, sfDomain:"Bodily Pain",
    tip:"Ergonomic desk audit. Shoulder rolls every 45 min. Mahamash tailam weekly.",
    aahar:"Anti-inflammatory diet. Turmeric golden milk.",
    vihar:"Shoulder rolls every 45 min. Ergonomic chair check.",
    aushadh:"Mahamash tailam topical. Shallaki supplement.", inverse:true },
  { id:"energy",   label:"Energy",       icon:"⚡", color:"#fbbf24", weight:0.10, baseline:3.1, sfDomain:"Role Physical",
    tip:"Chyawanprash daily. Reduce afternoon carbs. 10-min power nap at lunch.",
    aahar:"Reduce afternoon carb load. Soak almonds overnight.",
    vihar:"10-min power nap at lunch. Sunlight exposure morning.",
    aushadh:"Chyawanprash every morning. Shilajit with warm milk.", inverse:false },
  { id:"emotional",label:"Emotional",    icon:"💚", color:"#34d399", weight:0.00, baseline:3.0, sfDomain:"Role Emotional",
    tip:"Gratitude journaling — 3 entries nightly. Connect with one friend/family daily.",
    aahar:"Eat with family or a friend. Social meals boost mood.",
    vihar:"Gratitude journal 3 entries nightly. Disconnect from news.",
    aushadh:"None needed — lifestyle is the medicine.", inverse:false },
  { id:"social",   label:"Social",       icon:"👨‍👩‍👧", color:"#f472b6", weight:0.00, baseline:2.8, sfDomain:"Social Func.",
    tip:"Schedule shared family meal 3x/week. One community event monthly.",
    aahar:"Shared meal ritual. Cook together as a family.",
    vihar:"Family meal 3x/week. One outdoor group activity monthly.",
    aushadh:"Community and belonging are the deepest healing.", inverse:false },
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

      {/* KPI DRILL-DOWN */}
      {sp&&(
        <Card style={{marginBottom:16,borderColor:sp.color+"44",background:sp.color+"07"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontSize:14,fontWeight:800}}>{sp.icon} {sp.label} — {VIEWS[timeView]} Detail</div>
            <div style={{display:"flex",gap:20,alignItems:"center"}}>
              {[["Baseline",sp.baseline.toFixed(1)],["Current",scores[sp.id].toFixed(1)],["Best",Math.max(...viewData[sp.id]).toFixed(1)],["Lowest",Math.min(...viewData[sp.id]).toFixed(1)]].map(([l,v])=>(
                <div key={l} style={{textAlign:"center"}}>
                  <div style={{fontSize:9,color:C.muted,textTransform:"uppercase"}}>{l}</div>
                  <div style={{fontSize:19,fontWeight:800,color:sp.color}}>{v}</div>
                </div>
              ))}
              <button onClick={()=>setSelectedKPI(null)} style={{background:"transparent",border:"none",color:C.muted,cursor:"pointer",fontSize:18,paddingLeft:8}}>✕</button>
            </div>
          </div>
          <MultiLine h={65} labels={labels} series={[{id:sp.id,vals:viewData[sp.id],c:sp.color}]} highlighted={[sp.id]}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginTop:14}}>
            {[["🥗 Aahar",sp.aahar,C.g3],["🏃 Vihar",sp.vihar,C.blue],["🌿 Aushadh",sp.aushadh,C.gold]].map(([lbl,val,col])=>(
              <div key={lbl} style={{background:col+"11",borderRadius:10,padding:"8px 12px",border:`1px solid ${col}33`}}>
                <div style={{fontSize:10,fontWeight:700,color:col,marginBottom:4}}>{lbl}</div>
                <div style={{fontSize:9,color:"rgba(255,255,255,0.6)",lineHeight:1.5}}>{val}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* LIFESTYLE SUGGESTIONS (weak KPIs) */}
      <Card style={{background:"rgba(107,179,63,0.04)",borderColor:"rgba(107,179,63,0.14)"}}>
        <div style={{fontSize:11,fontWeight:700,color:C.g3,marginBottom:10}}>🌿 Ayumonk Lifestyle Suggestions — Focus Areas This Week</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:10}}>
          {weakParams.map(p=>(
            <div key={p.id} style={{background:"rgba(255,255,255,0.025)",borderRadius:10,padding:"10px 14px",borderLeft:`3px solid ${p.color}`}}>
              <div style={{fontSize:11,fontWeight:700,marginBottom:4,color:p.color}}>{p.icon} {p.label}
                <span style={{fontSize:9,color:"#f87171",marginLeft:6,fontWeight:400}}>needs attention</span>
              </div>
              <div style={{fontSize:9.5,color:"rgba(255,255,255,0.55)",lineHeight:1.6}}>{p.tip}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── CHALLENGES DASHBOARD ─────────────────────────────────────────────────────
function ChallengeDashboard(){
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

  const done=CHALLENGE_DEFS.filter(c=>isDone(c.id)).length;
  const xpToday=CHALLENGE_DEFS.reduce((s,c)=>s+getXP(c.id),0);

  return(
    <div>
      {/* STATS BAR */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
        {[
          ["🔥 Streak","7 Days","Day 8 unlocks a badge!",C.orange],
          ["⭐ XP Today",`${340+xpToday} pts`,"Complete all 6 for bonus",C.gold],
          ["🌱 Level","Banyan Sapling","3 more days → Banyan Tree",C.g3],
          ["✅ Progress",`${done} / 6`,"Challenges completed today",C.blue],
        ].map(([lbl,val,sub,col])=>(
          <Card key={lbl} color={col+"33"} style={{padding:"12px 14px"}}>
            <div style={{fontSize:9,color:C.muted,marginBottom:3}}>{lbl}</div>
            <div style={{fontSize:20,fontWeight:800,color:col}}>{val}</div>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.28)",marginTop:2}}>{sub}</div>
          </Card>
        ))}
      </div>

      {/* PROGRESS BAR */}
      <div style={{marginBottom:18}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.muted,marginBottom:5}}>
          <span>Today's completion</span><span>{done}/6 challenges · {xpToday} XP earned today</span>
        </div>
        <div style={{height:6,borderRadius:6,background:"rgba(255,255,255,0.06)"}}>
          <div style={{height:"100%",borderRadius:6,width:`${(done/6)*100}%`,background:`linear-gradient(90deg,${C.g2},${C.g3})`,transition:"width 0.5s ease"}}/>
        </div>
      </div>

      {/* CHALLENGES GRID */}
      <div style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,0.45)",marginBottom:12}}>
        Today's Challenges <span style={{fontSize:9,fontWeight:400,color:"rgba(255,255,255,0.25)"}}>— 1 to 3 taps each. Simple as that.</span>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(290px,1fr))",gap:12,marginBottom:22}}>
        {CHALLENGE_DEFS.map(ch=>{
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
    </div>
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
  const [tab,setTab]=useState("wellness");
  const [timeView,setTimeView]=useState(1);
  const vd=ALL_VIEWS[timeView];
  const lb=ALL_LABELS[timeView];

  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Outfit','Nunito','Segoe UI',sans-serif",color:"#fff"}}>
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
        <div style={{fontSize:9,color:"rgba(255,255,255,0.2)"}}>
          {new Date().toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",year:"2-digit"})}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{padding:"18px 22px"}}>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.28)",marginBottom:14,borderBottom:"1px solid rgba(255,255,255,0.05)",paddingBottom:10}}>
          {tab==="wellness"&&"🌿 Your Personal Wellness Journey — Nutrition · Lifestyle · Wellness · Dosha-aligned Ayurveda"}
          {tab==="challenges"&&"🎯 Daily Challenges — 1 to 3 taps to complete · Earn XP · Build Streaks · Unlock Badges"}
          {tab==="hr"&&"👔 HR Intelligence Centre — Population Health Analytics · CXO Metrics · Location & Department Insights"}
        </div>
        {tab==="wellness"&&<WellnessDashboard viewData={vd} labels={lb} timeView={timeView} setTimeView={setTimeView}/>}
        {tab==="challenges"&&<ChallengeDashboard/>}
        {tab==="hr"&&<HRDashboard/>}
      </div>

      <div style={{padding:"10px 22px",borderTop:"1px solid rgba(255,255,255,0.05)",display:"flex",justifyContent:"space-between"}}>
        <div style={{fontSize:8,color:"rgba(255,255,255,0.16)"}}>WHO MHW · SF-12 · Gallup Q12 · UN SDGs · SHRM · Ayurveda Tridosha</div>
        <div style={{fontSize:8,color:"rgba(255,255,255,0.14)"}}>ayumonk.com/corporate © 2025</div>
      </div>
    </div>
  );
}
