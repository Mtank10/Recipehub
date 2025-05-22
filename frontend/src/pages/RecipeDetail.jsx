import { motion } from "framer-motion";
import { FaClock, FaUtensils, FaBookmark, FaHeart } from "react-icons/fa";
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

// const GET_BOOKMARKED_RECIPES = gql`
//   query GetBookmarkedRecipes {
//     getBookmarkedRecipes {
//       id
//       recipe {
//         id
//         title
//         description
//         image
//         cookingTime
//         category
//         author {
//           id
//           name
//           avatar
//         }
//         likes {
//           id
//           user {
//             id
//             name
//           }
//         }
//       }
//     }
//   }
// `;

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

// const BOOKMARK_RECIPE = gql`
//   mutation BookmarkRecipe($recipeId: ID!) {
//     bookmarkRecipe(recipeId: $recipeId) {
//       id
//       recipe {
//         id
//       }
//     }
//   }
// `;

// const REMOVE_BOOKMARK = gql`
//   mutation RemoveBookmark($recipeId: ID!) {
//     removeBookmark(recipeId: $recipeId) {
//       id
//       recipe {
//         id
//       }
//     }
//   }
// `;

const RecipeDetail = () => {
  const { id } = useParams();

  // Queries
  const { loading, error, data } = useQuery(GET_RECIPE, { variables: { id } });
  const {
    loading: userLoading,
    error: userError,
    data: userData,
  } = useQuery(GET_USER_PROFILE);

  // Mutations
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
  // const [bookmarkRecipe] = useMutation(BOOKMARK_RECIPE);
  // const [removeBookmark] = useMutation(REMOVE_BOOKMARK);

  // Handle loading errors
  if (loading || userLoading) return <p>Loading...</p>;
  if (error || userError) return <p>Error: {error?.message || userError?.message}</p>;

  // Extracting Data
  const recipe = data?.recipe;
  const currentUser = userData?.getCurrentUser;
  const isAuthor = currentUser?.id === recipe.author.id;
  //  console.log(recipe)
  // Check if user is following
  const isFollowing = currentUser?.following?.some((u) => u.id === recipe.author.id) ?? false;

  const isLiked = currentUser?.likedRecipes?.some(
    like => like.id === id
  );
  
  // const isBookmarked = currentUser?.bookmarks?.some(
  //   bookmark => bookmark.recipe.id === id
  // );
  // console.log(isFollowing)
  // Follow/Unfollow User
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

  // const handleBookmark = async () => {
  //   if (isBookmarked) {
  //     await removeBookmark({
  //       variables: { recipeId: id },
  //       refetchQueries: [{ query: GET_USER_PROFILE }, { query: GET_BOOKMARKED_RECIPES }]
  //     });
  //   } else {
  //     await bookmarkRecipe({
  //       variables: { recipeId: id },
  //       refetchQueries: [{ query: GET_USER_PROFILE }, { query: GET_BOOKMARKED_RECIPES }]
  //     });
  //   }
  // };

  return (
    <div className="max-w-4xl mx-auto p-5">
      <motion.div
        className="bg-white shadow-md rounded-lg p-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <img src={recipe.image} alt={recipe.title} className="w-full h-60 object-cover rounded-md" />
        <h1 className="text-2xl font-bold mt-3">{recipe.title}</h1>
        <p className="text-gray-600">{recipe.description}</p>

        <div className="flex items-center gap-5 mt-3">
          <span className="flex items-center gap-2 text-gray-700">
            <FaClock /> {recipe.cookingTime} mins
          </span>
          <span className="flex items-center gap-2 text-gray-700">
            <FaUtensils /> Servings
          </span>
        </div>

        <div className="flex gap-2 mt-3">
          {recipe.tags.map((tag, index) => (
            <span key={index} className="bg-gray-200 px-2 py-1 rounded-md text-sm">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex gap-3 mt-4">
      <button
        onClick={handleLike}
        className={`flex items-center gap-2 ${
          isLiked ? 'text-red-500' : 'text-gray-700'
        } px-4 py-2 rounded-md`}
      >
        <FaHeart />
        {recipe.likes?.length || 0} 
      </button>
      
      {/* <button
        onClick={handleBookmark}
        className={`flex items-center gap-2 ${
          isBookmarked ? 'text-blue-500' : 'text-gray-700'
        } px-4 py-2 rounded-md`}
      >
        <FaBookmark />
        {isBookmarked ? 'Bookmarked' : 'Bookmark'}
      </button> */}
    </div>
        {!isAuthor && (
          <div className="flex items-center mt-3 gap-3">
            <p className="text-gray-700">{recipe.author.name}</p>
            <button
              onClick={handleFollow}
              className="bg-blue-500 text-white px-3 py-1 rounded-md"
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          </div>
        )}
      </motion.div>

      <motion.div
        className="bg-white shadow-md rounded-lg p-5 mt-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-bold">Ingredients</h2>
        <ul className="mt-3 space-y-2">
          {recipe.ingredients.map((ingredient, index) => (
            <motion.li
              key={index}
              className="flex items-center gap-2 text-gray-700"
              whileHover={{ scale: 1.05 }}
            >
              ✅ {ingredient.quantity} {ingredient.name}
            </motion.li>
          ))}
        </ul>
      </motion.div>

      <motion.div
        className="bg-white shadow-md rounded-lg p-5 mt-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-bold">Steps to Cook</h2>
        <ul className="mt-3 space-y-4">
          {recipe.steps.map((step, index) => (
            <motion.li
              key={index}
              className="text-gray-700 p-3 bg-gray-100 rounded-md"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.2 }}
            >
              <span className="font-bold">Step {index + 1}:</span> {step}
            </motion.li>
          ))}
        </ul>
      </motion.div>
      <div className="flex items-center gap-3 mt-3">
  <StarRating rating={avgRating} />
  <span className="text-gray-600">
    ({recipe.ratings.length} ratings)
  </span>
</div>
      <div className="mt-4">
      <h3 className="text-lg font-semibold">Rate this recipe</h3>
      <div className="flex items-center gap-2 mt-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRating(star)}
            className={`text-2xl ${
              star <= (userRating || 0) ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
      <div>
        <Comments recipeId={id} />
      </div>
    </div>
  );
};

export default RecipeDetail;


