# Vendor Payment Management API

A professional REST API for managing vendors and payments, built with Node.js, Express, Prisma, and PostgreSQL.

## Features

- **Vendor Management**: Create, read, update, and delete vendors
- **Payment Processing**: Manage payments linked to vendors
- **Authentication**: JWT-based authentication with role-based access
- **Input Validation**: Comprehensive validation using express-validator
- **Error Handling**: Centralized error handling with detailed responses
- **Pagination**: Efficient pagination for large datasets
- **Search & Filtering**: Advanced search and filtering capabilities
- **Rate Limiting**: Protection against abuse
- **Security**: Helmet.js for security headers, CORS support

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd backend-trial-task
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your database credentials and JWT secret:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/vendor_payment_db?schema=public"
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=3000
   ```

4. **Set up the database**:
   ```bash
   # Generate Prisma client
   npm run generate
   
   # Run database migrations
   npm run migrate
   
   # Seed the database with sample data
   npm run seed
   ```

5. **Start the server**:
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Authentication Endpoints

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "USER"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /api/v1/auth/profile
Authorization: Bearer <token>
```

### Vendor Endpoints

#### Create Vendor
```http
POST /api/v1/vendors
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Tech Solutions Ltd",
  "email": "contact@techsolutions.com",
  "phone": "+1-555-0123",
  "address": "123 Tech Street, Silicon Valley, CA",
  "contactName": "John Smith",
  "status": "ACTIVE"
}
```

#### Get All Vendors
```http
GET /api/v1/vendors
Authorization: Bearer <token>

Query Parameters:
- page: Page number (default: 1)
- limit: Items per page (default: 10, max: 100)
- search: Search term for name, email, or contact name
- status: Filter by status (ACTIVE, INACTIVE, SUSPENDED)
```

#### Get Vendor by ID
```http
GET /api/v1/vendors/:id
Authorization: Bearer <token>
```

#### Update Vendor
```http
PUT /api/v1/vendors/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Vendor Name",
  "status": "INACTIVE"
}
```

#### Delete Vendor
```http
DELETE /api/v1/vendors/:id
Authorization: Bearer <token>
```

### Payment Endpoints

#### Create Payment
```http
POST /api/v1/payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 1500.00,
  "description": "Software licensing fees",
  "vendorId": "vendor-id-here",
  "dueDate": "2024-12-31T00:00:00Z",
  "status": "PENDING"
}
```

#### Get All Payments
```http
GET /api/v1/payments
Authorization: Bearer <token>

Query Parameters:
- page: Page number (default: 1)
- limit: Items per page (default: 10, max: 100)
- status: Filter by status (PENDING, PAID, OVERDUE, CANCELLED)
- vendorId: Filter by vendor ID
- sortBy: Sort field (createdAt, amount, dueDate)
- sortOrder: Sort order (asc, desc)
```

#### Get Payments by Vendor
```http
GET /api/v1/payments/vendor/:vendorId
Authorization: Bearer <token>

Query Parameters:
- page: Page number (default: 1)
- limit: Items per page (default: 10, max: 100)
- status: Filter by status
```

#### Get Payment by ID
```http
GET /api/v1/payments/:id
Authorization: Bearer <token>
```

#### Update Payment
```http
PUT /api/v1/payments/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 1600.00,
  "status": "PAID",
  "paymentDate": "2024-12-15T00:00:00Z"
}
```

#### Delete Payment
```http
DELETE /api/v1/payments/:id
Authorization: Bearer <token>
```

#### Get Payment Statistics
```http
GET /api/v1/payments/stats/overview
Authorization: Bearer <token>
```

### Health Check
```http
GET /health
```

## Database Schema

### Users
- `id`: String (Primary Key)
- `email`: String (Unique)
- `password`: String (Hashed)
- `name`: String (Optional)
- `role`: Enum (USER, ADMIN)
- `createdAt`: DateTime
- `updatedAt`: DateTime

### Vendors
- `id`: String (Primary Key)
- `name`: String
- `email`: String (Unique)
- `phone`: String (Optional)
- `address`: String (Optional)
- `contactName`: String (Optional)
- `status`: Enum (ACTIVE, INACTIVE, SUSPENDED)
- `createdAt`: DateTime
- `updatedAt`: DateTime

### Payments
- `id`: String (Primary Key)
- `amount`: Decimal
- `description`: String (Optional)
- `status`: Enum (PENDING, PAID, OVERDUE, CANCELLED)
- `paymentDate`: DateTime (Optional)
- `dueDate`: DateTime (Optional)
- `vendorId`: String (Foreign Key)
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Rate Limiting**: Protection against brute force attacks
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers for protection
- **Input Validation**: Comprehensive validation and sanitization

## Testing the API

### Using the Seeded Data

After running `npm run seed`, you can test with these credentials:

**Admin User:**
- Email: `admin@example.com`
- Password: `admin123`

**Sample Vendors:**
- Tech Solutions Ltd (`supplier1@example.com`)
- Office Supplies Co (`supplier2@example.com`)

### Example API Calls

1. **Login to get a token**:
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@example.com", "password": "admin123"}'
   ```

2. **Get all vendors**:
   ```bash
   curl -X GET http://localhost:3000/api/v1/vendors \
     -H "Authorization: Bearer <your-token>"
   ```

3. **Create a payment**:
   ```bash
   curl -X POST http://localhost:3000/api/v1/payments \
     -H "Authorization: Bearer <your-token>" \
     -H "Content-Type: application/json" \
     -d '{"amount": 500.00, "description": "Monthly service fee", "vendorId": "<vendor-id>"}'
   ```

## Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
DATABASE_URL="your-production-database-url"
JWT_SECRET="your-production-jwt-secret-very-long-and-secure"
```

### Docker Deployment (Optional)

Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "start"]
```

## Additional Features

- **Pagination**: All list endpoints support pagination
- **Filtering**: Advanced filtering options
- **Search**: Full-text search capabilities
- **Statistics**: Payment overview and analytics
- **Audit Trail**: Timestamps for all operations
- **Soft Deletes**: Vendor deletion with payment validation