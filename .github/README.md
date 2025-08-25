# GitHub Actions Workflows

This directory contains GitHub Actions workflows for automated CI/CD, testing, and deployment of the Taurean Inventory Management System.

## 📋 Available Workflows

### 1. **CI/CD Pipeline** (`ci-cd.yml`)
**Triggers**: Push to main/develop, Pull Requests, Releases

**Features**:
- 🔧 Backend and Frontend build verification
- 🧪 Integration testing with MongoDB and Redis
- 🔒 Security scanning with npm audit and Snyk
- 🐳 Docker image building and pushing
- 🚀 Automated deployment to staging and production
- 📢 Failure notifications

**Jobs**:
- `backend`: Build and test backend service
- `frontend`: Build and test frontend application
- `integration`: Run integration tests
- `security`: Security vulnerability scanning
- `docker`: Build and push Docker images
- `deploy-staging`: Deploy to staging environment
- `deploy-production`: Deploy to production environment
- `notify-failure`: Send failure notifications

### 2. **Pull Request Check** (`pr-check.yml`)
**Triggers**: Pull Requests to main/develop

**Features**:
- ⚡ Fast build verification
- 🔍 Type checking and linting
- 🔒 Security audit
- 📊 Build summary report

**Jobs**:
- `build-check`: Verify backend and frontend builds
- `security-check`: Run security audits
- `code-quality`: Check code formatting
- `summary`: Generate build summary

### 3. **Maintenance** (`maintenance.yml`)
**Triggers**: Weekly (Monday 2 AM UTC), Manual

**Features**:
- 📦 Dependency update checks
- 🔒 Security vulnerability monitoring
- 🔧 Build verification
- 🗄️ Database schema validation
- 📧 Email template verification

**Jobs**:
- `dependency-check`: Check for outdated dependencies
- `build-verification`: Verify builds still work
- `database-check`: Validate database models
- `email-check`: Verify email templates
- `summary`: Generate maintenance report

### 4. **Deploy** (`deploy.yml`)
**Triggers**: Push to develop, Release published

**Features**:
- 🚀 Automated deployment to staging/production
- 🔍 Post-deployment health checks
- 🔄 Automatic rollback on failure
- 📢 Deployment notifications

**Jobs**:
- `deploy-staging`: Deploy to staging environment
- `deploy-production`: Deploy to production environment
- `rollback`: Rollback failed deployments

## 🚀 Getting Started

### Prerequisites
1. **Repository Secrets**: Set up the following secrets in your GitHub repository:
   ```
   DOCKER_USERNAME: Your Docker Hub username
   DOCKER_PASSWORD: Your Docker Hub password/token
   SNYK_TOKEN: Your Snyk security token (optional)
   ```

2. **Environment Protection**: Set up environment protection rules for:
   - `staging`: Restrict who can deploy to staging
   - `production`: Restrict who can deploy to production

### Manual Workflow Execution
You can manually trigger workflows from the GitHub Actions tab:

1. Go to **Actions** tab in your repository
2. Select the workflow you want to run
3. Click **Run workflow**
4. Choose the branch and click **Run workflow**

## 🔧 Customization

### Environment Variables
Each workflow uses environment variables that you can customize:

```yaml
env:
  NODE_VERSION: '18'
  BACKEND_PORT: 3001
  FRONTEND_PORT: 3000
```

### Deployment Logic
The deployment workflows contain placeholder logic. Replace the comments with your actual deployment commands:

```yaml
# Example for Kubernetes
- name: Deploy to Staging
  run: |
    kubectl config use-context staging
    kubectl apply -f k8s/staging/
    kubectl rollout status deployment/taurean-backend

# Example for Docker Compose
- name: Deploy to Staging
  run: |
    docker-compose -f docker-compose.staging.yml up -d
```

### Notification Integration
Add your notification logic to the notification steps:

```yaml
# Example for Slack
- name: Notify Team
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## 📊 Workflow Status

### Success Criteria
- ✅ All builds complete successfully
- ✅ All tests pass
- ✅ Security scans show no high-severity vulnerabilities
- ✅ Deployments complete without errors

### Failure Handling
- ❌ Build failures trigger notifications
- 🔄 Production deployments automatically rollback on failure
- 📢 Team notifications sent for all failures

## 🔍 Monitoring and Debugging

### Workflow Logs
- View detailed logs in the GitHub Actions tab
- Download build artifacts for inspection
- Check specific job outputs for debugging

### Common Issues
1. **Build Failures**: Check TypeScript compilation errors
2. **Test Failures**: Verify test environment setup
3. **Deployment Failures**: Check environment configuration
4. **Security Failures**: Review vulnerability reports

### Performance Optimization
- Workflows run in parallel where possible
- Caching enabled for npm dependencies
- Docker layer caching for faster builds
- Artifact sharing between jobs

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Node.js Setup Action](https://github.com/actions/setup-node)
- [Docker Build Action](https://github.com/docker/build-push-action)
- [Snyk Security Action](https://github.com/snyk/actions)

## 🤝 Contributing

When adding new workflows or modifying existing ones:

1. **Test Locally**: Use `act` to test workflows locally
2. **Follow Patterns**: Maintain consistency with existing workflows
3. **Document Changes**: Update this README for new features
4. **Security Review**: Ensure workflows don't expose secrets

## 📞 Support

For workflow-related issues:
1. Check the workflow logs for error details
2. Review the workflow configuration
3. Test the workflow manually
4. Create an issue with detailed error information