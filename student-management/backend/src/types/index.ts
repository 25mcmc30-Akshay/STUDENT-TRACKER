export interface User {
    id: number;
    username: string;
    password: string;
    name: string;
    roll_number: string;
    class: string;
    email: string;
}

export interface Mark {
    id: number;
    user_id: number;
    subject: string;
    marks_obtained: number;
    total_marks: number;
    exam_type: string;
}

export interface Attendance {
    id: number;
    user_id: number;
    subject: string;
    percentage: number;
    semester: string;
}

export interface StudyPlanner {
    id: number;
    user_id: number;
    subject: string;
    study_date: string;
    start_time: string;
    end_time: string;
    topic: string;
}

export interface Task {
    id: number;
    user_id: number;
    title: string;
    description: string;
    due_date: string;
    status: 'pending' | 'completed';
}

export interface ScheduleEvent {
    id: number;
    user_id: number;
    event_type: 'class' | 'exam';
    title: string;
    date: string;
    time: string;
    location: string;
}