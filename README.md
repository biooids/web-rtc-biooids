# WebRTC Video Call Application with Authentication

A full-stack real-time video calling application built with Next.js, Express, WebRTC, and NextAuth.js. Features include multi-participant video calls, screen sharing, real-time chat, and a comprehensive authentication system with OAuth support.

## 🚀 Features

### Video Calling

- **Real-time video/audio communication** using WebRTC
- **Multiple participants** support with peer-to-peer connections
- **Screen sharing** capabilities
- **Multiple layout options**: Grid view, Featured speaker, Sidebar view
- **Participant controls**: Mute/unmute, video on/off
- **Host controls**: Force mute, request unmute, mute all participants
- **Real-time chat** during calls
- **Reaction animations** (hand raise, etc.)

### Authentication & Security

- **Email/password authentication** with secure password hashing
- **OAuth integration** (Google & GitHub)
- **JWT-based authentication** with access/refresh token rotation
- **Session management** with NextAuth.js
- **Protected routes** and API endpoints
- **Role-based access control** (User, Admin roles)

### User Management

- **User profiles** with customizable display names and avatars
- **Password change** functionality
- **Session revocation** (logout from all devices)
- **Account management** features

## 🛠️ Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Redux Toolkit** - State management
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components
- **React Hook Form + Zod** - Form handling and validation
- **NextAuth.js** - Authentication

### Backend

- **Express.js** - Node.js web framework
- **TypeScript** - Type safety
- **Prisma ORM** - Database management
- **PostgreSQL** - Database
- **WebSocket (ws)** - Real-time signaling
- **JWT** - Token-based authentication
- **Bcrypt** - Password hashing

## 📋 Prerequisites

- Node.js (v18 or higher)
- pnpm (v8 or higher)
- PostgreSQL database
- Google OAuth credentials (optional)
- GitHub OAuth credentials (optional)

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd web-rtc-start-auth
```

### 2. Install dependencies

The project uses pnpm for package management.

```bash
# Install dependencies for both client and server
cd client && pnpm install
cd ../server && pnpm install
```

### 3. Environment Setup

#### Client Environment Variables

Create a `.env.local` file in the `client` directory:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# Backend API URLs
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:5000/api
NEXT_PUBLIC_BACKEND_WEBSOCKET_URL=ws://localhost:5000

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

#### Server Environment Variables

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/webrtc_db

# JWT Secrets
JWT_ACCESS_SECRET=your-access-token-secret
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# Cookie Configuration
COOKIE_REFRESH_TOKEN_NAME=jid

# CORS
CLIENT_URL=http://localhost:3000

# Cloudinary (Optional - for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 4. Database Setup

```bash
cd server

# Generate Prisma client
pnpm prisma:generate

# Run database migrations
pnpm prisma:migrate

# (Optional) Open Prisma Studio to view/edit data
pnpm prisma:studio
```

### 5. Run the application

Open two terminal windows:

**Terminal 1 - Start the backend server:**

```bash
cd server
pnpm dev
```

**Terminal 2 - Start the frontend:**

```bash
cd client
pnpm dev
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- WebSocket: ws://localhost:5000

## 📁 Project Structure

```
web-rtc-start-auth/
├── client/                    # Next.js frontend
│   ├── src/
│   │   ├── app/              # Next.js app router pages
│   │   ├── components/       # React components
│   │   ├── lib/             # Utilities, hooks, and Redux store
│   │   └── types/           # TypeScript type definitions
│   └── public/              # Static assets
│
└── server/                   # Express backend
    ├── src/
    │   ├── features/        # Feature modules (auth, user, etc.)
    │   ├── middleware/      # Express middleware
    │   ├── config/          # Configuration files
    │   ├── db/              # Database connection
    │   └── utils/           # Utility functions
    └── prisma/              # Prisma schema and migrations
```

## 🔒 Security Features

- **Password Security**: Bcrypt hashing with salt rounds
- **Token Security**: Separate secrets for access and refresh tokens
- **Cookie Security**: HttpOnly, Secure, SameSite cookies for refresh tokens
- **Session Management**: Token rotation and revocation capabilities
- **Input Validation**: Zod schemas for all user inputs
- **Rate Limiting**: Protection against brute force attacks
- **CORS Configuration**: Restricted to allowed origins

## 🧪 Testing

```bash
# Run server tests
cd server
pnpm test

# Run client tests (if configured)
cd client
pnpm test
```

## 📦 Building for Production

### Frontend Build

```bash
cd client
pnpm build
pnpm start
```

### Backend Build

```bash
cd server
pnpm build
pnpm start
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/oauth` - OAuth user handling

### User Endpoints

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/change-password` - Change password

### WebRTC Signaling

- WebSocket connection at `ws://localhost:5000?roomId={roomId}&displayName={displayName}`

## 🎯 Future Enhancements

- [ ] Recording functionality
- [ ] Virtual backgrounds
- [ ] File sharing during calls
- [ ] Persistent chat history
- [ ] Meeting scheduling
- [ ] Email notifications
- [ ] Mobile app support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - _Initial work_

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting solutions
- All contributors who helped shape this project
