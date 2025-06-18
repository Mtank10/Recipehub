import { useState } from 'react';
import { useQuery, gql, useMutation } from '@apollo/client';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { FaEdit, FaTrash, FaHeart, FaClock, FaEye, FaUsers, FaUtensils, FaPlus } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';
import AuthButton from "./AuthButton";


const GET_USER_PROFILE = gql`
  query getUserProfile($id: ID!) {
    getUserProfile(id: $id) {
      id
      name
      email
      avatar
      recipes {
        id
        title
        description
        image
        cookingTime
        category
        likes {
          id
        }
        ratings {
          rating
        }
        createdAt
      }
    }
  }
`;

const GET_USER_FOLLOWERS = gql`
  query GetUserFollowers($id: ID!) {
    getUserProfile(id: $id) {
      followers {
        id
        name
        avatar
      }
      following {
        id
        name
        avatar
      }
    }
  }
`;

const DELETE_RECIPE = gql`
  mutation DeleteRecipe($id: ID!) {
    deleteRecipe(id: $id)
  }
`;

const ProfilePage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('recipes');
  const [currentUserId, setCurrentUserId] = useState(null);
  
  // Get current user ID from token
  useState(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUserId(decoded.id);
      } catch (error) {
        console.error('Invalid token', error);
      }
    }
  }, []);

  const { data, loading, error, refetch } = useQuery(GET_USER_PROFILE, { 
    variables: { id },
    fetchPolicy: 'cache-and-network'
  });
  
  const { data: followData } = useQuery(GET_USER_FOLLOWERS, { 
    variables: { id },
    fetchPolicy: 'cache-and-network'
  });

  const [deleteRecipe] = useMutation(DELETE_RECIPE, {
    onCompleted: () => {
      refetch();
    }
  });

  const handleDeleteRecipe = async (recipeId) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await deleteRecipe({ variables: { id: recipeId } });
      } catch (error) {
        console.error('Error deleting recipe:', error);
      }
    }
  };

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-3xl shadow-lg p-8 mb-8 animate-pulse">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
            <div className="flex gap-6">
              <div className="h-16 bg-gray-200 rounded w-20"></div>
              <div className="h-16 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <div className="text-6xl mb-4">😞</div>
        <h2 className="text-2xl font-bold text-red-600 mb-2">Profile Not Found</h2>
        <p className="text-red-500">The user profile you're looking for doesn't exist.</p>
      </div>
    </div>
  );

  const user = data?.getUserProfile;
  const followers = followData?.getUserProfile?.followers || [];
  const following = followData?.getUserProfile?.following || [];
  const isOwnProfile = currentUserId === id;

  const tabs = [
    { id: 'recipes', label: 'Recipes', count: user?.recipes?.length || 0, icon: FaUtensils },
    { id: 'followers', label: 'Followers', count: followers.length, icon: FaUsers },
    { id: 'following', label: 'Following', count: following.length, icon: FaHeart }
  ];

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <motion.div
          className="bg-white rounded-3xl card-shadow p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <img
                src={user?.avatar || 'https://via.placeholder.com/128'}
                alt={user?.name}
                className="w-32 h-32 rounded-full border-4 object-cover"
                style={{ borderColor: 'var(--sage-green)' }}
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--primary-green)' }}>
                {user?.name}
              </h1>
              <p className="text-lg mb-4" style={{ color: 'var(--sage-green)' }}>
                {user?.email}
              </p>
              
              <div className="flex justify-center md:justify-start gap-8 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold" style={{ color: 'var(--accent-orange)' }}>
                    {user?.recipes?.length || 0}
                  </div>
                  <div className="text-sm font-medium" style={{ color: 'var(--sage-green)' }}>
                    Recipes
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold" style={{ color: 'var(--warm-yellow)' }}>
                    {followers.length}
                  </div>
                  <div className="text-sm font-medium" style={{ color: 'var(--sage-green)' }}>
                    Followers
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold" style={{ color: 'var(--primary-green)' }}>
                    {following.length}
                  </div>
                  <div className="text-sm font-medium" style={{ color: 'var(--sage-green)' }}>
                    Following
                  </div>
                </div>
              </div>
              
              {isOwnProfile && (
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <Link
                    to="/create-recipe"
                    className="btn-primary flex items-center gap-2"
                  >
                    <FaPlus />
                    Create Recipe
                  </Link>
                  <button className="btn-secondary">
                    <AuthButton isLoggedIn={true} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          className="bg-white rounded-3xl card-shadow p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex gap-2 mb-8 border-b-2" style={{ borderColor: 'var(--border-color)' }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-4 rounded-t-2xl font-semibold transition-all duration-300 ${
                  activeTab === tab.id 
                    ? 'bg-green-50 border-b-4 border-green-500' 
                    : 'hover:bg-gray-50'
                }`}
                style={{ 
                  color: activeTab === tab.id ? 'var(--primary-green)' : 'var(--sage-green)'
                }}
              >
                <tab.icon />
                <span>{tab.label}</span>
                <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'recipes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {user?.recipes?.length > 0 ? (
                user.recipes.map((recipe, index) => (
                  <motion.div
                    key={recipe.id}
                    className="recipe-card hover-lift group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="relative overflow-hidden rounded-t-2xl">
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {isOwnProfile && (
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Link
                            to={`/edit-recipe/${recipe.id}`}
                            className="bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
                          >
                            <FaEdit className="text-blue-500" />
                          </Link>
                          <button
                            onClick={() => handleDeleteRecipe(recipe.id)}
                            className="bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
                          >
                            <FaTrash className="text-red-500" />
                          </button>
                        </div>
                      )}
                      
                      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                        <span className="text-xs font-semibold" style={{ color: 'var(--primary-green)' }}>
                          {recipe.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-lg font-bold mb-2 line-clamp-2" style={{ color: 'var(--dark-text)' }}>
                        {recipe.title}
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {recipe.description}
                      </p>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <FaClock className="text-sm" style={{ color: 'var(--sage-green)' }} />
                          <span className="text-sm font-medium">
                            {recipe.cookingTime} mins
                          </span>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <FaHeart className="text-sm text-red-500" />
                            <span className="text-sm">{recipe.likes?.length || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-400">★</span>
                            <span className="text-sm">
                              {recipe.ratings?.length > 0 
                                ? (recipe.ratings.reduce((sum, r) => sum + r.rating, 0) / recipe.ratings.length).toFixed(1)
                                : '0.0'
                              }
                            </span>
                          </div>
                        </div>
                      </div>

                      <Link
                        to={`/recipe/${recipe.id}`}
                        className="btn-secondary w-full flex items-center justify-center gap-2"
                      >
                        <FaEye />
                        View Recipe
                      </Link>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="text-6xl mb-4">👨‍🍳</div>
                  <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--dark-text)' }}>
                    No recipes yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {isOwnProfile ? "Start creating your first recipe!" : "This chef hasn't shared any recipes yet."}
                  </p>
                  {isOwnProfile && (
                    <Link to="/create-recipe" className="btn-primary">
                      Create Your First Recipe
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'followers' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {followers.length > 0 ? (
                followers.map((follower, index) => (
                  <motion.div
                    key={follower.id}
                    className="bg-gray-50 p-6 rounded-2xl hover:bg-gray-100 transition-colors duration-300 hover-lift"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={follower.avatar || 'https://via.placeholder.com/50'}
                        alt={follower.name}
                        className="w-12 h-12 rounded-full border-2 border-green-200 object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold" style={{ color: 'var(--dark-text)' }}>
                          {follower.name}
                        </h3>
                        <Link
                          to={`/profile/${follower.id}`}
                          className="text-sm hover:underline"
                          style={{ color: 'var(--sage-green)' }}
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--dark-text)' }}>
                    No followers yet
                  </h3>
                  <p className="text-gray-600">
                    {isOwnProfile ? "Share great recipes to gain followers!" : "This chef doesn't have any followers yet."}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'following' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {following.length > 0 ? (
                following.map((user, index) => (
                  <motion.div
                    key={user.id}
                    className="bg-gray-50 p-6 rounded-2xl hover:bg-gray-100 transition-colors duration-300 hover-lift"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={user.avatar || 'https://via.placeholder.com/50'}
                        alt={user.name}
                        className="w-12 h-12 rounded-full border-2 border-green-200 object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold" style={{ color: 'var(--dark-text)' }}>
                          {user.name}
                        </h3>
                        <Link
                          to={`/profile/${user.id}`}
                          className="text-sm hover:underline"
                          style={{ color: 'var(--sage-green)' }}
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="text-6xl mb-4">💚</div>
                  <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--dark-text)' }}>
                    Not following anyone yet
                  </h3>
                  <p className="text-gray-600">
                    {isOwnProfile ? "Discover amazing chefs to follow!" : "This chef isn't following anyone yet."}
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;