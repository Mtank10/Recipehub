import { useQuery, gql } from '@apollo/client';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaUsers, FaTrophy, FaFire, FaHeart, FaCrown, FaStar, FaEye, FaComment } from 'react-icons/fa';

// Mock data for demonstration
const topChefs = [
  {
    id: '1',
    name: 'Chef Marco Rossi',
    avatar: 'https://i.pravatar.cc/100?u=marco',
    followersCount: 2450,
    recipesCount: 89,
    totalLikes: 15600,
    badge: 'Master Chef'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    avatar: 'https://i.pravatar.cc/100?u=sarah',
    followersCount: 1890,
    recipesCount: 67,
    totalLikes: 12300,
    badge: 'Baking Expert'
  },
  {
    id: '3',
    name: 'Kenji Tanaka',
    avatar: 'https://i.pravatar.cc/100?u=kenji',
    followersCount: 1650,
    recipesCount: 54,
    totalLikes: 9800,
    badge: 'Asian Cuisine'
  },
  {
    id: '4',
    name: 'Emma Green',
    avatar: 'https://i.pravatar.cc/100?u=emma',
    followersCount: 1420,
    recipesCount: 72,
    totalLikes: 8900,
    badge: 'Healthy Chef'
  },
  {
    id: '5',
    name: 'David Wilson',
    avatar: 'https://i.pravatar.cc/100?u=david',
    followersCount: 1200,
    recipesCount: 45,
    totalLikes: 7600,
    badge: 'Grill Master'
  }
];

const recentActivity = [
  {
    id: 1,
    type: 'like',
    user: { name: 'Alice Cooper', avatar: 'https://i.pravatar.cc/40?u=alice' },
    recipe: { title: 'Chocolate Lava Cake', id: '1' },
    time: '2 minutes ago'
  },
  {
    id: 2,
    type: 'comment',
    user: { name: 'Bob Smith', avatar: 'https://i.pravatar.cc/40?u=bob' },
    recipe: { title: 'Pasta Carbonara', id: '2' },
    time: '15 minutes ago'
  },
  {
    id: 3,
    type: 'follow',
    user: { name: 'Carol Davis', avatar: 'https://i.pravatar.cc/40?u=carol' },
    target: { name: 'Chef Marco', id: '1' },
    time: '1 hour ago'
  },
  {
    id: 4,
    type: 'recipe',
    user: { name: 'Diana Prince', avatar: 'https://i.pravatar.cc/40?u=diana' },
    recipe: { title: 'Mediterranean Bowl', id: '3' },
    time: '2 hours ago'
  },
  {
    id: 5,
    type: 'rating',
    user: { name: 'Frank Miller', avatar: 'https://i.pravatar.cc/40?u=frank' },
    recipe: { title: 'Thai Green Curry', id: '4' },
    rating: 5,
    time: '3 hours ago'
  }
];

const trendingRecipes = [
  {
    id: '1',
    title: 'Viral TikTok Pasta',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=300',
    likes: 1250,
    views: 8900,
    author: 'Chef Lisa'
  },
  {
    id: '2',
    title: 'Cloud Bread Recipe',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300',
    likes: 980,
    views: 6700,
    author: 'Baker Tom'
  },
  {
    id: '3',
    title: 'Dalgona Coffee Cake',
    image: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=300',
    likes: 756,
    views: 5400,
    author: 'Sweet Sarah'
  }
];

const CommunityPage = () => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'like': return <FaHeart className="text-red-500" />;
      case 'comment': return <FaComment className="text-blue-500" />;
      case 'follow': return <FaUsers className="text-green-500" />;
      case 'recipe': return <FaFire className="text-orange-500" />;
      case 'rating': return <FaStar className="text-yellow-500" />;
      default: return <FaFire className="text-gray-500" />;
    }
  };

  const getActivityText = (activity) => {
    switch (activity.type) {
      case 'like':
        return (
          <>
            <span className="font-semibold">{activity.user.name}</span> liked{' '}
            <Link to={`/recipe/${activity.recipe.id}`} className="text-green-600 hover:underline">
              {activity.recipe.title}
            </Link>
          </>
        );
      case 'comment':
        return (
          <>
            <span className="font-semibold">{activity.user.name}</span> commented on{' '}
            <Link to={`/recipe/${activity.recipe.id}`} className="text-green-600 hover:underline">
              {activity.recipe.title}
            </Link>
          </>
        );
      case 'follow':
        return (
          <>
            <span className="font-semibold">{activity.user.name}</span> started following{' '}
            <Link to={`/profile/${activity.target.id}`} className="text-green-600 hover:underline">
              {activity.target.name}
            </Link>
          </>
        );
      case 'recipe':
        return (
          <>
            <span className="font-semibold">{activity.user.name}</span> shared a new recipe:{' '}
            <Link to={`/recipe/${activity.recipe.id}`} className="text-green-600 hover:underline">
              {activity.recipe.title}
            </Link>
          </>
        );
      case 'rating':
        return (
          <>
            <span className="font-semibold">{activity.user.name}</span> gave {activity.rating} stars to{' '}
            <Link to={`/recipe/${activity.recipe.id}`} className="text-green-600 hover:underline">
              {activity.recipe.title}
            </Link>
          </>
        );
      default:
        return 'Unknown activity';
    }
  };

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, var(--sage-green) 0%, var(--primary-green) 100%)' }}>
              <FaUsers className="text-white text-2xl" />
            </div>
            <h1 className="text-4xl font-bold" style={{ color: 'var(--primary-green)' }}>
              Cooking Community
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with fellow food enthusiasts, discover trending recipes, and celebrate culinary excellence
          </p>
        </motion.div>

        {/* Community Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {[
            { icon: FaUsers, label: 'Active Chefs', value: '2.5K+', color: 'var(--primary-green)' },
            { icon: FaFire, label: 'Recipes Shared', value: '15K+', color: 'var(--accent-orange)' },
            { icon: FaHeart, label: 'Total Likes', value: '250K+', color: 'var(--warm-yellow)' },
            { icon: FaComment, label: 'Comments', value: '50K+', color: 'var(--sage-green)' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="bg-white rounded-2xl p-6 card-shadow text-center hover-lift"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
            >
              <stat.icon className="text-3xl mx-auto mb-3" style={{ color: stat.color }} />
              <div className="text-2xl font-bold mb-1" style={{ color: 'var(--dark-text)' }}>
                {stat.value}
              </div>
              <div className="text-sm font-medium" style={{ color: 'var(--sage-green)' }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Chefs Leaderboard */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="bg-white rounded-3xl card-shadow p-6 sticky top-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                     style={{ background: 'linear-gradient(135deg, var(--warm-yellow) 0%, var(--accent-orange) 100%)' }}>
                  <FaTrophy className="text-white" />
                </div>
                <h2 className="text-xl font-bold" style={{ color: 'var(--primary-green)' }}>
                  Top Chefs
                </h2>
              </div>
              
              <div className="space-y-4">
                {topChefs.map((chef, index) => (
                  <motion.div
                    key={chef.id}
                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 cursor-pointer transition-all duration-300 hover-lift"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="relative">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm"
                           style={{ 
                             background: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : 'var(--sage-green)'
                           }}>
                        {index < 3 ? <FaCrown /> : index + 1}
                      </div>
                    </div>
                    
                    <Link to={`/profile/${chef.id}`} className="flex items-center gap-3 flex-1">
                      <img
                        src={chef.avatar}
                        alt={chef.name}
                        className="w-12 h-12 rounded-full border-2 border-green-200 object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm" style={{ color: 'var(--dark-text)' }}>
                          {chef.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--sage-green)' }}>
                          <span>{chef.followersCount} followers</span>
                          <span>•</span>
                          <span>{chef.recipesCount} recipes</span>
                        </div>
                        <div className="text-xs px-2 py-1 rounded-full mt-1 inline-block"
                             style={{ background: 'var(--cream)', color: 'var(--primary-green)' }}>
                          {chef.badge}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
              
              <button className="btn-secondary w-full mt-6">
                View Full Leaderboard
              </button>
            </div>
          </motion.div>

          {/* Recent Activity & Trending */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Activity */}
            <motion.div
              className="bg-white rounded-3xl card-shadow p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                     style={{ background: 'linear-gradient(135deg, var(--primary-green) 0%, var(--light-green) 100%)' }}>
                  <FaFire className="text-white" />
                </div>
                <h2 className="text-xl font-bold" style={{ color: 'var(--primary-green)' }}>
                  Recent Activity
                </h2>
              </div>
              
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors duration-300"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <img
                      src={activity.user.avatar}
                      alt={activity.user.name}
                      className="w-10 h-10 rounded-full border-2 border-green-200 object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getActivityIcon(activity.type)}
                        <p className="text-sm" style={{ color: 'var(--dark-text)' }}>
                          {getActivityText(activity)}
                        </p>
                      </div>
                      <p className="text-xs" style={{ color: 'var(--sage-green)' }}>
                        {activity.time}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Trending Recipes */}
            <motion.div
              className="bg-white rounded-3xl card-shadow p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                     style={{ background: 'linear-gradient(135deg, var(--accent-orange) 0%, var(--warm-yellow) 100%)' }}>
                  <FaFire className="text-white" />
                </div>
                <h2 className="text-xl font-bold" style={{ color: 'var(--primary-green)' }}>
                  Trending Recipes
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {trendingRecipes.map((recipe, index) => (
                  <motion.div
                    key={recipe.id}
                    className="group cursor-pointer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Link to={`/recipe/${recipe.id}`}>
                      <div className="relative overflow-hidden rounded-2xl mb-3">
                        <img
                          src={recipe.image}
                          alt={recipe.title}
                          className="w-full h-32 object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs font-bold">
                          #{index + 1}
                        </div>
                      </div>
                      <h3 className="font-semibold text-sm mb-2 group-hover:text-green-700 transition-colors duration-300" 
                          style={{ color: 'var(--dark-text)' }}>
                        {recipe.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs" style={{ color: 'var(--sage-green)' }}>
                        <span>by {recipe.author}</span>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <FaHeart className="text-red-500" />
                            <span>{recipe.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FaEye />
                            <span>{recipe.views}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="bg-white rounded-3xl card-shadow p-8 max-w-2xl mx-auto">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--primary-green)' }}>
              Join Our Growing Community
            </h3>
            <p className="text-gray-600 mb-6">
              Share your recipes, connect with fellow food lovers, and be part of the culinary revolution.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/create-recipe" className="btn-primary">
                Share Your Recipe
              </Link>
              <button className="btn-secondary">
                Explore Community
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CommunityPage;