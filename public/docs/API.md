# ExitBoard API Documentation

## Authentication

### Sign In
- **Endpoint**: `/api/auth/signin`
- **Method**: `POST`
- **Description**: Authenticates a user and returns a JWT token
- **Request Body**:
  ```typescript
  {
    email: string;
    password: {
      encrypted: string;
      iv: string;
    }
  }
  ```
- **Response**:
  ```typescript
  {
    token: string;
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      status: AccountStatus;
      title?: string;
      company?: string;
      createdAt: Date;
    }
  }
  ```
- **Error Responses**:
  - `401`: Invalid credentials
  - `403`: Account deactivated

## User Management

### Update Profile
- **Endpoint**: `/api/users/profile`
- **Method**: `PUT`
- **Description**: Updates the authenticated user's profile
- **Headers Required**: `Authorization: Bearer <token>`
- **Request Body**:
  ```typescript
  {
    name: string;
    email: string;
    company?: string;
    title?: string;
  }
  ```
- **Response**: Updated user object
- **Error Responses**:
  - `401`: Not authenticated
  - `400`: Invalid input data

## Admin Routes

### List Users
- **Endpoint**: `/api/admin/users`
- **Method**: `GET`
- **Description**: Returns a list of all users (admin only)
- **Headers Required**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `search`: Search term for name/email
- **Response**:
  ```typescript
  {
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  }
  ```
- **Error Responses**:
  - `401`: Not authenticated
  - `403`: Not authorized (non-admin)

## Job Posts

### Create Job Post
- **Endpoint**: `/api/jobs/create`
- **Method**: `POST`
- **Description**: Creates a new job posting
- **Headers Required**: `Authorization: Bearer <token>`
- **Request Body**:
  ```typescript
  {
    title: string;
    company: string;
    location: string;
    description: string;
    requirements: string;
    type: JobType;
    salary?: {
      min: number;
      max: number;
      currency: string;
    };
  }
  ```
- **Response**: Created job post object
- **Error Responses**:
  - `401`: Not authenticated
  - `400`: Invalid input data

## Data Types

### UserRole (Enum)
```typescript
enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}
```

### AccountStatus (Enum)
```typescript
enum AccountStatus {
  ACTIVE = 'ACTIVE',
  DEACTIVATED = 'DEACTIVATED'
}
```

## Security

### Authentication
- All protected routes require a valid JWT token in the Authorization header
- Tokens expire after 7 days
- Tokens are invalidated when:
  - User logs out
  - User is deactivated
  - User changes password
  - Admin forces logout

### Data Encryption
- Passwords are encrypted client-side before transmission
- Sensitive data in responses is encrypted using AES-GCM
- All communication must be over HTTPS 