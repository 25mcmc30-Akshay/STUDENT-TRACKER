import { useEffect, useState } from 'react';
import api from '../api';

export default function StudyPlanner() {
    const [plans, setPlans] = useState<any[]>([]);
    const [showClassForm, setShowClassForm] = useState(true);
    const [newClass, setNewClass] = useState({ 
        subject: '', 
        day_of_week: 'Monday',
        start_time: '', 
        end_time: ''
    });
    const [newExam, setNewExam] = useState({ 
        subject: '', 
        exam_date: '', 
        start_time: '', 
        end_time: ''
    });
    
    const fetchPlans = async () => { 
        const res = await api.get('/study-planner'); 
        setPlans(res.data); 
    };
    
    useEffect(() => { fetchPlans(); }, []);
    
    const addClass = async () => { 
        if (!newClass.subject || !newClass.start_time || !newClass.end_time) {
            alert('Please fill all required fields');
            return;
        }
        
        // For recurring classes, we'll store with a future date (next occurrence)
        const today = new Date();
        const dayMap: any = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };
        const currentDay = today.getDay();
        const targetDay = dayMap[newClass.day_of_week];
        let daysToAdd = targetDay - currentDay;
        if (daysToAdd <= 0) daysToAdd += 7;
        
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + daysToAdd);
        const study_date = nextDate.toISOString().slice(0, 10);
        
        await api.post('/study-planner', {
            subject: newClass.subject,
            study_date: study_date,
            start_time: newClass.start_time,
            end_time: newClass.end_time,
            topic: `Weekly Class - ${newClass.day_of_week}`
        }); 
        
        fetchPlans(); 
        setNewClass({ subject: '', day_of_week: 'Monday', start_time: '', end_time: '' }); 
        alert('Class added to schedule!');
    };
    
    const addExam = async () => { 
        if (!newExam.subject || !newExam.exam_date || !newExam.start_time || !newExam.end_time) {
            alert('Please fill all required fields');
            return;
        }
        
        await api.post('/study-planner', {
            subject: newExam.subject,
            study_date: newExam.exam_date,
            start_time: newExam.start_time,
            end_time: newExam.end_time,
            topic: 'Exam'
        }); 
        
        fetchPlans(); 
        setNewExam({ subject: '', exam_date: '', start_time: '', end_time: '' }); 
        alert('Exam added to schedule!');
    };
    
    const deletePlan = async (id: number) => { 
        if (confirm('Delete?')) { 
            await api.delete(`/study-planner/${id}`); 
            fetchPlans(); 
        } 
    };
    
    // Format date to show only date (YYYY-MM-DD)
    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        // If date already in YYYY-MM-DD format, just return it
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return dateString;
        }
        // Otherwise try to parse and format
        try {
            const date = new Date(dateString);
            return date.toISOString().slice(0, 10);
        } catch {
            return dateString;
        }
    };
    
    return (
        <div>
            <h1>📚 Study Planner</h1><br></br>
            
            {/* Toggle Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button 
                    onClick={() => setShowClassForm(true)}
                    style={{ 
                        padding: '10px 20px', 
                        background: showClassForm ? '#2196F3' : '#000000',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                   <b> 📖 Add Weekly Class</b>
                </button>
                <button 
                    onClick={() => setShowClassForm(false)}
                    style={{ 
                        padding: '10px 20px', 
                        background: !showClassForm ? '#FF9800' : '#000000',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    <b>📝 Add Exam</b>
                </button>
            </div>
            
            {/* Weekly Class Form */}
            {showClassForm && (
                <div className="add-form" style={{ marginBottom: '20px', background: '#E3F2FD', padding: '20px', borderRadius: '10px' }}>
                    <h3 style={{ color: '#1976D2' }}>📖 Add Weekly Class </h3><br></br>
                    <input 
                        placeholder="Subject Name" 
                        value={newClass.subject} 
                        onChange={e=>setNewClass({...newClass, subject: e.target.value})} 
                    />
                    <select 
                        value={newClass.day_of_week} 
                        onChange={e=>setNewClass({...newClass, day_of_week: e.target.value})}
                        style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
                    >
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                        <option value="Sunday">Sunday</option>
                    </select>
                    <input 
                        type="time" 
                        placeholder="Start Time" 
                        value={newClass.start_time} 
                        onChange={e=>setNewClass({...newClass, start_time: e.target.value})} 
                    />
                    <input 
                        type="time" 
                        placeholder="End Time" 
                        value={newClass.end_time} 
                        onChange={e=>setNewClass({...newClass, end_time: e.target.value})} 
                    />
                    <button className="btn-small" onClick={addClass}>Add Weekly Class</button>
                </div>
            )}
            
            {/* Exam Form */}
            {!showClassForm && (
                <div className="add-form" style={{ marginBottom: '20px', background: '#FFF3E0', padding: '20px', borderRadius: '10px' }}>
                    <h3 style={{ color: '#E65100' }}>📝 Add Exam</h3>
                    <input 
                        placeholder="Subject/Exam Name" 
                        value={newExam.subject} 
                        onChange={e=>setNewExam({...newExam, subject: e.target.value})} 
                    />
                    <input 
                        type="date" 
                        placeholder="Exam Date" 
                        value={newExam.exam_date} 
                        onChange={e=>setNewExam({...newExam, exam_date: e.target.value})} 
                    />
                    <input 
                        type="time" 
                        placeholder="Start Time" 
                        value={newExam.start_time} 
                        onChange={e=>setNewExam({...newExam, start_time: e.target.value})} 
                    />
                    <input 
                        type="time" 
                        placeholder="End Time" 
                        value={newExam.end_time} 
                        onChange={e=>setNewExam({...newExam, end_time: e.target.value})} 
                    />
                    <button className="btn-small" onClick={addExam}>Add Exam</button>
                </div>
            )}
            
            {/* Display all entries */}
            <br></br><h2>📋 Your Schedule</h2>
            <table className="tasks-table">
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th>Date</th> 
                        <th>Time</th>
                        <th>Type</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {plans.map(p=>(
                        <tr key={p.id}>
                            <td>{p.subject}</td>
                            <td>{formatDate(p.study_date)}</td>
                            <td>{p.start_time} - {p.end_time}</td>
                            <td>{p.topic === 'Exam' ? '📝 Exam' : '📖 Weekly Class'}</td>
                            <td>
                                <button className="btn-small btn-delete" onClick={()=>deletePlan(p.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}