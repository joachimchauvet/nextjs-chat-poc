# ONE EDU MVP - AI Mentor for Kids

A voice-powered AI mentor application for children aged 8-13, built with Next.js, Supabase, and OpenAI GPT-4o.

## Overview

ONE EDU is an interactive learning platform that provides personalized mentorship through an AI companion named Astra. The application features:

- **Authentication Flow**: Secure sign-up/login with role-based access (child/parent)
- **AI Chat Interface**: Conversational learning with GPT-4o
- **Progress Tracking**: XP system, skills development, and achievement badges
- **Voice Interaction**: Real-time voice conversations (optional feature)

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Supabase (Auth + PostgreSQL)
- **AI**: OpenAI GPT-4o via Vercel AI SDK and the OpenAI Realtime API
- **Deployment**: Vercel
- **Package Manager**: pnpm

## Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Supabase account
- OpenAI API key

## Getting Started

### 1. Clone and Install

```bash
git clone [repository-url]
cd nextjs-chat-poc
pnpm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and update with your credentials:

```env
# Supabase (from https://app.supabase.com/project/_/settings/api)
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key
```

### 3. Database Setup

1. Create a new Supabase project at [app.supabase.com](https://app.supabase.com)

2. Run the migration in your Supabase SQL editor:
   - Go to SQL Editor in your Supabase dashboard
   - Copy contents from `supabase/migrations/20240711_initial_schema.sql`
   - Execute the SQL

3. Enable Email Auth in Authentication settings

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
nextjs-chat-poc/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   │   ├── login/
│   │   ├── sign-up/
│   │   └── role-selection/
│   ├── (dashboard)/       # Protected dashboard pages
│   │   ├── child/
│   │   │   ├── chat/      # AI mentor chat
│   │   │   ├── progress/  # XP dashboard
│   │   │   └── onboarding/
│   │   └── parent/        # Parent dashboard (placeholder)
│   └── api/               # API routes
│       └── chat/          # OpenAI integration
├── components/            # React components
│   ├── auth/             # Auth-related components
│   ├── chat/             # Chat interface components
│   ├── dashboard/        # Dashboard components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utilities and configurations
│   ├── supabase/         # Supabase client setup
│   └── openai/           # OpenAI configuration
├── types/                # TypeScript type definitions
└── supabase/
    └── migrations/       # Database migrations
```

## Database Schema

The application uses the following main tables:

- **profiles**: User profiles with role (child/parent)
- **child_profiles**: Child-specific data (name, age, interests, XP)
- **conversations**: Chat conversation records
- **messages**: Individual chat messages
- **skills**: Skill tracking (Communication, Problem Solving, Leadership)
- **badges**: Achievement badges

All tables include Row Level Security (RLS) policies to ensure data privacy.

## Features Implementation

### Authentication Flow

- Email/password authentication via Supabase Auth
- Role selection during signup (child/parent)
- Protected routes with middleware
- Automatic profile creation on signup

### Child Experience

1. **Onboarding**: Name, age, and interests collection
2. **Chat with Astra**: AI mentor providing encouragement and guidance
3. **Progress Dashboard**: Visual representation of XP, skills, and badges

### Parent Experience

- Placeholder dashboard with "Coming Soon" message
- Foundation for future parent monitoring features

## Development Guidelines

### Code Quality

- Pre-commit hooks with Husky
- Linting with ESLint
- Formatting with Prettier
- TypeScript for type safety

### Git Workflow

```bash
# Stage changes
git add .

# Commit (will run lint-staged)
git commit -m "feat: description"

# Push to remote
git push origin main
```

### Adding New Components

Use the shadcn/ui CLI:

```bash
pnpm dlx shadcn@latest add [component-name]
```

## API Routes

### `/api/chat`

Handles chat messages with OpenAI GPT-4o using Vercel AI SDK

- Method: POST
- Body: `{ messages: ChatMessage[], conversationId?: string }`
- Returns: Streaming response with AI messages
- Headers: `X-Conversation-Id` and `X-XP-Earned`

## Security Considerations

- Row Level Security (RLS) enabled on all tables
- API keys stored in environment variables
- Supabase Auth for user management
- Input validation on all forms
- XSS protection through React's default escaping

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`

## Future Enhancements

- [ ] Voice conversation with OpenAI Realtime API
- [ ] Parent dashboard with child progress monitoring
- [ ] More skill categories and badges
- [ ] Lesson plans and structured learning paths
- [ ] Multi-language support
- [ ] Mobile app version

## Troubleshooting

### Common Issues

1. **Database connection errors**: Check Supabase credentials in `.env.local`
2. **OpenAI API errors**: Verify API key and check rate limits
3. **Build errors**: Run `pnpm install` and check for TypeScript errors

### Debug Commands

```bash
# Check TypeScript errors
pnpm tsc --noEmit

# Run linter
pnpm lint

# Clear cache
rm -rf .next node_modules
pnpm install
```

## License

This project is proprietary and confidential.

---

Built with ❤️ for ONE EDU
