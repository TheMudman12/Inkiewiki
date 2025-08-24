# Overview

This is a BlogWiki application built with a full-stack TypeScript architecture. The application allows users to create, edit, and manage blog posts and wiki-style content with rich text editing capabilities. It features a modern interface with sidebar navigation, categorization, search functionality, and file upload support for images.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development
- **Routing**: Wouter for client-side routing with three main routes (home, editor, 404)
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **Rich Text Editing**: React Quill for WYSIWYG content editing with toolbar features

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **API Design**: RESTful API with CRUD operations for posts
- **File Handling**: Multer middleware for image uploads with 5MB limit and image type validation
- **Development**: Vite integration for hot module replacement in development mode
- **Error Handling**: Centralized error middleware with proper HTTP status codes

## Data Storage
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema**: Two main entities - users and posts with proper relationships
- **Migrations**: Drizzle Kit for database schema management
- **Connection**: Neon Database serverless PostgreSQL adapter
- **Development Storage**: In-memory storage implementation for development/testing

## Authentication & Authorization
- **Session Management**: PostgreSQL session store using connect-pg-simple
- **User Schema**: Username/password based authentication system
- **Authorization**: Role-based access with author attribution for posts

## External Dependencies

### Database & ORM
- **Neon Database**: Serverless PostgreSQL hosting (@neondatabase/serverless)
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL dialect
- **Session Store**: connect-pg-simple for PostgreSQL session management

### UI & Styling
- **Component Library**: Extensive Radix UI ecosystem for accessible components
- **Styling**: Tailwind CSS with class-variance-authority for component variants
- **Icons**: Lucide React for consistent iconography
- **Rich Text**: React Quill for content editing capabilities

### Development Tools
- **Build Tool**: Vite with React plugin and TypeScript support
- **Code Quality**: ESBuild for production builds
- **Development**: TSX for TypeScript execution and hot reloading
- **Replit Integration**: Custom plugins for development environment integration

### Utility Libraries
- **Form Handling**: React Hook Form with Hookform resolvers for validation
- **Date Handling**: date-fns for date formatting and manipulation
- **Validation**: Zod with Drizzle integration for schema validation
- **Carousel**: Embla Carousel for image/content carousels
- **File Processing**: Multer for multipart form data and file uploads