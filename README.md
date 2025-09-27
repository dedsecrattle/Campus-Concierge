# University Admissions Chatbot

A modern web-based chatbot application built for university admissions, allowing prospective students to get instant answers to their questions while providing administrators with comprehensive chat management capabilities.

## 🎯 Features

### Student Chat Interface
- **Interactive Chat**: Real-time conversation with an AI-powered admissions chatbot
- **Smart Escalation**: Automatic detection when human intervention is needed
- **Follow-up Scheduling**: Easy booking of calls with admissions counselors
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Admin Dashboard
- **Chat Overview**: Monitor all conversations with detailed statistics
- **Real-time Intervention**: Jump into conversations to provide human assistance
- **Student Management**: Track follow-up requests and contact information
- **Analytics**: View escalation rates, message counts, and activity patterns

### Technical Features
- **OpenAI Integration**: Powered by GPT-3.5-turbo for intelligent responses
- **SQLite Database**: Lightweight, file-based database for easy deployment
- **TypeScript**: Full type safety throughout the application
- **Modern UI**: Built with Tailwind CSS for a polished user experience

## 🏗️ Architecture & Design Decisions

### Tech Stack
- **Frontend**: Next.js 15 with React 18 and TypeScript
- **Styling**: Tailwind CSS for utility-first styling
- **Database**: SQLite3 for simplicity and portability
- **AI**: OpenAI GPT-3.5-turbo API
- **Icons**: Lucide React for consistent iconography

### Key Design Decisions

1. **SQLite Choice**: Selected for simplicity and ease of deployment. No complex database setup required.

2. **Next.js App Router**: Utilized the modern App Router for better performance and developer experience.

3. **Server-Side API Routes**: All database operations and OpenAI calls happen server-side for security.

4. **Modular Components**: Clean separation between chat interface and admin dashboard.

5. **Type Safety**: Comprehensive TypeScript interfaces for all data structures.

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
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   DATABASE_PATH=./database.sqlite
   NEXT_PUBLIC_SCHOOL_NAME=Stanford University
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### For Students
1. Visit the main page at `http://localhost:3000`
2. Start chatting with the admissions bot
3. Ask questions about programs, admissions, campus life, etc.
4. If needed, request escalation to a human advisor
5. Book follow-up calls by providing your contact information

### For Administrators
1. Access the admin dashboard at `http://localhost:3000/admin`
2. View all chat conversations and statistics
3. Click "View Details" on any chat to see the full conversation
4. Send messages as an admin to intervene in conversations
5. Monitor escalated chats and follow-up requests

## 🗄️ Database Schema

The application uses three main tables:

### `chats`
- `id`: Unique chat identifier
- `created_at`: Timestamp of chat creation
- `status`: Chat status (active, closed, escalated)
- `escalated_to_human`: Boolean flag for human escalation
- `follow_up_requested`: Boolean flag for follow-up requests
- `student_name`: Optional student name
- `student_email`: Optional student email

### `messages`
- `id`: Unique message identifier
- `chat_id`: Reference to parent chat
- `content`: Message text content
- `sender`: Message sender (user, bot, admin)
- `timestamp`: Message timestamp
- `message_type`: Type of message (text, system, escalation, follow_up)

### `admin_interventions`
- `id`: Unique intervention identifier
- `chat_id`: Reference to parent chat
- `admin_message`: Admin message content
- `timestamp`: Intervention timestamp

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
- `GET /api/chat?chatId=<id>` - Retrieve chat messages
- `POST /api/chat/escalate` - Escalate chat to human
- `POST /api/chat/follow-up` - Request follow-up call

### Admin API
- `GET /api/admin/chats` - Get all chats with statistics
- `POST /api/admin/intervention` - Send admin message

## 🚀 Deployment

### Environment Setup
1. Set up your production environment variables
2. Ensure your OpenAI API key is properly configured
3. The SQLite database will be created automatically

### Vercel Deployment (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Alternative Deployment
The application can be deployed on any Node.js hosting platform that supports:
- Next.js applications
- File system access (for SQLite database)
- Environment variables

## 🧪 Testing the Application

### Manual Testing Scenarios

1. **Basic Chat Flow**
   - Ask simple questions about the university
   - Verify bot responses are relevant and helpful

2. **Escalation Testing**
   - Ask complex questions that should trigger escalation
   - Verify escalation modal appears
   - Test escalation process

3. **Follow-up Testing**
   - Request information about scheduling a call
   - Verify follow-up modal appears
   - Test contact information submission

4. **Admin Dashboard**
   - Verify all chats appear in the dashboard
   - Test admin intervention functionality
   - Check statistics accuracy

## 📝 Development Notes

### Time Investment
This project was completed in approximately 4 hours, focusing on:
- Core functionality implementation
- Clean, maintainable code structure
- Comprehensive documentation
- User experience optimization

### AI Usage
AI tools were used for:
- Code structure suggestions
- TypeScript interface definitions
- Tailwind CSS styling assistance
- Documentation writing support

### Future Enhancements
Potential improvements for production use:
- Real-time WebSocket connections for live chat
- User authentication and session management
- Advanced analytics and reporting
- Multi-language support
- Integration with CRM systems
- Automated testing suite

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Ensure the application has write permissions in the project directory
   - Check that SQLite3 is properly installed

2. **OpenAI API Errors**
   - Verify your API key is correct and has sufficient credits
   - Check network connectivity

3. **Build Errors**
   - Ensure Node.js version is 18 or higher
   - Clear node_modules and reinstall dependencies

### Support
For issues or questions, please check the console logs for detailed error messages.

## 📄 License

This project is created for the Havana technical assessment and is not intended for commercial use.
