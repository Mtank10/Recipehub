import { motion } from "framer-motion";
import { FaClock, FaUtensils, FaBookmark, FaHeart, FaShare, FaPrint, FaUser } from "react-icons/fa";
import Comments from "../components/Comments";
import { useQuery, gql, useMutation } from "@apollo/client";
import { useParams } from "react-router-dom";
import { StarRating } from "../components/RecipeGrid";

const GET_RECIPE = gql`
  query GetRecipe($id: ID!) {
    recipe(id: $id) {
      id
      title
      description
      image
      cookingTime
      steps
      category
      tags
      likes {
        id
        user {
          id
        }
      }
      author {
        id
        name
        avatar
      }
      ingredients {
        id
        name
        quantity
      }
      ratings {
        rating
        user {
          id
          name
          avatar
        }
      }
    }
  }
`;

const GET_USER_PROFILE = gql`
  query getCurrentUser {
    getCurrentUser {
      id
      name
      following {
        id
        name
      }
      followers {
        id
        name
      }
    }
  }
`;

const FOLLOW_USER = gql`
  mutation FollowUser($targetUserId: ID!) {
    followUser(targetUserId: $targetUserId)
  }
`;

const UNFOLLOW_USER = gql`
  mutation UnfollowUser($targetUserId: ID!) {
    unfollowUser(targetUserId: $targetUserId)
  }
`;

const RATE_RECIPE = gql`
  mutation RateRecipe($id: ID!, $rating: Int!) {
    rateRecipe(recipeId: $id, rating: $rating) {
      id
      rating
      user {
        id
        name
      }
      recipe {
        id
        title
      }
    }
  }
`;

const LIKE_RECIPE = gql`
  mutation LikeRecipe($recipeId:ID!){
    likeRecipe(recipeId:$recipeId){
      id
      recipe {
        id
        likesCount
      }
    }
  }
`;

const UNLIKE_RECIPE = gql`
  mutation UnlikeRecipe($recipeId: ID!) {
    unlikeRecipe(recipeId: $recipeId) {
      id
      recipe {
        id
        likesCount
      }
    }
  }
`;

const RecipeDetail = () => {
  const { id } = useParams();

  const { loading, error, data } = useQuery(GET_RECIPE, { variables: { id } });
  const {
    loading: userLoading,
    error: userError,
    data: userData,
  } = useQuery(GET_USER_PROFILE);

  const [followUser] = useMutation(FOLLOW_USER, {
    refetchQueries: [{ query: GET_USER_PROFILE }],
  });

  const [unfollowUser] = useMutation(UNFOLLOW_USER, {
    refetchQueries: [{ query: GET_USER_PROFILE }],
  });
  
  const [rateRecipe] = useMutation(RATE_RECIPE, {
    refetchQueries: [{ query: GET_RECIPE, variables: { id} }],
  });
  
  const [likeRecipe] = useMutation(LIKE_RECIPE);
  const [unlikeRecipe] = useMutation(UNLIKE_RECIPE);

  if (loading || userLoading) return (
    <div className="max-w-4xl mx-auto p-5">
      <div className="skeleton h-64 w-full rounded-2xl mb-6"></div>
      <div className="skeleton h-8 w-3/4 mb-4"></div>
      <div className="skeleton h-4 w-1/2 mb-8"></div>
    </div>
  );
  
  if (error || userError) return <p>Error: {error?.message || userError?.message}</p>;

  const recipe = data?.recipe;
  const currentUser = userData?.getCurrentUser;
  const isAuthor = currentUser?.id === recipe.author.id;
  const isFollowing = currentUser?.following?.some((u) => u.id === recipe.author.id) ?? false;
  const isLiked = currentUser?.likedRecipes?.some(like => like.id === id);

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await unfollowUser({ variables: { targetUserId: recipe.author.id } });
      } else {
        await followUser({ variables: { targetUserId: recipe.author.id } });
      }
    } catch (err) {
      console.error("Follow/Unfollow error:", err);
    }
  };

  const userRating = recipe.ratings.find(
    (r) => r.user.id === userData?.getCurrentUser?.id
  )?.rating;

  const handleRating = async (rating) => {
    try {
      await rateRecipe({ variables: { id, rating } });
    } catch (error) {
      console.error("Rating error:", error);
    }
  };

  const avgRating = recipe.ratings.length
    ? recipe.ratings.reduce((sum, r) => sum + r.rating, 0) / recipe.ratings.length
    : 0;

  const handleLike = async () => {
    if (isLiked) {
      await unlikeRecipe({
        variables: { recipeId: id },
        refetchQueries: [{ query: GET_RECIPE }, { query: GET_USER_PROFILE }]
      });
    } else {
      await likeRecipe({
        variables: { recipeId: id },
        refetchQueries: [{ query: GET_RECIPE }, { query: GET_USER_PROFILE }]
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-5 gradient-bg min-h-screen">
      {/* Hero Section */}
      <motion.div
        className="bg-white rounded-3xl overflow-hidden card-shadow mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative">
          <img 
            src={recipe.image} 
            alt={recipe.title} 
            className="w-full h-80 md:h-96 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          
          {/* Recipe Category Badge */}
          <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2">
            <span className="font-semibold text-sm" style={{ color: 'var(--primary-green)' }}>
              {recipe.category}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="absolute top-6 right-6 flex gap-3">
            <button className="bg-white/90 backdrop-blur-sm rounded-full p-3 hover:bg-white transition-colors duration-300">
              <FaShare className="text-lg" style={{ color: 'var(--sage-green)' }} />
            </button>
            <button className="bg-white/90 backdrop-blur-sm rounded-full p-3 hover:bg-white transition-colors duration-300">
              <FaPrint className="text-lg" style={{ color: 'var(--sage-green)' }} />
            </button>
          </div>

          {/* Recipe Title Overlay */}
          <div className="absolute bottom-6 left-6 right-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
              {recipe.title}
            </h1>
            <p className="text-white/90 text-lg drop-shadow-md">
              {recipe.description}
            </p>
          </div>
        </div>

        <div className="p-8">
          {/* Recipe Meta Info */}
          <div className="flex flex-wrap items-center gap-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" 
                   style={{ background: 'linear-gradient(135deg, var(--accent-orange) 0%, var(--warm-yellow) 100%)' }}>
                <FaClock className="text-white text-lg" />
              </div>
              <div>
                <div className="font-bold text-lg" style={{ color: 'var(--dark-text)' }}>
                  {recipe.cookingTime} mins
                </div>
                <div className="text-sm" style={{ color: 'var(--sage-green)' }}>
                  Cook Time
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" 
                   style={{ background: 'linear-gradient(135deg, var(--primary-green) 0%, var(--light-green) 100%)' }}>
                <FaUtensils className="text-white text-lg" />
              </div>
              <div>
                <div className="font-bold text-lg" style={{ color: 'var(--dark-text)' }}>
                  4 Servings
                </div>
                <div className="text-sm" style={{ color: 'var(--sage-green)' }}>
                  Portions
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <StarRating rating={avgRating} />
              <span className="text-sm" style={{ color: 'var(--sage-green)' }}>
                ({recipe.ratings.length} reviews)
              </span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {recipe.tags.map((tag, index) => (
              <span 
                key={index} 
                className="px-4 py-2 rounded-full text-sm font-medium"
                style={{ 
                  background: 'var(--cream)', 
                  color: 'var(--primary-green)',
                  border: '1px solid var(--border-color)'
                }}
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={handleLike}
              className={`flex items-center gap-3 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                isLiked 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-white border-2 border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300'
              }`}
            >
              <FaHeart />
              <span>{recipe.likes?.length || 0} Likes</span>
            </button>
            
            <button className="flex items-center gap-3 px-6 py-3 rounded-full font-semibold bg-white border-2 border-blue-200 text-blue-500 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300">
              <FaBookmark />
              <span>Save Recipe</span>
            </button>
          </div>

          {/* Author Info */}
          {!isAuthor && (
            <div className="flex items-center justify-between p-4 rounded-2xl" style={{ background: 'var(--cream)' }}>
              <div className="flex items-center gap-4">
                <img
                  src={recipe.author.avatar || 'https://via.placeholder.com/50'}
                  alt={recipe.author.name}
                  className="w-12 h-12 rounded-full border-3 border-green-200"
                />
                <div>
                  <h3 className="font-bold" style={{ color: 'var(--dark-text)' }}>
                    {recipe.author.name}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--sage-green)' }}>
                    Recipe Creator
                  </p>
                </div>
              </div>
              <button
                onClick={handleFollow}
                className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                  isFollowing
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'btn-primary'
                }`}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ingredients */}
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl p-6 card-shadow sticky top-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--primary-green)' }}>
              <FaUtensils />
              Ingredients
            </h2>
            <div className="space-y-3">
              {recipe.ingredients.map((ingredient, index) => (
                <motion.div
                  key={index}
                  className="ingredient-item"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium" style={{ color: 'var(--dark-text)' }}>
                      {ingredient.name}
                    </span>
                    <span className="font-bold" style={{ color: 'var(--sage-green)' }}>
                      {ingredient.quantity}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="bg-white rounded-2xl p-6 card-shadow mb-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--primary-green)' }}>
              Instructions
            </h2>
            <div className="space-y-6">
              {recipe.steps.map((step, index) => (
                <motion.div
                  key={index}
                  className="flex gap-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className="step-counter flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-lg leading-relaxed" style={{ color: 'var(--dark-text)' }}>
                      {step}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Rating Section */}
          <div className="bg-white rounded-2xl p-6 card-shadow mb-8">
            <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--primary-green)' }}>
              Rate This Recipe
            </h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    className={`text-3xl transition-all duration-200 hover:scale-110 ${
                      star <= (userRating || 0) ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              {userRating && (
                <span className="text-sm font-medium" style={{ color: 'var(--sage-green)' }}>
                  You rated this {userRating} star{userRating !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Comments */}
          <div className="bg-white rounded-2xl p-6 card-shadow">
            <Comments recipeId={id} />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RecipeDetail;