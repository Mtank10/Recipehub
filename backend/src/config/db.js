import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient({
   log: ['query', 'info', 'warn', 'error'],
});

async function connectDB(){
    try{
        await prisma.$connect();
        console.log("Database connected successfully");
    }catch(error){
        console.error("Error connecting to database: ", error);
        process.exit(1);
    }
}

export {prisma, connectDB};