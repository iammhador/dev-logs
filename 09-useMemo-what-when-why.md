# 🚀 useMemo: What, When, and Why

> **Master React's performance optimization: Expensive calculations, object stability, and when memoization actually helps**

## 🎯 What You'll Learn

- Understanding useMemo fundamentals and when it's needed
- Expensive calculation optimization patterns
- Object and array reference stability
- Dependency array best practices
- Performance measurement and profiling
- Common memoization mistakes and anti-patterns
- Real-world optimization scenarios
- Interview insights and best practices

## 🎯 Understanding useMemo Fundamentals

### What is useMemo?

```jsx
// 🎯 useMemo caches the result of expensive calculations
const memoizedValue = useMemo(() => {
  // Expensive calculation here
  return expensiveCalculation(dependencies);
}, [dependencies]);

// 🎯 Basic syntax breakdown:
// useMemo(calculateValue, dependencies)
// - calculateValue: Function that returns the value to cache
// - dependencies: Array of values that trigger recalculation
```

### When React Re-calculates

```jsx
function MemoBasicsDemo() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('John');
  const [items, setItems] = useState([1, 2, 3, 4, 5]);
  
  // 🎯 Without useMemo - runs on every render
  const expensiveCalculationWithoutMemo = () => {
    console.log('🔴 Expensive calculation running (no memo)');
    let result = 0;
    for (let i = 0; i < 1000000; i++) {
      result += Math.random();
    }
    return result;
  };
  
  // 🎯 With useMemo - only runs when dependencies change
  const expensiveCalculationWithMemo = useMemo(() => {
    console.log('🟢 Expensive calculation running (with memo)');
    let result = 0;
    for (let i = 0; i < 1000000; i++) {
      result += Math.random();
    }
    return result;
  }, [count]); // Only recalculates when count changes
  
  // 🎯 Array processing with memo
  const processedItems = useMemo(() => {
    console.log('🟡 Processing items array');
    return items.map(item => ({
      id: item,
      value: item * 2,
      label: `Item ${item}`,
      isEven: item % 2 === 0
    }));
  }, [items]); // Only recalculates when items array changes
  
  // 🎯 Complex object creation
  const userProfile = useMemo(() => {
    console.log('🔵 Creating user profile object');
    return {
      name,
      displayName: name.toUpperCase(),
      initials: name.split(' ').map(n => n[0]).join(''),
      metadata: {
        createdAt: new Date().toISOString(),
        count,
        hasItems: items.length > 0
      }
    };
  }, [name, count, items.length]); // Recalculates when any dependency changes
  
  const renderCount = useRef(0);
  renderCount.current += 1;
  
  return (
    <div className="memo-basics-demo">
      <h3>useMemo Basics Demo</h3>
      
      <div className="render-info">
        <p><strong>Render count:</strong> {renderCount.current}</p>
        <p><em>Check console to see when calculations run</em></p>
      </div>
      
      <div className="controls">
        <div className="control-group">
          <label>Count (affects memoized calculation):</label>
          <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
        </div>
        
        <div className="control-group">
          <label>Name (affects user profile):</label>
          <input 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name"
          />
        </div>
        
        <div className="control-group">
          <label>Items (affects processed items):</label>
          <button onClick={() => setItems(prev => [...prev, prev.length + 1])}>
            Add Item
          </button>
          <button onClick={() => setItems(prev => prev.slice(0, -1))}>
            Remove Item
          </button>
        </div>
        
        <div className="control-group">
          <label>Force re-render (no state change):</label>
          <button onClick={() => setCount(count)}>
            Force Re-render
          </button>
        </div>
      </div>
      
      <div className="results">
        <div className="result-section">
          <h4>Without Memo (runs every render)</h4>
          <p>Result: {expensiveCalculationWithoutMemo().toFixed(2)}</p>
        </div>
        
        <div className="result-section">
          <h4>With Memo (runs only when count changes)</h4>
          <p>Result: {expensiveCalculationWithMemo.toFixed(2)}</p>
        </div>
        
        <div className="result-section">
          <h4>Processed Items</h4>
          <div className="items-grid">
            {processedItems.map(item => (
              <div key={item.id} className={`item ${item.isEven ? 'even' : 'odd'}`}>
                {item.label}: {item.value}
              </div>
            ))}
          </div>
        </div>
        
        <div className="result-section">
          <h4>User Profile</h4>
          <pre>{JSON.stringify(userProfile, null, 2)}</pre>
        </div>
      </div>
      
      <div className="explanation">
        <h4>What's Happening:</h4>
        <ul>
          <li><strong>Without memo:</strong> Calculation runs on every render (expensive!)</li>
          <li><strong>With memo:</strong> Calculation only runs when dependencies change</li>
          <li><strong>Processed items:</strong> Only recalculates when items array changes</li>
          <li><strong>User profile:</strong> Only recalculates when name, count, or items.length changes</li>
        </ul>
      </div>
    </div>
  );
}
```

## 💰 Expensive Calculations

### Identifying Expensive Operations

```jsx
function ExpensiveCalculationsDemo() {
  const [data, setData] = useState(
    Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      value: Math.random() * 100,
      category: ['A', 'B', 'C'][Math.floor(Math.random() * 3)]
    }))
  );
  
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('id');
  const [searchTerm, setSearchTerm] = useState('');
  const [threshold, setThreshold] = useState(50);
  
  // 🎯 Expensive filtering and sorting
  const processedData = useMemo(() => {
    console.time('Data processing');
    console.log('🔄 Processing data...');
    
    let result = data;
    
    // Filter by category
    if (filterCategory !== 'all') {
      result = result.filter(item => item.category === filterCategory);
    }
    
    // Filter by search term (expensive string operations)
    if (searchTerm) {
      result = result.filter(item => 
        item.id.toString().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by threshold
    result = result.filter(item => item.value >= threshold);
    
    // Sort (expensive for large arrays)
    result = result.sort((a, b) => {
      switch (sortBy) {
        case 'value':
          return b.value - a.value;
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return a.id - b.id;
      }
    });
    
    console.timeEnd('Data processing');
    return result;
  }, [data, filterCategory, searchTerm, threshold, sortBy]);
  
  // 🎯 Expensive statistical calculations
  const statistics = useMemo(() => {
    console.time('Statistics calculation');
    console.log('📊 Calculating statistics...');
    
    if (processedData.length === 0) {
      return {
        count: 0,
        average: 0,
        min: 0,
        max: 0,
        median: 0,
        standardDeviation: 0
      };
    }
    
    const values = processedData.map(item => item.value);
    const sum = values.reduce((acc, val) => acc + val, 0);
    const average = sum / values.length;
    
    const sortedValues = [...values].sort((a, b) => a - b);
    const median = sortedValues.length % 2 === 0
      ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2
      : sortedValues[Math.floor(sortedValues.length / 2)];
    
    const variance = values.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);
    
    console.timeEnd('Statistics calculation');
    
    return {
      count: processedData.length,
      average: average.toFixed(2),
      min: Math.min(...values).toFixed(2),
      max: Math.max(...values).toFixed(2),
      median: median.toFixed(2),
      standardDeviation: standardDeviation.toFixed(2)
    };
  }, [processedData]);
  
  // 🎯 Expensive chart data preparation
  const chartData = useMemo(() => {
    console.time('Chart data preparation');
    console.log('📈 Preparing chart data...');
    
    // Group by category and calculate averages
    const categoryGroups = processedData.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item.value);
      return acc;
    }, {});
    
    const chartData = Object.entries(categoryGroups).map(([category, values]) => ({
      category,
      average: values.reduce((sum, val) => sum + val, 0) / values.length,
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values)
    }));
    
    console.timeEnd('Chart data preparation');
    return chartData;
  }, [processedData]);
  
  const addRandomData = () => {
    const newItems = Array.from({ length: 1000 }, (_, i) => ({
      id: data.length + i,
      value: Math.random() * 100,
      category: ['A', 'B', 'C'][Math.floor(Math.random() * 3)]
    }));
    setData(prev => [...prev, ...newItems]);
  };
  
  const resetData = () => {
    setData(
      Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        value: Math.random() * 100,
        category: ['A', 'B', 'C'][Math.floor(Math.random() * 3)]
      }))
    );
  };
  
  return (
    <div className="expensive-calculations-demo">
      <h3>Expensive Calculations Demo</h3>
      
      <div className="performance-note">
        <p><strong>📊 Performance Note:</strong> Open DevTools Console to see timing information</p>
      </div>
      
      <div className="controls">
        <div className="control-row">
          <div className="control-group">
            <label>Filter Category:</label>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="all">All Categories</option>
              <option value="A">Category A</option>
              <option value="B">Category B</option>
              <option value="C">Category C</option>
            </select>
          </div>
          
          <div className="control-group">
            <label>Sort By:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="id">ID</option>
              <option value="value">Value (High to Low)</option>
              <option value="category">Category</option>
            </select>
          </div>
        </div>
        
        <div className="control-row">
          <div className="control-group">
            <label>Search:</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID or category"
            />
          </div>
          
          <div className="control-group">
            <label>Minimum Value: {threshold}</label>
            <input
              type="range"
              min="0"
              max="100"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
            />
          </div>
        </div>
        
        <div className="control-row">
          <button onClick={addRandomData}>Add 1000 Random Items</button>
          <button onClick={resetData}>Reset Data</button>
        </div>
      </div>
      
      <div className="results">
        <div className="result-section">
          <h4>Data Summary</h4>
          <p>Total items: {data.length}</p>
          <p>Filtered items: {processedData.length}</p>
          <p>Processing time: Check console</p>
        </div>
        
        <div className="result-section">
          <h4>Statistics</h4>
          <div className="stats-grid">
            <div className="stat">
              <strong>Count:</strong> {statistics.count}
            </div>
            <div className="stat">
              <strong>Average:</strong> {statistics.average}
            </div>
            <div className="stat">
              <strong>Min:</strong> {statistics.min}
            </div>
            <div className="stat">
              <strong>Max:</strong> {statistics.max}
            </div>
            <div className="stat">
              <strong>Median:</strong> {statistics.median}
            </div>
            <div className="stat">
              <strong>Std Dev:</strong> {statistics.standardDeviation}
            </div>
          </div>
        </div>
        
        <div className="result-section">
          <h4>Chart Data by Category</h4>
          <div className="chart-data">
            {chartData.map(item => (
              <div key={item.category} className="chart-item">
                <h5>Category {item.category}</h5>
                <p>Count: {item.count}</p>
                <p>Average: {item.average.toFixed(2)}</p>
                <p>Range: {item.min.toFixed(2)} - {item.max.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="result-section">
          <h4>Sample Data (First 10 items)</h4>
          <div className="data-preview">
            {processedData.slice(0, 10).map(item => (
              <div key={item.id} className="data-item">
                ID: {item.id}, Value: {item.value.toFixed(2)}, Category: {item.category}
              </div>
            ))}
            {processedData.length > 10 && (
              <p>... and {processedData.length - 10} more items</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="optimization-notes">
        <h4>Optimization Techniques Used:</h4>
        <ul>
          <li><strong>Data Processing:</strong> Memoized filtering, searching, and sorting</li>
          <li><strong>Statistics:</strong> Memoized complex mathematical calculations</li>
          <li><strong>Chart Data:</strong> Memoized data transformation for visualization</li>
          <li><strong>Dependency Arrays:</strong> Only recalculate when relevant inputs change</li>
        </ul>
      </div>
    </div>
  );
}
```

## 🔗 Reference Stability

### Object and Array Reference Stability

```jsx
function ReferenceStabilityDemo() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('John');
  const [items, setItems] = useState(['apple', 'banana', 'cherry']);
  
  // 🎯 Without useMemo - new object/array on every render
  const unstableConfig = {
    theme: 'dark',
    count,
    features: ['feature1', 'feature2']
  };
  
  const unstableArray = items.map(item => item.toUpperCase());
  
  // 🎯 With useMemo - stable references
  const stableConfig = useMemo(() => ({
    theme: 'dark',
    count,
    features: ['feature1', 'feature2']
  }), [count]); // Only creates new object when count changes
  
  const stableArray = useMemo(() => 
    items.map(item => item.toUpperCase()),
    [items]
  ); // Only creates new array when items change
  
  // 🎯 Complex object with nested properties
  const complexConfig = useMemo(() => ({
    user: {
      name,
      preferences: {
        theme: 'dark',
        notifications: true,
        layout: 'grid'
      }
    },
    app: {
      version: '1.0.0',
      features: {
        search: true,
        export: count > 5,
        advanced: count > 10
      }
    },
    data: {
      items: items.length,
      processed: items.map(item => ({
        original: item,
        processed: item.toUpperCase(),
        length: item.length
      }))
    }
  }), [name, count, items]);
  
  // 🎯 Filtered and sorted data
  const processedItems = useMemo(() => {
    return items
      .filter(item => item.length > 3)
      .sort()
      .map(item => ({
        id: item,
        display: item.charAt(0).toUpperCase() + item.slice(1),
        metadata: {
          length: item.length,
          vowels: (item.match(/[aeiou]/gi) || []).length
        }
      }));
  }, [items]);
  
  // 🎯 Reference tracking
  const previousRefsRef = useRef({});
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;
  
  const checkReferenceStability = (name, current) => {
    const previous = previousRefsRef.current[name];
    const isStable = previous === current;
    previousRefsRef.current[name] = current;
    return isStable;
  };
  
  const addItem = () => {
    const newItem = `item${items.length + 1}`;
    setItems(prev => [...prev, newItem]);
  };
  
  const removeItem = () => {
    setItems(prev => prev.slice(0, -1));
  };
  
  const updateName = (newName) => {
    setName(newName);
  };
  
  return (
    <div className="reference-stability-demo">
      <h3>Reference Stability Demo</h3>
      
      <div className="render-info">
        <p><strong>Render #{renderCountRef.current}</strong></p>
        <p><em>Watch reference stability indicators below</em></p>
      </div>
      
      <div className="controls">
        <div className="control-group">
          <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
          <button onClick={() => setCount(count)}>Force Re-render (same count)</button>
        </div>
        
        <div className="control-group">
          <input 
            value={name} 
            onChange={(e) => updateName(e.target.value)}
            placeholder="Enter name"
          />
        </div>
        
        <div className="control-group">
          <button onClick={addItem}>Add Item</button>
          <button onClick={removeItem}>Remove Item</button>
          <span>Items: {items.join(', ')}</span>
        </div>
      </div>
      
      <div className="reference-tracking">
        <h4>Reference Stability Tracking</h4>
        
        <div className="stability-grid">
          <div className="stability-item">
            <h5>Unstable Config Object</h5>
            <div className={`stability-indicator ${
              checkReferenceStability('unstableConfig', unstableConfig) ? 'stable' : 'unstable'
            }`}>
              {checkReferenceStability('unstableConfig', unstableConfig) ? '✅ Stable' : '❌ New Reference'}
            </div>
            <pre>{JSON.stringify(unstableConfig, null, 2)}</pre>
          </div>
          
          <div className="stability-item">
            <h5>Stable Config Object (useMemo)</h5>
            <div className={`stability-indicator ${
              checkReferenceStability('stableConfig', stableConfig) ? 'stable' : 'unstable'
            }`}>
              {checkReferenceStability('stableConfig', stableConfig) ? '✅ Stable' : '🔄 Updated'}
            </div>
            <pre>{JSON.stringify(stableConfig, null, 2)}</pre>
          </div>
          
          <div className="stability-item">
            <h5>Unstable Array</h5>
            <div className={`stability-indicator ${
              checkReferenceStability('unstableArray', unstableArray) ? 'stable' : 'unstable'
            }`}>
              {checkReferenceStability('unstableArray', unstableArray) ? '✅ Stable' : '❌ New Reference'}
            </div>
            <div>Array: [{unstableArray.join(', ')}]</div>
          </div>
          
          <div className="stability-item">
            <h5>Stable Array (useMemo)</h5>
            <div className={`stability-indicator ${
              checkReferenceStability('stableArray', stableArray) ? 'stable' : 'unstable'
            }`}>
              {checkReferenceStability('stableArray', stableArray) ? '✅ Stable' : '🔄 Updated'}
            </div>
            <div>Array: [{stableArray.join(', ')}]</div>
          </div>
        </div>
        
        <div className="complex-object">
          <h5>Complex Configuration Object</h5>
          <div className={`stability-indicator ${
            checkReferenceStability('complexConfig', complexConfig) ? 'stable' : 'unstable'
          }`}>
            {checkReferenceStability('complexConfig', complexConfig) ? '✅ Stable' : '🔄 Updated'}
          </div>
          <details>
            <summary>View Complex Config</summary>
            <pre>{JSON.stringify(complexConfig, null, 2)}</pre>
          </details>
        </div>
        
        <div className="processed-items">
          <h5>Processed Items</h5>
          <div className={`stability-indicator ${
            checkReferenceStability('processedItems', processedItems) ? 'stable' : 'unstable'
          }`}>
            {checkReferenceStability('processedItems', processedItems) ? '✅ Stable' : '🔄 Updated'}
          </div>
          <div className="items-display">
            {processedItems.map(item => (
              <div key={item.id} className="processed-item">
                <strong>{item.display}</strong>
                <br />
                <small>Length: {item.metadata.length}, Vowels: {item.metadata.vowels}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="explanation">
        <h4>Reference Stability Impact:</h4>
        <ul>
          <li><strong>❌ Unstable references:</strong> Create new objects/arrays every render</li>
          <li><strong>✅ Stable references:</strong> Only create new when dependencies change</li>
          <li><strong>🔄 Updated references:</strong> New reference due to dependency change</li>
          <li><strong>Performance:</strong> Stable references prevent unnecessary child re-renders</li>
          <li><strong>useEffect:</strong> Stable references prevent infinite loops</li>
        </ul>
      </div>
    </div>
  );
}
```

### Child Component Re-render Prevention

```jsx
// 🎯 Child component that shows re-render behavior
const ExpensiveChild = React.memo(({ config, onAction }) => {
  const renderCount = useRef(0);
  renderCount.current += 1;
  
  console.log(`ExpensiveChild rendered ${renderCount.current} times`);
  
  // Simulate expensive rendering
  const expensiveValue = useMemo(() => {
    console.log('ExpensiveChild: Performing expensive calculation');
    let result = 0;
    for (let i = 0; i < 100000; i++) {
      result += Math.random();
    }
    return result;
  }, [config.seed]);
  
  return (
    <div className="expensive-child">
      <h4>Expensive Child Component</h4>
      <p>Render count: {renderCount.current}</p>
      <p>Config theme: {config.theme}</p>
      <p>Config seed: {config.seed}</p>
      <p>Expensive value: {expensiveValue.toFixed(2)}</p>
      <button onClick={() => onAction('child-action')}>Child Action</button>
    </div>
  );
});

function ChildReRenderDemo() {
  const [parentCount, setParentCount] = useState(0);
  const [childSeed, setChildSeed] = useState(1);
  const [theme, setTheme] = useState('light');
  
  // 🎯 Unstable config - causes unnecessary re-renders
  const unstableConfig = {
    theme,
    seed: childSeed,
    timestamp: Date.now() // ❌ Always different!
  };
  
  // 🎯 Stable config - only changes when dependencies change
  const stableConfig = useMemo(() => ({
    theme,
    seed: childSeed,
    // timestamp: Date.now() // ❌ Don't include changing values
  }), [theme, childSeed]);
  
  // 🎯 Unstable callback - new function every render
  const unstableCallback = (action) => {
    console.log('Action:', action, 'Parent count:', parentCount);
  };
  
  // 🎯 Stable callback - memoized function
  const stableCallback = useCallback((action) => {
    console.log('Action:', action, 'Parent count:', parentCount);
  }, [parentCount]);
  
  const parentRenderCount = useRef(0);
  parentRenderCount.current += 1;
  
  return (
    <div className="child-rerender-demo">
      <h3>Child Re-render Prevention Demo</h3>
      
      <div className="parent-info">
        <p><strong>Parent render count:</strong> {parentRenderCount.current}</p>
        <p><em>Check console for child render logs</em></p>
      </div>
      
      <div className="controls">
        <div className="control-group">
          <button onClick={() => setParentCount(c => c + 1)}>
            Parent Count: {parentCount}
          </button>
          <p><em>This should NOT cause child re-renders with stable props</em></p>
        </div>
        
        <div className="control-group">
          <button onClick={() => setChildSeed(s => s + 1)}>
            Child Seed: {childSeed}
          </button>
          <p><em>This SHOULD cause child re-renders</em></p>
        </div>
        
        <div className="control-group">
          <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
            Theme: {theme}
          </button>
          <p><em>This SHOULD cause child re-renders</em></p>
        </div>
      </div>
      
      <div className="children-comparison">
        <div className="child-section">
          <h4>❌ With Unstable Props</h4>
          <p><em>Re-renders on every parent render</em></p>
          <ExpensiveChild 
            config={unstableConfig} 
            onAction={unstableCallback}
          />
        </div>
        
        <div className="child-section">
          <h4>✅ With Stable Props (useMemo + useCallback)</h4>
          <p><em>Only re-renders when props actually change</em></p>
          <ExpensiveChild 
            config={stableConfig} 
            onAction={stableCallback}
          />
        </div>
      </div>
      
      <div className="explanation">
        <h4>Optimization Techniques:</h4>
        <ul>
          <li><strong>React.memo:</strong> Prevents re-renders when props haven't changed</li>
          <li><strong>useMemo:</strong> Stabilizes object/array references</li>
          <li><strong>useCallback:</strong> Stabilizes function references</li>
          <li><strong>Dependency arrays:</strong> Control when memoization updates</li>
        </ul>
      </div>
    </div>
  );
}
```

## 🎯 Dependency Array Best Practices

### Dependency Array Patterns

```jsx
function DependencyArrayDemo() {
  const [user, setUser] = useState({ name: 'John', age: 30, email: 'john@example.com' });
  const [settings, setSettings] = useState({ theme: 'light', notifications: true });
  const [items, setItems] = useState([1, 2, 3, 4, 5]);
  const [filter, setFilter] = useState('');
  
  // 🎯 Primitive dependencies
  const userDisplayName = useMemo(() => {
    console.log('Computing user display name');
    return `${user.name} (${user.age} years old)`;
  }, [user.name, user.age]); // ✅ Only specific properties
  
  // ❌ WRONG: Entire object as dependency
  const wrongUserDisplay = useMemo(() => {
    console.log('Computing wrong user display (will run too often)');
    return `${user.name} (${user.age} years old)`;
  }, [user]); // ❌ Runs when ANY user property changes
  
  // 🎯 Array length as dependency
  const itemsInfo = useMemo(() => {
    console.log('Computing items info');
    return {
      count: items.length,
      isEmpty: items.length === 0,
      hasMany: items.length > 10
    };
  }, [items.length]); // ✅ Only when length changes
  
  // 🎯 Computed dependencies
  const hasNotifications = settings.notifications;
  const isDarkTheme = settings.theme === 'dark';
  
  const uiConfig = useMemo(() => {
    console.log('Computing UI config');
    return {
      showNotificationBadge: hasNotifications,
      darkMode: isDarkTheme,
      className: `theme-${settings.theme} ${hasNotifications ? 'with-notifications' : ''}`,
      styles: {
        backgroundColor: isDarkTheme ? '#333' : '#fff',
        color: isDarkTheme ? '#fff' : '#333'
      }
    };
  }, [hasNotifications, isDarkTheme, settings.theme]); // ✅ Specific computed values
  
  // 🎯 Complex filtering with multiple dependencies
  const filteredItems = useMemo(() => {
    console.log('Filtering items');
    
    if (!filter) return items;
    
    return items.filter(item => {
      const itemStr = item.toString();
      return itemStr.includes(filter);
    });
  }, [items, filter]); // ✅ Both items and filter
  
  // 🎯 Expensive calculation with conditional dependencies
  const expensiveCalculation = useMemo(() => {
    console.log('Performing expensive calculation');
    
    // Only calculate if we have items and user is adult
    if (items.length === 0 || user.age < 18) {
      return { result: 0, message: 'No calculation needed' };
    }
    
    let result = 0;
    for (let i = 0; i < items.length * 1000; i++) {
      result += Math.random() * user.age;
    }
    
    return {
      result: result.toFixed(2),
      message: `Calculated for ${items.length} items and age ${user.age}`
    };
  }, [items.length, user.age]); // ✅ Only the values we actually use
  
  // 🎯 Object with stable keys
  const stableObjectKeys = useMemo(() => Object.keys(user).sort(), [user]);
  
  const userMetadata = useMemo(() => {
    console.log('Computing user metadata');
    return {
      fieldCount: stableObjectKeys.length,
      hasEmail: stableObjectKeys.includes('email'),
      hasAge: stableObjectKeys.includes('age'),
      summary: `User has ${stableObjectKeys.length} fields: ${stableObjectKeys.join(', ')}`
    };
  }, [stableObjectKeys]); // ✅ Depends on stable key array
  
  // 🎯 Functions in dependencies (should be memoized)
  const processItem = useCallback((item) => {
    return {
      original: item,
      doubled: item * 2,
      userAgeMultiplied: item * user.age
    };
  }, [user.age]);
  
  const processedItems = useMemo(() => {
    console.log('Processing items with function');
    return filteredItems.map(processItem);
  }, [filteredItems, processItem]); // ✅ processItem is memoized
  
  const updateUser = (field, value) => {
    setUser(prev => ({ ...prev, [field]: value }));
  };
  
  const updateSettings = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };
  
  const addItem = () => {
    setItems(prev => [...prev, Math.max(...prev) + 1]);
  };
  
  const removeItem = () => {
    setItems(prev => prev.slice(0, -1));
  };
  
  return (
    <div className="dependency-array-demo">
      <h3>Dependency Array Best Practices</h3>
      
      <div className="controls">
        <div className="control-section">
          <h4>User Controls</h4>
          <div className="control-group">
            <label>Name:</label>
            <input 
              value={user.name} 
              onChange={(e) => updateUser('name', e.target.value)}
            />
          </div>
          <div className="control-group">
            <label>Age:</label>
            <input 
              type="number" 
              value={user.age} 
              onChange={(e) => updateUser('age', Number(e.target.value))}
            />
          </div>
          <div className="control-group">
            <label>Email:</label>
            <input 
              value={user.email} 
              onChange={(e) => updateUser('email', e.target.value)}
            />
          </div>
        </div>
        
        <div className="control-section">
          <h4>Settings Controls</h4>
          <div className="control-group">
            <label>Theme:</label>
            <select 
              value={settings.theme} 
              onChange={(e) => updateSettings('theme', e.target.value)}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <div className="control-group">
            <label>
              <input 
                type="checkbox" 
                checked={settings.notifications} 
                onChange={(e) => updateSettings('notifications', e.target.checked)}
              />
              Notifications
            </label>
          </div>
        </div>
        
        <div className="control-section">
          <h4>Items Controls</h4>
          <div className="control-group">
            <button onClick={addItem}>Add Item</button>
            <button onClick={removeItem}>Remove Item</button>
            <span>Items: [{items.join(', ')}]</span>
          </div>
          <div className="control-group">
            <label>Filter:</label>
            <input 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter items"
            />
          </div>
        </div>
      </div>
      
      <div className="results">
        <div className="result-section">
          <h4>User Display Names</h4>
          <p><strong>Optimized (name + age only):</strong> {userDisplayName}</p>
          <p><strong>Unoptimized (entire user object):</strong> {wrongUserDisplay}</p>
          <p><em>Check console - unoptimized version runs more often</em></p>
        </div>
        
        <div className="result-section">
          <h4>Items Information</h4>
          <pre>{JSON.stringify(itemsInfo, null, 2)}</pre>
        </div>
        
        <div className="result-section">
          <h4>UI Configuration</h4>
          <div 
            style={uiConfig.styles}
            className={uiConfig.className}
          >
            <p>Theme: {settings.theme}</p>
            <p>Notifications: {settings.notifications ? 'Enabled' : 'Disabled'}</p>
            <p>Dark mode: {uiConfig.darkMode ? 'Yes' : 'No'}</p>
          </div>
        </div>
        
        <div className="result-section">
          <h4>Filtered Items</h4>
          <p>Filter: "{filter}"</p>
          <p>Results: [{filteredItems.join(', ')}]</p>
        </div>
        
        <div className="result-section">
          <h4>Expensive Calculation</h4>
          <p>Result: {expensiveCalculation.result}</p>
          <p>Message: {expensiveCalculation.message}</p>
        </div>
        
        <div className="result-section">
          <h4>User Metadata</h4>
          <pre>{JSON.stringify(userMetadata, null, 2)}</pre>
        </div>
        
        <div className="result-section">
          <h4>Processed Items</h4>
          <div className="processed-items">
            {processedItems.map((item, index) => (
              <div key={index} className="processed-item">
                Original: {item.original}, Doubled: {item.doubled}, 
                Age Multiplied: {item.userAgeMultiplied}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="best-practices">
        <h4>Dependency Array Best Practices:</h4>
        <ul>
          <li><strong>✅ Use specific properties:</strong> [user.name, user.age] instead of [user]</li>
          <li><strong>✅ Use computed values:</strong> [items.length] instead of [items]</li>
          <li><strong>✅ Memoize functions:</strong> Use useCallback for function dependencies</li>
          <li><strong>✅ Stable references:</strong> Extract stable values outside useMemo</li>
          <li><strong>❌ Avoid objects/arrays:</strong> Unless you need the entire reference</li>
          <li><strong>❌ Don't omit dependencies:</strong> Include all values used inside</li>
        </ul>
      </div>
    </div>
  );
}
```

## ⚠️ Common Mistakes & Anti-Patterns

### 1. Premature Optimization

```jsx
// ❌ WRONG: Memoizing everything unnecessarily
function OverMemoizedComponent() {
  const [count, setCount] = useState(0);
  
  // ❌ Unnecessary - simple calculation
  const doubledCount = useMemo(() => count * 2, [count]);
  
  // ❌ Unnecessary - primitive value
  const isEven = useMemo(() => count % 2 === 0, [count]);
  
  // ❌ Unnecessary - simple string
  const message = useMemo(() => `Count is ${count}`, [count]);
  
  return (
    <div>
      <p>Count: {count}</p>
      <p>Doubled: {doubledCount}</p>
      <p>Is Even: {isEven ? 'Yes' : 'No'}</p>
      <p>{message}</p>
    </div>
  );
}

// ✅ CORRECT: Only memoize when necessary
function OptimallyMemoizedComponent() {
  const [count, setCount] = useState(0);
  
  // ✅ Simple calculations - no memo needed
  const doubledCount = count * 2;
  const isEven = count % 2 === 0;
  const message = `Count is ${count}`;
  
  // ✅ Only memoize expensive operations
  const expensiveCalculation = useMemo(() => {
    let result = 0;
    for (let i = 0; i < count * 100000; i++) {
      result += Math.random();
    }
    return result;
  }, [count]);
  
  return (
    <div>
      <p>Count: {count}</p>
      <p>Doubled: {doubledCount}</p>
      <p>Is Even: {isEven ? 'Yes' : 'No'}</p>
      <p>{message}</p>
      <p>Expensive: {expensiveCalculation.toFixed(2)}</p>
    </div>
  );
}
```

### 2. Missing Dependencies

```jsx
// ❌ WRONG: Missing dependencies
function MissingDependenciesExample() {
  const [count, setCount] = useState(0);
  const [multiplier, setMultiplier] = useState(2);
  
  // ❌ Missing 'multiplier' in dependencies
  const calculation = useMemo(() => {
    return count * multiplier; // Uses multiplier but not in deps
  }, [count]); // ❌ Stale closure!
  
  return (
    <div>
      <p>Count: {count}</p>
      <p>Multiplier: {multiplier}</p>
      <p>Result: {calculation}</p>
    </div>
  );
}

// ✅ CORRECT: All dependencies included
function CorrectDependenciesExample() {
  const [count, setCount] = useState(0);
  const [multiplier, setMultiplier] = useState(2);
  
  // ✅ All dependencies included
  const calculation = useMemo(() => {
    return count * multiplier;
  }, [count, multiplier]); // ✅ Complete dependency array
  
  return (
    <div>
      <p>Count: {count}</p>
      <p>Multiplier: {multiplier}</p>
      <p>Result: {calculation}</p>
    </div>
  );
}
```

### 3. Object/Array Dependencies

```jsx
// ❌ WRONG: Using entire objects as dependencies
function WrongObjectDependencies() {
  const [user, setUser] = useState({ name: 'John', age: 30, email: 'john@example.com' });
  
  // ❌ Will run whenever ANY user property changes
  const userDisplayName = useMemo(() => {
    return `${user.name} (${user.age})`; // Only uses name and age
  }, [user]); // ❌ Depends on entire user object
  
  return <p>{userDisplayName}</p>;
}

// ✅ CORRECT: Use specific properties
function CorrectObjectDependencies() {
  const [user, setUser] = useState({ name: 'John', age: 30, email: 'john@example.com' });
  
  // ✅ Only runs when name or age changes
  const userDisplayName = useMemo(() => {
    return `${user.name} (${user.age})`;
  }, [user.name, user.age]); // ✅ Only specific properties
  
  return <p>{userDisplayName}</p>;
}
```

### 4. Expensive Dependency Calculations

```jsx
// ❌ WRONG: Expensive calculations in dependency array
function ExpensiveDependencyCalculation() {
  const [items, setItems] = useState([1, 2, 3, 4, 5]);
  
  // ❌ Expensive operation in dependency array
  const processedItems = useMemo(() => {
    return items.map(item => item * 2);
  }, [items.map(item => item.toString())]); // ❌ Creates new array every render!
  
  return (
    <div>
      {processedItems.map(item => <div key={item}>{item}</div>)}
    </div>
  );
}

// ✅ CORRECT: Simple dependencies
function SimpleDependencyCalculation() {
  const [items, setItems] = useState([1, 2, 3, 4, 5]);
  
  // ✅ Simple dependency
  const processedItems = useMemo(() => {
    return items.map(item => ({
      original: item,
      doubled: item * 2,
      stringified: item.toString()
    }));
  }, [items]); // ✅ Simple array reference
  
  return (
    <div>
      {processedItems.map(item => (
        <div key={item.original}>
          {item.original} → {item.doubled} ({item.stringified})
        </div>
      ))}
    </div>
  );
}
```

## 🧪 Mini Challenges

### Challenge 1: Data Dashboard Optimization

Build a data dashboard that:
- Processes large datasets efficiently
- Calculates multiple statistics
- Filters and sorts data
- Only recalculates when necessary

<details>
<summary>💡 Solution</summary>

```jsx
function DataDashboard() {
  const [rawData] = useState(
    Array.from({ length: 50000 }, (_, i) => ({
      id: i,
      value: Math.random() * 1000,
      category: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
      date: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      status: ['active', 'inactive', 'pending'][Math.floor(Math.random() * 3)]
    }))
  );
  
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    minValue: 0,
    maxValue: 1000,
    dateRange: 'all'
  });
  
  const [sortConfig, setSortConfig] = useState({ field: 'id', direction: 'asc' });
  
  // 🎯 Filtered data
  const filteredData = useMemo(() => {
    console.time('Data filtering');
    
    let result = rawData;
    
    if (filters.category !== 'all') {
      result = result.filter(item => item.category === filters.category);
    }
    
    if (filters.status !== 'all') {
      result = result.filter(item => item.status === filters.status);
    }
    
    result = result.filter(item => 
      item.value >= filters.minValue && item.value <= filters.maxValue
    );
    
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      
      switch (filters.dateRange) {
        case 'last30':
          cutoff.setDate(now.getDate() - 30);
          break;
        case 'last90':
          cutoff.setDate(now.getDate() - 90);
          break;
        case 'thisYear':
          cutoff.setFullYear(now.getFullYear(), 0, 1);
          break;
      }
      
      result = result.filter(item => item.date >= cutoff);
    }
    
    console.timeEnd('Data filtering');
    return result;
  }, [rawData, filters]);
  
  // 🎯 Sorted data
  const sortedData = useMemo(() => {
    console.time('Data sorting');
    
    const result = [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.field];
      const bVal = b[sortConfig.field];
      
      let comparison = 0;
      if (aVal > bVal) comparison = 1;
      if (aVal < bVal) comparison = -1;
      
      return sortConfig.direction === 'desc' ? -comparison : comparison;
    });
    
    console.timeEnd('Data sorting');
    return result;
  }, [filteredData, sortConfig]);
  
  // 🎯 Statistics
  const statistics = useMemo(() => {
    console.time('Statistics calculation');
    
    if (filteredData.length === 0) {
      return {
        count: 0,
        sum: 0,
        average: 0,
        min: 0,
        max: 0,
        median: 0,
        categoryBreakdown: {},
        statusBreakdown: {}
      };
    }
    
    const values = filteredData.map(item => item.value);
    const sum = values.reduce((acc, val) => acc + val, 0);
    const sortedValues = [...values].sort((a, b) => a - b);
    const median = sortedValues.length % 2 === 0
      ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2
      : sortedValues[Math.floor(sortedValues.length / 2)];
    
    const categoryBreakdown = filteredData.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});
    
    const statusBreakdown = filteredData.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});
    
    console.timeEnd('Statistics calculation');
    
    return {
      count: filteredData.length,
      sum: sum.toFixed(2),
      average: (sum / filteredData.length).toFixed(2),
      min: Math.min(...values).toFixed(2),
      max: Math.max(...values).toFixed(2),
      median: median.toFixed(2),
      categoryBreakdown,
      statusBreakdown
    };
  }, [filteredData]);
  
  // 🎯 Chart data
  const chartData = useMemo(() => {
    console.time('Chart data preparation');
    
    const categoryData = Object.entries(statistics.categoryBreakdown).map(([category, count]) => ({
      category,
      count,
      percentage: ((count / statistics.count) * 100).toFixed(1)
    }));
    
    const statusData = Object.entries(statistics.statusBreakdown).map(([status, count]) => ({
      status,
      count,
      percentage: ((count / statistics.count) * 100).toFixed(1)
    }));
    
    console.timeEnd('Chart data preparation');
    
    return { categoryData, statusData };
  }, [statistics]);
  
  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const updateSort = (field) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  return (
    <div className="data-dashboard">
      <h3>Optimized Data Dashboard</h3>
      
      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <label>Category:</label>
          <select value={filters.category} onChange={(e) => updateFilter('category', e.target.value)}>
            <option value="all">All</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Status:</label>
          <select value={filters.status} onChange={(e) => updateFilter('status', e.target.value)}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Value Range:</label>
          <input
            type="range"
            min="0"
            max="1000"
            value={filters.minValue}
            onChange={(e) => updateFilter('minValue', Number(e.target.value))}
          />
          <span>{filters.minValue} - {filters.maxValue}</span>
          <input
            type="range"
            min="0"
            max="1000"
            value={filters.maxValue}
            onChange={(e) => updateFilter('maxValue', Number(e.target.value))}
          />
        </div>
      </div>
      
      {/* Statistics */}
      <div className="statistics">
        <h4>Statistics</h4>
        <div className="stats-grid">
          <div className="stat">Count: {statistics.count}</div>
          <div className="stat">Sum: {statistics.sum}</div>
          <div className="stat">Average: {statistics.average}</div>
          <div className="stat">Min: {statistics.min}</div>
          <div className="stat">Max: {statistics.max}</div>
          <div className="stat">Median: {statistics.median}</div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="charts">
        <div className="chart">
          <h5>Category Breakdown</h5>
          {chartData.categoryData.map(item => (
            <div key={item.category} className="chart-bar">
              {item.category}: {item.count} ({item.percentage}%)
            </div>
          ))}
        </div>
        
        <div className="chart">
          <h5>Status Breakdown</h5>
          {chartData.statusData.map(item => (
            <div key={item.status} className="chart-bar">
              {item.status}: {item.count} ({item.percentage}%)
            </div>
          ))}
        </div>
      </div>
      
      {/* Data Table */}
      <div className="data-table">
        <h4>Data (First 100 rows)</h4>
        <table>
          <thead>
            <tr>
              <th onClick={() => updateSort('id')}>ID</th>
              <th onClick={() => updateSort('value')}>Value</th>
              <th onClick={() => updateSort('category')}>Category</th>
              <th onClick={() => updateSort('status')}>Status</th>
              <th onClick={() => updateSort('date')}>Date</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.slice(0, 100).map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.value.toFixed(2)}</td>
                <td>{item.category}</td>
                <td>{item.status}</td>
                <td>{item.date.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

</details>

### Challenge 2: Smart Shopping Cart

Create a shopping cart that:
- Calculates totals, taxes, and discounts efficiently
- Handles complex pricing rules
- Updates only when necessary
- Provides real-time validation

<details>
<summary>💡 Solution</summary>

```jsx
function SmartShoppingCart() {
  const [items, setItems] = useState([
    { id: 1, name: 'Laptop', price: 999.99, quantity: 1, category: 'electronics', taxable: true },
    { id: 2, name: 'Book', price: 29.99, quantity: 2, category: 'books', taxable: false },
    { id: 3, name: 'Headphones', price: 199.99, quantity: 1, category: 'electronics', taxable: true }
  ]);
  
  const [discountCode, setDiscountCode] = useState('');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [customerType, setCustomerType] = useState('regular');
  
  // 🎯 Discount rules
  const discountRules = useMemo(() => ({
    'SAVE10': { type: 'percentage', value: 0.1, minAmount: 50 },
    'ELECTRONICS20': { type: 'percentage', value: 0.2, category: 'electronics' },
    'FREESHIP': { type: 'shipping', value: 0 },
    'STUDENT15': { type: 'percentage', value: 0.15, customerType: 'student' }
  }), []);
  
  // 🎯 Shipping rates
  const shippingRates = useMemo(() => ({
    'standard': 9.99,
    'express': 19.99,
    'overnight': 39.99,
    'free': 0
  }), []);
  
  // 🎯 Tax rates by category
  const taxRates = useMemo(() => ({
    'electronics': 0.08,
    'books': 0,
    'clothing': 0.06,
    'food': 0.03
  }), []);
  
  // 🎯 Calculate subtotal
  const subtotal = useMemo(() => {
    console.log('Calculating subtotal');
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [items]);
  
  // 🎯 Calculate item-level discounts
  const itemDiscounts = useMemo(() => {
    console.log('Calculating item discounts');
    
    const discount = discountRules[discountCode];
    if (!discount) return {};
    
    const discounts = {};
    
    items.forEach(item => {
      let itemDiscount = 0;
      
      if (discount.type === 'percentage') {
        // Category-specific discount
        if (discount.category && item.category === discount.category) {
          itemDiscount = item.price * item.quantity * discount.value;
        }
        // Customer type discount
        else if (discount.customerType && customerType === discount.customerType) {
          itemDiscount = item.price * item.quantity * discount.value;
        }
        // General percentage discount
        else if (!discount.category && !discount.customerType) {
          itemDiscount = item.price * item.quantity * discount.value;
        }
      }
      
      if (itemDiscount > 0) {
        discounts[item.id] = itemDiscount;
      }
    });
    
    return discounts;
  }, [items, discountCode, customerType, discountRules]);
  
  // 🎯 Calculate total discount
  const totalDiscount = useMemo(() => {
    console.log('Calculating total discount');
    
    const itemDiscountTotal = Object.values(itemDiscounts).reduce((sum, discount) => sum + discount, 0);
    const discount = discountRules[discountCode];
    
    // Check minimum amount requirement
    if (discount && discount.minAmount && subtotal < discount.minAmount) {
      return 0;
    }
    
    return itemDiscountTotal;
  }, [itemDiscounts, discountRules, discountCode, subtotal]);
  
  // 🎯 Calculate taxes
  const taxes = useMemo(() => {
    console.log('Calculating taxes');
    
    const discountedSubtotal = subtotal - totalDiscount;
    
    return items.reduce((totalTax, item) => {
      if (!item.taxable) return totalTax;
      
      const taxRate = taxRates[item.category] || 0;
      const itemTotal = item.price * item.quantity;
      const itemDiscountRatio = (itemDiscounts[item.id] || 0) / itemTotal;
      const discountedItemTotal = itemTotal * (1 - itemDiscountRatio);
      
      return totalTax + (discountedItemTotal * taxRate);
    }, 0);
  }, [items, subtotal, totalDiscount, itemDiscounts, taxRates]);
  
  // 🎯 Calculate shipping
  const shipping = useMemo(() => {
    console.log('Calculating shipping');
    
    const discount = discountRules[discountCode];
    if (discount && discount.type === 'shipping') {
      return discount.value;
    }
    
    // Free shipping for orders over $100
    if (subtotal - totalDiscount > 100) {
      return 0;
    }
    
    return shippingRates[shippingMethod] || 0;
  }, [discountCode, discountRules, subtotal, totalDiscount, shippingMethod, shippingRates]);
  
  // 🎯 Calculate final total
  const total = useMemo(() => {
    console.log('Calculating final total');
    return subtotal - totalDiscount + taxes + shipping;
  }, [subtotal, totalDiscount, taxes, shipping]);
  
  // 🎯 Validation messages
  const validationMessages = useMemo(() => {
    console.log('Calculating validation messages');
    
    const messages = [];
    const discount = discountRules[discountCode];
    
    if (discountCode && !discount) {
      messages.push({ type: 'error', text: 'Invalid discount code' });
    }
    
    if (discount && discount.minAmount && subtotal < discount.minAmount) {
      messages.push({
        type: 'warning',
        text: `Add $${(discount.minAmount - subtotal).toFixed(2)} more to qualify for discount`
      });
    }
    
    if (discount && discount.customerType && customerType !== discount.customerType) {
      messages.push({
        type: 'error',
        text: `This discount is only for ${discount.customerType} customers`
      });
    }
    
    if (subtotal - totalDiscount > 100 && shipping > 0) {
      messages.push({
        type: 'info',
        text: 'You qualify for free shipping!'
      });
    }
    
    return messages;
  }, [discountCode, discountRules, subtotal, totalDiscount, customerType, shipping]);
  
  const updateQuantity = (id, quantity) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.max(0, quantity) } : item
    ));
  };
  
  const removeItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };
  
  return (
    <div className="smart-shopping-cart">
      <h3>Smart Shopping Cart</h3>
      
      {/* Controls */}
      <div className="controls">
        <div className="control-group">
          <label>Customer Type:</label>
          <select value={customerType} onChange={(e) => setCustomerType(e.target.value)}>
            <option value="regular">Regular</option>
            <option value="student">Student</option>
            <option value="premium">Premium</option>
          </select>
        </div>
        
        <div className="control-group">
          <label>Discount Code:</label>
          <input
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
            placeholder="Enter discount code"
          />
        </div>
        
        <div className="control-group">
          <label>Shipping:</label>
          <select value={shippingMethod} onChange={(e) => setShippingMethod(e.target.value)}>
            <option value="standard">Standard ($9.99)</option>
            <option value="express">Express ($19.99)</option>
            <option value="overnight">Overnight ($39.99)</option>
          </select>
        </div>
      </div>
      
      {/* Validation Messages */}
      {validationMessages.length > 0 && (
        <div className="validation-messages">
          {validationMessages.map((message, index) => (
            <div key={index} className={`message ${message.type}`}>
              {message.text}
            </div>
          ))}
        </div>
      )}
      
      {/* Cart Items */}
      <div className="cart-items">
        <h4>Cart Items</h4>
        {items.map(item => (
          <div key={item.id} className="cart-item">
            <div className="item-info">
              <h5>{item.name}</h5>
              <p>Category: {item.category}</p>
              <p>Price: ${item.price}</p>
              <p>Taxable: {item.taxable ? 'Yes' : 'No'}</p>
            </div>
            
            <div className="item-controls">
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
              <span>Qty: {item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
              <button onClick={() => removeItem(item.id)}>Remove</button>
            </div>
            
            <div className="item-totals">
              <p>Subtotal: ${(item.price * item.quantity).toFixed(2)}</p>
              {itemDiscounts[item.id] && (
                <p>Discount: -${itemDiscounts[item.id].toFixed(2)}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Cart Summary */}
      <div className="cart-summary">
        <h4>Order Summary</h4>
        <div className="summary-line">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        {totalDiscount > 0 && (
          <div className="summary-line discount">
            <span>Discount ({discountCode}):</span>
            <span>-${totalDiscount.toFixed(2)}</span>
          </div>
        )}
        <div className="summary-line">
          <span>Taxes:</span>
          <span>${taxes.toFixed(2)}</span>
        </div>
        <div className="summary-line">
          <span>Shipping:</span>
          <span>${shipping.toFixed(2)}</span>
        </div>
        <div className="summary-line total">
          <span><strong>Total:</strong></span>
          <span><strong>${total.toFixed(2)}</strong></span>
        </div>
      </div>
    </div>
  );
}
```

</details>

## 📊 Performance Measurement

### Measuring useMemo Impact

```jsx
function PerformanceMeasurement() {
  const [dataSize, setDataSize] = useState(10000);
  const [useOptimization, setUseOptimization] = useState(true);
  const [triggerUpdate, setTriggerUpdate] = useState(0);
  
  // Generate test data
  const testData = useMemo(() => {
    console.log('Generating test data');
    return Array.from({ length: dataSize }, (_, i) => ({
      id: i,
      value: Math.random() * 100,
      category: ['A', 'B', 'C'][Math.floor(Math.random() * 3)]
    }));
  }, [dataSize]);
  
  // 🎯 Performance timing hook
  const usePerformanceTimer = (label) => {
    const startTimeRef = useRef(null);
    const [duration, setDuration] = useState(0);
    
    const start = useCallback(() => {
      startTimeRef.current = performance.now();
    }, []);
    
    const end = useCallback(() => {
      if (startTimeRef.current) {
        const duration = performance.now() - startTimeRef.current;
        setDuration(duration);
        console.log(`${label}: ${duration.toFixed(2)}ms`);
      }
    }, [label]);
    
    return { start, end, duration };
  };
  
  const optimizedTimer = usePerformanceTimer('Optimized calculation');
  const unoptimizedTimer = usePerformanceTimer('Unoptimized calculation');
  
  // 🎯 Expensive calculation with optimization
  const optimizedResult = useMemo(() => {
    if (!useOptimization) return null;
    
    optimizedTimer.start();
    
    const result = testData.reduce((acc, item) => {
      acc.total += item.value;
      acc.count += 1;
      acc.categories[item.category] = (acc.categories[item.category] || 0) + 1;
      
      if (item.value > acc.max) acc.max = item.value;
      if (item.value < acc.min) acc.min = item.value;
      
      return acc;
    }, {
      total: 0,
      count: 0,
      categories: {},
      max: -Infinity,
      min: Infinity
    });
    
    result.average = result.total / result.count;
    
    optimizedTimer.end();
    return result;
  }, [testData, useOptimization, optimizedTimer]);
  
  // 🎯 Expensive calculation without optimization
  const calculateUnoptimized = () => {
    if (useOptimization) return null;
    
    unoptimizedTimer.start();
    
    const result = testData.reduce((acc, item) => {
      acc.total += item.value;
      acc.count += 1;
      acc.categories[item.category] = (acc.categories[item.category] || 0) + 1;
      
      if (item.value > acc.max) acc.max = item.value;
      if (item.value < acc.min) acc.min = item.value;
      
      return acc;
    }, {
      total: 0,
      count: 0,
      categories: {},
      max: -Infinity,
      min: Infinity
    });
    
    result.average = result.total / result.count;
    
    unoptimizedTimer.end();
    return result;
  };
  
  const unoptimizedResult = !useOptimization ? calculateUnoptimized() : null;
  const currentResult = useOptimization ? optimizedResult : unoptimizedResult;
  
  const renderCount = useRef(0);
  renderCount.current += 1;
  
  return (
    <div className="performance-measurement">
      <h3>Performance Measurement Demo</h3>
      
      <div className="controls">
        <div className="control-group">
          <label>Data Size:</label>
          <select value={dataSize} onChange={(e) => setDataSize(Number(e.target.value))}>
            <option value={1000}>1,000 items</option>
            <option value={10000}>10,000 items</option>
            <option value={50000}>50,000 items</option>
            <option value={100000}>100,000 items</option>
          </select>
        </div>
        
        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={useOptimization}
              onChange={(e) => setUseOptimization(e.target.checked)}
            />
            Use useMemo Optimization
          </label>
        </div>
        
        <div className="control-group">
          <button onClick={() => setTriggerUpdate(prev => prev + 1)}>
            Force Re-render (Trigger: {triggerUpdate})
          </button>
        </div>
      </div>
      
      <div className="performance-stats">
        <h4>Performance Statistics</h4>
        <div className="stats-grid">
          <div className="stat">
            <strong>Render Count:</strong> {renderCount.current}
          </div>
          <div className="stat">
            <strong>Data Size:</strong> {dataSize.toLocaleString()} items
          </div>
          <div className="stat">
            <strong>Optimization:</strong> {useOptimization ? 'Enabled' : 'Disabled'}
          </div>
          <div className="stat">
            <strong>Last Calculation Time:</strong> 
            {useOptimization 
              ? `${optimizedTimer.duration.toFixed(2)}ms` 
              : `${unoptimizedTimer.duration.toFixed(2)}ms`
            }
          </div>
        </div>
      </div>
      
      {currentResult && (
        <div className="calculation-results">
          <h4>Calculation Results</h4>
          <div className="results-grid">
            <div className="result">
              <strong>Total:</strong> {currentResult.total.toFixed(2)}
            </div>
            <div className="result">
              <strong>Count:</strong> {currentResult.count}
            </div>
            <div className="result">
              <strong>Average:</strong> {currentResult.average.toFixed(2)}
            </div>
            <div className="result">
              <strong>Min:</strong> {currentResult.min.toFixed(2)}
            </div>
            <div className="result">
              <strong>Max:</strong> {currentResult.max.toFixed(2)}
            </div>
          </div>
          
          <div className="category-breakdown">
            <h5>Category Breakdown:</h5>
            {Object.entries(currentResult.categories).map(([category, count]) => (
              <div key={category} className="category-stat">
                {category}: {count} items
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="performance-notes">
        <h4>Performance Notes:</h4>
        <ul>
          <li><strong>With useMemo:</strong> Calculation only runs when data changes</li>
          <li><strong>Without useMemo:</strong> Calculation runs on every render</li>
          <li><strong>Force re-render:</strong> Test how optimization affects performance</li>
          <li><strong>Data size:</strong> Larger datasets show bigger performance differences</li>
        </ul>
      </div>
    </div>
  );
}
```

## 🎯 When and Why: useMemo Decision Framework

### Quick Decision Tree

```
🤔 Should I use useMemo?

├── Is this an expensive calculation?
│   ├── Yes → Continue evaluation...
│   └── No → Don't use useMemo ❌
│
├── Does the calculation run on every render?
│   ├── Yes → Continue evaluation...
│   └── No → Don't use useMemo ❌
│
├── Do the inputs change frequently?
│   ├── Yes → useMemo might not help ⚠️
│   └── No → Continue evaluation...
│
├── Is this for reference stability?
│   ├── Yes → Use useMemo ✅
│   └── No → Continue evaluation...
│
├── Is this preventing child re-renders?
│   ├── Yes → Use useMemo ✅
│   └── No → Continue evaluation...
│
└── Is the calculation actually expensive?
    ├── Yes → Use useMemo ✅
    └── No → Don't use useMemo ❌
```

### Performance Guidelines

```jsx
// 🎯 When TO use useMemo:

// ✅ Expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// ✅ Object/array reference stability
const stableConfig = useMemo(() => ({
  theme: 'dark',
  features: ['a', 'b', 'c']
}), []);

// ✅ Preventing child re-renders
const memoizedProps = useMemo(() => ({
  data: processedData,
  config: settings
}), [processedData, settings]);

// ✅ Complex filtering/sorting
const filteredData = useMemo(() => {
  return data.filter(item => item.active).sort((a, b) => a.name.localeCompare(b.name));
}, [data]);

// 🎯 When NOT to use useMemo:

// ❌ Simple calculations
const doubled = count * 2; // Don't memo

// ❌ Primitive values
const isEven = count % 2 === 0; // Don't memo

// ❌ Always changing dependencies
const timestamp = useMemo(() => Date.now(), [Date.now()]); // Useless

// ❌ More expensive than the calculation
const simple = useMemo(() => a + b, [a, b]); // Overhead > benefit
```

## 🎤 Interview Insights

### Common Interview Questions

1. **"When would you use useMemo?"**
   - Expensive calculations that don't need to run on every render
   - Object/array reference stability for child components
   - Complex data transformations (filtering, sorting, grouping)
   - Preventing unnecessary re-renders in React.memo components

2. **"What's the difference between useMemo and useCallback?"**
   - useMemo: Memoizes the result of a calculation
   - useCallback: Memoizes the function itself
   - Both prevent unnecessary re-computations
   - Show examples of when to use each

3. **"How do you measure if useMemo is actually helping?"**
   - Use React DevTools Profiler
   - Console.time() for manual timing
   - Performance.now() for precise measurements
   - Compare render times with/without memoization

4. **"What are the downsides of useMemo?"**
   - Memory overhead (storing cached values)
   - Comparison overhead (checking dependencies)
   - Can make code more complex
   - Premature optimization can hurt performance

### Code Review Red Flags

```jsx
// 🚨 Red Flags in Interviews:

// ❌ Memoizing everything
const simple = useMemo(() => a + b, [a, b]);

// ❌ Missing dependencies
const calc = useMemo(() => a * b * c, [a, b]); // Missing 'c'

// ❌ Expensive dependencies
const result = useMemo(() => process(data), [data.map(x => x.id)]);

// ❌ Object dependencies
const result = useMemo(() => process(user.name), [user]); // Use user.name

// ❌ Always changing dependencies
const result = useMemo(() => calculate(), [Math.random()]);
```

## 🎯 Key Takeaways

### Mental Model

```jsx
// 🧠 Think of useMemo as:

// "A cache that stores the result of expensive calculations
//  and only recalculates when dependencies change"

const memoizedValue = useMemo(() => {
  // This only runs when dependencies change
  return expensiveCalculation(dependencies);
}, [dependencies]);
```

### Best Practices Summary

1. **Profile first** - Measure before optimizing
2. **Use for expensive operations** - Not simple calculations
3. **Stabilize references** - For objects/arrays passed to children
4. **Specific dependencies** - Use primitive values when possible
5. **Don't over-memoize** - It has overhead too
6. **Consider alternatives** - Sometimes restructuring is better
7. **Test performance impact** - Verify it actually helps

### Production Tips

- **Start without useMemo** - Add only when needed
- **Use React DevTools Profiler** - Identify actual bottlenecks
- **Consider component splitting** - Sometimes better than memoization
- **Watch bundle size** - Don't memoize everything
- **Document expensive operations** - Help future developers understand

---

**Next up**: [useCallback: Function Memoization](./10-useCallback-function-memoization.md) - Master function memoization and prevent unnecessary re-renders.

**Previous**: [useRef: Refs vs Variables](./08-useRef-refs-vs-variables.md)

---

*💡 Pro tip: In interviews, always explain the trade-offs. Show that you understand useMemo has overhead and should only be used when the benefits outweigh the costs. Demonstrate performance measurement techniques.*