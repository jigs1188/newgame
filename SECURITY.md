# Security Policy

## Supported Versions

We actively maintain and provide security updates for the following versions of this project:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

1. **Email**: Send an email to [parmarjigs1188@gmail.com](mailto:parmarjigs1188@gmail.com)
2. **Subject**: Use "Security Vulnerability - newgame" in the subject line
3. **Details**: Include:
   - A description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact
   - Any suggested fixes (if available)

### Response Timeline

- **Acknowledgment**: We will acknowledge your report within 48 hours
- **Initial Assessment**: Within 5 business days, we will provide an initial assessment
- **Resolution**: Critical vulnerabilities will be prioritized and addressed as quickly as possible

### What to Expect

- **Accepted Vulnerability**: We will work on a fix and provide updates on progress
- **Declined Report**: We will explain why the report doesn't qualify as a security vulnerability

### Responsible Disclosure

Please do not publicly disclose the vulnerability until we have had a chance to address it. We appreciate your responsible disclosure and will acknowledge your contribution if desired.

## Security Best Practices

This project includes:
- Firebase authentication and database integration
- QR code scanning functionality
- Local data storage using AsyncStorage

**Important Notes:**
- Always use environment variables for sensitive configuration
- Keep Firebase rules properly configured
- Regularly update dependencies to patch known vulnerabilities
- Review and validate all QR code content before processing
