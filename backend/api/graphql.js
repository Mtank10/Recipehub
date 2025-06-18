import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { connectDB, prisma } from "../src/config/db.js";
import { authenticate } from "../src/middlewares/authMiddleware.js";
import { authTypeDefs } from "../src/graphql/typeDefs/auth.js";
import { authResolvers } from "../src/graphql/resolvers/auth.js";
import { dashboardTypeDefs } from "../src/graphql/typeDefs/dashboard.js";
import { dashboardResolvers } from "../src/graphql/resolvers/dashboard.js";
import { culturalTypeDefs } from "../src/graphql/typeDefs/cultural.js";
import { culturalResolvers } from "../src/graphql/resolvers/cultural.js";

// Load env variables
dotenv.config();

// Connect to DB
connectDB();

// Merge typeDefs and resolvers
const typeDefs = [authTypeDefs, dashboardTypeDefs, culturalTypeDefs];
const resolvers = {
  Query: {
    ...authResolvers.Query,
    ...dashboardResolvers.Query,
    ...culturalResolvers.Query
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...dashboardResolvers.Mutation,
    ...culturalResolvers.Mutation
  },
  Subscription: {
    ...authResolvers.Subscription
  },
  User: authResolvers.User,
  Recipe: authResolvers.Recipe
};

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const app = express();

app.use(
    cors({
      origin: "https://recipehub-rosy.vercel.app", // ✅ Exact frontend domain
      credentials: true,                            // ✅ Required to support cookies/headers
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
  

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(compression());
app.use(morgan("dev"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

// Start and export Express handler
let started = false;

export default async function handler(req, res) {
  if (!started) {
    await server.start();
    app.use(
      "/api/graphql",
      expressMiddleware(server, {
        context: async ({ req }) => {
          let user = null;
          try {
            user = authenticate(req, {}, () => {});
          } catch (error) {
            console.error("Authentication Error:", error);
          }
          return { req, user, prisma };
        },
      })
    );
    started = true;
  }

  return app(req, res);
}