import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { connectDB, prisma } from "./config/db.js";
import { authenticate } from "./middlewares/authMiddleware.js";
import { authTypeDefs } from "./graphql/typeDefs/auth.js";
import { authResolvers } from "./graphql/resolvers/auth.js";

dotenv.config();

const app = express();

// Connect to database
connectDB();

const PORT = parseInt(process.env.PORT || "5000", 10);

// Create Apollo Server
const server = new ApolloServer({
  typeDefs: [authTypeDefs],
  resolvers: [authResolvers],
});

// Middleware setup
app.use(
  cors({
    origin:'https://recipehub-rosy.vercel.app', 
   credentials:true,            //access-control-allow-credentials:true
  })
);
app.use(express.json()); // Support JSON body parsing
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

// Start Apollo Server and apply Express middleware
const startServer = async () => {
  await server.start();

  // ✅ Properly apply expressMiddleware
  app.get("/", (req, res) => {
    res.send("backend running");
  }
  );
  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => {
        let user = null;
        try {
          user = authenticate(req ,{}, () => {} );
          console.log(user.id)
        } catch (error) {
          console.error("Authentication Error:", error);
        }
        console.log(req,user,prisma)
        return { req, user, prisma }; // Pass `req`, `user`, and `prisma` to resolvers
      },
    })
  );

  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  });
};

startServer();
