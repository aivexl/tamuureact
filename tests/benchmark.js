
// Mock DB Environment
class MockDB {
    constructor() {
        this.queryCount = 0;
        this.invitations = [
            { id: 1, name: 'Wedding A', slug: 'wedding-a', status: 'published', user_id: 'user1' },
            { id: 2, name: 'Wedding B', slug: 'wedding-b', status: 'draft', user_id: 'user1' },
            { id: 3, name: 'Wedding C', slug: 'wedding-c', status: 'published', user_id: 'user1' },
            { id: 4, name: 'Wedding D', slug: 'wedding-d', status: 'published', user_id: 'user1' },
            { id: 5, name: 'Wedding E', slug: 'wedding-e', status: 'draft', user_id: 'user1' }
        ];
        this.rsvp_responses = [
            { id: 101, invitation_id: 1 },
            { id: 102, invitation_id: 1 },
            { id: 103, invitation_id: 3 },
            { id: 104, invitation_id: 4 },
            { id: 105, invitation_id: 4 },
            { id: 106, invitation_id: 4 }
        ];
    }

    prepare(sql) {
        this.queryCount++;
        // console.log(`[DB] Preparing: ${sql}`);

        const self = this;
        return {
            bind: (...args) => ({
                all: async () => {
                    if (sql.includes('LEFT JOIN rsvp_responses')) {
                        // Simulate optimized query
                        const results = self.invitations.map(inv => {
                            const count = self.rsvp_responses.filter(r => r.invitation_id === inv.id).length;
                            return {
                                ...inv,
                                rsvp_count: count
                            };
                        });
                        return { results };
                    }
                    if (sql.includes('FROM invitations')) {
                        return { results: self.invitations };
                    }
                    if (sql.includes('FROM billing_transactions')) {
                        return { results: [] };
                    }
                    return { results: [] };
                },
                first: async () => {
                    if (sql.includes('FROM rsvp_responses')) {
                        // Extract invitation_id from args or assume it's there
                        const invId = args[0];
                        const count = self.rsvp_responses.filter(r => r.invitation_id === invId).length;
                        return { total: count };
                    }
                    return null;
                }
            })
        };
    }
}

async function runBenchmark() {
    const canonicalId = 'user1';

    console.log('--- STARTING BENCHMARK ---\n');

    // 1. ORIGINAL IMPLEMENTATION (N+1)
    const envOriginal = { DB: new MockDB() };
    console.time('Original Implementation');

    const { results: invs } = await envOriginal.DB.prepare('SELECT id, name, slug, status FROM invitations WHERE user_id = ?').bind(canonicalId).all();

    let invDetailsOriginal = [];
    for (const inv of invs) {
        const rsvp = await envOriginal.DB.prepare('SELECT COUNT(*) as total FROM rsvp_responses WHERE invitation_id = ?').bind(inv.id).first();
        invDetailsOriginal.push({
            name: inv.name,
            slug: inv.slug,
            url: `https://tamuu.id/${inv.slug}`,
            status: inv.status,
            rsvp_count: rsvp.total
        });
    }
    console.timeEnd('Original Implementation');
    console.log(`Original DB Calls: ${envOriginal.DB.queryCount}`);
    console.log(`Result Count: ${invDetailsOriginal.length}`);
    // console.log(JSON.stringify(invDetailsOriginal, null, 2));


    console.log('\n--------------------------\n');


    // 2. OPTIMIZED IMPLEMENTATION (Single Query)
    const envOptimized = { DB: new MockDB() };
    console.time('Optimized Implementation');

    const { results: invsOptimized } = await envOptimized.DB.prepare(
        `SELECT i.id, i.name, i.slug, i.status, COUNT(r.id) as rsvp_count
         FROM invitations i
         LEFT JOIN rsvp_responses r ON i.id = r.invitation_id
         WHERE i.user_id = ?
         GROUP BY i.id`
    ).bind(canonicalId).all();

    // console.log('DEBUG invsOptimized:', JSON.stringify(invsOptimized));

    let invDetailsOptimized = invsOptimized.map(inv => ({
        name: inv.name,
        slug: inv.slug,
        url: `https://tamuu.id/${inv.slug}`,
        status: inv.status,
        rsvp_count: inv.rsvp_count
    }));

    console.timeEnd('Optimized Implementation');
    console.log(`Optimized DB Calls: ${envOptimized.DB.queryCount}`);
    console.log(`Result Count: ${invDetailsOptimized.length}`);
    // console.log(JSON.stringify(invDetailsOptimized, null, 2));

    // Verification
    if (envOriginal.DB.queryCount <= envOptimized.DB.queryCount) {
        console.error('\n❌ FAIL: No reduction in DB calls.');
        process.exit(1);
    }

    if (JSON.stringify(invDetailsOriginal) !== JSON.stringify(invDetailsOptimized)) {
         console.error('\n❌ FAIL: Results do not match.');
         console.log('Original:', JSON.stringify(invDetailsOriginal));
         console.log('Optimized:', JSON.stringify(invDetailsOptimized));
         process.exit(1);
    }

    console.log('\n✅ SUCCESS: Optimization verified. DB calls reduced from ' + envOriginal.DB.queryCount + ' to ' + envOptimized.DB.queryCount);
}

runBenchmark().catch(console.error);
