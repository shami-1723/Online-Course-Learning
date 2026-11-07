CREATE DATABASE IF NOT EXISTS online_course_lms;
USE online_course_lms;

CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'student'
);

CREATE TABLE IF NOT EXISTS courses (
  course_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  instructor_id INT NOT NULL,
  price DECIMAL(10,2) DEFAULT 0.00,
  duration INT DEFAULT 1,
  CONSTRAINT fk_courses_instructor FOREIGN KEY (instructor_id)
    REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lessons (
  lesson_id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  lesson_title VARCHAR(150) NOT NULL,
  content TEXT,
  video_url VARCHAR(255),
  sequence_no INT DEFAULT 1,
  CONSTRAINT fk_lessons_course FOREIGN KEY (course_id)
    REFERENCES courses(course_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS enrollments (
  enrollment_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  enrollment_date DATE,
  progress INT DEFAULT 0,
  status VARCHAR(30) DEFAULT 'Active',
  CONSTRAINT fk_enrollments_user FOREIGN KEY (user_id)
    REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_enrollments_course FOREIGN KEY (course_id)
    REFERENCES courses(course_id) ON DELETE CASCADE,
  UNIQUE KEY unique_student_course (user_id, course_id)
);

-- Optional demo courses are added after you register an instructor.
