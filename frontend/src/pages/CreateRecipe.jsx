import { useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaUpload, FaSpinner, FaTimes, FaImage, FaClock, FaUtensils } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';

const CREATE_RECIPE = gql`
  mutation CreateRecipe(
    $title: String!
    $description: String!
    $image: String
    $tags: [String]!
    $cookingTime: Int!
    $steps: [String]!
    $category: String!
    $ingredients: [IngredientInput]! 
  ) {
    createRecipe(
      title: $title
      description: $description
      image: $image
      tags: $tags
      cookingTime: $cookingTime
      steps: $steps
      category: $category
      ingredients: $ingredients
    ) {
      id
      title
    }
  }
`;

const GET_USER_PROFILE = gql`
  query getUserProfile($id: ID!) {
    getUserProfile(id: $id) {
      id
      name
      avatar
    }
  }
`;

const CreateRecipe = () => {
  const [userId, setUserId] = useState(null);
  const { data: userData } = useQuery(GET_USER_PROFILE, {
    variables: { id: userId },
    skip: !userId
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const initialFormState = {
    title: '',
    description: '',
    image: '',
    tags: [],
    cookingTime: 30,
    steps: [''],
    category: 'Main Course',
    ingredients: [{ name: '', quantity: '' }]
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const [createRecipe] = useMutation(CREATE_RECIPE);
  const navigate = useNavigate();

  const categories = [
    'Main Course', 'Appetizer', 'Dessert', 'Breakfast', 
    'Lunch', 'Dinner', 'Snack', 'Beverage', 'Vegetarian', 'Vegan'
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      setUserId(decoded.id);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setUploadError('Image size must be less than 3MB');
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    formDataUpload.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    
    setIsUploading(true);
    setUploadError('');
    
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formDataUpload }
      );
      
      const data = await response.json();
      setFormData(prev => ({ ...prev, image: data.secure_url }));
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadError('Image upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', quantity: '' }]
    }));
  };

  const removeIngredient = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, '']
    }));
  };

  const removeStep = (index) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const variables = {
        ...formData,
        cookingTime: parseInt(formData.cookingTime),
        tags: formData.tags.filter(tag => tag.trim() !== ''),
        steps: formData.steps.filter(step => step.trim() !== '')
      };
      
      const { data } = await createRecipe({ variables });
      
      setSuccess(true);
      setTimeout(() => {
        navigate(`/recipe/${data.createRecipe.id}`);
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen gradient-bg flex items-center justify-center px-4"
      >
        <div className="max-w-md mx-auto bg-white rounded-3xl card-shadow p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--primary-green)' }}>
            Recipe Created!
          </h2>
          <p className="text-gray-600 mb-6">
            Your delicious recipe has been shared with the community.
          </p>
          <div className="animate-spin w-8 h-8 border-4 border-green-200 border-t-green-500 rounded-full mx-auto"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen gradient-bg py-8 px-4"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--primary-green)' }}>
            Create New Recipe
          </h1>
          <p className="text-lg text-gray-600">
            Share your culinary masterpiece with the world
          </p>
          {userData?.getUserProfile && (
            <div className="flex items-center justify-center gap-3 mt-4 p-3 bg-white rounded-2xl card-shadow inline-flex">
              <img
                src={userData.getUserProfile.avatar}
                alt={userData.getUserProfile.name}
                className="w-8 h-8 rounded-full border-2 border-green-200"
              />
              <span className="font-semibold" style={{ color: 'var(--dark-text)' }}>
                {userData.getUserProfile.name}
              </span>
            </div>
          )}
        </motion.div>

        <motion.div
          className="bg-white rounded-3xl card-shadow p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-semibold mb-3" style={{ color: 'var(--primary-green)' }}>
                    Recipe Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your recipe title..."
                    className="w-full p-4 border-2 rounded-2xl text-lg transition-all duration-300 focus:outline-none"
                    style={{ 
                      borderColor: 'var(--border-color)',
                      background: 'var(--cream)'
                    }}
                  />
                </div>

                <div>
                  <label className="block text-lg font-semibold mb-3" style={{ color: 'var(--primary-green)' }}>
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    required
                    placeholder="Describe your recipe..."
                    className="w-full p-4 border-2 rounded-2xl text-lg resize-none transition-all duration-300 focus:outline-none"
                    style={{ 
                      borderColor: 'var(--border-color)',
                      background: 'var(--cream)'
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-lg font-semibold mb-3" style={{ color: 'var(--primary-green)' }}>
                      <FaClock className="inline mr-2" />
                      Cook Time (mins) *
                    </label>
                    <input
                      type="number"
                      name="cookingTime"
                      value={formData.cookingTime}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        cookingTime: parseInt(e.target.value) || 0
                      }))}
                      min="1"
                      required
                      className="w-full p-4 border-2 rounded-2xl text-lg transition-all duration-300 focus:outline-none"
                      style={{ 
                        borderColor: 'var(--border-color)',
                        background: 'var(--cream)'
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-semibold mb-3" style={{ color: 'var(--primary-green)' }}>
                      <FaUtensils className="inline mr-2" />
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full p-4 border-2 rounded-2xl text-lg transition-all duration-300 focus:outline-none"
                      style={{ 
                        borderColor: 'var(--border-color)',
                        background: 'var(--cream)'
                      }}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-semibold mb-3" style={{ color: 'var(--primary-green)' }}>
                    <FaImage className="inline mr-2" />
                    Recipe Image
                  </label>
                  <div className="border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 hover:border-green-300"
                       style={{ borderColor: 'var(--border-color)' }}>
                    {formData.image ? (
                      <div className="relative">
                        <img
                          src={formData.image}
                          alt="Recipe preview"
                          className="w-full h-48 object-cover rounded-xl mb-4"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <FaImage className="text-4xl mx-auto mb-4" style={{ color: 'var(--sage-green)' }} />
                        <p className="text-gray-600 mb-4">Upload a mouth-watering photo</p>
                      </div>
                    )}
                    
                    <label className="btn-secondary cursor-pointer inline-flex items-center gap-2">
                      {isUploading ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <FaUpload />
                          {formData.image ? 'Change Image' : 'Upload Image'}
                        </>
                      )}
                      <input
                        type="file"
                        onChange={handleImageUpload}
                        className="hidden"
                        accept="image/*"
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                  {uploadError && (
                    <p className="mt-2 text-red-500 text-sm">{uploadError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-lg font-semibold mb-3" style={{ color: 'var(--primary-green)' }}>
                    Tags
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags.join(', ')}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(tag => tag.trim()) })}
                    placeholder="italian, pasta, quick, easy"
                    className="w-full p-4 border-2 rounded-2xl text-lg transition-all duration-300 focus:outline-none"
                    style={{ 
                      borderColor: 'var(--border-color)',
                      background: 'var(--cream)'
                    }}
                  />
                  <p className="text-sm text-gray-500 mt-2">Separate tags with commas</p>
                </div>
              </div>
            </div>

            {/* Ingredients Section */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold" style={{ color: 'var(--primary-green)' }}>
                  Ingredients
                </h3>
                <button
                  type="button"
                  onClick={addIngredient}
                  className="btn-secondary flex items-center gap-2"
                >
                  <FaPlus />
                  Add Ingredient
                </button>
              </div>
              
              <div className="space-y-4">
                {formData.ingredients.map((ing, index) => (
                  <motion.div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl"
                    style={{ background: 'var(--cream)' }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <input
                      type="text"
                      placeholder="Ingredient name"
                      value={ing.name}
                      onChange={(e) => {
                        const newIngredients = [...formData.ingredients];
                        newIngredients[index].name = e.target.value;
                        setFormData({ ...formData, ingredients: newIngredients });
                      }}
                      required={index === 0}
                      className="p-3 border-2 rounded-xl transition-all duration-300 focus:outline-none"
                      style={{ borderColor: 'var(--border-color)' }}
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Quantity (e.g., 2 cups)"
                        value={ing.quantity}
                        onChange={(e) => {
                          const newIngredients = [...formData.ingredients];
                          newIngredients[index].quantity = e.target.value;
                          setFormData({ ...formData, ingredients: newIngredients });
                        }}
                        required={index === 0}
                        className="flex-1 p-3 border-2 rounded-xl transition-all duration-300 focus:outline-none"
                        style={{ borderColor: 'var(--border-color)' }}
                      />
                      {formData.ingredients.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeIngredient(index)}
                          className="bg-red-500 text-white px-3 rounded-xl hover:bg-red-600 transition-colors"
                        >
                          <FaTimes />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Steps Section */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold" style={{ color: 'var(--primary-green)' }}>
                  Cooking Steps
                </h3>
                <button
                  type="button"
                  onClick={addStep}
                  className="btn-secondary flex items-center gap-2"
                >
                  <FaPlus />
                  Add Step
                </button>
              </div>
              
              <div className="space-y-4">
                {formData.steps.map((step, index) => (
                  <motion.div
                    key={index}
                    className="flex gap-4 p-4 rounded-2xl"
                    style={{ background: 'var(--cream)' }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="step-counter flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 flex gap-2">
                      <textarea
                        value={step}
                        onChange={(e) => {
                          const newSteps = [...formData.steps];
                          newSteps[index] = e.target.value;
                          setFormData({ ...formData, steps: newSteps });
                        }}
                        required={index === 0}
                        className="flex-1 p-3 border-2 rounded-xl resize-none transition-all duration-300 focus:outline-none"
                        style={{ borderColor: 'var(--border-color)' }}
                        rows="3"
                        placeholder={`Describe step ${index + 1}...`}
                      />
                      {formData.steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStep(index)}
                          className="bg-red-500 text-white px-3 rounded-xl hover:bg-red-600 transition-colors self-start"
                        >
                          <FaTimes />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="text-center pt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary text-xl px-12 py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mx-auto"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Creating Recipe...
                  </>
                ) : (
                  <>
                    <FaUtensils />
                    Create Recipe
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CreateRecipe;