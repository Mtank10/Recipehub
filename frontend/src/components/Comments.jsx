import { useState } from "react";
import { useQuery, useMutation ,gql} from "@apollo/client";


const GET_COMMENTS = gql`
  query GetComments($recipeId: ID!) {
    getComments(recipeId: $recipeId) {
      id
      content
      createdAt
      user {
        id
        name
        avatar
      }
    }
  }
`;

const ADD_COMMENT = gql`
  mutation AddComment($recipeId: ID!, $content: String!) {
    addComment(recipeId: $recipeId, content: $content) {
      id
      content
    }
  }
`;

const Comments = ({ recipeId }) => {
  const [content, setContent] = useState("");
  const { loading, error, data } = useQuery(GET_COMMENTS, {
    variables: { recipeId },
  });
  const [addComment] = useMutation(ADD_COMMENT, {
    refetchQueries: [{ query: GET_COMMENTS, variables: { recipeId } }],
  });
  // console.log(new Date().toLocaleString())
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    try {
      await addComment({ variables: { recipeId, content } });
      setContent("");
    } catch (error) {
      console.error("Comment error:", error);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Comments</h2>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-2 border rounded-md"
          placeholder="Add a comment..."
          rows="3"
        />
        <button
          type="submit"
          className="mt-2 bg-black text-white px-4 py-2 rounded-md"
        >
          Post Comment
        </button>
      </form>

      {loading && <p>Loading comments...</p>}
      {error && <p className="text-red-500">Error loading comments</p>}

      <div className="space-y-4">
        {data?.getComments?.map((comment) => (
          <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <img
                src={comment.user.avatar || "/default-avatar.png"}
                alt={comment.user.name}
                className="w-8 h-8 rounded-full"
              />
              <span className="font-semibold">{comment.user.name}</span>
              <span className="text-sm text-gray-500">
                {new Date(parseInt(comment.createdAt)).toLocaleString()}
              </span>
            </div>
            <p className="text-gray-700">{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Comments