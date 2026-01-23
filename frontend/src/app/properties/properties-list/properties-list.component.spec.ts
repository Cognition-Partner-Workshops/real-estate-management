import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule, IonInfiniteScroll } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { signal } from '@angular/core';
import { PropertiesListComponent } from './properties-list.component';
import { PropertiesService } from '../properties.service';
import { Property } from 'src/app/shared/interface/property';
import { PropertyType, TransactionType, PropertiesDisplayOption } from 'src/app/shared/enums/property';

describe('PropertiesListComponent', () => {
  let component: PropertiesListComponent;
  let fixture: ComponentFixture<PropertiesListComponent>;
  let propertiesServiceSpy: jasmine.SpyObj<PropertiesService>;
  let queryParamsSubject: BehaviorSubject<any>;

  const mockProperty1: Property = {
    property_id: 'prop-1',
    name: 'Property One',
    address: '123 Test St',
    type: PropertyType.residential,
    transactionType: TransactionType.forSale,
    position: { lat: 10.123, lng: 125.456 },
    price: 100000,
    user_id: 'user-1',
    createdAt: new Date('2024-01-01')
  };

  const mockProperty2: Property = {
    property_id: 'prop-2',
    name: 'Property Two',
    address: '456 Test Ave',
    type: PropertyType.commercial,
    transactionType: TransactionType.forRent,
    position: { lat: 10.456, lng: 125.789 },
    price: 200000,
    user_id: 'user-2',
    createdAt: new Date('2024-01-02')
  };

  const mockProperty3: Property = {
    property_id: 'prop-3',
    name: 'Luxury Villa',
    address: '789 Luxury Blvd',
    type: PropertyType.residential,
    transactionType: TransactionType.forSale,
    position: { lat: 10.789, lng: 125.123 },
    price: 500000,
    user_id: 'user-1',
    createdAt: new Date('2024-01-03')
  };

  beforeEach(waitForAsync(() => {
    queryParamsSubject = new BehaviorSubject({});

    const spy = jasmine.createSpyObj('PropertiesService', ['fetchProperties', 'setPropertiesState'], {
      properties: [],
      hasMore: signal(true),
      isLoading: signal(false)
    });
    spy.fetchProperties.and.returnValue(Promise.resolve({
      status: 200,
      data: { items: [], hasMore: false }
    }));

    TestBed.configureTestingModule({
      declarations: [PropertiesListComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: PropertiesService, useValue: spy },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: queryParamsSubject.asObservable()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PropertiesListComponent);
    component = fixture.componentInstance;
    propertiesServiceSpy = TestBed.inject(PropertiesService) as jasmine.SpyObj<PropertiesService>;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should have default display option as CardView', () => {
      expect(component.displayOption()).toBe(PropertiesDisplayOption.CardView);
    });

    it('should have singleCol as false by default', () => {
      expect(component.singleCol()).toBe(false);
    });

    it('should have horizontalSlide as false by default', () => {
      expect(component.horizontalSlide()).toBe(false);
    });

    it('should have limit as 0 by default', () => {
      expect(component.limit()).toBe(0);
    });

    it('should have enableOwnedBadge as false by default', () => {
      expect(component.enableOwnedBadge()).toBe(false);
    });

    it('should have enablePopupOptions as false by default', () => {
      expect(component.enablePopupOptions()).toBe(false);
    });
  });

  describe('propertiesList computed', () => {
    it('should return empty array when properties is undefined', () => {
      fixture.componentRef.setInput('properties', undefined);
      fixture.detectChanges();
      expect(component.propertiesList()).toEqual([]);
    });

    it('should return empty array when properties is null', () => {
      fixture.componentRef.setInput('properties', null);
      fixture.detectChanges();
      expect(component.propertiesList()).toEqual([]);
    });

    it('should return all properties when no limit is set', () => {
      fixture.componentRef.setInput('properties', [mockProperty1, mockProperty2, mockProperty3]);
      fixture.detectChanges();
      expect(component.propertiesList().length).toBe(3);
    });

    it('should limit properties when limit is set', () => {
      fixture.componentRef.setInput('properties', [mockProperty1, mockProperty2, mockProperty3]);
      fixture.componentRef.setInput('limit', 2);
      fixture.detectChanges();
      expect(component.propertiesList().length).toBe(2);
    });

    it('should sort properties by latest by default', () => {
      fixture.componentRef.setInput('properties', [mockProperty1, mockProperty2, mockProperty3]);
      fixture.detectChanges();
      const list = component.propertiesList();
      expect(list[0].property_id).toBe('prop-3');
    });

    it('should filter properties when filter query param is set', () => {
      fixture.componentRef.setInput('properties', [mockProperty1, mockProperty2, mockProperty3]);
      queryParamsSubject.next({ filter: 'residential' });
      fixture.detectChanges();
      const list = component.propertiesList();
      expect(list.every(p => p.type === PropertyType.residential)).toBe(true);
    });

    it('should search properties when search query param is set', () => {
      fixture.componentRef.setInput('properties', [mockProperty1, mockProperty2, mockProperty3]);
      queryParamsSubject.next({ search: 'Luxury' });
      fixture.detectChanges();
      const list = component.propertiesList();
      expect(list.length).toBe(1);
      expect(list[0].name).toBe('Luxury Villa');
    });

    it('should apply sort query param', () => {
      fixture.componentRef.setInput('properties', [mockProperty1, mockProperty2, mockProperty3]);
      queryParamsSubject.next({ sort: 'price-asc' });
      fixture.detectChanges();
      const list = component.propertiesList();
      expect(list[0].price).toBeLessThanOrEqual(list[1].price);
    });
  });

  describe('hasNoMore computed', () => {
    it('should return true when propertiesService.hasMore is false', () => {
      (propertiesServiceSpy.hasMore as any).set(false);
      expect(component.hasNoMore()).toBe(true);
    });

    it('should return false when propertiesService.hasMore is true', () => {
      (propertiesServiceSpy.hasMore as any).set(true);
      expect(component.hasNoMore()).toBe(false);
    });
  });

  describe('ngOnInit', () => {
    it('should fetch properties if none exist', () => {
      (propertiesServiceSpy as any).properties = [];
      component.ngOnInit();
      expect(propertiesServiceSpy.fetchProperties).toHaveBeenCalled();
    });

    it('should not fetch properties if they already exist', () => {
      (propertiesServiceSpy as any).properties = [mockProperty1];
      propertiesServiceSpy.fetchProperties.calls.reset();
      component.ngOnInit();
      expect(propertiesServiceSpy.fetchProperties).not.toHaveBeenCalled();
    });
  });

  describe('loadMoreProperty', () => {
    it('should be defined', () => {
      expect(component.loadMoreProperty).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle empty properties array', () => {
      fixture.componentRef.setInput('properties', []);
      fixture.detectChanges();
      expect(component.propertiesList()).toEqual([]);
    });

    it('should handle limit greater than properties length', () => {
      fixture.componentRef.setInput('properties', [mockProperty1]);
      fixture.componentRef.setInput('limit', 10);
      fixture.detectChanges();
      expect(component.propertiesList().length).toBe(1);
    });

    it('should handle combined search and filter', () => {
      fixture.componentRef.setInput('properties', [mockProperty1, mockProperty2, mockProperty3]);
      queryParamsSubject.next({ search: 'Property', filter: 'residential' });
      fixture.detectChanges();
      const list = component.propertiesList();
      expect(list.length).toBe(1);
      expect(list[0].property_id).toBe('prop-1');
    });

    it('should handle search with no results', () => {
      fixture.componentRef.setInput('properties', [mockProperty1, mockProperty2]);
      queryParamsSubject.next({ search: 'NonExistent' });
      fixture.detectChanges();
      expect(component.propertiesList().length).toBe(0);
    });

    it('should handle filter with no results', () => {
      fixture.componentRef.setInput('properties', [mockProperty1, mockProperty3]);
      queryParamsSubject.next({ filter: 'commercial' });
      fixture.detectChanges();
      expect(component.propertiesList().length).toBe(0);
    });
  });
});
