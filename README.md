# DisasterLens 🚨

**Real-time Emergency Response Dashboard**

DisasterLens is a comprehensive full-stack web application designed for real-time emergency response coordination. It aggregates disaster data, classifies and summarizes it with AI, and displays everything in a unique, visually striking interface.

![DisasterLens Dashboard](https://via.placeholder.com/800x400/D72638/FFFFFF?text=DisasterLens+Emergency+Dashboard)

## ✨ Features

### 🎯 Core Functionality
- **Real-time Emergency Dashboard** - Interactive map with live disaster alerts
- **AI-Powered Classification** - Automatic categorization and confidence scoring
- **Citizen Reporting Portal** - Easy-to-use interface for emergency submissions
- **Admin Management Panel** - Review and approve citizen reports
- **Multi-level Alert System** - Critical, High, Medium, and Low priority levels
- **Mobile-First Design** - Responsive interface optimized for all devices

### 🎨 Standout UI Features
- **Bold Red & White Color Scheme** - High contrast, emergency-focused design
- **Emergency Ticker** - Scrolling urgent alerts at the top
- **Custom Disaster Icons** - Fire 🔥, Flood 🌊, Power ⚡, Storm 🌪️, Shelter 🏠
- **Interactive Map** - Leaflet.js integration with custom markers
- **Real-time Animations** - Pulse effects and smooth transitions
- **Card-based Layout** - Rounded corners, shadows, and clean typography

### 🤖 AI Integration (Stubbed)
- **Smart Classification** - Analyzes text and images to determine disaster type
- **Confidence Scoring** - AI confidence levels for each report
- **Automated Summarization** - Generates AI summaries of multiple reports
- **Risk Assessment** - Automatic severity and risk level determination

## 🛠️ Tech Stack

- **Frontend:** Next.js 15 (React 19, App Router)
- **Styling:** TailwindCSS with custom theme
- **Database:** Supabase (PostgreSQL)
- **Maps:** Leaflet.js / React-Leaflet
- **Icons:** Lucide React
- **AI:** Placeholder functions for Gemini API integration
- **Deployment:** Vercel-ready configuration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (optional for full functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/disasterlens.git
   cd disasterlens
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Set up the database** (if using Supabase)
   - Create a new Supabase project
   - Run the SQL from `database/schema.md` in the Supabase SQL editor
   - The app will work with mock data if no database is connected

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 App Structure

### Pages
- **`/`** - Main emergency dashboard with interactive map
- **`/report`** - Citizen reporting portal
- **`/admin`** - Admin panel for managing reports and alerts

### Key Components
- **`DisasterMap`** - Interactive Leaflet map with custom markers
- **`EmergencyTicker`** - Scrolling urgent alerts banner
- **`AlertCard`** - Disaster alert display cards
- **`FilterControls`** - Map filter toggles
- **`SummaryPanel`** - AI-powered situation summary

## 🗄️ Database Schema

The app uses three main tables:

### `alerts`
- Emergency alerts and disaster information
- Includes location, severity, confidence, and status
- Supports fire, flood, outage, storm, and shelter types

### `reports`
- Citizen-submitted emergency reports
- AI classification and confidence scoring
- Approval workflow (pending → approved/rejected)

### `users`
- User authentication and role management
- Supports citizen, responder, and admin roles

See `database/schema.md` for complete SQL schema.

## 🤖 AI Integration

Currently includes stub functions ready for real AI integration:

```typescript
// Classify disaster reports
const classification = await classifyData(text, imageUrl)

// Summarize multiple reports
const summary = await summarizeReports(reports)

// Generate alert messages
const message = generateAlertMessage(alert)
```

**Integration Ready:** Built to connect with Gemini API or other AI services.

## 🎨 Design System

### Colors
- **Primary Red:** `#D72638` - Emergency alerts, CTAs, active states
- **Background:** `#FFFFFF` - Clean, professional base
- **Text:** `#171717` - High contrast readability
- **Accent Colors:** Disaster-specific (blue for floods, orange for outages, etc.)

### Typography
- **Font:** Inter (system fallback: Arial, Helvetica, sans-serif)
- **Headers:** Bold weights for hierarchy
- **Body:** Regular weight, 1.6 line height

### Components
- **Rounded Corners:** 1.5rem (2xl) for cards and modals
- **Shadows:** Layered depth with CSS custom properties
- **Animations:** Pulse effects, smooth transitions, scroll animations

## 📦 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in the Vercel dashboard
3. Deploy with zero configuration

### Other Platforms
The app is a standard Next.js application and can be deployed to:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🧪 Mock Data

The app includes comprehensive mock data for demonstration:
- **6 Sample Alerts** - Various types, severities, and statuses
- **4 Sample Reports** - Different approval states
- **3 Sample Users** - Citizen, responder, and admin roles

Perfect for hackathon demos and development testing.

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Project Structure
```
src/
├── app/                 # Next.js App Router pages
│   ├── api/            # API routes
│   ├── admin/          # Admin dashboard
│   └── report/         # Citizen reporting
├── components/         # React components
├── lib/               # Utilities and configurations
└── styles/            # Global styles
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Hackathon Ready

This project is specifically designed for hackathon demonstrations:
- ✅ **Unique, memorable UI** that stands out
- ✅ **Full-stack functionality** with working features  
- ✅ **AI integration stubs** ready for real implementation
- ✅ **Mobile responsive** design
- ✅ **Mock data included** for immediate demos
- ✅ **Deploy-ready** configuration

---

**DisasterLens** - *Bringing clarity to emergency response through technology*

For questions or support, please open an issue or contact the development team.
