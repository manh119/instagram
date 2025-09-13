# 🚀 Instagram Clone - Full-Stack Social Media Platform

<div align="center">

![Instagram Clone Demo](readme/demo.gif)

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.1.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://openjdk.java.net/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)
[![Redis](https://img.shields.io/badge/Redis-7-red.svg)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-blue.svg)](https://www.docker.com/)
[![WebSocket](https://img.shields.io/badge/WebSocket-Real--time-green.svg)](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

**A production-ready, scalable Instagram clone built with modern microservices architecture, real-time features, and enterprise-grade security.**

</div>

## 🎯 Project Overview

This is a comprehensive Instagram clone that demonstrates advanced full-stack development skills, microservices architecture, and modern DevOps practices. The platform includes all core Instagram features with additional enterprise-level capabilities like real-time notifications, automated engagement bots, and scalable cloud deployment.

### 🌟 Key Highlights

- **🏗️ Microservices Architecture**: Modular backend with clear separation of concerns
- **⚡ Real-time Features**: WebSocket-based notifications and live updates
- **🔐 Enterprise Security**: JWT authentication, OAuth2, and comprehensive authorization
- **📱 Modern Frontend**: React 18 with Chakra UI and responsive design
- **🤖 AI-Powered Bots**: Automated engagement and content creation
- **☁️ Cloud-Ready**: Docker containerization with production deployment configs
- **📊 Scalable Infrastructure**: Redis caching, RabbitMQ messaging, and MySQL optimization

## 🏛️ Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Infrastructure│
│   (React)       │◄──►│   (Spring Boot) │◄──►│   (Docker)      │
│                 │    │                 │    │                 │
│ • Chakra UI     │    │ • REST APIs     │    │ • MySQL 8.0     │
│ • WebSocket     │    │ • WebSocket     │    │ • Redis 7       │
│ • State Mgmt    │    │ • Security      │    │ • RabbitMQ      │
│ • PWA Ready     │    │ • Microservices │    │ • MinIO S3      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

#### Backend (Spring Boot 3.1.5)
- **Framework**: Spring Boot 3.1.5 with Java 17
- **Security**: Spring Security 6.2.0 with JWT & OAuth2
- **Database**: MySQL 8.0 with JPA/Hibernate
- **Caching**: Redis 7 with Spring Data Redis
- **Messaging**: RabbitMQ with STOMP WebSocket
- **Storage**: MinIO S3-compatible object storage
- **Documentation**: OpenAPI 3.0 (Swagger UI)
- **Monitoring**: Spring Actuator with health checks

#### Frontend (React 18)
- **Framework**: React 18 with Vite build tool
- **UI Library**: Chakra UI 2.8.1 with dark mode
- **State Management**: Zustand for global state
- **Routing**: React Router DOM 6.17.0
- **Real-time**: STOMP.js for WebSocket communication
- **Animations**: Framer Motion for smooth transitions
- **Deployment**: Vercel with SPA routing

#### DevOps & Infrastructure
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose for local & production
- **Reverse Proxy**: Nginx with SSL termination
- **CI/CD**: GitHub Actions ready
- **Monitoring**: Structured logging with request tracing
- **Security**: Environment-based configuration

## 🚀 Features

### 🔐 Authentication & Authorization
- **JWT-based Authentication** with refresh token rotation
- **OAuth2 Integration** (Google, Microsoft) with Spring Security
- **Role-based Access Control** (RBAC) with authorities
- **Secure Password Hashing** with BCrypt
- **Session Management** with Redis-backed sessions

### 📱 Core Social Features
- **User Profiles** with bio, profile pictures, and statistics
- **Post Creation** with image/video upload via pre-signed URLs
- **Feed System** with both dynamic and pre-computed algorithms
- **Like & Comment System** with real-time updates
- **Follow/Unfollow** functionality with follower management
- **Search & Discovery** with user search capabilities
- **Notifications** with real-time WebSocket delivery

### ⚡ Real-time Capabilities
- **WebSocket Integration** with STOMP protocol
- **Live Notifications** for likes, comments, and follows
- **Real-time Feed Updates** with push notifications
- **Message Broadcasting** via RabbitMQ STOMP relay
- **Connection Management** with authentication and session handling

### 🤖 AI & Automation
- **Engagement Bot** for automated likes and comments
- **Content Creation Bot** for automated post generation
- **Smart Comment Generation** with 100+ pre-defined responses
- **Automated User Interaction** with configurable intervals
- **Bot Account Management** with multiple account support

### 🏗️ Advanced Backend Features
- **Microservices Architecture** with clear service boundaries
- **RESTful API Design** with comprehensive error handling
- **Database Optimization** with JPA queries and indexing
- **Caching Strategy** with Redis for performance
- **Message Queue Integration** for async processing
- **File Upload System** with MinIO S3-compatible storage
- **Comprehensive Logging** with request tracing and correlation IDs

### 🎨 Frontend Features
- **Responsive Design** with mobile-first approach
- **Dark Mode Support** with system preference detection
- **Component Architecture** with reusable UI components
- **State Management** with Zustand for global state
- **Real-time Updates** with WebSocket integration
- **Image Optimization** with lazy loading and compression
- **PWA Capabilities** with offline support

## 📁 Project Structure

```
instagram/
├── be-instagram/                 # Backend (Spring Boot)
│   ├── src/main/java/com/engineerpro/example/redis/
│   │   ├── config/              # Configuration classes
│   │   ├── controller/          # REST & WebSocket controllers
│   │   ├── dto/                 # Data Transfer Objects
│   │   ├── model/               # JPA entities
│   │   ├── repository/          # Data access layer
│   │   ├── service/             # Business logic layer
│   │   ├── security/            # Security configuration
│   │   └── util/                # Utility classes
│   ├── docker-compose.dev.yml   # Development environment
│   ├── docker-compose.prod.yml  # Production environment
│   └── Dockerfile.prod          # Production Docker image
├── fe-instagram/                # Frontend (React)
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── hooks/               # Custom React hooks
│   │   ├── services/            # API service layer
│   │   ├── contexts/            # React contexts
│   │   ├── pages/               # Page components
│   │   └── utils/               # Utility functions
│   └── vercel.json              # Vercel deployment config
├── bot-instagram/               # Automation bots
│   ├── auto_like_comment_bot.py # Engagement automation
│   └── create_post_bot.py       # Content creation automation
└── readme/                      # Documentation assets
    └── demo.gif                 # Project demonstration
```

## 🛠️ Installation & Setup

### Prerequisites
- **Java 17+** for backend development
- **Node.js 18+** for frontend development
- **Docker & Docker Compose** for containerization
- **MySQL 8.0+** (or use Docker)
- **Redis 7+** (or use Docker)

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/instagram-clone.git
   cd instagram-clone
   ```

2. **Set up environment variables**
   ```bash
   # Copy environment template
   cp be-instagram/.env.example be-instagram/.env
   
   # Edit with your configuration
   nano be-instagram/.env
   ```

3. **Start the development environment**
   ```bash
   cd be-instagram
   docker-compose -f docker-compose.dev.yml up -d
   ```

4. **Start the frontend**
   ```bash
   cd fe-instagram
   npm install
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080
   - Swagger UI: http://localhost:8080/swagger-ui
   - RabbitMQ Management: http://localhost:15672

### Production Deployment

1. **Configure production environment**
   ```bash
   # Set production environment variables
   export SPRING_PROFILES_ACTIVE=prod
   export DB_PASSWORD=your_secure_password
   export REDIS_PASSWORD=your_redis_password
   # ... other production variables
   ```

2. **Deploy with Docker Compose**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Set up reverse proxy (Nginx)**
   ```bash
   # Configure SSL certificates
   # Update nginx/conf/app.conf
   # Restart nginx service
   ```

## 🔧 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/oauth2/authorization/google` - Google OAuth2

### Post Management
- `GET /api/posts/{id}` - Get single post
- `POST /api/posts` - Create new post
- `DELETE /api/posts/{id}` - Delete post
- `POST /api/posts/upload-url` - Get pre-signed upload URL
- `POST /api/posts/like/{id}` - Like/unlike post

### Feed System
- `GET /api/dynamic-feeds` - Dynamic feed algorithm
- `GET /api/precomputed-feeds` - Pre-computed feed algorithm
- `GET /api/feeds` - General feed endpoint

### User Management
- `GET /api/users/search` - Search users
- `GET /api/profiles/{id}` - Get user profile
- `PUT /api/profiles/{id}` - Update profile
- `POST /api/profiles/follow` - Follow user
- `POST /api/profiles/unfollow` - Unfollow user

### Real-time Features
- `WebSocket /api/ws` - WebSocket connection
- `GET /api/notifications` - Get notifications
- `POST /api/notifications/ack` - Acknowledge notification

## 🤖 Bot Automation

### Engagement Bot
```bash
cd bot-instagram
python auto_like_comment_bot.py
```

**Features:**
- Automated liking and commenting on posts
- 100+ pre-defined comment templates
- Configurable engagement intervals
- Multiple bot account support
- Smart post filtering (avoids own posts)

### Content Creation Bot
```bash
cd bot-instagram
python create_post_bot.py
```

**Features:**
- Automated post creation with random content
- Image generation and upload
- Scheduled posting capabilities
- Content variety with different post types

## 📊 Performance & Scalability

### Backend Optimizations
- **Database Indexing** on frequently queried columns
- **Redis Caching** for session management and frequently accessed data
- **Connection Pooling** with HikariCP for database connections
- **Lazy Loading** for JPA entities to reduce memory usage
- **Pagination** for large datasets (posts, comments, followers)

### Frontend Optimizations
- **Code Splitting** with React.lazy() for route-based splitting
- **Image Optimization** with lazy loading and WebP support
- **Bundle Optimization** with Vite's tree shaking
- **State Management** with Zustand for minimal re-renders
- **WebSocket Connection** pooling for real-time features

### Infrastructure Scalability
- **Horizontal Scaling** with Docker Swarm or Kubernetes
- **Load Balancing** with Nginx reverse proxy
- **Database Replication** with MySQL master-slave setup
- **Redis Cluster** for distributed caching
- **Message Queue Scaling** with RabbitMQ clustering

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens** with configurable expiration
- **Refresh Token Rotation** for enhanced security
- **OAuth2 Integration** with Google and Microsoft
- **Password Hashing** with BCrypt and salt rounds
- **Role-based Access Control** with Spring Security

### API Security
- **CORS Configuration** for cross-origin requests
- **Request Validation** with Bean Validation
- **SQL Injection Prevention** with JPA parameterized queries
- **XSS Protection** with input sanitization
- **Rate Limiting** (configurable per endpoint)

### Infrastructure Security
- **Environment Variables** for sensitive configuration
- **Docker Security** with non-root user execution
- **SSL/TLS Termination** with Nginx
- **Network Isolation** with Docker networks
- **Logging & Monitoring** for security events

## 🧪 Testing

### Backend Testing
```bash
cd be-instagram
./gradlew test
```

### Frontend Testing
```bash
cd fe-instagram
npm run test
```

### Integration Testing
```bash
# Start test environment
docker-compose -f docker-compose.dev.yml up -d

# Run integration tests
./gradlew integrationTest
```

## 📈 Monitoring & Logging

### Application Monitoring
- **Spring Actuator** endpoints for health checks
- **Structured Logging** with SLF4J and Logback
- **Request Tracing** with correlation IDs
- **Performance Metrics** with custom logging

### Infrastructure Monitoring
- **Docker Health Checks** for container monitoring
- **Nginx Access Logs** for request analysis
- **Database Query Logging** for performance optimization
- **Redis Monitoring** with Redis CLI

## 🚀 Deployment

### Development Environment
- **Docker Compose** for local development
- **Hot Reload** for both frontend and backend
- **Database Migrations** with Flyway
- **Environment Configuration** with .env files

### Production Environment
- **Multi-stage Docker Builds** for optimized images
- **Resource Limits** and health checks
- **SSL Certificate Management** with Let's Encrypt
- **Backup Strategies** for database and files
- **Zero-downtime Deployment** with rolling updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Spring Boot** team for the excellent framework
- **React** team for the powerful frontend library
- **Chakra UI** for the beautiful component library
- **Docker** team for containerization technology
- **Open source community** for inspiration and tools

## 📞 Contact

**Manh Nguyen** - [@yourusername](https://github.com/yourusername) - your.email@example.com

Project Link: [https://github.com/yourusername/instagram-clone](https://github.com/yourusername/instagram-clone)

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

Made with ❤️ by [Manh Pham](https://github.com/manh119)

</div>
