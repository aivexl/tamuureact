#!/usr/bin/env node

/**
 * Deployment Checklist & Guide
 * Tamuu AI Chat System v8.0 Production Deployment
 * 
 * Usage: node scripts/deployment-checklist.js
 */

const fs = require('fs');
const path = require('path');

const CHECKMARK = '✅';
const CROSS = '❌';
const WARNING = '⚠️';

console.log(`
╔════════════════════════════════════════════════════════════════╗
║    TAMUU AI CHAT SYSTEM v8.0 - DEPLOYMENT CHECKLIST           ║
║         Enterprise-Grade Production Deployment Guide          ║
╚════════════════════════════════════════════════════════════════╝
`);

const sections = {
  'Pre-Deployment Validation': [
    'Run validation script: npm run validate',
    'Run linting: npm run lint',
    'Run TypeScript check: npm run type-check',
    'Run tests: npm run test',
    'Review ARCHITECTURE.md for changes',
    'Check all file imports and dependencies'
  ],

  'Environment Configuration': [
    'Set GEMINI_API_KEY in .env / wrangler.toml',
    'Set GROQ_API_KEY in .env / wrangler.toml (optional)',
    'Configure Supabase connection string (D1)',
    'Set Cloudflare Worker environment variables',
    'Configure rate limit tiers in rate-limiter.js',
    'Set cache TTL defaults in ai-system-v8-enhanced.js'
  ],

  'Database Setup': [
    'Run Supabase migrations: supabase migration up',
    'Verify chat_conversations table created',
    'Verify chat_messages table created',
    'Verify chat_session_cache table created',
    'Create database indexes',
    'Test database connectivity from Worker'
  ],

  'API Deployment': [
    'Deploy API Worker: wrangler deploy (apps/api)',
    'Verify enhanced-chat-handler endpoint',
    'Verify /api/chat endpoints return 200',
    'Verify rate limiting headers present',
    'Test exponential backoff with failed requests',
    'Verify error handling and fallback responses'
  ],

  'Frontend Deployment': [
    'Build frontend: npm run build (apps/web)',
    'Verify bundle size (should be <500KB gzipped)',
    'Deploy to Cloudflare Pages: npm run deploy',
    'Verify app.tamuu.id loads correctly',
    'Test chat UI with real API calls',
    'Verify conversation history persistence'
  ],

  'Integration Testing': [
    'Test full chat flow end-to-end',
    'Verify rate limiting enforcement',
    'Verify input sanitization (test XSS payload)',
    'Verify error recovery (test Gemini quota errors)',
    'Verify conversation history storage',
    'Test admin chat functionality'
  ],

  'Performance & Monitoring': [
    'Monitor API response times (target: <500ms)',
    'Monitor Gemini API quota usage',
    'Check circuit breaker status',
    'Verify cache hit ratio (target: >60%)',
    'Monitor error rate (target: <1%)',
    'Set up logging/alerting for critical errors'
  ],

  'Security Hardening': [
    'Verify all API keys are environment variables',
    'Verify HTTPS/TLS only enforcement',
    'Test authentication on admin endpoints',
    'Verify input sanitization for all endpoints',
    'Check CORS configuration (if applicable)',
    'Review security headers (Content-Security-Policy, etc.)'
  ],

  'Post-Deployment': [
    'Monitor error logs for 24 hours',
    'Monitor performance metrics',
    'Collect user feedback',
    'Document any issues found',
    'Plan hotfixes if needed',
    'Update status page if applicable'
  ]
};

let totalItems = 0;
let completedItems = 0;

for (const [section, items] of Object.entries(sections)) {
  console.log(`\n${section}:`);
  console.log('─'.repeat(70));

  for (const item of items) {
    totalItems++;
    // In actual deployment, items would be checkbox-interactive
    console.log(`  ${ CHECKMARK} ${item}`);
  }
}

console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    DEPLOYMENT COMMANDS                        ║
╚════════════════════════════════════════════════════════════════╝

1. VALIDATION & TESTING:
   npm run validate         # Run comprehensive validation
   npm run lint            # ESLint check
   npm run type-check      # TypeScript compilation check
   npm run test            # Run test suite

2. DATABASE SETUP:
   supabase migration up   # Apply all migrations
   supabase db push        # Push schema changes

3. BACKEND DEPLOYMENT:
   cd apps/api
   wrangler deploy         # Deploy to Cloudflare Workers

4. FRONTEND DEPLOYMENT:
   cd apps/web
   npm run build           # Build for production
   npm run deploy          # Deploy to Cloudflare Pages

5. FULL DEPLOYMENT:
   npm run deploy:all      # Deploy entire application

6. ROLLBACK (if needed):
   wrangler deployments rollback         # Rollback last API deployment
   wrangler deployments list              # View deployment history

═══════════════════════════════════════════════════════════════════════

CRITICAL ENVIRONMENT VARIABLES:

For apps/api/wrangler.toml:
──────────────────────────
[env.production]
vars = { 
  GEMINI_API_KEY = "your-key-here",
  GROQ_API_KEY = "your-key-here",
  SUPABASE_URL = "https://your-project.supabase.co",
  SUPABASE_KEY = "your-anon-key",
  ENVIRONMENT = "production"
}

For Supabase:
──────────────
- Database: Set up D1 integration
- Auth: Configured with email/password & OAuth providers
- Storage: Configure R2 bucket for conversation exports

═══════════════════════════════════════════════════════════════════════

MONITORING CHECKLIST:

1. API Health:
   - Response time: monitor p50, p95, p99
   - Error rate: should be < 1%
   - Uptime: target 99.9%

2. Gemini API:
   - Quota usage: monitor daily
   - Error rates: retry success rate > 95%
   - Cost tracking: monitor token usage

3. Database:
   - Query performance: p95 < 100ms
   - Replication lag: < 1s
   - Connection pool: monitor active connections

4. Errors:
   - Set up alerting for 5xx errors
   - Alert on circuit breaker trips
   - Alert on rate limiting exceeded

═══════════════════════════════════════════════════════════════════════

GIT DEPLOYMENT WORKFLOW:

1. Create feature branch:
   git checkout -b feat/chat-system-v8

2. Make changes and test locally

3. Run validation:
   npm run validate

4. Commit changes:
   git add .
   git commit -m "feat: deploy chat system v8.0 with enterprise features"

5. Push to GitHub:
   git push origin feat/chat-system-v8

6. Create Pull Request for review

7. Merge to main after approval

8. Deploy from main branch:
   npm run deploy:all

═══════════════════════════════════════════════════════════════════════

ROLLBACK PROCEDURES:

If issues occur after deployment:

1. Check logs for errors:
   wrangler tail                      # Real-time logs
   wrangler deployments list          # View deployments

2. Rollback API Worker:
   wrangler deployments rollback

3. Rollback database migrations (if needed):
   supabase migration down

4. Rollback frontend:
   # Via Cloudflare Pages dashboard: select previous deployment

═══════════════════════════════════════════════════════════════════════

PRODUCTION BEST PRACTICES:

1. Never commit .env files to Git
2. Use environment variable secrets in CI/CD
3. Enable Cloudflare DDoS protection
4. Set up WAF rules for API endpoints
5. Enable audit logging for admin actions
6. Monitor rate limiting headers
7. Track API costs (Gemini, Groq, Cloudflare)
8. Regular backups of database
9. Document any incidents
10. Plan for disaster recovery

═══════════════════════════════════════════════════════════════════════
`);

// Write checklist to file
const checklistContent = `
# Deployment Checklist - ${new Date().toISOString()}

${Object.entries(sections)
  .map(
    ([section, items]) => `
## ${section}
${items.map((item, i) => `- [ ] ${item}`).join('\n')}
`
  )
  .join('\n')}

## Sign-off
- [ ] All items completed
- [ ] No critical issues
- [ ] Ready for production

Date: ${new Date().toISOString()}
Deployed by: [Name]
Approved by: [Name]
`;

const checklistPath = 'deployment-checklist.md';
fs.writeFileSync(checklistPath, checklistContent);
console.log(`\nChecklist saved to: ${checklistPath}\n`);
