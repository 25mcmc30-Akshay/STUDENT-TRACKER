import { useEffect, useState } from 'react';
import api from '../api';

export default function Alerts() {
    const [alerts, setAlerts] = useState<any[]>([]);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    useEffect(() => { api.get('/alerts').then(res => { setAlerts(res.data.alerts); setSuggestions(res.data.suggestions); }); }, []);
    return (<div><h1>Alerts & Suggestions</h1>
    <br></br>

    <h2>⚠️ Alerts</h2><br></br>
    {alerts.length===0?
    <p><strong>No alerts. Great job!</strong></p>:alerts.map((a,i)=><div key={i} className={`alert-card ${a.type}`}>{a.message}</div>)}
    
    <br></br><br></br><h2>💡 Suggestions</h2>
    {suggestions.map((s,i)=><div key={i} className="suggestion-card">{s.message}</div>)}</div>);
}