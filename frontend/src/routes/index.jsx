import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "../pages/Layout";
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
import OnboardingPage from "../pages/OnboardingPage";
import CulturalRecipesPage from "../pages/CulturalRecipesPage";
import ProtectedRoute from "../components/ProtectedRoute";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Onboarding route (outside Layout) */}
        <Route path="/onboarding" element={<OnboardingPage />} />
        
        {/* Wrap all other routes with Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="recipe/:id" element={<RecipeDetail />} />
          <Route path="recipes" element={<RecipeGrid />} />
          <Route path="cultural-recipes" element={<CulturalRecipesPage />} />
          <Route path="auth/login" element={<AuthButton />} />
          <Route path="profile/:id" element={<ProfilePage />} />
          <Route path="favorites" element={
            <ProtectedRoute>
              <FavoritesPage />
            </ProtectedRoute>
          } />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="community" element={<CommunityPage />} />
          <Route path="create-recipe" element={
            <ProtectedRoute>
              <CreateRecipe />
            </ProtectedRoute>
          } />
          <Route path="dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="meal-planner" element={
            <ProtectedRoute>
              <MealPlannerPage />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRoutes;