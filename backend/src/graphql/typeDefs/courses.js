import { gql } from 'graphql-tag';

export const coursesTypeDefs = gql`
  type Course {
    id: ID!
    title: String!
    description: String!
    instructor: String!
    instructorAvatar: String
    image: String!
    duration: String!
    level: CourseLevel!
    category: String!
    price: Float!
    rating: Float!
    studentsCount: Int!
    lessonsCount: Int!
    lessons: [Lesson!]!
    enrollments: [CourseEnrollment!]!
    isEnrolled: Boolean!
    progress: Float!
    createdAt: String!
    updatedAt: String!
  }

  type Lesson {
    id: ID!
    courseId: String!
    title: String!
    description: String!
    videoUrl: String
    duration: String!
    order: Int!
    isCompleted: Boolean!
    createdAt: String!
  }

  type CourseEnrollment {
    id: ID!
    userId: String!
    courseId: String!
    progress: Float!
    completedLessons: [String!]!
    enrolledAt: String!
    completedAt: String
  }

  enum CourseLevel {
    BEGINNER
    INTERMEDIATE
    ADVANCED
  }

  input CourseInput {
    title: String!
    description: String!
    instructor: String!
    instructorAvatar: String
    image: String!
    duration: String!
    level: CourseLevel!
    category: String!
    price: Float!
  }

  input LessonInput {
    title: String!
    description: String!
    videoUrl: String
    duration: String!
    order: Int!
  }

  extend type Query {
    getCourses(category: String, level: CourseLevel, page: Int, limit: Int): CourseList!
    getCourse(id: ID!): Course
    getEnrolledCourses: [Course!]!
    getCourseProgress(courseId: ID!): CourseEnrollment
  }

  extend type Mutation {
    enrollInCourse(courseId: ID!): CourseEnrollment!
    markLessonCompleted(lessonId: ID!): Boolean!
    updateCourseProgress(courseId: ID!, progress: Float!): CourseEnrollment!
  }

  type CourseList {
    courses: [Course!]!
    totalPages: Int!
    currentPage: Int!
    totalCourses: Int!
  }
`;