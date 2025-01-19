# ExitBoard Database Schema Documentation

## User Model

### Structure
```prisma
model User {
  id                 String        @id @default(cuid())
  email              String        @unique
  name               String
  hashedPassword     String
  role               UserRole      @default(USER)
  status            AccountStatus  @default(ACTIVE)
  title             String?
  company           String?
  tokenInvalidatedAt DateTime?
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt
  jobPosts          JobPost[]
  applications      Application[]
}
```

### Indexes
- Primary Key: `id`
- Unique Index: `email`

## JobPost Model

### Structure
```prisma
model JobPost {
  id            String      @id @default(cuid())
  title         String
  company       String
  location      String
  description   String      @db.Text
  requirements  String      @db.Text
  type          JobType
  salary        Json?
  status        PostStatus  @default(OPEN)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  userId        String
  user          User        @relation(fields: [userId], references: [id])
  applications  Application[]
}
```

### Indexes
- Primary Key: `id`
- Foreign Key: `userId` references `User.id`

## Application Model

### Structure
```prisma
model Application {
  id          String            @id @default(cuid())
  status      ApplicationStatus @default(PENDING)
  coverLetter String?          @db.Text
  resume      String           // URL to stored resume
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  userId      String
  jobPostId   String
  user        User             @relation(fields: [userId], references: [id])
  jobPost     JobPost          @relation(fields: [jobPostId], references: [id])
}
```

### Indexes
- Primary Key: `id`
- Foreign Keys:
  - `userId` references `User.id`
  - `jobPostId` references `JobPost.id`

## Relationships

### User
- One-to-Many with JobPost (as poster)
- One-to-Many with Application (as applicant)

### JobPost
- Many-to-One with User (poster)
- One-to-Many with Application

### Application
- Many-to-One with User (applicant)
- Many-to-One with JobPost

## Enums

### UserRole
```prisma
enum UserRole {
  USER
  ADMIN
}
```

### AccountStatus
```prisma
enum AccountStatus {
  ACTIVE
  DEACTIVATED
}
```

### JobType
```prisma
enum JobType {
  FULL_TIME
  PART_TIME
  CONTRACT
  INTERNSHIP
}
```

### PostStatus
```prisma
enum PostStatus {
  OPEN
  CLOSED
  DRAFT
}
```

### ApplicationStatus
```prisma
enum ApplicationStatus {
  PENDING
  REVIEWED
  SHORTLISTED
  REJECTED
  ACCEPTED
}
``` 