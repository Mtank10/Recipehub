import { authResolvers } from './auth.js';
import { dashboardResolvers } from './dashboard.js';
import { culturalResolvers } from './cultural.js';
import { mealPlannerResolvers } from './mealPlanner.js';
import { coursesResolvers } from './courses.js';
import { communityResolvers } from './community.js';
import { analyticsResolvers } from './analytics.js';

export const resolvers = {
  Query: {
    ...authResolvers.Query,
    ...dashboardResolvers.Query,
    ...culturalResolvers.Query,
    ...mealPlannerResolvers.Query,
    ...coursesResolvers.Query,
    ...communityResolvers.Query,
    ...analyticsResolvers.Query
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...dashboardResolvers.Mutation,
    ...culturalResolvers.Mutation,
    ...mealPlannerResolvers.Mutation,
    ...coursesResolvers.Mutation,
    ...analyticsResolvers.Mutation
  },
  Subscription: {
    ...authResolvers.Subscription
  },
  User: authResolvers.User,
  Recipe: authResolvers.Recipe,
  Course: coursesResolvers.Course
};