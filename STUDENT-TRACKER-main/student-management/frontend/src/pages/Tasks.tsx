import { useEffect, useState } from 'react';
import api from '../api';

export default function Tasks() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [newTask, setNewTask] = useState({ title: '', description: '', due_date: '', status: 'pending' });
    const [loading, setLoading] = useState(false);
    
    const fetchTasks = async () => { 
        try {
            setLoading(true);
            const res = await api.get('/tasks'); 
            console.log('Fetched tasks:', res.data);
            setTasks(res.data || []); 
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => { fetchTasks(); }, []);
    
    const addTask = async () => { 
        if (!newTask.title) {
            alert('Please enter task title');
            return;
        }
        if (!newTask.due_date) {
            alert('Please select due date');
            return;
        }
        
        try {
            setLoading(true);
            await api.post('/tasks', { 
                title: newTask.title, 
                description: newTask.description, 
                due_date: newTask.due_date, 
                status: 'pending' 
            }); 
            fetchTasks(); 
            setNewTask({ title: '', description: '', due_date: '', status: 'pending' }); 
            alert('Task added successfully!');
        } catch (error) {
            console.error('Error adding task:', error);
            alert('Failed to add task');
        } finally {
            setLoading(false);
        }
    };
    
    const completeTask = async (id: number) => { 
        try {
            setLoading(true);
            console.log('Completing task:', id);
            await api.put(`/tasks/${id}`, { status: 'completed' }); 
            fetchTasks(); 
            alert('Task completed!');
        } catch (error) {
            console.error('Error completing task:', error);
            alert('Failed to complete task');
        } finally {
            setLoading(false);
        }
    };
    
    const deleteTask = async (id: number) => { 
        if (confirm('Delete this task?')) { 
            try {
                setLoading(true);
                await api.delete(`/tasks/${id}`); 
                fetchTasks(); 
                alert('Task deleted!');
            } catch (error) {
                console.error('Error deleting task:', error);
                alert('Failed to delete task');
            } finally {
                setLoading(false);
            }
        } 
    };
    
    // Separate pending and completed tasks
    const pendingTasks = tasks.filter(t => t.status === 'pending');
    const completedTasks = tasks.filter(t => t.status === 'completed');
    
    return (
        <div>
            <h1>📝 Tasks</h1><br></br>
            
            {/* Add Task Form */}
            <div className="add-form">
                <input 
                    type="text"
                    placeholder="Task Title" 
                    value={newTask.title} 
                    onChange={e=>setNewTask({...newTask, title: e.target.value})} 
                />
                <input 
                    type="text"
                    placeholder="Description (optional)" 
                    value={newTask.description} 
                    onChange={e=>setNewTask({...newTask, description: e.target.value})} 
                />
                <input 
                    type="date" 
                    value={newTask.due_date} 
                    onChange={e=>setNewTask({...newTask, due_date: e.target.value})} 
                />
                <button className="btn-small" onClick={addTask} disabled={loading}>
                    {loading ? 'Adding...' : '+ Add Task'}
                </button>
            </div>
            
            {/* Pending Tasks Table */}
            <h2 style={{ marginTop: '20px', color: '#FF9800' }}>⏳ Pending Tasks</h2>
            <table className="tasks-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Due Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {pendingTasks.length > 0 ? (
                        pendingTasks.map(t => (
                            <tr key={t.id}>
                                <td><strong>{t.title}</strong></td>
                                <td>{t.description || '-'}</td>
                                <td>{t.due_date}</td>
                                <td>
                                    <button 
                                        className="btn-small complete-btn" 
                                        onClick={() => completeTask(t.id)}
                                        disabled={loading}
                                        style={{ background: '#4CAF50', color: 'white', marginRight: '5px' }}
                                    >
                                        ✓ Complete
                                    </button>
                                    <button 
                                        className="btn-small btn-delete" 
                                        onClick={() => deleteTask(t.id)}
                                        disabled={loading}
                                    >
                                        Delete
                                    </button>
                                </td>
                             </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4} style={{ textAlign: 'center' }}>No pending tasks 🎉</td>
                        </tr>
                    )}
                </tbody>
            </table>
            
            {/* Completed Tasks Table */}
            {completedTasks.length > 0 && (
                <>
                    <h2 style={{ marginTop: '20px', color: '#00ff04' }}>✓ Completed Tasks</h2>
                    <table className="tasks-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Description</th>
                                <th>Due Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {completedTasks.map(t => (
                                <tr key={t.id} style={{ textDecoration: 'line-through', color: '#999', background: '#f5f5f5' }}>
                                    <td style={{ textDecoration: 'line-through' }}>{t.title}</td>
                                    <td style={{ textDecoration: 'line-through' }}>{t.description || '-'}</td>
                                    <td style={{ textDecoration: 'line-through' }}>{t.due_date}</td>
                                    <td>
                                        <span style={{ color: '#4CAF50', marginRight: '10px' }}>✓ Completed</span>
                                        <button 
                                            className="btn-small btn-delete" 
                                            onClick={() => deleteTask(t.id)}
                                            disabled={loading}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                 </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
}