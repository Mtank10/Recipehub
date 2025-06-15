import { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { motion } from "framer-motion";
import { FaUser, FaPaperPlane } from "react-icons/fa";

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
  const [addComment, { loading: submitting }] = useMutation(ADD_COMMENT, {
    refetchQueries: [{ query: GET_COMMENTS, variables: { recipeId } }],
  });

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
    <div>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--primary-green)' }}>
        💬 Comments ({data?.getComments?.length || 0})
      </h2>
      
      {/* Comment Form */}
      <motion.form 
        onSubmit={handleSubmit} 
        className="mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-4 pr-16 border-2 rounded-2xl resize-none focus:outline-none transition-all duration-300"
            style={{ 
              borderColor: 'var(--border-color)',
              background: 'var(--cream)'
            }}
            placeholder="Share your thoughts about this recipe..."
            rows="3"
          />
          <button
            type="submit"
            disabled={!content.trim() || submitting}
            className="absolute bottom-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              background: content.trim() ? 'linear-gradient(135deg, var(--primary-green) 0%, var(--light-green) 100%)' : 'var(--border-color)'
            }}
          >
            <FaPaperPlane className={`text-sm ${content.trim() ? 'text-white' : 'text-gray-400'}`} />
          </button>
        </div>
      </motion.form>

      {/* Comments List */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 p-4 rounded-2xl bg-gray-50">
              <div className="skeleton w-12 h-12 rounded-full"></div>
              <div className="flex-1">
                <div className="skeleton h-4 w-24 mb-2"></div>
                <div className="skeleton h-3 w-full mb-1"></div>
                <div className="skeleton h-3 w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <p className="text-red-500">Error loading comments</p>
        </div>
      )}

      <div className="space-y-4">
        {data?.getComments?.map((comment, index) => (
          <motion.div
            key={comment.id}
            className="p-6 rounded-2xl transition-all duration-300 hover:shadow-md"
            style={{ background: 'var(--cream)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {comment.user.avatar ? (
                  <img
                    src={comment.user.avatar}
                    alt={comment.user.name}
                    className="w-12 h-12 rounded-full border-2 border-green-200 object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-green-200" 
                       style={{ background: 'var(--sage-green)' }}>
                    <FaUser className="text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-bold" style={{ color: 'var(--primary-green)' }}>
                    {comment.user.name}
                  </h4>
                  <span className="text-sm" style={{ color: 'var(--sage-green)' }}>
                    {new Date(parseInt(comment.createdAt)).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className="leading-relaxed" style={{ color: 'var(--dark-text)' }}>
                  {comment.content}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {data?.getComments?.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💭</div>
          <p className="text-xl font-semibold mb-2" style={{ color: 'var(--dark-text)' }}>
            No comments yet
          </p>
          <p className="text-gray-600">
            Be the first to share your thoughts about this recipe!
          </p>
        </div>
      )}
    </div>
  );
};

export default Comments;