export interface Profile {
    id: string;
    username: string;
    avatar_url?: string;
    bio?: string;
    days_clean: number;
    streak: number;
    created_at: string;
}

export interface Post {
    id: string;
    user_id: string;
    content: string;
    image_url?: string;
    created_at: string;
    likes_count: number;
    comments_count: number;
    user?: Profile; // Joined
}

export interface Comment {
    id: string;
    post_id: string;
    user_id: string;
    content: string;
    created_at: string;
    user?: Profile; // Joined
}

export interface Like {
    id: string;
    post_id: string;
    user_id: string;
    created_at: string;
    user?: Profile; // Joined
}

export interface GameScore {
    id: string;
    user_id: string;
    game_type: 'memory' | 'breathing' | 'zen';
    score?: number;
    duration_seconds?: number;
    created_at: string;
}
