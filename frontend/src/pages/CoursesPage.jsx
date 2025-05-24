import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

// Sample data with YouTube video IDs
const courses = [
  {
    title: 'Italian Cuisine Masterclass',
    progress: 65,
    lessons: 12,
    youtubeId: 'dQw4w9WgXcQ', // Replace with actual YouTube video ID
    description: 'Learn authentic Italian cooking techniques from professional chefs'
  },
  {
    title: 'Baking Fundamentals',
    progress: 30,
    lessons: 8,
    youtubeId: 'dQw4w9WgXcQ', // Replace with actual YouTube video ID
    description: 'Master the basics of baking from scratch'
  },
  {
    title: 'Asian Street Food',
    progress: 0,
    lessons: 10,
    youtubeId: 'dQw4w9WgXcQ', // Replace with actual YouTube video ID
    description: 'Discover the flavors of popular Asian street foods'
  },
  {
    title: 'Healthy Meal Prep',
    progress: 15,
    lessons: 6,
    youtubeId: 'dQw4w9WgXcQ', // Replace with actual YouTube video ID
    description: 'Learn to prepare healthy meals for the whole week'
  }
];

const CoursesPage = () => {
  const [hoveredVideo, setHoveredVideo] = useState(null);

  // Function to handle opening YouTube video
  const openYouTubeVideo = (videoId) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Cooking Courses</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer"
            onClick={() => openYouTubeVideo(course.youtubeId)}
            onMouseEnter={() => setHoveredVideo(index)}
            onMouseLeave={() => setHoveredVideo(null)}
          >
            {/* YouTube Thumbnail with Play Button */}
            <div className="relative">
              <img
                src={`https://img.youtube.com/vi/${course.youtubeId}/maxresdefault.jpg`}
                alt={course.title}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.src = `https://img.youtube.com/vi/${course.youtubeId}/hqdefault.jpg`;
                }}
              />
              {hoveredVideo === index && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="white" 
                      className="w-8 h-8 ml-1"
                    >
                      <path d="M5.536 21.886a1.004 1.004 0 0 0 1.033-.064l13-9a1 1 0 0 0 0-1.644l-13-9A1 1 0 0 0 5 3v18a1 1 0 0 0 .536.886z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
              <p className="text-gray-600 mb-4">{course.description}</p>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600">{course.lessons} lessons</span>
                {course.progress > 0 ? (
                  <span className="text-black font-medium">{course.progress}% Complete</span>
                ) : (
                  <span className="text-gray-500">Not started</span>
                )}
              </div>

              {course.progress > 0 && (
                <div className="relative pt-1 mb-4">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                    <div
                      style={{ width: `${course.progress}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-600"
                    ></div>
                  </div>
                </div>
              )}

              <button 
                className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  openYouTubeVideo(course.youtubeId);
                }}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="currentColor" 
                  className="w-5 h-5 mr-2"
                >
                  <path d="M5.536 21.886a1.004 1.004 0 0 0 1.033-.064l13-9a1 1 0 0 0 0-1.644l-13-9A1 1 0 0 0 5 3v18a1 1 0 0 0 .536.886z" />
                </svg>
                {course.progress > 0 ? 'Continue Watching' : 'Start Watching'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* YouTube Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Featured Cooking Videos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <motion.div
              key={`video-${index}`}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div 
                className="relative cursor-pointer"
                onClick={() => openYouTubeVideo(course.youtubeId)}
              >
                <img
                  src={`https://img.youtube.com/vi/${course.youtubeId}/mqdefault.jpg`}
                  alt={course.title}
                  className="w-full h-40 object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-red-600 bg-opacity-80 rounded-full flex items-center justify-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="white" 
                      className="w-6 h-6 ml-1"
                    >
                      <path d="M5.536 21.886a1.004 1.004 0 0 0 1.033-.064l13-9a1 1 0 0 0 0-1.644l-13-9A1 1 0 0 0 5 3v18a1 1 0 0 0 .536.886z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-1">{course.title}</h3>
                <p className="text-sm text-gray-600">{course.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;