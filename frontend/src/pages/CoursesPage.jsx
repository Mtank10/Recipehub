import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { motion } from 'framer-motion';
import { FaPlay, FaClock, FaUsers, FaStar, FaBookOpen, FaAward, FaChevronRight, FaCheck, FaLock } from 'react-icons/fa';

const GET_COURSES = gql`
  query GetCourses($category: String, $level: CourseLevel, $page: Int, $limit: Int) {
    getCourses(category: $category, level: $level, page: $page, limit: $limit) {
      courses {
        id
        title
        description
        instructor
        instructorAvatar
        image
        duration
        level
        category
        price
        rating
        studentsCount
        lessonsCount
        isEnrolled
        progress
        lessons {
          id
          title
          duration
          order
        }
      }
      totalPages
      currentPage
      totalCourses
    }
  }
`;

const GET_ENROLLED_COURSES = gql`
  query GetEnrolledCourses {
    getEnrolledCourses {
      id
      title
      instructor
      image
      progress
      lessons {
        id
        title
        duration
        order
      }
    }
  }
`;

const ENROLL_IN_COURSE = gql`
  mutation EnrollInCourse($courseId: ID!) {
    enrollInCourse(courseId: $courseId) {
      id
      progress
    }
  }
`;

const MARK_LESSON_COMPLETED = gql`
  mutation MarkLessonCompleted($lessonId: ID!) {
    markLessonCompleted(lessonId: $lessonId)
  }
`;

const CoursesPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCourseModal, setShowCourseModal] = useState(false);

  const { data: coursesData, loading, refetch } = useQuery(GET_COURSES, {
    variables: { 
      category: selectedCategory || null, 
      level: selectedLevel || null, 
      page: 1, 
      limit: 12 
    }
  });

  const { data: enrolledData, refetch: refetchEnrolled } = useQuery(GET_ENROLLED_COURSES, {
    skip: activeTab !== 'enrolled'
  });

  const [enrollInCourse] = useMutation(ENROLL_IN_COURSE, {
    onCompleted: () => {
      refetch();
      refetchEnrolled();
    }
  });

  const [markLessonCompleted] = useMutation(MARK_LESSON_COMPLETED, {
    onCompleted: () => {
      refetchEnrolled();
    }
  });

  const courses = coursesData?.getCourses?.courses || [];
  const enrolledCourses = enrolledData?.getEnrolledCourses || [];

  const categories = [
    'All Categories',
    'International Cuisine',
    'Baking & Pastry',
    'Healthy Cooking',
    'Quick Meals',
    'Advanced Techniques'
  ];

  const levels = ['All Levels', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

  const handleEnroll = async (courseId) => {
    try {
      await enrollInCourse({ variables: { courseId } });
      alert('Successfully enrolled in course!');
    } catch (error) {
      console.error('Enrollment error:', error);
      alert('Error enrolling in course. Please try again.');
    }
  };

  const handleLessonComplete = async (lessonId) => {
    try {
      await markLessonCompleted({ variables: { lessonId } });
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    }
  };

  const openCourseModal = (course) => {
    setSelectedCourse(course);
    setShowCourseModal(true);
  };

  if (loading) return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="skeleton h-10 w-64 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 card-shadow animate-pulse">
              <div className="skeleton h-32 w-full rounded-xl mb-4"></div>
              <div className="skeleton h-6 w-3/4 mb-2"></div>
              <div className="skeleton h-4 w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, var(--warm-yellow) 0%, var(--accent-orange) 100%)' }}>
              <FaBookOpen className="text-white text-xl" />
            </div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--primary-green)' }}>
              Cooking Courses
            </h1>
          </div>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Master culinary skills with our expert-led courses
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
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
              className="bg-white rounded-xl p-4 card-shadow text-center hover-lift"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
            >
              <stat.icon className="text-2xl mx-auto mb-2" style={{ color: stat.color }} />
              <div className="text-xl font-bold mb-1" style={{ color: 'var(--dark-text)' }}>
                {stat.value}
              </div>
              <div className="text-xs font-medium" style={{ color: 'var(--sage-green)' }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              activeTab === 'all' 
                ? 'bg-green-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-green-50'
            }`}
          >
            All Courses
          </button>
          <button
            onClick={() => setActiveTab('enrolled')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              activeTab === 'enrolled' 
                ? 'bg-green-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-green-50'
            }`}
          >
            My Courses
          </button>
        </div>

        {activeTab === 'all' && (
          <>
            {/* Filters */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2">
                {categories.map((category, index) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category === 'All Categories' ? '' : category)}
                    className={`category-pill ${
                      (category === 'All Categories' && !selectedCategory) || selectedCategory === category 
                        ? 'active' 
                        : ''
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Courses Grid */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  className="bg-white rounded-2xl card-shadow overflow-hidden hover-lift group cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  onClick={() => openCourseModal(course)}
                >
                  <div className="relative">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                    
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                      <span className="text-xs font-semibold" style={{ color: 'var(--primary-green)' }}>
                        {course.category}
                      </span>
                    </div>
                    
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                      <span className="text-xs font-semibold" style={{ color: 'var(--accent-orange)' }}>
                        {course.level}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex items-center gap-2 text-white text-sm">
                        <FaStar className="text-yellow-400" />
                        <span className="font-semibold">{course.rating}</span>
                        <span>({course.studentsCount} students)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-2 line-clamp-2" style={{ color: 'var(--dark-text)' }}>
                      {course.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-3 text-sm line-clamp-2">
                      {course.description}
                    </p>

                    <div className="flex items-center gap-2 mb-3">
                      <img
                        src={course.instructorAvatar || `https://i.pravatar.cc/32?u=${course.instructor}`}
                        alt={course.instructor}
                        className="w-6 h-6 rounded-full border border-green-200"
                      />
                      <span className="text-sm font-medium" style={{ color: 'var(--sage-green)' }}>
                        {course.instructor}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                      <div>
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <FaBookOpen className="text-xs" style={{ color: 'var(--sage-green)' }} />
                        </div>
                        <div className="text-sm font-semibold" style={{ color: 'var(--dark-text)' }}>
                          {course.lessonsCount}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--sage-green)' }}>
                          lessons
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <FaClock className="text-xs" style={{ color: 'var(--sage-green)' }} />
                        </div>
                        <div className="text-sm font-semibold" style={{ color: 'var(--dark-text)' }}>
                          {course.duration}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <FaUsers className="text-xs" style={{ color: 'var(--sage-green)' }} />
                        </div>
                        <div className="text-sm font-semibold" style={{ color: 'var(--dark-text)' }}>
                          {course.studentsCount}
                        </div>
                      </div>
                    </div>

                    {course.isEnrolled && course.progress > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium" style={{ color: 'var(--dark-text)' }}>
                            Progress
                          </span>
                          <span className="text-xs font-semibold" style={{ color: 'var(--primary-green)' }}>
                            {Math.round(course.progress)}%
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

                    <button 
                      className="btn-primary w-full flex items-center justify-center gap-2 text-sm group-hover:scale-105 transition-transform duration-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!course.isEnrolled) {
                          handleEnroll(course.id);
                        }
                      }}
                    >
                      <FaPlay />
                      <span>{course.isEnrolled ? 'Continue Learning' : 'Enroll Now'}</span>
                      <FaChevronRight className="text-xs" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}

        {activeTab === 'enrolled' && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {enrolledCourses.length > 0 ? (
              enrolledCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  className="bg-white rounded-2xl card-shadow p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex gap-4 mb-4">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-20 h-20 object-cover rounded-xl"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-base mb-1" style={{ color: 'var(--dark-text)' }}>
                        {course.title}
                      </h3>
                      <p className="text-sm mb-2" style={{ color: 'var(--sage-green)' }}>
                        {course.instructor}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium" style={{ color: 'var(--dark-text)' }}>
                          Progress: {Math.round(course.progress)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="h-2 rounded-full"
                          style={{ 
                            width: `${course.progress}%`,
                            background: 'linear-gradient(135deg, var(--primary-green) 0%, var(--light-green) 100%)'
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--primary-green)' }}>
                      Lessons
                    </h4>
                    {course.lessons.slice(0, 3).map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleLessonComplete(lesson.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full border-2 border-green-300 flex items-center justify-center">
                            <FaCheck className="text-xs text-green-500" />
                          </div>
                          <div>
                            <h5 className="text-sm font-medium">{lesson.title}</h5>
                            <p className="text-xs text-gray-500">{lesson.duration}</p>
                          </div>
                        </div>
                        <FaPlay className="text-green-500 text-xs" />
                      </div>
                    ))}
                  </div>

                  <button className="btn-secondary w-full mt-4 text-sm">
                    Continue Course
                  </button>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--dark-text)' }}>
                  No enrolled courses yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start learning by enrolling in a course
                </p>
                <button
                  onClick={() => setActiveTab('all')}
                  className="btn-primary"
                >
                  Browse Courses
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Course Detail Modal */}
        {showCourseModal && selectedCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              className="bg-white rounded-3xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold" style={{ color: 'var(--primary-green)' }}>
                  Course Details
                </h3>
                <button
                  onClick={() => setShowCourseModal(false)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <FaTimes className="text-gray-500" />
                </button>
              </div>

              <img
                src={selectedCourse.image}
                alt={selectedCourse.title}
                className="w-full h-48 object-cover rounded-xl mb-4"
              />

              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--dark-text)' }}>
                {selectedCourse.title}
              </h2>

              <p className="text-gray-600 mb-4">{selectedCourse.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 rounded-xl" style={{ background: 'var(--cream)' }}>
                  <FaBookOpen className="text-xl mx-auto mb-2" style={{ color: 'var(--primary-green)' }} />
                  <div className="font-bold">{selectedCourse.lessonsCount}</div>
                  <div className="text-xs">Lessons</div>
                </div>
                <div className="text-center p-3 rounded-xl" style={{ background: 'var(--cream)' }}>
                  <FaClock className="text-xl mx-auto mb-2" style={{ color: 'var(--accent-orange)' }} />
                  <div className="font-bold">{selectedCourse.duration}</div>
                  <div className="text-xs">Duration</div>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <h4 className="font-semibold" style={{ color: 'var(--primary-green)' }}>
                  Course Content
                </h4>
                {selectedCourse.lessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                        {selectedCourse.isEnrolled ? (
                          <FaPlay className="text-xs text-green-500" />
                        ) : (
                          <FaLock className="text-xs text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h5 className="text-sm font-medium">{lesson.title}</h5>
                        <p className="text-xs text-gray-500">{lesson.duration}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCourseModal(false)}
                  className="flex-1 btn-secondary text-sm"
                >
                  Close
                </button>
                {!selectedCourse.isEnrolled && (
                  <button
                    onClick={() => {
                      handleEnroll(selectedCourse.id);
                      setShowCourseModal(false);
                    }}
                    className="flex-1 btn-primary text-sm"
                  >
                    Enroll Now
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;