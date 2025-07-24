# 📚 Dev Logs - Open Source Documentation Website

A comprehensive, open-source documentation website built with Next.js, TypeScript, Framer Motion, and Lucide Icons. This platform provides structured learning resources for modern web development across multiple programming topics.

## 🌟 Features

- **📖 Multiple Content Formats**: View documentation in Markdown, HTML, and downloadable PDF formats
- **🎯 Module-Based Learning**: Organized by subject areas with dedicated pages for each topic
- **🎨 Beautiful UI**: Clean, minimal design with smooth animations using Framer Motion
- **📱 Responsive Design**: Optimized for all device sizes
- **⚡ Fast Performance**: Built with Next.js 15 and optimized for speed
- **🔗 GitHub Integration**: Direct links to source repository and branch-specific content

## 🚀 Tech Stack

- **Framework**: Next.js 15.4.3 with TypeScript
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Markdown**: React Markdown with plugins
- **Content Source**: GitHub repository branches

## 📁 Available Learning Modules

| Module | Description | Status |
|--------|-------------|--------|
| **JavaScript** | Fundamentals to advanced patterns and ES6+ features | ✅ Available |
| **TypeScript** | Best practices, advanced types, and type-safe development | ✅ Available |
| **React** | Modern React with hooks, context, and optimization | ✅ Available |
| **GitHub** | Git workflows, collaboration, and version control | ✅ Available |
| **DSA** | Data Structures & Algorithms for interviews | ✅ Available |
| **Tailwind CSS** | Modern CSS framework and design systems | ✅ Available |
| **Networking & Linux** | Network fundamentals and system administration | ✅ Available |
| **Node.js & Express** | Full-stack development and backend practices | ✅ Available |
| **SQL** | Database design and query optimization | ✅ Available |

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/iammhador/dev-logs.git
   cd dev-logs
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 📖 Content Structure

Each learning module exists as a separate GitHub branch containing three formats:

```
Branch: [ModuleName]
├── DEV LOGS - [ModuleName].md    # Markdown version
├── DEV LOGS - [ModuleName].html  # HTML version  
└── DEV LOGS - [ModuleName].pdf   # PDF version
```

### Content Fetching

The website dynamically fetches content from the [dev-logs repository](https://github.com/iammhador/dev-logs) using the GitHub raw content API:

- **Markdown**: Rendered using React Markdown with syntax highlighting
- **HTML**: Displayed directly in the browser
- **PDF**: Direct download link to GitHub raw files

## 🎨 Design System

### Color Palette
- **Background**: White (`#ffffff`)
- **Primary Text**: Black (`#000000`)
- **Secondary Text**: Gray (`#4B4B4B`)
- **Borders**: Light Gray (`#e5e7eb`)
- **Hover States**: Light Gray (`#f9fafb`)

### Typography
- **Font Family**: Geist Sans (primary), Geist Mono (code)
- **Headings**: Bold, black color
- **Body Text**: Regular weight, secondary gray

### Components
- **Module Cards**: Hover animations with color-coded themes
- **Navigation**: Sticky header with breadcrumbs
- **Content Tabs**: Toggle between Markdown and HTML views
- **Buttons**: Consistent styling with hover effects

## 🔧 Project Structure

```
dev-logs-website/
├── app/
│   ├── globals.css           # Global styles and theme
│   ├── layout.tsx            # Root layout component
│   ├── page.tsx              # Homepage with module grid
│   └── module/
│       └── [id]/
│           └── page.tsx      # Dynamic module pages
├── public/                   # Static assets
├── package.json              # Dependencies and scripts
├── tailwind.config.js        # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── README.md                # Project documentation
```

## 🤝 Contributing

We welcome contributions to improve the documentation website! Here's how you can help:

### Content Contributions
1. Fork the [main repository](https://github.com/iammhador/dev-logs)
2. Create or update content in the appropriate branch
3. Ensure all three formats (MD, HTML, PDF) are provided
4. Submit a pull request with your changes

### Code Contributions
1. Fork this repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the existing code style
4. Test your changes locally
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Ensure responsive design
- Add proper error handling
- Write clear, commented code
- Test on multiple browsers

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Content Creator**: [iammhador](https://github.com/iammhador)
- **Community Contributors**: All the amazing developers who contribute to the learning materials
- **Open Source Libraries**: Next.js, React, Tailwind CSS, Framer Motion, and all other dependencies

## 📞 Support

If you have questions, suggestions, or need help:

- 🐛 **Bug Reports**: [Open an issue](https://github.com/iammhador/dev-logs/issues)
- 💡 **Feature Requests**: [Start a discussion](https://github.com/iammhador/dev-logs/discussions)
- 📧 **Contact**: Reach out through GitHub

## 🌟 Show Your Support

If this project helps you learn and grow as a developer, please consider:

- ⭐ Starring the repository
- 🍴 Forking and contributing
- 📢 Sharing with other developers
- 💝 Sponsoring the project

---

**Made with ❤️ by the open-source community**

*Happy Learning! 🚀*
