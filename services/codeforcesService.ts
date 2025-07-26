
import { User, Problem, Attempt, AttemptStatus } from '../types';

const USER_STORAGE_KEY = 'cf_elo_user';
const HISTORY_STORAGE_KEY = 'cf_elo_history';

// In-memory cache for the problemset to avoid repeated API calls.
let problemsCache: Problem[] | null = null;

/**
 * Fetches and caches the entire problem set from the Codeforces API.
 * This function is called automatically by `getRecommendations` on the first run.
 * @returns A promise that resolves to an array of Problems.
 * @throws Will throw an error if the API call or data processing fails.
 */
export const getProblemset = async (): Promise<Problem[]> => {
    if (problemsCache) {
        return problemsCache;
    }
    
    // Throws error on failure, to be caught by the calling hook
    const response = await fetch('https://codeforces.com/api/problemset.problems');
    if (!response.ok) {
        throw new Error(`Codeforces API request failed with status ${response.status}`);
    }
    const data = await response.json();
    if (data.status !== 'OK') {
        throw new Error(`Codeforces API returned an error: ${data.comment || 'Unknown error'}`);
    }

    const allProblems: Problem[] = data.result.problems
        .filter((p: any) => p.rating !== undefined) // Only include problems with a rating
        .map((p: any) => ({
            id: `${p.contestId}${p.index}`,
            name: p.name,
            rating: p.rating,
            tags: p.tags,
            link: `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`,
        }));

    problemsCache = allProblems;
    console.log(`Cached ${problemsCache.length} problems from Codeforces.`);
    return problemsCache;
};


const simulateDelay = <T,>(data: T): Promise<T> => new Promise(resolve => setTimeout(() => resolve(data), 300));

export const getCFUserInfo = async (handle: string): Promise<Partial<User>> => {
    const response = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
    if (!response.ok) throw new Error('Failed to fetch user info from Codeforces');
    const data = await response.json();
    if (data.status !== 'OK') throw new Error(data.comment);
    const cfUser = data.result[0];
    return { currentElo: cfUser.rating, username: cfUser.handle };
};

export const getCFUserSubmissions = async (handle: string): Promise<Attempt[]> => {
    const response = await fetch(`https://codeforces.com/api/user.status?handle=${handle}`);
    if (!response.ok) throw new Error('Failed to fetch user submissions from Codeforces');
    const data = await response.json();
    if (data.status !== 'OK') throw new Error(data.comment);
    
    const allProblems = await getProblemset();
    const problemMap = new Map(allProblems.map(p => [`${p.id.slice(0, -1)}-${p.id.slice(-1)}`, p]));

    const attempts: Attempt[] = data.result
        .filter((sub: any) => sub.verdict === 'OK')
        .map((sub: any): Attempt | null => {
            const problem = problemMap.get(`${sub.problem.contestId}-${sub.problem.index}`);
            if (!problem) return null;
            return {
                id: sub.id,
                problem,
                userId: 0, // Belongs to the CF user
                attemptsCount: sub.passedTestCount, // Not accurate, but best guess
                status: AttemptStatus.SOLVED,
                eloChange: 0, // Not tracked for CF history
                completedAt: new Date(sub.creationTimeSeconds * 1000),
                eloAfter: 0, // Not tracked for CF history
            };
        })
        .filter((a: Attempt | null): a is Attempt => a !== null);
        
    return attempts;
};

export const getInitialUser = async (): Promise<User> => {
    const savedUserStr = localStorage.getItem(USER_STORAGE_KEY);
    let user: User;
    if (savedUserStr) {
        user = JSON.parse(savedUserStr);
    } else {
        user = { id: 1, username: 'Gamer123', currentElo: 1500 };
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    }

    if (user.cfHandle) {
        try {
            const cfData = await getCFUserInfo(user.cfHandle);
            user = { ...user, ...cfData };
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        } catch (e) {
            console.error("Failed to sync Codeforces user data:", e);
            // Proceed with local data if API fails
        }
    }
    return simulateDelay(user);
};

export const getInitialHistory = async (): Promise<Attempt[]> => {
    const savedHistoryStr = localStorage.getItem(HISTORY_STORAGE_KEY);
    let localHistory: Attempt[] = savedHistoryStr ? JSON.parse(savedHistoryStr).map((a: any) => ({ ...a, completedAt: new Date(a.completedAt) })) : [];
    
    const userStr = localStorage.getItem(USER_STORAGE_KEY);
    if (userStr) {
        const user: User = JSON.parse(userStr);
        if (user.cfHandle) {
            try {
                const cfHistory = await getCFUserSubmissions(user.cfHandle);
                const localHistoryIds = new Set(localHistory.map(h => h.id));
                const merged = [...localHistory, ...cfHistory.filter(h => !localHistoryIds.has(h.id))];
                localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(merged));
                return simulateDelay(merged);
            } catch (e) {
                console.error("Failed to sync Codeforces history:", e);
            }
        }
    }
    return simulateDelay(localHistory);
};

export const getRecommendations = async (userElo: number, preferredTags: string[] = []): Promise<Problem[]> => {
    const allProblems = await getProblemset();
    
    const lowerBound = userElo - 200;
    const upperBound = userElo + 200;

    let candidates = allProblems.filter(p => p.rating >= lowerBound && p.rating <= upperBound);

    let taggedCandidates: Problem[] = [];
    if (preferredTags.length > 0) {
        taggedCandidates = candidates.filter(p => preferredTags.some(tag => p.tags.includes(tag)));
    }

    const recommendations: Problem[] = [];
    
    const fillFrom = (source: Problem[], count: number, isTagged: boolean) => {
        const shuffled = source.sort(() => 0.5 - Math.random());
        const available = shuffled.filter(p => !recommendations.some(r => r.id === p.id));
        const toAdd = available.slice(0, count);
        if (!isTagged) {
            toAdd.forEach(p => p.isOutOfCategory = true);
        }
        recommendations.push(...toAdd);
    };

    // Prioritize tagged problems
    fillFrom(taggedCandidates, 5, true);

    // If not enough tagged problems, fill with untagged
    if (recommendations.length < 5) {
        fillFrom(candidates, 5 - recommendations.length, false);
    }

    // Ensure balance
    const above = recommendations.filter(p => p.rating > userElo);
    const below = recommendations.filter(p => p.rating <= userElo);

    if (above.length < 2) {
        const needed = 2 - above.length;
        const source = taggedCandidates.length > 0 ? taggedCandidates : candidates;
        fillFrom(source.filter(p => p.rating > userElo), needed, taggedCandidates.length > 0);
    }
    if (below.length < 2) {
        const needed = 2 - below.length;
        const source = taggedCandidates.length > 0 ? taggedCandidates : candidates;
        fillFrom(source.filter(p => p.rating <= userElo), needed, taggedCandidates.length > 0);
    }

    return recommendations.slice(0, 5).sort(() => 0.5 - Math.random());
};

const calculateEloChange = (userElo: number, problemRating: number, attemptsCount: number, isSuccessful: boolean): number => {
    const K = 30;
    const expectedScore = 1 / (1 + Math.pow(10, (problemRating - userElo) / 400));
    
    if (!isSuccessful) {
        // Standard ELO loss for failure (S_actual = 0)
        return K * (0 - expectedScore);
    }
    
    // is_successful is only true if attempts_count <= 5
    if (attemptsCount > 5) return K * (0 - expectedScore); 

    const baseEloGain = K * (1 - expectedScore);

    let multiplier = 0.6; // Default/Cap for 5 attempts
    if (attemptsCount === 1) multiplier = 1.2;
    else if (attemptsCount === 2) multiplier = 1.0;
    else if (attemptsCount === 3) multiplier = 0.8;
    else if (attemptsCount === 4) multiplier = 0.7;

    return baseEloGain * multiplier;
};

export const submitAttempt = async (
    user: User,
    problem: Problem,
    attemptsCount: number,
    isSuccessful: boolean
): Promise<{ updatedUser: User, newAttempt: Attempt }> => {
    if (user.cfHandle) {
        throw new Error("Cannot manually submit attempts for a linked Codeforces account.");
    }

    const eloChange = calculateEloChange(user.currentElo, problem.rating, attemptsCount, isSuccessful);
    const newElo = Math.round(user.currentElo + eloChange);

    const updatedUser: User = { ...user, currentElo: newElo };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));

    const currentHistory = await getInitialHistory();
    const newAttempt: Attempt = {
        id: (currentHistory.length > 0 ? Math.max(...currentHistory.map(a => a.id)) : 0) + 1,
        problem,
        userId: user.id,
        attemptsCount,
        status: isSuccessful ? AttemptStatus.SOLVED : AttemptStatus.FAILED,
        eloChange,
        completedAt: new Date(),
        eloAfter: newElo,
    };
    
    const updatedHistory = [...currentHistory, newAttempt];
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));

    return simulateDelay({ updatedUser, newAttempt });
};

export const updateUser = async (username: string, cfHandle: string, elo?: number): Promise<User> => {
    const userStr = localStorage.getItem(USER_STORAGE_KEY);
    let user: User = userStr ? JSON.parse(userStr) : { id: 1, username: 'Gamer123', currentElo: 1500 };
    
    user.username = username;
    
    if (cfHandle) {
        const cfData = await getCFUserInfo(cfHandle);
        user = { ...user, cfHandle, ...cfData };
    } else {
        delete user.cfHandle;
        if (elo !== undefined) {
            user.currentElo = elo;
        }
    }
    
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    return simulateDelay(user);
};

export const resetProgress = (): Promise<void> => {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(HISTORY_STORAGE_KEY);
    return simulateDelay(undefined);
};
