
export interface User {
    id: number;
    username: string;
    currentElo: number;
    cfHandle?: string;
}

export interface Problem {
  id: string; // e.g., "1700A"
  name: string;
  rating: number;
  tags: string[];
  link: string;
  isOutOfCategory?: boolean;
}

export enum AttemptStatus {
  SOLVED = 'SOLVED',
  FAILED = 'FAILED',
}

export interface Attempt {
  id: number;
  problem: Problem;
  userId: number;
  attemptsCount: number;
  status: AttemptStatus;
  eloChange: number;
  completedAt: Date;
  eloAfter: number;
}
