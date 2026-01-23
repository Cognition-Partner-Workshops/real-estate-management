import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EnquiriesService } from './enquiries.service';
import { UserService } from '../user/user.service';
import { Enquiry } from '../shared/interface/enquiry';
import { environment } from 'src/environments/environment';

describe('EnquiriesService', () => {
  let service: EnquiriesService;
  let httpMock: HttpTestingController;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  const mockEnquiry: Enquiry = {
    enquiry_id: 'enq-123',
    content: 'Test enquiry content',
    email: 'test@example.com',
    title: 'Test Enquiry Title',
    topic: 'info',
    read: false,
    property: {
      property_id: 'prop-123',
      name: 'Test Property'
    },
    users: {
      from: { user_id: 'user-123', keep: true },
      to: { user_id: 'user-456', keep: true }
    },
    createdAt: '2024-01-01T00:00:00Z'
  };

  const mockEnquiry2: Enquiry = {
    enquiry_id: 'enq-456',
    content: 'Another enquiry content',
    email: 'another@example.com',
    title: 'Another Enquiry',
    topic: 'sales',
    read: true,
    property: {
      property_id: 'prop-456',
      name: 'Another Property'
    },
    users: {
      from: { user_id: 'user-456', keep: true },
      to: { user_id: 'user-123', keep: true }
    },
    createdAt: '2024-01-02T00:00:00Z'
  };

  beforeEach(() => {
    const spy = jasmine.createSpyObj('UserService', ['signIn'], {
      token: 'test-token'
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        EnquiriesService,
        { provide: UserService, useValue: spy }
      ]
    });

    service = TestBed.inject(EnquiriesService);
    httpMock = TestBed.inject(HttpTestingController);
    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('enquiries getter/setter', () => {
    it('should return empty array when no enquiries set', () => {
      expect(service.enquiries).toEqual([]);
    });

    it('should set and get enquiries', () => {
      service.enquiries = [mockEnquiry];
      expect(service.enquiries).toEqual([mockEnquiry]);
    });

    it('should emit enquiries through observable', (done) => {
      service.enquiries$.subscribe(enquiries => {
        if (enquiries && enquiries.length > 0) {
          expect(enquiries).toEqual([mockEnquiry]);
          done();
        }
      });
      service.enquiries = [mockEnquiry];
    });
  });

  describe('enquiry getter/setter', () => {
    it('should return null when no enquiry set', () => {
      expect(service.enquiry).toBeNull();
    });

    it('should set and get single enquiry', () => {
      service.enquiry = mockEnquiry;
      expect(service.enquiry).toEqual(mockEnquiry);
    });

    it('should emit enquiry through observable', (done) => {
      service.enquiry$.subscribe(enquiry => {
        if (enquiry) {
          expect(enquiry).toEqual(mockEnquiry);
          done();
        }
      });
      service.enquiry = mockEnquiry;
    });
  });

  describe('fetchEnquiries', () => {
    const enquiryUrl = environment.api.server + 'enquiries';

    it('should fetch all enquiries', async () => {
      const mockResponse = {
        status: 200,
        message: 'Success',
        data: [mockEnquiry, mockEnquiry2]
      };

      const promise = service.fetchEnquiries();

      const req = httpMock.expectOne(enquiryUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);

      const result = await promise;
      expect(result.status).toBe(200);
      expect(result.data.length).toBe(2);
    });

    it('should handle fetch enquiries error', async () => {
      const promise = service.fetchEnquiries();

      const req = httpMock.expectOne(enquiryUrl);
      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

      const result = await promise;
      expect(result.message).toBe('Unauthorized');
    });
  });

  describe('fetchEnquiry', () => {
    const enquiryUrl = environment.api.server + 'enquiries';

    it('should fetch a single enquiry by id', async () => {
      const mockResponse = {
        status: 200,
        message: 'Success',
        data: mockEnquiry
      };

      const promise = service.fetchEnquiry('enq-123');

      const req = httpMock.expectOne(`${enquiryUrl}/enq-123`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);

      const result = await promise;
      expect(result.status).toBe(200);
      expect(result.data).toEqual(mockEnquiry);
    });

    it('should handle fetch enquiry error', async () => {
      const promise = service.fetchEnquiry('invalid-id');

      const req = httpMock.expectOne(`${enquiryUrl}/invalid-id`);
      req.flush({ message: 'Enquiry not found' }, { status: 404, statusText: 'Not Found' });

      const result = await promise;
      expect(result.message).toBe('Enquiry not found');
    });
  });

  describe('createEnquiry', () => {
    const enquiryUrl = environment.api.server + 'enquiries';

    it('should create a new enquiry and add to state', async () => {
      const mockResponse = {
        status: 201,
        message: 'Enquiry created',
        data: mockEnquiry
      };

      const enquiryCreate = {
        content: 'Test content',
        email: 'test@example.com',
        title: 'Test Title',
        topic: 'info',
        userTo: 'user-456'
      };

      const property = {
        property_id: 'prop-123',
        name: 'Test Property'
      };

      service.enquiries = [];
      const promise = service.createEnquiry(enquiryCreate, property);

      const req = httpMock.expectOne(enquiryUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.property.property_id).toBe('prop-123');
      req.flush(mockResponse);

      const result = await promise;
      expect(result.status).toBe(201);
      expect(service.enquiries.length).toBe(1);
      expect(service.enquiries[0]).toEqual(mockEnquiry);
    });

    it('should handle create enquiry error', async () => {
      const enquiryCreate = {
        content: 'Test',
        email: 'test@example.com',
        title: 'Test',
        topic: 'info',
        userTo: 'user-456'
      };

      const property = { property_id: 'prop-123', name: 'Test' };

      const promise = service.createEnquiry(enquiryCreate, property);

      const req = httpMock.expectOne(enquiryUrl);
      req.flush({ message: 'Validation error' }, { status: 400, statusText: 'Bad Request' });

      const result = await promise;
      expect(result.message).toBe('Validation error');
    });
  });

  describe('removeEnquiry', () => {
    const enquiryUrl = environment.api.server + 'enquiries';

    it('should remove an enquiry and update state', async () => {
      const mockResponse = {
        status: 200,
        message: 'Enquiry deleted'
      };

      service.enquiries = [mockEnquiry, mockEnquiry2];
      const promise = service.removeEnquiry('enq-123');

      const req = httpMock.expectOne(`${enquiryUrl}/enq-123`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);

      const result = await promise;
      expect(result.status).toBe(200);
      expect(service.enquiries.length).toBe(1);
      expect(service.enquiries[0].enquiry_id).toBe('enq-456');
    });

    it('should not update state if status is not 200', async () => {
      const mockResponse = {
        status: 500,
        message: 'Server error'
      };

      service.enquiries = [mockEnquiry, mockEnquiry2];
      const promise = service.removeEnquiry('enq-123');

      const req = httpMock.expectOne(`${enquiryUrl}/enq-123`);
      req.flush(mockResponse);

      await promise;
      expect(service.enquiries.length).toBe(2);
    });

    it('should handle remove enquiry error', async () => {
      service.enquiries = [mockEnquiry];
      const promise = service.removeEnquiry('enq-123');

      const req = httpMock.expectOne(`${enquiryUrl}/enq-123`);
      req.flush({ message: 'Delete failed' }, { status: 500, statusText: 'Internal Server Error' });

      const result = await promise;
      expect(result.message).toBe('Delete failed');
    });
  });

  describe('readEnquiry', () => {
    const enquiryUrl = environment.api.server + 'enquiries';

    it('should mark an enquiry as read and update state', async () => {
      const readEnquiry = { ...mockEnquiry, read: true };
      const mockResponse = {
        status: 200,
        message: 'Enquiry updated',
        data: readEnquiry
      };

      service.enquiries = [mockEnquiry, mockEnquiry2];
      const promise = service.readEnquiry('enq-123');

      const req = httpMock.expectOne(`${enquiryUrl}/enq-123`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ read: true });
      req.flush(mockResponse);

      await promise;
      expect(service.enquiries[0].read).toBe(true);
      expect(service.enquiry).toEqual(readEnquiry);
    });

    it('should handle read enquiry error', async () => {
      service.enquiries = [mockEnquiry];
      const promise = service.readEnquiry('enq-123');

      const req = httpMock.expectOne(`${enquiryUrl}/enq-123`);
      req.flush({ message: 'Update failed' }, { status: 500, statusText: 'Internal Server Error' });

      await promise;
      expect(service.enquiries[0].read).toBe(false);
    });
  });

  describe('resetState', () => {
    it('should reset enquiries to empty array', () => {
      service.enquiries = [mockEnquiry, mockEnquiry2];
      service.initialFetchDone.set(true);

      service.resetState();

      expect(service.enquiries).toEqual([]);
      expect(service.initialFetchDone()).toBe(false);
    });
  });

  describe('insertEnquiryToState', () => {
    it('should insert enquiry at the beginning of the array', () => {
      service.enquiries = [mockEnquiry2];
      service.insertEnquiryToState(mockEnquiry);

      expect(service.enquiries.length).toBe(2);
      expect(service.enquiries[0]).toEqual(mockEnquiry);
      expect(service.enquiries[1]).toEqual(mockEnquiry2);
    });

    it('should work with empty enquiries array', () => {
      service.enquiries = [];
      service.insertEnquiryToState(mockEnquiry);

      expect(service.enquiries.length).toBe(1);
      expect(service.enquiries[0]).toEqual(mockEnquiry);
    });
  });

  describe('initialFetchDone signal', () => {
    it('should be initialized to false', () => {
      expect(service.initialFetchDone()).toBe(false);
    });

    it('should be updatable', () => {
      service.initialFetchDone.set(true);
      expect(service.initialFetchDone()).toBe(true);
    });
  });
});
