import { useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaUpload, FaSpinner } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';
import { Cloudinary } from '@cloudinary/url-gen';

const cld = new Cloudinary({ 
  cloud: { 
    cloudName: import.meta.env.REACT_APP_CLOUDINARY_CLOUD_NAME 
  } 
});

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
      followers {
        id
      }
      following {
        id
      }
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

    // Validate file size (max 3MB)
    if (file.size > 3 * 1024 * 1024) {
      setUploadError('Image size must be less than 3MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    
    setIsUploading(true);
    setUploadError('');
    
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
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
      
      const { data } = await createRecipe({ 
        variables,
        optimisticResponse: {
          __typename: "Mutation",
          createRecipe: {
            __typename: "Recipe",
            id: "temp-id",
            ...variables,
            author: userData.getUserProfile,
            likes: [],
            createdAt: new Date().toISOString()
          }
        }
      });
      
      setSuccess(true);
      setFormData(initialFormState);
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
        className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center"
      >
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-green-600 mb-4">Recipe Created Successfully!</h2>
          <p className="text-gray-600">You'll be redirected to your new recipe shortly.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Recipe</h1>
        {userId && (
          <p className="mt-2 text-gray-600">
            Author: <span className="font-semibold">{userData?.getUserProfile?.name}</span>
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Recipe Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Image Upload</label>
                <div className="mt-1 flex items-center">
                  <label className="cursor-pointer bg-gray-100 rounded-md px-4 py-2 hover:bg-gray-200 flex items-center">
                    {isUploading ? (
                      <>
                        <FaSpinner className="inline mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <FaUpload className="inline mr-2" />
                        Upload Image
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
                {uploadError && <p className="mt-1 text-sm text-red-600">{uploadError}</p>}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Cooking Time (minutes)</label>
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                >
                  <option>Main Course</option>
                  <option>Appetizer</option>
                  <option>Dessert</option>
                  <option>Breakfast</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tags</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',') })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                  placeholder="Comma separated tags"
                />
              </div>
            </div>
          </div>

          {/* Ingredients Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Ingredients</h3>
              <button
                type="button"
                onClick={addIngredient}
                className="bg-black text-white px-3 py-1 rounded-md hover:bg-gray-800 flex items-center"
              >
                <FaPlus className="inline mr-1" /> Add
              </button>
            </div>
            {formData.ingredients.map((ing, index) => (
              <div key={index} className="grid grid-cols-2 gap-4 mb-3">
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
                  className="rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                />
                <input
                  type="text"
                  placeholder="Quantity"
                  value={ing.quantity}
                  onChange={(e) => {
                    const newIngredients = [...formData.ingredients];
                    newIngredients[index].quantity = e.target.value;
                    setFormData({ ...formData, ingredients: newIngredients });
                  }}
                  required={index === 0}
                  className="rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                />
              </div>
            ))}
          </div>

          {/* Steps Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cooking Steps</h3>
            {formData.steps.map((step, index) => (
              <div key={index} className="mb-3">
                <textarea
                  value={step}
                  onChange={(e) => {
                    const newSteps = [...formData.steps];
                    newSteps[index] = e.target.value;
                    setFormData({ ...formData, steps: newSteps });
                  }}
                  required={index === 0}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                  rows="2"
                  placeholder={`Step ${index + 1}`}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, steps: [...formData.steps, ''] })}
              className="bg-black text-white px-3 py-1 rounded-md hover:bg-gray-800 flex items-center"
            >
              <FaPlus className="inline mr-1" /> Add Step
            </button>
          </div>
          
          {formData.image && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Image Preview</h3>
              <img
                src={formData.image}
                alt="Preview"
                className="w-48 h-48 object-cover rounded-lg"
              />
            </div>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Creating Recipe...
              </>
            ) : (
              'Create Recipe'
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default CreateRecipe;