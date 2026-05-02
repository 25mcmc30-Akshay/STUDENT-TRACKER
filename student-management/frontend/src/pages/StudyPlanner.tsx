import { useEffect, useState } from 'react';
import api from '../api';

export default function StudyPlanner() {
    const [plans, setPlans] = useState<any[]>([]);
    const [newPlan, setNewPlan] = useState({ subject: '', study_date: '', start_time: '', end_time: '', topic: '' });
    const fetchPlans = async () => { const res = await api.get('/study-planner'); setPlans(res.data); };
    useEffect(() => { fetchPlans(); }, []);
    const addPlan = async () => { await api.post('/study-planner', newPlan); fetchPlans(); setNewPlan({ subject: '', study_date: '', start_time: '', end_time: '', topic: '' }); };
    const deletePlan = async (id: number) => { if (confirm('Delete?')) { await api.delete(`/study-planner/${id}`); fetchPlans(); } };
    return (<div><h2>Study Planner</h2><div className="add-form"><input placeholder="Subject" value={newPlan.subject} onChange={e=>setNewPlan({...newPlan, subject:e.target.value})} /><input type="date" value={newPlan.study_date} onChange={e=>setNewPlan({...newPlan, study_date:e.target.value})} /><input type="time" value={newPlan.start_time} onChange={e=>setNewPlan({...newPlan, start_time:e.target.value})} /><input type="time" value={newPlan.end_time} onChange={e=>setNewPlan({...newPlan, end_time:e.target.value})} /><input placeholder="Topic" value={newPlan.topic} onChange={e=>setNewPlan({...newPlan, topic:e.target.value})} /><button className="btn-small" onClick={addPlan}>Add</button></div><table className="tasks-table"><thead><tr><th>Subject</th><th>Date</th><th>Time</th><th>Topic</th><th></th></tr></thead><tbody>{plans.map(p=><tr key={p.id}><td>{p.subject}</td><td>{p.study_date}</td><td>{p.start_time}-{p.end_time}</td><td>{p.topic}</td><td><button className="btn-small btn-delete" onClick={()=>deletePlan(p.id)}>Delete</button></td></tr>)}</tbody></table></div>);
}