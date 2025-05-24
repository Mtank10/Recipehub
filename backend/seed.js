import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],}).$extends(withAccelerate())

const demoRecipes = [
  {
    title: 'Classic Spaghetti Carbonara',
    description: 'Creamy Roman pasta dish with eggs, cheese, and pancetta',
    image: 'https://images.unsplash.com/photo-1588013273468-315fd88ea34c',
    cookingTime: 30,
    steps: ['Boil pasta', 'Cook pancetta', 'Mix eggs/cheese', 'Combine'],
    tags: ['italian', 'pasta'],
    category: 'Main Course',
    ingredients: [
      { name: 'Spaghetti', quantity: '400g' },
      { name: 'Pancetta', quantity: '150g' }
    ],
    ratings: [4, 5, 5],
    comments: [
      'Loved this recipe!',
      'Perfect weeknight meal',
      'Used bacon instead of pancetta'
    ],
    likes: 8
  },
  {
    title: 'Vegetarian Buddha Bowl',
    description: 'Healthy grain bowl with roasted veggies',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
    cookingTime: 45,
    steps: ['Roast veggies', 'Cook quinoa', 'Assemble'],
    tags: ['vegetarian', 'healthy'],
    category: 'Vegetarian',
    ingredients: [
      { name: 'Quinoa', quantity: '1 cup' },
      { name: 'Sweet Potato', quantity: '2 medium' }
    ],
    ratings: [5, 4],
    comments: ['So nutritious!', 'Added avocado'],
    likes: 5
  },
  // Add 18 more recipes with similar structure
  {
    title: 'Beef Bourguignon',
    description: 'French red wine stew',
    image: 'https://images.unsplash.com/photo-1603105037880-880cd4edfb0d',
    cookingTime: 180,
    steps: ['Sear beef', 'Cook vegetables', 'Simmer in wine'],
    tags: ['french', 'comfort-food'],
    category: 'Main Course',
    ingredients: [
      { name: 'Beef chuck', quantity: '1kg' },
      { name: 'Red wine', quantity: '750ml' }
    ],
    ratings: [5, 5, 4],
    comments: ['Worth the wait!', 'Perfect for special occasions'],
    likes: 12
  }
];

async function main() {
  // Create 4 demo users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'chef@demo.com' },
      update: {},
      create: {
        name: 'Master Chef',
        email: 'chef@demo.com',
        provider: 'GOOGLE',
        providerId: 'google-123',
        avatar: 'https://example.com/avatar1.jpg'
      }
    }),
    prisma.user.upsert({
      where: { email: 'foodie@demo.com' },
      update: {},
      create: {
        name: 'Foodie Friend',
        email: 'foodie@demo.com',
        provider: 'GOOGLE',
        providerId: 'google-456',
        avatar: 'https://example.com/avatar2.jpg'
      }
    }),
    prisma.user.upsert({
      where: { email: 'homecook@demo.com' },
      update: {},
      create: {
        name: 'Home Cook',
        email: 'homecook@demo.com',
        provider: 'GOOGLE',
        providerId: 'google-789',
        avatar: 'https://example.com/avatar3.jpg'
      }
    }),
    prisma.user.upsert({
      where: { email: 'baker@demo.com' },
      update: {},
      create: {
        name: 'Professional Baker',
        email: 'baker@demo.com',
        provider: 'GOOGLE',
        providerId: 'google-101',
        avatar: 'https://example.com/avatar4.jpg'
      }
    })
  ]);

  // Create recipes with relationships
  for (const recipeData of demoRecipes) {
    const recipe = await prisma.recipe.create({
      data: {
        title: recipeData.title,
        description: recipeData.description,
        image: recipeData.image,
        cookingTime: recipeData.cookingTime,
        steps: recipeData.steps,
        tags: recipeData.tags,
        category: recipeData.category,
        author: { connect: { id: users[0].id } },
        ingredients: { create: recipeData.ingredients }
      }
    });

    // Create ratings
    await Promise.all(recipeData.ratings.map((rating, index) =>
      prisma.rating.create({
        data: {
          rating,
          user: { connect: { id: users[index % users.length].id } },
          recipe: { connect: { id: recipe.id } }
        }
      })
    ));

    // Create comments
    await Promise.all(recipeData.comments.map((content, index) =>
      prisma.comment.create({
        data: {
          content,
          user: { connect: { id: users[index % users.length].id } },
          recipe: { connect: { id: recipe.id } }
        }
      })
    ));

    // Create likes
    for (let i = 0; i < recipeData.likes; i++) {
      await prisma.recipeLike.create({
        data: {
          user: { connect: { id: users[i % users.length].id } },
          recipe: { connect: { id: recipe.id } }
        }
      });
    }
  }

  console.log('Database seeded successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });