# University Admissions Chatbot

A modern, production-ready web-based chatbot application built for university admissions, featuring real-time communication, comprehensive admin management, and intelligent AI-powered conversations.

## 🎯 Features

### Student Chat Interface

- **Interactive Chat**: Real-time conversation with an AI-powered admissions chatbot
- **Smart Escalation**: Automatic detection when human intervention is needed
- **Manual Controls**: One-click buttons to escalate to a human or request a follow-up call at any time
- **Follow-up Scheduling**: Easy booking of calls with admissions counselors via guided modal flow
- **Real-time Updates**: Live message delivery with Socket.IO integration
- **Session Management**: Persistent chat sessions across page refreshes
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Admin Dashboard

- **Real-time Chat Monitoring**: Live view of all conversations with activity indicators
- **Comprehensive Statistics**: Total chats, active sessions, escalations, and follow-ups
- **User Activity Tracking**: Online/offline status with connection counts
- **Follow-up Management**: Dedicated modal to review, filter, and update follow-up requests with status notes
- **Chat Intervention**: Direct message sending with admin identification
- **Message History**: Complete conversation view including admin interventions
- **User Grouping**: Organized chat display by user sessions
- **Advanced Analytics**: Message counts including admin responses

### Technical Features

- **OpenAI Integration**: Powered by GPT-3.5-turbo for intelligent responses
- **Prisma ORM**: Type-safe database operations with SQLite
- **Socket.IO**: Real-time bidirectional communication
- **TypeScript**: 100% type safety throughout the application
- **Modern UI**: Built with Tailwind CSS and Lucide icons
- **Activity Tracking**: User online status and connection monitoring
- **Follow-up Persistence**: Prisma-managed `follow_ups` table with full lifecycle tracking (pending → contacted → completed/cancelled)

## 🏗️ Architecture & Design Decisions

### Tech Stack

- **Frontend**: Next.js 15 with React 18 and TypeScript
- **Backend**: Custom Node.js server with Socket.IO integration
- **Database**: SQLite3 with Prisma ORM for type-safe operations
- **Real-time**: Socket.IO for bidirectional communication
- **AI**: OpenAI GPT-3.5-turbo API
- **Styling**: Tailwind CSS for utility-first styling
- **Icons**: Lucide React for consistent iconography
- **Type Safety**: 100% TypeScript with strict mode enabled

### Key Design Decisions

1. **Prisma + SQLite**: Prisma ORM provides type-safe database operations while SQLite ensures easy deployment without complex setup.

2. **Custom Server Architecture**: Hybrid Next.js + Socket.IO server enables both SSR/API routes and real-time communication.

3. **Real-time First**: Socket.IO integration provides instant message delivery and live admin monitoring.

4. **Type-Safe Everything**: 100% TypeScript coverage with Prisma-generated types and strict type checking.

5. **Activity Tracking**: Comprehensive user online/offline status with connection counting for accurate presence detection.

6. **Admin-Centric Design**: Chat interface optimized for admin perspective with proper message alignment and intervention capabilities.

7. **Modular Architecture**: Clean separation between chat interface, admin dashboard, and real-time server components.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (recommended: 20+)
- npm or yarn
- OpenAI API key

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd havana-technical-test
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your configuration:

   ```env
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key_here

   # Database Configuration
   DATABASE_URL="file:./prisma/dev.db"

   # Application Configuration
   NEXT_PUBLIC_SCHOOL_NAME="Stanford University"
   PORT=3000
   ```

4. **Initialize the database**

   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run database migrations
   npx prisma migrate dev --name init
   ```

5. **Start the development server**

   ```bash
   # Start the custom server with Socket.IO
   npm run dev
   ```

6. **Open your browser**
   - **Student Chat**: [http://localhost:3000](http://localhost:3000)
   - **Admin Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin)

## 📖 Usage Guide

### For Students

1. Visit the main page at `http://localhost:3000`
2. Start chatting with the admissions bot
3. Ask questions about programs, admissions, campus life, etc.
4. Use the quick-action buttons to escalate to a human advisor or schedule a follow-up call on demand
5. Book follow-up calls by providing your contact information when prompted

### For Administrators

1. Access the admin dashboard at `http://localhost:3000/admin`
2. **Dashboard Overview**: View comprehensive statistics including:
   - Total chats and active sessions
   - Escalated conversations and follow-up requests
   - Unique users and online activity
3. **Real-time Monitoring**: See live user activity with online/offline indicators
4. **Chat Management**: Click "View Details" on any chat to:
   - View complete conversation history
   - See both student and admin messages
   - Send real-time interventions
   - Review manual follow-up submissions and escalation history
5. **Follow-up Operations**: Open the Follow-up modal to filter requests by chat or view all pending items, update statuses, and add notes
6. **Message Intervention**: Send messages that appear instantly to students
7. **Activity Tracking**: Monitor user connections and session activity

## 🗄️ Database Schema

The application uses Prisma ORM with SQLite and includes three main tables with enhanced activity tracking:

### `chats` (Enhanced)

- `id`: Unique chat identifier (cuid)
- `createdAt`: Timestamp of chat creation
- `updatedAt`: Last update timestamp (auto-managed)
- `status`: Chat status (active, closed, escalated)
- `escalatedToHuman`: Boolean flag for human escalation
- `followUpRequested`: Boolean flag for follow-up requests
- `studentName`: Optional student name
- `studentEmail`: Optional student email
- `sessionEmail`: Session-based email for user tracking
- `isActive`: Boolean flag for active chats
- **`userOnline`**: Real-time online status tracking
- **`lastActivity`**: Timestamp of last user activity
- **`connectionCount`**: Number of active connections

### `messages`

- `id`: Unique message identifier (cuid)
- `chatId`: Reference to parent chat (foreign key)
- `content`: Message text content
- `sender`: Message sender (user, bot, admin)
- `timestamp`: Message timestamp (auto-generated)
- `messageType`: Type of message (text, system, escalation, follow_up)

### `admin_interventions`

- `id`: Unique intervention identifier (cuid)
- `chatId`: Reference to parent chat (foreign key)
- `adminMessage`: Admin message content
- `timestamp`: Intervention timestamp (auto-generated)

### `follow_ups`

- `id`: Unique follow-up identifier (cuid)
- `chatId`: Reference to parent chat (foreign key)
- `studentName`: Name provided during follow-up request
- `studentEmail`: Contact email for scheduling
- `requestedAt`: Timestamp when follow-up was requested
- `status`: Lifecycle status (`pending`, `contacted`, `completed`, `cancelled`)
- `notes`: Optional admin notes
- `contactedAt`: Timestamp when contact was initiated
- `completedAt`: Timestamp when follow-up was completed

### Database Features

- **Type Safety**: Full Prisma type generation for all operations
- **Relationships**: Proper foreign key constraints and cascading deletes
- **Indexing**: Optimized queries with indexes on `sessionEmail` and `userOnline`
- **Activity Tracking**: Real-time user presence and connection monitoring

## 🤖 AI Integration

The chatbot uses OpenAI's GPT-3.5-turbo model with a carefully crafted system prompt that:

- Provides information about the university
- Maintains a helpful and professional tone
- Identifies when to escalate to human advisors
- Offers to schedule follow-up calls when appropriate
- Handles edge cases gracefully

### Escalation Logic

The system automatically detects when to escalate based on:

- Complex or sensitive questions
- Requests for personalized advice
- Technical application issues
- Direct requests to speak with a human

## 🔧 API Endpoints

### Chat API

- `POST /api/chat` - Send message and get bot response
- `GET /api/chat/messages?chatId=<id>` - Retrieve chat messages (including admin interventions)
- `POST /api/chat/escalate` - Escalate chat to human
- `POST /api/chat/follow-up` - Request follow-up call
- `GET /api/chat/follow-ups?chatId=<id>` - Retrieve follow-up history for a specific chat

### Admin API

- `GET /api/admin/chats` - Get all chats with comprehensive statistics
- `POST /api/admin/intervention` - Send admin message with real-time delivery
- `GET /api/admin/follow-ups` - Retrieve paginated list of follow-up requests with chat context
- `PUT /api/admin/follow-ups` - Update follow-up status and notes

### Session API

- `POST /api/session` - Manage user sessions and chat retrieval

### Real-time Events (Socket.IO)

- `join-chat` - Join a chat room for real-time updates
- `leave-chat` - Leave a chat room
- `join-admin` - Join admin room for monitoring
- `send-message` - Send real-time message
- `admin-intervention` - Send admin intervention
- `user-activity-changed` - Broadcast user online/offline status

## 🚀 Deployment

### Production Environment Setup

1. **Environment Variables**:

   ```env
   OPENAI_API_KEY=your_production_openai_key
   DATABASE_URL="file:./prisma/production.db"
   NEXT_PUBLIC_SCHOOL_NAME="Your University Name"
   PORT=3000
   NODE_ENV=production
   ```

2. **Database Setup**:

   ```bash
   # Generate Prisma client for production
   npx prisma generate

   # Run migrations
   npx prisma migrate deploy
   ```

### Deployment Options

#### Option 1: Traditional Node.js Hosting

**Requirements**: Custom server support for Socket.IO

- Railway, Render, DigitalOcean App Platform
- Heroku (with custom buildpack)
- VPS with Node.js

**Steps**:

1. Push code to your hosting platform
2. Set environment variables
3. Run build command: `npm run build`
4. Start command: `npm start` (uses custom server)

#### Option 2: Vercel (Limited)

**Note**: Vercel doesn't support custom servers, so Socket.IO features will be disabled

1. Push your code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy (real-time features will fallback to polling)

### Production Considerations

- **Database**: Consider PostgreSQL for production scale
- **File Storage**: SQLite requires persistent file system
- **Real-time**: Ensure hosting platform supports WebSocket connections
- **Scaling**: Consider Redis for Socket.IO scaling across multiple instances

## 🧪 Testing the Application

### Manual Testing Scenarios

1. **Basic Chat Flow**

   - Ask simple questions about the university
   - Verify bot responses are relevant and helpful
   - Test session persistence across page refreshes

2. **Real-time Features**

   - Open chat in one tab, admin dashboard in another
   - Send messages and verify real-time delivery
   - Test online/offline status indicators
   - Verify connection counting accuracy

3. **Escalation Testing**

   - Ask complex questions that should trigger escalation
   - Verify escalation modal appears automatically
   - Use manual "Talk to Human Now" button to confirm manual flow
   - Test escalation process and admin notification

4. **Follow-up Testing**

   - Request information about scheduling a call
   - Verify follow-up modal appears automatically
   - Use manual "Request Follow-up" button to confirm manual flow
   - Test contact information submission and admin visibility

5. **Admin Dashboard**

   - Verify all chats appear with correct statistics
   - Test real-time admin intervention
   - Check message count accuracy (including admin messages)
   - Verify user activity tracking
   - Test chat detail modal functionality

6. **Multi-user Testing**
   - Open multiple chat sessions
   - Verify proper user separation and session management
   - Test concurrent admin interventions

## 📝 Development Notes

### Implementation Highlights

This production-ready application features:

- **100% TypeScript**: Complete type safety with Prisma-generated types
- **Real-time Architecture**: Custom Node.js server with Socket.IO integration
- **Advanced Admin Features**: Live monitoring, intervention capabilities, and activity tracking
- **Scalable Database Design**: Prisma ORM with comprehensive relationship management
- **Modern UI/UX**: Responsive design with real-time status indicators

### Technical Achievements

- **Type-Safe Database Operations**: Eliminated all `any` usage with proper Prisma types
- **Real-time Communication**: Bidirectional Socket.IO integration for instant messaging
- **Activity Tracking**: Comprehensive user presence detection with connection counting
- **Admin-Optimized Interface**: Chat layout designed from administrator perspective
- **Session Management**: Persistent chat sessions with proper user identification

### Architecture Benefits

- **Maintainable**: Clean separation of concerns with modular components
- **Scalable**: Designed for easy horizontal scaling with Redis support
- **Type-Safe**: 100% TypeScript coverage prevents runtime errors
- **Real-time**: Instant message delivery and live admin monitoring
- **Production-Ready**: Comprehensive error handling and edge case management

### Future Enhancements

Potential improvements for enterprise use:

- **Authentication**: User login system with role-based access
- **Analytics**: Advanced reporting and conversation analytics
- **Multi-language**: Internationalization support
- **CRM Integration**: Connect with existing customer management systems
- **AI Improvements**: Fine-tuned models for specific university contexts
- **Mobile App**: React Native companion application
- **Testing Suite**: Automated testing with Jest and Playwright

## 🐛 Troubleshooting

### Common Issues

1. **Prisma Generation Errors**

   ```bash
   # If you encounter WebAssembly errors
   node --experimental-wasm-reftypes node_modules/.bin/prisma generate

   # Or try regenerating the client
   npx prisma generate --force
   ```

2. **Database Migration Issues**

   ```bash
   # Reset database if needed
   npx prisma migrate reset

   # Apply migrations manually
   npx prisma migrate deploy
   ```

3. **Socket.IO Connection Issues**

   - Verify the custom server is running (not Next.js dev server)
   - Check browser console for WebSocket connection errors
   - Ensure port 3000 is not blocked by firewall

4. **TypeScript Errors**

   - Run `npx prisma generate` after schema changes
   - Clear `.next` folder and restart development server
   - Ensure all dependencies are properly installed

5. **OpenAI API Errors**

   - Verify your API key is correct and has sufficient credits
   - Check network connectivity and API rate limits

6. **Build Errors**
   - Ensure Node.js version is 18 or higher
   - Clear `node_modules` and reinstall dependencies
   - Check that all environment variables are set

### Development Tips

- Use `npm run dev` to start the custom server with Socket.IO
- Monitor browser console and server logs for real-time debugging
- Use Prisma Studio (`npx prisma studio`) to inspect database contents
- Test real-time features with multiple browser tabs/windows

### Support

For issues or questions:

1. Check browser console and server logs for detailed error messages
2. Verify all environment variables are properly configured
3. Ensure database migrations have been applied successfully

## 📄 License

This project is created for the Havana technical assessment and is not intended for commercial use.
