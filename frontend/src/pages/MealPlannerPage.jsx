import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FaCalendarAlt, 
  FaPlus, 
  FaTrash, 
  FaEdit, 
  FaClock, 
  FaUtensils,
  FaShoppingCart,
  FaChevronLeft,
  FaChevronRight,
  FaTimes
} from 'react-icons/fa';

const GET_MEAL_PLANS = gql`
  query GetMealPlans {
    getMealPlans {
      id
      name
      weekStartDate
      isActive
      items {
        id
        dayOfWeek
        mealType
        servings
        notes
        recipe {
          id
          title
          image
          cookingTime
          category
        }
      }
    }
  }
`;

const GET_RECIPES = gql`
  query GetRecipes($page: Int!, $limit: Int!) {
    recipes(page: $page, limit: $limit) {
      recipes {
        id
        title
        image
        cookingTime
        category
        description
      }
    }
  }
`;

const CREATE_MEAL_PLAN = gql`
  mutation CreateMealPlan($input: MealPlanInput!) {
    createMealPlan(input: $input) {
      id
      name
      weekStartDate
      isActive
    }
  }
`;

const ADD_MEAL_PLAN_ITEM = gql`
  mutation AddMealPlanItem($mealPlanId: ID!, $input: MealPlanItemInput!) {
    addMealPlanItem(mealPlanId: $mealPlanId, input: $input) {
      id
      dayOfWeek
      mealType
      servings
      recipe {
        id
        title
        image
        cookingTime
      }
    }
  }
`;

const REMOVE_MEAL_PLAN_ITEM = gql`
  mutation RemoveMealPlanItem($id: ID!) {
    removeMealPlanItem(id: $id)
  }
`;

const GENERATE_SHOPPING_LIST = gql`
  mutation GenerateShoppingListFromMealPlan($mealPlanId: ID!) {
    generateShoppingListFromMealPlan(mealPlanId: $mealPlanId) {
      id
      name
      items {
        id
        ingredientName
        quantity
        category
      }
    }
  }
`;

const MealPlannerPage = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedMealPlan, setSelectedMealPlan] = useState(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [generatedShoppingList, setGeneratedShoppingList] = useState(null);

  const { data: mealPlansData, loading, refetch } = useQuery(GET_MEAL_PLANS);
  const { data: recipesData } = useQuery(GET_RECIPES, {
    variables: { page: 1, limit: 50 }
  });

  const [createMealPlan] = useMutation(CREATE_MEAL_PLAN, {
    onCompleted: () => {
      refetch();
      setShowCreateModal(false);
    }
  });

  const [addMealPlanItem] = useMutation(ADD_MEAL_PLAN_ITEM, {
    onCompleted: () => {
      refetch();
      setShowRecipeModal(false);
    }
  });

  const [removeMealPlanItem] = useMutation(REMOVE_MEAL_PLAN_ITEM, {
    onCompleted: () => {
      refetch();
    }
  });

  const [generateShoppingList] = useMutation(GENERATE_SHOPPING_LIST, {
    onCompleted: (data) => {
      setGeneratedShoppingList(data.generateShoppingListFromMealPlan);
      setShowShoppingList(true);
    }
  });

  const mealPlans = mealPlansData?.getMealPlans || [];
  const recipes = recipesData?.recipes?.recipes || [];

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

  const getWeekDates = (startDate) => {
    const dates = [];
    const start = new Date(startDate);
    start.setDate(start.getDate() - start.getDay()); // Start from Sunday
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates(currentWeek);
  const weekStartDate = weekDates[0].toISOString().split('T')[0];

  // Find meal plan for current week
  useEffect(() => {
    const currentWeekPlan = mealPlans.find(plan => 
      plan.weekStartDate === weekStartDate
    );
    setSelectedMealPlan(currentWeekPlan);
  }, [mealPlans, weekStartDate]);

  const getMealForSlot = (dayOfWeek, mealType) => {
    if (!selectedMealPlan) return null;
    return selectedMealPlan.items.find(item => 
      item.dayOfWeek === dayOfWeek && item.mealType === mealType
    );
  };

  const handleCreateMealPlan = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    await createMealPlan({
      variables: {
        input: {
          name: formData.get('name'),
          weekStartDate: weekStartDate
        }
      }
    });
  };

  const handleAddMeal = async (recipe) => {
    if (!selectedMealPlan || !selectedSlot) return;

    await addMealPlanItem({
      variables: {
        mealPlanId: selectedMealPlan.id,
        input: {
          recipeId: recipe.id,
          dayOfWeek: selectedSlot.dayOfWeek,
          mealType: selectedSlot.mealType,
          servings: 1
        }
      }
    });
  };

  const handleRemoveMeal = async (mealItem) => {
    if (window.confirm('Remove this meal from your plan?')) {
      await removeMealPlanItem({
        variables: { id: mealItem.id }
      });
    }
  };

  const handleGenerateShoppingList = async () => {
    if (!selectedMealPlan) return;

    try {
      await generateShoppingList({
        variables: { mealPlanId: selectedMealPlan.id }
      });
    } catch (error) {
      console.error('Error generating shopping list:', error);
      alert('Error generating shopping list. Please try again.');
    }
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentWeek(newDate);
  };

  const getMealTypeIcon = (mealType) => {
    switch (mealType) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'dinner': return '🌙';
      case 'snack': return '🍎';
      default: return '🍽️';
    }
  };

  if (loading) return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="skeleton h-10 w-64 mb-6"></div>
        <div className="grid grid-cols-8 gap-3">
          {Array.from({ length: 32 }).map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-xl"></div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--primary-green)' }}>
              Meal Planner
            </h1>
            <p className="text-base text-gray-600">
              Plan your weekly meals and generate shopping lists
            </p>
          </div>
          <div className="flex gap-3">
            {selectedMealPlan && (
              <button
                onClick={handleGenerateShoppingList}
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <FaShoppingCart />
                Shopping List
              </button>
            )}
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <FaPlus />
              New Plan
            </button>
          </div>
        </motion.div>

        {/* Week Navigation */}
        <motion.div
          className="bg-white rounded-2xl card-shadow p-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateWeek(-1)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FaChevronLeft style={{ color: 'var(--sage-green)' }} />
            </button>
            
            <div className="text-center">
              <h2 className="text-lg font-bold" style={{ color: 'var(--primary-green)' }}>
                Week of {weekDates[0].toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </h2>
              {selectedMealPlan ? (
                <p className="text-sm" style={{ color: 'var(--sage-green)' }}>
                  Plan: {selectedMealPlan.name}
                </p>
              ) : (
                <p className="text-sm text-gray-500">
                  No meal plan for this week
                </p>
              )}
            </div>
            
            <button
              onClick={() => navigateWeek(1)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FaChevronRight style={{ color: 'var(--sage-green)' }} />
            </button>
          </div>
        </motion.div>

        {/* Meal Plan Grid */}
        <motion.div
          className="bg-white rounded-3xl card-shadow p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="grid grid-cols-8 gap-2">
            {/* Header Row */}
            <div className="font-bold text-center py-3 text-sm" style={{ color: 'var(--primary-green)' }}>
              Meal Type
            </div>
            {daysOfWeek.map((day, index) => (
              <div key={day} className="font-bold text-center py-3 text-sm" style={{ color: 'var(--primary-green)' }}>
                <div>{day.slice(0, 3)}</div>
                <div className="text-xs font-normal" style={{ color: 'var(--sage-green)' }}>
                  {weekDates[index].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))}

            {/* Meal Rows */}
            {mealTypes.map((mealType) => (
              <React.Fragment key={mealType}>
                <div className="font-semibold py-3 px-2 capitalize text-sm flex items-center gap-2" style={{ color: 'var(--dark-text)' }}>
                  <span>{getMealTypeIcon(mealType)}</span>
                  {mealType}
                </div>
                {daysOfWeek.map((day, dayIndex) => {
                  const meal = getMealForSlot(dayIndex, mealType);
                  return (
                    <div
                      key={`${mealType}-${dayIndex}`}
                      className="min-h-24 border-2 border-dashed rounded-xl p-2 transition-all duration-300 hover:border-green-300 cursor-pointer relative group"
                      style={{ borderColor: meal ? 'var(--sage-green)' : 'var(--border-color)' }}
                      onClick={() => {
                        if (selectedMealPlan) {
                          setSelectedSlot({ dayOfWeek: dayIndex, mealType });
                          setShowRecipeModal(true);
                        }
                      }}
                    >
                      {meal ? (
                        <div className="h-full">
                          <img
                            src={meal.recipe.image}
                            alt={meal.recipe.title}
                            className="w-full h-16 object-cover rounded-lg mb-1"
                          />
                          <h4 className="font-medium text-xs mb-1 line-clamp-2" style={{ color: 'var(--dark-text)' }}>
                            {meal.recipe.title}
                          </h4>
                          <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--sage-green)' }}>
                            <FaClock />
                            <span>{meal.recipe.cookingTime}m</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveMeal(meal);
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FaTimes className="text-xs" />
                          </button>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-400">
                          {selectedMealPlan ? (
                            <div className="text-center">
                              <FaPlus className="mx-auto mb-1 text-sm" />
                              <span className="text-xs">Add Meal</span>
                            </div>
                          ) : (
                            <span className="text-xs">Create plan</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </motion.div>

        {/* Create Meal Plan Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              className="bg-white rounded-3xl p-6 max-w-md w-full mx-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--primary-green)' }}>
                Create Meal Plan
              </h3>
              <form onSubmit={handleCreateMealPlan}>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--dark-text)' }}>
                    Plan Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g., Weekly Meal Plan"
                    className="w-full p-3 border-2 rounded-xl text-sm"
                    style={{ borderColor: 'var(--border-color)' }}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--dark-text)' }}>
                    Week Starting
                  </label>
                  <input
                    type="text"
                    value={weekDates[0].toLocaleDateString()}
                    disabled
                    className="w-full p-3 border-2 rounded-xl bg-gray-50 text-sm"
                    style={{ borderColor: 'var(--border-color)' }}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-3 px-4 border-2 rounded-xl font-semibold transition-colors text-sm"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--dark-text)' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary text-sm"
                  >
                    Create Plan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Recipe Selection Modal */}
        {showRecipeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              className="bg-white rounded-3xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold" style={{ color: 'var(--primary-green)' }}>
                  Choose a Recipe
                </h3>
                <button
                  onClick={() => setShowRecipeModal(false)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <FaTimes className="text-gray-500" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recipes.map((recipe) => (
                  <motion.div
                    key={recipe.id}
                    className="border-2 rounded-xl p-3 cursor-pointer hover:border-green-300 transition-colors"
                    style={{ borderColor: 'var(--border-color)' }}
                    onClick={() => handleAddMeal(recipe)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-24 object-cover rounded-lg mb-2"
                    />
                    <h4 className="font-semibold text-sm mb-1" style={{ color: 'var(--dark-text)' }}>
                      {recipe.title}
                    </h4>
                    <div className="flex items-center justify-between text-xs" style={{ color: 'var(--sage-green)' }}>
                      <div className="flex items-center gap-1">
                        <FaClock />
                        <span>{recipe.cookingTime}m</span>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs" style={{ background: 'var(--cream)' }}>
                        {recipe.category}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Shopping List Modal */}
        {showShoppingList && generatedShoppingList && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              className="bg-white rounded-3xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold" style={{ color: 'var(--primary-green)' }}>
                  Shopping List Generated
                </h3>
                <button
                  onClick={() => setShowShoppingList(false)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <FaTimes className="text-gray-500" />
                </button>
              </div>
              
              <div className="mb-4">
                <h4 className="font-semibold text-base mb-2">{generatedShoppingList.name}</h4>
                <p className="text-sm text-gray-600">
                  {generatedShoppingList.items.length} items to buy
                </p>
              </div>

              <div className="space-y-3">
                {generatedShoppingList.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: 'var(--cream)' }}
                  >
                    <div>
                      <h5 className="font-medium text-sm">{item.ingredientName}</h5>
                      <p className="text-xs text-gray-600">{item.category}</p>
                    </div>
                    <span className="font-semibold text-sm" style={{ color: 'var(--primary-green)' }}>
                      {item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowShoppingList(false)}
                  className="flex-1 btn-secondary text-sm"
                >
                  Close
                </button>
                <Link
                  to="/shopping-list"
                  className="flex-1 btn-primary text-sm text-center"
                  onClick={() => setShowShoppingList(false)}
                >
                  View Full List
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealPlannerPage;