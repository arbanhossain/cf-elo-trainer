
import { Problem } from '../types';

// This is a mock implementation. In a real app, you would initialize the Gemini client:
// import { GoogleGenAI } from "@google/genai";
// const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const mockHints: { [key: string]: string } = {
    "C. Interesting Sequence": "Think about bitwise operations. What does `a & b` tell you about the numbers `a` and `b`? The condition `(x & y) + (x | y) = x + y` is always true for any non-negative integers x and y.",
    "B. A and B": "This is a simple greedy problem. The distance between A and B is `abs(a - b)`. Each move can decrease this distance by at most 10. How many moves of size 10 do you need? What about the remainder?",
    "A. Two Substrings": "You need to find non-overlapping occurrences of 'AB' and 'BA'. Scan the string once to find all indices of 'AB' and 'BA'. Then check if there's an 'AB' that appears before a 'BA' with enough space in between, or vice-versa.",
    "B. Sort the Array": "If the array can be sorted by reversing one subsegment, it means the array consists of an increasing part, a decreasing part, and another increasing part. Find the start and end of the single non-increasing segment. Reverse it and check if the whole array is sorted.",
};

export const getHint = async (problem: Problem): Promise<string> => {
    console.log(`Getting hint for ${problem.name}`);
    // In a real application, you would make an API call to Gemini here.
    // const prompt = `You are a helpful programming contest coach. Give a subtle hint for the Codeforces problem titled "${problem.name}" with a rating of ${problem.rating}. The problem tags are [${problem.tags.join(', ')}]. Do not give away the solution. Focus on the core concept or a key observation needed to solve it in one or two sentences.`;
    
    // const response = await ai.models.generateContent({
    //   model: 'gemini-2.5-flash',
    //   contents: prompt,
    // });
    // return response.text;

    await new Promise(resolve => setTimeout(resolve, 700)); // Simulate network delay

    return mockHints[problem.name] || "Try to think about the constraints of the problem. Sometimes a brute-force approach with some optimization is enough. Consider the properties of the data structures involved.";
};
