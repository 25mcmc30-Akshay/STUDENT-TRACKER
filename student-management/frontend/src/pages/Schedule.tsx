import { useEffect, useState } from 'react';
import api from '../api';

export default function Schedule() {
    const [events, setEvents] = useState<any[]>([]);
    useEffect(() => { api.get('/schedule').then(res => setEvents(res.data)); }, []);
    return (<div><h2>Schedule (Classes & Exams)</h2><table className="schedule-table"><thead><tr><th>Type</th><th>Title</th><th>Date</th><th>Time</th><th>Location</th></tr></thead><tbody>{events.map(e=><tr key={e.id}><td>{e.event_type==='class'?'📖':'📝'} {e.event_type}</td><td>{e.title}</td><td>{e.date}</td><td>{e.time}</td><td>{e.location}</td></tr>)}</tbody></table></div>);
}