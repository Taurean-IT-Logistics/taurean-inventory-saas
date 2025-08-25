# Workflow Status Badges

Add these badges to your main README.md to show the status of your workflows:

## 📊 Build Status

```markdown
[![CI/CD Pipeline](https://github.com/{owner}/{repo}/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/{owner}/{repo}/actions/workflows/ci-cd.yml)
[![Pull Request Check](https://github.com/{owner}/{repo}/workflows/Pull%20Request%20Check/badge.svg)](https://github.com/{owner}/{repo}/actions/workflows/pr-check.yml)
[![Maintenance](https://github.com/{owner}/{repo}/workflows/Maintenance/badge.svg)](https://github.com/{owner}/{repo}/actions/workflows/maintenance.yml)
[![Deploy](https://github.com/{owner}/{repo}/workflows/Deploy/badge.svg)](https://github.com/{owner}/{repo}/actions/workflows/deploy.yml)
```

## 🔧 Specific Job Status

```markdown
[![Backend Build](https://github.com/{owner}/{repo}/workflows/Backend%20Build%20&%20Test/badge.svg)](https://github.com/{owner}/{repo}/actions/workflows/ci-cd.yml)
[![Frontend Build](https://github.com/{owner}/{repo}/workflows/Frontend%20Build%20&%20Test/badge.svg)](https://github.com/{owner}/{repo}/actions/workflows/ci-cd.yml)
[![Security Scan](https://github.com/{owner}/{repo}/workflows/Security%20Scan/badge.svg)](https://github.com/{owner}/{repo}/actions/workflows/ci-cd.yml)
```

## 📋 Complete Badge Section

```markdown
## 🚀 Build Status

| Workflow | Status | Description |
|----------|--------|-------------|
| [![CI/CD Pipeline](https://github.com/{owner}/{repo}/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/{owner}/{repo}/actions/workflows/ci-cd.yml) | CI/CD | Full pipeline with testing and deployment |
| [![Pull Request Check](https://github.com/{owner}/{repo}/workflows/Pull%20Request%20Check/badge.svg)](https://github.com/{owner}/{repo}/actions/workflows/pr-check.yml) | PR Check | Fast build verification for PRs |
| [![Maintenance](https://github.com/{owner}/{repo}/workflows/Maintenance/badge.svg)](https://github.com/{owner}/{repo}/actions/workflows/maintenance.yml) | Maintenance | Weekly dependency and security checks |
| [![Deploy](https://github.com/{owner}/{repo}/workflows/Deploy/badge.svg)](https://github.com/{owner}/{repo}/actions/workflows/deploy.yml) | Deploy | Automated deployment to environments |
```

## 🔄 Dynamic Badges

For more dynamic badges, you can use:

```markdown
[![Build Status](https://img.shields.io/github/actions/workflow/status/{owner}/{repo}/ci-cd.yml?branch=main&label=Build&style=flat-square)](https://github.com/{owner}/{repo}/actions/workflows/ci-cd.yml)
[![Test Status](https://img.shields.io/github/actions/workflow/status/{owner}/{repo}/pr-check.yml?branch=main&label=Tests&style=flat-square)](https://github.com/{owner}/{repo}/actions/workflows/pr-check.yml)
[![Deploy Status](https://img.shields.io/github/actions/workflow/status/{owner}/{repo}/deploy.yml?branch=main&label=Deploy&style=flat-square)](https://github.com/{owner}/{repo}/actions/workflows/deploy.yml)
```

## 📝 Usage Instructions

1. Replace `{owner}` with your GitHub username
2. Replace `{repo}` with your repository name
3. Add the badges to your main README.md file
4. The badges will automatically update based on workflow status

## 🎨 Customization

You can customize the badge appearance by modifying the URL parameters:

- `?branch=main` - Show status for specific branch
- `?event=push` - Show status for specific event
- `?style=flat-square` - Use different badge style
- `?label=Custom` - Custom label text