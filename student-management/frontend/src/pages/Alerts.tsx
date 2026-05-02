import { useEffect, useState } from 'react';
import api from '../api';

export default function Alerts() {
    const [alerts, setAlerts] = useState<any[]>([]);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    useEffect(() => { api.get('/alerts').then(res => { setAlerts(res.data.alerts); setSuggestions(res.data.suggestions); }); }, []);
    return (<div><h2>Alerts & Suggestions</h2><h3>⚠️ Alerts</h3>{alerts.length===0?<p>No alerts. Great job!</p>:alerts.map((a,i)=><div key={i} className={`alert-card ${a.type}`}>{a.message}</div>)}<h3>💡 Suggestions</h3>{suggestions.map((s,i)=><div key={i} className="suggestion-card">{s.message}</div>)}</div>);
}