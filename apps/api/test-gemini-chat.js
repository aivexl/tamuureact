// Test script untuk cek Gemini API dan knowledge base
import { TamuuAIEngine } from './ai-system-v8-enhanced.js';

const env = {
    GEMINI_API_KEY: 'AIzaSyBW_b9GfMlEh31sOF5bMp-skO5Z-tFLJK0'
};

const aiEngine = new TamuuAIEngine(env);

async function testFullChat() {
    console.log('Testing full chat with Gemini API...');
    
    try {
        // Test knowledge base loading
        const knowledgeBase = await aiEngine.loadKnowledgeBase();
        console.log('✓ Knowledge base loaded:', knowledgeBase.packageInfo.length, 'packages');
        
        // Test system prompt generation
        const systemPrompt = await aiEngine.generateIndonesianSystemPrompt();
        console.log('✓ System prompt generated, length:', systemPrompt.length);
        
        // Test Gemini response
        const messages = [{ role: 'user', content: 'Apa beda paket PRO, ULTIMATE & ELITE?' }];
        const context = {
            userProfile: null,
            behavioralInsights: {},
            predictedIntent: { primary: 'package_comparison' },
            systemHealth: { status: 'healthy' }
        };
        
        console.log('Generating Gemini response...');
        const response = await aiEngine.generateGeminiResponse(messages, context);
        console.log('✓ Gemini response received:');
        console.log('Content:', response.content);
        console.log('Metadata:', response.metadata);
        
    } catch (error) {
        console.error('✗ Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

testFullChat();