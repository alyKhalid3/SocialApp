SocialApp
License: MIT Node.js Version TypeScript MongoDB Build Status <!-- Add if you have GitHub Actions -->

SocialApp is a comprehensive, scalable social media backend application built with TypeScript, Node.js, and Express.js. It serves as a robust foundation for modern social platforms, offering features like secure authentication, real-time messaging, content sharing, user interactions, and cloud-based file storage. Designed with modularity and extensibility in mind, it supports both RESTful APIs and basic GraphQL integration, making it ideal for building full-fledged social apps, prototypes, or learning projects.

This project demonstrates best practices in backend development, including clean architecture, data validation, real-time communication, and cloud integration. It's perfect for developers looking to understand or build upon a social media stack.

Repository: https://github.com/alyKhalid3/SocialApp
Live Demo: [Add link if deployed, e.g., via Heroku or Vercel]
Documentation: [API Docs Link, e.g., via Swagger if set up]

Table of Contents
Features
Tech Stack
Architecture Overview
Database Schema
Project Structure
Getting Started
API Endpoints
Socket.IO Events
Deployment
Testing
Contributing
License
Acknowledgments
Features
SocialApp provides a full suite of social media functionalities, emphasizing security, performance, and user experience. Here's a deeper dive into each feature:

Authentication: Implements JWT-based session management with access and refresh tokens for stateless authentication. Includes email verification via Nodemailer, password reset workflows, and Two-Factor Authentication (2FA) using TOTP (Time-based One-Time Passwords). Passwords are hashed with Bcrypt for security. This ensures compliance with modern security standards (e.g., OWASP guidelines).

Real-Time Chat: Powered by Socket.IO for low-latency communication. Supports one-on-one chats and group rooms with message persistence in MongoDB. Features include typing indicators, message read receipts, and room-based broadcasting. Ideal for real-time interactions in social apps like messaging platforms.

Social Posts: Users can create, edit, delete, and share posts with text, images/videos (uploaded to AWS S3), and privacy settings (public, friends-only, private). Posts support rich media and are optimized for scalability with pagination.

Engagement: Enables liking posts and adding threaded comments/replies. Comments are nested for discussion threads, promoting community interaction. Includes real-time notifications for likes and replies.

Friendship System: Manages friend requests (send, accept, decline), unfriending, and user blocking. Uses a graph-based model in MongoDB for efficient relationship queries, preventing spam and ensuring privacy.

File Uploads: Handles secure file uploads (e.g., profile pics, post attachments) using Multer for parsing and AWS S3 for storage. Supports image resizing/compression via Sharp (if integrated) and generates signed URLs for access control.

Modular Architecture: Organized into independent modules (e.g., Auth, Post, User) with dependency injection, making it easy to add new features like notifications or analytics without disrupting existing code.

Validation: Uses Zod for schema-based validation, ensuring type safety and preventing invalid data from reaching the database. This reduces bugs and improves API reliability.

Database: Leverages MongoDB with Mongoose for schema flexibility and scalability. Employs a repository pattern for abstracted database operations, supporting easy switching to other databases if needed.

Additional highlights:

GraphQL Support: Basic setup for flexible queries (e.g., fetching user posts with friends), complementing REST APIs.
Error Handling: Centralized error management with custom error classes and logging via Winston (if added).
Performance: Includes caching (e.g., Redis for sessions if extended) and rate limiting to handle high traffic.
Tech Stack
The tech stack is chosen for its maturity, performance, and ecosystem support:

Backend: Node.js (v18+), Express.js (v4.18+), TypeScript (v5.0+) – For scalable, type-safe server-side development.
Real-Time Communication: Socket.IO (v4.7+) – For WebSocket-based real-time features.
Database: MongoDB (v7.0+) with Mongoose (v8.0+) – For NoSQL flexibility and schema validation.
Authentication: JWT (jsonwebtoken v9.0+), Bcrypt (v5.1+) – For secure token management and hashing.
File Storage: AWS S3 (aws-sdk v3), Multer (v1.4+) – For reliable cloud storage and upload handling.
Validation: Zod (v3.22+) – For runtime type checking and schema validation.
API: REST (primary), GraphQL (graphql v16.8+ with Apollo Server for basic queries).
Other Tools: Nodemailer (v6.9+) for emails, dotenv for environment management, and optional integrations like Sharp for image processing.
Frontend Client: Simple HTML/CSS/JS demo in SOCKET_CHAT_APP for chat testing (uses Socket.IO client).
Architecture Overview
SocialApp follows a layered, modular architecture inspired by Clean Architecture principles:

Presentation Layer: Express routes and Socket.IO handlers handle HTTP/WebSocket requests, delegating to controllers.
Application Layer: Controllers and services orchestrate business logic, using repositories for data access.
Domain Layer: Core entities (e.g., User, Post) and business rules, validated with Zod schemas.
Infrastructure Layer: Database connections (Mongoose), external services (AWS S3, Nodemailer), and utilities (JWT helpers).
Key patterns:

Repository Pattern: Abstracts database operations for testability.
Middleware: Handles authentication, validation, and error handling.
Event-Driven: Socket.IO for real-time events; could extend to message queues (e.g., RabbitMQ) for async tasks.
Architecture Diagram <!-- Replace with an actual image in your repo, e.g., docs/architecture.png -->

This design ensures separation of concerns, making the app maintainable and scalable for features like microservices migration.

Database Schema
SocialApp uses MongoDB with the following key collections (simplified schemas):

Users: { _id, email, username, passwordHash, profilePicUrl, friends: [userId], blocked: [userId], isVerified, twoFactorSecret }
Posts: { _id, authorId, content, attachments: [s3Url], privacy, likes: [userId], createdAt }
Comments: { _id, postId, authorId, content, parentId (for replies), createdAt }
Chats: { _id, participants: [userId], messages: [{ senderId, content, timestamp }], isGroup }
FriendRequests: { _id, senderId, receiverId, status }
Relationships are managed via references, with indexes on frequently queried fields (e.g., authorId, createdAt) for performance.

Project Structure
The repository is organized into backend and frontend demo components:


Copy code
.
├── SOCKET_CHAT_APP/          # Simple frontend client for chat demo
│   ├── chat.html             # Chat interface
│   ├── index.html            # Login page
│   └── js/                   # Client-side scripts (Socket.IO integration)
├── src/                      # Backend TypeScript source code
│   ├── DB/                   # Database setup (connection, models, repositories)
│   │   ├── models/           # Mongoose schemas (e.g., User.ts, Post.ts)
│   │   └── repositories/     # Data access layers (e.g., UserRepository.ts)
│   ├── middleware/           # Express middleware (auth.ts, validation.ts)
│   ├── modules/              # Feature modules
│   │   ├── auth/             # Auth logic (controllers, services)
│   │   ├── chat/             # Chat handlers
│   │   ├── post/             # Post management
│   │   ├── user/             # User profiles and friends
│   │   └── comment/          # Comment threads
│   ├── utils/                # Shared utilities (JWT helpers, S3 uploader, error handlers)
│   ├── bootstrap.ts          # Server and Socket.IO setup
│   ├── index.ts              # Entry point (app initialization)
│   └── routes.ts             # Main router aggregating API routes
├── docs/                     # Additional docs (e.g., API specs, deployment guides) - Add if needed
├── tests/                    # Unit/integration tests (e.g., using Jest)
├── package.json
├── tsconfig.json
└── .env.example              # Template for environment variables
Getting Started
Prerequisites
Node.js (v18 or higher) – Download here
npm (comes with Node.js)
MongoDB (local or cloud, e.g., MongoDB Atlas) – Setup guide
AWS S3 Bucket and IAM credentials – AWS Console
Git for cloning
Installation & Setup
Clone the repository:

bash

Copy code
git clone https://github.com/alyKhalid3/SocialApp.git
cd SocialApp
Install backend dependencies:

bash

Copy code
npm install
Set up environment variables: Copy .env.example to src/config/.env and fill in your credentials:

env

Copy code
# Server
PORT=3000

# Database
MONGO_URL=mongodb://localhost:27017/socialapp

# JWT
BEARER=Bearer
ACCESS_SIGNATURE=your_secure_access_secret_here
REFRESH_SIGNATURE=your_secure_refresh_secret_here

# Bcrypt
SALT=10

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
BUCKET_NAME=your_bucket_name

# Nodemailer
HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL=your_email@gmail.com
PASSWORD=your_app_password  # Use app password for Gmail
USERNAME=your_username
Security Note: Never commit .env to Git. Use secrets in production.

Compile TypeScript:

bash

Copy code
npm run build  # Or `tsc` directly
Run the server:

bash

Copy code
npm run start:dev  # Uses nodemon for hot reload
The app will run at http://localhost:3000. Check logs for connection status.

Running the Frontend Chat Client
Navigate to the demo client:
bash

Copy code
cd SOCKET_CHAT_APP
npm install
Open index.html in a browser. Log in with API-created credentials to test chat. It connects to http://localhost:3000.
Troubleshooting
MongoDB Connection Issues: Ensure MongoDB is running locally or update MONGO_URL for Atlas.
AWS Errors: Verify IAM permissions for S3 (e.g., PutObject, GetObject).
Email Not Sending: Check Gmail app passwords or use a service like SendGrid.
Port Conflicts: Change PORT if 3000 is in use.
API Endpoints
The API follows REST conventions with JSON responses. Base URL: http://localhost:3000/api/v1. Use tools like Postman or Insomnia for testing. Authentication requires Authorization: Bearer <access_token>.

Authentication (/auth)
POST /signup – Register user. Body: { email, username, password }. Response: { user, token }.
POST /login – Login. Body: { email, password }. Response: { accessToken, refreshToken }.
POST /verify-email – Confirm email. Body: { token }.
POST /reset-password – Request reset. Body: { email }.
POST /2fa/enable – Enable 2FA. Requires auth.
User Management (/user)
GET /profile – Get current user profile. Response: { user }.
PUT /profile – Update profile. Body: { username, profilePic }.
POST /friend-request – Send friend request. Body: { receiverId }.
PUT /friend-request/:id/accept – Accept request.
DELETE /block/:userId – Block user.
Posts (/post)
GET / – Fetch posts (paginated). Query: ?page=1&limit=10&privacy=public.
POST / – Create post. Body: { content, attachments, privacy }.
PUT /:id – Update post.
DELETE /:id – Delete post.
POST /:id/like – Like/unlike post.
Comments (/comment)
GET /post/:postId – Get comments for post.
POST / – Add comment. Body: { postId, content, parentId }.
Chat (/chat)
GET / – Get user's chats.
POST /group – Create group chat. Body: { name, participants }.
Example Request (Create Post):

bash

Copy code
curl -X POST http://localhost:3000/api/v1/post \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello World!", "privacy": "public"}'
Response: { "post": { "_id": "...", "content": "Hello World!", ... } }

For full API specs, see docs/api.md or integrate Swagger.

Socket.IO Events
Real-time chat uses Socket.IO. Connect to http://localhost:3000 with auth token.

sendMessage: Client emits { receiverId, message } for one-on-one.
sendGroupMessage: Client emits { roomId, message } for groups.
join_room: Client emits { roomId } to join group.
newMessage: Server broadcasts { senderId, message, timestamp } to participants.
successMessage: Server confirms to sender { status: "sent" }.
custom_error: Server emits { error: "Validation failed" } on issues.
Example Client Code:

javascript
3 lines
Copy code
Download code
Click to expand
const socket = io('http://localhost:3000', { auth: { token } });
socket.emit('sendMessage', { receiverId: 'user123', message: 'Hi!' });
...
Deployment
Build for Production: npm run build.
Environment: Use production .env with secure secrets.
Hosting: Deploy to Heroku, AWS EC2, or Vercel. Example Heroku:
bash

Copy code
heroku create your-app-name
git push heroku main
Database: Use MongoDB Atlas for cloud DB.
Scaling: Add load balancers and Redis for sessions.
Testing
Run tests with Jest:

bash

Copy code
npm test  # Unit tests for modules
npm run test:integration  # API integration tests
Coverage: npm run test:coverage. Focus on auth, chat, and post modules.

Contributing
We welcome contributions! See CONTRIBUTING.md for guidelines.

Fork the repo.
Create a feature branch: git checkout -b feature/new-feature.
Commit changes: git commit -m "Add new feature".
Push and open a PR.
License
This project is licensed under the MIT License – see LICENSE for details.

Acknowledgments
Inspired by platforms like Facebook and Discord.
Thanks to the open-source community for libraries like Express, Socket.IO, and Mongoose.
Special thanks to contributors and testers.
