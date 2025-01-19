# Database Schema Documentation

## User
Represents a user in the system.

```typescript
{
  id: string;          // UUID primary key
  email: string;       // Unique email address
  name: string;        // Full name
  password: string;    // Hashed password
  role: UserRole;      // USER or ADMIN
  status: AccountStatus; // ACTIVE or DEACTIVATED
  title?: string;      // Job title
  company?: string;    // Company name
  createdAt: Date;     // Account creation timestamp
  updatedAt: Date;     // Last update timestamp
  tokenInvalidatedAt?: Date; // Timestamp when tokens were invalidated
}
```

### Indexes
- `email` (unique)
- `role` (for admin queries)
- `status` (for filtering active users)

## JobPost
Represents a job posting.

```typescript
{
  id: string;          // UUID primary key
  title: string;       // Job title
  company: string;     // Company name
  location: string;    // Job location
  description: string; // Full job description
  requirements: string; // Job requirements
  type: JobType;       // FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP
  salary?: {          // Optional salary information
    min: number;
    max: number;
    currency: string;
  };
  authorId: string;    // Reference to User
  createdAt: Date;     // Post creation timestamp
  updatedAt: Date;     // Last update timestamp
  expiresAt?: Date;    // Optional expiration date
  status: PostStatus;  // ACTIVE, EXPIRED, FILLED, DRAFT
}
```

### Indexes
- `authorId` (foreign key)
- `type` (for filtering)
- `status` (for filtering)
- `createdAt` (for sorting)
- `location` (for searching)

## Application
Represents a job application.

```typescript
{
  id: string;          // UUID primary key
  jobId: string;       // Reference to JobPost
  applicantId: string; // Reference to User
  status: ApplicationStatus; // PENDING, REVIEWED, ACCEPTED, REJECTED
  coverLetter?: string; // Optional cover letter
  resume: string;      // Resume URL or content
  createdAt: Date;     // Application submission timestamp
  updatedAt: Date;     // Last update timestamp
}
```

### Indexes
- `jobId` (foreign key)
- `applicantId` (foreign key)
- `status` (for filtering)

## Relationships

### User -> JobPost
- One-to-Many: A user can create multiple job posts
- Foreign key: `JobPost.authorId -> User.id`

### User -> Application
- One-to-Many: A user can submit multiple applications
- Foreign key: `Application.applicantId -> User.id`

### JobPost -> Application
- One-to-Many: A job post can receive multiple applications
- Foreign key: `Application.jobId -> JobPost.id`

## Enums

### UserRole
```typescript
enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}
```

### AccountStatus
```typescript
enum AccountStatus {
  ACTIVE = 'ACTIVE',
  DEACTIVATED = 'DEACTIVATED'
}
```

### JobType
```typescript
enum JobType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP'
}
```

### PostStatus
```typescript
enum PostStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  FILLED = 'FILLED',
  DRAFT = 'DRAFT'
}
```

### ApplicationStatus
```typescript
enum ApplicationStatus {
  PENDING = 'PENDING',
  REVIEWED = 'REVIEWED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}
``` 