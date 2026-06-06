import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase.js";

// ==================== THEMES ====================
const DARK = {
  bg:"#0f1724",bgCard:"#182234",bgHover:"#1e2d45",bgInput:"#131d2e",border:"#263654",
  primary:"#2e7cf6",primaryMuted:"rgba(46,124,246,0.12)",accent:"#22c55e",accentOrange:"#f59e0b",accentRed:"#ef4444",
  textPrimary:"#e8edf5",textSecondary:"#8899b4",textMuted:"#5a6d8a",
};
const LIGHT = {
  bg:"#f0f2f5",bgCard:"#ffffff",bgHover:"#f5f7fa",bgInput:"#f0f2f5",border:"#e2e8f0",
  primary:"#2e7cf6",primaryMuted:"rgba(46,124,246,0.08)",accent:"#22c55e",accentOrange:"#f59e0b",accentRed:"#ef4444",
  textPrimary:"#1a202c",textSecondary:"#64748b",textMuted:"#94a3b8",
};
const PRI={High:{color:"#ef4444",bg:"rgba(239,68,68,0.12)"},Medium:{color:"#f59e0b",bg:"rgba(245,158,11,0.12)"},Low:{color:"#22c55e",bg:"rgba(34,197,94,0.12)"}};
const AVS=["#2e7cf6","#8b5cf6","#ec4899","#f59e0b","#22c55e","#ef4444","#14b8a6","#f97316"];
const ff="'IBM Plex Sans','Segoe UI',sans-serif";

// ==================== COMPONENTS ====================
const Avatar=({name,color,size=32})=>(<div style={{width:size,height:size,borderRadius:"50%",background:color||AVS[0],display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.38,fontWeight:700,color:"#fff",flexShrink:0}}>{name?.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2)}</div>);
const Badge=({text,color,bg})=>(<span style={{padding:"3px 10px",borderRadius:4,fontSize:11,fontWeight:600,color,background:bg,whiteSpace:"nowrap"}}>{text}</span>);
const Btn=({children,onClick,variant="primary",style:s={},disabled,C:t})=>{const c=t||DARK;const vs={primary:{background:disabled?c.textMuted:c.primary,color:"#fff"},ghost:{background:"transparent",color:c.textSecondary,border:`1px solid ${c.border}`},danger:{background:"transparent",color:c.accentRed,border:`1px solid ${c.accentRed}`}};return<button onClick={onClick} disabled={disabled} style={{padding:"9px 18px",borderRadius:6,fontSize:13,fontWeight:600,cursor:disabled?"not-allowed":"pointer",border:"none",transition:"all 0.15s",display:"inline-flex",alignItems:"center",gap:6,fontFamily:ff,...vs[variant],...s}}>{children}</button>;};
const Inp=({label,C:t,...p})=>{const c=t||DARK;return(<div style={{display:"flex",flexDirection:"column",gap:5}}>{label&&<label style={{fontSize:12,fontWeight:600,color:c.textSecondary,letterSpacing:0.4,textTransform:"uppercase"}}>{label}</label>}<input {...p} style={{padding:"10px 14px",borderRadius:6,border:`1px solid ${c.border}`,background:c.bgInput,color:c.textPrimary,fontSize:14,outline:"none",fontFamily:ff,...(p.style||{})}} onFocus={e=>e.target.style.borderColor=c.primary} onBlur={e=>e.target.style.borderColor=c.border}/></div>);};
const Sel=({label,children,C:t,...p})=>{const c=t||DARK;return(<div style={{display:"flex",flexDirection:"column",gap:5}}>{label&&<label style={{fontSize:12,fontWeight:600,color:c.textSecondary,letterSpacing:0.4,textTransform:"uppercase"}}>{label}</label>}<select {...p} style={{padding:"10px 14px",borderRadius:6,border:`1px solid ${c.border}`,background:c.bgInput,color:c.textPrimary,fontSize:14,outline:"none",fontFamily:ff,...(p.style||{})}}>{children}</select></div>);};
const Modal=({title,onClose,children,width=480,C:t})=>{const c=t||DARK;return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100}} onClick={onClose}><div onClick={e=>e.stopPropagation()} style={{width,maxWidth:"92vw",maxHeight:"88vh",overflow:"auto",padding:32,borderRadius:12,background:c.bgCard,border:`1px solid ${c.border}`,boxShadow:"0 24px 64px rgba(0,0,0,0.5)"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}><h3 style={{margin:0,fontSize:18,fontWeight:700,color:c.textPrimary}}>{title}</h3><span onClick={onClose} style={{cursor:"pointer",color:c.textMuted,fontSize:20}}>✕</span></div>{children}</div></div>);};
const StatCard=({label,value,sub,color,C:t})=>{const c=t||DARK;return(<div style={{flex:"1 1 200px",padding:"22px 24px",borderRadius:10,background:c.bgCard,border:`1px solid ${c.border}`}}><div style={{fontSize:11,fontWeight:700,color:c.textMuted,textTransform:"uppercase",letterSpacing:0.8,marginBottom:8}}>{label}</div><div style={{fontSize:28,fontWeight:800,color:color||c.textPrimary,letterSpacing:-1}}>{value}</div><div style={{fontSize:12,color:c.textSecondary,marginTop:4}}>{sub}</div></div>);};

// ==================== SEARCH BAR ====================
function SearchFilterBar({search,setSearch,filterProject,setFilterProject,filterPriority,setFilterPriority,projects,showProjectFilter=true,C:c}){
  return(<div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
    <div style={{position:"relative",flex:"1 1 220px"}}><span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:14,color:c.textMuted}}>🔍</span>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search tasks..." style={{width:"100%",padding:"9px 14px 9px 36px",borderRadius:6,border:`1px solid ${c.border}`,background:c.bgInput,color:c.textPrimary,fontSize:13,outline:"none",fontFamily:ff,boxSizing:"border-box"}}/></div>
    {showProjectFilter&&<select value={filterProject} onChange={e=>setFilterProject(e.target.value)} style={{padding:"9px 12px",borderRadius:6,border:`1px solid ${c.border}`,background:c.bgInput,color:c.textSecondary,fontSize:12,fontFamily:ff,outline:"none"}}><option value="">All Projects</option>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>}
    <select value={filterPriority} onChange={e=>setFilterPriority(e.target.value)} style={{padding:"9px 12px",borderRadius:6,border:`1px solid ${c.border}`,background:c.bgInput,color:c.textSecondary,fontSize:12,fontFamily:ff,outline:"none"}}><option value="">All Priorities</option><option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option></select>
    {(search||filterProject||filterPriority)&&<Btn variant="ghost" C={c} onClick={()=>{setSearch("");setFilterProject("");setFilterPriority("");}} style={{padding:"8px 12px",fontSize:12}}>Clear</Btn>}
  </div>);
}

// ==================== TASK DETAIL ====================
function TaskDetail({task,onClose,session,user,onUpdate,categories,members,C:c}){
  const[comments,setComments]=useState([]);const[subtasks,setSubtasks]=useState([]);
  const[newComment,setNewComment]=useState("");const[newSubtask,setNewSubtask]=useState("");
  const[posting,setPosting]=useState(false);const[status,setStatus]=useState(task.status);
  const[desc,setDesc]=useState(task.description||"");const[editingDesc,setEditingDesc]=useState(false);
  const[priority,setPriority]=useState(task.priority);const[catId,setCatId]=useState(task.category_id||"");
  const[assignee,setAssignee]=useState(task.assignee_id||"");

  const load=useCallback(async()=>{
    const{data:cm}=await supabase.from("comments").select("*").eq("task_id",task.id).order("created_at",{ascending:true});
    const{data:st}=await supabase.from("subtasks").select("*").eq("task_id",task.id).order("created_at",{ascending:true});
    if(cm)setComments(cm);if(st)setSubtasks(st);},[task.id]);
  useEffect(()=>{load();},[load]);

  const addComment=async()=>{if(!newComment.trim())return;setPosting(true);await supabase.from("comments").insert({task_id:task.id,user_id:session.user.id,content:newComment});setNewComment("");await load();setPosting(false);};
  const addSub=async()=>{if(!newSubtask.trim())return;await supabase.from("subtasks").insert({task_id:task.id,title:newSubtask});setNewSubtask("");await load();};
  const toggleSub=async(id,v)=>{await supabase.from("subtasks").update({completed:!v}).eq("id",id);await load();};
  const delSub=async id=>{await supabase.from("subtasks").delete().eq("id",id);await load();};
  const updStatus=async s=>{setStatus(s);await supabase.from("tasks").update({status:s,updated_at:new Date().toISOString()}).eq("id",task.id);onUpdate();};
  const updPri=async p=>{setPriority(p);await supabase.from("tasks").update({priority:p}).eq("id",task.id);onUpdate();};
  const updCat=async v=>{setCatId(v);await supabase.from("tasks").update({category_id:v||null}).eq("id",task.id);onUpdate();};
  const updAssignee=async v=>{setAssignee(v);await supabase.from("tasks").update({assignee_id:v||null}).eq("id",task.id);onUpdate();};
  const saveDesc=async()=>{await supabase.from("tasks").update({description:desc}).eq("id",task.id);setEditingDesc(false);onUpdate();};
  const delTask=async()=>{await supabase.from("tasks").delete().eq("id",task.id);onClose();onUpdate();};
  const timeAgo=d=>{const m=Math.floor((Date.now()-new Date(d))/60000);if(m<1)return"just now";if(m<60)return`${m}m ago`;const h=Math.floor(m/60);if(h<24)return`${h}h ago`;return`${Math.floor(h/24)}d ago`;};
  const cd=subtasks.filter(s=>s.completed).length,pct=subtasks.length>0?Math.round((cd/subtasks.length)*100):0;
  const assignedMember=members.find(m=>m.id===assignee);

  return(<Modal title={task.title} onClose={onClose} width={600} C={c}>
    <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
      <Badge text={task.project_name} color={c.primary} bg={c.primaryMuted}/>
      {task.category_name&&<Badge text={task.category_name} color={c.accentOrange} bg="rgba(245,158,11,0.12)"/>}
      {task.deadline&&<span style={{fontSize:12,color:c.textSecondary}}>📅 {task.deadline}</span>}
      {assignedMember&&<div style={{display:"flex",alignItems:"center",gap:6}}><Avatar name={assignedMember.full_name} color={AVS[assignedMember.full_name.length%AVS.length]} size={20}/><span style={{fontSize:12,color:c.textSecondary}}>{assignedMember.full_name}</span></div>}
    </div>

    <div style={{display:"flex",gap:16,marginBottom:16,flexWrap:"wrap"}}>
      <div style={{flex:1,minWidth:200}}><label style={{fontSize:11,fontWeight:700,color:c.textMuted,letterSpacing:0.5,textTransform:"uppercase",display:"block",marginBottom:6}}>Status</label>
        <div style={{display:"flex",gap:6}}>{[{key:"todo",label:"To Do",color:c.primary},{key:"progress",label:"In Progress",color:c.accentOrange},{key:"done",label:"Done",color:c.accent}].map(s=>(
          <div key={s.key} onClick={()=>updStatus(s.key)} style={{padding:"5px 12px",borderRadius:5,fontSize:12,fontWeight:600,cursor:"pointer",background:status===s.key?s.color:"transparent",color:status===s.key?"#fff":c.textSecondary,border:`1px solid ${status===s.key?s.color:c.border}`}}>{s.label}</div>))}</div></div>
      <div style={{flex:1,minWidth:200}}><label style={{fontSize:11,fontWeight:700,color:c.textMuted,letterSpacing:0.5,textTransform:"uppercase",display:"block",marginBottom:6}}>Priority</label>
        <div style={{display:"flex",gap:6}}>{"High Medium Low".split(" ").map(p=>(
          <div key={p} onClick={()=>updPri(p)} style={{padding:"5px 12px",borderRadius:5,fontSize:12,fontWeight:600,cursor:"pointer",background:priority===p?PRI[p].bg:"transparent",color:priority===p?PRI[p].color:c.textSecondary,border:`1px solid ${priority===p?PRI[p].color:c.border}`}}>{p}</div>))}</div></div>
    </div>

    {/* Assignee */}
    <div style={{marginBottom:16}}><label style={{fontSize:11,fontWeight:700,color:c.textMuted,letterSpacing:0.5,textTransform:"uppercase",display:"block",marginBottom:6}}>Assigned To</label>
      <select value={assignee} onChange={e=>updAssignee(e.target.value)} style={{padding:"8px 12px",borderRadius:6,border:`1px solid ${c.border}`,background:c.bgInput,color:c.textPrimary,fontSize:13,fontFamily:ff,outline:"none"}}>
        <option value="">Unassigned</option>{members.map(m=><option key={m.id} value={m.id}>{m.full_name}{m.id===session.user.id?" (You)":""}</option>)}</select></div>

    {categories.length>0&&<div style={{marginBottom:16}}><label style={{fontSize:11,fontWeight:700,color:c.textMuted,letterSpacing:0.5,textTransform:"uppercase",display:"block",marginBottom:6}}>Category</label>
      <select value={catId} onChange={e=>updCat(e.target.value)} style={{padding:"8px 12px",borderRadius:6,border:`1px solid ${c.border}`,background:c.bgInput,color:c.textPrimary,fontSize:13,fontFamily:ff,outline:"none"}}><option value="">No category</option>{categories.map(ct=><option key={ct.id} value={ct.id}>{ct.name}</option>)}</select></div>}

    {/* Description */}
    <div style={{marginBottom:20,borderTop:`1px solid ${c.border}`,paddingTop:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <label style={{fontSize:11,fontWeight:700,color:c.textMuted,letterSpacing:0.5,textTransform:"uppercase"}}>Description</label>
        {!editingDesc&&<span onClick={()=>setEditingDesc(true)} style={{fontSize:11,color:c.primary,cursor:"pointer"}}>Edit</span>}</div>
      {editingDesc?<div><textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Add details..." rows={4} style={{width:"100%",padding:"10px 14px",borderRadius:6,border:`1px solid ${c.border}`,background:c.bgInput,color:c.textPrimary,fontSize:13,outline:"none",fontFamily:ff,resize:"vertical",boxSizing:"border-box"}}/>
        <div style={{display:"flex",gap:8,marginTop:8}}><Btn onClick={saveDesc} C={c} style={{padding:"6px 14px",fontSize:12}}>Save</Btn><Btn variant="ghost" C={c} onClick={()=>{setDesc(task.description||"");setEditingDesc(false);}} style={{padding:"6px 14px",fontSize:12}}>Cancel</Btn></div></div>
      :<p style={{margin:0,fontSize:13,color:desc?c.textSecondary:c.textMuted,lineHeight:1.6,cursor:"pointer"}} onClick={()=>setEditingDesc(true)}>{desc||"Click to add description..."}</p>}</div>

    {/* Subtasks */}
    <div style={{marginBottom:20,borderTop:`1px solid ${c.border}`,paddingTop:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <label style={{fontSize:11,fontWeight:700,color:c.textMuted,letterSpacing:0.5,textTransform:"uppercase"}}>Checklist {subtasks.length>0&&`(${cd}/${subtasks.length})`}</label>
        {subtasks.length>0&&<span style={{fontSize:11,color:c.textMuted}}>{pct}%</span>}</div>
      {subtasks.length>0&&<div style={{height:4,borderRadius:2,background:c.bgHover,marginBottom:12,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,borderRadius:2,background:pct===100?c.accent:c.primary,transition:"width 0.3s"}}/></div>}
      <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:10}}>{subtasks.map(s=>(
        <div key={s.id} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0"}}>
          <div onClick={()=>toggleSub(s.id,s.completed)} style={{width:18,height:18,borderRadius:4,flexShrink:0,cursor:"pointer",border:`2px solid ${s.completed?c.accent:c.border}`,background:s.completed?c.accent:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff"}}>{s.completed&&"✓"}</div>
          <span style={{flex:1,fontSize:13,color:s.completed?c.textMuted:c.textPrimary,textDecoration:s.completed?"line-through":"none"}}>{s.title}</span>
          <span onClick={()=>delSub(s.id)} style={{fontSize:14,color:c.textMuted,cursor:"pointer",opacity:0.5}}>✕</span></div>))}</div>
      <div style={{display:"flex",gap:8}}><input value={newSubtask} onChange={e=>setNewSubtask(e.target.value)} placeholder="Add checklist item..." onKeyDown={e=>e.key==="Enter"&&addSub()}
        style={{flex:1,padding:"8px 12px",borderRadius:6,border:`1px solid ${c.border}`,background:c.bgInput,color:c.textPrimary,fontSize:12,outline:"none",fontFamily:ff}}/>
        <Btn onClick={addSub} C={c} style={{padding:"6px 12px",fontSize:12}}>Add</Btn></div></div>

    {/* Comments */}
    <div style={{borderTop:`1px solid ${c.border}`,paddingTop:16}}>
      <h4 style={{margin:"0 0 12px",fontSize:11,fontWeight:700,color:c.textMuted,letterSpacing:0.5,textTransform:"uppercase"}}>Comments ({comments.length})</h4>
      {comments.length===0&&<p style={{color:c.textMuted,fontSize:13,marginBottom:12}}>No comments yet.</p>}
      <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:14,maxHeight:200,overflowY:"auto"}}>{comments.map(cm=>{
        const author=members.find(m=>m.id===cm.user_id);
        return(<div key={cm.id} style={{display:"flex",gap:10}}>
          <Avatar name={author?.full_name||user?.full_name||"U"} color={AVS[(author?.full_name||"U").length%AVS.length]} size={26}/>
          <div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
            <span style={{fontSize:12,fontWeight:600,color:c.textPrimary}}>{author?.full_name||"You"}</span>
            <span style={{fontSize:11,color:c.textMuted}}>{timeAgo(cm.created_at)}</span></div>
            <p style={{margin:0,fontSize:13,color:c.textSecondary,lineHeight:1.5}}>{cm.content}</p></div></div>);})}</div>
      <div style={{display:"flex",gap:8}}><input value={newComment} onChange={e=>setNewComment(e.target.value)} placeholder="Write a comment..." onKeyDown={e=>e.key==="Enter"&&addComment()}
        style={{flex:1,padding:"9px 12px",borderRadius:6,border:`1px solid ${c.border}`,background:c.bgInput,color:c.textPrimary,fontSize:13,outline:"none",fontFamily:ff}}/>
        <Btn onClick={addComment} disabled={posting||!newComment.trim()} C={c} style={{padding:"9px 14px"}}>{posting?"...":"Post"}</Btn></div></div>
    <div style={{borderTop:`1px solid ${c.border}`,marginTop:20,paddingTop:14,display:"flex",justifyContent:"flex-end"}}><Btn variant="danger" C={c} onClick={delTask} style={{fontSize:12}}>Delete Task</Btn></div>
  </Modal>);
}

// ==================== INVITE MODAL ====================
function InviteModal({project,onClose,session,onUpdate,C:c}){
  const[email,setEmail]=useState("");const[sending,setSending]=useState(false);const[msg,setMsg]=useState("");const[copied,setCopied]=useState(false);
  const inviteLink=typeof window!=="undefined"?`${window.location.origin}?invite=${project.id}`:"";
  const invite=async()=>{if(!email.trim())return;setSending(true);setMsg("");
    const{data:existing}=await supabase.from("invitations").select("*").eq("project_id",project.id).eq("email",email);
    if(existing&&existing.length>0){setMsg("Already invited!");setSending(false);return;}
    const{error}=await supabase.from("invitations").insert({project_id:project.id,email:email.trim().toLowerCase(),invited_by:session.user.id});
    if(error){setMsg(error.message);}else{setMsg("Invitation created! Share the link below with them.");setEmail("");}
    await onUpdate();setSending(false);};
  const copyLink=()=>{navigator.clipboard.writeText(inviteLink).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});};
  return(<Modal title={`Invite to ${project.name}`} onClose={onClose} C={c}>
    <p style={{color:c.textSecondary,fontSize:13,marginBottom:20}}>Invite a teammate by email. They'll see the invitation when they log in.</p>
    <div style={{display:"flex",gap:10,marginBottom:12}}>
      <Inp C={c} placeholder="teammate@email.com" type="email" value={email} onChange={e=>setEmail(e.target.value)} style={{flex:1}}/>
      <Btn onClick={invite} disabled={sending} C={c}>{sending?"Sending...":"Invite"}</Btn></div>
    {msg&&<div style={{padding:"10px 14px",borderRadius:6,background:msg.includes("created")?`rgba(34,197,94,0.12)`:"rgba(239,68,68,0.12)",color:msg.includes("created")?c.accent:c.accentRed,fontSize:13,marginBottom:12}}>{msg}</div>}
    <div style={{borderTop:`1px solid ${c.border}`,marginTop:16,paddingTop:16}}>
      <label style={{fontSize:12,fontWeight:600,color:c.textSecondary,letterSpacing:0.4,textTransform:"uppercase",display:"block",marginBottom:8}}>Or share invite link</label>
      <div style={{display:"flex",gap:8}}>
        <div style={{flex:1,padding:"10px 14px",borderRadius:6,border:`1px solid ${c.border}`,background:c.bgInput,color:c.textMuted,fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{inviteLink}</div>
        <Btn onClick={copyLink} variant="ghost" C={c} style={{fontSize:12,whiteSpace:"nowrap"}}>{copied?"✓ Copied!":"Copy Link"}</Btn></div>
      <p style={{fontSize:11,color:c.textMuted,marginTop:8}}>Send this link via WhatsApp, email, or any messenger. They need to sign up with the email you invited.</p>
    </div>
  </Modal>);
}

// ==================== PENDING INVITATIONS BAR ====================
function PendingInvitations({invitations,projects,onAccept,onDecline,C:c}){
  if(!invitations||invitations.length===0)return null;
  return(<div style={{marginBottom:20}}>{invitations.map(inv=>{
    return(<div key={inv.id} style={{padding:"14px 20px",borderRadius:10,background:c.primaryMuted,border:`1px solid ${c.primary}`,marginBottom:8,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div><span style={{fontSize:13,fontWeight:600,color:c.textPrimary}}>You've been invited to a project!</span>
        <span style={{fontSize:12,color:c.textSecondary,marginLeft:8}}>({inv.email})</span></div>
      <div style={{display:"flex",gap:8}}><Btn onClick={()=>onAccept(inv)} C={c} style={{padding:"6px 14px",fontSize:12}}>Accept</Btn>
        <Btn variant="ghost" onClick={()=>onDecline(inv)} C={c} style={{padding:"6px 14px",fontSize:12}}>Decline</Btn></div></div>);})}</div>);
}

// ==================== PROJECT DETAIL ====================
function ProjectDetail({project,tasks,categories,members,onBack,onTaskClick,session,onUpdate,C:c}){
  const[showNewCat,setShowNewCat]=useState(false);const[showInvite,setShowInvite]=useState(false);
  const[newCat,setNewCat]=useState({name:"",color:"#2e7cf6"});const[saving,setSaving]=useState(false);
  const[invitations,setInvitations]=useState([]);

  useEffect(()=>{(async()=>{const{data}=await supabase.from("invitations").select("*").eq("project_id",project.id);if(data)setInvitations(data);})();},[project.id]);

  const pTasks=tasks.filter(t=>t.project_id===project.id),pDone=pTasks.filter(t=>t.status==="done").length;
  const pct=pTasks.length>0?Math.round((pDone/pTasks.length)*100):0;
  const pCats=categories.filter(ct=>ct.project_id===project.id);
  const uncat=pTasks.filter(t=>!t.category_id);
  const pMembers=members.filter(m=>m.project_id===project.id);

  const addCat=async()=>{if(!newCat.name.trim())return;setSaving(true);await supabase.from("categories").insert({project_id:project.id,name:newCat.name,color:newCat.color});setNewCat({name:"",color:"#2e7cf6"});setShowNewCat(false);await onUpdate();setSaving(false);};
  const delCat=async id=>{await supabase.from("categories").delete().eq("id",id);await onUpdate();};
  const delProject=async()=>{if(!window.confirm("Delete this project?"))return;await supabase.from("projects").delete().eq("id",project.id);onBack();await onUpdate();};

  const TaskRow=({t,i,len})=>(<div key={t.id} onClick={()=>onTaskClick(t)} style={{padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",borderBottom:i<len-1?`1px solid ${c.border}`:"none"}} onMouseEnter={e=>e.currentTarget.style.background=c.bgHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
    <div style={{display:"flex",alignItems:"center",gap:12}}>
      <div style={{width:16,height:16,borderRadius:4,border:`2px solid ${t.status==="done"?c.accent:c.border}`,background:t.status==="done"?c.accent:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#fff"}}>{t.status==="done"&&"✓"}</div>
      <span style={{fontSize:13,fontWeight:600,color:c.textPrimary,textDecoration:t.status==="done"?"line-through":"none"}}>{t.title}</span></div>
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      {t.assignee_name&&t.assignee_id&&<Avatar name={t.assignee_name} color={AVS[t.assignee_name.length%AVS.length]} size={22}/>}
      {t.subtask_count>0&&<span style={{fontSize:11,color:c.textMuted}}>☑ {t.subtask_done}/{t.subtask_count}</span>}
      <Badge text={t.priority} color={PRI[t.priority]?.color} bg={PRI[t.priority]?.bg}/>{t.deadline&&<span style={{fontSize:11,color:c.textMuted}}>{t.deadline}</span>}</div></div>);

  return(<div>
    <span onClick={onBack} style={{fontSize:14,color:c.primary,cursor:"pointer",fontWeight:600}}>← All Projects</span>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:8,marginBottom:20}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}><div style={{width:20,height:20,borderRadius:6,background:project.color}}/><h2 style={{margin:0,fontSize:22,fontWeight:800,color:c.textPrimary}}>{project.name}</h2></div>
      <div style={{display:"flex",gap:8}}><Btn onClick={()=>setShowInvite(true)} C={c} style={{fontSize:12}}>👥 Invite</Btn><Btn onClick={()=>setShowNewCat(true)} variant="ghost" C={c} style={{fontSize:12}}>+ Category</Btn><Btn variant="danger" C={c} onClick={delProject} style={{fontSize:12}}>Delete</Btn></div></div>

    {/* Team Members */}
    <div style={{background:c.bgCard,borderRadius:10,border:`1px solid ${c.border}`,padding:"16px 20px",marginBottom:20}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <label style={{fontSize:11,fontWeight:700,color:c.textMuted,letterSpacing:0.5,textTransform:"uppercase"}}>Team Members ({pMembers.length})</label></div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {pMembers.map((m,i)=>{const roleColors={owner:{color:"#f59e0b",bg:"rgba(245,158,11,0.12)"},admin:{color:"#8b5cf6",bg:"rgba(139,92,246,0.12)"},member:{color:"#2e7cf6",bg:"rgba(46,124,246,0.12)"},viewer:{color:"#64748b",bg:"rgba(100,116,139,0.12)"}};const rc=roleColors[m.role]||roleColors.member;
          return(<div key={m.user_id||i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",borderRadius:8,background:c.bgHover}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <Avatar name={m.full_name||m.email||"?"} color={AVS[(m.full_name||"?").length%AVS.length]} size={32}/>
              <div><div style={{fontSize:13,fontWeight:600,color:c.textPrimary}}>{m.full_name||"User"}</div>
                <div style={{fontSize:11,color:c.textMuted}}>{m.email||""}</div></div></div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              {m.role==="owner"?<Badge text="Owner" color={rc.color} bg={rc.bg}/>:
                project.owner_id===session.user.id?<select value={m.role} onChange={async e=>{await supabase.from("project_members").update({role:e.target.value}).eq("project_id",project.id).eq("user_id",m.user_id);await onUpdate();}}
                  style={{padding:"4px 8px",borderRadius:4,border:`1px solid ${c.border}`,background:c.bgInput,color:c.textPrimary,fontSize:11,fontFamily:ff,outline:"none"}}>
                  <option value="admin">Admin</option><option value="member">Member</option><option value="viewer">Viewer</option></select>
                :<Badge text={m.role.charAt(0).toUpperCase()+m.role.slice(1)} color={rc.color} bg={rc.bg}/>}
              {project.owner_id===session.user.id&&m.role!=="owner"&&<span onClick={async()=>{if(window.confirm(`Remove ${m.full_name}?`)){await supabase.from("project_members").delete().eq("project_id",project.id).eq("user_id",m.user_id);await onUpdate();}}} style={{fontSize:14,color:c.textMuted,cursor:"pointer",opacity:0.5}}>✕</span>}
            </div></div>);})}
      </div>
      {invitations.filter(i=>i.status==="pending").length>0&&(<div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${c.border}`}}>
        <label style={{fontSize:11,fontWeight:700,color:c.textMuted,letterSpacing:0.5,textTransform:"uppercase",marginBottom:8,display:"block"}}>Pending Invitations</label>
        {invitations.filter(i=>i.status==="pending").map(inv=>(<div key={inv.id} style={{fontSize:12,color:c.accentOrange,marginBottom:4}}>📧 {inv.email} — pending</div>))}</div>)}
    </div>

    {/* Progress */}
    <div style={{background:c.bgCard,borderRadius:10,border:`1px solid ${c.border}`,padding:"20px 24px",marginBottom:24}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><span style={{fontSize:13,fontWeight:600,color:c.textPrimary}}>{pDone}/{pTasks.length} tasks completed</span><span style={{fontSize:13,fontWeight:700,color:project.color}}>{pct}%</span></div>
      <div style={{height:8,borderRadius:4,background:c.bgHover,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,borderRadius:4,background:project.color,transition:"width 0.3s"}}/></div>
      <div style={{display:"flex",gap:20,marginTop:16}}>
        <div><span style={{fontSize:20,fontWeight:800,color:c.primary}}>{pTasks.filter(t=>t.status==="todo").length}</span><span style={{fontSize:12,color:c.textMuted,marginLeft:6}}>To Do</span></div>
        <div><span style={{fontSize:20,fontWeight:800,color:c.accentOrange}}>{pTasks.filter(t=>t.status==="progress").length}</span><span style={{fontSize:12,color:c.textMuted,marginLeft:6}}>In Progress</span></div>
        <div><span style={{fontSize:20,fontWeight:800,color:c.accent}}>{pDone}</span><span style={{fontSize:12,color:c.textMuted,marginLeft:6}}>Done</span></div></div></div>

    {/* Categories */}
    {pCats.map(cat=>{const ct=pTasks.filter(t=>t.category_id===cat.id),ctd=ct.filter(t=>t.status==="done").length,ctp=ct.length>0?Math.round((ctd/ct.length)*100):0;
      return(<div key={cat.id} style={{marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:10,height:10,borderRadius:3,background:cat.color}}/><h3 style={{margin:0,fontSize:15,fontWeight:700,color:c.textPrimary}}>{cat.name}</h3><span style={{fontSize:11,color:c.textMuted,marginLeft:4}}>{ctd}/{ct.length} · {ctp}%</span></div>
          <span onClick={()=>delCat(cat.id)} style={{fontSize:12,color:c.textMuted,cursor:"pointer"}}>✕</span></div>
        {ct.length>0&&<div style={{height:4,borderRadius:2,background:c.bgHover,marginBottom:10,overflow:"hidden"}}><div style={{height:"100%",width:`${ctp}%`,borderRadius:2,background:cat.color,transition:"width 0.3s"}}/></div>}
        <div style={{background:c.bgCard,borderRadius:10,border:`1px solid ${c.border}`,overflow:"hidden"}}>
          {ct.length===0?<div style={{padding:"16px 20px",textAlign:"center",color:c.textMuted,fontSize:13}}>No tasks</div>:ct.map((t,i)=><TaskRow key={t.id} t={t} i={i} len={ct.length}/>)}</div></div>);})}

    {uncat.length>0&&<div style={{marginBottom:20}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><div style={{width:10,height:10,borderRadius:3,background:c.textMuted}}/><h3 style={{margin:0,fontSize:15,fontWeight:700,color:c.textSecondary}}>Uncategorized</h3></div>
      <div style={{background:c.bgCard,borderRadius:10,border:`1px solid ${c.border}`,overflow:"hidden"}}>{uncat.map((t,i)=><TaskRow key={t.id} t={t} i={i} len={uncat.length}/>)}</div></div>}

    {showNewCat&&<Modal title="New Category" onClose={()=>setShowNewCat(false)} C={c}>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <Inp label="Category Name" C={c} placeholder="e.g. Design, Backend" value={newCat.name} onChange={e=>setNewCat({...newCat,name:e.target.value})}/>
        <div style={{display:"flex",flexDirection:"column",gap:5}}><label style={{fontSize:12,fontWeight:600,color:c.textSecondary,letterSpacing:0.4,textTransform:"uppercase"}}>Color</label>
          <div style={{display:"flex",gap:8}}>{AVS.map(cl=>(<div key={cl} onClick={()=>setNewCat({...newCat,color:cl})} style={{width:32,height:32,borderRadius:6,background:cl,cursor:"pointer",border:newCat.color===cl?"2px solid #fff":"2px solid transparent"}}/>))}</div></div>
        <div style={{display:"flex",gap:10,marginTop:8}}><Btn onClick={addCat} disabled={saving} C={c} style={{flex:1,justifyContent:"center"}}>{saving?"Creating...":"Create"}</Btn>
          <Btn variant="ghost" C={c} onClick={()=>setShowNewCat(false)} style={{flex:1,justifyContent:"center"}}>Cancel</Btn></div></div></Modal>}
    {showInvite&&<InviteModal project={project} onClose={()=>setShowInvite(false)} session={session} onUpdate={onUpdate} C={c}/>}
  </div>);
}

// ==================== WELCOME HOME ====================
function WelcomeHome({user,projects,tasks,C:c,setActive,setActiveProject,setShowNewProject,setShowNewTask}){
  const hour=new Date().getHours();
  const greeting=hour<12?"Good morning":hour<17?"Good afternoon":"Good evening";
  const firstName=(user?.full_name||"there").split(" ")[0];
  const todo=tasks.filter(t=>t.status==="todo").length;
  const prog=tasks.filter(t=>t.status==="progress").length;
  const done=tasks.filter(t=>t.status==="done").length;
  const today=new Date().toISOString().split("T")[0];
  const dueToday=tasks.filter(t=>t.deadline===today);
  const overdue=tasks.filter(t=>t.deadline&&t.deadline<today&&t.status!=="done");
  const recentTasks=tasks.slice(0,5);

  const quickActions=[
    {icon:"📁",label:"New Project",desc:"Start something new",action:()=>setShowNewProject(true)},
    {icon:"✏️",label:"New Task",desc:"Add to your backlog",action:()=>{if(projects.length>0)setShowNewTask(true);else setShowNewProject(true);}},
    {icon:"☰",label:"Kanban Board",desc:"View your board",action:()=>setActive("board")},
    {icon:"📅",label:"Calendar",desc:"Check deadlines",action:()=>setActive("calendar")},
  ];

  return(<div>
    {/* Hero Greeting */}
    <div style={{padding:"40px 0 32px"}}>
      <div style={{fontSize:14,color:c.primary,fontWeight:600,marginBottom:8}}>{greeting} 👋</div>
      <h1 style={{fontSize:32,fontWeight:800,margin:"0 0 8px",color:c.textPrimary,letterSpacing:-0.5}}>Welcome back, {firstName}!</h1>
      <p style={{fontSize:15,color:c.textSecondary,margin:0}}>
        {todo+prog>0?`You have ${todo+prog} active task${todo+prog!==1?"s":""} across ${projects.length} project${projects.length!==1?"s":""}.`:"You're all caught up! Time to start something new."}</p>
    </div>

    {/* Alerts */}
    {overdue.length>0&&<div style={{padding:"14px 20px",borderRadius:10,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
      <span style={{fontSize:18}}>⚠️</span><div><span style={{fontSize:13,fontWeight:600,color:c.accentRed}}>{overdue.length} overdue task{overdue.length!==1?"s":""}</span>
        <span style={{fontSize:12,color:c.textMuted,marginLeft:8}}>{overdue.map(t=>t.title).join(", ")}</span></div></div>}
    
    {dueToday.length>0&&<div style={{padding:"14px 20px",borderRadius:10,background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
      <span style={{fontSize:18}}>📌</span><div><span style={{fontSize:13,fontWeight:600,color:c.accentOrange}}>{dueToday.length} task{dueToday.length!==1?"s":""} due today</span>
        <span style={{fontSize:12,color:c.textMuted,marginLeft:8}}>{dueToday.map(t=>t.title).join(", ")}</span></div></div>}

    {/* Stats Row */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:28}}>
      {[{label:"To Do",value:todo,color:c.primary,icon:"📋"},{label:"In Progress",value:prog,color:c.accentOrange,icon:"⚡"},{label:"Completed",value:done,color:c.accent,icon:"✅"},{label:"Projects",value:projects.length,color:"#8b5cf6",icon:"📁"}].map(s=>(
        <div key={s.label} style={{padding:"20px",borderRadius:12,background:c.bgCard,border:`1px solid ${c.border}`,textAlign:"center"}}>
          <div style={{fontSize:24,marginBottom:8}}>{s.icon}</div>
          <div style={{fontSize:28,fontWeight:800,color:s.color,letterSpacing:-1}}>{s.value}</div>
          <div style={{fontSize:12,color:c.textMuted,marginTop:4,fontWeight:500}}>{s.label}</div></div>))}
    </div>

    {/* Quick Actions */}
    <h3 style={{fontSize:14,fontWeight:700,color:c.textSecondary,marginBottom:12,letterSpacing:0.3}}>QUICK ACTIONS</h3>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:28}}>
      {quickActions.map(a=>(
        <div key={a.label} onClick={a.action} style={{padding:"20px 16px",borderRadius:12,background:c.bgCard,border:`1px solid ${c.border}`,cursor:"pointer",textAlign:"center",transition:"all 0.15s"}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=c.primary;e.currentTarget.style.transform="translateY(-2px)";}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=c.border;e.currentTarget.style.transform="translateY(0)";}}>
          <div style={{fontSize:28,marginBottom:8}}>{a.icon}</div>
          <div style={{fontSize:13,fontWeight:700,color:c.textPrimary,marginBottom:4}}>{a.label}</div>
          <div style={{fontSize:11,color:c.textMuted}}>{a.desc}</div></div>))}
    </div>

    <div style={{display:"flex",gap:20}}>
      {/* Recent Tasks */}
      <div style={{flex:1}}>
        <h3 style={{fontSize:14,fontWeight:700,color:c.textSecondary,marginBottom:12,letterSpacing:0.3}}>RECENT TASKS</h3>
        <div style={{background:c.bgCard,borderRadius:12,border:`1px solid ${c.border}`,overflow:"hidden"}}>
          {recentTasks.length===0?<div style={{padding:32,textAlign:"center",color:c.textMuted,fontSize:13}}>No tasks yet. Create your first one!</div>:
          recentTasks.map((t,i)=>(
            <div key={t.id} style={{padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",
              borderBottom:i<recentTasks.length-1?`1px solid ${c.border}`:"none"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:16,height:16,borderRadius:4,border:`2px solid ${t.status==="done"?c.accent:c.border}`,
                  background:t.status==="done"?c.accent:"transparent",display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:9,color:"#fff"}}>{t.status==="done"&&"✓"}</div>
                <div><div style={{fontSize:13,fontWeight:600,color:c.textPrimary,textDecoration:t.status==="done"?"line-through":"none"}}>{t.title}</div>
                  <div style={{fontSize:11,color:c.textMuted}}>{t.project_name}</div></div></div>
              <Badge text={t.priority} color={PRI[t.priority]?.color} bg={PRI[t.priority]?.bg}/></div>))}
        </div>
      </div>

      {/* Your Projects */}
      <div style={{flex:1}}>
        <h3 style={{fontSize:14,fontWeight:700,color:c.textSecondary,marginBottom:12,letterSpacing:0.3}}>YOUR PROJECTS</h3>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {projects.length===0?<div style={{padding:32,textAlign:"center",color:c.textMuted,fontSize:13,background:c.bgCard,borderRadius:12,border:`1px solid ${c.border}`}}>No projects yet!</div>:
          projects.slice(0,5).map(p=>{const pt=tasks.filter(t=>t.project_id===p.id),pd=pt.filter(t=>t.status==="done").length;
            const pct=pt.length>0?Math.round((pd/pt.length)*100):0;
            return(<div key={p.id} onClick={()=>{setActiveProject(p);setActive("project-detail");}} style={{padding:"16px 18px",borderRadius:12,background:c.bgCard,border:`1px solid ${c.border}`,cursor:"pointer",transition:"border-color 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=p.color} onMouseLeave={e=>e.currentTarget.style.borderColor=c.border}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:10,height:10,borderRadius:3,background:p.color}}/><span style={{fontSize:13,fontWeight:700,color:c.textPrimary}}>{p.name}</span></div>
                <span style={{fontSize:12,fontWeight:600,color:p.color}}>{pct}%</span></div>
              <div style={{height:4,borderRadius:2,background:c.bgHover,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,borderRadius:2,background:p.color,transition:"width 0.3s"}}/></div>
            </div>);})}
        </div>
      </div>
    </div>
  </div>);
}

// ==================== CALENDAR ====================
function CalendarView({tasks,C:c}){const[cur,setCur]=useState(new Date());const y=cur.getFullYear(),m=cur.getMonth();const name=cur.toLocaleString("default",{month:"long",year:"numeric"});const first=new Date(y,m,1).getDay(),dim=new Date(y,m+1,0).getDate(),today=new Date();const days=[];for(let i=0;i<first;i++)days.push(null);for(let i=1;i<=dim;i++)days.push(i);const tf=d=>{if(!d)return[];const ds=`${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;return tasks.filter(t=>t.deadline===ds);};const it=d=>d&&today.getFullYear()===y&&today.getMonth()===m&&today.getDate()===d;
  return(<div><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}><Btn variant="ghost" C={c} onClick={()=>setCur(new Date(y,m-1,1))}>← Prev</Btn><h2 style={{margin:0,fontSize:18,fontWeight:700,color:c.textPrimary}}>{name}</h2><Btn variant="ghost" C={c} onClick={()=>setCur(new Date(y,m+1,1))}>Next →</Btn></div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:1,background:c.border,borderRadius:10,overflow:"hidden"}}>{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=><div key={d} style={{padding:"10px 8px",textAlign:"center",fontSize:11,fontWeight:700,color:c.textMuted,background:c.bgCard,textTransform:"uppercase",letterSpacing:0.5}}>{d}</div>)}
      {days.map((day,i)=>{const dt=tf(day);return<div key={i} style={{minHeight:90,padding:8,background:day?c.bgCard:c.bg}}>{day&&<><div style={{fontSize:13,fontWeight:it(day)?800:500,color:it(day)?c.primary:c.textSecondary,marginBottom:6,width:it(day)?24:"auto",height:it(day)?24:"auto",borderRadius:"50%",display:it(day)?"flex":"block",alignItems:"center",justifyContent:"center",background:it(day)?c.primaryMuted:"transparent"}}>{day}</div>{dt.slice(0,2).map(t=><div key={t.id} style={{padding:"2px 6px",borderRadius:3,fontSize:10,fontWeight:600,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",background:PRI[t.priority]?.bg,color:PRI[t.priority]?.color}}>{t.title}</div>)}{dt.length>2&&<div style={{fontSize:10,color:c.textMuted}}>+{dt.length-2}</div>}</>}</div>;})}</div></div>);
}

// ==================== KANBAN ====================
const KanbanCol=({title,count,color,tasks,onDragOver,onDrop,onDragStart,onTaskClick,C:c})=>(
  <div onDragOver={onDragOver} onDrop={onDrop} style={{flex:1,minWidth:260,background:c.bgInput,borderRadius:10,border:`1px solid ${c.border}`,display:"flex",flexDirection:"column"}}>
    <div style={{padding:"14px 18px",borderBottom:`1px solid ${c.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:10,height:10,borderRadius:3,background:color}}/><span style={{fontSize:13,fontWeight:700,color:c.textPrimary,letterSpacing:0.4,textTransform:"uppercase"}}>{title}</span></div><span style={{background:c.bgHover,color:c.textSecondary,fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:10}}>{count}</span></div>
    <div style={{padding:12,display:"flex",flexDirection:"column",gap:10,flex:1,overflowY:"auto"}}>{tasks.map(t=>(
      <div key={t.id} draggable onDragStart={()=>onDragStart(t.id)} onClick={()=>onTaskClick(t)} style={{padding:"14px 16px",borderRadius:8,background:c.bgCard,border:`1px solid ${c.border}`,cursor:"grab",transition:"border-color 0.15s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=c.primary} onMouseLeave={e=>e.currentTarget.style.borderColor=c.border}>
        <div style={{fontSize:13,fontWeight:600,color:c.textPrimary,marginBottom:8,lineHeight:1.4}}>{t.title}</div>
        {t.category_name&&<div style={{fontSize:10,color:c.accentOrange,marginBottom:6,fontWeight:600}}>{t.category_name}</div>}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><Badge text={t.priority} color={PRI[t.priority]?.color} bg={PRI[t.priority]?.bg}/>
          <div style={{display:"flex",alignItems:"center",gap:6}}>{t.deadline&&<span style={{fontSize:11,color:c.textMuted}}>{t.deadline}</span>}
            {t.assignee_name&&t.assignee_id&&<Avatar name={t.assignee_name} color={AVS[t.assignee_name.length%AVS.length]} size={22}/>}</div></div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8}}><span style={{fontSize:11,color:c.textMuted}}>{t.project_name}</span>
          <div style={{display:"flex",gap:8}}>{t.subtask_count>0&&<span style={{fontSize:11,color:c.textMuted}}>☑{t.subtask_done}/{t.subtask_count}</span>}{t.comment_count>0&&<span style={{fontSize:11,color:c.textMuted}}>💬{t.comment_count}</span>}</div></div></div>))}
      {tasks.length===0&&<div style={{padding:20,textAlign:"center",color:c.textMuted,fontSize:13}}>No tasks</div>}</div></div>);

// ==================== LANDING PAGE ====================
function LandingPage({onLogin,loading,error}){
  const[showAuth,setShowAuth]=useState(false);const[isSignup,setIsSignup]=useState(true);
  const[email,setEmail]=useState("");const[pass,setPass]=useState("");const[name,setName]=useState("");
  const c=DARK;

  const features=[
    {icon:"☰",title:"Kanban Board",desc:"Drag and drop tasks across columns. Visualize your workflow at a glance."},
    {icon:"👥",title:"Team Collaboration",desc:"Invite teammates, assign tasks, comment, and work together seamlessly."},
    {icon:"📅",title:"Calendar View",desc:"See deadlines on a monthly calendar. Never miss a due date again."},
    {icon:"📁",title:"Projects & Categories",desc:"Organize work into projects with custom categories and color coding."},
    {icon:"☑️",title:"Subtasks & Checklists",desc:"Break tasks into smaller steps. Track progress with visual progress bars."},
    {icon:"🔍",title:"Search & Filters",desc:"Find any task instantly. Filter by project, priority, or status."},
  ];

  const plans=[
    {name:"Free",price:"$0",period:"/forever",features:["Up to 3 projects","Unlimited tasks","Kanban board","Calendar view","1 team member"],cta:"Get Started",popular:false},
    {name:"Pro",price:"$9",period:"/month",features:["Unlimited projects","Unlimited tasks","Team collaboration","Priority support","File attachments","Time tracking"],cta:"Start Free Trial",popular:true},
    {name:"Business",price:"$25",period:"/month",features:["Everything in Pro","Advanced analytics","Custom branding","API access","Dedicated support","SSO login"],cta:"Contact Sales",popular:false},
  ];

  return(<div style={{minHeight:"100vh",background:c.bg,fontFamily:ff,color:c.textPrimary,overflowX:"hidden"}}>
    {/* Nav */}
    <div style={{padding:"16px 40px",display:"flex",justifyContent:"space-between",alignItems:"center",maxWidth:1200,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:36,height:36,borderRadius:8,background:c.primary,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:800,color:"#fff"}}>T</div>
        <span style={{fontSize:20,fontWeight:700,color:c.textPrimary,letterSpacing:-0.5}}>TaskFlow</span></div>
      <div style={{display:"flex",gap:10}}>
        <button onClick={()=>{setIsSignup(false);setShowAuth(true);}} style={{padding:"9px 20px",borderRadius:6,fontSize:13,fontWeight:600,cursor:"pointer",border:`1px solid ${c.border}`,background:"transparent",color:c.textSecondary,fontFamily:ff}}>Log In</button>
        <button onClick={()=>{setIsSignup(true);setShowAuth(true);}} style={{padding:"9px 20px",borderRadius:6,fontSize:13,fontWeight:600,cursor:"pointer",border:"none",background:c.primary,color:"#fff",fontFamily:ff}}>Sign Up Free</button></div></div>

    {/* Hero */}
    <div style={{textAlign:"center",padding:"80px 40px 60px",maxWidth:800,margin:"0 auto"}}>
      <div style={{display:"inline-block",padding:"6px 16px",borderRadius:20,background:c.primaryMuted,color:c.primary,fontSize:13,fontWeight:600,marginBottom:24}}>✨ Free forever for individuals</div>
      <h1 style={{fontSize:52,fontWeight:800,lineHeight:1.1,margin:"0 0 20px",letterSpacing:-1.5,background:"linear-gradient(135deg, #e8edf5 0%, #8899b4 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
        Manage Projects.<br/>Collaborate with Teams.<br/>Get Things Done.</h1>
      <p style={{fontSize:18,color:c.textSecondary,lineHeight:1.6,margin:"0 0 36px",maxWidth:600,marginLeft:"auto",marginRight:"auto"}}>
        TaskFlow is the simple, powerful project management tool built for freelancers and small teams. Kanban boards, team collaboration, and beautiful design — all in one place.</p>
      <div style={{display:"flex",gap:12,justifyContent:"center"}}>
        <button onClick={()=>{setIsSignup(true);setShowAuth(true);}} style={{padding:"14px 32px",borderRadius:8,fontSize:15,fontWeight:700,cursor:"pointer",border:"none",background:c.primary,color:"#fff",fontFamily:ff,boxShadow:"0 4px 16px rgba(46,124,246,0.3)"}}>Start Free — No Credit Card →</button>
      </div>
    </div>

    {/* App Preview */}
    <div style={{maxWidth:1000,margin:"0 auto 80px",padding:"0 40px"}}>
      <div style={{background:c.bgCard,borderRadius:16,border:`1px solid ${c.border}`,padding:20,boxShadow:"0 24px 64px rgba(0,0,0,0.3)"}}>
        <div style={{display:"flex",gap:4,marginBottom:16}}><div style={{width:10,height:10,borderRadius:"50%",background:"#ef4444"}}/><div style={{width:10,height:10,borderRadius:"50%",background:"#f59e0b"}}/><div style={{width:10,height:10,borderRadius:"50%",background:"#22c55e"}}/></div>
        <div style={{display:"flex",gap:12}}>
          {[{title:"To Do",color:c.primary,items:["Design homepage","Write API docs","Set up CI/CD"]},{title:"In Progress",color:c.accentOrange,items:["Build auth flow","Create dashboard"]},{title:"Done",color:c.accent,items:["Project setup","Brand guidelines"]}].map(col=>(
            <div key={col.title} style={{flex:1,background:c.bgInput,borderRadius:8,padding:12}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:12}}><div style={{width:8,height:8,borderRadius:2,background:col.color}}/><span style={{fontSize:11,fontWeight:700,color:c.textPrimary,textTransform:"uppercase",letterSpacing:0.5}}>{col.title}</span></div>
              {col.items.map(item=><div key={item} style={{padding:"10px 12px",borderRadius:6,background:c.bgCard,border:`1px solid ${c.border}`,marginBottom:6,fontSize:12,color:c.textPrimary,fontWeight:500}}>{item}</div>)}</div>))}
        </div></div></div>

    {/* Features */}
    <div style={{maxWidth:1100,margin:"0 auto 80px",padding:"0 40px"}}>
      <div style={{textAlign:"center",marginBottom:48}}>
        <h2 style={{fontSize:32,fontWeight:800,margin:"0 0 12px",color:c.textPrimary,letterSpacing:-0.5}}>Everything you need to ship faster</h2>
        <p style={{fontSize:16,color:c.textSecondary}}>Powerful features, simple interface. No learning curve.</p></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:16}}>
        {features.map(f=>(
          <div key={f.title} style={{padding:"28px 24px",borderRadius:12,background:c.bgCard,border:`1px solid ${c.border}`,transition:"border-color 0.2s"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor=c.primary} onMouseLeave={e=>e.currentTarget.style.borderColor=c.border}>
            <div style={{fontSize:28,marginBottom:12}}>{f.icon}</div>
            <h3 style={{fontSize:16,fontWeight:700,margin:"0 0 8px",color:c.textPrimary}}>{f.title}</h3>
            <p style={{fontSize:13,color:c.textSecondary,lineHeight:1.6,margin:0}}>{f.desc}</p></div>))}</div></div>

    {/* Pricing */}
    <div style={{maxWidth:1100,margin:"0 auto 80px",padding:"0 40px"}}>
      <div style={{textAlign:"center",marginBottom:48}}>
        <h2 style={{fontSize:32,fontWeight:800,margin:"0 0 12px",color:c.textPrimary,letterSpacing:-0.5}}>Simple, transparent pricing</h2>
        <p style={{fontSize:16,color:c.textSecondary}}>Start free. Upgrade when you need more.</p></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:20}}>
        {plans.map(p=>(
          <div key={p.name} style={{padding:"32px 28px",borderRadius:12,background:c.bgCard,border:p.popular?`2px solid ${c.primary}`:`1px solid ${c.border}`,position:"relative",display:"flex",flexDirection:"column"}}>
            {p.popular&&<div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",padding:"4px 14px",borderRadius:12,background:c.primary,color:"#fff",fontSize:11,fontWeight:700}}>Most Popular</div>}
            <h3 style={{fontSize:18,fontWeight:700,margin:"0 0 4px",color:c.textPrimary}}>{p.name}</h3>
            <div style={{margin:"12px 0 20px"}}><span style={{fontSize:36,fontWeight:800,color:c.textPrimary}}>{p.price}</span><span style={{fontSize:14,color:c.textMuted}}>{p.period}</span></div>
            <div style={{flex:1,marginBottom:24}}>{p.features.map(f=><div key={f} style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <span style={{color:c.accent,fontSize:14}}>✓</span><span style={{fontSize:13,color:c.textSecondary}}>{f}</span></div>)}</div>
            <button onClick={()=>{setIsSignup(true);setShowAuth(true);}} style={{width:"100%",padding:"12px",borderRadius:8,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:ff,border:p.popular?"none":`1px solid ${c.border}`,background:p.popular?c.primary:"transparent",color:p.popular?"#fff":c.textSecondary}}>{p.cta}</button>
          </div>))}</div></div>

    {/* CTA */}
    <div style={{textAlign:"center",padding:"60px 40px 80px",maxWidth:600,margin:"0 auto"}}>
      <h2 style={{fontSize:28,fontWeight:800,margin:"0 0 12px",color:c.textPrimary}}>Ready to get organized?</h2>
      <p style={{fontSize:16,color:c.textSecondary,marginBottom:28}}>Join thousands of freelancers and teams using TaskFlow to ship faster.</p>
      <button onClick={()=>{setIsSignup(true);setShowAuth(true);}} style={{padding:"14px 36px",borderRadius:8,fontSize:15,fontWeight:700,cursor:"pointer",border:"none",background:c.primary,color:"#fff",fontFamily:ff}}>Get Started for Free →</button></div>

    {/* Footer */}
    <div style={{borderTop:`1px solid ${c.border}`,padding:"24px 40px",display:"flex",justifyContent:"space-between",alignItems:"center",maxWidth:1200,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:24,height:24,borderRadius:6,background:c.primary,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:"#fff"}}>T</div><span style={{fontSize:14,fontWeight:600,color:c.textMuted}}>TaskFlow</span></div>
      <span style={{fontSize:12,color:c.textMuted}}>© 2026 TaskFlow. All rights reserved.</span></div>

    {/* Auth Modal */}
    {showAuth&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}} onClick={()=>setShowAuth(false)}>
      <div onClick={e=>e.stopPropagation()} style={{width:420,maxWidth:"90vw",padding:"40px",borderRadius:12,background:c.bgCard,border:`1px solid ${c.border}`,boxShadow:"0 24px 64px rgba(0,0,0,0.5)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><div style={{width:32,height:32,borderRadius:8,background:c.primary,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800,color:"#fff"}}>T</div><span style={{fontSize:20,fontWeight:700,color:c.textPrimary}}>TaskFlow</span></div>
        <p style={{color:c.textSecondary,fontSize:14,marginBottom:28,marginTop:4}}>{isSignup?"Create your free account":"Welcome back"}</p>
        {error&&<div style={{padding:"10px 14px",borderRadius:6,background:"rgba(239,68,68,0.12)",color:c.accentRed,fontSize:13,marginBottom:16}}>{error}</div>}
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {isSignup&&<Inp label="Full Name" C={c} placeholder="John Doe" value={name} onChange={e=>setName(e.target.value)}/>}
          <Inp label="Email" C={c} placeholder="you@company.com" type="email" value={email} onChange={e=>setEmail(e.target.value)}/>
          <Inp label="Password" C={c} placeholder="6+ characters" type="password" value={pass} onChange={e=>setPass(e.target.value)}/>
          <Btn onClick={()=>{if(isSignup)onLogin("signup",email,pass,name);else onLogin("signin",email,pass);}} disabled={loading} C={c} style={{width:"100%",justifyContent:"center",padding:12,fontSize:14,marginTop:4}}>{loading?"Please wait...":isSignup?"Create Free Account →":"Sign In →"}</Btn>
          <div style={{display:"flex",alignItems:"center",gap:12,margin:"4px 0"}}><div style={{flex:1,height:1,background:c.border}}/><span style={{fontSize:12,color:c.textMuted}}>or</span><div style={{flex:1,height:1,background:c.border}}/></div>
          <button onClick={async()=>{await supabase.auth.signInWithOAuth({provider:"google",options:{redirectTo:window.location.origin}});}} style={{width:"100%",padding:"11px",borderRadius:6,fontSize:14,fontWeight:600,cursor:"pointer",border:`1px solid ${c.border}`,background:c.bgHover,color:c.textPrimary,fontFamily:ff,display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google</button></div>
        <p style={{textAlign:"center",marginTop:20,fontSize:13,color:c.textMuted}}>{isSignup?"Already have an account?":"No account?"}{" "}<span onClick={()=>setIsSignup(!isSignup)} style={{color:c.primary,cursor:"pointer",fontWeight:600}}>{isSignup?"Sign in":"Sign up free"}</span></p>
      </div></div>}
  </div>);
}

// ==================== SIDEBAR ====================
function Sidebar({active,setActive,projects,user,onLogout,activeProject,setActiveProject,theme,toggleTheme,pendingCount,C:c,onOpenSettings,teamMembers}){
  const[profileOpen,setProfileOpen]=useState(false);const[teamOpen,setTeamOpen]=useState(true);
  const nav=[{id:"dashboard",icon:"◫",label:"Dashboard"},{id:"board",icon:"☰",label:"Board"},{id:"calendar",icon:"▦",label:"Calendar"},{id:"projects",icon:"◉",label:"Projects"}];
  const menuItems=[
    {icon:"◫",label:"Dashboard",action:()=>{setActive("dashboard");setActiveProject(null);setProfileOpen(false);}},
    {icon:"⚙",label:"Settings",action:()=>{onOpenSettings();setProfileOpen(false);}},
    {icon:theme==="dark"?"☀️":"🌙",label:theme==="dark"?"Light Mode":"Dark Mode",action:()=>{toggleTheme();setProfileOpen(false);}},
    {icon:"↗",label:"Logout",action:()=>{onLogout();setProfileOpen(false);},danger:true},
  ];
  return(<div style={{width:240,background:c.bgCard,borderRight:`1px solid ${c.border}`,display:"flex",flexDirection:"column",flexShrink:0,height:"100vh"}}>
    <div onClick={()=>{setActive("home");setActiveProject(null);}} style={{padding:"20px 20px 16px",display:"flex",alignItems:"center",gap:10,borderBottom:`1px solid ${c.border}`,cursor:"pointer",transition:"background 0.1s"}} onMouseEnter={e=>e.currentTarget.style.background=c.bgHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
      <div style={{width:32,height:32,borderRadius:8,background:c.primary,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800,color:"#fff"}}>T</div>
      <span style={{fontSize:17,fontWeight:700,color:c.textPrimary,letterSpacing:-0.3}}>TaskFlow</span></div>
    <div style={{padding:"16px 12px 8px"}}>
      <p style={{fontSize:10,fontWeight:700,color:c.textMuted,letterSpacing:1,textTransform:"uppercase",padding:"0 8px",marginBottom:6}}>Main Menu</p>
      {nav.map(n=><div key={n.id} onClick={()=>{setActive(n.id);setActiveProject(null);}} style={{padding:"10px 12px",borderRadius:6,display:"flex",alignItems:"center",gap:10,cursor:"pointer",marginBottom:2,background:active===n.id&&!activeProject?c.primaryMuted:"transparent",color:active===n.id&&!activeProject?c.primary:c.textSecondary}}>
        <span style={{fontSize:16,width:20,textAlign:"center"}}>{n.icon}</span><span style={{fontSize:13,fontWeight:active===n.id&&!activeProject?600:500}}>{n.label}</span>
        {n.id==="dashboard"&&pendingCount>0&&<span style={{marginLeft:"auto",background:c.accentRed,color:"#fff",fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:8}}>{pendingCount}</span>}
      </div>)}</div>
    <div style={{padding:"8px 12px",flex:1,overflowY:"auto"}}>
      <p style={{fontSize:10,fontWeight:700,color:c.textMuted,letterSpacing:1,textTransform:"uppercase",padding:"0 8px",marginBottom:6}}>Projects</p>
      {projects.map(p=><div key={p.id} onClick={()=>{setActiveProject(p);setActive("project-detail");}} style={{padding:"8px 12px",borderRadius:6,display:"flex",alignItems:"center",gap:10,cursor:"pointer",marginBottom:2,background:activeProject?.id===p.id?c.primaryMuted:"transparent"}}>
        <div style={{width:8,height:8,borderRadius:2,background:p.color}}/><span style={{fontSize:13,color:activeProject?.id===p.id?c.primary:c.textSecondary,fontWeight:activeProject?.id===p.id?600:400}}>{p.name}</span></div>)}
      {/* Team Members */}
      <div style={{marginTop:12}}>
        <div onClick={()=>setTeamOpen(!teamOpen)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 8px",marginBottom:6,cursor:"pointer"}}>
          <p style={{fontSize:10,fontWeight:700,color:c.textMuted,letterSpacing:1,textTransform:"uppercase",margin:0}}>Team</p>
          <span style={{fontSize:10,color:c.textMuted,transform:teamOpen?"rotate(180deg)":"",transition:"transform 0.2s"}}>▼</span></div>
        {teamOpen&&<div style={{display:"flex",flexDirection:"column",gap:2}}>
          {(teamMembers||[]).map((m,i)=>{const roleColors={owner:"#f59e0b",admin:"#8b5cf6",member:"#2e7cf6",viewer:"#64748b"};
            return(<div key={m.user_id||i} style={{padding:"6px 12px",borderRadius:6,display:"flex",alignItems:"center",gap:8}}>
              <Avatar name={m.full_name||"?"} color={AVS[(m.full_name||"?").length%AVS.length]} size={24}/>
              <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:500,color:c.textPrimary,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.full_name||"User"}{m.user_id===user?.id?" (You)":""}</div></div>
              <div style={{width:6,height:6,borderRadius:"50%",background:roleColors[m.role]||roleColors.member,flexShrink:0}} title={m.role}/></div>);})}
          {(!teamMembers||teamMembers.length===0)&&<div style={{padding:"6px 12px",fontSize:11,color:c.textMuted}}>No team members yet</div>}
        </div>}
      </div>
    </div>
    {/* Profile Section */}
    <div style={{position:"relative",borderTop:`1px solid ${c.border}`}}>
      {profileOpen&&<div style={{position:"absolute",bottom:"100%",left:12,right:12,marginBottom:4,background:c.bgCard,border:`1px solid ${c.border}`,borderRadius:10,boxShadow:"0 8px 32px rgba(0,0,0,0.3)",overflow:"hidden",zIndex:50}}>
        <div style={{padding:"16px 16px 12px",borderBottom:`1px solid ${c.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <Avatar name={user?.full_name||"U"} color={AVS[0]} size={36}/>
            <div><div style={{fontSize:13,fontWeight:700,color:c.textPrimary}}>{user?.full_name||"User"}</div>
              <div style={{fontSize:11,color:c.textMuted}}>{user?.email||""}</div></div></div></div>
        <div style={{padding:"6px"}}>
          {menuItems.map((item,i)=><div key={i} onClick={item.action} style={{padding:"9px 12px",borderRadius:6,display:"flex",alignItems:"center",gap:10,cursor:"pointer",transition:"background 0.1s",color:item.danger?c.accentRed:c.textSecondary}} onMouseEnter={e=>e.currentTarget.style.background=c.bgHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <span style={{fontSize:14,width:20,textAlign:"center"}}>{item.icon}</span>
            <span style={{fontSize:13,fontWeight:500}}>{item.label}</span></div>)}
        </div></div>}
      {profileOpen&&<div style={{position:"fixed",inset:0,zIndex:40}} onClick={()=>setProfileOpen(false)}/>}
      <div onClick={()=>setProfileOpen(!profileOpen)} style={{padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",transition:"background 0.1s"}} onMouseEnter={e=>e.currentTarget.style.background=c.bgHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
        <div style={{display:"flex",alignItems:"center",gap:10}}><Avatar name={user?.full_name||"U"} color={AVS[0]} size={32}/>
          <div><div style={{fontSize:13,fontWeight:600,color:c.textPrimary}}>{user?.full_name||"User"}</div><div style={{fontSize:11,color:c.textMuted}}>Free Plan</div></div></div>
        <span style={{fontSize:12,color:c.textMuted,transform:profileOpen?"rotate(180deg)":"",transition:"transform 0.2s"}}>▲</span></div>
    </div></div>);
}

// ==================== MAIN ====================
export default function App(){
  const[session,setSession]=useState(null);const[user,setUser]=useState(null);const[loading,setLoading]=useState(true);const[authError,setAuthError]=useState("");
  const[active,setActive]=useState("home");const[activeProject,setActiveProject]=useState(null);
  const[projects,setProjects]=useState([]);const[tasks,setTasks]=useState([]);const[categories,setCategories]=useState([]);const[allMembers,setAllMembers]=useState([]);const[memberProfiles,setMemberProfiles]=useState([]);
  const[pendingInvitations,setPendingInvitations]=useState([]);
  const[showNewTask,setShowNewTask]=useState(false);const[showNewProject,setShowNewProject]=useState(false);const[selectedTask,setSelectedTask]=useState(null);const[dragId,setDragId]=useState(null);
  const[newTask,setNewTask]=useState({title:"",project_id:"",priority:"Medium",deadline:"",description:"",category_id:"",assignee_id:""});
  const[newProject,setNewProject]=useState({name:"",color:"#2e7cf6"});const[saving,setSaving]=useState(false);
  const[search,setSearch]=useState("");const[filterProject,setFilterProject]=useState("");const[filterPriority,setFilterPriority]=useState("");
  const[theme,setTheme]=useState("dark");const[showSettings,setShowSettings]=useState(false);
  const c=theme==="dark"?DARK:LIGHT;

  useEffect(()=>{supabase.auth.getSession().then(({data:{session}})=>{setSession(session);if(session?.user)loadProfile(session.user.id);setLoading(false);});
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_e,session)=>{setSession(session);if(session?.user)loadProfile(session.user.id);});return()=>subscription.unsubscribe();},[]);

  const loadProfile=async uid=>{const{data}=await supabase.from("profiles").select("*").eq("id",uid).single();if(data){setUser(data);if(data.theme)setTheme(data.theme);}};

  const toggleTheme=async()=>{const nt=theme==="dark"?"light":"dark";setTheme(nt);if(session)await supabase.from("profiles").update({theme:nt}).eq("id",session.user.id);};

  const loadData=useCallback(async()=>{
    if(!session)return;
    const[{data:p},{data:t},{data:cm},{data:st},{data:cats},{data:mems},{data:profs},{data:inv}]=await Promise.all([
      supabase.from("projects").select("*").order("created_at",{ascending:false}),
      supabase.from("tasks").select("*").order("created_at",{ascending:false}),
      supabase.from("comments").select("task_id"),
      supabase.from("subtasks").select("task_id,completed"),
      supabase.from("categories").select("*").order("created_at",{ascending:true}),
      supabase.from("project_members").select("*"),
      supabase.from("profiles").select("*"),
      supabase.from("invitations").select("*").eq("status","pending"),
    ]);
    const pl=p||[];setProjects(pl);setCategories(cats||[]);setAllMembers(mems||[]);setMemberProfiles(profs||[]);
    const myEmail=user?.email;const myInv=(inv||[]).filter(i=>i.email===myEmail);setPendingInvitations(myInv);
    const cc={};(cm||[]).forEach(x=>{cc[x.task_id]=(cc[x.task_id]||0)+1;});
    const sc={},sd={};(st||[]).forEach(x=>{sc[x.task_id]=(sc[x.task_id]||0)+1;if(x.completed)sd[x.task_id]=(sd[x.task_id]||0)+1;});
    const profMap={};(profs||[]).forEach(pr=>{profMap[pr.id]=pr;});
    setTasks((t||[]).map(task=>({...task,project_name:pl.find(pr=>pr.id===task.project_id)?.name||"Unknown",
      assignee_name:profMap[task.assignee_id]?.full_name||"",comment_count:cc[task.id]||0,subtask_count:sc[task.id]||0,subtask_done:sd[task.id]||0,
      category_name:(cats||[]).find(ct=>ct.id===task.category_id)?.name||""})));
  },[session,user]);

  useEffect(()=>{if(session&&user)loadData();},[session,user,loadData]);

  const handleAuth=async(type,email,password,name)=>{setSaving(true);setAuthError("");try{if(type==="signup"){const{data,error}=await supabase.auth.signUp({email,password,options:{data:{full_name:name}}});if(error){setAuthError(error.message);setSaving(false);return;}if(data.user&&!data.session)setAuthError("Check email to confirm.");}else{const{error}=await supabase.auth.signInWithPassword({email,password});if(error){setAuthError(error.message);setSaving(false);return;}}}catch(e){setAuthError("Network error.");}setSaving(false);};
  const handleLogout=async()=>{await supabase.auth.signOut();setSession(null);setUser(null);setProjects([]);setTasks([]);};

  const addProject=async()=>{if(!newProject.name.trim()||!session)return;setSaving(true);const{data}=await supabase.from("projects").insert({name:newProject.name,color:newProject.color,owner_id:session.user.id}).select();if(data?.[0])await supabase.from("project_members").insert({project_id:data[0].id,user_id:session.user.id,role:"owner"});setNewProject({name:"",color:"#2e7cf6"});setShowNewProject(false);await loadData();setSaving(false);};
  const addTask=async()=>{if(!newTask.title.trim()||!newTask.project_id||!session)return;setSaving(true);await supabase.from("tasks").insert({title:newTask.title,project_id:newTask.project_id,priority:newTask.priority,status:"todo",deadline:newTask.deadline||null,description:newTask.description||"",category_id:newTask.category_id||null,assignee_id:newTask.assignee_id||session.user.id,created_by:session.user.id});setNewTask({title:"",project_id:projects[0]?.id||"",priority:"Medium",deadline:"",description:"",category_id:"",assignee_id:""});setShowNewTask(false);await loadData();setSaving(false);};
  const handleDrop=status=>async e=>{e.preventDefault();if(!dragId)return;await supabase.from("tasks").update({status,updated_at:new Date().toISOString()}).eq("id",dragId);setDragId(null);await loadData();};

  const acceptInvite=async inv=>{await supabase.from("invitations").update({status:"accepted"}).eq("id",inv.id);await supabase.from("project_members").insert({project_id:inv.project_id,user_id:session.user.id,role:"member"});await loadData();};
  const declineInvite=async inv=>{await supabase.from("invitations").update({status:"declined"}).eq("id",inv.id);await loadData();};

  const filtered=tasks.filter(t=>{if(search&&!t.title.toLowerCase().includes(search.toLowerCase()))return false;if(filterProject&&t.project_id!==filterProject)return false;if(filterPriority&&t.priority!==filterPriority)return false;return true;});

  const getMembersForProject=pid=>{const memIds=(allMembers||[]).filter(m=>m.project_id===pid).map(m=>({...m,full_name:(memberProfiles||[]).find(p=>p.id===m.user_id)?.full_name||"User",email:(memberProfiles||[]).find(p=>p.id===m.user_id)?.email||""}));return memIds;};
  const getProfilesForProject=pid=>{const memIds=(allMembers||[]).filter(m=>m.project_id===pid).map(m=>m.user_id);return(memberProfiles||[]).filter(p=>memIds.includes(p.id));};

  if(loading)return(<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:c.bg,fontFamily:ff}}><div style={{textAlign:"center"}}><div style={{width:48,height:48,borderRadius:12,background:c.primary,margin:"0 auto 16px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,fontWeight:800,color:"#fff"}}>T</div><p style={{color:c.textSecondary}}>Loading TaskFlow...</p></div></div>);
  if(!session)return<LandingPage onLogin={handleAuth} loading={saving} error={authError}/>;

  const todo=filtered.filter(t=>t.status==="todo"),prog=filtered.filter(t=>t.status==="progress"),done=filtered.filter(t=>t.status==="done");

  return(<div style={{display:"flex",minHeight:"100vh",background:c.bg,fontFamily:ff,color:c.textPrimary}}>
    <Sidebar active={active} setActive={setActive} projects={projects} user={user} onLogout={handleLogout} activeProject={activeProject} setActiveProject={setActiveProject} theme={theme} toggleTheme={toggleTheme} pendingCount={pendingInvitations.length} C={c} onOpenSettings={()=>setShowSettings(true)} teamMembers={[...new Map((allMembers||[]).map(m=>({...m,full_name:(memberProfiles||[]).find(p=>p.id===m.user_id)?.full_name||"User"})).map(m=>[m.user_id,m])).values()]}/>
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"16px 32px",borderBottom:`1px solid ${c.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>{active==="home"?"Home":active==="dashboard"?"Dashboard":active==="board"?"Kanban Board":active==="calendar"?"Calendar":active==="project-detail"&&activeProject?activeProject.name:"Projects"}</h1>
          <p style={{margin:"2px 0 0",fontSize:13,color:c.textSecondary}}>{active==="home"?"Your workspace at a glance":active==="dashboard"?`${tasks.length} tasks across ${projects.length} projects`:active==="board"?"Drag tasks · Click for details":active==="calendar"?"View by deadline":active==="project-detail"?"Manage team & categories":"Your projects"}</p></div>
        <div style={{display:"flex",gap:10}}>
          {["board","dashboard","calendar","project-detail","home"].includes(active)&&projects.length>0&&<Btn onClick={()=>{setNewTask({...newTask,project_id:activeProject?.id||projects[0]?.id,category_id:"",assignee_id:""});setShowNewTask(true);}} C={c}>+ New Task</Btn>}
          {active==="projects"&&<Btn onClick={()=>setShowNewProject(true)} C={c}>+ New Project</Btn>}
          {projects.length===0&&active!=="projects"&&<Btn onClick={()=>setActive("projects")} C={c}>Create First Project →</Btn>}</div></div>

      <div style={{flex:1,overflow:"auto",padding:"24px 32px"}}>
        <PendingInvitations invitations={pendingInvitations} projects={projects} onAccept={acceptInvite} onDecline={declineInvite} C={c}/>

        {active==="home"&&<WelcomeHome user={user} projects={projects} tasks={tasks} C={c} setActive={setActive} setActiveProject={setActiveProject} setShowNewProject={()=>setShowNewProject(true)} setShowNewTask={()=>{setNewTask({...newTask,project_id:projects[0]?.id||""});setShowNewTask(true);}}/>}

        {projects.length===0&&active!=="projects"&&active!=="home"&&<div style={{textAlign:"center",padding:"80px 0"}}><div style={{fontSize:48,marginBottom:16}}>🚀</div><h2 style={{color:c.textPrimary,marginBottom:8}}>Welcome to TaskFlow!</h2><p style={{color:c.textSecondary,marginBottom:24}}>Create your first project.</p><Btn onClick={()=>setActive("projects")} C={c}>Go to Projects →</Btn></div>}

        {active==="dashboard"&&projects.length>0&&<div>
          <div style={{display:"flex",gap:16,marginBottom:24,flexWrap:"wrap"}}><StatCard label="Total Tasks" value={tasks.length} sub={`${done.length} completed`} color={c.primary} C={c}/><StatCard label="In Progress" value={prog.length} sub="Active" color={c.accentOrange} C={c}/><StatCard label="Completed" value={done.length} sub={tasks.length?`${Math.round((done.length/tasks.length)*100)}%`:"0%"} color={c.accent} C={c}/><StatCard label="Projects" value={projects.length} sub="Active" C={c}/></div>
          <SearchFilterBar search={search} setSearch={setSearch} filterProject={filterProject} setFilterProject={setFilterProject} filterPriority={filterPriority} setFilterPriority={setFilterPriority} projects={projects} C={c}/>
          <div style={{background:c.bgCard,borderRadius:10,border:`1px solid ${c.border}`,overflow:"hidden"}}>{filtered.length===0?<div style={{padding:40,textAlign:"center",color:c.textSecondary}}>No tasks match.</div>:filtered.slice(0,12).map((t,i)=><div key={t.id} onClick={()=>setSelectedTask(t)} style={{padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",borderBottom:i<Math.min(filtered.length,12)-1?`1px solid ${c.border}`:"none"}} onMouseEnter={e=>e.currentTarget.style.background=c.bgHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <div style={{display:"flex",alignItems:"center",gap:14}}><div style={{width:18,height:18,borderRadius:4,border:`2px solid ${t.status==="done"?c.accent:c.border}`,background:t.status==="done"?c.accent:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff"}}>{t.status==="done"&&"✓"}</div>
              <div><div style={{fontSize:13,fontWeight:600,color:c.textPrimary,textDecoration:t.status==="done"?"line-through":"none"}}>{t.title}</div><div style={{fontSize:11,color:c.textMuted,marginTop:2}}>{t.project_name}{t.category_name?` · ${t.category_name}`:""}</div></div></div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>{t.assignee_name&&t.assignee_id&&<Avatar name={t.assignee_name} color={AVS[t.assignee_name.length%AVS.length]} size={22}/>}{t.subtask_count>0&&<span style={{fontSize:11,color:c.textMuted}}>☑{t.subtask_done}/{t.subtask_count}</span>}<Badge text={t.priority} color={PRI[t.priority]?.color} bg={PRI[t.priority]?.bg}/></div></div>)}</div></div>}

        {active==="board"&&projects.length>0&&<div><SearchFilterBar search={search} setSearch={setSearch} filterProject={filterProject} setFilterProject={setFilterProject} filterPriority={filterPriority} setFilterPriority={setFilterPriority} projects={projects} C={c}/>
          <div style={{display:"flex",gap:16,height:"calc(100vh - 220px)"}}><KanbanCol title="To Do" count={todo.length} color={c.primary} tasks={todo} onDragStart={setDragId} onDragOver={e=>e.preventDefault()} onDrop={handleDrop("todo")} onTaskClick={setSelectedTask} C={c}/><KanbanCol title="In Progress" count={prog.length} color={c.accentOrange} tasks={prog} onDragStart={setDragId} onDragOver={e=>e.preventDefault()} onDrop={handleDrop("progress")} onTaskClick={setSelectedTask} C={c}/><KanbanCol title="Done" count={done.length} color={c.accent} tasks={done} onDragStart={setDragId} onDragOver={e=>e.preventDefault()} onDrop={handleDrop("done")} onTaskClick={setSelectedTask} C={c}/></div></div>}

        {active==="calendar"&&projects.length>0&&<CalendarView tasks={filtered} C={c}/>}

        {active==="project-detail"&&activeProject&&<ProjectDetail project={activeProject} tasks={tasks} categories={categories} members={getMembersForProject(activeProject.id)} onBack={()=>{setActiveProject(null);setActive("projects");}} onTaskClick={setSelectedTask} session={session} onUpdate={loadData} C={c}/>}

        {active==="projects"&&!activeProject&&<div>{projects.length===0&&<div style={{textAlign:"center",padding:"60px 0"}}><div style={{fontSize:48,marginBottom:16}}>📂</div><h2 style={{color:c.textPrimary,marginBottom:8}}>No projects yet</h2></div>}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:16}}>{projects.map(p=>{const pt=tasks.filter(t=>t.project_id===p.id),pd=pt.filter(t=>t.status==="done").length,pct=pt.length>0?Math.round((pd/pt.length)*100):0;const pCats=categories.filter(ct=>ct.project_id===p.id);const pMems=getMembersForProject(p.id);
            return<div key={p.id} onClick={()=>{setActiveProject(p);setActive("project-detail");}} style={{padding:24,borderRadius:10,background:c.bgCard,border:`1px solid ${c.border}`,cursor:"pointer",transition:"border-color 0.15s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=p.color} onMouseLeave={e=>e.currentTarget.style.borderColor=c.border}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}><div style={{width:14,height:14,borderRadius:4,background:p.color}}/><h3 style={{margin:0,fontSize:16,fontWeight:700}}>{p.name}</h3></div>
              <div style={{height:6,borderRadius:3,background:c.bgHover,overflow:"hidden",marginBottom:14}}><div style={{height:"100%",width:`${pct}%`,borderRadius:3,background:p.color,transition:"width 0.3s"}}/></div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:c.textSecondary,marginBottom:12}}><span>{pd}/{pt.length} tasks</span><span>{pct}%</span></div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",gap:-4}}>{pMems.slice(0,4).map((m,i)=><Avatar key={i} name={m.full_name||"?"} color={AVS[(m.full_name||"?").length%AVS.length]} size={24}/>)}{pMems.length>4&&<span style={{fontSize:11,color:c.textMuted,marginLeft:4}}>+{pMems.length-4}</span>}</div>
                {pCats.length>0&&<div style={{display:"flex",gap:4}}>{pCats.slice(0,3).map(ct=><span key={ct.id} style={{fontSize:9,padding:"2px 6px",borderRadius:3,background:`${ct.color}20`,color:ct.color,fontWeight:600}}>{ct.name}</span>)}</div>}</div></div>;})}</div></div>}
      </div>
    </div>

    {selectedTask&&<TaskDetail task={selectedTask} onClose={()=>setSelectedTask(null)} session={session} user={user} onUpdate={loadData} categories={categories.filter(ct=>ct.project_id===selectedTask.project_id)} members={getProfilesForProject(selectedTask.project_id)} C={c}/>}

    {showNewTask&&<Modal title="Create New Task" onClose={()=>setShowNewTask(false)} C={c}>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <Inp label="Task Title" C={c} placeholder="e.g. Design login page" value={newTask.title} onChange={e=>setNewTask({...newTask,title:e.target.value})}/>
        <div style={{display:"flex",flexDirection:"column",gap:5}}><label style={{fontSize:12,fontWeight:600,color:c.textSecondary,letterSpacing:0.4,textTransform:"uppercase"}}>Description</label>
          <textarea value={newTask.description} onChange={e=>setNewTask({...newTask,description:e.target.value})} placeholder="Add details..." rows={3} style={{padding:"10px 14px",borderRadius:6,border:`1px solid ${c.border}`,background:c.bgInput,color:c.textPrimary,fontSize:13,outline:"none",fontFamily:ff,resize:"vertical"}}/></div>
        <Sel label="Project" C={c} value={newTask.project_id} onChange={e=>setNewTask({...newTask,project_id:e.target.value,category_id:"",assignee_id:""})}>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</Sel>
        {categories.filter(ct=>ct.project_id===newTask.project_id).length>0&&<Sel label="Category" C={c} value={newTask.category_id} onChange={e=>setNewTask({...newTask,category_id:e.target.value})}><option value="">No category</option>{categories.filter(ct=>ct.project_id===newTask.project_id).map(ct=><option key={ct.id} value={ct.id}>{ct.name}</option>)}</Sel>}
        <Sel label="Assign To" C={c} value={newTask.assignee_id} onChange={e=>setNewTask({...newTask,assignee_id:e.target.value})}><option value="">Assign to me</option>{getProfilesForProject(newTask.project_id).map(m=><option key={m.id} value={m.id}>{m.full_name}{m.id===session.user.id?" (You)":""}</option>)}</Sel>
        <Sel label="Priority" C={c} value={newTask.priority} onChange={e=>setNewTask({...newTask,priority:e.target.value})}><option>High</option><option>Medium</option><option>Low</option></Sel>
        <Inp label="Deadline" C={c} type="date" value={newTask.deadline} onChange={e=>setNewTask({...newTask,deadline:e.target.value})}/>
        <div style={{display:"flex",gap:10,marginTop:8}}><Btn onClick={addTask} disabled={saving} C={c} style={{flex:1,justifyContent:"center"}}>{saving?"Creating...":"Create Task"}</Btn><Btn variant="ghost" C={c} onClick={()=>setShowNewTask(false)} style={{flex:1,justifyContent:"center"}}>Cancel</Btn></div></div></Modal>}

    {showNewProject&&<Modal title="Create New Project" onClose={()=>setShowNewProject(false)} C={c}>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <Inp label="Project Name" C={c} placeholder="e.g. Client Portal" value={newProject.name} onChange={e=>setNewProject({...newProject,name:e.target.value})}/>
        <div style={{display:"flex",flexDirection:"column",gap:5}}><label style={{fontSize:12,fontWeight:600,color:c.textSecondary,letterSpacing:0.4,textTransform:"uppercase"}}>Color</label>
          <div style={{display:"flex",gap:8}}>{AVS.map(cl=><div key={cl} onClick={()=>setNewProject({...newProject,color:cl})} style={{width:32,height:32,borderRadius:6,background:cl,cursor:"pointer",border:newProject.color===cl?"2px solid #fff":"2px solid transparent"}}/>)}</div></div>
        <div style={{display:"flex",gap:10,marginTop:8}}><Btn onClick={addProject} disabled={saving} C={c} style={{flex:1,justifyContent:"center"}}>{saving?"Creating...":"Create Project"}</Btn><Btn variant="ghost" C={c} onClick={()=>setShowNewProject(false)} style={{flex:1,justifyContent:"center"}}>Cancel</Btn></div></div></Modal>}

    {showSettings&&<Modal title="Settings" onClose={()=>setShowSettings(false)} width={500} C={c}>
      <div style={{display:"flex",flexDirection:"column",gap:20}}>
        <div style={{display:"flex",alignItems:"center",gap:14,padding:"16px",borderRadius:10,background:c.bgHover}}>
          <Avatar name={user?.full_name||"U"} color={AVS[0]} size={48}/>
          <div><div style={{fontSize:16,fontWeight:700,color:c.textPrimary}}>{user?.full_name||"User"}</div>
            <div style={{fontSize:13,color:c.textMuted}}>{user?.email||""}</div></div></div>
        <div>
          <label style={{fontSize:12,fontWeight:600,color:c.textSecondary,letterSpacing:0.4,textTransform:"uppercase",display:"block",marginBottom:8}}>Appearance</label>
          <div style={{display:"flex",gap:10}}>
            <div onClick={()=>{setTheme("light");if(session)supabase.from("profiles").update({theme:"light"}).eq("id",session.user.id);}} style={{flex:1,padding:"16px",borderRadius:10,cursor:"pointer",textAlign:"center",border:`2px solid ${theme==="light"?c.primary:c.border}`,background:theme==="light"?c.primaryMuted:"transparent"}}>
              <div style={{fontSize:24,marginBottom:6}}>☀️</div><div style={{fontSize:12,fontWeight:600,color:c.textPrimary}}>Light</div></div>
            <div onClick={()=>{setTheme("dark");if(session)supabase.from("profiles").update({theme:"dark"}).eq("id",session.user.id);}} style={{flex:1,padding:"16px",borderRadius:10,cursor:"pointer",textAlign:"center",border:`2px solid ${theme==="dark"?c.primary:c.border}`,background:theme==="dark"?c.primaryMuted:"transparent"}}>
              <div style={{fontSize:24,marginBottom:6}}>🌙</div><div style={{fontSize:12,fontWeight:600,color:c.textPrimary}}>Dark</div></div></div></div>
        <div>
          <label style={{fontSize:12,fontWeight:600,color:c.textSecondary,letterSpacing:0.4,textTransform:"uppercase",display:"block",marginBottom:8}}>Account</label>
          <div style={{background:c.bgHover,borderRadius:10,overflow:"hidden"}}>
            <div style={{padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${c.border}`}}>
              <span style={{fontSize:13,color:c.textPrimary}}>Plan</span><Badge text="Free" color={c.accent} bg="rgba(34,197,94,0.12)"/></div>
            <div style={{padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${c.border}`}}>
              <span style={{fontSize:13,color:c.textPrimary}}>Projects</span><span style={{fontSize:13,color:c.textSecondary}}>{projects.length}</span></div>
            <div style={{padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:13,color:c.textPrimary}}>Tasks</span><span style={{fontSize:13,color:c.textSecondary}}>{tasks.length}</span></div></div></div>
        <Btn variant="danger" C={c} onClick={()=>{handleLogout();setShowSettings(false);}} style={{width:"100%",justifyContent:"center"}}>Log Out</Btn>
      </div></Modal>}
  </div>);
}
