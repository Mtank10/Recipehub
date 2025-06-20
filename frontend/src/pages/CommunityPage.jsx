import { useQuery, gql } from '@apollo/client';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaUsers, FaTrophy, FaFire, FaHeart, FaCrown, FaStar, FaEye, FaComment, FaUtensils } from 'react-icons/fa';

const GET_COMMUNITY_DATA = gql`
  query GetCommunityData {
    getCommunityData {
      stats {
        totalUsers
        totalRecipes
        totalLikes
        totalComments
        activeUsers
        newUsersThisWeek
        recipesThisWeek
      }
      trendingRecipes {
        id
        title
        image
        author {
          id
          name
          avatar
        }
        likes {
          id
        }
        views {
          id
        }
        comments {
          id
        }
        trendingScore
        createdAt
      }
      topChefs {
        id
        name
        avatar
        recipesCount
        followersCount
        totalLikes
        avgRating
        badge
      }
      recentActivity {
        id
        type
        user {
          id
          name
          avatar
        }
        recipe {
          id
          title
        }
        targetUser {
          id
          name
        }
        content
        timestamp
      }
    }
  }
`;

const CommunityPage = () => {
  const { data, loading, error } = useQuery(GET_COMMUNITY_DATA, {
    fetchPolicy: 'cache-and-network'
  });

  const getActivityIcon = (type) => {
    switch (type) {
      case 'RECIPE_CREATED': return <FaUtensils className="text-green-500" />;
      case 'RECIPE_LIKED': return <FaHeart className="text-red-500" />;
      case 'RECIPE_COMMENTED': return <FaComment className="text-blue-500" />;
      case 'USER_FOLLOWED': return <FaUsers className="text-purple-500" />;
      case 'RECIPE_RATED': return <FaStar className="text-yellow-500" />;
      default: return <FaFire className="text-gray-500" />;
    }
  };

  if (loading) return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="skeleton h-8 w-64 mb-6"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-20 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="skeleton h-64 rounded-xl"></div>
          <div className="lg:col-span-2 skeleton h-64 rounded-xl"></div>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen gradient-bg flex items-center justify-center">
      <div className="bg-white rounded-xl card-shadow p-8 text-center max-w-md">
        <div className="text-4xl mb-4">😞</div>
        <h2 className="text-lg font-bold mb-2 text-red-600">Error Loading Community</h2>
        <p className="text-gray-600 text-sm">Please try again later.</p>
      </div>
    </div>
  );

  const community = data?.getCommunityData;

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, var(--sage-green) 0%, var(--primary-green) 100%)' }}>
              <FaUsers className="text-white text-xl" />
            </div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--primary-green)' }}>
              Cooking Community
            </h1>
          </div>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Connect with fellow food enthusiasts, discover trending recipes, and celebrate culinary excellence
          </p>
        </motion.div>

        {/* Community Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {[
            { icon: FaUsers, label: 'Active Chefs', value: community?.stats?.activeUsers || 0, color: 'var(--primary-green)' },
            { icon: FaUtensils, label: 'Recipes Shared', value: community?.stats?.totalRecipes || 0, color: 'var(--accent-orange)' },
            { icon: FaHeart, label: 'Total Likes', value: community?.stats?.totalLikes || 0, color: 'var(--warm-yellow)' },
            { icon: FaComment, label: 'Comments', value: community?.stats?.totalComments || 0, color: 'var(--sage-green)' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="stats-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
            >
              <stat.icon className="text-2xl mx-auto mb-2" style={{ color: stat.color }} />
              <div className="text-xl font-bold mb-1" style={{ color: 'var(--dark-text)' }}>
                {stat.value.toLocaleString()}
              </div>
              <div className="text-xs font-medium" style={{ color: 'var(--sage-green)' }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Chefs Leaderboard */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="bg-white rounded-xl card-shadow p-4 sticky top-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                     style={{ background: 'linear-gradient(135deg, var(--warm-yellow) 0%, var(--accent-orange) 100%)' }}>
                  <FaTrophy className="text-white text-sm" />
                </div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--primary-green)' }}>
                  Top Chefs
                </h2>
              </div>
              
              <div className="space-y-3">
                {community?.topChefs?.slice(0, 10).map((chef, index) => (
                  <motion.div
                    key={chef.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-300 hover-lift"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <div className="relative">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full text-white font-bold text-xs"
                           style={{ 
                             background: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : 'var(--sage-green)'
                           }}>
                        {index < 3 ? <FaCrown /> : index + 1}
                      </div>
                    </div>
                    
                    <Link to={`/profile/${chef.id}`} className="flex items-center gap-2 flex-1">
                      <img
                        src={chef.avatar || `https://i.pravatar.cc/40?u=${chef.name}`}
                        alt={chef.name}
                        className="w-8 h-8 rounded-full border border-green-200 object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-xs" style={{ color: 'var(--dark-text)' }}>
                          {chef.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--sage-green)' }}>
                          <span>{chef.followersCount} followers</span>
                          <span>•</span>
                          <span>{chef.recipesCount} recipes</span>
                        </div>
                        <div className="chef-badge">
                          {chef.badge}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
              
              <button className="btn-secondary w-full mt-4 text-xs">
                View Full Leaderboard
              </button>
            </div>
          </motion.div>

          {/* Recent Activity & Trending */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trending Recipes */}
            <motion.div
              className="bg-white rounded-xl card-shadow p-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                     style={{ background: 'linear-gradient(135deg, var(--accent-orange) 0%, var(--warm-yellow) 100%)' }}>
                  <FaFire className="text-white text-sm" />
                </div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--primary-green)' }}>
                  Trending Recipes
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {community?.trendingRecipes?.slice(0, 4).map((recipe, index) => (
                  <motion.div
                    key={recipe.id}
                    className="group cursor-pointer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Link to={`/recipe/${recipe.id}`}>
                      <div className="relative overflow-hidden rounded-lg mb-2">
                        <img
                          src={recipe.image}
                          alt={recipe.title}
                          className="w-full h-20 object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="trending-badge absolute top-1 right-1">
                          #{index + 1}
                        </div>
                      </div>
                      <h3 className="font-semibold text-xs mb-1 group-hover:text-green-700 transition-colors duration-300" 
                          style={{ color: 'var(--dark-text)' }}>
                        {recipe.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs" style={{ color: 'var(--sage-green)' }}>
                        <span>by {recipe.author.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <FaHeart className="text-red-500" />
                            <span>{recipe.likes?.length || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FaEye />
                            <span>{recipe.views?.length || 0}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              className="bg-white rounded-xl card-shadow p-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                     style={{ background: 'linear-gradient(135deg, var(--primary-green) 0%, var(--light-green) 100%)' }}>
                  <FaFire className="text-white text-sm" />
                </div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--primary-green)' }}>
                  Recent Activity
                </h2>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                {community?.recentActivity?.slice(0, 15).map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    className="activity-item flex items-start gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <img
                      src={activity.user.avatar || `https://i.pravatar.cc/24?u=${activity.user.name}`}
                      alt={activity.user.name}
                      className="w-6 h-6 rounded-full border border-green-200 object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-1">
                        {getActivityIcon(activity.type)}
                        <p className="text-xs" style={{ color: 'var(--dark-text)' }}>
                          <span className="font-semibold">{activity.user.name}</span>
                          {activity.type === 'RECIPE_CREATED' && ' shared a new recipe'}
                          {activity.type === 'RECIPE_LIKED' && ' liked'}
                          {activity.type === 'RECIPE_COMMENTED' && ' commented on'}
                          {activity.type === 'USER_FOLLOWED' && ' started following'}
                          {activity.type === 'RECIPE_RATED' && ' rated'}
                          {activity.recipe && (
                            <Link to={`/recipe/${activity.recipe.id}`} className="text-green-600 hover:underline ml-1">
                              {activity.recipe.title}
                            </Link>
                          )}
                          {activity.targetUser && (
                            <Link to={`/profile/${activity.targetUser.id}`} className="text-green-600 hover:underline ml-1">
                              {activity.targetUser.name}
                            </Link>
                          )}
                        </p>
                      </div>
                      <p className="text-xs" style={{ color: 'var(--sage-green)' }}>
                        {new Date(activity.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="bg-white rounded-xl card-shadow p-6 max-w-2xl mx-auto">
            <div className="text-3xl mb-3">🤝</div>
            <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--primary-green)' }}>
              Join Our Growing Community
            </h3>
            <p className="text-gray-600 mb-4 text-sm">
              Share your recipes, connect with fellow food lovers, and be part of the culinary revolution.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/create-recipe" className="btn-primary text-sm">
                Share Your Recipe
              </Link>
              <button className="btn-secondary text-sm">
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