import { motion } from 'framer-motion';

const courses = [
  {
    title: 'Italian Cuisine Masterclass',
    progress: 65,
    lessons: 12,
    image: 'https://images.unsplash.com/photo-1572715376701-98568319fd0b',
  },
  {
    title: 'Baking Fundamentals',
    progress: 30,
    lessons: 8,
    image: 'https://images.unsplash.com/photo-1557925923-cd4648e211a0',
  },
];

const CoursesPage = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Cooking Courses</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {courses.map((course, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600">{course.lessons} lessons</span>
                <span className="text-black font-medium">{course.progress}% Complete</span>
              </div>
              <div className="relative pt-1">
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                  <div
                    style={{ width: `${course.progress}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-black"
                  ></div>
                </div>
              </div>
              <button className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors">
                Continue Learning
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CoursesPage;