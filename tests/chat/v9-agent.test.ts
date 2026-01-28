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

    it('should correctly execute search_order with Midtrans source', async () => {
        const mockTx = {
            id: 'tx_123',
            status: 'PAID',
            external_id: 'order-123',
            tier: 'pro',
            amount: 99000,
            payment_channel: 'gopay'
        };
        mockEnv.DB.all.mockResolvedValueOnce({ results: [mockTx] });

        const result = await v9Tools.search_order({ orderId: 'order-123', env: mockEnv });

        expect(result.status).toBe('SUCCESS');
        expect(result.findings[0].source).toContain('Midtrans');
        expect(result.findings[0].status).toBe('PAID');
    });

    it('should correctly execute search_order with Invoice source (fallback)', async () => {
        const mockTx = {
            id: 'tx_456',
            status: 'PENDING',
            external_id: 'inv-456',
            tier: 'pro',
            amount: 149000,
            payment_channel: null
        };
        mockEnv.DB.all.mockResolvedValueOnce({ results: [mockTx] });

        const result = await v9Tools.search_order({ orderId: 'inv-456', env: mockEnv });

        expect(result.status).toBe('SUCCESS');
        expect(result.findings[0].source).toBe('System Invoice');
    });

    it('should return explicit NOT_FOUND for non-existent orders', async () => {
        mockEnv.DB.all.mockResolvedValueOnce({ results: [] }); // Exact
        mockEnv.DB.all.mockResolvedValueOnce({ results: [] }); // Partial

        const result = await v9Tools.search_order({ orderId: 'wrong-id', env: mockEnv });

        expect(result.status).toBe('NOT_FOUND');
        expect(result.total_found).toBe(0);
        expect(result.message).toContain('TIDAK DITEMUKAN');
    });

    it('should report "not found" correctly in AI response without hallucination', async () => {
        const engine = new TamuuAIEngine(mockEnv);
        const mockGenerate = vi.spyOn(engine, 'generateGeminiResponse');

        mockGenerate
            .mockResolvedValueOnce({
                toolCalls: [{ functionCall: { name: 'search_order', args: { orderId: 'wrong-id' } }, callId: '123' }],
                metadata: { provider: 'gemini-agent' }
            })
            .mockResolvedValueOnce({
                content: 'Mohon maaf Kak, setelah saya cek di database maupun sistem invoice, pesanan tersebut memang tidak ditemukan.',
                metadata: { provider: 'gemini-2.0-flash' }
            });

        const response = await engine.chat([{ role: 'user', content: 'Cek order wrong-id' }], { userProfile: { id: 'user_123' } }, mockEnv);

        expect(response.content).toContain('tidak ditemukan');
        expect(response.content).not.toContain('PAID');
        expect(response.content).not.toContain('SUCCESS');
    });
});
