import { useState, useMemo } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonBadge,
} from '@ionic/react';
import { useInfiniteProperties } from '@/hooks';
import type { PropertyType, PropertySort, Property } from '@/types';

function PropertyCard({ property }: { property: Property }) {
  return (
    <IonCard routerLink={`/properties/${property.property_id}`}>
      <IonCardHeader>
        <IonCardTitle>{property.name}</IonCardTitle>
        <IonCardSubtitle>{property.address}</IonCardSubtitle>
      </IonCardHeader>
      <IonCardContent>
        <div className="ion-margin-bottom">
          <IonBadge color="primary">{property.type}</IonBadge>
          <IonBadge color="secondary" className="ion-margin-start">
            {property.transactionType === 'sale' ? 'For Sale' : 'For Rent'}
          </IonBadge>
        </div>
        <p className="ion-text-bold">
          {property.currency || '$'}
          {property.price.toLocaleString()}
          {property.transactionType === 'rent' && property.paymentFrequency
            ? ` / ${property.paymentFrequency}`
            : ''}
        </p>
      </IonCardContent>
    </IonCard>
  );
}

function PropertiesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<PropertyType | ''>('');
  const [sortOption, setSortOption] = useState<PropertySort>('latest');

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteProperties({
    sort: sortOption,
    filter: filterType ? { type: filterType as PropertyType } : undefined,
    search: searchTerm || undefined,
  });

  const properties = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data]
  );

  const handleInfiniteScroll = async (event: CustomEvent<void>) => {
    if (hasNextPage) {
      await fetchNextPage();
    }
    (event.target as HTMLIonInfiniteScrollElement).complete();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Properties</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar
            value={searchTerm}
            onIonInput={(e) => setSearchTerm(e.detail.value || '')}
            placeholder="Search properties..."
            debounce={300}
          />
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItem>
            <IonLabel>Filter by Type</IonLabel>
            <IonSelect
              value={filterType}
              onIonChange={(e) => setFilterType(e.detail.value)}
              placeholder="All Types"
            >
              <IonSelectOption value="">All Types</IonSelectOption>
              <IonSelectOption value="residential">Residential</IonSelectOption>
              <IonSelectOption value="commercial">Commercial</IonSelectOption>
              <IonSelectOption value="industrial">Industrial</IonSelectOption>
              <IonSelectOption value="land">Land</IonSelectOption>
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel>Sort By</IonLabel>
            <IonSelect
              value={sortOption}
              onIonChange={(e) => setSortOption(e.detail.value)}
            >
              <IonSelectOption value="latest">Latest</IonSelectOption>
              <IonSelectOption value="oldest">Oldest</IonSelectOption>
              <IonSelectOption value="price-asc">Price: Low to High</IonSelectOption>
              <IonSelectOption value="price-desc">Price: High to Low</IonSelectOption>
              <IonSelectOption value="name-asc">Name: A to Z</IonSelectOption>
              <IonSelectOption value="name-desc">Name: Z to A</IonSelectOption>
            </IonSelect>
          </IonItem>
        </IonList>

        {isLoading ? (
          <div className="ion-text-center ion-padding">
            <IonSpinner />
          </div>
        ) : properties.length === 0 ? (
          <div className="ion-text-center ion-padding">
            <p>No properties found</p>
          </div>
        ) : (
          <>
            {properties.map((property) => (
              <PropertyCard key={property.property_id} property={property} />
            ))}
          </>
        )}

        <IonInfiniteScroll
          onIonInfinite={handleInfiniteScroll}
          disabled={!hasNextPage || isFetchingNextPage}
        >
          <IonInfiniteScrollContent
            loadingSpinner="bubbles"
            loadingText="Loading more properties..."
          />
        </IonInfiniteScroll>
      </IonContent>
    </IonPage>
  );
}

export default PropertiesPage;
