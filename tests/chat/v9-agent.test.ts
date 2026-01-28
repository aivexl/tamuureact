/**
 * Tamuu AI V9.0 - Agentic Integration Tests
 * Verifies native tool calling, agentic loops, and human-centric persona.
 */

import { describe, it, expect, vi } from 'vitest';
import { TamuuAIEngine } from '../../apps/api/ai-system-v8-enhanced.js';
import { v9Tools } from '../../apps/api/v9-tools.js';

describe('AI V9.0 Agentic System', () => {
    const mockEnv = {
        GEMINI_API_KEY: 'test-key',
        DB: {
            prepare: vi.fn().mockReturnThis(),
            bind: vi.fn().mockReturnThis(),
            first: vi.fn().mockResolvedValue({ id: 'user_123', tier: 'free', healthScore: 90 }),
            all: vi.fn().mockResolvedValue({ results: [] })
        }
    };

    it('should define correct V9 tool schemas', () => {
        const engine = new TamuuAIEngine(mockEnv);
        const tools = engine.getEnhancedTools();

        expect(tools).toContainEqual(expect.objectContaining({ name: 'audit_account' }));
        expect(tools).toContainEqual(expect.objectContaining({ name: 'sync_payment' }));
        expect(tools).toContainEqual(expect.objectContaining({ name: 'search_order' }));
        expect(tools).toContainEqual(expect.objectContaining({ name: 'get_product_knowledge' }));
    });

    it('should generate human-centric system prompt with dots', async () => {
        const engine = new TamuuAIEngine(mockEnv);
        const prompt = await engine.generateIndonesianSystemPrompt();

        expect(prompt).toContain('Tamuu Assistant');
        expect(prompt).toContain('•'); // Dot bullet points
        expect(prompt).not.toContain('menyisir data');
    });

    it('should handle tool execution in v9Tools', async () => {
        const result = await v9Tools.audit_account({ userId: 'user_123', env: mockEnv });
        expect(result.status).toBe('success');
        expect(result.user_tier).toBe('free');
    });

    it('should implement the agentic chat loop structure (Mocked)', async () => {
        const engine = new TamuuAIEngine(mockEnv);

        // Mock generateGeminiResponse to simulate a tool call then a final response
        const mockGenerate = vi.spyOn(engine, 'generateGeminiResponse');

        mockGenerate
            .mockResolvedValueOnce({
                toolCalls: [{ functionCall: { name: 'audit_account', args: { reason: 'test' } } }],
                metadata: { provider: 'gemini-agent' }
            })
            .mockResolvedValueOnce({
                content: 'Halo Kak! Akun Kak masih dalam kondisi prima. Ada lagi yang bisa saya bantu? 😊',
                metadata: { provider: 'gemini-2.0-flash' }
            });

        const response = await engine.chat([{ role: 'user', content: 'Cek akun saya' }], { userProfile: { id: 'user_123' } }, mockEnv);

        expect(response.content).toContain('kondisi prima');
        expect(mockGenerate).toHaveBeenCalledTimes(2);
    });

    it('should correctly execute search_order tool', async () => {
        const mockTx = { id: 'tx_123', status: 'paid', external_id: 'order-123', tier: 'pro', amount: 99000 };
        mockEnv.DB.all.mockResolvedValueOnce({ results: [mockTx] });

        const result = await v9Tools.search_order({ orderId: 'order-123', env: mockEnv });

        expect(result.status).toBe('success');
        expect(result.findings[0].external_id).toBe('order-123');
        expect(result.findings[0].status).toBe('paid');
    });

    it('should correctly execute sync_payment with external_id', async () => {
        const mockTx = { id: 'tx_123', status: 'paid', external_id: 'order-123' };
        mockEnv.DB.first.mockResolvedValueOnce(mockTx);

        const result = await v9Tools.sync_payment({ transactionId: 'order-123', env: mockEnv });

        expect(result.status).toBe('success');
        expect(result.external_id).toBe('order-123');
        expect(result.new_status).toBe('paid');
    });

    it('should report "not found" correctly without hallucination', async () => {
        const engine = new TamuuAIEngine(mockEnv);
        const mockGenerate = vi.spyOn(engine, 'generateGeminiResponse');

        mockGenerate
            .mockResolvedValueOnce({
                toolCalls: [{ functionCall: { name: 'search_order', args: { orderId: 'wrong-id' } } }],
                metadata: { provider: 'gemini-agent' }
            })
            .mockResolvedValueOnce({
                content: 'Mohon maaf Kak, saya sudah memeriksa database dan pesanan tersebut tidak ditemukan.',
                metadata: { provider: 'gemini-2.0-flash' }
            });

        const response = await engine.chat([{ role: 'user', content: 'Cek order wrong-id' }], { userProfile: { id: 'user_123' } }, mockEnv);

        expect(response.content).toContain('tidak ditemukan');
        expect(response.content).not.toContain('SUCCESS');
        expect(mockGenerate).toHaveBeenCalledTimes(2);
    });
});
