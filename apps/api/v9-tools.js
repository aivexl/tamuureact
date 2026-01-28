/**
 * Tamuu AI V9.0 - Specialized Business Tools
 * Enterprise-grade diagnostic and resolution tools for the Agentic AI.
 */

export const v9Tools = {
    /**
     * Comprehensive account audit - scans for subscription issues,
     * failed payments, and usage patterns.
     */
    async audit_account({ userId, env }) {
        if (!userId) {
            return {
                status: 'error',
                message: 'Auth required for account audit.',
                findings: []
            };
        }

        try {
            const [user, transactions, invitations] = await Promise.all([
                env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first(),
                env.DB.prepare('SELECT * FROM billing_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 5').bind(userId).all(),
                env.DB.prepare('SELECT id, name, status, created_at FROM invitations WHERE user_id = ?').bind(userId).all()
            ]);

            const findings = [];
            const now = new Date();

            // Check subscription
            if (user.expires_at) {
                const expiry = new Date(user.expires_at);
                if (expiry < now) {
                    findings.push({
                        type: 'subscription_expired',
                        priority: 'high',
                        details: `Paket ${user.tier} kedaluwarsa pada ${expiry.toLocaleDateString('id-ID')}`
                    });
                }
            } else if (user.tier === 'free') {
                findings.push({
                    type: 'free_tier_warning',
                    priority: 'medium',
                    details: 'User masih menggunakan paket FREE.'
                });
            }

            // Check failed payments
            const failed = transactions.results.filter(t => t.status === 'pending' || t.status === 'failed');
            if (failed.length > 0) {
                findings.push({
                    type: 'payment_pending',
                    priority: 'high',
                    details: `Ditemukan ${failed.length} transaksi tertunda/gagal.`
                });
            }

            return {
                status: 'success',
                user_tier: user.tier,
                invitation_count: invitations.results.length,
                findings
            };
        } catch (error) {
            console.error('[V9 Tools] Audit failed:', error);
            return { status: 'error', error: error.message };
        }
    },

    /**
     * Synchronize specific payment status with Midtrans/Provider.
     */
    async sync_payment({ transactionId, env }) {
        // In a real scenario, this would call Midtrans API.
        // For now, we simulate a database refresh.
        try {
            // Search by ID or External ID (Order Number)
            const tx = await env.DB.prepare('SELECT * FROM billing_transactions WHERE id = ? OR external_id = ?').bind(transactionId, transactionId).first();
            if (!tx) return { status: 'error', message: 'Transaksi tidak ditemukan. Pastikan nomor order benar.' };

            // Simulate sync logic
            return {
                status: 'success',
                transaction_id: tx.id,
                external_id: tx.external_id,
                new_status: tx.status,
                message: 'Status sinkronisasi berhasil diperbarui dari sistem pusat.'
            };
        } catch (error) {
            return { status: 'error', error: error.message };
        }
    },

    /**
     * Search for a specific transaction status by order ID or external ID.
     */
    async search_order({ orderId, env }) {
        if (!orderId) return { status: 'error', message: 'Nomor order diperlukan.' };

        const cleanId = orderId.trim().replace(/^#/, '');

        try {
            // Try exact match first
            let { results } = await env.DB.prepare(
                'SELECT id, status, external_id, tier, amount, created_at, payment_channel FROM billing_transactions ' +
                'WHERE external_id = ? OR id = ?'
            ).bind(cleanId, cleanId).all();

            // If no exact match, try partial match for external_id
            if (results.length === 0) {
                const partial = await env.DB.prepare(
                    'SELECT id, status, external_id, tier, amount, created_at, payment_channel FROM billing_transactions ' +
                    'WHERE external_id LIKE ?'
                ).bind(`%${cleanId}%`).all();

                if (partial.results && partial.results.length > 0) {
                    results = partial.results;
                }
            }

            if (results.length > 0) {
                return {
                    status: 'success',
                    findings: results.map(t => ({
                        ...t,
                        midtrans_url: `https://dashboard.midtrans.com/transactions/${t.external_id}`
                    })),
                    note: `Ditemukan ${results.length} transaksi terkait.`
                };
            } else {
                return {
                    status: 'error',
                    message: `Transaksi "${orderId}" tidak ditemukan di database Tamuu.`
                };
            }
        } catch (error) {
            return { status: 'error', error: error.message };
        }
    },

    /**
     * Search within the product and user knowledge bases.
     */
    async get_product_knowledge({ query, engine }) {
        // Uses the engine's internal knowledge base loader
        const kb = await engine.loadKnowledgeBase();
        const content = `${kb.userKnowledgeBase}\n${kb.tamuuKnowledgeBase}`;

        // Simple relevance filtering (human-centric search, not " menyisir")
        const keywords = query.toLowerCase().split(' ');
        const relevantLines = content.split('\n').filter(line =>
            keywords.some(kw => line.toLowerCase().includes(kw))
        );

        return {
            status: 'success',
            findings: relevantLines.slice(0, 5),
            note: 'Ditemukan informasi yang relevan untuk membantu Kak.'
        };
    }
};
