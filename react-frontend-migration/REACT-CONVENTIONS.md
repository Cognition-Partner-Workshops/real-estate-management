# React Conventions and Style Guide

This document defines the coding conventions, patterns, and best practices for the Real Estate Management React application. All contributors must follow these guidelines to maintain consistency across the codebase.

## TypeScript Strict Typing Guidelines

### General Rules

1. **Never use `any` type** - The ESLint rule `@typescript-eslint/no-explicit-any` is set to `error`. Always define proper types.

2. **Explicit return types** - All functions should have explicit return types. The ESLint rule `@typescript-eslint/explicit-function-return-type` is enabled.

3. **No unused variables** - All variables must be used. Prefix intentionally unused parameters with underscore (`_`).

4. **Strict null checks** - TypeScript strict mode is enabled. Handle null/undefined cases explicitly.

### Type Definitions

```typescript
// GOOD: Explicit interface definition
interface UserProps {
  name: string;
  email: string;
  age?: number; // Optional properties use ?
}

// BAD: Using any
interface BadProps {
  data: any; // Never do this
}

// GOOD: Union types for specific values
type ButtonVariant = 'primary' | 'secondary' | 'danger';

// GOOD: Generic types when needed
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### Component Typing

```typescript
// GOOD: Typed functional component
import type { ReactElement } from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

function Button({ label, onClick, disabled = false }: ButtonProps): ReactElement {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}

// GOOD: Children prop typing
interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}
```

### Hook Typing

```typescript
// GOOD: Typed custom hook
function useCounter(initialValue: number): {
  count: number;
  increment: () => void;
  decrement: () => void;
} {
  const [count, setCount] = useState<number>(initialValue);
  
  const increment = (): void => setCount((prev) => prev + 1);
  const decrement = (): void => setCount((prev) => prev - 1);
  
  return { count, increment, decrement };
}

// GOOD: Event handler typing
const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
  setValue(event.target.value);
};
```

## File and Folder Structure

```
src/
├── api/                    # API client and endpoint functions
│   ├── client.ts          # Axios instance configuration
│   ├── properties.ts      # Property-related API calls
│   ├── auth.ts            # Authentication API calls
│   └── index.ts           # Barrel export
├── components/
│   ├── ui/                # Reusable UI primitives
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── index.ts
│   └── Layout.tsx         # App layout component
├── hooks/                  # Custom React hooks
│   ├── useProperties.ts
│   ├── useAuth.ts
│   └── index.ts
├── pages/                  # Route page components
│   ├── map/
│   │   ├── MapPage.tsx
│   │   └── index.ts
│   └── properties/
│       ├── PropertiesPage.tsx
│       ├── PropertyDetailPage.tsx
│       └── index.ts
├── store/                  # Redux store configuration
│   ├── slices/            # Redux slices
│   ├── store.ts           # Store configuration
│   ├── hooks.ts           # Typed hooks
│   └── index.ts
├── types/                  # TypeScript type definitions
│   ├── property.ts
│   ├── user.ts
│   └── index.ts
└── utils/                  # Utility functions
```

## Naming Conventions

### Files and Folders

- **Components**: PascalCase (e.g., `Button.tsx`, `PropertyCard.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useProperties.ts`)
- **Utilities**: camelCase (e.g., `formatCurrency.ts`)
- **Types**: camelCase (e.g., `property.ts`)
- **Constants**: SCREAMING_SNAKE_CASE in files, camelCase filenames

### Variables and Functions

```typescript
// Components: PascalCase
function PropertyCard(): ReactElement { }

// Functions: camelCase
function formatPrice(price: number): string { }

// Constants: SCREAMING_SNAKE_CASE
const API_BASE_URL = 'http://localhost:8000';

// Interfaces/Types: PascalCase
interface PropertyFilters { }
type ButtonVariant = 'primary' | 'secondary';

// Enums: PascalCase with PascalCase values
enum PropertyType {
  Residential = 'residential',
  Commercial = 'commercial',
}
```

## Component Patterns

### Functional Components Only

All components must be functional components using hooks. No class components.

```typescript
// GOOD
function MyComponent({ prop }: Props): ReactElement {
  const [state, setState] = useState<string>('');
  return <div>{state}</div>;
}

// BAD - No class components
class MyComponent extends React.Component { }
```

### Props Destructuring

Always destructure props in the function signature:

```typescript
// GOOD
function Button({ label, onClick, disabled = false }: ButtonProps): ReactElement {
  return <button onClick={onClick} disabled={disabled}>{label}</button>;
}

// BAD
function Button(props: ButtonProps): ReactElement {
  return <button onClick={props.onClick}>{props.label}</button>;
}
```

### Default Props

Use default parameter values instead of defaultProps:

```typescript
// GOOD
function Button({ variant = 'primary', size = 'md' }: ButtonProps): ReactElement { }

// BAD
Button.defaultProps = { variant: 'primary' };
```

## State Management

### Redux Toolkit Patterns

Use Redux Toolkit for global state management:

```typescript
// Slice definition
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
});
```

### Typed Hooks

Always use typed Redux hooks:

```typescript
import { useAppDispatch, useAppSelector } from '@/store';

function MyComponent(): ReactElement {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
}
```

## API Layer

### TanStack Query for Server State

Use TanStack Query (React Query) for server state management:

```typescript
// Custom hook pattern
export function useProperties(params: UsePropertiesParams = {}) {
  return useQuery({
    queryKey: ['properties', params],
    queryFn: () => fetchProperties(params),
  });
}

// Mutation pattern
export function useCreateProperty() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}
```

## Styling

### Tailwind CSS

Use Tailwind CSS utility classes for styling:

```typescript
// GOOD
<button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
  Click me
</button>

// Conditional classes
<div className={`p-4 ${isActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
  Content
</div>
```

### CSS Variables for Theme

Use CSS custom properties for theme values:

```css
:root {
  --color-primary: #3b82f6;
  --color-residential: #22c55e;
}
```

## Import Organization

Organize imports in the following order:

1. React and React-related imports
2. Third-party libraries
3. Internal modules (using @ alias)
4. Relative imports
5. Type imports (using `import type`)

```typescript
import { useState, useEffect, type ReactElement } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useAppDispatch } from '@/store';
import { Button, Input } from '@/components/ui';
import type { Property, PropertyFilters } from '@/types';

import { formatPrice } from './utils';
```

## Error Handling

### API Errors

Always handle API errors gracefully:

```typescript
function PropertyList(): ReactElement {
  const { data, isLoading, error } = useProperties();

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!data?.data) return <EmptyState />;

  return <PropertyGrid properties={data.data.items} />;
}
```

## Testing

### File Naming

Test files should be named `*.test.tsx` or `*.test.ts` and placed alongside the component:

```
components/
├── Button.tsx
└── Button.test.tsx
```

### Testing Library

Use React Testing Library for component tests:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('renders with label', () => {
    render(<Button label="Click me" onClick={() => {}} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

## Path Aliases

Use the `@` alias for imports from the `src` directory:

```typescript
// GOOD
import { Button } from '@/components/ui';
import type { Property } from '@/types';

// BAD
import { Button } from '../../../components/ui';
```

## Forbidden Patterns

1. **No `any` type** - Always define proper types
2. **No class components** - Use functional components only
3. **No inline styles** - Use Tailwind CSS classes
4. **No direct DOM manipulation** - Use React refs when necessary
5. **No `var` keyword** - Use `const` or `let`
6. **No default exports for utilities** - Use named exports
7. **No mutation of props or state** - Always create new references
