import { useEffect, useState } from 'react';
import api from '../api';

export default function Tasks() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [newTask, setNewTask] = useState({ title: '', description: '', due_date: '', status: 'pending' });
    const fetchTasks = async () => { const res = await api.get('/tasks'); setTasks(res.data); };
    useEffect(() => { fetchTasks(); }, []);
    const addTask = async () => { await api.post('/tasks', newTask); fetchTasks(); setNewTask({ title: '', description: '', due_date: '', status: 'pending' }); };
    const updateTaskStatus = async (id: number, status: string) => { await api.put(`/tasks/${id}`, { ...tasks.find(t=>t.id===id), status }); fetchTasks(); };
    const deleteTask = async (id: number) => { if (confirm('Delete?')) { await api.delete(`/tasks/${id}`); fetchTasks(); } };
    return (<div><h2>Tasks</h2><div className="add-form"><input placeholder="Title" value={newTask.title} onChange={e=>setNewTask({...newTask, title:e.target.value})} /><input placeholder="Description" value={newTask.description} onChange={e=>setNewTask({...newTask, description:e.target.value})} /><input type="date" value={newTask.due_date} onChange={e=>setNewTask({...newTask, due_date:e.target.value})} /><select value={newTask.status} onChange={e=>setNewTask({...newTask, status:e.target.value})}><option value="pending">Pending</option><option value="completed">Completed</option></select><button className="btn-small" onClick={addTask}>Add</button></div><table className="tasks-table"><thead><tr><th>Title</th><th>Description</th><th>Due Date</th><th>Status</th><th>Actions</th></tr></thead><tbody>{tasks.map(t=><tr key={t.id}><td>{t.title}</td><td>{t.description}</td><td>{t.due_date}</td><td>{t.status}</td><td><button className="btn-small btn-edit" onClick={()=>updateTaskStatus(t.id, t.status==='pending'?'completed':'pending')}>Toggle</button><button className="btn-small btn-delete" onClick={()=>deleteTask(t.id)}>Delete</button></td></tr>)}</tbody></table></div>);
}