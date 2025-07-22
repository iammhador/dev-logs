# Chapter 19: Modern JavaScript Frameworks 🚀

## 📚 Table of Contents
- [Framework Overview](#framework-overview)
- [React Fundamentals](#react-fundamentals)
- [Vue.js Essentials](#vuejs-essentials)
- [Angular Basics](#angular-basics)
- [State Management](#state-management)
- [Component Architecture](#component-architecture)
- [Routing & Navigation](#routing--navigation)
- [Performance Optimization](#performance-optimization)
- [Common Pitfalls](#common-pitfalls)
- [Practice Problems](#practice-problems)
- [Interview Notes](#interview-notes)

---

## 🎯 Framework Overview

### Why Use Frameworks?
```

---

## 🧭 Routing & Navigation

### React Router
```javascript
// App.js with React Router
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from './contexts/UserContext';

// Protected Route Component
function ProtectedRoute({ children }) {
    const { user, loading } = useContext(UserContext);
    
    if (loading) {
        return <div>Loading...</div>;
    }
    
    return user ? children : <Navigate to="/login" replace />;
}

// Layout with Navigation
function Layout({ children }) {
    const { user, logout } = useContext(UserContext);
    
    return (
        <div className="app-layout">
            <nav className="navbar">
                <Link to="/" className="nav-brand">MyApp</Link>
                <div className="nav-links">
                    {user ? (
                        <>
                            <Link to="/dashboard">Dashboard</Link>
                            <Link to="/profile">Profile</Link>
                            <button onClick={logout}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">Login</Link>
                            <Link to="/register">Register</Link>
                        </>
                    )}
                </div>
            </nav>
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}

function App() {
    return (
        <UserProvider>
            <Router>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route 
                            path="/dashboard" 
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/profile" 
                            element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            } 
                        />
                        <Route path="/users/:id" element={<UserDetail />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Layout>
            </Router>
        </UserProvider>
    );
}

// Component with URL parameters and navigation
function UserDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        fetchUser(id);
    }, [id]);
    
    const fetchUser = async (userId) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/users/${userId}`);
            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            } else {
                navigate('/404', { replace: true });
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            navigate('/error', { state: { error: error.message } });
        } finally {
            setLoading(false);
        }
    };
    
    const handleEdit = () => {
        navigate(`/users/${id}/edit`, {
            state: { from: location.pathname }
        });
    };
    
    if (loading) return <div>Loading user...</div>;
    if (!user) return <div>User not found</div>;
    
    return (
        <div className="user-detail">
            <button onClick={() => navigate(-1)}>← Back</button>
            <h1>{user.name}</h1>
            <p>{user.email}</p>
            <button onClick={handleEdit}>Edit User</button>
        </div>
    );
}
```

### Vue Router
```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../stores/user';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('../views/Home.vue')
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/Login.vue'),
        meta: { requiresGuest: true }
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/users/:id',
        name: 'UserDetail',
        component: () => import('../views/UserDetail.vue'),
        props: true,
        meta: { requiresAuth: true }
    },
    {
        path: '/users/:id/edit',
        name: 'UserEdit',
        component: () => import('../views/UserEdit.vue'),
        props: true,
        meta: { requiresAuth: true }
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('../views/NotFound.vue')
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// Navigation guards
router.beforeEach((to, from, next) => {
    const userStore = useUserStore();
    
    if (to.meta.requiresAuth && !userStore.isAuthenticated) {
        next({ name: 'Login', query: { redirect: to.fullPath } });
    } else if (to.meta.requiresGuest && userStore.isAuthenticated) {
        next({ name: 'Dashboard' });
    } else {
        next();
    }
});

export default router;

// UserDetail.vue
<template>
    <div class="user-detail">
        <button @click="$router.go(-1)">← Back</button>
        
        <div v-if="loading">Loading user...</div>
        <div v-else-if="error">Error: {{ error }}</div>
        <div v-else-if="user">
            <h1>{{ user.name }}</h1>
            <p>{{ user.email }}</p>
            <router-link :to="`/users/${user.id}/edit`" class="btn">
                Edit User
            </router-link>
        </div>
    </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export default {
    name: 'UserDetail',
    props: {
        id: {
            type: String,
            required: true
        }
    },
    setup(props) {
        const route = useRoute();
        const router = useRouter();
        const user = ref(null);
        const loading = ref(false);
        const error = ref(null);
        
        const fetchUser = async (userId) => {
            try {
                loading.value = true;
                error.value = null;
                const response = await fetch(`/api/users/${userId}`);
                if (response.ok) {
                    user.value = await response.json();
                } else {
                    throw new Error('User not found');
                }
            } catch (err) {
                error.value = err.message;
            } finally {
                loading.value = false;
            }
        };
        
        // Watch for route parameter changes
        watch(() => props.id, (newId) => {
            if (newId) {
                fetchUser(newId);
            }
        }, { immediate: true });
        
        return {
            user,
            loading,
            error
        };
    }
};
</script>
```

### Angular Routing
```typescript
// app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { GuestGuard } from './guards/guest.guard';

const routes: Routes = [
    { path: '', component: HomeComponent },
    { 
        path: 'login', 
        component: LoginComponent,
        canActivate: [GuestGuard]
    },
    { 
        path: 'dashboard', 
        component: DashboardComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'users/:id',
        component: UserDetailComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'users/:id/edit',
        component: UserEditComponent,
        canActivate: [AuthGuard]
    },
    { path: '**', component: NotFoundComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }

// auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(
        private userService: UserService,
        private router: Router
    ) {}
    
    canActivate(): boolean {
        if (this.userService.isAuthenticated()) {
            return true;
        } else {
            this.router.navigate(['/login']);
            return false;
        }
    }
}

// user-detail.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-user-detail',
    template: `
        <div class="user-detail">
            <button (click)="goBack()">← Back</button>
            
            <div *ngIf="loading">Loading user...</div>
            <div *ngIf="error">Error: {{ error }}</div>
            <div *ngIf="user">
                <h1>{{ user.name }}</h1>
                <p>{{ user.email }}</p>
                <button [routerLink]="['/users', user.id, 'edit']">
                    Edit User
                </button>
            </div>
        </div>
    `
})
export class UserDetailComponent implements OnInit, OnDestroy {
    user: any = null;
    loading = false;
    error: string | null = null;
    private destroy$ = new Subject<void>();
    
    constructor(
        private route: ActivatedRoute,
        private router: Router
    ) {}
    
    ngOnInit(): void {
        this.route.params
            .pipe(takeUntil(this.destroy$))
            .subscribe(params => {
                const userId = params['id'];
                if (userId) {
                    this.fetchUser(userId);
                }
            });
    }
    
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
    
    private async fetchUser(userId: string): Promise<void> {
        try {
            this.loading = true;
            this.error = null;
            const response = await fetch(`/api/users/${userId}`);
            if (response.ok) {
                this.user = await response.json();
            } else {
                throw new Error('User not found');
            }
        } catch (error) {
            this.error = error.message;
        } finally {
            this.loading = false;
        }
    }
    
    goBack(): void {
        window.history.back();
    }
}
```

---

## ⚡ Performance Optimization

### React Performance
```javascript
// 1. React.memo for component memoization
const UserCard = React.memo(function UserCard({ user, onEdit, onDelete }) {
    console.log('UserCard rendered for:', user.name);
    
    return (
        <div className="user-card">
            <img src={user.avatar} alt={user.name} />
            <h3>{user.name}</h3>
            <p>{user.email}</p>
            <div className="user-actions">
                <button onClick={() => onEdit(user.id)}>Edit</button>
                <button onClick={() => onDelete(user.id)}>Delete</button>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    // Custom comparison function
    return (
        prevProps.user.id === nextProps.user.id &&
        prevProps.user.name === nextProps.user.name &&
        prevProps.user.email === nextProps.user.email &&
        prevProps.user.avatar === nextProps.user.avatar
    );
});

// 2. useMemo and useCallback
function UserList({ users, searchTerm, sortBy }) {
    // Memoize expensive calculations
    const filteredAndSortedUsers = useMemo(() => {
        console.log('Filtering and sorting users');
        
        let filtered = users.filter(user => 
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        return filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'email':
                    return a.email.localeCompare(b.email);
                case 'date':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                default:
                    return 0;
            }
        });
    }, [users, searchTerm, sortBy]);
    
    // Memoize callback functions
    const handleEdit = useCallback((userId) => {
        console.log('Edit user:', userId);
        // Edit logic here
    }, []);
    
    const handleDelete = useCallback((userId) => {
        console.log('Delete user:', userId);
        // Delete logic here
    }, []);
    
    return (
        <div className="user-list">
            {filteredAndSortedUsers.map(user => (
                <UserCard
                    key={user.id}
                    user={user}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            ))}
        </div>
    );
}

// 3. Virtual scrolling for large lists
function VirtualizedUserList({ users }) {
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
    const containerRef = useRef(null);
    const itemHeight = 100;
    const containerHeight = 600;
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        
        const handleScroll = () => {
            const scrollTop = container.scrollTop;
            const start = Math.floor(scrollTop / itemHeight);
            const end = Math.min(start + visibleCount + 5, users.length);
            
            setVisibleRange({ start, end });
        };
        
        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [users.length, itemHeight, visibleCount]);
    
    const visibleUsers = users.slice(visibleRange.start, visibleRange.end);
    const totalHeight = users.length * itemHeight;
    const offsetY = visibleRange.start * itemHeight;
    
    return (
        <div 
            ref={containerRef}
            className="virtual-list-container"
            style={{ height: containerHeight, overflow: 'auto' }}
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
                    {visibleUsers.map((user, index) => (
                        <div 
                            key={user.id}
                            style={{ height: itemHeight }}
                            className="virtual-list-item"
                        >
                            <UserCard user={user} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// 4. Code splitting with React.lazy
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const UserProfile = React.lazy(() => import('./components/UserProfile'));
const Settings = React.lazy(() => import('./components/Settings'));

function App() {
    return (
        <Router>
            <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<UserProfile />} />
                    <Route path="/settings" element={<Settings />} />
                </Routes>
            </Suspense>
        </Router>
    );
}

// 5. Error boundaries
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    
    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        // Log to error reporting service
    }
    
    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <h2>Something went wrong</h2>
                    <p>{this.state.error?.message}</p>
                    <button onClick={() => this.setState({ hasError: false, error: null })}>
                        Try again
                    </button>
                </div>
            );
        }
        
        return this.props.children;
    }
}
```

### Vue Performance
```javascript
// 1. v-memo directive for expensive renders
<template>
    <div class="user-list">
        <div 
            v-for="user in users" 
            :key="user.id"
            v-memo="[user.id, user.name, user.email]"
            class="user-card"
        >
            <img :src="user.avatar" :alt="user.name" />
            <h3>{{ user.name }}</h3>
            <p>{{ user.email }}</p>
        </div>
    </div>
</template>

// 2. Computed properties for expensive operations
export default {
    setup() {
        const users = ref([]);
        const searchTerm = ref('');
        const sortBy = ref('name');
        
        // Computed property automatically memoizes
        const filteredUsers = computed(() => {
            console.log('Filtering users');
            return users.value.filter(user => 
                user.name.toLowerCase().includes(searchTerm.value.toLowerCase())
            );
        });
        
        const sortedUsers = computed(() => {
            console.log('Sorting users');
            return [...filteredUsers.value].sort((a, b) => {
                switch (sortBy.value) {
                    case 'name':
                        return a.name.localeCompare(b.name);
                    case 'email':
                        return a.email.localeCompare(b.email);
                    default:
                        return 0;
                }
            });
        });
        
        return {
            users,
            searchTerm,
            sortBy,
            sortedUsers
        };
    }
};

// 3. Async components
const AsyncDashboard = defineAsyncComponent({
    loader: () => import('./Dashboard.vue'),
    loadingComponent: LoadingSpinner,
    errorComponent: ErrorComponent,
    delay: 200,
    timeout: 3000
});

// 4. Virtual scrolling with vue-virtual-scroller
<template>
    <RecycleScroller
        class="scroller"
        :items="users"
        :item-size="100"
        key-field="id"
        v-slot="{ item }"
    >
        <UserCard :user="item" />
    </RecycleScroller>
</template>

<script>
import { RecycleScroller } from 'vue-virtual-scroller';
import UserCard from './UserCard.vue';

export default {
    components: {
        RecycleScroller,
        UserCard
    },
    props: {
        users: {
            type: Array,
            required: true
        }
    }
};
</script>
```

---

## ⚠️ Common Pitfalls

### React Pitfalls
```javascript
// ❌ BAD: Mutating state directly
function TodoList() {
    const [todos, setTodos] = useState([]);
    
    const addTodo = (text) => {
        // DON'T DO THIS - mutates state
        todos.push({ id: Date.now(), text });
        setTodos(todos);
    };
    
    const toggleTodo = (id) => {
        // DON'T DO THIS - mutates state
        const todo = todos.find(t => t.id === id);
        todo.completed = !todo.completed;
        setTodos(todos);
    };
}

// ✅ GOOD: Creating new state objects
function TodoList() {
    const [todos, setTodos] = useState([]);
    
    const addTodo = (text) => {
        setTodos(prevTodos => [
            ...prevTodos,
            { id: Date.now(), text, completed: false }
        ]);
    };
    
    const toggleTodo = (id) => {
        setTodos(prevTodos => 
            prevTodos.map(todo => 
                todo.id === id 
                    ? { ...todo, completed: !todo.completed }
                    : todo
            )
        );
    };
}

// ❌ BAD: Missing dependencies in useEffect
function UserProfile({ userId }) {
    const [user, setUser] = useState(null);
    
    useEffect(() => {
        fetchUser(userId).then(setUser);
    }, []); // Missing userId dependency!
}

// ✅ GOOD: Including all dependencies
function UserProfile({ userId }) {
    const [user, setUser] = useState(null);
    
    useEffect(() => {
        fetchUser(userId).then(setUser);
    }, [userId]); // Include userId dependency
}

// ❌ BAD: Creating objects/functions in render
function UserList({ users }) {
    return (
        <div>
            {users.map(user => (
                <UserCard
                    key={user.id}
                    user={user}
                    onEdit={() => editUser(user.id)} // New function every render
                    style={{ margin: 10 }} // New object every render
                />
            ))}
        </div>
    );
}

// ✅ GOOD: Memoizing callbacks and objects
function UserList({ users }) {
    const handleEdit = useCallback((userId) => {
        editUser(userId);
    }, []);
    
    const cardStyle = useMemo(() => ({ margin: 10 }), []);
    
    return (
        <div>
            {users.map(user => (
                <UserCard
                    key={user.id}
                    user={user}
                    onEdit={handleEdit}
                    style={cardStyle}
                />
            ))}
        </div>
    );
}

// ❌ BAD: Not cleaning up subscriptions
function ChatComponent() {
    const [messages, setMessages] = useState([]);
    
    useEffect(() => {
        const socket = io();
        socket.on('message', (message) => {
            setMessages(prev => [...prev, message]);
        });
        // Missing cleanup!
    }, []);
}

// ✅ GOOD: Cleaning up subscriptions
function ChatComponent() {
    const [messages, setMessages] = useState([]);
    
    useEffect(() => {
        const socket = io();
        socket.on('message', (message) => {
            setMessages(prev => [...prev, message]);
        });
        
        return () => {
            socket.disconnect();
        };
    }, []);
}
```

### Vue Pitfalls
```javascript
// ❌ BAD: Mutating props
export default {
    props: ['user'],
    setup(props) {
        const updateUser = () => {
            // DON'T DO THIS - mutates prop
            props.user.name = 'New Name';
        };
    }
};

// ✅ GOOD: Emitting events to parent
export default {
    props: ['user'],
    emits: ['update-user'],
    setup(props, { emit }) {
        const updateUser = () => {
            emit('update-user', { ...props.user, name: 'New Name' });
        };
    }
};

// ❌ BAD: Not using reactive properly
export default {
    setup() {
        let user = { name: 'John', age: 30 }; // Not reactive
        
        const updateAge = () => {
            user.age++; // Won't trigger reactivity
        };
        
        return { user, updateAge };
    }
};

// ✅ GOOD: Using reactive/ref properly
export default {
    setup() {
        const user = reactive({ name: 'John', age: 30 });
        // OR
        const user = ref({ name: 'John', age: 30 });
        
        const updateAge = () => {
            user.age++; // Will trigger reactivity
            // OR for ref: user.value.age++;
        };
        
        return { user, updateAge };
    }
};

// ❌ BAD: Memory leaks with watchers
export default {
    setup() {
        const count = ref(0);
        
        watch(count, (newVal) => {
            console.log('Count changed:', newVal);
        });
        
        // Watcher not cleaned up!
    }
};

// ✅ GOOD: Cleaning up watchers
export default {
    setup() {
        const count = ref(0);
        
        const stopWatcher = watch(count, (newVal) => {
            console.log('Count changed:', newVal);
        });
        
        onUnmounted(() => {
            stopWatcher();
        });
    }
};
```

### Angular Pitfalls
```typescript
// ❌ BAD: Not unsubscribing from observables
@Component({
    selector: 'app-user-list',
    template: `<div>{{ users.length }} users</div>`
})
export class UserListComponent implements OnInit {
    users: User[] = [];
    
    constructor(private userService: UserService) {}
    
    ngOnInit(): void {
        // Memory leak - subscription not cleaned up
        this.userService.getUsers().subscribe(users => {
            this.users = users;
        });
    }
}

// ✅ GOOD: Unsubscribing properly
@Component({
    selector: 'app-user-list',
    template: `<div>{{ users.length }} users</div>`
})
export class UserListComponent implements OnInit, OnDestroy {
    users: User[] = [];
    private destroy$ = new Subject<void>();
    
    constructor(private userService: UserService) {}
    
    ngOnInit(): void {
        this.userService.getUsers()
            .pipe(takeUntil(this.destroy$))
            .subscribe(users => {
                this.users = users;
            });
    }
    
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}

// ❌ BAD: Mutating input properties
@Component({
    selector: 'app-user-card',
    template: `
        <div>
            <h3>{{ user.name }}</h3>
            <button (click)="updateUser()">Update</button>
        </div>
    `
})
export class UserCardComponent {
    @Input() user!: User;
    
    updateUser(): void {
        // DON'T DO THIS - mutates input
        this.user.name = 'Updated Name';
    }
}

// ✅ GOOD: Emitting events
@Component({
    selector: 'app-user-card',
    template: `
        <div>
            <h3>{{ user.name }}</h3>
            <button (click)="updateUser()">Update</button>
        </div>
    `
})
export class UserCardComponent {
    @Input() user!: User;
    @Output() userUpdate = new EventEmitter<User>();
    
    updateUser(): void {
        const updatedUser = { ...this.user, name: 'Updated Name' };
        this.userUpdate.emit(updatedUser);
    }
}
```

---

## 🏋️ Practice Problems

### Mini Practice Problems

#### 1. **Real-time Chat Application**
```javascript
// Build a real-time chat app with:
// - User authentication
// - Multiple chat rooms
// - Message history
// - Online user status
// - Typing indicators
// - File sharing

// Key features to implement:
// - WebSocket connection management
// - Message state management
// - Optimistic updates
// - Error handling and reconnection
// - Message pagination
// - Emoji support

// Example structure:
const ChatApp = {
    components: [
        'ChatRoomList',
        'MessageList', 
        'MessageInput',
        'UserList',
        'TypingIndicator'
    ],
    features: [
        'Real-time messaging',
        'User presence',
        'Message persistence',
        'File uploads',
        'Message search'
    ]
};
```

#### 2. **E-commerce Product Catalog**
```javascript
// Create a product catalog with:
// - Product listing with filters
// - Search functionality
// - Shopping cart
// - Wishlist
// - Product comparison
// - Reviews and ratings

// Key features to implement:
// - Advanced filtering (price, category, brand, ratings)
// - Infinite scrolling or pagination
// - Product image gallery
// - Cart state management
// - Local storage persistence
// - Responsive design

// Example structure:
const EcommerceApp = {
    pages: [
        'ProductList',
        'ProductDetail',
        'Cart',
        'Checkout',
        'UserProfile'
    ],
    features: [
        'Product filtering',
        'Search with autocomplete',
        'Cart management',
        'Wishlist functionality',
        'Order history'
    ]
};
```

#### 3. **Task Management Dashboard**
```javascript
// Build a project management tool with:
// - Kanban board
// - Task creation and editing
// - Team collaboration
// - Time tracking
// - Progress analytics
// - File attachments

// Key features to implement:
// - Drag and drop functionality
// - Real-time collaboration
// - Task dependencies
// - Gantt chart view
// - Team member assignment
// - Notification system

// Example structure:
const TaskManager = {
    views: [
        'KanbanBoard',
        'ListView',
        'CalendarView',
        'GanttChart',
        'Analytics'
    ],
    features: [
        'Drag and drop',
        'Real-time updates',
        'Task filtering',
        'Time tracking',
        'Team collaboration'
    ]
};
```

#### 4. **Social Media Feed**
```javascript
// Create a social media platform with:
// - User profiles
// - Post creation (text, images, videos)
// - News feed with infinite scroll
// - Like, comment, share functionality
// - Follow/unfollow users
// - Real-time notifications

// Key features to implement:
// - Image/video upload and preview
// - Feed algorithm (chronological/algorithmic)
// - Comment threading
// - Real-time likes and comments
// - User search and discovery
// - Content moderation

// Example structure:
const SocialMedia = {
    components: [
        'NewsFeed',
        'PostCreator',
        'UserProfile',
        'NotificationCenter',
        'SearchResults'
    ],
    features: [
        'Infinite scrolling',
        'Real-time updates',
        'Media uploads',
        'Social interactions',
        'User discovery'
    ]
};
```

#### 5. **Data Visualization Dashboard**
```javascript
// Build an analytics dashboard with:
// - Multiple chart types (line, bar, pie, scatter)
// - Real-time data updates
// - Interactive filters
// - Export functionality
// - Responsive design
// - Custom date ranges

// Key features to implement:
// - Chart.js or D3.js integration
// - Data transformation and aggregation
// - Real-time WebSocket updates
// - CSV/PDF export
// - Dashboard customization
// - Performance optimization for large datasets

// Example structure:
const Dashboard = {
    charts: [
        'LineChart',
        'BarChart',
        'PieChart',
        'ScatterPlot',
        'HeatMap'
    ],
    features: [
        'Real-time updates',
        'Interactive filtering',
        'Data export',
        'Custom layouts',
        'Performance optimization'
    ]
};
```

---

## 📝 Interview Notes

### Common Framework Questions

#### React Interview Questions
```javascript
// Q1: What is the Virtual DOM and how does it work?
// A: The Virtual DOM is a JavaScript representation of the real DOM.
// React uses it to optimize updates by:
// 1. Creating a virtual representation of the UI
// 2. Comparing (diffing) the new virtual DOM with the previous one
// 3. Updating only the changed parts in the real DOM

// Q2: Explain the difference between useState and useReducer
// A: useState is for simple state, useReducer is for complex state logic
const [count, setCount] = useState(0); // Simple state

const [state, dispatch] = useReducer(reducer, initialState); // Complex state

// Q3: What are React keys and why are they important?
// A: Keys help React identify which items have changed, are added, or removed
// They should be stable, predictable, and unique among siblings

// ❌ BAD: Using array index as key
{items.map((item, index) => <Item key={index} data={item} />)}

// ✅ GOOD: Using unique identifier
{items.map(item => <Item key={item.id} data={item} />)}

// Q4: Explain React's reconciliation process
// A: Reconciliation is the process React uses to update the DOM efficiently:
// 1. Element type comparison
// 2. Props comparison
// 3. Children comparison
// 4. Key-based reconciliation for lists

// Q5: What is prop drilling and how can you avoid it?
// A: Prop drilling is passing props through multiple component levels
// Solutions: Context API, State management libraries, Component composition

// Prop drilling example:
function App() {
    const user = { name: 'John' };
    return <Parent user={user} />;
}

function Parent({ user }) {
    return <Child user={user} />;
}

function Child({ user }) {
    return <GrandChild user={user} />;
}

function GrandChild({ user }) {
    return <div>{user.name}</div>;
}

// Solution with Context:
const UserContext = createContext();

function App() {
    const user = { name: 'John' };
    return (
        <UserContext.Provider value={user}>
            <Parent />
        </UserContext.Provider>
    );
}

function GrandChild() {
    const user = useContext(UserContext);
    return <div>{user.name}</div>;
}
```

#### Vue Interview Questions
```javascript
// Q1: What is Vue's reactivity system?
// A: Vue uses a reactive system based on ES6 Proxies (Vue 3) or Object.defineProperty (Vue 2)
// It automatically tracks dependencies and updates the DOM when data changes

// Q2: Explain the difference between ref and reactive
// A: ref is for primitive values, reactive is for objects
const count = ref(0); // Primitive
const user = reactive({ name: 'John', age: 30 }); // Object

// Q3: What are Vue directives?
// A: Directives are special attributes that apply reactive behavior to the DOM
// Examples: v-if, v-for, v-model, v-show, v-on, v-bind

// Q4: Explain Vue's component lifecycle
// A: Vue 3 Composition API lifecycle hooks:
// - onBeforeMount
// - onMounted
// - onBeforeUpdate
// - onUpdated
// - onBeforeUnmount
// - onUnmounted

// Q5: What is the difference between computed and watch?
// A: Computed is for derived state, watch is for side effects
const fullName = computed(() => `${firstName.value} ${lastName.value}`);

watch(searchTerm, (newTerm) => {
    // Side effect: API call
    fetchSearchResults(newTerm);
});
```

#### Angular Interview Questions
```typescript
// Q1: What is dependency injection in Angular?
// A: DI is a design pattern where dependencies are provided to a class
// rather than the class creating them itself

@Injectable({
    providedIn: 'root'
})
export class UserService {
    constructor(private http: HttpClient) {}
}

@Component({
    selector: 'app-user'
})
export class UserComponent {
    constructor(private userService: UserService) {} // DI
}

// Q2: Explain Angular's change detection
// A: Angular uses Zone.js to detect changes and update the view
// It runs change detection on:
// - DOM events
// - HTTP requests
// - Timers (setTimeout, setInterval)

// Q3: What are Angular pipes?
// A: Pipes transform data in templates
{{ user.name | uppercase }}
{{ user.birthDate | date:'short' }}
{{ user.salary | currency:'USD' }}

// Q4: Explain the difference between template-driven and reactive forms
// A: Template-driven forms use directives in templates,
// reactive forms use FormControl and FormGroup in components

// Template-driven:
<form #userForm="ngForm">
    <input name="name" ngModel required>
</form>

// Reactive:
this.userForm = this.fb.group({
    name: ['', Validators.required]
});

// Q5: What are Angular guards?
// A: Guards control navigation to/from routes
// Types: CanActivate, CanDeactivate, CanLoad, Resolve
```

### Company-Specific Questions

#### **Frontend-Heavy Companies (Netflix, Airbnb, Facebook)**
```javascript
// Performance optimization questions:
// - How would you optimize a large list rendering?
// - Explain code splitting strategies
// - How do you handle memory leaks in SPAs?
// - What are your strategies for reducing bundle size?

// Architecture questions:
// - How would you structure a large-scale React application?
// - Explain your approach to state management
// - How do you handle error boundaries?
// - What's your testing strategy for components?

// Real-world scenarios:
// - How would you implement infinite scrolling?
// - Design a reusable component library
// - Handle real-time updates in a chat application
// - Implement offline functionality
```

#### **E-commerce Companies (Amazon, Shopify, eBay)**
```javascript
// Business logic questions:
// - How would you implement a shopping cart?
// - Design a product search with filters
// - Handle inventory updates in real-time
// - Implement A/B testing for UI components

// Performance questions:
// - Optimize product image loading
// - Handle large product catalogs
// - Implement caching strategies
// - Design for mobile performance
```

#### **Fintech Companies (Stripe, PayPal, Square)**
```javascript
// Security questions:
// - How do you handle sensitive data in frontend?
// - Implement secure form handling
// - Handle authentication tokens
// - Prevent XSS and CSRF attacks

// Reliability questions:
// - Handle network failures gracefully
// - Implement retry mechanisms
// - Design error handling strategies
// - Ensure data consistency
```

### Key Takeaways

1. **Choose the Right Tool**: Each framework has its strengths - React for flexibility, Vue for ease of use, Angular for enterprise applications

2. **Performance Matters**: Always consider performance implications of your architectural decisions

3. **State Management**: Understand when to use local state vs global state management

4. **Component Design**: Focus on reusability, composability, and maintainability

5. **Testing Strategy**: Write testable components and implement proper testing strategies

6. **Security First**: Always consider security implications, especially for user data

7. **Developer Experience**: Choose tools and patterns that improve developer productivity

8. **Stay Updated**: Frontend frameworks evolve rapidly - stay current with best practices

---

*Next: Chapter 20 - Node.js & Backend Development* 🚀javascript
// Without Framework - Vanilla JavaScript
class VanillaTodoApp {
    constructor() {
        this.todos = [];
        this.container = document.getElementById('app');
        this.render();
    }
    
    addTodo(text) {
        this.todos.push({ id: Date.now(), text, completed: false });
        this.render(); // Manual re-render
    }
    
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.render(); // Manual re-render
        }
    }
    
    render() {
        // Manual DOM manipulation
        this.container.innerHTML = `
            <div>
                <input id="todoInput" type="text" placeholder="Add todo...">
                <button onclick="app.addTodo(document.getElementById('todoInput').value)">Add</button>
                <ul>
                    ${this.todos.map(todo => `
                        <li>
                            <input type="checkbox" ${todo.completed ? 'checked' : ''} 
                                   onchange="app.toggleTodo(${todo.id})">
                            <span style="${todo.completed ? 'text-decoration: line-through' : ''}">
                                ${todo.text}
                            </span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }
}

// Framework Benefits:
// 1. Declarative UI
// 2. Component reusability
// 3. State management
// 4. Virtual DOM (React)
// 5. Reactive data binding (Vue/Angular)
// 6. Developer tools
// 7. Community ecosystem
```

### Framework Comparison
```javascript
// Framework characteristics comparison
const frameworkComparison = {
    React: {
        paradigm: 'Component-based library',
        learningCurve: 'Moderate',
        stateManagement: 'useState, useReducer, Redux, Zustand',
        rendering: 'Virtual DOM',
        strengths: ['Large ecosystem', 'Flexibility', 'Job market'],
        weaknesses: ['Boilerplate', 'Decision fatigue'],
        bestFor: 'Large applications, SPAs, mobile (React Native)'
    },
    Vue: {
        paradigm: 'Progressive framework',
        learningCurve: 'Easy',
        stateManagement: 'Vuex, Pinia',
        rendering: 'Virtual DOM with reactive system',
        strengths: ['Easy to learn', 'Great documentation', 'Template syntax'],
        weaknesses: ['Smaller ecosystem', 'Less job opportunities'],
        bestFor: 'Rapid prototyping, small to medium apps'
    },
    Angular: {
        paradigm: 'Full framework',
        learningCurve: 'Steep',
        stateManagement: 'Services, NgRx',
        rendering: 'Real DOM with change detection',
        strengths: ['Complete solution', 'TypeScript', 'Enterprise ready'],
        weaknesses: ['Complex', 'Heavy', 'Steep learning curve'],
        bestFor: 'Enterprise applications, large teams'
    }
};
```

---

## ⚛️ React Fundamentals

### Components and JSX
```javascript
// Functional Components
import React, { useState, useEffect } from 'react';

// Basic functional component
function Welcome({ name }) {
    return <h1>Hello, {name}!</h1>;
}

// Component with state
function Counter() {
    const [count, setCount] = useState(0);
    
    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>
                Increment
            </button>
            <button onClick={() => setCount(count - 1)}>
                Decrement
            </button>
        </div>
    );
}

// Component with effects
function UserProfile({ userId }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        async function fetchUser() {
            try {
                setLoading(true);
                const response = await fetch(`/api/users/${userId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch user');
                }
                const userData = await response.json();
                setUser(userData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        
        fetchUser();
    }, [userId]); // Dependency array
    
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!user) return <div>User not found</div>;
    
    return (
        <div className="user-profile">
            <img src={user.avatar} alt={user.name} />
            <h2>{user.name}</h2>
            <p>{user.email}</p>
        </div>
    );
}
```

### Custom Hooks
```javascript
// Custom hook for API calls
function useApi(url) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                const result = await response.json();
                setData(result);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        
        fetchData();
    }, [url]);
    
    return { data, loading, error };
}

// Custom hook for local storage
function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return initialValue;
        }
    });
    
    const setValue = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error('Error writing to localStorage:', error);
        }
    };
    
    return [storedValue, setValue];
}

// Custom hook for debounced values
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    
    return debouncedValue;
}

// Usage of custom hooks
function SearchComponent() {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const { data: searchResults, loading, error } = useApi(
        debouncedSearchTerm ? `/api/search?q=${debouncedSearchTerm}` : null
    );
    const [favorites, setFavorites] = useLocalStorage('favorites', []);
    
    return (
        <div>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
            />
            
            {loading && <div>Searching...</div>}
            {error && <div>Error: {error}</div>}
            
            {searchResults && (
                <ul>
                    {searchResults.map(result => (
                        <li key={result.id}>
                            {result.title}
                            <button onClick={() => setFavorites([...favorites, result])}>
                                Add to Favorites
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
```

### Context API
```javascript
// Theme context
const ThemeContext = React.createContext();

function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('light');
    
    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };
    
    const value = {
        theme,
        toggleTheme
    };
    
    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

// Custom hook to use theme
function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

// User context with authentication
const UserContext = React.createContext();

function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        // Check for existing session
        checkAuthStatus();
    }, []);
    
    const checkAuthStatus = async () => {
        try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const login = async (email, password) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                return { success: true };
            } else {
                return { success: false, error: 'Invalid credentials' };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    };
    
    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
        }
    };
    
    const value = {
        user,
        loading,
        login,
        logout
    };
    
    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}

function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}

// App with providers
function App() {
    return (
        <ThemeProvider>
            <UserProvider>
                <div className="app">
                    <Header />
                    <Main />
                    <Footer />
                </div>
            </UserProvider>
        </ThemeProvider>
    );
}
```

---

## 🟢 Vue.js Essentials

### Vue Components
```javascript
// Vue 3 Composition API
import { ref, computed, onMounted, watch } from 'vue';

// Basic component
export default {
    name: 'Counter',
    setup() {
        const count = ref(0);
        
        const increment = () => {
            count.value++;
        };
        
        const decrement = () => {
            count.value--;
        };
        
        const doubleCount = computed(() => count.value * 2);
        
        return {
            count,
            increment,
            decrement,
            doubleCount
        };
    },
    template: `
        <div>
            <p>Count: {{ count }}</p>
            <p>Double: {{ doubleCount }}</p>
            <button @click="increment">+</button>
            <button @click="decrement">-</button>
        </div>
    `
};

// Component with lifecycle and watchers
export default {
    name: 'UserProfile',
    props: {
        userId: {
            type: String,
            required: true
        }
    },
    setup(props) {
        const user = ref(null);
        const loading = ref(false);
        const error = ref(null);
        
        const fetchUser = async (id) => {
            try {
                loading.value = true;
                error.value = null;
                const response = await fetch(`/api/users/${id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch user');
                }
                user.value = await response.json();
            } catch (err) {
                error.value = err.message;
            } finally {
                loading.value = false;
            }
        };
        
        // Watch for prop changes
        watch(() => props.userId, (newId) => {
            if (newId) {
                fetchUser(newId);
            }
        }, { immediate: true });
        
        onMounted(() => {
            console.log('UserProfile mounted');
        });
        
        return {
            user,
            loading,
            error
        };
    },
    template: `
        <div class="user-profile">
            <div v-if="loading">Loading...</div>
            <div v-else-if="error">Error: {{ error }}</div>
            <div v-else-if="user">
                <img :src="user.avatar" :alt="user.name" />
                <h2>{{ user.name }}</h2>
                <p>{{ user.email }}</p>
            </div>
        </div>
    `
};
```

### Vue Composables (Custom Composition Functions)
```javascript
// useApi composable
import { ref, watchEffect } from 'vue';

export function useApi(url) {
    const data = ref(null);
    const loading = ref(false);
    const error = ref(null);
    
    const fetchData = async () => {
        try {
            loading.value = true;
            error.value = null;
            const response = await fetch(url.value || url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            data.value = await response.json();
        } catch (err) {
            error.value = err.message;
        } finally {
            loading.value = false;
        }
    };
    
    watchEffect(() => {
        if (url.value || url) {
            fetchData();
        }
    });
    
    return { data, loading, error, refetch: fetchData };
}

// useLocalStorage composable
import { ref, watch } from 'vue';

export function useLocalStorage(key, defaultValue) {
    const storedValue = localStorage.getItem(key);
    const initial = storedValue ? JSON.parse(storedValue) : defaultValue;
    
    const value = ref(initial);
    
    watch(value, (newValue) => {
        localStorage.setItem(key, JSON.stringify(newValue));
    }, { deep: true });
    
    return value;
}

// useDebounce composable
import { ref, watch } from 'vue';

export function useDebounce(source, delay) {
    const debounced = ref(source.value);
    
    watch(source, (newValue) => {
        setTimeout(() => {
            debounced.value = newValue;
        }, delay);
    });
    
    return debounced;
}

// Usage in component
export default {
    name: 'SearchComponent',
    setup() {
        const searchTerm = ref('');
        const debouncedSearch = useDebounce(searchTerm, 300);
        const searchUrl = computed(() => 
            debouncedSearch.value ? `/api/search?q=${debouncedSearch.value}` : null
        );
        const { data: searchResults, loading, error } = useApi(searchUrl);
        const favorites = useLocalStorage('favorites', []);
        
        const addToFavorites = (item) => {
            favorites.value.push(item);
        };
        
        return {
            searchTerm,
            searchResults,
            loading,
            error,
            favorites,
            addToFavorites
        };
    },
    template: `
        <div>
            <input v-model="searchTerm" placeholder="Search..." />
            
            <div v-if="loading">Searching...</div>
            <div v-if="error">Error: {{ error }}</div>
            
            <ul v-if="searchResults">
                <li v-for="result in searchResults" :key="result.id">
                    {{ result.title }}
                    <button @click="addToFavorites(result)">
                        Add to Favorites
                    </button>
                </li>
            </ul>
        </div>
    `
};
```

### Vue Store (Pinia)
```javascript
// stores/user.js
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
    state: () => ({
        user: null,
        loading: false,
        error: null
    }),
    
    getters: {
        isAuthenticated: (state) => !!state.user,
        userName: (state) => state.user?.name || 'Guest'
    },
    
    actions: {
        async login(email, password) {
            try {
                this.loading = true;
                this.error = null;
                
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                if (response.ok) {
                    this.user = await response.json();
                    return { success: true };
                } else {
                    throw new Error('Invalid credentials');
                }
            } catch (error) {
                this.error = error.message;
                return { success: false, error: error.message };
            } finally {
                this.loading = false;
            }
        },
        
        async logout() {
            try {
                await fetch('/api/auth/logout', { method: 'POST' });
            } catch (error) {
                console.error('Logout error:', error);
            } finally {
                this.user = null;
                this.error = null;
            }
        },
        
        async checkAuth() {
            try {
                const response = await fetch('/api/auth/me');
                if (response.ok) {
                    this.user = await response.json();
                }
            } catch (error) {
                console.error('Auth check failed:', error);
            }
        }
    }
});

// stores/todos.js
import { defineStore } from 'pinia';

export const useTodosStore = defineStore('todos', {
    state: () => ({
        todos: [],
        filter: 'all' // all, active, completed
    }),
    
    getters: {
        filteredTodos: (state) => {
            switch (state.filter) {
                case 'active':
                    return state.todos.filter(todo => !todo.completed);
                case 'completed':
                    return state.todos.filter(todo => todo.completed);
                default:
                    return state.todos;
            }
        },
        
        todoCount: (state) => state.todos.length,
        activeCount: (state) => state.todos.filter(todo => !todo.completed).length,
        completedCount: (state) => state.todos.filter(todo => todo.completed).length
    },
    
    actions: {
        addTodo(text) {
            this.todos.push({
                id: Date.now(),
                text,
                completed: false,
                createdAt: new Date()
            });
        },
        
        toggleTodo(id) {
            const todo = this.todos.find(t => t.id === id);
            if (todo) {
                todo.completed = !todo.completed;
            }
        },
        
        removeTodo(id) {
            const index = this.todos.findIndex(t => t.id === id);
            if (index > -1) {
                this.todos.splice(index, 1);
            }
        },
        
        setFilter(filter) {
            this.filter = filter;
        },
        
        clearCompleted() {
            this.todos = this.todos.filter(todo => !todo.completed);
        }
    }
});
```

---

## 🅰️ Angular Basics

### Components and Services
```typescript
// user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private userSubject = new BehaviorSubject<User | null>(null);
    public user$ = this.userSubject.asObservable();
    
    constructor(private http: HttpClient) {
        this.checkAuthStatus();
    }
    
    login(email: string, password: string): Observable<{ success: boolean; error?: string }> {
        return this.http.post<User>('/api/auth/login', { email, password })
            .pipe(
                map(user => {
                    this.userSubject.next(user);
                    return { success: true };
                }),
                catchError(error => {
                    return [{ success: false, error: error.message }];
                })
            );
    }
    
    logout(): Observable<void> {
        return this.http.post<void>('/api/auth/logout', {})
            .pipe(
                map(() => {
                    this.userSubject.next(null);
                })
            );
    }
    
    private checkAuthStatus(): void {
        this.http.get<User>('/api/auth/me')
            .subscribe({
                next: user => this.userSubject.next(user),
                error: () => this.userSubject.next(null)
            });
    }
    
    getCurrentUser(): User | null {
        return this.userSubject.value;
    }
    
    isAuthenticated(): boolean {
        return !!this.userSubject.value;
    }
}

// user-profile.component.ts
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserService } from './user.service';

@Component({
    selector: 'app-user-profile',
    template: `
        <div class="user-profile" *ngIf="user; else loading">
            <img [src]="user.avatar" [alt]="user.name" />
            <h2>{{ user.name }}</h2>
            <p>{{ user.email }}</p>
            <button (click)="logout()" [disabled]="loggingOut">
                {{ loggingOut ? 'Logging out...' : 'Logout' }}
            </button>
        </div>
        
        <ng-template #loading>
            <div>Loading user profile...</div>
        </ng-template>
    `,
    styles: [`
        .user-profile {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px;
        }
        
        img {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            margin-bottom: 10px;
        }
    `]
})
export class UserProfileComponent implements OnInit, OnDestroy {
    user: User | null = null;
    loggingOut = false;
    private destroy$ = new Subject<void>();
    
    constructor(private userService: UserService) {}
    
    ngOnInit(): void {
        this.userService.user$
            .pipe(takeUntil(this.destroy$))
            .subscribe(user => {
                this.user = user;
            });
    }
    
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
    
    logout(): void {
        this.loggingOut = true;
        this.userService.logout()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.loggingOut = false;
                },
                error: () => {
                    this.loggingOut = false;
                }
            });
    }
}
```

### Angular Reactive Forms
```typescript
// login.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from './user.service';

@Component({
    selector: 'app-login',
    template: `
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
            <h2>Login</h2>
            
            <div class="form-group">
                <label for="email">Email:</label>
                <input 
                    id="email"
                    type="email" 
                    formControlName="email"
                    [class.error]="email?.invalid && email?.touched"
                />
                <div *ngIf="email?.invalid && email?.touched" class="error-message">
                    <span *ngIf="email?.errors?.['required']">Email is required</span>
                    <span *ngIf="email?.errors?.['email']">Please enter a valid email</span>
                </div>
            </div>
            
            <div class="form-group">
                <label for="password">Password:</label>
                <input 
                    id="password"
                    type="password" 
                    formControlName="password"
                    [class.error]="password?.invalid && password?.touched"
                />
                <div *ngIf="password?.invalid && password?.touched" class="error-message">
                    <span *ngIf="password?.errors?.['required']">Password is required</span>
                    <span *ngIf="password?.errors?.['minlength']">Password must be at least 6 characters</span>
                </div>
            </div>
            
            <button 
                type="submit" 
                [disabled]="loginForm.invalid || loading"
                class="submit-button"
            >
                {{ loading ? 'Logging in...' : 'Login' }}
            </button>
            
            <div *ngIf="error" class="error-message">
                {{ error }}
            </div>
        </form>
    `,
    styles: [`
        .login-form {
            max-width: 400px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        
        input {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        
        input.error {
            border-color: #ff0000;
        }
        
        .error-message {
            color: #ff0000;
            font-size: 14px;
            margin-top: 5px;
        }
        
        .submit-button {
            width: 100%;
            padding: 10px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        
        .submit-button:disabled {
            background-color: #ccc;
            cursor: not-allowed;
        }
    `]
})
export class LoginComponent implements OnInit {
    loginForm!: FormGroup;
    loading = false;
    error: string | null = null;
    
    constructor(
        private fb: FormBuilder,
        private userService: UserService,
        private router: Router
    ) {}
    
    ngOnInit(): void {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
    }
    
    get email() {
        return this.loginForm.get('email');
    }
    
    get password() {
        return this.loginForm.get('password');
    }
    
    onSubmit(): void {
        if (this.loginForm.valid) {
            this.loading = true;
            this.error = null;
            
            const { email, password } = this.loginForm.value;
            
            this.userService.login(email, password).subscribe({
                next: (result) => {
                    this.loading = false;
                    if (result.success) {
                        this.router.navigate(['/dashboard']);
                    } else {
                        this.error = result.error || 'Login failed';
                    }
                },
                error: (error) => {
                    this.loading = false;
                    this.error = 'An error occurred during login';
                }
            });
        }
    }
}
```

---

## 🗃️ State Management

### Redux with React
```javascript
// store/userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks
export const loginUser = createAsyncThunk(
    'user/login',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            if (!response.ok) {
                throw new Error('Invalid credentials');
            }
            
            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const logoutUser = createAsyncThunk(
    'user/logout',
    async (_, { rejectWithValue }) => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState: {
        user: null,
        loading: false,
        error: null
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        updateUser: (state, action) => {
            state.user = { ...state.user, ...action.payload };
        }
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Logout
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.error = null;
            });
    }
});

export const { clearError, updateUser } = userSlice.actions;
export default userSlice.reducer;

// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import todosReducer from './todosSlice';

export const store = configureStore({
    reducer: {
        user: userReducer,
        todos: todosReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST']
            }
        })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// hooks/redux.ts
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '../store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// components/LoginForm.jsx
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { loginUser, clearError } from '../store/userSlice';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useAppDispatch();
    const { loading, error } = useAppSelector(state => state.user);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(clearError());
        
        const result = await dispatch(loginUser({ email, password }));
        if (loginUser.fulfilled.match(result)) {
            // Login successful
            console.log('Login successful');
        }
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
            />
            <button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
            </button>
            {error && <div className="error">{error}</div>}
        </form>
    );
}
```

### Zustand (Lightweight State Management)
```javascript
// stores/useUserStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUserStore = create(
    persist(
        (set, get) => ({
            user: null,
            loading: false,
            error: null,
            
            login: async (email, password) => {
                try {
                    set({ loading: true, error: null });
                    
                    const response = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password })
                    });
                    
                    if (!response.ok) {
                        throw new Error('Invalid credentials');
                    }
                    
                    const user = await response.json();
                    set({ user, loading: false });
                    return { success: true };
                } catch (error) {
                    set({ error: error.message, loading: false });
                    return { success: false, error: error.message };
                }
            },
            
            logout: async () => {
                try {
                    await fetch('/api/auth/logout', { method: 'POST' });
                } catch (error) {
                    console.error('Logout error:', error);
                } finally {
                    set({ user: null, error: null });
                }
            },
            
            updateUser: (updates) => {
                set((state) => ({
                    user: state.user ? { ...state.user, ...updates } : null
                }));
            },
            
            clearError: () => set({ error: null })
        }),
        {
            name: 'user-storage',
            partialize: (state) => ({ user: state.user }) // Only persist user data
        }
    )
);

export default useUserStore;

// stores/useTodosStore.js
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

const useTodosStore = create(
    immer((set) => ({
        todos: [],
        filter: 'all',
        
        addTodo: (text) => set((state) => {
            state.todos.push({
                id: Date.now(),
                text,
                completed: false,
                createdAt: new Date()
            });
        }),
        
        toggleTodo: (id) => set((state) => {
            const todo = state.todos.find(t => t.id === id);
            if (todo) {
                todo.completed = !todo.completed;
            }
        }),
        
        removeTodo: (id) => set((state) => {
            const index = state.todos.findIndex(t => t.id === id);
            if (index > -1) {
                state.todos.splice(index, 1);
            }
        }),
        
        setFilter: (filter) => set({ filter }),
        
        clearCompleted: () => set((state) => {
            state.todos = state.todos.filter(todo => !todo.completed);
        }),
        
        // Computed values
        get filteredTodos() {
            const { todos, filter } = useTodosStore.getState();
            switch (filter) {
                case 'active':
                    return todos.filter(todo => !todo.completed);
                case 'completed':
                    return todos.filter(todo => todo.completed);
                default:
                    return todos;
            }
        },
        
        get stats() {
            const { todos } = useTodosStore.getState();
            return {
                total: todos.length,
                active: todos.filter(t => !t.completed).length,
                completed: todos.filter(t => t.completed).length
            };
        }
    }))
);

export default useTodosStore;

// Usage in component
function TodoApp() {
    const {
        todos,
        filter,
        addTodo,
        toggleTodo,
        removeTodo,
        setFilter,
        clearCompleted,
        filteredTodos,
        stats
    } = useTodosStore();
    
    const [newTodo, setNewTodo] = useState('');
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (newTodo.trim()) {
            addTodo(newTodo.trim());
            setNewTodo('');
        }
    };
    
    return (
        <div className="todo-app">
            <form onSubmit={handleSubmit}>
                <input
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="Add a new todo..."
                />
                <button type="submit">Add</button>
            </form>
            
            <div className="filters">
                <button 
                    onClick={() => setFilter('all')}
                    className={filter === 'all' ? 'active' : ''}
                >
                    All ({stats.total})
                </button>
                <button 
                    onClick={() => setFilter('active')}
                    className={filter === 'active' ? 'active' : ''}
                >
                    Active ({stats.active})
                </button>
                <button 
                    onClick={() => setFilter('completed')}
                    className={filter === 'completed' ? 'active' : ''}
                >
                    Completed ({stats.completed})
                </button>
            </div>
            
            <ul className="todo-list">
                {filteredTodos.map(todo => (
                    <li key={todo.id} className={todo.completed ? 'completed' : ''}>
                        <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => toggleTodo(todo.id)}
                        />
                        <span>{todo.text}</span>
                        <button onClick={() => removeTodo(todo.id)}>Delete</button>
                    </li>
                ))}
            </ul>
            
            {stats.completed > 0 && (
                <button onClick={clearCompleted}>
                    Clear Completed ({stats.completed})
                </button>
            )}
        </div>
    );
}
```

---

## 🏗️ Component Architecture

### Design Patterns
```javascript
// 1. Container/Presentational Pattern
// Container Component (Smart)
function UserListContainer() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        fetchUsers();
    }, []);
    
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/users');
            const userData = await response.json();
            setUsers(userData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    const handleUserDelete = async (userId) => {
        try {
            await fetch(`/api/users/${userId}`, { method: 'DELETE' });
            setUsers(users.filter(user => user.id !== userId));
        } catch (err) {
            setError(err.message);
        }
    };
    
    return (
        <UserListPresentation
            users={users}
            loading={loading}
            error={error}
            onUserDelete={handleUserDelete}
            onRetry={fetchUsers}
        />
    );
}

// Presentational Component (Dumb)
function UserListPresentation({ users, loading, error, onUserDelete, onRetry }) {
    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} onRetry={onRetry} />;
    
    return (
        <div className="user-list">
            <h2>Users ({users.length})</h2>
            {users.map(user => (
                <UserCard
                    key={user.id}
                    user={user}
                    onDelete={() => onUserDelete(user.id)}
                />
            ))}
        </div>
    );
}

// 2. Higher-Order Component (HOC) Pattern
function withLoading(WrappedComponent) {
    return function WithLoadingComponent(props) {
        if (props.loading) {
            return <LoadingSpinner />;
        }
        return <WrappedComponent {...props} />;
    };
}

function withErrorHandling(WrappedComponent) {
    return function WithErrorHandlingComponent(props) {
        if (props.error) {
            return <ErrorMessage message={props.error} />;
        }
        return <WrappedComponent {...props} />;
    };
}

// Usage
const EnhancedUserList = withLoading(withErrorHandling(UserListPresentation));

// 3. Render Props Pattern
function DataFetcher({ url, children }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        fetchData();
    }, [url]);
    
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(url);
            const result = await response.json();
            setData(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    return children({ data, loading, error, refetch: fetchData });
}

// Usage
function App() {
    return (
        <DataFetcher url="/api/users">
            {({ data: users, loading, error, refetch }) => (
                <div>
                    {loading && <div>Loading...</div>}
                    {error && <div>Error: {error} <button onClick={refetch}>Retry</button></div>}
                    {users && (
                        <ul>
                            {users.map(user => (
                                <li key={user.id}>{user.name}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </DataFetcher>
    );
}

// 4. Compound Component Pattern
function Accordion({ children, ...props }) {
    const [openItems, setOpenItems] = useState(new Set());
    
    const toggleItem = (id) => {
        const newOpenItems = new Set(openItems);
        if (newOpenItems.has(id)) {
            newOpenItems.delete(id);
        } else {
            newOpenItems.add(id);
        }
        setOpenItems(newOpenItems);
    };
    
    return (
        <div className="accordion" {...props}>
            {React.Children.map(children, (child, index) => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child, {
                        isOpen: openItems.has(index),
                        onToggle: () => toggleItem(index),
                        index
                    });
                }
                return child;
            })}
        </div>
    );
}

function AccordionItem({ title, children, isOpen, onToggle }) {
    return (
        <div className="accordion-item">
            <button className="accordion-header" onClick={onToggle}>
                {title}
                <span className={`accordion-icon ${isOpen ? 'open' : ''}`}>▼</span>
            </button>
            {isOpen && (
                <div className="accordion-content">
                    {children}
                </div>
            )}
        </div>
    );
}

// Usage
function FAQ() {
    return (
        <Accordion>
            <AccordionItem title="What is React?">
                <p>React is a JavaScript library for building user interfaces.</p>
            </AccordionItem>
            <AccordionItem title="How do I get started?">
                <p>You can start by creating a new React app using Create React App.</p>
            </AccordionItem>
            <AccordionItem title="What are components?">
                <p>Components are reusable pieces of UI that can accept props and manage state.</p>
            </AccordionItem>
        </Accordion>
    );
}
```

### Component Composition
```javascript
// Flexible Layout Components
function Layout({ children, sidebar, header, footer }) {
    return (
        <div className="layout">
            {header && <header className="layout-header">{header}</header>}
            <div className="layout-body">
                {sidebar && <aside className="layout-sidebar">{sidebar}</aside>}
                <main className="layout-main">{children}</main>
            </div>
            {footer && <footer className="layout-footer">{footer}</footer>}
        </div>
    );
}

// Flexible Card Component
function Card({ children, title, actions, variant = 'default', ...props }) {
    return (
        <div className={`card card--${variant}`} {...props}>
            {title && (
                <div className="card-header">
                    <h3 className="card-title">{title}</h3>
                    {actions && <div className="card-actions">{actions}</div>}
                </div>
            )}
            <div className="card-content">
                {children}
            </div>
        </div>
    );
}

// Modal Component with Portal
function Modal({ isOpen, onClose, title, children, size = 'medium' }) {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);
    
    if (!isOpen) return null;
    
    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div 
                className={`modal modal--${size}`} 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <div className="modal-content">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}

// Form Components
function Form({ onSubmit, children, ...props }) {
    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        onSubmit(data);
    };
    
    return (
        <form onSubmit={handleSubmit} {...props}>
            {children}
        </form>
    );
}

function FormField({ label, error, children, required, ...props }) {
    return (
        <div className="form-field">
            {label && (
                <label className="form-label">
                    {label}
                    {required && <span className="required">*</span>}
                </label>
            )}
            {children}
            {error && <div className="form-error">{error}</div>}
        </div>
    );
}

function Input({ type = 'text', ...props }) {
    return (
        <input 
            type={type} 
            className="form-input"
            {...props}
        />
    );
}

// Usage Example
function UserForm({ user, onSubmit }) {
    const [errors, setErrors] = useState({});
    
    const handleSubmit = (data) => {
        // Validation
        const newErrors = {};
        if (!data.name) newErrors.name = 'Name is required';
        if (!data.email) newErrors.email = 'Email is required';
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        setErrors({});
        onSubmit(data);
    };
    
    return (
        <Card title="User Information">
            <Form onSubmit={handleSubmit}>
                <FormField label="Name" error={errors.name} required>
                    <Input name="name" defaultValue={user?.name} />
                </FormField>
                
                <FormField label="Email" error={errors.email} required>
                    <Input type="email" name="email" defaultValue={user?.email} />
                </FormField>
                
                <FormField label="Bio">
                    <textarea name="bio" className="form-input" defaultValue={user?.bio} />
                </FormField>
                
                <button type="submit" className="btn btn-primary">
                    {user ? 'Update' : 'Create'} User
                </button>
            </Form>
        </Card>
    );
}
```