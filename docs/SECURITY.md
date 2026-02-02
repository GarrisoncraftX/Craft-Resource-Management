# Security Best Practices
# Craft Resource Management System

## Environment Variables Security

### CRITICAL: Never Commit Secrets

**Files that should NEVER be committed:**
- `.env`
- `.env.local`
- `.env.production`
- Any file containing passwords, API keys, or tokens
- Database dumps with real data
- Private keys (*.pem, *.key)
- SSL certificates

### Setting Up Environment Variables

1. **Copy example files:**
   ```bash
   # Root
   cp .env.example .env
   
   # API Gateway
   cp Backend/api-gateway/.env.example Backend/api-gateway/.env
   
   # Java Backend
   cp Backend/java-backend/.env.example Backend/java-backend/.env
   
   # Node.js Backend
   cp Backend/nodejs-backend/.env.example Backend/nodejs-backend/.env
   
   # Python Backend
   cp Backend/python-backend/.env.example Backend/python-backend/.env
   
   # Frontend
   cp Frontend/.env.example Frontend/.env
   ```

2. **Generate secure secrets:**
   ```bash
   # Generate JWT secret (Node.js)
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   
   # Generate JWT secret (Python)
   python -c "import secrets; print(secrets.token_hex(32))"
   
   # Generate JWT secret (OpenSSL)
   openssl rand -hex 32
   ```

3. **Fill in actual values** in each `.env` file

### Required Secrets

**JWT_SECRET:**
- Minimum 32 characters
- Use cryptographically secure random string
- MUST be the same across all services
- Rotate every 90 days

**Database Password:**
- Minimum 16 characters
- Mix of uppercase, lowercase, numbers, symbols
- Never use default passwords

**API Keys:**
- Cloudinary: Get from cloudinary.com dashboard
- Twilio: Get from twilio.com console
- AWS: Use IAM user with minimal permissions
- OpenAI: Get from platform.openai.com

### Environment-Specific Configuration

**Development:**
- Use `.env` file
- Can use less secure passwords locally
- Enable debug logging

**Production:**
- Use environment variables from hosting platform
- Use strong passwords (16+ characters)
- Disable debug logging
- Enable HTTPS only
- Use secrets management service (AWS Secrets Manager, HashiCorp Vault)

## Git Security

### Before First Commit

1. **Verify .gitignore is working:**
   ```bash
   git status
   # Should NOT show .env files
   ```

2. **Check for secrets:**
   ```bash
   # Search for potential secrets
   grep -r "password" --exclude-dir=node_modules --exclude-dir=.git
   grep -r "api_key" --exclude-dir=node_modules --exclude-dir=.git
   grep -r "secret" --exclude-dir=node_modules --exclude-dir=.git
   ```

3. **Use git-secrets (optional):**
   ```bash
   # Install git-secrets
   git secrets --install
   git secrets --register-aws
   ```

### If Secrets Were Committed

**CRITICAL: If you accidentally committed secrets:**

1. **Immediately rotate all compromised credentials**
2. **Remove from git history:**
   ```bash
   # Use BFG Repo-Cleaner or git filter-branch
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch path/to/secret/file" \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. **Force push (if repository is private and you're the only user)**
4. **Contact team members to re-clone**

## Database Security

### Connection Security

- Use strong passwords
- Limit database user permissions
- Use SSL/TLS for connections
- Whitelist IP addresses
- Never expose database port publicly

### Data Protection

- Encrypt sensitive data at rest
- Hash passwords with bcrypt (cost factor 10+)
- Use parameterized queries (prevent SQL injection)
- Regular backups with encryption
- Implement audit logging

## API Security

### Authentication

- JWT tokens with short expiration (24 hours)
- Implement refresh tokens
- Secure token storage (httpOnly cookies or secure storage)
- Validate tokens on every request

### Rate Limiting

- Implement per-user rate limits
- Implement per-IP rate limits
- Different limits for different endpoints
- Block after repeated violations

### Input Validation

- Validate all user inputs
- Sanitize data before database operations
- Use schema validation (Joi, Zod)
- Implement file upload restrictions

## Production Checklist

- [ ] All `.env` files in `.gitignore`
- [ ] Strong passwords for all services
- [ ] JWT secrets rotated and secure
- [ ] HTTPS enabled with valid SSL certificate
- [ ] Database not publicly accessible
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Security headers configured (Helmet.js)
- [ ] File upload restrictions in place
- [ ] Audit logging enabled
- [ ] Backup system configured
- [ ] Monitoring and alerting setup
- [ ] Secrets stored in secrets manager
- [ ] No debug information in production
- [ ] Error messages don't leak sensitive info

## Monitoring

### What to Monitor

- Failed login attempts
- Unusual API usage patterns
- Database connection errors
- File upload attempts
- Permission violations
- Token validation failures

### Alerts

- Multiple failed logins from same IP
- Unusual data access patterns
- System errors
- High resource usage
- Backup failures

## Incident Response

### If Security Breach Suspected

1. **Immediately:**
   - Rotate all credentials
   - Review audit logs
   - Identify affected systems
   - Isolate compromised systems

2. **Investigation:**
   - Determine breach scope
   - Identify entry point
   - Document timeline
   - Preserve evidence

3. **Recovery:**
   - Patch vulnerabilities
   - Restore from clean backups
   - Notify affected users
   - Update security measures

4. **Post-Incident:**
   - Conduct security audit
   - Update procedures
   - Train team
   - Implement additional controls

## Contact

**Security Issues:** security@yourcompany.com  
**Emergency:** +1234567890

---

**Last Updated:** January 2025  
**Review Frequency:** Quarterly
