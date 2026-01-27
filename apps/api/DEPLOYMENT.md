# Tamuu AI System v8.0 - Deployment Guide

## Prerequisites

- Node.js 18+ installed
- Wrangler CLI installed: `npm install -g wrangler`
- Cloudflare account with Workers enabled
- Access to Cloudflare dashboard for configuration

## Environment Setup

### 1. Install Dependencies
```bash
cd apps/api
npm install
```

### 2. Configure Environment Variables

**IMPORTANT: NEVER commit actual API keys to repository**

#### Development Environment
```bash
# Set up development secrets
wrangler secret put GEMINI_API_KEY --env development
wrangler secret put DATABASE_URL --env development
wrangler secret put JWT_SECRET --env development
wrangler secret put ENCRYPTION_KEY --env development
```

#### Production Environment
```bash
# Set up production secrets
wrangler secret put GEMINI_API_KEY --env production
wrangler secret put DATABASE_URL --env production
wrangler secret put JWT_SECRET --env production
wrangler secret put ENCRYPTION_KEY --env production
```

### 3. Configure Cloudflare Resources

#### Create KV Namespaces
```bash
wrangler kv:namespace create "CACHE" --env production
wrangler kv:namespace create "CACHE" --env development
wrangler kv:namespace create "CACHE" --env staging
```

#### Create D1 Database
```bash
wrangler d1 create tamuu-db
```

#### Create R2 Bucket
```bash
wrangler r2 bucket create tamuu-storage
```

## Deployment Commands

### Development Deployment
```bash
# Deploy to development environment
wrangler deploy --env development

# Watch for changes and auto-deploy
wrangler dev --env development
```

### Production Deployment
```bash
# Deploy to production environment
wrangler deploy --env production

# Verify deployment
wrangler tail --env production
```

### Staging Deployment
```bash
# Deploy to staging environment
wrangler deploy --env staging
```

## Security Verification

### Pre-deployment Security Checklist
- [ ] All API keys stored in environment variables
- [ ] No hardcoded secrets in source code
- [ ] HTTPS enabled for all communications
- [ ] Proper CORS configuration
- [ ] Rate limiting implemented
- [ ] Input validation in place
- [ ] Error messages don't expose sensitive data

### Post-deployment Verification
```bash
# Test API endpoints
curl https://tamuu-api-prod.your-subdomain.workers.dev/health

# Check logs for errors
wrangler tail --env production

# Monitor performance
wrangler analytics --env production
```

## Rollback Procedures

### Quick Rollback
```bash
# Rollback to previous version
wrangler rollback --env production
```

### Emergency Rollback
```bash
# Immediate rollback with specific version
wrangler rollback --env production --version-id VERSION_ID
```

## Monitoring and Maintenance

### Daily Monitoring
- Check error rates in Cloudflare dashboard
- Monitor API response times
- Review security logs for anomalies
- Check quota usage for external services

### Weekly Maintenance
- Review performance metrics
- Update dependencies if needed
- Check for security advisories
- Backup configuration

### Monthly Security Review
- Rotate API keys
- Review access logs
- Update security policies
- Conduct security audit

## Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Verify key is set correctly: `wrangler secret list --env production`
   - Check key validity in Gemini console
   - Ensure proper permissions

2. **Deployment Failures**
   - Check wrangler logs: `wrangler tail --env production`
   - Verify all secrets are set
   - Check resource limits

3. **Performance Issues**
   - Monitor Cloudflare analytics
   - Check cache hit rates
   - Review database query performance

### Support Contacts
- Technical Team: tech@tamuu.id
- Security Team: security@tamuu.id
- On-call Engineer: +62-xxx-xxxx-xxxx

## Security Incident Response

### Immediate Actions
1. Identify and isolate affected systems
2. Document incident details
3. Notify security team
4. Implement temporary fixes
5. Conduct post-mortem analysis

### Communication Plan
- Internal team notification
- Customer communication if needed
- Stakeholder updates
- Public disclosure if required

## Compliance and Auditing

### Regular Security Audits
- Monthly automated scans
- Quarterly penetration testing
- Annual third-party security audit
- Continuous compliance monitoring

### Documentation Requirements
- All security incidents documented
- Change logs maintained
- Access logs preserved
- Compliance reports generated

---

**Remember: Security is everyone's responsibility. When in doubt, escalate immediately.**