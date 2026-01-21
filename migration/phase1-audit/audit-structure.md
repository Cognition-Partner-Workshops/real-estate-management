# Angular Application Structure Audit

## Focus Modules: Properties, Map, Mortgage-Calc

---

## 1. Module Inventory

### Properties Module (`properties.module.ts`)

**Path:** `frontend/src/app/properties/properties.module.ts`

**Imports:**
- CommonModule
- IonicModule
- PropertiesPageRoutingModule
- SharedModule
- EnquiriesPageModule
- MortgageCalcPageModule

**Declarations:**
- PropertiesPage
- PropertiesNewComponent
- PropertiesListComponent
- PropertiesCardComponent
- PropertiesDetailComponent
- PropertiesEditComponent
- PropertiesCoordinatesComponent
- PropertiesUploadsComponent
- PropertiesGalleryComponent
- PropertiesCurrentImagesComponent
- PropertiesListItemComponent

**Exports:**
- PropertiesListComponent
- PropertiesCardComponent

**Schemas:** CUSTOM_ELEMENTS_SCHEMA (for Swiper web components)

---

### Map Module (`map.module.ts`)

**Path:** `frontend/src/app/map/map.module.ts`

**Imports:**
- CommonModule
- FormsModule
- IonicModule
- MapPageRoutingModule
- SharedModule
- PropertiesPageModule

**Declarations:**
- MapPage
- MapPopupComponent
- MapMarkersLegendComponent
- ModalSearchComponent

**Exports:** None

---

### Mortgage-Calc Module (`mortgage-calc.module.ts`)

**Path:** `frontend/src/app/mortgage-calc/mortgage-calc.module.ts`

**Imports:**
- CommonModule
- FormsModule
- IonicModule
- MortgageCalcPageRoutingModule
- SharedModule

**Declarations:**
- MortgageCalcPage
- MortgageCoreCalcComponent
- MortgagePieChartComponent
- MortgageLineChartComponent

**Exports:**
- MortgageCoreCalcComponent

---

### Shared Module (`shared.module.ts`)

**Path:** `frontend/src/app/shared/shared.module.ts`

**Declarations:**
- ActionPopupComponent
- PropertyBadgeComponent
- DivHorizontalSlideComponent
- AlertCardComponent
- ContactFormComponent
- EnquiryBadgeComponent
- MapLeafletComponent
- MapSearchFieldComponent
- FooterComponent
- NeedSigninContinueComponent
- NotificationBellComponent
- NotificationBadgeComponent

**Exports:** All declared components plus FormsModule, ReactiveFormsModule

---

## 2. Component Inventory

### Properties Module Components

| Component | Selector | Standalone | Inputs | Outputs | Lifecycle Hooks |
|-----------|----------|------------|--------|---------|-----------------|
| PropertiesPage | app-properties | false | - | - | ngOnInit |
| PropertiesListComponent | app-properties-list | false | displayOption (signal input), singleCol (signal input), horizontalSlide (signal input), limit (signal input), enableOwnedBadge (signal input), enablePopupOptions (signal input), properties (signal input), disableInfinitScroll (model) | - | ngOnInit |
| PropertiesCardComponent | app-properties-card | false | property (@Input) | - | - |
| PropertiesDetailComponent | app-properties-detail | false | - | - | ngOnInit |
| PropertiesNewComponent | app-properties-new | false | - | - | ngOnInit |
| PropertiesEditComponent | app-properties-edit | false | property (@Input) | - | ngOnInit |
| PropertiesCoordinatesComponent | app-properties-coordinates | false | title (@Input) | - | ngOnInit |
| PropertiesUploadsComponent | app-properties-uploads | false | property (@Input) | - | ngOnInit |
| PropertiesGalleryComponent | app-properties-gallery | false | images (signal input), showEdit (signal input) | edit (@Output EventEmitter) | ngOnInit |
| PropertiesCurrentImagesComponent | app-properties-current-images | false | images (@Input), id (@Input) | delete (@Output EventEmitter) | ngOnInit |
| PropertiesListItemComponent | app-properties-list-item | false | property (signal input), enableOwnedBadge (@Input) | - | - |

### Map Module Components

| Component | Selector | Standalone | Inputs | Outputs | Lifecycle Hooks |
|-----------|----------|------------|--------|---------|-----------------|
| MapPage | app-map | false | - | - | - |
| MapLeafletComponent | app-map-leaflet | false | clickAddMarker (signal input), showPropertyMarkers (signal input), visibleMarkerType (signal input) | clickedAt (signal output) | ngAfterViewInit, ngOnChanges |
| MapPopupComponent | app-map-popup | false | property (@Input) | - | ngOnInit |
| MapMarkersLegendComponent | app-map-markers-legend | false | - | toggledMarker (@Output EventEmitter) | ngOnInit |
| MapSearchFieldComponent | app-map-search-field | false | - | selectedLocation (@Output EventEmitter) | ngOnInit |

### Mortgage-Calc Module Components

| Component | Selector | Standalone | Inputs | Outputs | Lifecycle Hooks |
|-----------|----------|------------|--------|---------|-----------------|
| MortgageCalcPage | app-mortgage-calc | false | - | - | ngOnInit |
| MortgageCoreCalcComponent | app-mortgage-core-calc | false | payPerYear (@Input), simpleMode (@Input), boxShadow (@Input) | formValue (@Output EventEmitter), amortizationSchedule (@Output EventEmitter), scheduleChanged (@Output EventEmitter) | ngAfterViewInit |
| MortgagePieChartComponent | app-mortgage-pie-chart | false | - | - | ngOnInit |
| MortgageLineChartComponent | app-mortgage-line-chart | false | - | generateSchedule (@Output EventEmitter) | ngOnInit |

---

## 3. Service Inventory

### PropertiesService (`properties.service.ts`)

**Path:** `frontend/src/app/properties/properties.service.ts`

**Provided In:** root

**Dependencies (DI):**
- HttpClient
- UserService

**State Management:**
- `propertiesSub: BehaviorSubject<Property[] | undefined>`
- `propertiesOwnedSub: BehaviorSubject<Property[] | undefined>`
- `isLoading: signal(false)`
- `hasMore: signal(true)`

**Public Observables:**
- `properties$: Observable<Property[] | undefined>`
- `propertiesOwned$: Observable<Property[] | undefined>`

**HTTP Methods:**

| Method | HTTP Verb | Endpoint | Parameters | Return Type |
|--------|-----------|----------|------------|-------------|
| fetchProperties | GET | /properties | sort, filter, search, limit, lastCreatedAt, lastPrice, lastName | ApiResponse<{items, lastCreatedAt, lastPrice, lastName, hasMore}> |
| fetchProperty | GET | /properties/:id | id | ApiResponse<Property> |
| addProperty | POST | /properties | property body | ApiResponse<Property> |
| addPropertyImage | POST | /properties/upload/images/:id | files (FormData), id | ApiResponse<string[]> |
| deletePropertyImage | DELETE | /properties/upload/images/:id | images, propId | ApiResponse<string[]> |
| removeProperty | DELETE | /properties/:id | propId | ApiResponse<Property> |
| updateProperty | PATCH | /properties/:id | updated property | ApiResponse<Property> |
| fetchOwnedProperties | GET | /properties/me | - | ApiResponse<Property[]> |

---

### MapService (`map.service.ts`)

**Path:** `frontend/src/app/map/map.service.ts`

**Provided In:** root

**Dependencies (DI):** None

**Methods:**
- `addTiles(map: L.Map, isDark: boolean)` - Adds tile layer to Leaflet map
- `addMarker(map: L.Map, coord: Coord, options)` - Creates and returns a Leaflet marker

---

### StorageService (`storage.service.ts`)

**Path:** `frontend/src/app/shared/services/storage/storage.service.ts`

**Provided In:** root

**Dependencies (DI):**
- Storage (@ionic/storage-angular)

**Methods:**
- `init()` - Initialize Ionic Storage
- `set(key, value)` - Generic setter
- `get(key)` - Generic getter
- `setDarkTheme(value)` / `getDartTheme()` - Theme persistence
- `setCoord(coord)` / `getCoord()` - Map coordinates persistence
- `setUser(user)` / `getUser()` / `removeUser()` - User session persistence

---

### WebSocketService (`web-socket.service.ts`)

**Path:** `frontend/src/app/web-scoket/web-socket.service.ts`

**Provided In:** root

**Dependencies (DI):**
- EnquiriesService
- ActivitiesService
- NotificationsService

**Methods:**
- `connect(token)` - Establish WebSocket connection
- `send(message)` - Send message through WebSocket
- `disconnect()` - Close WebSocket connection
- `handleNotification(notification)` - Process incoming notifications

---

## 4. Angular Signals Usage Inventory

### Signal Functions Used

| Function | Component/Service | Usage |
|----------|-------------------|-------|
| `signal()` | PropertiesPage | search, filterBy, sortBy, disableInfinitScroll, displayOption |
| `signal()` | PropertiesDetailComponent | property, ready |
| `signal()` | MapPage | visibleType |
| `signal()` | PropertiesService | isLoading, hasMore |
| `computed()` | PropertiesPage | isLoading (derived from service) |
| `computed()` | PropertiesDetailComponent | isOwner |
| `computed()` | PropertiesListComponent | hasNoMore, propertiesList |
| `computed()` | PropertiesListItemComponent | isOwner |
| `toSignal()` | PropertiesPage | properties (from properties$), queryParams |
| `toSignal()` | PropertiesListComponent | queryParams |
| `toSignal()` | PropertiesListItemComponent | user (from user$) |
| `toSignal()` | MapPage | properties (from properties$) |
| `toSignal()` | MapLeafletComponent | (via takeUntilDestroyed) |
| `input()` | PropertiesListComponent | displayOption, singleCol, horizontalSlide, limit, enableOwnedBadge, enablePopupOptions, properties |
| `input()` | PropertiesGalleryComponent | images, showEdit |
| `input()` | PropertiesListItemComponent | property |
| `input()` | MapLeafletComponent | clickAddMarker, showPropertyMarkers, visibleMarkerType |
| `output()` | MapLeafletComponent | clickedAt |
| `model()` | PropertiesListComponent | disableInfinitScroll |
| `takeUntilDestroyed()` | MapLeafletComponent | RxJS subscription cleanup |

---

## 5. Directives and Pipes Inventory

### Custom Directives
None found in the focused modules.

### Custom Pipes
None found in the focused modules.

### Built-in Pipes Used
- `currency` - Used in properties-detail for price formatting
- `*ngFor` directive
- `*ngIf` directive
- `@if` / `@for` control flow (Angular 17+ syntax)

---

## 6. Interfaces and Types

### Property Interface
```typescript
interface Property {
  property_id: string;
  name: string;
  address: string;
  description?: string;
  type: PropertyType;
  transactionType: TransactionType;
  position: Coord;
  price: number;
  paymentFrequency?: PaymentFrequency;
  enquiries?: string[];
  features?: string[];
  images?: string[];
  currency?: string;
  contactNumber?: string;
  contactEmail?: string;
  createdAt?: Date;
  updatedAt?: Date;
  user_id: string;
}
```

### Coord Interface
```typescript
interface Coord {
  lat: number;
  lng: number;
}
```

### Enums
```typescript
enum PropertyType {
  residential = 'residential',
  commercial = 'commercial',
  industrial = 'industrial',
  land = 'land'
}

enum TransactionType {
  forSale = 'sale',
  forRent = 'rent'
}

enum PaymentFrequency {
  yearly = 'yearly',
  quarterly = 'quarterly',
  monthly = 'monthly',
  biWeekly = 'bi-weekly',
  weekly = 'weekly',
  daily = 'daily'
}

enum PropertiesDisplayOption {
  CardView = 'cards',
  ListView = 'list'
}
```
