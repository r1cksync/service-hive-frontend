# SlotSwapper Frontend

Next.js frontend application for SlotSwapper - A peer-to-peer time slot scheduling platform.

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Environment Variables
Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Development
```bash
npm run dev
```
Application runs on http://localhost:3000

### Production Build
```bash
npm run build
npm start
```

## 📁 Project Structure

```
frontend/
├── app/
│   ├── auth/              # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   ├── dashboard/         # User calendar
│   ├── marketplace/       # Browse swappable slots
│   ├── requests/          # Swap requests
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/
│   ├── Navbar.tsx
│   └── ProtectedRoute.tsx
├── contexts/
│   └── AuthContext.tsx    # Authentication state
├── lib/
│   └── api.ts             # API client
└── package.json
```

## 🎨 Pages

### Public Pages
- **/** - Landing page with feature overview
- **/auth/login** - User login
- **/auth/signup** - User registration

### Protected Pages
- **/dashboard** - View and manage your calendar events
- **/marketplace** - Browse available swappable slots
- **/requests** - Manage incoming and outgoing swap requests

## 🔐 Authentication

Uses JWT-based authentication with React Context:
- Token stored in localStorage
- Automatic redirect on 401 errors
- Protected routes wrap authenticated pages

## 🎯 Key Features

### Dashboard
- Create, edit, delete events
- Toggle event status (BUSY/SWAPPABLE)
- AI schedule analysis
- View all your calendar slots

### Marketplace
- Browse slots from other users
- AI-powered swap suggestions
- Request swaps with modal selection
- Filter and search capabilities

### Requests
- View incoming requests (Accept/Reject)
- Track outgoing requests (Pending status)
- Tab-based filtering
- Real-time status updates

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Date Handling**: date-fns
- **Language**: TypeScript

## 🎨 Design System

### Colors
- Primary: Blue (600-700)
- Success: Green (600-700)
- Warning: Yellow (600-700)
- Danger: Red (600-700)
- Neutral: Gray (50-900)

### Status Colors
- BUSY: Gray
- SWAPPABLE: Green
- SWAP_PENDING: Yellow

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm, md, lg
- Grid layouts adapt to screen size
- Touch-friendly buttons and interactions

## 🔄 State Management

### Auth Context
```typescript
{
  user: User | null
  token: string | null
  login: (email, password) => Promise<void>
  signup: (name, email, password) => Promise<void>
  logout: () => void
  isLoading: boolean
}
```

### Data Fetching
- Fetch on component mount
- Refresh after mutations
- Error handling with alerts
- Loading states throughout

## 🚀 Deployment

Recommended: **Vercel**

```bash
# Connect repository to Vercel
# Set environment variable:
NEXT_PUBLIC_API_URL=your_backend_url

# Automatic deployments on push
```

Alternative platforms:
- Netlify
- AWS Amplify
- GitHub Pages (with adapter)

## 🧪 Usage Flow

1. **Sign Up/Login** on authentication pages
2. **Create Events** in dashboard
3. **Mark as Swappable** to list in marketplace
4. **Browse Marketplace** to find slots
5. **Get AI Suggestions** for optimal matches
6. **Request Swap** by selecting your slot
7. **Manage Requests** to accept/reject
8. **View Updated Calendar** after swap

## 🎨 Component Structure

### ProtectedRoute
Wraps pages requiring authentication:
```tsx
<ProtectedRoute>
  <YourPage />
</ProtectedRoute>
```

### Navbar
Dynamic navigation based on auth state:
- Public: Login, Sign Up
- Authenticated: Dashboard, Marketplace, Requests, Logout

## 📄 License

MIT
