import prisma from '../lib/prisma';
import Groq from 'groq-sdk';
import { Intention } from '@prisma/client';

const getGroqClient = () => new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// A helper to gather the user's context to feed into the AI
const getUserContextPrompt = async (userId: string) => {
    // 1. Get User Basic Info
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            skills: {
                include: { skill: true }
            }
        }
    });

    if (!user) throw new Error('User not found');

    // 2. Separate Skills into LEARN and TEACH
    const skillsToTeach = user.skills
        .filter(s => s.intention === Intention.TEACH)
        .map(s => s.skill.name)
        .join(', ');

    const skillsToLearn = user.skills
        .filter(s => s.intention === Intention.LEARN)
        .map(s => s.skill.name)
        .join(', ');

    // 3. Get latest 5 activities
    const latestActivities = await prisma.activityLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5
    });

    const activityList = latestActivities.length > 0
        ? latestActivities.map(a => `- ${a.type.replace('_', ' ')} on ${a.createdAt.toISOString().split('T')[0]}`).join('\n')
        : 'No recent activity recorded yet.';

    // Construct the System Prompt Context block
    return `
You are Scuti AI, an intelligent, friendly, and encouraging learning assistant for the Scuti platform. 
The user you are speaking to is named ${user.fullName}.

[User Context]
Skills they want to TEACH: ${skillsToTeach || 'None defined yet'}
Skills they want to LEARN: ${skillsToLearn || 'None defined yet'}

[Recent Activity Log]
${activityList}

**INSTRUCCIÓN CRÍTICA:** Debes responder en Español o en Inglés, dependiendo del idioma con el que el usuario te hable. Si estás iniciando la conversación (saludo), hazlo en Español por defecto.
`;
};

export const generatePersonalizedGreeting = async (userId: string) => {
    const contextPrompt = await getUserContextPrompt(userId);

    const systemPrompt = `
${contextPrompt}

Based on this context, write a very short, engaging, and personalized welcome message (max 3 sentences). 
Highlight something they want to learn or teach, or mention their recent activity to motivate them. Keep it conversational.
`;

    const chatCompletion = await getGroqClient().chat.completions.create({
        messages: [{ role: 'system', content: systemPrompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 150,
    });

    return chatCompletion.choices[0]?.message?.content || "Welcome back to Scuti!";
};

export const chatWithAI = async (userId: string, messages: any[]) => {
    const contextPrompt = await getUserContextPrompt(userId);

    // Ensure the system prompt is always injected at the beginning of the conversation history
    const systemMessage = {
        role: 'system',
        content: `${contextPrompt}\nYour goal is to be helpful and provide personalized learning/teaching advice based on their profile. Be concise.`
    };

    const cleanMessages = messages.map((m: any) => ({
        role: m.role || 'user',
        content: m.content || ''
    }));

    const finalMessages = [systemMessage, ...cleanMessages];

    const chatCompletion = await getGroqClient().chat.completions.create({
        messages: finalMessages,
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 1024,
    });

    return {
        reply: chatCompletion.choices[0]?.message?.content || "I'm having trouble thinking, try again.",
        role: 'assistant'
    };
};
