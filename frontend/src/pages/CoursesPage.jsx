import { motion } from 'framer-motion';
import { FaPlay, FaClock, FaUsers, FaStar, FaBookOpen, FaAward, FaChevronRight } from 'react-icons/fa';

const courses = [
  {
    id: 1,
    title: 'Italian Cuisine Masterclass',
    instructor: 'Chef Marco Rossi',
    progress: 65,
    lessons: 12,
    duration: '8 hours',
    students: 1250,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1572715376701-98568319fd0b?w=400',
    description: 'Master the art of authentic Italian cooking with traditional recipes and techniques.',
    level: 'Intermediate',
    category: 'International Cuisine'
  },
  {
    id: 2,
    title: 'Baking Fundamentals',
    instructor: 'Chef Sarah Johnson',
    progress: 30,
    lessons: 8,
    duration: '6 hours',
    students: 890,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1557925923-cd4648e211a0?w=400',
    description: 'Learn the science and art of baking from scratch to professional level.',
    level: 'Beginner',
    category: 'Baking & Pastry'
  },
  {
    id: 3,
    title: 'Asian Fusion Techniques',
    instructor: 'Chef Kenji Tanaka',
    progress: 0,
    lessons: 15,
    duration: '10 hours',
    students: 567,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400',
    description: 'Explore modern Asian fusion cooking with innovative techniques and flavors.',
    level: 'Advanced',
    category: 'International Cuisine'
  },
  {
    id: 4,
    title: 'Vegetarian Cooking Mastery',
    instructor: 'Chef Emma Green',
    progress: 85,
    lessons: 10,
    duration: '7 hours',
    students: 1100,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    description: 'Create delicious and nutritious vegetarian meals that satisfy everyone.',
    level: 'Intermediate',
    category: 'Healthy Cooking'
  }
];

const categories = [
  'All Courses',
  'International Cuisine',
  'Baking & Pastry',
  'Healthy Cooking',
  'Quick Meals',
  'Advanced Techniques'
];

const CoursesPage = () => {
  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, var(--warm-yellow) 0%, var(--accent-orange) 100%)' }}>
              <FaBookOpen className="text-white text-2xl" />
            </div>
            <h1 className="text-4xl font-bold" style={{ color: 'var(--primary-green)' }}>
              Cooking Courses
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Master culinary skills with our expert-led courses and become the chef you've always wanted to be
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {[
            { icon: FaBookOpen, label: 'Courses', value: '50+', color: 'var(--primary-green)' },
            { icon: FaUsers, label: 'Students', value: '10K+', color: 'var(--accent-orange)' },
            { icon: FaAward, label: 'Certificates', value: '5K+', color: 'var(--warm-yellow)' },
            { icon: FaStar, label: 'Avg Rating', value: '4.8', color: 'var(--sage-green)' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="bg-white rounded-2xl p-6 card-shadow text-center hover-lift"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
            >
              <stat.icon className="text-3xl mx-auto mb-3" style={{ color: stat.color }} />
              <div className="text-2xl font-bold mb-1" style={{ color: 'var(--dark-text)' }}>
                {stat.value}
              </div>
              <div className="text-sm font-medium" style={{ color: 'var(--sage-green)' }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Category Filter */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2">
            {categories.map((category, index) => (
              <button
                key={category}
                className={`category-pill ${index === 0 ? 'active' : ''}`}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Courses Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              className="bg-white rounded-3xl card-shadow overflow-hidden hover-lift group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="relative">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-xs font-semibold" style={{ color: 'var(--primary-green)' }}>
                    {course.category}
                  </span>
                </div>
                
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-xs font-semibold" style={{ color: 'var(--accent-orange)' }}>
                    {course.level}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 text-white">
                    <FaStar className="text-yellow-400" />
                    <span className="font-semibold">{course.rating}</span>
                    <span className="text-sm">({course.students} students)</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--dark-text)' }}>
                  {course.title}
                </h3>
                
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {course.description}
                </p>

                <div className="flex items-center gap-2 mb-4">
                  <img
                    src={`https://i.pravatar.cc/32?u=${course.instructor}`}
                    alt={course.instructor}
                    className="w-8 h-8 rounded-full border-2 border-green-200"
                  />
                  <span className="text-sm font-medium" style={{ color: 'var(--sage-green)' }}>
                    {course.instructor}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <FaBookOpen className="text-sm" style={{ color: 'var(--sage-green)' }} />
                    </div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--dark-text)' }}>
                      {course.lessons} lessons
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <FaClock className="text-sm" style={{ color: 'var(--sage-green)' }} />
                    </div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--dark-text)' }}>
                      {course.duration}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <FaUsers className="text-sm" style={{ color: 'var(--sage-green)' }} />
                    </div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--dark-text)' }}>
                      {course.students}
                    </div>
                  </div>
                </div>

                {course.progress > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium" style={{ color: 'var(--dark-text)' }}>
                        Progress
                      </span>
                      <span className="text-sm font-semibold" style={{ color: 'var(--primary-green)' }}>
                        {course.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${course.progress}%`,
                          background: 'linear-gradient(135deg, var(--primary-green) 0%, var(--light-green) 100%)'
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                <button className="btn-primary w-full flex items-center justify-center gap-2 group-hover:scale-105 transition-transform duration-300">
                  <FaPlay />
                  <span>{course.progress > 0 ? 'Continue Learning' : 'Start Course'}</span>
                  <FaChevronRight className="text-sm" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="bg-white rounded-3xl card-shadow p-8 max-w-2xl mx-auto">
            <div className="text-4xl mb-4">🎓</div>
            <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--primary-green)' }}>
              Ready to Become a Master Chef?
            </h3>
            <p className="text-gray-600 mb-6">
              Join thousands of students learning from world-class chefs and take your cooking to the next level.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="btn-primary">
                Browse All Courses
              </button>
              <button className="btn-secondary">
                Free Trial
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CoursesPage;