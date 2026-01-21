# Dependency Analysis Report

## Focus: Properties, Map, and Mortgage-Calc Modules

---

## 1. Angular Core Packages

| Package | Version | Purpose | React Equivalent |
|---------|---------|---------|------------------|
| @angular/common | ^19.2.10 | Common utilities, pipes, directives | Built-in JS/React utilities |
| @angular/core | ^19.2.10 | Core framework | React 18+ |
| @angular/forms | ^19.2.10 | Reactive forms, validation | React Hook Form or Formik |
| @angular/platform-browser | ^19.2.10 | Browser platform | react-dom |
| @angular/platform-browser-dynamic | ^19.2.10 | JIT compilation | N/A (not needed) |
| @angular/router | ^19.2.10 | Routing | React Router v6 |
| @angular/compiler | ^19.2.10 | Template compiler | N/A (JSX) |

---

## 2. Ionic Framework Packages

| Package | Version | Purpose | React Equivalent |
|---------|---------|---------|------------------|
| @ionic/angular | ^8.2.2 | Ionic UI components for Angular | @ionic/react ^8.x |
| @ionic/core | ^8.2.2 | Core Ionic components | Included with @ionic/react |
| @ionic/storage-angular | ^4.0.0 | Local storage abstraction | @ionic/storage (works with React) |
| @ionic/angular-toolkit | ^7.0.0 | Angular CLI schematics | N/A |

**Migration Note:** Ionic has first-class React support. Most components have direct equivalents in @ionic/react.

---

## 3. Capacitor Packages (Mobile)

| Package | Version | Purpose | React Equivalent |
|---------|---------|---------|------------------|
| @capacitor/core | ^4.8.2 | Capacitor runtime | Same (works with React) |
| @capacitor/android | ^4.8.2 | Android platform | Same (works with React) |
| @capacitor/app | ^4.0.0 | App lifecycle plugin | Same (works with React) |
| @capacitor/haptics | ^4.0.0 | Haptic feedback | Same (works with React) |
| @capacitor/keyboard | ^4.0.0 | Keyboard handling | Same (works with React) |
| @capacitor/status-bar | ^4.0.0 | Status bar control | Same (works with React) |
| @capacitor/cli | ^4.8.2 | CLI tools | Same |

**Migration Note:** Capacitor is framework-agnostic. All plugins work identically with React.

---

## 4. Third-Party UI Libraries

| Package | Version | Purpose | React Equivalent |
|---------|---------|---------|------------------|
| chart.js | ^3.5.1 | Charts and graphs | react-chartjs-2 + chart.js |
| leaflet | ^1.9.4 | Interactive maps | react-leaflet |
| leaflet-geosearch | ^3.7.0 | Map search functionality | Same (works with react-leaflet) |
| swiper | ^11.0.4 | Carousel/slider | swiper/react (built-in React support) |
| @ckeditor/ckeditor5-angular | ^6.0.1 | Rich text editor | @ckeditor/ckeditor5-react |
| @ckeditor/ckeditor5-build-classic | ^37.0.0 | CKEditor build | Same |

---

## 5. Styling Libraries

| Package | Version | Purpose | React Equivalent |
|---------|---------|---------|------------------|
| tailwindcss | ^4.1.6 | Utility-first CSS | Same (works with React) |
| @tailwindcss/cli | ^4.1.6 | Tailwind CLI | Same |

**Migration Note:** Tailwind CSS is framework-agnostic and works identically with React.

---

## 6. RxJS and Utilities

| Package | Version | Purpose | React Equivalent |
|---------|---------|---------|------------------|
| rxjs | ^7.5.0 | Reactive programming | TanStack Query, Zustand, or custom hooks |
| tslib | ^2.3.1 | TypeScript helpers | Same |
| zone.js | ^0.15.0 | Change detection | N/A (React uses different model) |

---

## 7. Markdown Support

| Package | Version | Purpose | React Equivalent |
|---------|---------|---------|------------------|
| ngx-markdown | ^19.1.1 | Markdown rendering | react-markdown |
| @ngx-markdown/core | ^0.2.2 | Markdown core | react-markdown |

---

## 8. Type Definitions

| Package | Version | Purpose |
|---------|---------|---------|
| @types/leaflet | ^1.7.5 | Leaflet TypeScript types |
| @types/google.maps | ^3.51.0 | Google Maps types |
| @types/node | ^12.20.23 | Node.js types |

---

## 9. Development Dependencies

| Package | Version | Purpose | React Equivalent |
|---------|---------|---------|------------------|
| @angular-devkit/build-angular | ^19.2.11 | Build tools | Vite or Create React App |
| @angular/cli | ^19.2.11 | CLI | Vite CLI |
| typescript | ^5.7.3 | TypeScript | Same |
| eslint | ^8.53.0 | Linting | Same + eslint-plugin-react |
| karma | ^6.4.4 | Test runner | Vitest or Jest |
| karma-jasmine | ~4.0.0 | Test framework | Vitest or Jest |
| karma-chrome-launcher | ~3.1.0 | Browser testing | Playwright or Cypress |

---

## 10. Recommended React Stack

### Core Framework
```json
{
  "react": "^18.3.0",
  "react-dom": "^18.3.0",
  "react-router-dom": "^6.x",
  "typescript": "^5.7.3"
}
```

### Ionic/Capacitor (Mobile)
```json
{
  "@ionic/react": "^8.2.2",
  "@ionic/react-router": "^8.2.2",
  "@capacitor/core": "^4.8.2",
  "@capacitor/android": "^4.8.2",
  "@capacitor/app": "^4.0.0",
  "@capacitor/haptics": "^4.0.0",
  "@capacitor/keyboard": "^4.0.0",
  "@capacitor/status-bar": "^4.0.0"
}
```

### State Management
```json
{
  "zustand": "^4.5.0",
  "@tanstack/react-query": "^5.x"
}
```

### Forms
```json
{
  "react-hook-form": "^7.x",
  "zod": "^3.x"
}
```

### Maps & Charts
```json
{
  "react-leaflet": "^4.x",
  "leaflet": "^1.9.4",
  "leaflet-geosearch": "^3.7.0",
  "react-chartjs-2": "^5.x",
  "chart.js": "^4.x"
}
```

### UI & Styling
```json
{
  "tailwindcss": "^4.1.6",
  "swiper": "^11.0.4",
  "@ckeditor/ckeditor5-react": "^6.x"
}
```

### Utilities
```json
{
  "react-markdown": "^9.x",
  "@ionic/storage": "^4.0.0"
}
```

### Development
```json
{
  "vite": "^5.x",
  "@vitejs/plugin-react": "^4.x",
  "vitest": "^1.x",
  "@testing-library/react": "^14.x",
  "eslint": "^8.x",
  "eslint-plugin-react": "^7.x",
  "eslint-plugin-react-hooks": "^4.x"
}
```

---

## 11. Migration Complexity by Dependency

### Low Complexity (Direct equivalents exist)
- Tailwind CSS - No changes needed
- Capacitor plugins - Framework-agnostic
- Chart.js - Use react-chartjs-2 wrapper
- Swiper - Has built-in React support
- CKEditor - Has React wrapper
- Leaflet - Use react-leaflet

### Medium Complexity (Pattern changes required)
- Ionic components - Use @ionic/react equivalents
- RxJS Observables - Convert to hooks/Zustand
- Angular Forms - Convert to React Hook Form
- Angular Router - Convert to React Router

### High Complexity (Significant refactoring)
- Angular Signals - Convert to useState/useMemo patterns
- BehaviorSubject state - Convert to Zustand stores
- Ionic lifecycle hooks - Convert to useEffect patterns
- Zone.js change detection - React handles differently
