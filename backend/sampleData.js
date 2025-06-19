import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
}).$extends(withAccelerate())

// Sample courses data
const coursesData = [
  {
    title: 'Italian Cuisine Masterclass',
    description: 'Master the art of authentic Italian cooking with traditional recipes and techniques from pasta to pizza.',
    instructor: 'Chef Marco Rossi',
    instructorAvatar: 'https://i.pravatar.cc/100?u=marco',
    image: 'https://images.unsplash.com/photo-1572715376701-98568319fd0b?w=400',
    duration: '8 hours',
    level: 'INTERMEDIATE',
    category: 'International Cuisine',
    price: 99.99,
    rating: 4.8,
    studentsCount: 1250,
    lessonsCount: 12,
    lessons: [
      { title: 'Introduction to Italian Cooking', description: 'Learn the basics of Italian cuisine', videoUrl: 'https://example.com/video1', duration: '30 mins', order: 1 },
      { title: 'Making Fresh Pasta', description: 'Create perfect pasta from scratch', videoUrl: 'https://example.com/video2', duration: '45 mins', order: 2 },
      { title: 'Classic Tomato Sauce', description: 'The foundation of Italian cooking', videoUrl: 'https://example.com/video3', duration: '25 mins', order: 3 },
      { title: 'Pizza Dough Mastery', description: 'Perfect pizza dough every time', videoUrl: 'https://example.com/video4', duration: '40 mins', order: 4 },
      { title: 'Risotto Techniques', description: 'Creamy risotto secrets', videoUrl: 'https://example.com/video5', duration: '35 mins', order: 5 },
      { title: 'Italian Desserts', description: 'Tiramisu and more', videoUrl: 'https://example.com/video6', duration: '30 mins', order: 6 }
    ]
  },
  {
    title: 'Baking Fundamentals',
    description: 'Learn the science and art of baking from scratch to professional level.',
    instructor: 'Chef Sarah Johnson',
    instructorAvatar: 'https://i.pravatar.cc/100?u=sarah',
    image: 'https://images.unsplash.com/photo-1557925923-cd4648e211a0?w=400',
    duration: '6 hours',
    level: 'BEGINNER',
    category: 'Baking & Pastry',
    price: 79.99,
    rating: 4.9,
    studentsCount: 890,
    lessonsCount: 8,
    lessons: [
      { title: 'Baking Basics', description: 'Understanding ingredients and tools', videoUrl: 'https://example.com/video7', duration: '40 mins', order: 1 },
      { title: 'Bread Making', description: 'From kneading to baking', videoUrl: 'https://example.com/video8', duration: '50 mins', order: 2 },
      { title: 'Cake Fundamentals', description: 'Perfect cakes every time', videoUrl: 'https://example.com/video9', duration: '45 mins', order: 3 },
      { title: 'Cookie Mastery', description: 'Crispy, chewy, perfect cookies', videoUrl: 'https://example.com/video10', duration: '35 mins', order: 4 }
    ]
  },
  {
    title: 'Asian Fusion Techniques',
    description: 'Explore modern Asian fusion cooking with innovative techniques and flavors.',
    instructor: 'Chef Kenji Tanaka',
    instructorAvatar: 'https://i.pravatar.cc/100?u=kenji',
    image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400',
    duration: '10 hours',
    level: 'ADVANCED',
    category: 'International Cuisine',
    price: 149.99,
    rating: 4.7,
    studentsCount: 567,
    lessonsCount: 15,
    lessons: [
      { title: 'Asian Flavor Profiles', description: 'Understanding umami and balance', videoUrl: 'https://example.com/video11', duration: '30 mins', order: 1 },
      { title: 'Wok Techniques', description: 'High heat cooking mastery', videoUrl: 'https://example.com/video12', duration: '40 mins', order: 2 },
      { title: 'Sushi and Sashimi', description: 'Japanese precision', videoUrl: 'https://example.com/video13', duration: '60 mins', order: 3 }
    ]
  },
  {
    title: 'Vegetarian Cooking Mastery',
    description: 'Create delicious and nutritious vegetarian meals that satisfy everyone.',
    instructor: 'Chef Emma Green',
    instructorAvatar: 'https://i.pravatar.cc/100?u=emma',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    duration: '7 hours',
    level: 'INTERMEDIATE',
    category: 'Healthy Cooking',
    price: 89.99,
    rating: 4.6,
    studentsCount: 1100,
    lessonsCount: 10,
    lessons: [
      { title: 'Plant-Based Proteins', description: 'Beyond tofu and beans', videoUrl: 'https://example.com/video14', duration: '35 mins', order: 1 },
      { title: 'Vegetarian Comfort Food', description: 'Satisfying meat-free meals', videoUrl: 'https://example.com/video15', duration: '45 mins', order: 2 }
    ]
  },
  {
    title: 'Indian Spice Mastery',
    description: 'Master the complex world of Indian spices and traditional cooking techniques.',
    instructor: 'Chef Priya Sharma',
    instructorAvatar: 'https://i.pravatar.cc/100?u=priya',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400',
    duration: '9 hours',
    level: 'INTERMEDIATE',
    category: 'International Cuisine',
    price: 119.99,
    rating: 4.8,
    studentsCount: 750,
    lessonsCount: 12,
    lessons: [
      { title: 'Understanding Spices', description: 'The foundation of Indian cooking', videoUrl: 'https://example.com/video16', duration: '40 mins', order: 1 },
      { title: 'Curry Fundamentals', description: 'Building complex flavors', videoUrl: 'https://example.com/video17', duration: '50 mins', order: 2 }
    ]
  }
];

// Enhanced recipe data with cultural information
const enhancedRecipesData = [
  // Indian Recipes
  {
    title: 'Authentic Butter Chicken',
    description: 'Creamy, rich tomato-based curry with tender chicken pieces',
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400',
    cookingTime: 45,
    prepTime: 20,
    totalTime: 65,
    difficulty: 'MEDIUM',
    servings: 4,
    steps: [
      'Marinate chicken in yogurt and spices for 30 minutes',
      'Cook chicken in a hot pan until golden',
      'Prepare tomato-based sauce with cream',
      'Combine chicken with sauce and simmer',
      'Garnish with fresh cilantro and serve with rice'
    ],
    tags: ['indian', 'curry', 'chicken', 'creamy'],
    category: 'Main Course',
    ingredients: [
      { name: 'Chicken breast', quantity: '500g' },
      { name: 'Tomato puree', quantity: '400ml' },
      { name: 'Heavy cream', quantity: '200ml' },
      { name: 'Garam masala', quantity: '2 tsp' },
      { name: 'Ginger-garlic paste', quantity: '2 tbsp' }
    ],
    equipment: ['Heavy-bottomed pan', 'Mixing bowls'],
    tips: ['Marinate chicken overnight for better flavor', 'Use fresh cream for richness'],
    nutrition: {
      calories: 380,
      protein: 28,
      carbs: 12,
      fat: 24
    },
    culturalTag: {
      cuisineType: 'NORTH_INDIAN',
      dietTypes: ['NON_VEGETARIAN'],
      spiceLevel: 'MEDIUM',
      religion: ['HINDU', 'SIKH'],
      region: 'Punjab',
      culturalSignificance: 'Popular restaurant-style dish'
    }
  },
  {
    title: 'Masala Dosa',
    description: 'Crispy South Indian crepe filled with spiced potato curry',
    image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=400',
    cookingTime: 30,
    prepTime: 480, // Including fermentation time
    totalTime: 510,
    difficulty: 'HARD',
    servings: 4,
    steps: [
      'Soak rice and lentils overnight',
      'Grind to smooth batter and ferment for 8 hours',
      'Prepare potato filling with spices',
      'Make thin crepes on hot griddle',
      'Fill with potato curry and serve with chutney'
    ],
    tags: ['south-indian', 'vegetarian', 'fermented', 'breakfast'],
    category: 'Breakfast',
    ingredients: [
      { name: 'Rice', quantity: '3 cups' },
      { name: 'Urad dal', quantity: '1 cup' },
      { name: 'Potatoes', quantity: '4 medium' },
      { name: 'Mustard seeds', quantity: '1 tsp' },
      { name: 'Curry leaves', quantity: '10-12' }
    ],
    equipment: ['Wet grinder', 'Non-stick pan', 'Ladle'],
    tips: ['Fermentation is key for soft dosas', 'Keep batter at room temperature'],
    nutrition: {
      calories: 250,
      protein: 8,
      carbs: 45,
      fat: 5
    },
    culturalTag: {
      cuisineType: 'SOUTH_INDIAN',
      dietTypes: ['VEGETARIAN'],
      spiceLevel: 'MILD',
      religion: ['HINDU'],
      region: 'Karnataka',
      culturalSignificance: 'Traditional breakfast staple'
    }
  },
  {
    title: 'Rajasthani Dal Baati Churma',
    description: 'Traditional Rajasthani dish with lentil curry, baked wheat balls, and sweet crumble',
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400',
    cookingTime: 90,
    prepTime: 30,
    totalTime: 120,
    difficulty: 'HARD',
    servings: 6,
    steps: [
      'Prepare dal with mixed lentils and spices',
      'Make baati dough with wheat flour and ghee',
      'Bake baatis in oven until golden',
      'Prepare churma with wheat flour and jaggery',
      'Serve hot with ghee'
    ],
    tags: ['rajasthani', 'vegetarian', 'traditional', 'festival'],
    category: 'Main Course',
    ingredients: [
      { name: 'Mixed lentils', quantity: '2 cups' },
      { name: 'Wheat flour', quantity: '3 cups' },
      { name: 'Ghee', quantity: '1 cup' },
      { name: 'Jaggery', quantity: '1/2 cup' },
      { name: 'Dry fruits', quantity: '1/4 cup' }
    ],
    equipment: ['Oven', 'Pressure cooker', 'Mixing bowls'],
    tips: ['Bake baatis until they sound hollow', 'Serve immediately with hot ghee'],
    nutrition: {
      calories: 450,
      protein: 15,
      carbs: 60,
      fat: 18
    },
    culturalTag: {
      cuisineType: 'RAJASTHANI',
      dietTypes: ['VEGETARIAN'],
      spiceLevel: 'MEDIUM',
      religion: ['HINDU', 'JAIN'],
      region: 'Rajasthan',
      festival: 'Diwali',
      culturalSignificance: 'Royal Rajasthani cuisine'
    }
  },
  // Italian Recipes
  {
    title: 'Authentic Carbonara',
    description: 'Classic Roman pasta with eggs, cheese, pancetta, and black pepper',
    image: 'https://images.unsplash.com/photo-1588013273468-315fd88ea34c?w=400',
    cookingTime: 20,
    prepTime: 10,
    totalTime: 30,
    difficulty: 'MEDIUM',
    servings: 4,
    steps: [
      'Cook spaghetti in salted boiling water',
      'Crisp pancetta in a large pan',
      'Whisk eggs with Pecorino Romano cheese',
      'Toss hot pasta with pancetta and egg mixture',
      'Serve immediately with black pepper'
    ],
    tags: ['italian', 'pasta', 'eggs', 'quick'],
    category: 'Main Course',
    ingredients: [
      { name: 'Spaghetti', quantity: '400g' },
      { name: 'Pancetta', quantity: '150g' },
      { name: 'Eggs', quantity: '4 large' },
      { name: 'Pecorino Romano', quantity: '100g' },
      { name: 'Black pepper', quantity: '2 tsp' }
    ],
    equipment: ['Large pot', 'Large pan', 'Whisk'],
    tips: ['Remove pan from heat when adding eggs', 'Use pasta water to adjust consistency'],
    nutrition: {
      calories: 520,
      protein: 22,
      carbs: 65,
      fat: 18
    },
    culturalTag: {
      cuisineType: 'ITALIAN',
      dietTypes: ['NON_VEGETARIAN'],
      spiceLevel: 'MILD',
      region: 'Rome',
      culturalSignificance: 'Traditional Roman dish'
    }
  },
  {
    title: 'Margherita Pizza',
    description: 'Classic Neapolitan pizza with tomato, mozzarella, and fresh basil',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
    cookingTime: 15,
    prepTime: 120, // Including dough rising
    totalTime: 135,
    difficulty: 'MEDIUM',
    servings: 2,
    steps: [
      'Prepare pizza dough and let rise for 2 hours',
      'Roll out dough to thin circle',
      'Spread tomato sauce evenly',
      'Add fresh mozzarella and basil',
      'Bake in very hot oven until crispy'
    ],
    tags: ['italian', 'pizza', 'vegetarian', 'classic'],
    category: 'Main Course',
    ingredients: [
      { name: 'Pizza dough', quantity: '300g' },
      { name: 'Tomato sauce', quantity: '150ml' },
      { name: 'Fresh mozzarella', quantity: '200g' },
      { name: 'Fresh basil', quantity: '10 leaves' },
      { name: 'Olive oil', quantity: '2 tbsp' }
    ],
    equipment: ['Pizza stone', 'Rolling pin', 'Oven'],
    tips: ['Preheat oven to maximum temperature', 'Use 00 flour for best results'],
    nutrition: {
      calories: 420,
      protein: 18,
      carbs: 55,
      fat: 15
    },
    culturalTag: {
      cuisineType: 'ITALIAN',
      dietTypes: ['VEGETARIAN'],
      spiceLevel: 'MILD',
      region: 'Naples',
      culturalSignificance: 'Named after Queen Margherita'
    }
  },
  // Chinese Recipes
  {
    title: 'Kung Pao Chicken',
    description: 'Spicy Sichuan stir-fry with chicken, peanuts, and dried chilies',
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400',
    cookingTime: 15,
    prepTime: 20,
    totalTime: 35,
    difficulty: 'MEDIUM',
    servings: 4,
    steps: [
      'Marinate chicken in soy sauce and cornstarch',
      'Prepare sauce with soy sauce, vinegar, and sugar',
      'Stir-fry chicken until golden',
      'Add vegetables, peanuts, and dried chilies',
      'Toss with sauce and serve hot'
    ],
    tags: ['chinese', 'spicy', 'stir-fry', 'peanuts'],
    category: 'Main Course',
    ingredients: [
      { name: 'Chicken thigh', quantity: '500g' },
      { name: 'Roasted peanuts', quantity: '1/2 cup' },
      { name: 'Dried chilies', quantity: '8-10' },
      { name: 'Soy sauce', quantity: '3 tbsp' },
      { name: 'Rice vinegar', quantity: '2 tbsp' }
    ],
    equipment: ['Wok', 'High heat stove'],
    tips: ['Use high heat for authentic wok hei', 'Adjust chilies for spice level'],
    nutrition: {
      calories: 340,
      protein: 25,
      carbs: 12,
      fat: 22
    },
    culturalTag: {
      cuisineType: 'CHINESE',
      dietTypes: ['NON_VEGETARIAN'],
      spiceLevel: 'SPICY',
      region: 'Sichuan',
      culturalSignificance: 'Named after Qing Dynasty official'
    }
  },
  // Mexican Recipes
  {
    title: 'Authentic Tacos al Pastor',
    description: 'Mexican street tacos with marinated pork, pineapple, and cilantro',
    image: 'https://images.unsplash.com/photo-1565299585323-38174c4a6c7b?w=400',
    cookingTime: 25,
    prepTime: 240, // Including marination
    totalTime: 265,
    difficulty: 'MEDIUM',
    servings: 6,
    steps: [
      'Marinate pork in achiote paste and spices for 4 hours',
      'Cook pork on vertical trompo or grill',
      'Warm corn tortillas on comal',
      'Slice pork and pineapple',
      'Assemble tacos with onion and cilantro'
    ],
    tags: ['mexican', 'street-food', 'pork', 'spicy'],
    category: 'Main Course',
    ingredients: [
      { name: 'Pork shoulder', quantity: '1kg' },
      { name: 'Achiote paste', quantity: '3 tbsp' },
      { name: 'Corn tortillas', quantity: '18 pieces' },
      { name: 'Pineapple', quantity: '1 cup diced' },
      { name: 'White onion', quantity: '1 medium' }
    ],
    equipment: ['Grill', 'Comal', 'Sharp knife'],
    tips: ['Marinate overnight for best flavor', 'Char pineapple for sweetness'],
    nutrition: {
      calories: 380,
      protein: 28,
      carbs: 25,
      fat: 20
    },
    culturalTag: {
      cuisineType: 'MEXICAN',
      dietTypes: ['NON_VEGETARIAN'],
      spiceLevel: 'MEDIUM',
      region: 'Mexico City',
      culturalSignificance: 'Lebanese-Mexican fusion street food'
    }
  },
  // Japanese Recipes
  {
    title: 'Chicken Teriyaki',
    description: 'Glazed chicken with sweet and savory teriyaki sauce',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
    cookingTime: 20,
    prepTime: 15,
    totalTime: 35,
    difficulty: 'EASY',
    servings: 4,
    steps: [
      'Season chicken thighs with salt and pepper',
      'Cook chicken skin-side down until crispy',
      'Flip and cook until done',
      'Add teriyaki sauce and glaze',
      'Serve with steamed rice and vegetables'
    ],
    tags: ['japanese', 'chicken', 'glaze', 'easy'],
    category: 'Main Course',
    ingredients: [
      { name: 'Chicken thighs', quantity: '6 pieces' },
      { name: 'Soy sauce', quantity: '1/4 cup' },
      { name: 'Mirin', quantity: '2 tbsp' },
      { name: 'Sugar', quantity: '2 tbsp' },
      { name: 'Sake', quantity: '2 tbsp' }
    ],
    equipment: ['Non-stick pan', 'Small saucepan'],
    tips: ['Don\'t move chicken while cooking skin', 'Reduce sauce until glossy'],
    nutrition: {
      calories: 290,
      protein: 24,
      carbs: 8,
      fat: 18
    },
    culturalTag: {
      cuisineType: 'JAPANESE',
      dietTypes: ['NON_VEGETARIAN'],
      spiceLevel: 'MILD',
      region: 'Tokyo',
      culturalSignificance: 'Popular home cooking dish'
    }
  },
  // Thai Recipes
  {
    title: 'Pad Thai',
    description: 'Classic Thai stir-fried noodles with tamarind, fish sauce, and peanuts',
    image: 'https://images.unsplash.com/photo-1559314809-0f31657def5e?w=400',
    cookingTime: 15,
    prepTime: 20,
    totalTime: 35,
    difficulty: 'MEDIUM',
    servings: 4,
    steps: [
      'Soak rice noodles in warm water',
      'Prepare pad thai sauce with tamarind and fish sauce',
      'Stir-fry protein and vegetables',
      'Add noodles and sauce',
      'Garnish with peanuts, lime, and bean sprouts'
    ],
    tags: ['thai', 'noodles', 'stir-fry', 'street-food'],
    category: 'Main Course',
    ingredients: [
      { name: 'Rice noodles', quantity: '300g' },
      { name: 'Shrimp', quantity: '200g' },
      { name: 'Tamarind paste', quantity: '3 tbsp' },
      { name: 'Fish sauce', quantity: '3 tbsp' },
      { name: 'Bean sprouts', quantity: '1 cup' }
    ],
    equipment: ['Wok', 'High heat stove'],
    tips: ['Don\'t oversoak noodles', 'Balance sweet, sour, and salty'],
    nutrition: {
      calories: 420,
      protein: 18,
      carbs: 65,
      fat: 12
    },
    culturalTag: {
      cuisineType: 'THAI',
      dietTypes: ['NON_VEGETARIAN'],
      spiceLevel: 'MEDIUM',
      region: 'Bangkok',
      culturalSignificance: 'National dish of Thailand'
    }
  },
  // Add more recipes to reach 100+
  {
    title: 'Biryani Hyderabadi',
    description: 'Aromatic rice dish with marinated meat and saffron',
    image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400',
    cookingTime: 120,
    prepTime: 60,
    totalTime: 180,
    difficulty: 'HARD',
    servings: 8,
    steps: [
      'Marinate meat in yogurt and spices',
      'Partially cook basmati rice with whole spices',
      'Layer meat and rice alternately',
      'Cook on dum (slow cooking) method',
      'Serve with raita and shorba'
    ],
    tags: ['indian', 'biryani', 'rice', 'festive'],
    category: 'Main Course',
    ingredients: [
      { name: 'Basmati rice', quantity: '500g' },
      { name: 'Mutton', quantity: '1kg' },
      { name: 'Saffron', quantity: '1/2 tsp' },
      { name: 'Fried onions', quantity: '2 cups' },
      { name: 'Mint leaves', quantity: '1 cup' }
    ],
    equipment: ['Heavy-bottomed pot', 'Aluminum foil'],
    tips: ['Seal pot with dough for perfect dum', 'Rest for 10 minutes before opening'],
    nutrition: {
      calories: 580,
      protein: 32,
      carbs: 68,
      fat: 18
    },
    culturalTag: {
      cuisineType: 'SOUTH_INDIAN',
      dietTypes: ['NON_VEGETARIAN', 'HALAL'],
      spiceLevel: 'MEDIUM',
      religion: ['MUSLIM'],
      region: 'Hyderabad',
      festival: 'Eid',
      culturalSignificance: 'Nizami royal cuisine'
    }
  }
  // Continue adding more recipes...
];

// Generate additional recipes programmatically
const generateMoreRecipes = () => {
  const additionalRecipes = [];
  const cuisines = ['NORTH_INDIAN', 'SOUTH_INDIAN', 'CHINESE', 'ITALIAN', 'MEXICAN', 'THAI', 'JAPANESE'];
  const categories = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Appetizer'];
  const difficulties = ['EASY', 'MEDIUM', 'HARD'];
  const spiceLevels = ['MILD', 'MEDIUM', 'SPICY', 'VERY_SPICY'];
  
  const recipeTemplates = [
    { name: 'Chicken Curry', base: 'chicken', time: 45 },
    { name: 'Vegetable Stir Fry', base: 'vegetables', time: 20 },
    { name: 'Fish Fry', base: 'fish', time: 25 },
    { name: 'Lentil Soup', base: 'lentils', time: 35 },
    { name: 'Rice Bowl', base: 'rice', time: 30 },
    { name: 'Noodle Soup', base: 'noodles', time: 25 },
    { name: 'Grilled Meat', base: 'meat', time: 40 },
    { name: 'Salad Bowl', base: 'salad', time: 15 },
    { name: 'Sandwich', base: 'bread', time: 10 },
    { name: 'Smoothie Bowl', base: 'fruits', time: 5 }
  ];
  
  for (let i = 0; i < 90; i++) {
    const template = recipeTemplates[i % recipeTemplates.length];
    const cuisine = cuisines[i % cuisines.length];
    const category = categories[i % categories.length];
    const difficulty = difficulties[i % difficulties.length];
    const spiceLevel = spiceLevels[i % spiceLevels.length];
    
    additionalRecipes.push({
      title: `${cuisine.replace('_', ' ')} Style ${template.name} ${i + 1}`,
      description: `Delicious ${cuisine.toLowerCase().replace('_', ' ')} ${template.name.toLowerCase()} with authentic flavors`,
      image: `https://images.unsplash.com/photo-${1500000000000 + i}?w=400`,
      cookingTime: template.time + (i % 20),
      prepTime: 15 + (i % 10),
      totalTime: template.time + 15 + (i % 30),
      difficulty,
      servings: 2 + (i % 6),
      steps: [
        'Prepare all ingredients',
        'Heat oil in pan',
        'Add spices and aromatics',
        'Cook main ingredients',
        'Season and serve hot'
      ],
      tags: [cuisine.toLowerCase(), template.base, category.toLowerCase()],
      category,
      ingredients: [
        { name: `Main ingredient (${template.base})`, quantity: '500g' },
        { name: 'Onions', quantity: '2 medium' },
        { name: 'Garlic', quantity: '4 cloves' },
        { name: 'Spices', quantity: '2 tsp' },
        { name: 'Oil', quantity: '2 tbsp' }
      ],
      equipment: ['Pan', 'Knife', 'Cutting board'],
      tips: ['Use fresh ingredients', 'Adjust spices to taste'],
      nutrition: {
        calories: 250 + (i % 300),
        protein: 15 + (i % 20),
        carbs: 20 + (i % 40),
        fat: 8 + (i % 15)
      },
      culturalTag: {
        cuisineType: cuisine,
        dietTypes: template.base === 'vegetables' ? ['VEGETARIAN'] : ['NON_VEGETARIAN'],
        spiceLevel,
        region: 'Various',
        culturalSignificance: 'Popular regional dish'
      }
    });
  }
  
  return additionalRecipes;
};

const allRecipes = [...enhancedRecipesData, ...generateMoreRecipes()];

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    // Create demo users
    const users = await Promise.all([
      prisma.user.upsert({
        where: { email: 'chef@demo.com' },
        update: {},
        create: {
          name: 'Master Chef',
          email: 'chef@demo.com',
          provider: 'GOOGLE',
          providerId: 'google-123',
          avatar: 'https://i.pravatar.cc/100?u=chef',
          country: 'IN',
          state: 'MH',
          city: 'Mumbai',
          isOnboardingComplete: true
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
          avatar: 'https://i.pravatar.cc/100?u=foodie',
          country: 'IN',
          state: 'DL',
          city: 'New Delhi',
          isOnboardingComplete: true
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
          avatar: 'https://i.pravatar.cc/100?u=homecook',
          country: 'IN',
          state: 'KA',
          city: 'Bangalore',
          isOnboardingComplete: true
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
          avatar: 'https://i.pravatar.cc/100?u=baker',
          country: 'IN',
          state: 'TN',
          city: 'Chennai',
          isOnboardingComplete: true
        }
      }),
      prisma.user.upsert({
        where: { email: 'spicechef@demo.com' },
        update: {},
        create: {
          name: 'Spice Master',
          email: 'spicechef@demo.com',
          provider: 'GOOGLE',
          providerId: 'google-102',
          avatar: 'https://i.pravatar.cc/100?u=spicechef',
          country: 'IN',
          state: 'RJ',
          city: 'Jaipur',
          isOnboardingComplete: true
        }
      })
    ]);

    console.log('Users created successfully');

    // Create courses
    for (const courseData of coursesData) {
      const course = await prisma.course.create({
        data: {
          title: courseData.title,
          description: courseData.description,
          instructor: courseData.instructor,
          instructorAvatar: courseData.instructorAvatar,
          image: courseData.image,
          duration: courseData.duration,
          level: courseData.level,
          category: courseData.category,
          price: courseData.price,
          rating: courseData.rating,
          studentsCount: courseData.studentsCount,
          lessonsCount: courseData.lessonsCount
        }
      });

      // Create lessons for each course
      for (const lessonData of courseData.lessons) {
        await prisma.lesson.create({
          data: {
            ...lessonData,
            courseId: course.id
          }
        });
      }
    }

    console.log('Courses and lessons created successfully');

    // Create recipes with cultural tags
    for (let i = 0; i < allRecipes.length; i++) {
      const recipeData = allRecipes[i];
      const authorIndex = i % users.length;
      
      const recipe = await prisma.recipe.create({
        data: {
          title: recipeData.title,
          description: recipeData.description,
          image: recipeData.image,
          cookingTime: recipeData.cookingTime,
          steps: recipeData.steps,
          tags: recipeData.tags,
          category: recipeData.category,
          difficulty: recipeData.difficulty,
          servings: recipeData.servings,
          prepTime: recipeData.prepTime,
          totalTime: recipeData.totalTime,
          equipment: recipeData.equipment,
          tips: recipeData.tips,
          nutrition: recipeData.nutrition,
          author: { connect: { id: users[authorIndex].id } },
          ingredients: { create: recipeData.ingredients }
        }
      });

      // Create cultural tag if provided
      if (recipeData.culturalTag) {
        await prisma.recipeCulturalTag.create({
          data: {
            recipeId: recipe.id,
            ...recipeData.culturalTag
          }
        });
      }

      // Create some ratings, likes, and comments
      const numRatings = Math.floor(Math.random() * 10) + 1;
      for (let j = 0; j < numRatings; j++) {
        const userIndex = j % users.length;
        await prisma.rating.create({
          data: {
            rating: Math.floor(Math.random() * 5) + 1,
            userId: users[userIndex].id,
            recipeId: recipe.id
          }
        });
      }

      const numLikes = Math.floor(Math.random() * 15) + 1;
      for (let j = 0; j < numLikes; j++) {
        const userIndex = j % users.length;
        try {
          await prisma.recipeLike.create({
            data: {
              userId: users[userIndex].id,
              recipeId: recipe.id
            }
          });
        } catch (error) {
          // Skip duplicate likes
        }
      }

      const numComments = Math.floor(Math.random() * 8) + 1;
      const comments = [
        'Absolutely delicious!',
        'Perfect recipe, will make again',
        'Easy to follow instructions',
        'Great flavors, loved it',
        'My family enjoyed this',
        'Authentic taste',
        'Quick and tasty',
        'Highly recommended'
      ];
      
      for (let j = 0; j < numComments; j++) {
        const userIndex = j % users.length;
        await prisma.comment.create({
          data: {
            content: comments[j % comments.length],
            userId: users[userIndex].id,
            recipeId: recipe.id
          }
        });
      }

      // Create some recipe views
      const numViews = Math.floor(Math.random() * 50) + 10;
      for (let j = 0; j < numViews; j++) {
        const userIndex = j % users.length;
        await prisma.recipeView.create({
          data: {
            recipeId: recipe.id,
            userId: users[userIndex].id,
            viewedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date in last 30 days
          }
        });
      }
    }

    console.log('Recipes created successfully');

    // Create some user follows
    for (let i = 0; i < users.length; i++) {
      for (let j = 0; j < users.length; j++) {
        if (i !== j && Math.random() > 0.5) {
          try {
            await prisma.userFollow.create({
              data: {
                followerId: users[i].id,
                followingId: users[j].id
              }
            });
          } catch (error) {
            // Skip duplicate follows
          }
        }
      }
    }

    // Create cultural preferences for users
    for (const user of users) {
      await prisma.culturalPreference.create({
        data: {
          userId: user.id,
          religion: ['HINDU', 'MUSLIM', 'CHRISTIAN'][Math.floor(Math.random() * 3)],
          dietTypes: ['VEGETARIAN', 'NON_VEGETARIAN'][Math.floor(Math.random() * 2)] === 'VEGETARIAN' ? ['VEGETARIAN'] : ['NON_VEGETARIAN'],
          preferredCuisines: ['NORTH_INDIAN', 'SOUTH_INDIAN', 'CHINESE', 'ITALIAN'].slice(0, Math.floor(Math.random() * 3) + 1),
          spiceLevel: ['MILD', 'MEDIUM', 'SPICY'][Math.floor(Math.random() * 3)],
          avoidIngredients: [],
          preferredIngredients: ['garlic', 'ginger', 'onion'],
          culturalRestrictions: [],
          festivalPreferences: ['Diwali', 'Eid', 'Christmas'],
          regionalPreferences: ['North Indian', 'South Indian']
        }
      });
    }

    // Create user analytics
    for (const user of users) {
      const recipesCreated = await prisma.recipe.count({
        where: { authorId: user.id }
      });
      
      const recipesLiked = await prisma.recipeLike.count({
        where: { userId: user.id }
      });
      
      const followersCount = await prisma.userFollow.count({
        where: { followingId: user.id }
      });
      
      const followingCount = await prisma.userFollow.count({
        where: { followerId: user.id }
      });
      
      const totalRecipeViews = await prisma.recipeView.count({
        where: { recipe: { authorId: user.id } }
      });
      
      await prisma.userAnalytics.create({
        data: {
          userId: user.id,
          recipesCreated,
          recipesLiked,
          recipesBookmarked: Math.floor(Math.random() * 10),
          followersCount,
          followingCount,
          totalRecipeViews,
          avgRecipeRating: 4.0 + Math.random(),
          lastActive: new Date()
        }
      });
    }

    // Create some course enrollments
    for (const user of users) {
      const courses = await prisma.course.findMany();
      const numEnrollments = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < numEnrollments; i++) {
        const course = courses[i % courses.length];
        try {
          await prisma.courseEnrollment.create({
            data: {
              userId: user.id,
              courseId: course.id,
              progress: Math.random() * 100,
              completedLessons: []
            }
          });
        } catch (error) {
          // Skip duplicate enrollments
        }
      }
    }

    console.log('Database seeded successfully with 100+ recipes and comprehensive data!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
seedDatabase()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });