import { useEffect, useState } from 'react';
import api from '../api';

export default function Schedule() {
    const [events, setEvents] = useState<any[]>([]);
    const [weeklySchedule, setWeeklySchedule] = useState<any>({
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: []
    });
    const [exams, setExams] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [newEvent, setNewEvent] = useState({
        event_type: 'class',
        title: '',
        date: '',
        time: '',
        location: ''
    });

    const fetchEvents = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await api.get('/schedule');
            console.log('Fetched events:', res.data);
            const allEvents = res.data || [];
            setEvents(allEvents);
            
            // Separate exams for display
            const examEvents = allEvents.filter((e: any) => e.event_type === 'exam');
            setExams(examEvents);
            
            // Initialize weekly schedule
            const weekly: any = {
                Monday: [],
                Tuesday: [],
                Wednesday: [],
                Thursday: [],
                Friday: [],
                Saturday: [],
                Sunday: []
            };
            
            // Organize classes by day of week
            allEvents.forEach((event: any) => {
                if (event.event_type === 'class') {
                    // Get day name from date
                    const date = new Date(event.date);
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                    
                    if (weekly[dayName]) {
                        weekly[dayName].push({
                            id: event.id,
                            title: event.title,
                            time: event.time,
                            location: event.location,
                            source: event.source,
                            date: event.date
                        });
                    }
                }
            });
            
            // Also add study planner weekly recurring classes
            // These are already in events with event_type='class' from study_planner
            
            // Sort times for each day
            Object.keys(weekly).forEach(day => {
                weekly[day].sort((a: any, b: any) => a.time.localeCompare(b.time));
            });
            
            setWeeklySchedule(weekly);
        } catch (error: any) {
            console.error('Error fetching events:', error);
            setError(error.response?.data?.error || 'Failed to load schedule');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const addEvent = async () => {
        if (!newEvent.title || !newEvent.date || !newEvent.time) {
            alert('Please fill all required fields (Title, Date, Time)');
            return;
        }

        try {
            setLoading(true);
            const response = await api.post('/schedule', newEvent);
            if (response.data.success) {
                alert('Event added successfully!');
                setShowForm(false);
                setNewEvent({
                    event_type: 'class',
                    title: '',
                    date: '',
                    time: '',
                    location: ''
                });
                fetchEvents();
            }
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to add event');
        } finally {
            setLoading(false);
        }
    };

    const deleteEvent = async (id: number, source: string) => {
        if (source === 'study_planner') {
            alert('Study planner entries cannot be deleted from here. Please go to Study Planner page.');
            return;
        }
        
        if (confirm('Are you sure you want to delete this event?')) {
            try {
                await api.delete(`/schedule/${id}`);
                alert('Event deleted successfully!');
                fetchEvents();
            } catch (error) {
                alert('Failed to delete event');
            }
        }
    };

    const getSourceBadge = (source: string) => {
        if (source === 'study_planner') {
            return <span style={{ background: '#4CAF50', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>📚 Study Plan</span>;
        }
        return <span style={{ background: '#2196F3', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>📅 Manual</span>;
    };

    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const today = new Date();
    const todayDayName = dayOrder[today.getDay() === 0 ? 6 : today.getDay() - 1];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>📅Schedule</h1><br></br>
                <button 
                    className="btn-primary" 
                    onClick={() => setShowForm(!showForm)}
                    style={{ width: 'auto', padding: '10px 20px' }}
                >
                    {showForm ? 'Cancel' : '+ Add Custom Event'}
                </button>
            </div>

            {error && (
                <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '5px', marginBottom: '20px' }}>
                    Error: {error}
                </div>
            )}

            {/* Add Event Form */}
            {showForm && (
                <div className="add-form" style={{ marginBottom: '20px', background: '#f5f5f5', padding: '20px', borderRadius: '10px' }}>
                    <h3>Add New Event</h3>
                    <select 
                        value={newEvent.event_type} 
                        onChange={e => setNewEvent({...newEvent, event_type: e.target.value})}
                        style={{ margin: '5px', padding: '8px' }}
                    >
                        <option value="class">📖 Class</option>
                        <option value="exam">📝 Exam</option>
                    </select>
                    <input 
                        type="text" 
                        placeholder="Title" 
                        value={newEvent.title} 
                        onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                        style={{ margin: '5px', padding: '8px' }}
                        required
                    />
                    <input 
                        type="date" 
                        value={newEvent.date} 
                        onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                        style={{ margin: '5px', padding: '8px' }}
                        required
                    />
                    <input 
                        type="time" 
                        value={newEvent.time} 
                        onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                        style={{ margin: '5px', padding: '8px' }}
                        required
                    />
                    <input 
                        type="text" 
                        placeholder="Location (optional)" 
                        value={newEvent.location} 
                        onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                        style={{ margin: '5px', padding: '8px' }}
                    />
                    <button className="btn-small" onClick={addEvent} disabled={loading} style={{ margin: '5px', padding: '8px 16px' }}>
                        {loading ? 'Adding...' : 'Add Event'}
                    </button>
                </div>
            )}

            {/* Weekly Timetable - Day-wise Classes */}
            <h2 style={{ marginTop: '20px', color: '#ffffff'}}>📖 Weekly Class Schedule</h2>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '10px', overflow: 'hidden' }}>
                    <thead>
                        <tr style={{ background: '#1976D2', color: 'white' }}>
                            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Day</th>
                            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Subject</th>
                            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dayOrder.map(day => {
                            const classes = weeklySchedule[day] || [];
                            const isToday = day === todayDayName;
                            
                            if (classes.length === 0) {
                                return (
                                    <tr key={day} style={isToday ? { background: '#E3F2FD' } : {}}>
                                        <td style={{ padding: '12px', border: '1px solid #ddd', background: isToday ? '#E3F2FD' : '#f9f9f9', fontWeight: 'bold' }}>
                                            {day} {isToday && <span style={{ fontSize: '11px', color: '#1976D2' }}>(Today)</span>}
                                        </td>
                                        <td colSpan={5} style={{ padding: '12px', border: '1px solid #ddd', color: '#999', textAlign: 'center' }}>No classes scheduled</td>
                                    </tr>
                                );
                            }
                            
                            return classes.map((class_: any, index: number) => (
                                <tr key={`${day}-${index}`} style={isToday ? { background: '#E3F2FD' } : {}}>
                                    {index === 0 && (
                                        <td rowSpan={classes.length} style={{ padding: '12px', border: '1px solid #ddd', background: isToday ? '#E3F2FD' : '#f9f9f9', fontWeight: 'bold', verticalAlign: 'top' }}>
                                            {day} {isToday && <span style={{ fontSize: '11px', color: '#1976D2' }}>(Today)</span>}
                                        </td>
                                    )}
                                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>{class_.title}</td>
                                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>{class_.time}</td>
                                </tr>
                            ));
                        })}
                    </tbody>
                </table>
            </div><br></br>

            {/* Exams Table */}
            <h2 style={{ marginTop: '30px', color: '#ffaa00' }}>📝 Upcoming Exams</h2>
            <table className="schedule-table" style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
                <thead>
                    <tr style={{ background: '#FF9800', color: 'white' }}>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Exam Title</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Time</th>
                    </tr>
                </thead>
                <tbody>
                    {exams.length > 0 ? (
                        exams.map((exam: any) => (
                            <tr key={exam.id}>
                                <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{exam.title}</td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{exam.date}</td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{exam.time}</td>                                
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} style={{ padding: '30px', textAlign: 'center' }}>No exams scheduled</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {loading && <p style={{ textAlign: 'center', marginTop: '20px' }}>Loading...</p>}
        </div>
    );
}