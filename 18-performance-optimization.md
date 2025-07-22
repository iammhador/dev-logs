# 18. Performance Optimization ⚡

> "Premature optimization is the root of all evil. But when the time comes, optimize like your users' experience depends on it." - Performance Philosophy

## 🎯 Learning Objectives

By the end of this chapter, you'll understand:
- How to identify performance bottlenecks in React apps
- Core optimization techniques and when to use them
- Bundle optimization and code splitting strategies
- Image and asset optimization
- Memory leak prevention and cleanup
- Performance monitoring and measurement tools
- Real-world optimization patterns and case studies

## 🔍 Understanding React Performance

### The React Rendering Process

```jsx
// React's rendering phases
1. Trigger (state change, props change, parent re-render)
2. Render (create virtual DOM, run components)
3. Commit (update real DOM, run effects)
4. Browser Paint (layout, paint, composite)
```

### Common Performance Issues

1. **Unnecessary Re-renders**
2. **Large Bundle Sizes**
3. **Inefficient State Updates**
4. **Memory Leaks**
5. **Blocking Operations**
6. **Poor Image/Asset Loading**

## 🛠️ Performance Measurement Tools

### React DevTools Profiler

```jsx
// ✅ Using React DevTools Profiler
// 1. Install React DevTools browser extension
// 2. Open DevTools → Profiler tab
// 3. Click record, interact with app, stop recording
// 4. Analyze flame graph and ranked chart

// Profiler API for programmatic measurement
import { Profiler } from 'react';

function onRenderCallback(id, phase, actualDuration, baseDuration, startTime, commitTime) {
  console.log('Profiler:', {
    id,           // Component tree identifier
    phase,        // "mount" or "update"
    actualDuration, // Time spent rendering
    baseDuration,   // Estimated time without memoization
    startTime,      // When React began rendering
    commitTime      // When React committed the update
  });
  
  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    analytics.track('Component Render', {
      componentId: id,
      renderTime: actualDuration,
      phase
    });
  }
}

function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <Header />
      <Main />
      <Footer />
    </Profiler>
  );
}
```

### Custom Performance Hooks

```jsx
// ✅ Custom hooks for performance monitoring
import { useEffect, useRef, useState } from 'react';

// Hook to measure component render time
function useRenderTime(componentName) {
  const renderStart = useRef(performance.now());
  
  useEffect(() => {
    const renderEnd = performance.now();
    const renderTime = renderEnd - renderStart.current;
    
    console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
    
    // Reset for next render
    renderStart.current = performance.now();
  });
}

// Hook to track re-render count
function useRenderCount(componentName) {
  const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current += 1;
    console.log(`${componentName} rendered ${renderCount.current} times`);
  });
  
  return renderCount.current;
}

// Hook to detect unnecessary re-renders
function useWhyDidYouUpdate(name, props) {
  const previousProps = useRef();
  
  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps = {};
      
      allKeys.forEach(key => {
        if (previousProps.current[key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current[key],
            to: props[key]
          };
        }
      });
      
      if (Object.keys(changedProps).length) {
        console.log('[why-did-you-update]', name, changedProps);
      }
    }
    
    previousProps.current = props;
  });
}

// Usage example
function ExpensiveComponent({ data, config, onUpdate }) {
  useRenderTime('ExpensiveComponent');
  const renderCount = useRenderCount('ExpensiveComponent');
  useWhyDidYouUpdate('ExpensiveComponent', { data, config, onUpdate });
  
  return (
    <div>
      <h3>Expensive Component (Render #{renderCount})</h3>
      {/* Component content */}
    </div>
  );
}
```

### Performance Monitoring Component

```jsx
// ✅ Comprehensive performance monitoring
function PerformanceMonitor({ children, threshold = 16 }) {
  const [metrics, setMetrics] = useState({
    fps: 0,
    memoryUsage: 0,
    slowRenders: 0
  });
  
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId;
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        setMetrics(prev => ({
          ...prev,
          fps,
          memoryUsage: (performance as any).memory?.usedJSHeapSize || 0
        }));
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };
    
    measureFPS();
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);
  
  const onRender = useCallback((id, phase, actualDuration) => {
    if (actualDuration > threshold) {
      setMetrics(prev => ({
        ...prev,
        slowRenders: prev.slowRenders + 1
      }));
      
      console.warn(`Slow render detected: ${id} took ${actualDuration.toFixed(2)}ms`);
    }
  }, [threshold]);
  
  return (
    <>
      <Profiler id="PerformanceMonitor" onRender={onRender}>
        {children}
      </Profiler>
      
      {process.env.NODE_ENV === 'development' && (
        <div className="performance-monitor">
          <div>FPS: {metrics.fps}</div>
          <div>Memory: {(metrics.memoryUsage / 1024 / 1024).toFixed(2)} MB</div>
          <div>Slow Renders: {metrics.slowRenders}</div>
        </div>
      )}
    </>
  );
}
```

## 🚀 Core Optimization Techniques

### 1. Memoization Strategies

```jsx
// ✅ Strategic use of React.memo
const ExpensiveListItem = React.memo(function ListItem({ item, onUpdate }) {
  console.log('Rendering ListItem:', item.id);
  
  return (
    <div className="list-item">
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      <button onClick={() => onUpdate(item.id)}>
        Update
      </button>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.title === nextProps.item.title &&
    prevProps.item.description === nextProps.item.description &&
    prevProps.onUpdate === nextProps.onUpdate
  );
});

// ✅ Optimized parent component
function OptimizedList({ items }) {
  const [selectedId, setSelectedId] = useState(null);
  
  // Memoize callback to prevent unnecessary re-renders
  const handleUpdate = useCallback((id) => {
    setSelectedId(id);
    // Perform update logic
  }, []);
  
  // Memoize filtered items
  const visibleItems = useMemo(() => {
    return items.filter(item => item.visible);
  }, [items]);
  
  return (
    <div className="optimized-list">
      {visibleItems.map(item => (
        <ExpensiveListItem
          key={item.id}
          item={item}
          onUpdate={handleUpdate}
        />
      ))}
    </div>
  );
}
```

### 2. State Structure Optimization

```jsx
// ❌ Poor state structure - causes unnecessary re-renders
function BadExample() {
  const [state, setState] = useState({
    user: { name: '', email: '' },
    posts: [],
    comments: [],
    ui: { loading: false, error: null }
  });
  
  // Any state change re-renders everything
  const updateLoading = (loading) => {
    setState(prev => ({
      ...prev,
      ui: { ...prev.ui, loading }
    }));
  };
  
  return (
    <div>
      <UserProfile user={state.user} /> {/* Re-renders on loading change */}
      <PostList posts={state.posts} />     {/* Re-renders on loading change */}
      <CommentList comments={state.comments} /> {/* Re-renders on loading change */}
    </div>
  );
}

// ✅ Optimized state structure - isolated state changes
function GoodExample() {
  const [user, setUser] = useState({ name: '', email: '' });
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  return (
    <div>
      <UserProfile user={user} />           {/* Only re-renders when user changes */}
      <PostList posts={posts} />            {/* Only re-renders when posts change */}
      <CommentList comments={comments} />   {/* Only re-renders when comments change */}
      {loading && <LoadingSpinner />}       {/* Only re-renders when loading changes */}
      {error && <ErrorMessage error={error} />}
    </div>
  );
}
```

### 3. Component Splitting and Lazy Loading

```jsx
// ✅ Code splitting with React.lazy
const LazyDashboard = React.lazy(() => import('./Dashboard'));
const LazyProfile = React.lazy(() => import('./Profile'));
const LazySettings = React.lazy(() => import('./Settings'));

// Custom hook for lazy loading with error handling
function useLazyComponent(importFunc, fallback = null) {
  const [Component, setComponent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const loadComponent = useCallback(async () => {
    if (Component) return Component;
    
    setLoading(true);
    setError(null);
    
    try {
      const module = await importFunc();
      const LoadedComponent = module.default || module;
      setComponent(() => LoadedComponent);
      return LoadedComponent;
    } catch (err) {
      setError(err);
      console.error('Failed to load component:', err);
    } finally {
      setLoading(false);
    }
  }, [importFunc, Component]);
  
  useEffect(() => {
    loadComponent();
  }, [loadComponent]);
  
  if (error) {
    return fallback || <div>Failed to load component</div>;
  }
  
  if (loading || !Component) {
    return fallback || <div>Loading...</div>;
  }
  
  return Component;
}

// Route-based code splitting
function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<LazyDashboard />} />
          <Route path="/profile" element={<LazyProfile />} />
          <Route path="/settings" element={<LazySettings />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

// Component-based lazy loading
function ConditionalFeature({ shouldLoad, children }) {
  const [showFeature, setShowFeature] = useState(false);
  
  const LazyFeature = useMemo(() => {
    if (!shouldLoad) return null;
    
    return React.lazy(() => import('./ExpensiveFeature'));
  }, [shouldLoad]);
  
  if (!shouldLoad) {
    return (
      <button onClick={() => setShowFeature(true)}>
        Load Feature
      </button>
    );
  }
  
  return (
    <Suspense fallback={<div>Loading feature...</div>}>
      {showFeature && LazyFeature && <LazyFeature />}
    </Suspense>
  );
}
```

### 4. Virtual Scrolling for Large Lists

```jsx
// ✅ Virtual scrolling implementation
import { useState, useEffect, useRef, useMemo } from 'react';

function VirtualList({ 
  items, 
  itemHeight, 
  containerHeight, 
  renderItem,
  overscan = 5 
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef();
  
  const { visibleItems, totalHeight, offsetY } = useMemo(() => {
    const containerItemCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + containerItemCount + overscan,
      items.length
    );
    
    const visibleItems = items.slice(
      Math.max(0, startIndex - overscan),
      endIndex
    );
    
    return {
      visibleItems,
      totalHeight: items.length * itemHeight,
      offsetY: Math.max(0, startIndex - overscan) * itemHeight
    };
  }, [items, itemHeight, scrollTop, containerHeight, overscan]);
  
  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };
  
  return (
    <div
      ref={scrollElementRef}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={item.id || index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Usage example
function LargeDataList() {
  const [data] = useState(() => 
    Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      description: `Description for item ${i}`
    }))
  );
  
  const renderItem = useCallback((item) => (
    <div className="list-item">
      <h4>{item.name}</h4>
      <p>{item.description}</p>
    </div>
  ), []);
  
  return (
    <VirtualList
      items={data}
      itemHeight={80}
      containerHeight={400}
      renderItem={renderItem}
    />
  );
}
```

## 📦 Bundle Optimization

### Webpack Bundle Analysis

```javascript
// webpack.config.js - Bundle analysis setup
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  // ... other config
  plugins: [
    // Analyze bundle in production
    process.env.ANALYZE && new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: 'bundle-report.html'
    })
  ].filter(Boolean),
  
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          enforce: true
        }
      }
    }
  }
};
```

### Tree Shaking and Dead Code Elimination

```jsx
// ✅ Tree-shaking friendly imports
// Instead of importing entire library
import _ from 'lodash'; // ❌ Imports entire lodash

// Import only what you need
import debounce from 'lodash/debounce'; // ✅ Tree-shakable
import { debounce } from 'lodash'; // ✅ Also tree-shakable with modern bundlers

// ✅ Conditional imports for development tools
const DevTools = process.env.NODE_ENV === 'development' 
  ? React.lazy(() => import('./DevTools'))
  : null;

function App() {
  return (
    <div>
      <MainApp />
      {DevTools && (
        <Suspense fallback={null}>
          <DevTools />
        </Suspense>
      )}
    </div>
  );
}

// ✅ Dynamic imports for feature flags
function FeatureComponent({ featureEnabled }) {
  const [FeatureModule, setFeatureModule] = useState(null);
  
  useEffect(() => {
    if (featureEnabled) {
      import('./AdvancedFeature').then(module => {
        setFeatureModule(() => module.default);
      });
    }
  }, [featureEnabled]);
  
  if (!featureEnabled || !FeatureModule) {
    return <BasicFeature />;
  }
  
  return <FeatureModule />;
}
```

## 🖼️ Image and Asset Optimization

### Responsive Images and Lazy Loading

```jsx
// ✅ Optimized image component
import { useState, useRef, useEffect } from 'react';

function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  className,
  lazy = true,
  placeholder = 'blur'
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const [error, setError] = useState(false);
  const imgRef = useRef();
  
  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, [lazy, isInView]);
  
  const handleLoad = () => {
    setIsLoaded(true);
  };
  
  const handleError = () => {
    setError(true);
  };
  
  // Generate responsive image sources
  const generateSrcSet = (baseSrc) => {
    const sizes = [480, 768, 1024, 1280, 1920];
    return sizes
      .map(size => `${baseSrc}?w=${size} ${size}w`)
      .join(', ');
  };
  
  if (error) {
    return (
      <div 
        className={`image-error ${className}`}
        style={{ width, height }}
      >
        <span>Failed to load image</span>
      </div>
    );
  }
  
  return (
    <div 
      ref={imgRef}
      className={`image-container ${className}`}
      style={{ width, height }}
    >
      {/* Placeholder */}
      {!isLoaded && (
        <div className={`image-placeholder ${placeholder}`}>
          {placeholder === 'blur' && <div className="blur-placeholder" />}
          {placeholder === 'skeleton' && <div className="skeleton-placeholder" />}
        </div>
      )}
      
      {/* Actual image */}
      {isInView && (
        <img
          src={src}
          srcSet={generateSrcSet(src)}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          alt={alt}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
        />
      )}
    </div>
  );
}

// ✅ Image gallery with progressive loading
function ImageGallery({ images }) {
  const [loadedCount, setLoadedCount] = useState(0);
  
  const handleImageLoad = useCallback(() => {
    setLoadedCount(prev => prev + 1);
  }, []);
  
  return (
    <div className="image-gallery">
      <div className="loading-progress">
        Loaded: {loadedCount} / {images.length}
      </div>
      
      <div className="gallery-grid">
        {images.map((image, index) => (
          <OptimizedImage
            key={image.id}
            src={image.src}
            alt={image.alt}
            width={300}
            height={200}
            lazy={index > 6} // Load first 6 immediately
            onLoad={handleImageLoad}
          />
        ))}
      </div>
    </div>
  );
}
```

### Asset Preloading Strategy

```jsx
// ✅ Strategic asset preloading
function useAssetPreloader() {
  const [preloadedAssets, setPreloadedAssets] = useState(new Set());
  
  const preloadImage = useCallback((src) => {
    if (preloadedAssets.has(src)) return Promise.resolve();
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        setPreloadedAssets(prev => new Set([...prev, src]));
        resolve(img);
      };
      img.onerror = reject;
      img.src = src;
    });
  }, [preloadedAssets]);
  
  const preloadRoute = useCallback(async (routePath) => {
    try {
      // Preload route component
      const routeModule = await import(`./routes${routePath}`);
      
      // Preload route-specific assets
      const assets = routeModule.preloadAssets || [];
      await Promise.all(assets.map(preloadImage));
      
      return routeModule;
    } catch (error) {
      console.error('Failed to preload route:', routePath, error);
    }
  }, [preloadImage]);
  
  return { preloadImage, preloadRoute, preloadedAssets };
}

// ✅ Intelligent preloading based on user behavior
function NavigationWithPreloading() {
  const { preloadRoute } = useAssetPreloader();
  const [hoveredRoute, setHoveredRoute] = useState(null);
  
  // Preload on hover with debounce
  const debouncedPreload = useMemo(
    () => debounce((route) => {
      if (route) {
        preloadRoute(route);
      }
    }, 300),
    [preloadRoute]
  );
  
  useEffect(() => {
    debouncedPreload(hoveredRoute);
  }, [hoveredRoute, debouncedPreload]);
  
  return (
    <nav>
      <Link 
        to="/dashboard"
        onMouseEnter={() => setHoveredRoute('/dashboard')}
        onMouseLeave={() => setHoveredRoute(null)}
      >
        Dashboard
      </Link>
      
      <Link 
        to="/profile"
        onMouseEnter={() => setHoveredRoute('/profile')}
        onMouseLeave={() => setHoveredRoute(null)}
      >
        Profile
      </Link>
    </nav>
  );
}
```

## 🧠 Memory Management

### Preventing Memory Leaks

```jsx
// ✅ Proper cleanup patterns
function ComponentWithCleanup() {
  const [data, setData] = useState(null);
  const abortControllerRef = useRef();
  const intervalRef = useRef();
  const observerRef = useRef();
  
  useEffect(() => {
    // Create abort controller for fetch requests
    abortControllerRef.current = new AbortController();
    
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data', {
          signal: abortControllerRef.current.signal
        });
        const result = await response.json();
        setData(result);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Fetch error:', error);
        }
      }
    };
    
    fetchData();
    
    // Set up interval
    intervalRef.current = setInterval(() => {
      fetchData();
    }, 30000);
    
    // Set up intersection observer
    observerRef.current = new IntersectionObserver((entries) => {
      // Handle intersection
    });
    
    const element = document.getElementById('target');
    if (element) {
      observerRef.current.observe(element);
    }
    
    // Cleanup function
    return () => {
      // Abort ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Clear interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // Disconnect observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);
  
  return (
    <div>
      {data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}

// ✅ Memory-efficient event listeners
function useEventListener(eventName, handler, element = window) {
  const savedHandler = useRef();
  
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);
  
  useEffect(() => {
    const isSupported = element && element.addEventListener;
    if (!isSupported) return;
    
    const eventListener = (event) => savedHandler.current(event);
    element.addEventListener(eventName, eventListener);
    
    return () => {
      element.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element]);
}

// ✅ Debounced state updates to prevent excessive re-renders
function useDebouncedState(initialValue, delay) {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return [debouncedValue, setValue];
}
```

## 🎯 Mini-Challenge: Performance Optimization Dashboard

### Challenge: Build a Performance-Optimized Data Dashboard

Create a dashboard that efficiently handles:
- Large datasets (10,000+ items)
- Real-time updates
- Multiple chart types
- Filtering and searching
- Export functionality

```jsx
// Your task: Optimize this dashboard for performance
function DataDashboard() {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    dateRange: { start: null, end: null },
    searchTerm: ''
  });
  const [chartType, setChartType] = useState('line');
  const [isExporting, setIsExporting] = useState(false);
  
  // Generate large dataset
  useEffect(() => {
    const generateData = () => {
      return Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        category: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
        value: Math.random() * 1000,
        date: new Date(2024, 0, 1 + Math.floor(Math.random() * 365)),
        name: `Item ${i}`,
        description: `Description for item ${i}`,
        tags: ['tag1', 'tag2', 'tag3'].slice(0, Math.floor(Math.random() * 3) + 1)
      }));
    };
    
    setData(generateData());
  }, []);
  
  // Filter data
  const filteredData = data.filter(item => {
    if (filters.category && item.category !== filters.category) return false;
    if (filters.searchTerm && !item.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
    if (filters.dateRange.start && item.date < filters.dateRange.start) return false;
    if (filters.dateRange.end && item.date > filters.dateRange.end) return false;
    return true;
  });
  
  // Calculate statistics
  const stats = {
    total: filteredData.length,
    average: filteredData.reduce((sum, item) => sum + item.value, 0) / filteredData.length,
    categories: filteredData.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {})
  };
  
  const handleExport = async () => {
    setIsExporting(true);
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsExporting(false);
  };
  
  return (
    <div className="dashboard">
      <header>
        <h1>Data Dashboard</h1>
        <button onClick={handleExport} disabled={isExporting}>
          {isExporting ? 'Exporting...' : 'Export Data'}
        </button>
      </header>
      
      <div className="filters">
        <select 
          value={filters.category} 
          onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
        >
          <option value="">All Categories</option>
          <option value="A">Category A</option>
          <option value="B">Category B</option>
          <option value="C">Category C</option>
          <option value="D">Category D</option>
        </select>
        
        <input
          type="text"
          placeholder="Search..."
          value={filters.searchTerm}
          onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
        />
      </div>
      
      <div className="stats">
        <div>Total: {stats.total}</div>
        <div>Average: {stats.average.toFixed(2)}</div>
        <div>Categories: {Object.entries(stats.categories).map(([cat, count]) => `${cat}: ${count}`).join(', ')}</div>
      </div>
      
      <div className="chart-controls">
        <button 
          className={chartType === 'line' ? 'active' : ''}
          onClick={() => setChartType('line')}
        >
          Line Chart
        </button>
        <button 
          className={chartType === 'bar' ? 'active' : ''}
          onClick={() => setChartType('bar')}
        >
          Bar Chart
        </button>
        <button 
          className={chartType === 'pie' ? 'active' : ''}
          onClick={() => setChartType('pie')}
        >
          Pie Chart
        </button>
      </div>
      
      <div className="chart">
        {chartType === 'line' && <LineChart data={filteredData} />}
        {chartType === 'bar' && <BarChart data={filteredData} />}
        {chartType === 'pie' && <PieChart data={filteredData} />}
      </div>
      
      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Value</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>{item.value.toFixed(2)}</td>
                <td>{item.date.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Chart components (simplified)
function LineChart({ data }) {
  return <div>Line Chart with {data.length} points</div>;
}

function BarChart({ data }) {
  return <div>Bar Chart with {data.length} bars</div>;
}

function PieChart({ data }) {
  return <div>Pie Chart with {data.length} slices</div>;
}
```

### Solution: Optimized Performance Dashboard

```jsx
// ✅ Optimized dashboard with performance techniques
import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useDebouncedState, useVirtualList } from './hooks';

// Memoized chart components
const LineChart = memo(function LineChart({ data }) {
  console.log('Rendering LineChart with', data.length, 'points');
  
  // Only re-render if data reference changes
  return (
    <div className="chart line-chart">
      <h3>Line Chart</h3>
      <p>{data.length} data points</p>
      {/* Actual chart implementation would go here */}
    </div>
  );
});

const BarChart = memo(function BarChart({ data }) {
  console.log('Rendering BarChart with', data.length, 'bars');
  
  return (
    <div className="chart bar-chart">
      <h3>Bar Chart</h3>
      <p>{data.length} data points</p>
    </div>
  );
});

const PieChart = memo(function PieChart({ data }) {
  console.log('Rendering PieChart with', data.length, 'slices');
  
  return (
    <div className="chart pie-chart">
      <h3>Pie Chart</h3>
      <p>{data.length} data points</p>
    </div>
  );
});

// Memoized table row component
const TableRow = memo(function TableRow({ item }) {
  return (
    <tr>
      <td>{item.id}</td>
      <td>{item.name}</td>
      <td>{item.category}</td>
      <td>{item.value.toFixed(2)}</td>
      <td>{item.date.toLocaleDateString()}</td>
    </tr>
  );
});

// Virtualized table component
function VirtualizedTable({ data }) {
  const renderRow = useCallback((item, index) => (
    <TableRow key={item.id} item={item} />
  ), []);
  
  return (
    <div className="data-table">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Category</th>
            <th>Value</th>
            <th>Date</th>
          </tr>
        </thead>
      </table>
      
      <VirtualList
        items={data}
        itemHeight={40}
        containerHeight={400}
        renderItem={renderRow}
      />
    </div>
  );
}

// Custom hook for data filtering with memoization
function useDataFilter(data, filters) {
  return useMemo(() => {
    console.log('Filtering data...', { dataLength: data.length, filters });
    
    return data.filter(item => {
      if (filters.category && item.category !== filters.category) return false;
      if (filters.searchTerm && !item.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
      if (filters.dateRange.start && item.date < filters.dateRange.start) return false;
      if (filters.dateRange.end && item.date > filters.dateRange.end) return false;
      return true;
    });
  }, [data, filters]);
}

// Custom hook for statistics calculation
function useDataStats(data) {
  return useMemo(() => {
    console.log('Calculating stats for', data.length, 'items');
    
    if (data.length === 0) {
      return {
        total: 0,
        average: 0,
        categories: {}
      };
    }
    
    const total = data.length;
    const sum = data.reduce((acc, item) => acc + item.value, 0);
    const average = sum / total;
    
    const categories = data.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});
    
    return { total, average, categories };
  }, [data]);
}

// Main optimized dashboard component
function OptimizedDataDashboard() {
  // State management
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    dateRange: { start: null, end: null },
    searchTerm: ''
  });
  const [chartType, setChartType] = useState('line');
  const [isExporting, setIsExporting] = useState(false);
  
  // Debounced search to prevent excessive filtering
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useDebouncedState('', 300);
  
  // Update filters when debounced search changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, searchTerm: debouncedSearchTerm }));
  }, [debouncedSearchTerm]);
  
  // Generate data once on mount
  useEffect(() => {
    console.log('Generating initial data...');
    
    const generateData = () => {
      const categories = ['A', 'B', 'C', 'D'];
      const data = [];
      
      for (let i = 0; i < 10000; i++) {
        data.push({
          id: i,
          category: categories[Math.floor(Math.random() * categories.length)],
          value: Math.random() * 1000,
          date: new Date(2024, 0, 1 + Math.floor(Math.random() * 365)),
          name: `Item ${i}`,
          description: `Description for item ${i}`,
          tags: ['tag1', 'tag2', 'tag3'].slice(0, Math.floor(Math.random() * 3) + 1)
        });
      }
      
      return data;
    };
    
    // Simulate async data loading
    const timer = setTimeout(() => {
      setData(generateData());
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Memoized filtered data
  const filteredData = useDataFilter(data, filters);
  
  // Memoized statistics
  const stats = useDataStats(filteredData);
  
  // Memoized chart data (sample for performance)
  const chartData = useMemo(() => {
    // For charts, we might want to sample the data for better performance
    const maxChartPoints = 1000;
    if (filteredData.length <= maxChartPoints) {
      return filteredData;
    }
    
    // Sample data for chart performance
    const step = Math.floor(filteredData.length / maxChartPoints);
    return filteredData.filter((_, index) => index % step === 0);
  }, [filteredData]);
  
  // Memoized event handlers
  const handleCategoryChange = useCallback((e) => {
    setFilters(prev => ({ ...prev, category: e.target.value }));
  }, []);
  
  const handleSearchChange = useCallback((e) => {
    setDebouncedSearchTerm(e.target.value);
  }, [setDebouncedSearchTerm]);
  
  const handleChartTypeChange = useCallback((type) => {
    setChartType(type);
  }, []);
  
  const handleExport = useCallback(async () => {
    setIsExporting(true);
    
    try {
      // Simulate export process with Web Workers for heavy processing
      await new Promise(resolve => {
        const worker = new Worker(new URL('./exportWorker.js', import.meta.url));
        worker.postMessage({ data: filteredData });
        worker.onmessage = () => {
          worker.terminate();
          resolve();
        };
      });
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [filteredData]);
  
  // Memoized chart component
  const ChartComponent = useMemo(() => {
    switch (chartType) {
      case 'line': return <LineChart data={chartData} />;
      case 'bar': return <BarChart data={chartData} />;
      case 'pie': return <PieChart data={chartData} />;
      default: return null;
    }
  }, [chartType, chartData]);
  
  if (data.length === 0) {
    return (
      <div className="dashboard loading">
        <h1>Loading Dashboard...</h1>
        <div className="loading-spinner">⏳</div>
      </div>
    );
  }
  
  return (
    <div className="dashboard optimized">
      <header className="dashboard-header">
        <h1>Optimized Data Dashboard</h1>
        <button 
          onClick={handleExport} 
          disabled={isExporting}
          className="export-button"
        >
          {isExporting ? '⏳ Exporting...' : '📊 Export Data'}
        </button>
      </header>
      
      <div className="filters">
        <select 
          value={filters.category} 
          onChange={handleCategoryChange}
          className="category-filter"
        >
          <option value="">All Categories</option>
          <option value="A">Category A</option>
          <option value="B">Category B</option>
          <option value="C">Category C</option>
          <option value="D">Category D</option>
        </select>
        
        <input
          type="text"
          placeholder="Search items..."
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>
      
      <div className="stats">
        <div className="stat-item">
          <strong>Total:</strong> {stats.total.toLocaleString()}
        </div>
        <div className="stat-item">
          <strong>Average:</strong> {stats.average.toFixed(2)}
        </div>
        <div className="stat-item">
          <strong>Categories:</strong> {Object.entries(stats.categories)
            .map(([cat, count]) => `${cat}: ${count}`)
            .join(', ')}
        </div>
      </div>
      
      <div className="chart-controls">
        {['line', 'bar', 'pie'].map(type => (
          <button 
            key={type}
            className={chartType === type ? 'active' : ''}
            onClick={() => handleChartTypeChange(type)}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)} Chart
          </button>
        ))}
      </div>
      
      <div className="chart-container">
        {ChartComponent}
        {chartData.length !== filteredData.length && (
          <p className="chart-note">
            📊 Showing {chartData.length} of {filteredData.length} points for performance
          </p>
        )}
      </div>
      
      <VirtualizedTable data={filteredData} />
    </div>
  );
}

export default OptimizedDataDashboard;
```

```javascript
// exportWorker.js - Web Worker for heavy export processing
self.onmessage = function(e) {
  const { data } = e.data;
  
  // Simulate heavy processing
  const processedData = data.map(item => ({
    ...item,
    processed: true,
    exportTimestamp: new Date().toISOString()
  }));
  
  // Simulate export delay
  setTimeout(() => {
    self.postMessage({ success: true, count: processedData.length });
  }, 1500);
};
```

## 🎯 Key Performance Takeaways

### 1. Measurement First
- Always measure before optimizing
- Use React DevTools Profiler
- Monitor real user metrics
- Set performance budgets

### 2. Optimization Hierarchy
1. **Prevent unnecessary work** (memoization, virtualization)
2. **Reduce work complexity** (efficient algorithms, data structures)
3. **Defer work** (lazy loading, code splitting)
4. **Parallelize work** (Web Workers, concurrent features)

### 3. Common Optimization Patterns
- Memoize expensive calculations with `useMemo`
- Memoize callbacks with `useCallback`
- Use `React.memo` for component memoization
- Implement virtual scrolling for large lists
- Split code at route boundaries
- Optimize images and assets
- Clean up resources properly

### 4. Performance Monitoring
- Set up continuous performance monitoring
- Track Core Web Vitals
- Monitor bundle sizes
- Use performance budgets in CI/CD

---

**Next up**: We'll explore deployment strategies and learn how to ship React applications to production! 🚀