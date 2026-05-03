import { useEffect, useState } from 'react';
import api from '../api';

export default function Marks() {
    const [marks, setMarks] = useState<any[]>([]);
    const [averages, setAverages] = useState<any[]>([]);
    const [newMark, setNewMark] = useState({ subject: '', marks_obtained: '', total_marks: '', exam_type: '' });

    const fetchMarks = async () => {
        const res = await api.get('/marks');
        setMarks(res.data.marks);
        setAverages(res.data.averages);
    };

    useEffect(() => { fetchMarks(); }, []);

    const addMark = async () => {
        if (!newMark.subject || !newMark.marks_obtained || !newMark.total_marks || !newMark.exam_type) {
            alert('Please fill all fields');
            return;
        }
        
        const obtained = parseInt(newMark.marks_obtained as string);
        const total = parseInt(newMark.total_marks as string);
        
        // Restriction: Obtained marks should be less than or equal to total marks
        if (obtained > total) {
            alert('Obtained marks cannot be greater than total marks!');
            return;
        }
        
        await api.post('/marks', {
            subject: newMark.subject,
            marks_obtained: obtained,
            total_marks: total,
            exam_type: newMark.exam_type
        });
        
        fetchMarks();
        setNewMark({ subject: '', marks_obtained: '', total_marks: '', exam_type: '' });
    };

    const deleteMark = async (id: number) => {
        if (confirm('Delete?')) {
            await api.delete(`/marks/${id}`);
            fetchMarks();
        }
    };

    return (
        <div>
            <h1>Marks</h1>
            <br></br>
            <div className="add-form">
                <input 
                    placeholder="Subject" 
                    value={newMark.subject} 
                    onChange={e => setNewMark({...newMark, subject: e.target.value})} 
                />
                <input 
                    type="text" 
                    inputMode="numeric" 
                    pattern="[0-9]*"
                    placeholder="Obtained Marks" 
                    value={newMark.marks_obtained} 
                    onChange={e => setNewMark({...newMark, marks_obtained: e.target.value.replace(/[^0-9]/g, '')})} 
                />
                <input 
                    type="text" 
                    inputMode="numeric" 
                    pattern="[0-9]*"
                    placeholder="Total Marks" 
                    value={newMark.total_marks} 
                    onChange={e => setNewMark({...newMark, total_marks: e.target.value.replace(/[^0-9]/g, '')})} 
                />
                <input 
                    placeholder="Exam Type (Midterm, Final)" 
                    value={newMark.exam_type} 
                    onChange={e => setNewMark({...newMark, exam_type: e.target.value})} 
                />
                <button className="btn-small" onClick={addMark}>Add</button>
            </div>
            <table className="marks-table">
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th>Exam</th>
                        <th>Obtained</th>
                        <th>Total</th>
                        <th>%</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {marks.map(m => (
                        <tr key={m.id}>
                            <td>{m.subject}</td>
                            <td>{m.exam_type}</td>
                            <td>{m.marks_obtained}</td>
                            <td>{m.total_marks}</td>
                            <td>{((m.marks_obtained/m.total_marks)*100).toFixed(1)}%</td>
                            <td>
                                <button className="btn-small btn-delete" onClick={() => deleteMark(m.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <br></br>
            <div className="average-card">
                <h3>Subject Averages</h3>
                {averages.map(a => <p key={a.subject}><strong>{a.subject}:</strong> {a.average}%</p>)}
            </div>
        </div>
    );
}