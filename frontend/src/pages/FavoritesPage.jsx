import { useState } from "react";
import { useQuery,gql } from "@apollo/client";
import RecipeGrid from "../components/RecipeGrid";
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

const FavoritesPage = () => {
  //const { data, loading, error } = useQuery(GET_BOOKMARKED_RECIPES);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Saved Recipes</h1>
      
      <input
        type="text"
        placeholder="Search your bookmarks..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full mb-8 p-3 rounded-lg border border-gray-300"
      />

      {/* {loading ? (
        <div>Loading bookmarks...</div>
      ) : error ? (
        <div>Error loading bookmarks</div>
      ) : (
        <RecipeGrid 
          searchQuery={searchQuery}
          recipes={data?.getBookmarkedRecipes?.map(bookmark => bookmark.recipe) || []}
        />
      )} */}
      <h1 className="text-lg text-center bg-gray-200">Comming soon</h1>
    </div>
  );
};

export default FavoritesPage