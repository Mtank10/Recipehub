import { useMutation, useQueryClient } from "@tanstack/react-query";

const FollowButton = ({ userId, isFollowing }) => {
//   const queryClient = useQueryClient();

//   const mutation = useMutation({
//     mutationFn: async () => {
//       const response = await fetch(`/api/${isFollowing ? "unfollowUser" : "followUser"}`, {
//         method: "POST",
//         body: JSON.stringify({ targetUserId: userId }),
//       });
//       return response.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries(["userProfile"]);
//     },
//   });

  return (
    <button
    //   onClick={() => mutation.mutate()}
      className={`px-4 py-2 rounded-md ${isFollowing ? "bg-red-500 text-white" : "bg-primary text-white"}`}
    >
      {isFollowing ? "Unfollow" : "Follow"}
    </button>
  );
};

export default FollowButton;
