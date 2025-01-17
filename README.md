# ExitBoard - Professional Job Board

A modern, professional job board application built with Next.js, TypeScript, and Tailwind CSS. The platform allows users to create accounts, post job listings, and search for opportunities with advanced filtering capabilities.

## Features

- **User Authentication**
  - Sign up with email and password
  - Sign in to existing accounts
  - Password recovery functionality

- **Job Listings**
  - View all available positions
  - Search and filter jobs by various criteria
  - Detailed job descriptions and requirements
  - Salary information and job type indicators

- **Job Posting**
  - Create and publish job listings
  - Specify job details, requirements, and compensation
  - Edit and manage posted listings

- **Modern UI/UX**
  - Responsive design for all devices
  - Professional and futuristic aesthetic
  - Intuitive navigation and user flow
  - Dark theme optimized for readability

## Tech Stack

- **Frontend**
  - Next.js 14 (React framework)
  - TypeScript
  - Tailwind CSS
  - Headless UI Components
  - Hero Icons

- **Backend**
  - Next.js API Routes
  - Prisma ORM
  - PostgreSQL Database

- **Authentication**
  - JWT (JSON Web Tokens)
  - Secure password hashing with bcrypt

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/exitboard.git
   cd exitboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/exitboard"
   JWT_SECRET="your-secret-key"
   ```

4. Initialize the database:
   ```bash
   npx prisma migrate dev
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

The application is designed to be deployed on Azure hosting services. Follow these steps for deployment:

1. Create an Azure account if you don't have one
2. Set up an Azure App Service
3. Configure your deployment settings
4. Deploy using Azure CLI or GitHub Actions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
