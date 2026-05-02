import { useEffect, useState } from 'react';
import api from '../api';

export default function Attendance() {
    const [attendance, setAttendance] = useState<any[]>([]);
    const [newAtt, setNewAtt] = useState({ subject: '', percentage: 0, semester: '' });

    const fetchAttendance = async () => {
        const res = await api.get('/attendance');
        setAttendance(res.data);
    };
    useEffect(() => { fetchAttendance(); }, []);

    const addAttendance = async () => {
        await api.post('/attendance', newAtt);
        fetchAttendance();
        setNewAtt({ subject: '', percentage: 0, semester: '' });
    };
    const deleteAttendance = async (id: number) => {
        if (confirm('Delete?')) { await api.delete(`/attendance/${id}`); fetchAttendance(); }
    };

    return (
        <div>
            <h2>Attendance</h2>
            <strong><div className="add-form">
                <input placeholder="Subject" value={newAtt.subject} onChange={e => setNewAtt({...newAtt, subject: e.target.value})} />
                <input type="number" step="0.1" placeholder="Percentage" value={newAtt.percentage} onChange={e => setNewAtt({...newAtt, percentage: parseFloat(e.target.value)})} />
                <input placeholder="Semester" value={newAtt.semester} onChange={e => setNewAtt({...newAtt, semester: e.target.value})} />
                <button className="btn-small" onClick={addAttendance}>Add</button>
            </div>
            <table className="attendance-table"><thead><tr><th>Subject</th><th>%</th><th>Semester</th><th>Status</th><th></th></tr></thead><tbody>
                {attendance.map(a => (
                    <tr key={a.id}>
                        <td>{a.subject}</td><td>{a.percentage}%</td><td>{a.semester}</td>
                        <td>{a.percentage >= 75 ? '✅ Good' : '⚠️ Needs Improvement'}</td>
                        <td><button className="btn-small btn-delete" onClick={() => deleteAttendance(a.id)}>Delete</button></td>
                    </tr>
                ))}
            </tbody></table>
            </strong>
        </div>
    );
}