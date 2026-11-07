# Online Course Learning Management System

**Developer:** M. Shamindra  
**Stack:** HTML, CSS, JavaScript, Node.js, Express.js, MySQL

## Features
- Student and instructor registration/login
- Password hashing with bcrypt
- Instructor course creation
- Lesson creation and listing
- Student course enrolment
- Enrolment progress tracking
- Responsive landing page and course catalogue

## Requirements
- Node.js installed
- MySQL Server installed and running
- MySQL Workbench (optional, for running SQL)

## Setup
1. Extract the ZIP and open this folder in VS Code.
2. Open a terminal in this folder and run:
   ```bash
   npm install
   ```
3. In MySQL Workbench, open and execute `database/schema.sql`.
4. Copy `.env.example` to `.env` and enter your MySQL password:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=online_course_lms
   SESSION_SECRET=use_a_long_random_secret
   PORT=3000
   ```
5. Start the app:
   ```bash
   npm run dev
   ```
6. Open http://localhost:3000

## First-use walkthrough
1. Register an account and select **Instructor**.
2. Open Dashboard and publish a course.
3. Add lessons using the course ID shown in the database (`courses` table).
4. Log out and register a separate **Student** account.
5. Browse courses, enrol, then open Dashboard to update progress.

## Database
The four required tables are `users`, `courses`, `lessons`, and `enrollments`.
`user_id` in courses and `user_id`/`course_id` in enrollments, and `course_id` in lessons are foreign keys. The auto-increment ID columns are the primary keys.

## Notes
- `.env` is intentionally not included. Never upload database passwords to GitHub.
- The site uses a text/letter avatar, not a personal photograph. Replace it with your own image if your lab requirement strictly asks for your photo.
- This is an educational mini-project starter, not a production deployment. For production, use a persistent session store, HTTPS, CSRF protection, validation, and instructor ownership checks for every management action.


## Demo student account and sample subjects
After configuring `.env` and creating the database tables, run `npm run seed-demo` once. This creates/updates the demo student account `shamindra343@gmail.com` (password `123456`) and adds three free sample subjects: Python Programming, Database Management Systems, and Web Development. The dashboard displays up to three available subjects after login. Change the demo password before using this outside a classroom demonstration.
