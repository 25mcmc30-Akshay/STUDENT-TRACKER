import { useEffect, useState } from 'react';
import api from '../api';

export default function Profile() {
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        api.get('/profile').then(res => setProfile(res.data));
    }, []);

    if (!profile) return <div>Loading...</div>;

    return (
        <div className="profile-card">
            <h2>Academic Profile</h2>
            <p><strong>Name:</strong> {profile.name}</p>
            <p><strong>Username:</strong> {profile.username}</p>
            <p><strong>Roll Number:</strong> {profile.roll_number}</p>
            <p><strong>Class:</strong> {profile.class}</p>
            <p><strong>Email:</strong> {profile.email}</p>
        </div>
    );
}