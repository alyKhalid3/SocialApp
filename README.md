# SocialApp


SocialApp is a comprehensive social media backend application built with TypeScript, Node.js, and Express. It provides a robust foundation for a social platform, including features like user authentication, real-time chat, posts, comments, a friend system, and file uploads to AWS S3.

## Features

*   **Authentication**: Secure user sign-up, login, and session management using JSON Web Tokens (JWT). Includes email confirmation, password reset, and Two-Factor Authentication (2FA).
*   **Real-Time Chat**: One-on-one and group chat functionality powered by Socket.IO. Users can join rooms and exchange messages in real-time.
*   **Social Posts**: Users can create, update, and delete posts. Posts can have content, attachments, and configurable privacy (public, private, friends-only).
*   **Engagement**: Users can like posts and add comments. Comments can also be replied to, creating nested threads.
*   **Friendship System**: Functionality to send, accept, or decline friend requests, as well as unfriend or block other users.
*   **File Uploads**: Seamlessly handles file uploads (profile pictures, post attachments) using Multer and streams them to an AWS S3 bucket.
*   **Modular Architecture**: The codebase is organized into modules (Auth, Post, User, Chat, Comment), making it easy to maintain and extend.
*   **Validation**: Robust incoming data validation using Zod to ensure data integrity.
*   **Database**: Uses MongoDB with Mongoose for flexible and scalable data storage, employing a repository pattern for clean database interactions.

## Tech Stack

*   **Backend**: Node.js, Express.js, TypeScript
*   **Real-time Communication**: Socket.IO
*   **Database**: MongoDB with Mongoose
*   **Authentication**: JWT (JSON Web Tokens), Bcrypt
*   **File Storage**: AWS S3, Multer
*   **Validation**: Zod
*   **API**: REST, GraphQL (basic setup)
*   **Frontend Client**: A simple HTML/CSS/JS client is included in the `SOCKET_CHAT_APP` directory for demonstrating the chat functionality.

## Project Structure

The repository is organized into two main parts: the backend server and a simple frontend client for the chat.

```
.
├── SOCKET_CHAT_APP/    # Simple frontend client for chat demo
│   ├── chat.html
│   ├── index.html
│   └── js/
├── src/                # Backend TypeScript source code
│   ├── DB/             # Database connection, models, and repositories
│   ├── middleware/     # Express middleware (auth, validation)
│   ├── modules/        # Core feature modules (auth, chat, post, user, etc.)
│   ├── utils/          # Utility functions (error handling, JWT, S3 services)
│   ├── bootstrap.ts    # Application server and Socket.IO initialization
│   ├── index.ts        # Main entry point
│   └── routes.ts       # Main API router
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites

*   Node.js (v18 or higher)
*   npm
*   MongoDB instance
*   AWS S3 Bucket and Credentials

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/alyKhalid3/SocialApp.git
    cd SocialApp
    ```

2.  **Install backend dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the `src/config/` directory and populate it with the necessary credentials.

    ```env
    # Server
    PORT=3000

    # Database
    MONGO_URL=mongodb://localhost:27017/socialapp

    # JWT
    BEARER=Bearer
    ACCESS_SIGNATURE=<your_jwt_access_secret>
    REFRESH_SIGNATURE=<your_jwt_refresh_secret>

    # Bcrypt
    SALT=10

    # AWS S3
    AWS_REGION=<your_aws_region>
    AWS_ACCESS_KEY_ID=<your_aws_access_key>
    AWS_SECRET_ACCESS_KEY=<your_aws_secret_key>
    BUCKET_NAME=<your_s3_bucket_name>

    # Nodemailer (for sending emails)
    HOST=smtp.gmail.com
    EMAIL_PORT=587
    EMAIL=<your_email_address>
    PASSWORD=<your_email_password_or_app_password>
    USERNAME=<your_email_username>
    ```

4.  **Compile TypeScript:**
    ```bash
    tsc
    ```

5.  **Run the server:**
    The server will start, and the application will be running on `http://localhost:3000`.
    ```bash
    npm run start:dev
    ```

### Running the Frontend Chat Client

The `SOCKET_CHAT_APP` directory contains a simple client to test the chat functionality.

1.  Navigate to the directory and install its dependencies:
    ```bash
    cd SOCKET_CHAT_APP
    npm install
    ```
2.  Open `index.html` in your browser. You can log in with a user created via the API to start chatting. The client is pre-configured to connect to the backend at `http://localhost:3000`.

## API Endpoints

The API is structured around RESTful principles. Below are the primary base routes:

*   `/api/v1/auth`: User authentication (signup, login, password management, 2FA).
*   `/api/v1/user`: User profile management, friend requests, and blocking.
*   `/api/v1/post`: Creating, reading, updating, deleting, and liking posts.
*   `/api/v1/comment`: Creating comments and replies on posts.
*   `/api/v1/chat`: Managing and retrieving one-on-one and group chats.

## Socket.IO Events

The real-time chat is handled via the following Socket.IO events:

*   `sendMessage`: Emitted by a client to send a one-on-one message.
*   `sendGroupMessage`: Emitted by a client to send a message to a group.
*   `join_room`: Emitted by a client to join a specific group chat room.
*   `newMessage`: Broadcasted by the server to relevant clients when a new message is received.
*   `successMessage`: Emitted back to the sender as confirmation.
*   `custom_error`: Emitted by the server if a validation or operational error occurs.
