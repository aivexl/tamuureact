// Test script untuk cek knowledge base loading
import { TamuuAIEngine } from './ai-system-v8-enhanced.js';

const env = {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'dummy-key-for-testing'
};

const aiEngine = new TamuuAIEngine(env);

async function testKnowledgeBase() {
    console.log('Testing knowledge base loading...');
    
    try {
        const knowledgeBase = await aiEngine.loadKnowledgeBase();
        console.log('Knowledge base loaded successfully:');
        console.log('- User KB length:', knowledgeBase.userKnowledgeBase.length);
        console.log('- Tamuu KB length:', knowledgeBase.tamuuKnowledgeBase.length);
        console.log('- Package info:', JSON.stringify(knowledgeBase.packageInfo, null, 2));
        
        // Test system prompt generation
        const systemPrompt = await aiEngine.generateIndonesianSystemPrompt();
        console.log('\nSystem prompt generated successfully:');
        console.log('Length:', systemPrompt.length);
        console.log('First 200 chars:', systemPrompt.substring(0, 200));
        
    } catch (error) {
        console.error('Error loading knowledge base:', error);
        console.error('Stack:', error.stack);
    }
}

testKnowledgeBase();