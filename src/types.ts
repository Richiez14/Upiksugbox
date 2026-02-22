export interface Suggestion {
  id: number;
  student_name: string;
  department: string;
  text: string;
  image_url?: string;
  video_url?: string;
  status: 'pending' | 'reviewed' | 'responded';
  admin_response?: string;
  is_public: number;
  created_at: string;
}

export interface Comment {
  id: number;
  suggestion_id: number;
  comment_text: string;
  author_role: 'student' | 'admin';
  created_at: string;
}

export type Department = 'Catering' | 'Welfare' | 'Administration' | 'ICT' | 'Others';
