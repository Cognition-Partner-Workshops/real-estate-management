import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PropertiesService } from './properties.service';
import { UserService } from '../user/user.service';
import { Property } from '../shared/interface/property';
import { PropertyType, TransactionType } from '../shared/enums/property';
import { environment } from 'src/environments/environment';

describe('PropertiesService', () => {
  let service: PropertiesService;
  let httpMock: HttpTestingController;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  const mockProperty: Property = {
    property_id: 'prop-123',
    name: 'Test Property',
    address: '123 Test St',
    description: 'A test property description',
    type: PropertyType.residential,
    transactionType: TransactionType.forSale,
    position: { lat: 10.123, lng: 125.456 },
    price: 100000,
    user_id: 'user-123',
    images: ['image1.jpg', 'image2.jpg'],
    features: ['pool', 'garage']
  };

  const mockProperty2: Property = {
    property_id: 'prop-456',
    name: 'Another Property',
    address: '456 Another St',
    type: PropertyType.commercial,
    transactionType: TransactionType.forRent,
    position: { lat: 11.123, lng: 126.456 },
    price: 50000,
    user_id: 'user-456'
  };

  beforeEach(() => {
    const spy = jasmine.createSpyObj('UserService', ['isPropertyOwner'], {
      token: 'test-token'
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PropertiesService,
        { provide: UserService, useValue: spy }
      ]
    });

    service = TestBed.inject(PropertiesService);
    httpMock = TestBed.inject(HttpTestingController);
    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('properties getter/setter', () => {
    it('should return empty array when no properties set', () => {
      expect(service.properties).toEqual([]);
    });

    it('should set and get properties', () => {
      service.properties = [mockProperty];
      expect(service.properties).toEqual([mockProperty]);
    });

    it('should emit properties through observable', (done) => {
      service.properties$.subscribe(props => {
        if (props && props.length > 0) {
          expect(props).toEqual([mockProperty]);
          done();
        }
      });
      service.properties = [mockProperty];
    });
  });

  describe('propertiesOwned getter/setter', () => {
    it('should return undefined when no owned properties set', () => {
      expect(service.propertiesOwned).toBeUndefined();
    });

    it('should set and get owned properties', () => {
      service.propertiesOwned = [mockProperty];
      expect(service.propertiesOwned).toEqual([mockProperty]);
    });
  });

  describe('fetchProperties', () => {
    const propertyUrl = environment.api.server + 'properties';

    it('should fetch properties with default parameters', async () => {
      const mockResponse = {
        status: 200,
        message: 'Success',
        data: {
          items: [mockProperty],
          lastCreatedAt: '2024-01-01',
          hasMore: true
        }
      };

      const promise = service.fetchProperties();

      const req = httpMock.expectOne(r => r.url.includes(propertyUrl));
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('limit')).toBe('12');
      expect(req.request.params.get('sort')).toBe('latest');
      req.flush(mockResponse);

      const result = await promise;
      expect(result.status).toBe(200);
      expect(result.data.items).toEqual([mockProperty]);
    });

    it('should fetch properties with custom sort parameter', async () => {
      const mockResponse = {
        status: 200,
        message: 'Success',
        data: { items: [], hasMore: false }
      };

      const promise = service.fetchProperties('price');

      const req = httpMock.expectOne(r => r.url.includes(propertyUrl));
      expect(req.request.params.get('sort')).toBe('price');
      req.flush(mockResponse);

      await promise;
    });

    it('should fetch properties with filter parameter', async () => {
      const mockResponse = {
        status: 200,
        message: 'Success',
        data: { items: [], hasMore: false }
      };

      const promise = service.fetchProperties('latest', 'residential,commercial');

      const req = httpMock.expectOne(r => r.url.includes(propertyUrl));
      expect(req.request.params.get('filter')).toBe('residential,commercial');
      req.flush(mockResponse);

      await promise;
    });

    it('should fetch properties with search parameter', async () => {
      const mockResponse = {
        status: 200,
        message: 'Success',
        data: { items: [], hasMore: false }
      };

      const promise = service.fetchProperties('latest', undefined, 'beach house');

      const req = httpMock.expectOne(r => r.url.includes(propertyUrl));
      expect(req.request.params.get('search')).toBe('beach house');
      req.flush(mockResponse);

      await promise;
    });

    it('should handle fetch error', async () => {
      const promise = service.fetchProperties();

      const req = httpMock.expectOne(r => r.url.includes(propertyUrl));
      req.flush({ message: 'Server error' }, { status: 500, statusText: 'Internal Server Error' });

      const result = await promise;
      expect(result.message).toBe('Server error');
    });
  });

  describe('fetchProperty', () => {
    const propertyUrl = environment.api.server + 'properties';

    it('should fetch a single property by id', async () => {
      const mockResponse = {
        status: 200,
        message: 'Success',
        data: mockProperty
      };

      const promise = service.fetchProperty('prop-123');

      const req = httpMock.expectOne(`${propertyUrl}/prop-123`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);

      const result = await promise;
      expect(result.status).toBe(200);
      expect(result.data).toEqual(mockProperty);
    });

    it('should handle fetch property error', async () => {
      const promise = service.fetchProperty('invalid-id');

      const req = httpMock.expectOne(`${propertyUrl}/invalid-id`);
      req.flush({ message: 'Property not found' }, { status: 404, statusText: 'Not Found' });

      const result = await promise;
      expect(result.message).toBe('Property not found');
    });
  });

  describe('addProperty', () => {
    const propertyUrl = environment.api.server + 'properties';

    it('should add a new property', async () => {
      const mockResponse = {
        status: 201,
        message: 'Property created',
        data: mockProperty
      };

      const promise = service.addProperty(mockProperty);

      const req = httpMock.expectOne(propertyUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockProperty);
      req.flush(mockResponse);

      const result = await promise;
      expect(result.status).toBe(201);
      expect(result.data).toEqual(mockProperty);
    });

    it('should handle add property error', async () => {
      const promise = service.addProperty(mockProperty);

      const req = httpMock.expectOne(propertyUrl);
      req.flush({ message: 'Validation error' }, { status: 400, statusText: 'Bad Request' });

      const result = await promise;
      expect(result.message).toBe('Validation error');
    });
  });

  describe('addPropertyImage', () => {
    const propertyUrl = environment.api.server + 'properties';

    it('should upload images for a property', async () => {
      const mockResponse = {
        status: 200,
        message: 'Images uploaded',
        data: ['image1.jpg', 'image2.jpg']
      };

      const file1 = new File([''], 'image1.jpg', { type: 'image/jpeg' });
      const file2 = new File([''], 'image2.jpg', { type: 'image/jpeg' });

      const promise = service.addPropertyImage([file1, file2], 'prop-123');

      const req = httpMock.expectOne(`${propertyUrl}/upload/images/prop-123`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBeTrue();
      req.flush(mockResponse);

      const result = await promise;
      expect(result.status).toBe(200);
      expect(result.data).toEqual(['image1.jpg', 'image2.jpg']);
    });

    it('should handle image upload error', async () => {
      const file = new File([''], 'image.jpg', { type: 'image/jpeg' });

      const promise = service.addPropertyImage([file], 'prop-123');

      const req = httpMock.expectOne(`${propertyUrl}/upload/images/prop-123`);
      req.flush({ message: 'Upload failed' }, { status: 500, statusText: 'Internal Server Error' });

      const result = await promise;
      expect(result.message).toBe('Upload failed');
    });
  });

  describe('deletePropertyImage', () => {
    const propertyUrl = environment.api.server + 'properties';

    it('should delete images from a property', async () => {
      const mockResponse = {
        status: 200,
        message: 'Images deleted',
        data: ['remaining-image.jpg']
      };

      const promise = service.deletePropertyImage(['image1.jpg'], 'prop-123');

      const req = httpMock.expectOne(`${propertyUrl}/upload/images/prop-123`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);

      const result = await promise;
      expect(result.status).toBe(200);
    });
  });

  describe('removeProperty', () => {
    const propertyUrl = environment.api.server + 'properties';

    it('should remove a property', async () => {
      const mockResponse = {
        status: 200,
        message: 'Property deleted',
        data: mockProperty
      };

      const promise = service.removeProperty('prop-123');

      const req = httpMock.expectOne(`${propertyUrl}/prop-123`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);

      const result = await promise;
      expect(result.status).toBe(200);
    });
  });

  describe('updateProperty', () => {
    const propertyUrl = environment.api.server + 'properties';

    it('should update a property', async () => {
      const updatedProperty = { ...mockProperty, name: 'Updated Name' };
      const mockResponse = {
        status: 200,
        message: 'Property updated',
        data: updatedProperty
      };

      const promise = service.updateProperty(updatedProperty);

      const req = httpMock.expectOne(`${propertyUrl}/${mockProperty.property_id}`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updatedProperty);
      req.flush(mockResponse);

      const result = await promise;
      expect(result.status).toBe(200);
      expect(result.data.name).toBe('Updated Name');
    });

    it('should handle update error', async () => {
      const promise = service.updateProperty(mockProperty);

      const req = httpMock.expectOne(`${propertyUrl}/${mockProperty.property_id}`);
      req.flush({ message: 'Update failed' }, { status: 400, statusText: 'Bad Request' });

      const result = await promise;
      expect(result.message).toBe('Update failed');
    });
  });

  describe('fetchOwnedProperties', () => {
    const propertyUrl = environment.api.server + 'properties';

    it('should fetch user owned properties', async () => {
      const mockResponse = {
        status: 200,
        message: 'Success',
        data: [mockProperty]
      };

      const promise = service.fetchOwnedProperties();

      const req = httpMock.expectOne(`${propertyUrl}/me`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);

      const result = await promise;
      expect(result.status).toBe(200);
      expect(result.data).toEqual([mockProperty]);
    });

    it('should handle fetch owned properties error', async () => {
      const promise = service.fetchOwnedProperties();

      const req = httpMock.expectOne(`${propertyUrl}/me`);
      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

      const result = await promise;
      expect(result.message).toBe('Unauthorized');
    });
  });

  describe('addPropertyToState', () => {
    it('should add property to properties array', () => {
      service.properties = [mockProperty];
      service.addPropertyToState(mockProperty2);

      expect(service.properties.length).toBe(2);
      expect(service.properties).toContain(mockProperty2);
    });

    it('should add property to propertiesOwned if it exists', () => {
      service.properties = [];
      service.propertiesOwned = [mockProperty];
      service.addPropertyToState(mockProperty2);

      expect(service.propertiesOwned.length).toBe(2);
      expect(service.propertiesOwned).toContain(mockProperty2);
    });

    it('should not add to propertiesOwned if it is undefined', () => {
      service.properties = [];
      service.addPropertyToState(mockProperty);

      expect(service.properties.length).toBe(1);
      expect(service.propertiesOwned).toBeUndefined();
    });
  });

  describe('removePropertyFromState', () => {
    it('should remove property from properties array', () => {
      service.properties = [mockProperty, mockProperty2];
      service.removePropertyFromState('prop-123');

      expect(service.properties.length).toBe(1);
      expect(service.properties[0].property_id).toBe('prop-456');
    });

    it('should remove property from propertiesOwned if it exists', () => {
      service.properties = [mockProperty, mockProperty2];
      service.propertiesOwned = [mockProperty, mockProperty2];
      service.removePropertyFromState('prop-123');

      expect(service.propertiesOwned.length).toBe(1);
      expect(service.propertiesOwned[0].property_id).toBe('prop-456');
    });

    it('should handle removal when property not found', () => {
      service.properties = [mockProperty];
      service.removePropertyFromState('non-existent');

      expect(service.properties.length).toBe(1);
    });
  });

  describe('resetState', () => {
    it('should reset all state', () => {
      service.properties = [mockProperty];
      service.propertiesOwned = [mockProperty];

      service.resetState();

      expect(service.properties).toEqual([]);
      expect(service.propertiesOwned).toEqual([]);
    });

    it('should skip resetting propertiesOwned when skipOwned is true', () => {
      service.properties = [mockProperty];
      service.propertiesOwned = [mockProperty];

      service.resetState({ skipOwned: true });

      expect(service.properties).toEqual([]);
      expect(service.propertiesOwned).toEqual([mockProperty]);
    });
  });

  describe('setPropertiesState', () => {
    it('should append properties to existing state', () => {
      service.properties = [mockProperty];
      service.setPropertiesState([mockProperty2], {
        lastCreatedAt: '2024-01-01',
        lastPrice: 50000,
        lastName: 'Another Property'
      });

      expect(service.properties.length).toBe(2);
      expect(service.properties).toContain(mockProperty);
      expect(service.properties).toContain(mockProperty2);
    });

    it('should handle empty last parameters', () => {
      service.properties = [];
      service.setPropertiesState([mockProperty], {});

      expect(service.properties.length).toBe(1);
    });
  });

  describe('signals', () => {
    it('should have isLoading signal initialized to false', () => {
      expect(service.isLoading()).toBe(false);
    });

    it('should have hasMore signal initialized to true', () => {
      expect(service.hasMore()).toBe(true);
    });

    it('should update isLoading signal', () => {
      service.isLoading.set(true);
      expect(service.isLoading()).toBe(true);
    });

    it('should update hasMore signal', () => {
      service.hasMore.set(false);
      expect(service.hasMore()).toBe(false);
    });
  });
});
