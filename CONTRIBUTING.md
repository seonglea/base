# Contributing to Find X Friends on Farcaster

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/base.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test thoroughly
6. Commit: `git commit -m "Description of changes"`
7. Push: `git push origin feature/your-feature-name`
8. Open a Pull Request

## Development Setup

See [README.md](README.md) for installation instructions.

## Code Standards

### TypeScript
- Use TypeScript for all new files
- Define proper types (avoid `any`)
- Use interfaces for object shapes
- Export types from `lib/types.ts`

### React Components
- Use functional components with hooks
- Keep components focused (single responsibility)
- Use `'use client'` directive when needed
- Extract reusable logic into custom hooks

### Styling
- Use Tailwind CSS classes
- Follow mobile-first responsive design
- Maintain consistent spacing and colors
- Test dark mode compatibility

### API Routes
- Validate all inputs
- Handle errors gracefully
- Return consistent response formats
- Add proper TypeScript types

## Testing

Before submitting PR:
- [ ] Test wallet connection flow
- [ ] Test payment flow (both free and paid)
- [ ] Test all API endpoints
- [ ] Test error handling
- [ ] Check mobile responsiveness
- [ ] Verify no console errors
- [ ] Test with real API keys

## Commit Guidelines

Use conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

Examples:
```
feat: add Twitter profile image caching
fix: payment verification timeout issue
docs: update deployment guide
```

## Pull Request Process

1. Update README if adding features
2. Update DEPLOYMENT.md if changing deployment
3. Add comments for complex logic
4. Ensure no breaking changes (or document them)
5. Request review from maintainers

## Areas for Contribution

### High Priority
- [ ] Improve Farcaster user matching accuracy
- [ ] Add batch processing for large following lists
- [ ] Optimize API rate limiting
- [ ] Add error recovery mechanisms
- [ ] Improve caching strategies

### Features
- [ ] Add export to CSV functionality
- [ ] Add filtering/sorting options
- [ ] Add user statistics dashboard
- [ ] Add referral system
- [ ] Add email notifications

### UI/UX
- [ ] Improve loading states
- [ ] Add animations
- [ ] Improve mobile design
- [ ] Add dark mode toggle
- [ ] Add onboarding tutorial

### Performance
- [ ] Optimize bundle size
- [ ] Add image optimization
- [ ] Implement lazy loading
- [ ] Add service worker for offline support

### Documentation
- [ ] Add video tutorials
- [ ] Create API documentation
- [ ] Add troubleshooting guide
- [ ] Add architecture diagrams

## Code Review

All submissions require review. We use GitHub PRs for this.

Reviewers will check:
- Code quality and standards
- Test coverage
- Documentation updates
- Breaking changes
- Security implications

## Questions?

- Open an issue for bugs
- Use discussions for questions
- Tag maintainers for urgent issues

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
