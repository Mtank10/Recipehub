import { Suspense, useState } from "react";
import { FaUtensils, FaHeart, FaBook, FaUsers, FaBars, FaTimes } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { useApolloClient, gql } from "@apollo/client";
import { Link } from "react-router-dom";
import AuthButton from "./AuthButton";
import { jwtDecode } from "jwt-decode";
import bg from "../assets/bg.jpg";

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
    suspense: true,
  });

  if (error) return <p className="text-red-500">Error loading user data.</p>;

  return (
    <Link to={`/profile/${id}`} className="flex flex-col items-center mb-4 cursor-pointer hover:bg-gray-200 p-6 rounded-lg transition">
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
  const [open, setOpen] = useState(false);
  const token = localStorage.getItem("token");
  let id = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        window.location.reload();
      }
      id = decoded?.id;
    } catch (error) {
      console.error("Invalid token", error);
    }
  }

  return (
    <>
      {/* Hamburger Menu (Mobile) */}
      <div className="md:hidden flex justify-between items-center p-4 bg-[#F7F7F7] shadow">
        <h2 className="text-[28px] font-bold italic">!Self</h2>
        <button onClick={() => setOpen(!open)}>
          {open ? <FaTimes size={22} /> : <FaBars size={22} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full bg-[#F7F7F7] shadow-xl z-50 transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:flex md:w-[250px]`}>
        
        <div className="flex flex-col h-full w-[250px] overflow-y-auto">
          <div className="flex flex-col items-center p-4">
            <h2 className="text-[38px] italic font-bold hidden md:block">!Self</h2>
            <p className="text-gray-400 text-[13px] hidden md:block">Cooking Like!!</p>
          </div>

          {token ? (
            <Suspense fallback={<p className="text-center text-gray-500">Loading</p>}>
              <ProfileInfo id={id} />
            </Suspense>
          ) : (
            <div className="mx-auto">
              <AuthButton isLoggedIn={!!token} />
            </div>
          )}

          <nav className="flex flex-col items-start space-y-2 px-4">
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

          <div className="mt-auto">
            <img src={bg} alt="Background" className="w-full" />
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
