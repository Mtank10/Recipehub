import { Suspense, useState } from "react";
import { FaUtensils, FaHeart, FaBook, FaUsers, FaBars, FaTimes, FaPlus } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { useApolloClient, gql } from "@apollo/client";
import { Link } from "react-router-dom";
import AuthButton from "./AuthButton";
import { jwtDecode } from "jwt-decode";

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

  if (error) return <p className="text-red-500 text-sm">Error loading user data.</p>;

  return (
    <Link to={`/profile/${id}`} className="block">
      <div className="flex flex-col items-center mb-6 p-4 bg-white rounded-2xl card-shadow hover-lift cursor-pointer transition-all duration-300">
        <div className="relative">
          <img
            src={data?.avatar}
            alt={data?.name}
            className="w-16 h-16 rounded-full border-3 border-sage-green object-cover"
            style={{ borderColor: 'var(--sage-green)' }}
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
        <div className="text-center mt-3">
          <h3 className="font-bold text-lg" style={{ color: 'var(--primary-green)' }}>
            {data?.name || "Guest"}
          </h3>
          <p className="text-sm" style={{ color: 'var(--sage-green)' }}>Master Chef</p>
        </div>
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

  const navItems = [
    { path: "/", icon: FaUtensils, label: "Recipes", color: "var(--primary-green)" },
    { path: "/favorites", icon: FaHeart, label: "Favorites", color: "var(--accent-orange)" },
    { path: "/courses", icon: FaBook, label: "Courses", color: "var(--warm-yellow)" },
    { path: "/community", icon: FaUsers, label: "Community", color: "var(--sage-green)" },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex justify-between items-center p-4 bg-white shadow-lg border-b-2" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--primary-green) 0%, var(--light-green) 100%)' }}>
            <FaUtensils className="text-white text-lg" />
          </div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--primary-green)' }}>
            RecipeHub
          </h2>
        </div>
        <button 
          onClick={() => setOpen(!open)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          {open ? <FaTimes size={22} style={{ color: 'var(--primary-green)' }} /> : <FaBars size={22} style={{ color: 'var(--primary-green)' }} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full sidebar-gradient shadow-2xl z-50 transform transition-all duration-300 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:flex md:w-[280px] custom-scrollbar overflow-y-auto`}>
        
        <div className="flex flex-col h-full w-[280px] p-6">
          {/* Logo Section */}
          <div className="text-center mb-8 hidden md:block">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--primary-green) 0%, var(--light-green) 100%)' }}>
                <FaUtensils className="text-white text-xl" />
              </div>
              <h2 className="text-3xl font-bold" style={{ color: 'var(--primary-green)' }}>
                RecipeHub
              </h2>
            </div>
            <p className="text-sm" style={{ color: 'var(--sage-green)' }}>
              Cook with Passion ✨
            </p>
          </div>

          {/* Profile Section */}
          {token ? (
            <Suspense fallback={
              <div className="flex flex-col items-center mb-6 p-4 bg-white rounded-2xl animate-pulse">
                <div className="w-16 h-16 bg-gray-200 rounded-full mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            }>
              <ProfileInfo id={id} />
            </Suspense>
          ) : (
            <div className="mb-6 p-4 bg-white rounded-2xl card-shadow text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-3">
                  <FaUtensils className="text-2xl" style={{ color: 'var(--sage-green)' }} />
                </div>
                <p className="text-sm" style={{ color: 'var(--dark-text)' }}>
                  Join our cooking community!
                </p>
              </div>
              <AuthButton isLoggedIn={!!token} />
            </div>
          )}

          {/* Navigation */}
          <nav className="flex flex-col space-y-2 mb-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center space-x-4 p-3 rounded-xl transition-all duration-300 hover-lift group"
                style={{
                  background: 'white',
                  border: '2px solid var(--border-color)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = item.color;
                  e.target.style.background = `${item.color}10`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = 'var(--border-color)';
                  e.target.style.background = 'white';
                }}
              >
                <item.icon 
                  className="text-xl transition-colors duration-300" 
                  style={{ color: item.color }}
                />
                <span className="font-semibold" style={{ color: 'var(--dark-text)' }}>
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Create Recipe Button */}
          {token && (
            <Link
              to="/create-recipe"
              className="btn-primary flex items-center justify-center space-x-2 mb-6 hover-lift"
            >
              <FaPlus />
              <span>Create Recipe</span>
            </Link>
          )}

          {/* Bottom Decoration */}
          <div className="mt-auto">
            <div className="bg-white rounded-2xl p-4 card-shadow text-center">
              <div className="text-4xl mb-2">🍳</div>
              <p className="text-sm font-medium" style={{ color: 'var(--primary-green)' }}>
                Happy Cooking!
              </p>
              <p className="text-xs" style={{ color: 'var(--sage-green)' }}>
                Discover amazing recipes
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {open && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;