import { prisma } from "../../config/db.js";
import { GraphQLError } from "graphql";

export const coursesResolvers = {
  Query: {
    getCourses: async (_, { category, level, page = 1, limit = 12 }) => {
      const offset = (page - 1) * limit;
      const where = {};
      
      if (category) where.category = category;
      if (level) where.level = level;
      
      const courses = await prisma.course.findMany({
        where,
        include: {
          lessons: {
            orderBy: { order: 'asc' }
          },
          enrollments: true
        },
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' }
      });
      
      const totalCourses = await prisma.course.count({ where });
      
      return {
        courses,
        totalPages: Math.ceil(totalCourses / limit),
        currentPage: page,
        totalCourses
      };
    },

    getCourse: async (_, { id }, context) => {
      const course = await prisma.course.findUnique({
        where: { id },
        include: {
          lessons: {
            orderBy: { order: 'asc' }
          },
          enrollments: true
        }
      });
      
      if (!course) throw new GraphQLError("Course not found");
      
      // Check if user is enrolled
      let isEnrolled = false;
      let progress = 0;
      
      if (context.user) {
        const enrollment = await prisma.courseEnrollment.findUnique({
          where: {
            userId_courseId: {
              userId: context.user.id,
              courseId: id
            }
          }
        });
        
        if (enrollment) {
          isEnrolled = true;
          progress = enrollment.progress;
        }
      }
      
      return {
        ...course,
        isEnrolled,
        progress
      };
    },

    getEnrolledCourses: async (_, __, context) => {
      if (!context.user) throw new GraphQLError("Unauthorized");
      
      const enrollments = await prisma.courseEnrollment.findMany({
        where: { userId: context.user.id },
        include: {
          course: {
            include: {
              lessons: true,
              enrollments: true
            }
          }
        }
      });
      
      return enrollments.map(enrollment => ({
        ...enrollment.course,
        isEnrolled: true,
        progress: enrollment.progress
      }));
    },

    getCourseProgress: async (_, { courseId }, context) => {
      if (!context.user) throw new GraphQLError("Unauthorized");
      
      return await prisma.courseEnrollment.findUnique({
        where: {
          userId_courseId: {
            userId: context.user.id,
            courseId
          }
        }
      });
    }
  },

  Mutation: {
    enrollInCourse: async (_, { courseId }, context) => {
      if (!context.user) throw new GraphQLError("Unauthorized");
      
      const existingEnrollment = await prisma.courseEnrollment.findUnique({
        where: {
          userId_courseId: {
            userId: context.user.id,
            courseId
          }
        }
      });
      
      if (existingEnrollment) {
        throw new GraphQLError("Already enrolled in this course");
      }
      
      return await prisma.courseEnrollment.create({
        data: {
          userId: context.user.id,
          courseId,
          progress: 0,
          completedLessons: []
        }
      });
    },

    markLessonCompleted: async (_, { lessonId }, context) => {
      if (!context.user) throw new GraphQLError("Unauthorized");
      
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: {
          course: {
            include: {
              lessons: true
            }
          }
        }
      });
      
      if (!lesson) throw new GraphQLError("Lesson not found");
      
      const enrollment = await prisma.courseEnrollment.findUnique({
        where: {
          userId_courseId: {
            userId: context.user.id,
            courseId: lesson.courseId
          }
        }
      });
      
      if (!enrollment) throw new GraphQLError("Not enrolled in this course");
      
      const completedLessons = [...enrollment.completedLessons];
      if (!completedLessons.includes(lessonId)) {
        completedLessons.push(lessonId);
      }
      
      const progress = (completedLessons.length / lesson.course.lessons.length) * 100;
      
      await prisma.courseEnrollment.update({
        where: {
          userId_courseId: {
            userId: context.user.id,
            courseId: lesson.courseId
          }
        },
        data: {
          completedLessons,
          progress,
          ...(progress === 100 && { completedAt: new Date() })
        }
      });
      
      return true;
    },

    updateCourseProgress: async (_, { courseId, progress }, context) => {
      if (!context.user) throw new GraphQLError("Unauthorized");
      
      return await prisma.courseEnrollment.update({
        where: {
          userId_courseId: {
            userId: context.user.id,
            courseId
          }
        },
        data: { progress }
      });
    }
  },

  Course: {
    isEnrolled: async (parent, _, context) => {
      if (!context.user) return false;
      
      const enrollment = await prisma.courseEnrollment.findUnique({
        where: {
          userId_courseId: {
            userId: context.user.id,
            courseId: parent.id
          }
        }
      });
      
      return !!enrollment;
    },

    progress: async (parent, _, context) => {
      if (!context.user) return 0;
      
      const enrollment = await prisma.courseEnrollment.findUnique({
        where: {
          userId_courseId: {
            userId: context.user.id,
            courseId: parent.id
          }
        }
      });
      
      return enrollment?.progress || 0;
    }
  }
};