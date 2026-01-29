
const { performance } = require('perf_hooks');

// Mock D1 Database
class MockD1 {
    constructor(numInvitations, rsvpsPerInvitation) {
        this.invitations = [];
        this.rsvps = [];

        for (let i = 0; i < numInvitations; i++) {
            const id = `inv-${i}`;
            this.invitations.push({
                id: id,
                name: `Invitation ${i}`,
                slug: `slug-${i}`,
                status: 'published',
                user_id: 'user-1'
            });

            for (let j = 0; j < rsvpsPerInvitation; j++) {
                this.rsvps.push({
                    id: `rsvp-${i}-${j}`,
                    invitation_id: id
                });
            }
        }
    }

    prepare(query) {
        this.currentQuery = query;
        return this;
    }

    bind(...args) {
        this.args = args;
        return this;
    }

    async all() {
        await new Promise(resolve => setTimeout(resolve, 1)); // Simulate network latency

        // Handle Join Query simulation (simplified)
        if (this.currentQuery.includes('JOIN rsvp_responses')) {
             const results = this.invitations.map(inv => {
                const count = this.rsvps.filter(r => r.invitation_id === inv.id).length;
                return {
                    ...inv,
                    rsvp_count: count
                };
            });
            return { results };
        }

        if (this.currentQuery.includes('FROM invitations')) {
            return { results: this.invitations };
        }

        return { results: [] };
    }

    async first() {
        await new Promise(resolve => setTimeout(resolve, 1)); // Simulate network latency

        if (this.currentQuery.includes('SELECT COUNT(*)')) {
            const invId = this.args[0];
            const count = this.rsvps.filter(r => r.invitation_id === invId).length;
            return { total: count };
        }
        return null;
    }
}

async function runBenchmark() {
    const db = new MockD1(50, 20); // 50 invitations, 20 RSVPs each
    const env = { DB: db };
    const canonicalId = 'user-1';

    console.log("Running Benchmark...");

    // 1. Current Implementation (N+1)
    const startLegacy = performance.now();

    const { results: invs } = await env.DB.prepare('SELECT id, name, slug, status FROM invitations WHERE user_id = ?').bind(canonicalId).all();

    let invDetailsLegacy = [];
    for (const inv of invs) {
        const rsvp = await env.DB.prepare('SELECT COUNT(*) as total FROM rsvp_responses WHERE invitation_id = ?').bind(inv.id).first();
        invDetailsLegacy.push({
            name: inv.name,
            slug: inv.slug,
            url: `https://tamuu.id/${inv.slug}`,
            status: inv.status,
            rsvp_count: rsvp.total
        });
    }

    const endLegacy = performance.now();
    console.log(`Legacy Implementation took: ${(endLegacy - startLegacy).toFixed(2)}ms`);

    // 2. Optimized Implementation
    const startOptimized = performance.now();

    // Simulate the optimized query
    // SELECT i.id, i.name, i.slug, i.status, COUNT(r.id) as rsvp_count FROM invitations i LEFT JOIN rsvp_responses r ON i.id = r.invitation_id WHERE i.user_id = ? GROUP BY i.id
    const { results: optimizedInvs } = await env.DB.prepare('SELECT i.id, i.name, i.slug, i.status, COUNT(r.id) as rsvp_count FROM invitations i LEFT JOIN rsvp_responses r ON i.id = r.invitation_id WHERE i.user_id = ? GROUP BY i.id').bind(canonicalId).all();

    let invDetailsOptimized = optimizedInvs.map(inv => ({
        name: inv.name,
        slug: inv.slug,
        url: `https://tamuu.id/${inv.slug}`,
        status: inv.status,
        rsvp_count: inv.rsvp_count
    }));

    const endOptimized = performance.now();
    console.log(`Optimized Implementation took: ${(endOptimized - startOptimized).toFixed(2)}ms`);

    // Verification
    console.log(`Legacy Count: ${invDetailsLegacy.length}, Optimized Count: ${invDetailsOptimized.length}`);
    if (invDetailsLegacy.length > 0 && invDetailsLegacy[0].rsvp_count === invDetailsOptimized[0].rsvp_count) {
        console.log("Verification Passed: Counts match.");
    } else {
        console.log("Verification Failed!");
    }
}

runBenchmark();
