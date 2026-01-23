# State Management Strategy for React Migration

This document outlines the state management strategy for migrating the Real Estate Management system from Angular to React. It covers the migration mapping from Angular patterns to React equivalents, global state management with Zustand, API state management with TanStack Query, and real-time WebSocket state handling.

## Migration Mapping

### Angular BehaviorSubjects to Zustand Stores

The Angular application uses BehaviorSubjects for service-level state management. In React, we replace this pattern with Zustand stores.

**Angular Pattern:**
```typescript
// Angular Service
export class PropertiesService {
  private propertiesSub = new BehaviorSubject<Property[]>([]);
  public properties$ = this.propertiesSub.asObservable();
  
  setProperties(properties: Property[]) {
    this.propertiesSub.next(properties);
  }
}
```

**React Equivalent (Zustand):**
```typescript
// Zustand Store
interface PropertiesState {
  properties: Property[];
  setProperties: (properties: Property[]) => void;
}

export const usePropertiesStore = create<PropertiesState>((set) => ({
  properties: [],
  setProperties: (properties) => set({ properties }),
}));
```

### Angular Signals to React Hooks

Angular Signals (`signal()`, `computed()`, `toSignal()`) map to React's `useState` and `useMemo` hooks.

**Angular Pattern:**
```typescript
// Angular Component
public isLoading = signal<boolean>(false);
public filteredProperties = computed(() => 
  this.properties().filter(p => p.type === this.selectedType())
);
```

**React Equivalent:**
```typescript
// React Component
const [isLoading, setIsLoading] = useState(false);
const filteredProperties = useMemo(() => 
  properties.filter(p => p.type === selectedType),
  [properties, selectedType]
);
```

### Service Injection to Hooks

Angular's dependency injection is replaced with custom React hooks that encapsulate business logic.

**Angular Pattern:**
```typescript
// Angular Component
constructor(private propertiesService: PropertiesService) {}

ngOnInit() {
  this.propertiesService.fetchProperties();
}
```

**React Equivalent:**
```typescript
// React Component
const { data: properties, isLoading } = useProperties();
```

## Global State Strategy with Zustand

### Store Organization

We organize Zustand stores by domain concern:

1. **authStore** - User authentication state (user, token, isAuthenticated)
2. **uiStore** - UI state (theme, toasts, modals, side menu)
3. **websocketStore** - WebSocket connection state and messages
4. **propertiesStore** - Client-side property state for optimistic updates
5. **enquiriesStore** - Client-side enquiry state

### Persistence Strategy

Stores that need persistence use Zustand's `persist` middleware:

```typescript
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      // ... actions
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

### Store Access Patterns

Components access store state using selectors for optimal re-renders:

```typescript
// Select specific state slices
const user = useAuthStore((state) => state.user);
const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

// Select multiple values with shallow comparison
const { theme, toasts } = useUIStore(
  useShallow((state) => ({ theme: state.theme, toasts: state.toasts }))
);
```

## API State Strategy with TanStack Query

### Query Client Configuration

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 minutes
      gcTime: 10 * 60 * 1000,      // 10 minutes garbage collection
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
      onError: (error) => {
        useUIStore.getState().addToast({
          type: 'error',
          message: error.message,
        });
      },
    },
  },
});
```

### Query Key Factory

Type-safe query keys prevent key collisions and enable targeted cache invalidation:

```typescript
export const queryKeys = {
  properties: {
    all: ['properties'] as const,
    list: (params?: PropertiesQueryParams) => 
      [...queryKeys.properties.all, 'list', params] as const,
    detail: (id: string) => 
      [...queryKeys.properties.all, 'detail', id] as const,
    owned: () => [...queryKeys.properties.all, 'owned'] as const,
  },
  enquiries: {
    all: ['enquiries'] as const,
    list: () => [...queryKeys.enquiries.all, 'list'] as const,
    detail: (id: string) => 
      [...queryKeys.enquiries.all, 'detail', id] as const,
  },
  user: {
    current: ['user', 'current'] as const,
  },
};
```

### Cursor-Based Pagination

The backend uses cursor-based pagination. We implement this with `useInfiniteQuery`:

```typescript
export function useInfiniteProperties(params?: PropertiesQueryParams) {
  return useInfiniteQuery({
    queryKey: queryKeys.properties.list(params),
    queryFn: ({ pageParam }) => fetchProperties({ ...params, ...pageParam }),
    initialPageParam: {} as PaginationCursors,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore) return undefined;
      return lastPage.cursors;
    },
  });
}
```

### Optimistic Updates

For better UX, we implement optimistic updates on mutations:

```typescript
export function useCreateProperty() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createProperty,
    onMutate: async (newProperty) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.properties.all });
      const previous = queryClient.getQueryData(queryKeys.properties.list());
      
      // Optimistically add the new property
      queryClient.setQueryData(queryKeys.properties.list(), (old) => ({
        ...old,
        items: [{ ...newProperty, property_id: 'temp-id' }, ...(old?.items || [])],
      }));
      
      return { previous };
    },
    onError: (err, newProperty, context) => {
      // Rollback on error
      queryClient.setQueryData(queryKeys.properties.list(), context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
    },
  });
}
```

## Real-Time WebSocket State Handling

### Connection Management

The WebSocket connection is managed in a Zustand store:

```typescript
interface WebSocketState {
  socket: WebSocket | null;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  messages: WebSocketNotification[];
  connect: (token: string) => void;
  disconnect: () => void;
  send: (message: string) => void;
}
```

### Notification Types

The system handles four notification types:

1. **Activity** - User activity updates
2. **Enquiry** - New enquiry notifications
3. **User** - User profile updates
4. **Logout** - Force logout notifications

### Integration with TanStack Query

WebSocket notifications trigger cache invalidation:

```typescript
export function useWebSocket() {
  const queryClient = useQueryClient();
  const { status, messages, connect, disconnect } = useWebSocketStore();
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (accessToken && status === 'disconnected') {
      connect(accessToken);
    }
    return () => disconnect();
  }, [accessToken]);

  useEffect(() => {
    const latestMessage = messages[messages.length - 1];
    if (!latestMessage) return;

    switch (latestMessage.type) {
      case SocketNotificationType.Enquiry:
        queryClient.invalidateQueries({ queryKey: queryKeys.enquiries.all });
        break;
      case SocketNotificationType.Activity:
        queryClient.invalidateQueries({ queryKey: queryKeys.user.current });
        break;
      case SocketNotificationType.Logout:
        useAuthStore.getState().logout();
        break;
    }
  }, [messages]);
}
```

## State Organization by Feature

### Properties Module

**Server State (TanStack Query):**
- Property list with pagination
- Single property details
- User's owned properties

**Client State (Zustand):**
- Pagination cursors for infinite scroll
- Loading states
- Temporary optimistic updates

### Map Module

**Server State (TanStack Query):**
- Property markers (reuses properties query)

**Client State (Zustand/useState):**
- Map center coordinates
- Zoom level
- Visible marker types (layer toggles)
- Selected property marker

### Mortgage Calculator Module

**Client State Only (useState):**
- Form inputs (price, down payment, interest rate, term)
- Calculated results (monthly payment, amortization schedule)
- Chart data

No server state needed as calculations are performed client-side.

## Form State with React Hook Form + Zod

### Schema Definition

```typescript
export const propertySchema = z.object({
  name: z.string().min(4, 'Name must be at least 4 characters'),
  address: z.string().min(1, 'Address is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z.nativeEnum(PropertyType),
  transactionType: z.nativeEnum(TransactionType),
  price: z.number().min(1, 'Price must be greater than 0'),
  paymentFrequency: z.nativeEnum(PaymentFrequency).optional(),
  position: coordSchema,
}).refine(
  (data) => {
    if (data.transactionType === TransactionType.ForRent) {
      return data.paymentFrequency !== undefined;
    }
    return true;
  },
  {
    message: 'Payment frequency is required for rental properties',
    path: ['paymentFrequency'],
  }
);
```

### Form Integration

```typescript
function PropertyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
  });
  
  const createMutation = useCreateProperty();
  
  const onSubmit = (data: PropertyFormData) => {
    createMutation.mutate(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

## Summary

This state management strategy provides:

1. **Clear separation of concerns** - Server state in TanStack Query, client state in Zustand
2. **Type safety** - Full TypeScript support with Zod validation
3. **Optimistic updates** - Better UX with immediate feedback
4. **Real-time updates** - WebSocket integration with cache invalidation
5. **Persistence** - Auth and UI preferences persisted to localStorage
6. **Scalability** - Modular store organization by feature domain
