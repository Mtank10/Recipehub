import { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { motion } from 'framer-motion';
import { 
  FaChartLine, 
  FaEye, 
  FaHeart, 
  FaComment, 
  FaUsers, 
  FaTrophy,
  FaArrowUp,
  FaArrowDown,
  FaCalendarAlt,
  FaUtensils
} from 'react-icons/fa';

const GET_DETAILED_ANALYTICS = gql`
  query GetDetailedAnalytics {
    getDetailedAnalytics {
      id
      recipesCreated
      recipesLiked
      recipesBookmarked
      followersCount
      followingCount
      totalRecipeViews
      avgRecipeRating
      totalComments
      totalRatingsReceived
      weeklyGrowth {
        recipesCreated
        newFollowers
        totalViews
        totalLikes
        totalComments
      }
      monthlyGrowth {
        recipesCreated
        newFollowers
        totalViews
        totalLikes
        totalComments
      }
      topRecipes {
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
      engagementRate
    }
  }
`;

const GET_ANALYTICS_OVERVIEW = gql`
  query GetAnalyticsOverview($period: String!) {
    getAnalyticsOverview(period: $period) {
      totalViews
      totalLikes
      totalComments
      totalFollowers
      growthRate
      topPerformingRecipe {
        id
        title
        image
        likes {
          id
        }
      }
      chartData {
        date
        views
        likes
        comments
      }
    }
  }
`;

const AnalyticsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const { data: detailedData, loading: detailedLoading } = useQuery(GET_DETAILED_ANALYTICS, {
    fetchPolicy: 'cache-and-network'
  });

  const { data: overviewData, loading: overviewLoading } = useQuery(GET_ANALYTICS_OVERVIEW, {
    variables: { period: selectedPeriod },
    fetchPolicy: 'cache-and-network'
  });

  const analytics = detailedData?.getDetailedAnalytics;
  const overview = overviewData?.getAnalyticsOverview;

  const periods = [
    { value: 'week', label: 'Last Week' },
    { value: 'month', label: 'Last Month' },
    { value: 'year', label: 'Last Year' }
  ];

  const mainStats = [
    {
      title: 'Total Views',
      value: analytics?.totalRecipeViews || 0,
      change: analytics?.weeklyGrowth?.totalViews || 0,
      icon: FaEye,
      color: 'var(--accent-orange)',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Total Likes',
      value: analytics?.recipesLiked || 0,
      change: analytics?.weeklyGrowth?.totalLikes || 0,
      icon: FaHeart,
      color: 'var(--warm-yellow)',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Followers',
      value: analytics?.followersCount || 0,
      change: analytics?.weeklyGrowth?.newFollowers || 0,
      icon: FaUsers,
      color: 'var(--primary-green)',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Engagement Rate',
      value: `${analytics?.engagementRate?.toFixed(1) || 0}%`,
      change: 0,
      icon: FaChartLine,
      color: 'var(--sage-green)',
      bgColor: 'bg-blue-50'
    }
  ];

  const performanceStats = [
    {
      title: 'Recipes Created',
      value: analytics?.recipesCreated || 0,
      weekly: analytics?.weeklyGrowth?.recipesCreated || 0,
      monthly: analytics?.monthlyGrowth?.recipesCreated || 0,
      icon: FaUtensils
    },
    {
      title: 'Comments Received',
      value: analytics?.totalComments || 0,
      weekly: analytics?.weeklyGrowth?.totalComments || 0,
      monthly: analytics?.monthlyGrowth?.totalComments || 0,
      icon: FaComment
    },
    {
      title: 'Average Rating',
      value: analytics?.avgRecipeRating?.toFixed(1) || '0.0',
      weekly: 0,
      monthly: 0,
      icon: FaTrophy
    }
  ];

  if (detailedLoading || overviewLoading) return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="skeleton h-8 w-48 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-24 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="skeleton h-64 rounded-xl"></div>
          <div className="skeleton h-64 rounded-xl"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--primary-green)' }}>
              Analytics Dashboard
            </h1>
            <p className="text-sm text-gray-600">
              Track your recipe performance and engagement
            </p>
          </div>
          <div className="flex gap-2">
            {periods.map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  selectedPeriod === period.value
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-green-50'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Main Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {mainStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              className={`stats-card ${stat.bgColor}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                     style={{ background: stat.color }}>
                  <stat.icon className="text-white text-lg" />
                </div>
                {stat.change !== 0 && (
                  <div className={`flex items-center gap-1 text-xs font-semibold ${
                    stat.change > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change > 0 ? <FaArrowUp /> : <FaArrowDown />}
                    {Math.abs(stat.change)}
                  </div>
                )}
              </div>
              <div className="text-2xl font-bold mb-1" style={{ color: 'var(--dark-text)' }}>
                {stat.value}
              </div>
              <div className="text-xs font-medium" style={{ color: 'var(--sage-green)' }}>
                {stat.title}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Overview */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="bg-white rounded-xl card-shadow p-6">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--primary-green)' }}>
                <FaChartLine />
                Performance Overview
              </h2>
              
              <div className="space-y-4">
                {performanceStats.map((stat, index) => (
                  <motion.div
                    key={stat.title}
                    className="p-4 rounded-lg"
                    style={{ background: 'var(--cream)' }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <stat.icon style={{ color: 'var(--primary-green)' }} />
                        <h3 className="font-semibold text-sm" style={{ color: 'var(--dark-text)' }}>
                          {stat.title}
                        </h3>
                      </div>
                      <div className="text-xl font-bold" style={{ color: 'var(--primary-green)' }}>
                        {stat.value}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <span style={{ color: 'var(--sage-green)' }}>This week:</span>
                        <span className="font-semibold">+{stat.weekly}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span style={{ color: 'var(--sage-green)' }}>This month:</span>
                        <span className="font-semibold">+{stat.monthly}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Growth Rate */}
              {overview?.growthRate !== undefined && (
                <div className="mt-6 p-4 rounded-lg border-2 border-green-200 bg-green-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-sm" style={{ color: 'var(--primary-green)' }}>
                        Growth Rate ({selectedPeriod})
                      </h3>
                      <p className="text-xs text-gray-600">
                        Compared to previous period
                      </p>
                    </div>
                    <div className={`text-xl font-bold flex items-center gap-1 ${
                      overview.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {overview.growthRate >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                      {Math.abs(overview.growthRate).toFixed(1)}%
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Top Recipes & Quick Stats */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Top Performing Recipe */}
            {overview?.topPerformingRecipe && (
              <div className="bg-white rounded-xl card-shadow p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--primary-green)' }}>
                  <FaTrophy />
                  Top Recipe
                </h3>
                <div className="text-center">
                  <img
                    src={overview.topPerformingRecipe.image}
                    alt={overview.topPerformingRecipe.title}
                    className="w-full h-24 object-cover rounded-lg mb-3"
                  />
                  <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--dark-text)' }}>
                    {overview.topPerformingRecipe.title}
                  </h4>
                  <div className="flex items-center justify-center gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <FaHeart className="text-red-500" />
                      <span>{overview.topPerformingRecipe.likes?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Top Recipes List */}
            <div className="bg-white rounded-xl card-shadow p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--primary-green)' }}>
                <FaUtensils />
                Top Recipes
              </h3>
              <div className="space-y-3">
                {analytics?.topRecipes?.slice(0, 5).map((recipe, index) => (
                  <motion.div
                    key={recipe.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                         style={{ 
                           background: index < 3 ? 'var(--warm-yellow)' : 'var(--sage-green)',
                           color: 'white'
                         }}>
                      {index + 1}
                    </div>
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-xs line-clamp-1" style={{ color: 'var(--dark-text)' }}>
                        {recipe.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--sage-green)' }}>
                        <span>{recipe.likes?.length || 0} likes</span>
                        <span>•</span>
                        <span>
                          {recipe.ratings?.length > 0 
                            ? (recipe.ratings.reduce((sum, r) => sum + r.rating, 0) / recipe.ratings.length).toFixed(1)
                            : '0.0'
                          } ★
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl card-shadow p-6">
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--primary-green)' }}>
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button className="w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  📊 Export Analytics Report
                </button>
                <button className="w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  📈 View Detailed Charts
                </button>
                <button className="w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  🎯 Set Performance Goals
                </button>
                <button className="w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  📧 Schedule Reports
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Chart Data Visualization */}
        {overview?.chartData && overview.chartData.length > 0 && (
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="bg-white rounded-xl card-shadow p-6">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--primary-green)' }}>
                <FaCalendarAlt />
                Activity Timeline ({selectedPeriod})
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg" style={{ background: 'var(--cream)' }}>
                  <div className="text-2xl font-bold mb-1" style={{ color: 'var(--accent-orange)' }}>
                    {overview.totalViews}
                  </div>
                  <div className="text-xs font-medium" style={{ color: 'var(--sage-green)' }}>
                    Total Views
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg" style={{ background: 'var(--cream)' }}>
                  <div className="text-2xl font-bold mb-1" style={{ color: 'var(--warm-yellow)' }}>
                    {overview.totalLikes}
                  </div>
                  <div className="text-xs font-medium" style={{ color: 'var(--sage-green)' }}>
                    Total Likes
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg" style={{ background: 'var(--cream)' }}>
                  <div className="text-2xl font-bold mb-1" style={{ color: 'var(--primary-green)' }}>
                    {overview.totalComments}
                  </div>
                  <div className="text-xs font-medium" style={{ color: 'var(--sage-green)' }}>
                    Total Comments
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;