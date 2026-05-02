import { useEffect, useState } from 'react';
import api from '../api';

export default function Marks() {
    const [marks, setMarks] = useState<any[]>([]);
    const [averages, setAverages] = useState<any[]>([]);
    const [newMark, setNewMark] = useState({ subject: '', marks_obtained: 0, total_marks: 0, exam_type: '' });

    const fetchMarks = async () => {
        const res = await api.get('/marks');
        setMarks(res.data.marks);
        setAverages(res.data.averages);
    };

    useEffect(() => { fetchMarks(); }, []);

    const addMark = async () => {
        await api.post('/marks', newMark);
        fetchMarks();
        setNewMark({ subject: '', marks_obtained: 0, total_marks: 0, exam_type: '' });
    };

    const deleteMark = async (id: number) => {
        if (confirm('Delete?')) {
            await api.delete(`/marks/${id}`);
            fetchMarks();
        }
    };

    return (
        <div>
            <h2>Marks</h2>
            <strong>
            <div className="add-form">
                <input placeholder="Subject" value={newMark.subject} onChange={e => setNewMark({...newMark, subject: e.target.value})} />
                <input type="number" placeholder="Obtained" value={newMark.marks_obtained} onChange={e => setNewMark({...newMark, marks_obtained: parseInt(e.target.value)})} />
                <input type="number" placeholder="Total" value={newMark.total_marks} onChange={e => setNewMark({...newMark, total_marks: parseInt(e.target.value)})} />
                <input placeholder="Exam Type" value={newMark.exam_type} onChange={e => setNewMark({...newMark, exam_type: e.target.value})} />
                <button className="btn-small" onClick={addMark}>Add</button>
            </div>
            <table className="marks-table"><thead><tr><th>Subject</th><th>Exam</th><th>Obtained</th><th>Total</th><th>%</th><th></th></tr></thead><tbody>
                {marks.map(m => (
                    <tr key={m.id}>
                        <td>{m.subject}</td><td>{m.exam_type}</td><td>{m.marks_obtained}</td><td>{m.total_marks}</td>
                        <td>{((m.marks_obtained/m.total_marks)*100).toFixed(1)}%</td>
                        <td><button className="btn-small btn-delete" onClick={() => deleteMark(m.id)}>Delete</button></td>
                    </tr>
                ))}
            </tbody></table>
            <div className="average-card"><h3>Subject Averages</h3>{averages.map(a => <p key={a.subject}><strong>{a.subject}:</strong> {a.average}%</p>)}</div>
            </strong>
        </div>
    );
}