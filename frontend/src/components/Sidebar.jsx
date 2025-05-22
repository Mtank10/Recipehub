import { Suspense } from "react";
import { FaUtensils, FaHeart, FaBook, FaUsers } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { useApolloClient, gql } from "@apollo/client";
import { Link } from "react-router-dom";
import AuthButton from "./AuthButton";
import { jwtDecode } from "jwt-decode";
import bg from "../assets/bg.jpg"

export const GET_USER_PROFILE = gql`
  query getUserProfile($id: ID!) {
    getUserProfile(id: $id) {
      id
      name
      avatar
    }
  }
`;

const ProfileInfo = ({ id }) => {
  const client = useApolloClient();
  const { data, error } = useQuery({
    queryKey: ["userProfile", id],
    queryFn: async () => {
      if (!id) throw new Error("User ID not found");
      const { data } = await client.query({
        query: GET_USER_PROFILE,
        variables: { id },
      });
      return data.getUserProfile;
    },
    enabled: !!id,
    suspense: true, // Enables React Query suspense mode
  });

  if (error) return <p className="text-red-500">Error loading user data.</p>;

  return (
    <Link to={`/profile/${id}`} className="flex flex-col items-center  mb-4 cursor-pointer hover:bg-gray-200 p-6  rounded-lg transition">
      <img
        src={data?.avatar}
        alt={data?.name}
        className="w-16 h-16 rounded-full border-2 border-[#FFA400]"
      />
      <div className="flex flex-col items-center">
        <h3 className="text-lg font-semibold text-[#FFA400]">{data?.name || "Guest"}</h3>
        <h5 className="text-gray-600 pb-2">Master Chef</h5>
      </div>
    </Link>
  );
};

const Sidebar = () => {
  const token = localStorage.getItem("token");
  let id = null;

  
if (token) {
  try{
  const decoded = jwtDecode(token);
  if (decoded.exp * 1000 < Date.now()) {
    localStorage.removeItem('token');
    window.location.reload();
  }
      id = decoded?.id;
    } catch (error) {
      console.error("Invalid token", error);
    }
  }

  return (
    <aside className="w-55 h-screen fixed bg-[#F7F7F7] shadow-xl  flex flex-col">
      {/* Logo */}
      <div>
        <div className="flex flex-col items-center p-2">
        <h2 className="text-[38px] italic font-bold">!Self</h2>
        <p className="text-gray-400 text-[13px]">Cooking Like!!</p>
        </div>
      

      {/* Profile Section (Using Suspense) */}
      {token ? (
        <Suspense fallback={<p className="text-center text-gray-500">Loading</p>}>
          <ProfileInfo id={id} />
        </Suspense>
      ) : (
        <AuthButton isLoggedIn={!!token} />
      )}
      </div>
      {/* Navigation Links */}
      <nav className="flex flex-col items-start space-y-2 p-2 mb-2">
        <Link to="/" className="flex items-center space-x-3 text-[#FFA400] font-medium hover:bg-[#FFA400] hover:text-white p-2 rounded-lg transition">
          <FaUtensils />
          <span>Recipes</span>
        </Link>
        <Link to="/favorites" className="flex items-center space-x-3 text-[#005B9A] hover:bg-[#005B9A] hover:text-white p-2 rounded-lg transition">
          <FaHeart />
          <span>Favorites</span>
        </Link>
        <Link to="/courses" className="flex items-center space-x-3 text-[#00A896] hover:bg-[#00A896] hover:text-white p-2 rounded-lg transition">
          <FaBook />
          <span>Courses</span>
        </Link>
        <Link to="/community" className="flex items-center space-x-3 text-gray-600 hover:bg-[#FFA400] hover:text-white p-2 rounded-lg transition">
          <FaUsers />
          <span>Community</span>
        </Link>
      </nav>

      {/* Logout Button */}
      {/* {token && (
        <div className="mt-8 p-4 ml-10">
          <AuthButton isLoggedIn={!!token} />
        </div>
      )} */}
      <div>
        <img
          src={bg}
        />
      </div>
    </aside>
  );
};

export default Sidebar;
