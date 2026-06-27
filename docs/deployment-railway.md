# Railway Deployment Guide

## Overview
This project is deployed on Railway at: [https://tara-app-production.up.railway.app](https://tara-app-production.up.railway.app/)

## Environment Setup

### Required Environment Variables
The following variables are configured in Railway and should NOT be committed to the repo:
- `DATABASE_URL` - PostgreSQL connection string (auto-linked from Postgres service)
- `ADMIN_USERNAME` - Admin panel username
- `ADMIN_PASSWORD` - Admin panel password
- `SESSION_SECRET` - Session encryption secret
- `NEXT_PUBLIC_APP_NAME` - Public app name

### Database
- **Service**: Postgres (PostgreSQL 18)
- **Region**: US West (sfo)
- **Connection**: Automatic via `${{Postgres.DATABASE_URL}}` reference variable
- **Migrations**: Run automatically via pre-deploy command

## Deployment Process

### Pre-Deploy Command
```bash
npx prisma migrate deploy
```
