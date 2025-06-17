import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "../pages/Layout"; // Import Layout
import Home from "../pages/Home";
import RecipeDetail from "../pages/RecipeDetail";
import AuthButton from "../components/AuthButton";
import FavoritesPage from "../pages/FavoritesPage";
import CoursesPage from "../pages/CoursesPage";
import CommunityPage from "../pages/CommunityPage";
import RecipeGrid from "../components/RecipeGrid";
import ProfilePage from "../pages/ProfilePage";
import CreateRecipe from "../pages/CreateRecipe";
import DashboardPage from "../pages/DashboardPage";
import MealPlannerPage from "../pages/MealPlannerPage";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Wrap all routes with Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="recipe/:id" element={<RecipeDetail />} />
          <Route path="recipes" element={<RecipeGrid />} />
          <Route path="auth/login" element={<AuthButton />} />
          <Route path="profile/:id" element={<ProfilePage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="community" element={<CommunityPage />} />
          <Route path="create-recipe" element={<CreateRecipe/>} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="meal-planner" element={<MealPlannerPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRoutes;