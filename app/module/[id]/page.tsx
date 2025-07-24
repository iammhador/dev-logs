"use client";
import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import {
  ArrowLeft,
  BookOpen,
  Download,
  ExternalLink,
  Loader2,
  AlertCircle,
  Moon,
  Sun,
} from "lucide-react";

interface ModulePageProps {
  params: Promise<{
    id: string;
  }>;
}

interface ModuleContent {
  markdown: string;
  pdfUrl: string;
}

const moduleNames: Record<string, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  react: "React",
  github: "GitHub",
  dsa: "DSA",
  tailwind: "Tailwind",
  "networking-linux": "Networking-Linux",
  "node-express": "Node-Express",
  sql: "SQL",
};

export default function ModulePage({ params }: ModulePageProps) {
  const resolvedParams = use(params);

  // Removed HTML tab - only showing Markdown content
  const [content, setContent] = useState<ModuleContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Cookie helper functions
  const setCookie = (name: string, value: string, days: number = 365) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
  };

  const getCookie = (name: string): string | null => {
    return document.cookie.split("; ").reduce((r, v) => {
      const parts = v.split("=");
      return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, "");
  };

  // Load dark mode preference from cookies
  useEffect(() => {
    const savedTheme = getCookie("darkMode");
    if (savedTheme) {
      setIsDarkMode(savedTheme === "true");
    }
  }, []);

  // Apply dark mode and save to cookies
  useEffect(() => {
    setCookie("darkMode", isDarkMode.toString());
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const moduleId = resolvedParams.id;
  const moduleName = moduleNames[moduleId] || moduleId;
  const branchName =
    moduleId === "dsa"
      ? "DSA"
      : moduleId === "networking-linux"
      ? "Networking-Linux"
      : moduleId === "node-express"
      ? "Node-Express"
      : moduleId === "sql"
      ? "SQL"
      : moduleName;

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);

        const baseUrl = `https://raw.githubusercontent.com/iammhador/dev-logs/${branchName}`;
        console.log("🚀 ~ fetchContent ~ baseUrl:", baseUrl);
        const fileName = `DEV LOGS - ${branchName}`;

        // Fetch markdown content
        const markdownResponse = await fetch(`${baseUrl}/${fileName}.md`);
        console.log("🚀 ~ fetchContent ~ markdownResponse:", markdownResponse);
        const markdownText = markdownResponse.ok
          ? await markdownResponse.text()
          : "Content not available";

        // Only fetching Markdown content now

        // PDF URL (direct link to GitHub)
        const pdfUrl = `https://github.com/iammhador/dev-logs/raw/${branchName}/${fileName}.pdf`;

        setContent({
          markdown: markdownText,
          pdfUrl,
        });
      } catch (err) {
        setError("Failed to load content. Please try again later.");
        console.error("Error fetching content:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [moduleId, branchName]);

  const handleDownloadPDF = () => {
    if (content?.pdfUrl) {
      window.open(content.pdfUrl, "_blank");
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
          isDarkMode ? "bg-gray-900" : "bg-white"
        }`}
      >
        <div className="text-center">
          <Loader2
            className={`w-8 h-8 animate-spin mx-auto mb-4 ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          />
          <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
            Loading {moduleName} documentation...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-300 px-4 ${
          isDarkMode ? "bg-gray-900" : "bg-white"
        }`}
      >
        <div className="text-center max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2
            className={`text-lg sm:text-xl font-semibold mb-2 ${
              isDarkMode ? "text-white" : "text-black"
            }`}
          >
            Error Loading Content
          </h2>
          <p
            className={`mb-6 text-sm sm:text-base ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {error}
          </p>
          <Link
            href="/"
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 cursor-pointer ${
              isDarkMode
                ? "bg-white text-black hover:bg-gray-200"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? "bg-gray-900" : "bg-white"
      }`}
    >
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`border-b sticky top-0 z-50 transition-colors duration-300 ${
          isDarkMode
            ? "bg-gray-900 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Back button and title */}
            <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
              <Link
                href="/"
                className={`flex items-center space-x-1 sm:space-x-2 transition-colors duration-200 cursor-pointer flex-shrink-0 ${
                  isDarkMode
                    ? "text-gray-300 hover:text-white"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium text-xs sm:text-base hidden xs:inline">
                  Back
                </span>
              </Link>
              <h1
                className={`text-sm sm:text-xl font-bold truncate ${
                  isDarkMode ? "text-white" : "text-black"
                }`}
              >
                {moduleName}
              </h1>
            </div>

            {/* Right side - Action buttons */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg transition-colors duration-200 cursor-pointer ${
                  isDarkMode
                    ? "bg-gray-800 text-yellow-400 hover:bg-gray-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={handleDownloadPDF}
                className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg transition-colors duration-200 cursor-pointer text-xs sm:text-base ${
                  isDarkMode
                    ? "bg-white text-black hover:bg-gray-200"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download PDF</span>
                <span className="sm:hidden">PDF</span>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Content Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center space-x-2 mb-6 sm:mb-8"
        >
          <BookOpen
            className={`w-4 h-4 sm:w-5 sm:h-5 ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          />
          <h2
            className={`text-base sm:text-lg font-semibold ${
              isDarkMode ? "text-white" : "text-black"
            }`}
          >
            Documentation
          </h2>
        </motion.div>

        {/* Content Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className={`border rounded-lg sm:rounded-xl overflow-hidden transition-colors duration-300 ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="prose prose-sm sm:prose max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              >
                {content?.markdown || "No content available"}
              </ReactMarkdown>
            </div>
          </div>
        </motion.div>

        {/* Additional Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div
            className={`flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            <div className="flex items-center space-x-2">
              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Markdown Documentation</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <a
              href={`https://github.com/iammhador/dev-logs/tree/${branchName}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center space-x-2 transition-colors duration-200 cursor-pointer ${
                isDarkMode
                  ? "text-gray-300 hover:text-white"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">View on GitHub</span>
            </a>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
