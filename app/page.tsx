"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  BookOpen, 
  Code2, 
  Database, 
  GitBranch, 
  Layers, 
  Server, 
  Palette,
  Network,
  Github,
  ExternalLink,
  Moon,
  Sun,
  ChevronUp,
  Star,
  Users,
  Download,
  Zap,
  Shield,
  Heart
} from "lucide-react";

// Module configuration with icons and descriptions
const modules = [
  {
    id: "javascript",
    title: "JavaScript",
    description: "Master JavaScript fundamentals to advanced patterns and modern ES6+ features",
    icon: Code2,
    color: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100",
    iconColor: "text-yellow-600"
  },
  {
    id: "typescript",
    title: "TypeScript",
    description: "Learn TypeScript best practices, advanced types, and type-safe development",
    icon: Code2,
    color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    iconColor: "text-blue-600"
  },
  {
    id: "react",
    title: "React",
    description: "Build modern React applications with hooks, context, and performance optimization",
    icon: Layers,
    color: "bg-cyan-50 border-cyan-200 hover:bg-cyan-100",
    iconColor: "text-cyan-600"
  },
  {
    id: "github",
    title: "GitHub",
    description: "Master Git workflows, GitHub collaboration, and version control best practices",
    icon: GitBranch,
    color: "bg-gray-50 border-gray-200 hover:bg-gray-100",
    iconColor: "text-gray-600"
  },
  {
    id: "dsa",
    title: "Data Structures & Algorithms",
    description: "Essential DSA concepts, problem-solving techniques, and coding interview preparation",
    icon: BookOpen,
    color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
    iconColor: "text-purple-600"
  },
  {
    id: "tailwind",
    title: "Tailwind CSS",
    description: "Modern CSS framework for rapid UI development and responsive design systems",
    icon: Palette,
    color: "bg-teal-50 border-teal-200 hover:bg-teal-100",
    iconColor: "text-teal-600"
  },
  {
    id: "networking-linux",
    title: "Networking & Linux",
    description: "Network fundamentals, Linux administration, and system operations",
    icon: Network,
    color: "bg-orange-50 border-orange-200 hover:bg-orange-100",
    iconColor: "text-orange-600"
  },
  {
    id: "node-express",
    title: "Node.js & Express",
    description: "Full-stack development with Node.js, Express.js, and backend best practices",
    icon: Server,
    color: "bg-green-50 border-green-200 hover:bg-green-100",
    iconColor: "text-green-600"
  },
  {
    id: "sql",
    title: "SQL & Databases",
    description: "Database design, query optimization, and relational database management",
    icon: Database,
    color: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100",
    iconColor: "text-indigo-600"
  }
];

export default function HomePage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Handle scroll to top visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cookie helper functions
  const setCookie = (name: string, value: string, days: number = 365) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
  };

  const getCookie = (name: string): string | null => {
    return document.cookie.split('; ').reduce((r, v) => {
      const parts = v.split('=');
      return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, '');
  };

  // Load dark mode preference from cookies
  useEffect(() => {
    const savedTheme = getCookie('darkMode');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'true');
    }
  }, []);

  // Apply dark mode and save to cookies
  useEffect(() => {
    setCookie('darkMode', isDarkMode.toString());
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-white'
    }`}>
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`transition-colors duration-300 border-b ${
          isDarkMode 
            ? 'bg-gray-900 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Dark Mode Toggle */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                isDarkMode
                  ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
          
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center justify-center mb-6"
            >
              <div className={`relative w-20 h-20 rounded-2xl shadow-lg transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-blue-600 to-purple-700 shadow-blue-500/25' 
                  : 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-blue-500/25'
              }`}>
                <div className="absolute inset-2 rounded-xl bg-white/10 backdrop-blur-sm">
                  <div className="flex items-center justify-center h-full">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
                    : 'bg-gradient-to-br from-green-400 to-emerald-500'
                }`}>
                  <Code2 className="w-3 h-3 text-white" />
                </div>
              </div>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className={`text-4xl md:text-5xl font-bold mb-4 ${
                isDarkMode ? 'text-white' : 'text-black'
              }`}
            >
              Dev Logs
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className={`text-xl max-w-3xl mx-auto mb-8 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              Comprehensive, open-source learning resources for mastering modern web development.
              Structured pathways from fundamentals to advanced concepts.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center justify-center space-x-6 text-sm text-gray-500"
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Open Source</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Community Driven</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Always Updated</span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className={`py-16 ${
          isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Why Choose Dev Logs?
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Built by developers, for developers. Our comprehensive learning platform offers everything you need to excel in modern web development.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Fast Learning",
                description: "Structured content designed for rapid skill acquisition and practical application."
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Production Ready",
                description: "Real-world examples and best practices used in production environments."
              },
              {
                icon: <Heart className="w-8 h-8" />,
                title: "Open Source",
                description: "Completely free and open source. Contribute, learn, and grow with the community."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                className={`text-center p-6 rounded-xl transition-colors duration-200 ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${
                  isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'
                }`}>
                  {feature.icon}
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {feature.title}
                </h3>
                <p className={`${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className={`py-12 ${
          isDarkMode ? 'bg-gray-900' : 'bg-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { icon: <BookOpen className="w-6 h-6" />, number: "9+", label: "Learning Modules" },
              { icon: <Star className="w-6 h-6" />, number: "100%", label: "Free Content" },
              { icon: <Users className="w-6 h-6" />, number: "Open", label: "Source" },
              { icon: <Download className="w-6 h-6" />, number: "PDF", label: "Downloads" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg mb-2 ${
                  isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'
                }`}>
                  {stat.icon}
                </div>
                <div className={`text-2xl font-bold mb-1 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {stat.number}
                </div>
                <div className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Main Content */}
      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="text-center mb-12"
        >
          <h2 className={`text-3xl font-bold mb-4 ${
            isDarkMode ? 'text-white' : 'text-black'
          }`}>
            Learning Modules
          </h2>
          <p className={`max-w-2xl mx-auto ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Choose your learning path and dive deep into comprehensive, hands-on tutorials
            covering everything from fundamentals to advanced concepts.
          </p>
        </motion.div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => {
            const IconComponent = module.icon;
            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.1 + index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Link href={`/module/${module.id}`}>
                  <div className={`p-6 rounded-xl border h-full transition-all duration-200 hover:shadow-lg ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="flex items-center mb-4">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${
                        isDarkMode ? 'bg-white' : 'bg-black'
                      }`}>
                        <IconComponent className={`w-6 h-6 ${
                          isDarkMode ? 'text-black' : 'text-white'
                        }`} />
                      </div>
                      <div>
                        <h3 className={`text-lg font-semibold transition-colors ${
                          isDarkMode 
                            ? 'text-white group-hover:text-gray-200' 
                            : 'text-black group-hover:text-gray-700'
                        }`}>
                          {module.title}
                        </h3>
                      </div>
                    </div>
                    
                    <p className={`text-sm mb-4 line-clamp-3 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {module.description}
                    </p>
                    
                    <div className={`flex items-center justify-between text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <span>Markdown Documentation</span>
                      <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className={`border-t mt-20 transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-gray-50 border-gray-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="flex items-center space-x-2">
                <BookOpen className={`w-5 h-5 ${
                  isDarkMode ? 'text-white' : 'text-black'
                }`} />
                <span className={`font-semibold ${
                  isDarkMode ? 'text-white' : 'text-black'
                }`}>Dev Logs</span>
              </div>
              <span className={`${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>•</span>
              <span className={`text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Open Source Documentation</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <a 
                href="https://github.com/iammhador/dev-logs" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`flex items-center space-x-2 transition-colors duration-200 ${
                  isDarkMode 
                    ? 'text-gray-300 hover:text-white' 
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                <Github className="w-4 h-4" />
                <span className="text-sm">View on GitHub</span>
              </a>
              <span className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-400'
              }`}>Made with ❤️ by the community</span>
            </div>
          </div>
        </div>
      </motion.footer>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className={`fixed bottom-6 right-6 p-3 rounded-full shadow-lg transition-colors duration-200 z-50 ${
            isDarkMode
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200'
          }`}
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-5 h-5" />
        </motion.button>
      )}
    </div>
  );
}

