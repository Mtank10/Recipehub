import { Suspense, useState } from "react";
import { FaUtensils, FaHeart, FaBook, FaUsers, FaBars, FaTimes, FaPlus, FaChartLine, FaCalendarAlt, FaGlobe, FaShoppingCart  } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { useApolloClient, gql } from "@apollo/client";
import { Link, useLocation } from "react-router-dom";
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

  if (error) return <p className="text-red-500 text-xs">Error loading user data.</p>;

  return (
    <Link to={`/profile/${id}`} className="block">
      <div className="flex flex-col items-center mb-4 p-3 bg-white rounded-xl card-shadow hover-lift cursor-pointer transition-all duration-300">
        <div className="relative">
          <img
            src={data?.avatar}
            alt={data?.name}
            className="w-12 h-12 rounded-full border-2 border-sage-green object-cover"
            style={{ borderColor: 'var(--sage-green)' }}
          />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
        <div className="text-center mt-2">
          <h3 className="font-bold text-sm" style={{ color: 'var(--primary-green)' }}>
            {data?.name || "Guest"}
          </h3>
          <p className="text-xs" style={{ color: 'var(--sage-green)' }}>Master Chef</p>
        </div>
      </div>
    </Link>
  );
};

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
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
    { path: "/cultural-recipes", icon: FaGlobe, label: "Cultural Recipes", color: "var(--warm-yellow)" },
    { path: "/dashboard", icon: FaChartLine, label: "Dashboard", color: "var(--accent-orange)" },
    { path: "/meal-planner", icon: FaCalendarAlt, label: "Meal Planner", color: "var(--warm-yellow)" },
    { path: "/shopping-list", icon: FaShoppingCart, label: "Shopping List", color: "var(--sage-green)" },
    { path: "/analytics", icon: FaChartLine, label: "Analytics", color: "var(--accent-orange)" },
    { path: "/favorites", icon: FaHeart, label: "Favorites", color: "var(--sage-green)" },
    { path: "/courses", icon: FaBook, label: "Courses", color: "var(--primary-green)" },
    { path: "/community", icon: FaUsers, label: "Community", color: "var(--accent-orange)" },
  ];

  const handleNavClick = () => {
    setOpen(false); // Close mobile menu when nav item is clicked
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex justify-between items-center p-3 bg-white shadow-lg border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--primary-green) 0%, var(--light-green) 100%)' }}>
            <FaUtensils className="text-white text-sm" />
          </div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--primary-green)' }}>
            MealMuse
          </h2>
        </div>
        <button 
          onClick={() => setOpen(!open)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          {open ? <FaTimes size={18} style={{ color: 'var(--primary-green)' }} /> : <FaBars size={18} style={{ color: 'var(--primary-green)' }} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {open && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full sidebar-gradient shadow-2xl z-50 transform transition-all duration-300 ease-in-out sidebar-sticky
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:flex md:w-[240px] custom-scrollbar overflow-y-auto`}>
        
        <div className="flex flex-col h-full w-[240px] p-4">
          {/* Logo Section */}
          <div className="text-center mb-6 hidden md:block">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--primary-green) 0%, var(--light-green) 100%)' }}>
                <FaUtensils className="text-white text-lg" />
              </div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--primary-green)' }}>
                MealMuse
              </h2>
            </div>
            <p className="text-xs" style={{ color: 'var(--sage-green)' }}>
              Cook with Passion ✨
            </p>
          </div>

          {/* Profile Section */}
          {token ? (
            <Suspense fallback={
              <div className="flex flex-col items-center mb-4 p-3 bg-white rounded-xl animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-2 bg-gray-200 rounded w-12"></div>
              </div>
            }>
              <ProfileInfo id={id} />
            </Suspense>
          ) : (
            <div className="mb-4 p-3 bg-white rounded-xl card-shadow text-center">
              <div className="mb-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-2">
                  <FaUtensils className="text-lg" style={{ color: 'var(--sage-green)' }} />
                </div>
                <p className="text-xs" style={{ color: 'var(--dark-text)' }}>
                  Join our cooking community!
                </p>
              </div>
              <AuthButton isLoggedIn={!!token} />
            </div>
          )}

          {/* Navigation */}
          <nav className="flex flex-col space-y-1 mb-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  className={`nav-item flex items-center space-x-3 transition-all duration-300 hover-lift group ${
                    isActive ? 'active' : ''
                  }`}
                  style={{
                    background: isActive ? item.color : 'white',
                    color: isActive ? 'white' : 'var(--dark-text)',
                    border: `1px solid ${isActive ? item.color : 'var(--border-color)'}`
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.target.style.borderColor = item.color;
                      e.target.style.background = `${item.color}10`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.target.style.borderColor = 'var(--border-color)';
                      e.target.style.background = 'white';
                    }
                  }}
                >
                  <item.icon 
                    className="text-base transition-colors duration-300" 
                    style={{ color: isActive ? 'white' : item.color }}
                  />
                  <span className="font-medium text-sm">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Create Recipe Button */}
          {token && (
            <Link
              to="/create-recipe"
              onClick={handleNavClick}
              className="btn-primary flex items-center justify-center space-x-2 mb-4 hover-lift text-sm"
            >
              <FaPlus />
              <span>Create Recipe</span>
            </Link>
          )}

          {/* Bottom Decoration */}
          <div className="mt-auto">
            <div className="bg-white rounded-xl p-3 card-shadow text-center">
              <div className="text-2xl mb-1">🍳</div>
              <p className="text-xs font-medium" style={{ color: 'var(--primary-green)' }}>
                Happy Cooking!
              </p>
              <p className="text-xs" style={{ color: 'var(--sage-green)' }}>
                Discover amazing recipes
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;