# Autoblog CMS + Gemini AI Assistant

A modern, intelligent blog content management system built with Next.js and Tailwind CSS. Features AI-assisted content creation, intuitive
hierarchical organization, professional editorial workflows, and beautiful responsive design.

**[📚 Full Feature Guide →](./FEATURES.md)**

---

## ✨ Key Strengths

### 🤖 Integrated AI Assistant

- **Gemini 1.5 Integration**: Select from Flash, Flash 8B, Pro, or 2.0 models
- **Real-Time Guidance**: Get suggestions on content creation, SEO, editorial standards, analytics
- **Typewriter Effect**: Beautiful character-by-character animations for engaging presentation
- **Conversation History**: Full session persistence for context-aware responses
- **Markdown Rendering**: Professional formatting with lists, emphasis, and embedded content

### ✏️ Effortless Content Management

- **Right-Click Organization**: Context menus for creating groups, subgroups, and posts
- **One-Click Renaming**: Instant inline editing for any content item
- **Hierarchical Structure**: Section → Group → Subgroup → Post organization
- **Professional Templates**: Pre-configured content categories (Featured, Design, Culture, Insights, Resources)
- **Publication States**: Draft, Scheduled, Published, Archived with date scheduling

### 💾 Smart Persistence

- **Autosave Everything**: Changes persist instantly without manual saving
- **Session Storage**: Secure browser-based data handling
- **Real-Time Sync**: All edits reflected immediately across dashboard
- **No Data Loss**: Automatic recovery from browser cache

### 📱 Truly Responsive Design

- **Desktop**: Full-featured sidebar + dual-column editor
- **Tablet**: Optimized grid layouts and touch targets
- **Mobile**: Full-screen modals and finger-friendly controls
- **Tested Across Devices**: Works seamlessly on all modern browsers

### 🖼️ Professional Image Management

- **Click-to-Upload**: Intuitive image selection and preview
- **Optimized Loading**: Next.js Image optimization with lazy loading
- **Multiple Formats**: JPG, PNG, WebP with automatic conversion
- **Responsive Images**: Proper sizing for all device types
- **8 Professional Demo Images**: Ready-to-use for all content sections

### 🎨 Enterprise-Grade UI

- **Dark & Light Themes**: Full theme switching with system preference detection
- **Accessible Components**: WCAG AA compliant with keyboard navigation
- **Smooth Animations**: Typewriter effects, pulsing indicators, hover states
- **Breadcrumb Navigation**: Always know where you are in the structure

### 📊 Comprehensive Organization

- **5 Content Sections**: Featured, Design, Culture, Insights, Resources
- **20+ Demo Posts**: Realistic content examples in every section
- **Multi-Level Groups**: Organize content by themes, months, topics
- **Editorial Advisory**: Built-in system for maintaining brand standards

### ⚡ Lightning-Fast Performance

- **Server Components**: React 18 with server-side rendering
- **Lazy Loading**: Images and components load on-demand
- **Code Splitting**: Automatic optimization by Next.js
- **Zero External Calls**: Demo mode with full offline functionality

---

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
bun install

# Start development
bun dev

# Production build
bun build
bun start
```

### First Steps

1. Navigate to any content section in the sidebar
2. Right-click to create a new group or post
3. Click **AI** button (top-right) to ask for content guidance
4. Write and watch as your content autosaves
5. Upload featured images with one click
6. Switch between preview and edit modes
7. Publish or schedule for later!

---

## 📖 Technology Stack

- **Frontend**: Next.js 14+, React 18+, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **State**: React hooks, Context API, Browser SessionStorage
- **AI**: Google Generative AI (Gemini)
- **Images**: Next.js Image optimization
- **Theme**: Dark/Light mode with system preference detection

---

## 🎯 Core Features

| Feature                    | Benefit                                          |
| -------------------------- | ------------------------------------------------ |
| **AI Assistant**           | Intelligent guidance on every aspect of blogging |
| **Right-Click Menu**       | Create content 3x faster than traditional CMS    |
| **Autosave**               | Never lose work again—saves automatically        |
| **Mobile Responsive**      | Works perfectly on phone, tablet, desktop        |
| **Image Management**       | Optimized uploads with multiple format support   |
| **Editorial Standards**    | Advisory panel maintains brand consistency       |
| **Publication Scheduling** | Schedule posts for future release                |
| **Demo Mode**              | Test everything without external dependencies    |
| **Dark Theme**             | Eye-friendly interface for extended use          |
| **Loading States**         | Beautiful skeleton loaders while fetching data   |

---

## 📁 Project Structure

```
├── app/                      # Next.js app router
│   ├── @inset/             # Main content editor layout
│   │   ├── [section]/      # Dynamic section pages
│   │   ├── [id]/           # Individual post editor
│   │   ├── home/           # Homepage image management
│   │   └── advisory/       # Editorial advisory panel
│   ├── @sidebar/           # Navigation sidebar
│   ├── api/                # API routes (demo mode)
│   └── layout.tsx          # Root layout
├── components/             # React components
│   ├── chat/              # AI assistant interface
│   ├── groups/            # Group/subgroup components
│   ├── webapp/            # Post preview components
│   └── imageLoader.tsx    # Image management UI
├── utils/                  # Utility functions
│   ├── api-fetch.ts       # Mock API with demo data
│   └── revalidate.ts      # Cache invalidation
├── constants/              # Configuration
│   ├── sections.ts        # Content sections
│   └── post-init-template.ts  # Default post fields
├── hooks/                  # Custom React hooks
│   └── use-typewriter.ts  # Typewriter animation
├── public/demo/            # Demo images (8 professional images)
└── types/                  # TypeScript type definitions
```

---

## 🔧 Configuration

### Environment Variables

All environment variables are pre-configured with safe demo values. No real credentials are committed.

```env
# Local demo configuration (no external dependencies needed)
MONGODB_URI=""
DBNAME=""
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
GEMINI_API_KEY=""
```

### Customization

- **Sections**: Edit `constants/sections.ts` to add categories
- **Demo Data**: Modify `utils/api-fetch.ts` to change sample content
- **Styling**: Tailwind CSS with custom CSS variables in `app/globals.css`
- **Components**: Use shadcn/ui for building new features

---

## 🎨 Content Sections

The CMS comes with 5 professionally-organized sections:

### Featured Stories

Curated highlights and trending content

- Examples: Digital Revolution, Sustainable Design, Community Impact

### Design & Creative

Design trends, visual systems, UI/UX expertise

- Examples: UX Trends 2025, Accessibility Design, Typography Mastery

### Culture & Arts

Cultural commentary, exhibitions, interviews

- Examples: Installation Art Showcase, Fashion Week, Artist Interviews

### Insights & Analysis

Industry trends, research, thought leadership

- Examples: Market Analysis, Technology Forecast, Future of Work

### Resources & Guides

Tutorials, guides, tools, and best practices

- Examples: Web Performance, Security Practices, Designer's Toolkit

Each section includes realistic multi-level organization and professional demo content.

---

## 📊 Dashboard Features

### Sidebar Navigation

- Content sections with collapsible groups
- Quick access to Home and Advisory pages
- Theme switcher for dark/light mode
- Environment configuration

### Main Editor

- Dual-view: Preview & Edit modes
- Rich text editing with Markdown support
- Image upload and management
- Publication state and scheduling
- Auto-save indicator

### AI Assistant

- Pulsing "AI" indicator showing availability
- Model selection for different use cases
- Conversation history maintained in session
- Responsive markdown rendering
- Smart category-based responses

### Loading States

- Skeleton loaders for all async operations
- Beautiful transitions while fetching
- Matches actual layout structure
- Prevents layout shift

---

## 🚀 Performance Optimizations

- **Server Components**: React Server Components for reduced JS
- **Image Optimization**: Next/Image with lazy loading
- **Code Splitting**: Automatic route-based splitting
- **Type Safety**: Full TypeScript coverage prevents errors
- **Responsive Design**: Mobile-first CSS approach
- **Caching**: Smart cache strategies

---

## 🔐 Security & Best Practices

- **Type-Safe**: Full TypeScript validation
- **Demo Mode**: No real API calls or credentials in code
- **WCAG AA**: Accessible design for all users
- **Semantic HTML**: Proper DOM semantics
- **Environment Variables**: Secure configuration handling

---

## 💡 Example Workflows

### Content Creator

```
1. Ask AI: "How do I write engaging content?"
2. Right-click → Create Post
3. Type while AI offers suggestions
4. Upload featured image
5. Autosave handles persistence
6. Preview to verify layout
7. Publish or schedule
```

### Editorial Manager

```
1. Open Dashboard
2. Ask AI: "Evaluate editorial quality"
3. Right-click group → Rename for campaign
4. Update publication states
5. Set scheduling dates
6. Monitor analytics by section
```

### Content Strategist

```
1. Chat with AI for trend analysis
2. Request content calendar ideas
3. Create thematic content groups
4. Plan cross-section strategy
5. Schedule coordinated releases
6. Track performance metrics
```

---

## 📚 Additional Resources

- **Features Guide**: See [FEATURES.md](./FEATURES.md) for comprehensive feature documentation
- **Keyboard Shortcuts**: Right-click context menus + keyboard support
- **AI Assistance**: Click AI button to learn about any feature

---

## 🎯 Use Cases

✅ **Professional Bloggers**: Multi-category blog organization with editorial workflow ✅ **Content Teams**: Collaborative content creation with
advisory standards ✅ **Marketing Teams**: Campaign-based content organization with scheduling ✅ **Agencies**: Client portfolio and case study
management ✅ **Thought Leaders**: Publish insights and establish authority ✅ **Educational Platforms**: Course and learning content organization

---

## 📝 License

This project is provided as-is for educational and commercial use.

---

**Autoblog CMS v1.0** - Where AI meets intelligent content management.

Built with modern web technologies. Optimized for performance. Designed for scale.

- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_WEBSITE_FOLDER`
- `GEMINI_API_KEY`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

## Security and Compliance Notes

- Do not commit real credentials, API keys, tokens, or passwords.
- Keep `.env.local` environment-specific and secret-scoped.
- Rotate any credential that was previously committed.

## Deployment

Build and run in production mode:

```bash
npm run build
npm run start
```

Use your preferred hosting provider (e.g., Vercel) with environment variables configured in the deployment platform.
