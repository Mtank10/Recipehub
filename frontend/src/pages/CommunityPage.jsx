import { useQuery, gql } from '@apollo/client';
import { motion } from 'framer-motion';

const GET_TOP_USERS = gql`
  query GetTopUsers {
    users(orderBy: followersCount_DESC, first: 5) {
      id
      name
      avatar
      followersCount
    }
  }
`;

const CommunityPage = () => {
  const { data, loading, error } = useQuery(GET_TOP_USERS);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Cooking Community</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-semibold mb-4">Top Chefs</h2>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div>Error loading data</div>
          ) : (
            data.users.map((user, index) => (
              <div key={user.id} className="flex items-center gap-4 mb-4">
                <div className="text-gray-600 font-medium">{index + 1}.</div>
                <img
                  src={user.avatar || 'http://i.pravatar.cc/50'}
                  alt={user.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{user.name}</h3>
                  <p className="text-sm text-gray-600">
                    {user.followersCount} followers
                  </p>
                </div>
              </div>
            ))
          )}
        </motion.div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <motion.div
                key={item}
                whileHover={{ scale: 1.01 }}
                className="border-b pb-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src="http://i.pravatar.cc/40"
                    alt="User"
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="text-sm">
                      <span className="font-semibold">John Doe</span> liked your recipe
                    </p>
                    <p className="text-sm text-gray-600">2 hours ago</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;