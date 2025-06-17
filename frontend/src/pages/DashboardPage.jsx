import { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FaChartLine, 
  FaUtensils, 
  FaHeart, 
  FaEye, 
  FaUsers, 
  FaCalendarAlt,
  FaShoppingCart,
  FaClock,
  FaStar,
  FaArrowUp,
  FaArrowDown,
  FaTrendingUp
} from 'react-icons/fa';

const GET_DASHBOARD_SUMMARY = gql`
  query GetDashboardSummary {
    getDashboardSummary {
      userAnalytics {
        id
        recipesCreated
        recipesLiked
        recipesBookmarked
        followersCount
        followingCount
        totalRecipeViews
        avgRecipeRating
        lastActive
      }
      recentActivity {
        id
        type
        description
        timestamp
        relatedId
      }
      weeklyStats {
        recipesCreated
        recipesViewed
        likesReceived
        commentsReceived
        newFollowers
      }
      popularRecipes {
        id
        title
        image
        likes {
          id
        }
        ratings {
          rating
        }
        createdAt
      }
      upcomingMeals {
        id
        dayOfWeek
        mealType
        servings
        recipe {
          id
          title
          image
          cookingTime
        }
      }
    }
  }
`;

const DashboardPage = () => {
  const { data, loading, error } = useQuery(GET_DASHBOARD_SUMMARY, {
    fetchPolicy: 'cache-and-network'
  });

  if (loading) return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 card-shadow animate-pulse">
              <div className="skeleton h-12 w-12 rounded-full mb-4"></div>
              <div className="skeleton h-8 w-20 mb-2"></div>
              <div className="skeleton h-4 w-16"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen gradient-bg flex items-center justify-center">
      <div className="bg-white rounded-3xl card-shadow p-8 text-center max-w-md">
        <div className="text-6xl mb-4">😞</div>
        <h2 className="text-2xl font-bold mb-2 text-red-600">Error Loading Dashboard</h2>
        <p className="text-gray-600">Please try again later.</p>
      </div>
    </div>
  );

  const dashboard = data?.getDashboardSummary;
  const analytics = dashboard?.userAnalytics;
  const weeklyStats = dashboard?.weeklyStats;

  const statCards = [
    {
      title: 'Recipes Created',
      value: analytics?.recipesCreated || 0,
      change: weeklyStats?.recipesCreated || 0,
      icon: FaUtensils,
      color: 'var(--primary-green)',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Views',
      value: analytics?.totalRecipeViews || 0,
      change: weeklyStats?.recipesViewed || 0,
      icon: FaEye,
      color: 'var(--accent-orange)',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Followers',
      value: analytics?.followersCount || 0,
      change: weeklyStats?.newFollowers || 0,
      icon: FaUsers,
      color: 'var(--warm-yellow)',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Avg Rating',
      value: analytics?.avgRecipeRating?.toFixed(1) || '0.0',
      change: 0,
      icon: FaStar,
      color: 'var(--sage-green)',
      bgColor: 'bg-blue-50'
    }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'recipe_created': return <FaUtensils className="text-green-500" />;
      case 'like_received': return <FaHeart className="text-red-500" />;
      case 'comment_received': return <FaUsers className="text-blue-500" />;
      case 'follow_received': return <FaUsers className="text-purple-500" />;
      default: return <FaTrendingUp className="text-gray-500" />;
    }
  };

  const getDayName = (dayOfWeek) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--primary-green)' }}>
                Dashboard
              </h1>
              <p className="text-lg text-gray-600">
                Welcome back! Here's your cooking journey overview.
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                to="/meal-planner"
                className="btn-secondary flex items-center gap-2"
              >
                <FaCalendarAlt />
                Meal Planner
              </Link>
              <Link
                to="/create-recipe"
                className="btn-primary flex items-center gap-2"
              >
                <FaUtensils />
                Create Recipe
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              className={`bg-white rounded-2xl p-6 card-shadow hover-lift ${stat.bgColor}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center"
                     style={{ background: stat.color }}>
                  <stat.icon className="text-white text-xl" />
                </div>
                {stat.change !== 0 && (
                  <div className={`flex items-center gap-1 text-sm font-semibold ${
                    stat.change > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change > 0 ? <FaArrowUp /> : <FaArrowDown />}
                    +{stat.change}
                  </div>
                )}
              </div>
              <div className="text-3xl font-bold mb-1" style={{ color: 'var(--dark-text)' }}>
                {stat.value}
              </div>
              <div className="text-sm font-medium" style={{ color: 'var(--sage-green)' }}>
                {stat.title}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="bg-white rounded-3xl card-shadow p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                     style={{ background: 'linear-gradient(135deg, var(--primary-green) 0%, var(--light-green) 100%)' }}>
                  <FaChartLine className="text-white" />
                </div>
                <h2 className="text-xl font-bold" style={{ color: 'var(--primary-green)' }}>
                  Recent Activity
                </h2>
              </div>
              
              <div className="space-y-4">
                {dashboard?.recentActivity?.length > 0 ? (
                  dashboard.recentActivity.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors duration-300"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="flex-shrink-0 mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: 'var(--dark-text)' }}>
                          {activity.description}
                        </p>
                        <p className="text-xs mt-1" style={{ color: 'var(--sage-green)' }}>
                          {new Date(parseInt(activity.timestamp)).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📊</div>
                    <p className="text-gray-600">No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Quick Actions & Upcoming Meals */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Quick Actions */}
            <div className="bg-white rounded-3xl card-shadow p-6">
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--primary-green)' }}>
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  to="/create-recipe"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-300"
                >
                  <FaUtensils style={{ color: 'var(--primary-green)' }} />
                  <span className="font-medium">Create New Recipe</span>
                </Link>
                <Link
                  to="/meal-planner"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-300"
                >
                  <FaCalendarAlt style={{ color: 'var(--accent-orange)' }} />
                  <span className="font-medium">Plan Meals</span>
                </Link>
                <Link
                  to="/shopping-list"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-300"
                >
                  <FaShoppingCart style={{ color: 'var(--warm-yellow)' }} />
                  <span className="font-medium">Shopping List</span>
                </Link>
                <Link
                  to="/analytics"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-300"
                >
                  <FaChartLine style={{ color: 'var(--sage-green)' }} />
                  <span className="font-medium">View Analytics</span>
                </Link>
              </div>
            </div>

            {/* Upcoming Meals */}
            <div className="bg-white rounded-3xl card-shadow p-6">
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--primary-green)' }}>
                Upcoming Meals
              </h3>
              <div className="space-y-3">
                {dashboard?.upcomingMeals?.length > 0 ? (
                  dashboard.upcomingMeals.slice(0, 3).map((meal, index) => (
                    <div
                      key={meal.id}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: 'var(--cream)' }}
                    >
                      <img
                        src={meal.recipe.image}
                        alt={meal.recipe.title}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm" style={{ color: 'var(--dark-text)' }}>
                          {meal.recipe.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--sage-green)' }}>
                          <span>{getDayName(meal.dayOfWeek)}</span>
                          <span>•</span>
                          <span className="capitalize">{meal.mealType}</span>
                          <span>•</span>
                          <FaClock className="inline" />
                          <span>{meal.recipe.cookingTime}m</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <div className="text-3xl mb-2">🍽️</div>
                    <p className="text-sm text-gray-600">No meals planned</p>
                    <Link
                      to="/meal-planner"
                      className="text-xs text-green-600 hover:underline mt-1 inline-block"
                    >
                      Start planning
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Popular Recipes */}
        {dashboard?.popularRecipes?.length > 0 && (
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="bg-white rounded-3xl card-shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold" style={{ color: 'var(--primary-green)' }}>
                  Your Popular Recipes
                </h2>
                <Link
                  to="/profile"
                  className="text-sm font-medium hover:underline"
                  style={{ color: 'var(--sage-green)' }}
                >
                  View All
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboard.popularRecipes.slice(0, 3).map((recipe, index) => (
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
                      </div>
                      <h3 className="font-semibold mb-2 group-hover:text-green-700 transition-colors duration-300" 
                          style={{ color: 'var(--dark-text)' }}>
                        {recipe.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm" style={{ color: 'var(--sage-green)' }}>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <FaHeart className="text-red-500" />
                            <span>{recipe.likes?.length || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FaStar className="text-yellow-400" />
                            <span>
                              {recipe.ratings?.length > 0 
                                ? (recipe.ratings.reduce((sum, r) => sum + r.rating, 0) / recipe.ratings.length).toFixed(1)
                                : '0.0'
                              }
                            </span>
                          </div>
                        </div>
                        <span className="text-xs">
                          {new Date(parseInt(recipe.createdAt)).toLocaleDateString()}
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;