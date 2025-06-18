import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { 
  FaMapMarkerAlt, 
  FaUtensils, 
  FaHeart, 
  FaLeaf, 
  FaFire,
  FaArrowRight,
  FaArrowLeft,
  FaCheck,
  FaGlobe,
  FaPray
} from 'react-icons/fa';

const GET_ONBOARDING_DATA = gql`
  query GetOnboardingData {
    getOnboardingData {
      countries {
        code
        name
        states {
          code
          name
          cities
        }
      }
      religions
      cuisineTypes
      dietTypes
      spiceLevels
    }
  }
`;

const COMPLETE_ONBOARDING = gql`
  mutation CompleteOnboarding(
    $culturalPreference: CulturalPreferenceInput!
    $location: LocationInput!
  ) {
    completeOnboarding(
      culturalPreference: $culturalPreference
      location: $location
    ) {
      id
      name
      isOnboardingComplete
    }
  }
`;

const DETECT_LOCATION = gql`
  mutation DetectLocationFromIP {
    detectLocationFromIP {
      country
      state
      city
      latitude
      longitude
    }
  }
`;

const OnboardingPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Location data
    country: '',
    state: '',
    city: '',
    latitude: null,
    longitude: null,
    
    // Cultural preferences
    religion: '',
    dietTypes: [],
    preferredCuisines: [],
    spiceLevel: 'MEDIUM',
    avoidIngredients: [],
    preferredIngredients: [],
    culturalRestrictions: [],
    festivalPreferences: [],
    regionalPreferences: []
  });

  const navigate = useNavigate();
  const { data: onboardingData, loading } = useQuery(GET_ONBOARDING_DATA);
  const [completeOnboarding, { loading: completing }] = useMutation(COMPLETE_ONBOARDING, {
    onCompleted: () => {
      navigate('/');
      window.location.reload();
    }
  });
  const [detectLocation] = useMutation(DETECT_LOCATION, {
    onCompleted: (data) => {
      if (data.detectLocationFromIP) {
        setFormData(prev => ({
          ...prev,
          country: data.detectLocationFromIP.country,
          state: data.detectLocationFromIP.state,
          city: data.detectLocationFromIP.city,
          latitude: data.detectLocationFromIP.latitude,
          longitude: data.detectLocationFromIP.longitude
        }));
      }
    }
  });

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to RecipeHub!',
      subtitle: 'Let\'s personalize your culinary journey',
      icon: FaUtensils
    },
    {
      id: 'location',
      title: 'Where are you from?',
      subtitle: 'Help us suggest local recipes and ingredients',
      icon: FaMapMarkerAlt
    },
    {
      id: 'religion',
      title: 'Religious Preferences',
      subtitle: 'We respect your dietary guidelines',
      icon: FaPray
    },
    {
      id: 'diet',
      title: 'Dietary Preferences',
      subtitle: 'Tell us about your food choices',
      icon: FaLeaf
    },
    {
      id: 'cuisine',
      title: 'Favorite Cuisines',
      subtitle: 'What flavors make your heart sing?',
      icon: FaGlobe
    },
    {
      id: 'spice',
      title: 'Spice Level',
      subtitle: 'How much heat can you handle?',
      icon: FaFire
    },
    {
      id: 'ingredients',
      title: 'Ingredient Preferences',
      subtitle: 'Any ingredients you love or avoid?',
      icon: FaHeart
    }
  ];

  useEffect(() => {
    // Auto-detect location on component mount
    detectLocation();
  }, [detectLocation]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      await completeOnboarding({
        variables: {
          culturalPreference: {
            religion: formData.religion || null,
            dietTypes: formData.dietTypes,
            preferredCuisines: formData.preferredCuisines,
            spiceLevel: formData.spiceLevel,
            avoidIngredients: formData.avoidIngredients,
            preferredIngredients: formData.preferredIngredients,
            culturalRestrictions: formData.culturalRestrictions,
            festivalPreferences: formData.festivalPreferences,
            regionalPreferences: formData.regionalPreferences
          },
          location: {
            country: formData.country,
            state: formData.state,
            city: formData.city,
            latitude: formData.latitude,
            longitude: formData.longitude,
            isDefault: true
          }
        }
      });
    } catch (error) {
      console.error('Onboarding error:', error);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleArrayItem = (field, item) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-green-200 border-t-green-500 rounded-full mx-auto mb-4"></div>
          <p className="text-lg font-semibold" style={{ color: 'var(--primary-green)' }}>
            Preparing your experience...
          </p>
        </div>
      </div>
    );
  }

  const currentStepData = steps[currentStep];
  const countries = onboardingData?.getOnboardingData?.countries || [];
  const selectedCountry = countries.find(c => c.code === formData.country);
  const states = selectedCountry?.states || [];
  const selectedState = states.find(s => s.code === formData.state);
  const cities = selectedState?.cities || [];

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--primary-green)' }}>
              Setup Your Profile
            </h1>
            <span className="text-sm font-medium" style={{ color: 'var(--sage-green)' }}>
              {currentStep + 1} of {steps.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{ 
                width: `${((currentStep + 1) / steps.length) * 100}%`,
                background: 'linear-gradient(135deg, var(--primary-green) 0%, var(--light-green) 100%)'
              }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl card-shadow p-8 mb-8"
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                   style={{ background: 'linear-gradient(135deg, var(--primary-green) 0%, var(--light-green) 100%)' }}>
                <currentStepData.icon className="text-white text-2xl" />
              </div>
              <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--primary-green)' }}>
                {currentStepData.title}
              </h2>
              <p className="text-lg text-gray-600">
                {currentStepData.subtitle}
              </p>
            </div>

            {/* Step-specific content */}
            {currentStep === 0 && (
              <div className="text-center">
                <div className="text-6xl mb-6">🍳</div>
                <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                  We'll help you discover recipes that match your cultural background, 
                  dietary preferences, and taste preferences. This will only take a few minutes!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                  <div className="text-center p-4">
                    <div className="text-3xl mb-2">🌍</div>
                    <h3 className="font-semibold mb-2">Cultural Recipes</h3>
                    <p className="text-sm text-gray-600">Discover authentic recipes from your region</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="text-3xl mb-2">🥗</div>
                    <h3 className="font-semibold mb-2">Dietary Preferences</h3>
                    <p className="text-sm text-gray-600">Recipes that match your dietary needs</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="text-3xl mb-2">🎯</div>
                    <h3 className="font-semibold mb-2">Personalized</h3>
                    <p className="text-sm text-gray-600">Recommendations just for you</p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--dark-text)' }}>
                      Country *
                    </label>
                    <select
                      value={formData.country}
                      onChange={(e) => {
                        updateFormData('country', e.target.value);
                        updateFormData('state', '');
                        updateFormData('city', '');
                      }}
                      className="w-full p-3 border-2 rounded-xl"
                      style={{ borderColor: 'var(--border-color)' }}
                      required
                    >
                      <option value="">Select Country</option>
                      {countries.map(country => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--dark-text)' }}>
                      State/Province
                    </label>
                    <select
                      value={formData.state}
                      onChange={(e) => {
                        updateFormData('state', e.target.value);
                        updateFormData('city', '');
                      }}
                      className="w-full p-3 border-2 rounded-xl"
                      style={{ borderColor: 'var(--border-color)' }}
                      disabled={!formData.country}
                    >
                      <option value="">Select State</option>
                      {states.map(state => (
                        <option key={state.code} value={state.code}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--dark-text)' }}>
                      City
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => updateFormData('city', e.target.value)}
                      className="w-full p-3 border-2 rounded-xl"
                      style={{ borderColor: 'var(--border-color)' }}
                      disabled={!formData.state}
                    >
                      <option value="">Select City</option>
                      {cities.map(city => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="text-center">
                  <button
                    onClick={() => detectLocation()}
                    className="btn-secondary flex items-center gap-2 mx-auto"
                  >
                    <FaMapMarkerAlt />
                    Auto-detect my location
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {onboardingData?.getOnboardingData?.religions?.map(religion => (
                    <button
                      key={religion}
                      onClick={() => updateFormData('religion', religion === formData.religion ? '' : religion)}
                      className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                        formData.religion === religion
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">
                        {religion === 'HINDU' && '🕉️'}
                        {religion === 'MUSLIM' && '☪️'}
                        {religion === 'CHRISTIAN' && '✝️'}
                        {religion === 'SIKH' && '☬'}
                        {religion === 'BUDDHIST' && '☸️'}
                        {religion === 'JAIN' && '🤲'}
                        {religion === 'JEWISH' && '✡️'}
                        {(religion === 'OTHER' || religion === 'NONE') && '🤝'}
                      </div>
                      <div className="font-semibold text-sm">
                        {religion.replace('_', ' ')}
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 text-center">
                  This helps us suggest recipes that align with your religious dietary guidelines
                </p>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {onboardingData?.getOnboardingData?.dietTypes?.map(dietType => (
                    <button
                      key={dietType}
                      onClick={() => toggleArrayItem('dietTypes', dietType)}
                      className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                        formData.dietTypes.includes(dietType)
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">
                        {dietType === 'VEGETARIAN' && '🥬'}
                        {dietType === 'NON_VEGETARIAN' && '🍖'}
                        {dietType === 'VEGAN' && '🌱'}
                        {dietType === 'JAIN_VEGETARIAN' && '🙏'}
                        {dietType === 'HALAL' && '🥩'}
                        {dietType === 'KOSHER' && '✡️'}
                        {dietType === 'EGGETARIAN' && '🥚'}
                      </div>
                      <div className="font-semibold text-sm">
                        {dietType.replace('_', ' ')}
                      </div>
                      {formData.dietTypes.includes(dietType) && (
                        <FaCheck className="text-green-500 mt-2 mx-auto" />
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 text-center">
                  Select all that apply to your dietary preferences
                </p>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {onboardingData?.getOnboardingData?.cuisineTypes?.map(cuisine => (
                    <button
                      key={cuisine}
                      onClick={() => toggleArrayItem('preferredCuisines', cuisine)}
                      className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                        formData.preferredCuisines.includes(cuisine)
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">
                        {cuisine.includes('INDIAN') && '🇮🇳'}
                        {cuisine === 'CHINESE' && '🇨🇳'}
                        {cuisine === 'ITALIAN' && '🇮🇹'}
                        {cuisine === 'MEXICAN' && '🇲🇽'}
                        {cuisine === 'THAI' && '🇹🇭'}
                        {cuisine === 'JAPANESE' && '🇯🇵'}
                        {!['CHINESE', 'ITALIAN', 'MEXICAN', 'THAI', 'JAPANESE'].includes(cuisine) && !cuisine.includes('INDIAN') && '🍽️'}
                      </div>
                      <div className="font-semibold text-xs">
                        {cuisine.replace('_', ' ')}
                      </div>
                      {formData.preferredCuisines.includes(cuisine) && (
                        <FaCheck className="text-green-500 mt-2 mx-auto" />
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 text-center">
                  Choose your favorite cuisines to get personalized recommendations
                </p>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {onboardingData?.getOnboardingData?.spiceLevels?.map(level => (
                    <button
                      key={level}
                      onClick={() => updateFormData('spiceLevel', level)}
                      className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                        formData.spiceLevel === level
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-red-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">
                        {level === 'MILD' && '😊'}
                        {level === 'MEDIUM' && '😋'}
                        {level === 'SPICY' && '🌶️'}
                        {level === 'VERY_SPICY' && '🔥'}
                      </div>
                      <div className="font-semibold">
                        {level.replace('_', ' ')}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {level === 'MILD' && 'Just a hint'}
                        {level === 'MEDIUM' && 'Balanced heat'}
                        {level === 'SPICY' && 'Bring the heat'}
                        {level === 'VERY_SPICY' && 'Fire it up!'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-semibold mb-3" style={{ color: 'var(--primary-green)' }}>
                      Ingredients you love ❤️
                    </label>
                    <textarea
                      value={formData.preferredIngredients.join(', ')}
                      onChange={(e) => updateFormData('preferredIngredients', 
                        e.target.value.split(',').map(item => item.trim()).filter(item => item)
                      )}
                      placeholder="e.g., paneer, coconut, ginger, garlic..."
                      className="w-full p-4 border-2 rounded-xl h-32 resize-none"
                      style={{ borderColor: 'var(--border-color)' }}
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-semibold mb-3" style={{ color: 'var(--accent-orange)' }}>
                      Ingredients to avoid 🚫
                    </label>
                    <textarea
                      value={formData.avoidIngredients.join(', ')}
                      onChange={(e) => updateFormData('avoidIngredients', 
                        e.target.value.split(',').map(item => item.trim()).filter(item => item)
                      )}
                      placeholder="e.g., onion, garlic, mushrooms..."
                      className="w-full p-4 border-2 rounded-xl h-32 resize-none"
                      style={{ borderColor: 'var(--border-color)' }}
                    />
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Separate ingredients with commas. This helps us filter recipes for you.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
              currentStep === 0
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-gray-100'
            }`}
            style={{ color: 'var(--sage-green)' }}
          >
            <FaArrowLeft />
            Previous
          </button>

          <div className="flex gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'bg-green-500 scale-125'
                    : index < currentStep
                      ? 'bg-green-300'
                      : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={completing}
            className="btn-primary flex items-center gap-2"
          >
            {completing ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                Setting up...
              </>
            ) : currentStep === steps.length - 1 ? (
              <>
                Complete Setup
                <FaCheck />
              </>
            ) : (
              <>
                Next
                <FaArrowRight />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;