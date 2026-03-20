# Task-Management-System
I have Built a Task Management App using Node.js and Type Script 
**tech
Backend Which is mandatory******
Node.js & TypeScript
Express.js
Prisma Orm and sql lite for simplification in production
Jwt auth
password Hassing

Frontend*****
Next.js
Typescript
Tailwind CSS
Axios

Features ******

User registration and login
 JWT authentication with refresh token rotation
 Create, edit, delete and toggle tasks
 Search tasks by title
 Filter by status (Pending / Completed)
 Pagination
 Responsive design
 Toast notifications

 Setup ******
 ***Backend
cd backend
npm install
npx prisma migrate dev --name init
npm run dev
Runs on http://localhost:5000

***Frontend
cd frontend
npm install
npm run dev
Runs on http://localhost:3000
API Endpoints

***Auth
- POST /auth/register
- POST /auth/login
- POST /auth/refresh
- POST /auth/logout
  
Test Credentials****
Email: test@example.com
Password: password123
