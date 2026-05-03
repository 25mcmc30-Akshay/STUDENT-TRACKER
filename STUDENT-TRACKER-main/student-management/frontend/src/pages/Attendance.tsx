import { useEffect, useState } from 'react';
import api from '../api';

export default function Attendance() {
    const [attendance, setAttendance] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [newAtt, setNewAtt] = useState({ 
        subject: '', 
        attended: '', 
        total: '', 
        semester: '' 
    });

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            const res = await api.get('/attendance');
            console.log('Fetched attendance:', res.data);
            setAttendance(res.data);
            setError('');
        } catch (err: any) {
            console.error('Error fetching attendance:', err);
            setError('Failed to load attendance data');
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => { fetchAttendance(); }, []);

    const calculatePercentage = (attended: number, total: number) => {
        if (total === 0) return 0;
        return Number(((attended / total) * 100).toFixed(1));
    };

    const addAttendance = async () => {
        // Validate inputs
        if (!newAtt.subject.trim()) {
            alert('Please enter subject name');
            return;
        }
        if (!newAtt.attended) {
            alert('Please enter attended classes');
            return;
        }
        if (!newAtt.total) {
            alert('Please enter total classes');
            return;
        }
        if (!newAtt.semester.trim()) {
            alert('Please enter semester');
            return;
        }
        
        const attendedNum = parseInt(newAtt.attended);
        const totalNum = parseInt(newAtt.total);
        
        if (isNaN(attendedNum) || isNaN(totalNum)) {
            alert('Please enter valid numbers');
            return;
        }
        
        if (attendedNum > totalNum) {
            alert('Attended classes cannot be more than total classes');
            return;
        }
        
        const percentage = calculatePercentage(attendedNum, totalNum);
        
        const attendanceData = {
            subject: newAtt.subject,
            attended: attendedNum,
            total: totalNum,
            percentage: percentage,
            semester: newAtt.semester
        };
        
        console.log('Sending attendance data:', attendanceData);
        
        try {
            setLoading(true);
            await api.post('/attendance', attendanceData);
            await fetchAttendance(); // Refresh the list
            // Clear form
            setNewAtt({ subject: '', attended: '', total: '', semester: '' });
            alert('Attendance added successfully!');
        } catch (err: any) {
            console.error('Error adding attendance:', err);
            const errorMsg = err.response?.data?.error || 'Failed to add attendance';
            alert(errorMsg);
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };
    
    const deleteAttendance = async (id: number) => {
        if (confirm('Are you sure you want to delete this attendance record?')) { 
            try {
                setLoading(true);
                await api.delete(`/attendance/${id}`);
                await fetchAttendance();
                alert('Attendance deleted successfully!');
            } catch (err: any) {
                console.error('Error deleting attendance:', err);
                alert('Failed to delete attendance');
            } finally {
                setLoading(false);
            }
        }
    };

    if (loading && attendance.length === 0) {
        return <div>Loading attendance data...</div>;
    }

    return (
        <div>
            <h1>Attendance Management</h1>
            <br></br>
            <br></br>
            {error && <div className="error-message" style={{color: 'red', marginBottom: '20px'}}>{error}</div>}
            
            <div className="add-form">
                <h2>Add New Attendance Record</h2>
                <br></br>
                <input 
                    placeholder="Subject Name" 
                    value={newAtt.subject} 
                    onChange={e => setNewAtt({...newAtt, subject: e.target.value})} 
                />
                <input 
                    type="text" 
                    inputMode="numeric"
                    placeholder="Attended Classes" 
                    value={newAtt.attended} 
                    onChange={e => setNewAtt({...newAtt, attended: e.target.value.replace(/[^0-9]/g, '')})} 
                />
                <input 
                    type="text" 
                    inputMode="numeric"
                    placeholder="Total Classes" 
                    value={newAtt.total} 
                    onChange={e => setNewAtt({...newAtt, total: e.target.value.replace(/[^0-9]/g, '')})} 
                />
                <input 
                    placeholder="Semester" 
                    value={newAtt.semester} 
                    onChange={e => setNewAtt({...newAtt, semester: e.target.value})} 
                />
                <button className="btn-small" onClick={addAttendance} disabled={loading}>
                    {loading ? 'Adding...' : 'Add Attendance'}
                </button>
            </div>
            
            {attendance.length === 0 ? (
                <p>No attendance records found. Add your first attendance record above!</p>
            ) : (
                <table className="attendance-table">
                    <thead>
                        <tr>
                            <th>Subject</th>
                            <th>Attended</th>
                            <th>Total</th>
                            <th>Percentage</th>
                            <th>Semester</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendance.map(a => (
                            <tr key={a.id}>
                                <td>{a.subject}</td>
                                <td>{a.attended}</td>
                                <td>{a.total}</td>
                                <td>{a.percentage}%</td>
                                <td>{a.semester}</td>
                                <td>
                                    {a.percentage >= 75 ? '✅ Good' : 
                                     a.percentage < 75 ? '⚠️ Need Improvement' : '❌ Needs Improvement'}
                                </td>
                                <td>
                                    <button 
                                        className="btn-small btn-delete" 
                                        onClick={() => deleteAttendance(a.id)}
                                        disabled={loading}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}