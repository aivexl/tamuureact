/**
 * Test Script for Tamuu AI System v8.0
 * Enterprise-grade testing for Gemini API integration
 */

import { TamuuAIEngine } from './ai-system-v8-enhanced.js';

// Mock environment for testing
const mockEnv = {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    DB: {
        prepare: () => ({
            bind: () => ({
                all: async () => ({ results: [] }),
                first: async () => null
            })
        })
    },
    CACHE: {
        get: async () => null,
        put: async () => {},
        delete: async () => {}
    },
    STORAGE: {
        get: async () => null,
        put: async () => {},
        delete: async () => {}
    }
};

// Test scenarios
const testScenarios = [
    {
        name: 'Indonesian Greeting',
        messages: [
            { role: 'user', content: 'Halo, saya butuh bantuan' }
        ],
        context: {
            userId: 'test-user-1',
            userProfile: {
                name: 'Budi',
                tier: 'premium',
                persona: 'active_creator'
            }
        }
    },
    {
        name: 'Payment Issue',
        messages: [
            { role: 'user', content: 'Kenapa pembayaran saya gagal?' }
        ],
        context: {
            userId: 'test-user-2',
            predictedIntent: {
                primary: { name: 'payment_issue', confidence: 0.9 }
            }
        }
    },
    {
        name: 'Technical Support',
        messages: [
            { role: 'user', content: 'Website tidak bisa diakses' }
        ],
        context: {
            userId: 'test-user-3',
            predictedIntent: {
                primary: { name: 'technical_support', confidence: 0.8 }
            }
        }
    },
    {
        name: 'Indonesian Cultural Context',
        messages: [
            { role: 'user', content: 'Saya mau bikin undangan pernikahan' }
        ],
        context: {
            userId: 'test-user-4',
            userProfile: {
                name: 'Siti',
                tier: 'free',
                persona: 'new_user'
            }
        }
    }
];

// Test runner
async function runTests() {
    console.log('🚀 Starting Tamuu AI System v8.0 Integration Tests\n');
    
    const aiEngine = new TamuuAIEngine(mockEnv);
    
    let passedTests = 0;
    let failedTests = 0;
    
    for (const scenario of testScenarios) {
        console.log(`📋 Testing: ${scenario.name}`);
        console.log(`Input: "${scenario.messages[0].content}"`);
        
        try {
            const startTime = Date.now();
            const response = await aiEngine.generateGeminiResponse(scenario.messages, scenario.context);
            const responseTime = Date.now() - startTime;
            
            console.log(`✅ Response received in ${responseTime}ms`);
            console.log(`Provider: ${response.metadata.provider}`);
            console.log(`Response: "${response.content}"`);
            
            // Validate Indonesian language
            const hasIndonesianMarkers = response.content.includes('Kak') || 
                                      response.content.includes('mohon') || 
                                      response.content.includes('bantu');
            
            if (hasIndonesianMarkers) {
                console.log('✅ Indonesian language markers detected');
            } else {
                console.log('⚠️  Limited Indonesian language markers');
            }
            
            // Validate response quality
            if (response.content.length > 20 && response.content.length < 500) {
                console.log('✅ Response length appropriate');
            } else {
                console.log('⚠️  Response length may need adjustment');
            }
            
            passedTests++;
            
        } catch (error) {
            console.log(`❌ Test failed: ${error.message}`);
            failedTests++;
        }
        
        console.log('---\n');
    }
    
    console.log('📊 Test Summary:');
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`📈 Success Rate: ${((passedTests / testScenarios.length) * 100).toFixed(1)}%`);
    
    // Test error handling
    console.log('🔍 Testing Error Handling...');
    await testErrorHandling(aiEngine);
}

async function testErrorHandling(aiEngine) {
    const errorScenarios = [
        {
            name: 'Missing API Key',
            setup: () => {
                aiEngine.geminiApiKey = '';
            },
            expected: 'fallback'
        },
        {
            name: 'Invalid API Key',
            setup: () => {
                aiEngine.geminiApiKey = 'invalid-key';
            },
            expected: 'error'
        }
    ];
    
    for (const scenario of errorScenarios) {
        console.log(`Testing: ${scenario.name}`);
        scenario.setup();
        
        try {
            const response = await aiEngine.generateGeminiResponse(
                [{ role: 'user', content: 'Test error handling' }],
                { userId: 'error-test' }
            );
            
            if (response.metadata.fallback || response.metadata.error) {
                console.log(`✅ Error handled gracefully: ${response.metadata.provider}`);
            } else {
                console.log('⚠️  Unexpected response for error scenario');
            }
        } catch (error) {
            console.log(`✅ Error properly thrown: ${error.message}`);
        }
        
        // Reset
        aiEngine.geminiApiKey = mockEnv.GEMINI_API_KEY;
    }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runTests().catch(console.error);
}

export { runTests };