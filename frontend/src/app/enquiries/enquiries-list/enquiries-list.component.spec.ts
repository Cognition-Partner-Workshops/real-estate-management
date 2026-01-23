import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { EnquiriesListComponent } from './enquiries-list.component';
import { EnquiriesService } from '../enquiries.service';
import { UserService } from '../../user/user.service';
import { Enquiry } from 'src/app/shared/interface/enquiry';
import { EnquiryTopic } from 'src/app/shared/enums/enquiry';
import { PropertyType, TransactionType } from 'src/app/shared/enums/property';

describe('EnquiriesListComponent', () => {
  let component: EnquiriesListComponent;
  let fixture: ComponentFixture<EnquiriesListComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let enquiriesSubject: BehaviorSubject<Enquiry[]>;
  let queryParamsSubject: BehaviorSubject<any>;
  let userSubject: BehaviorSubject<any>;

  const mockEnquiry1: Enquiry = {
    enquiry_id: 'enq-1',
    title: 'Question about Property',
    content: 'I would like more information',
    email: 'user1@example.com',
    topic: EnquiryTopic.info,
    read: false,
    createdAt: new Date('2024-01-01'),
    users: {
      from: { user_id: 'user-1', keep: true },
      to: { user_id: 'user-2', keep: true }
    },
    property: {
      property_id: 'prop-1',
      name: 'Test Property',
      address: '123 Test St',
      type: PropertyType.residential,
      transactionType: TransactionType.forSale,
      position: { lat: 10, lng: 125 },
      price: 100000,
      user_id: 'user-2'
    }
  };

  const mockEnquiry2: Enquiry = {
    enquiry_id: 'enq-2',
    title: 'Sales Inquiry',
    content: 'Interested in buying',
    email: 'user2@example.com',
    topic: EnquiryTopic.sales,
    read: true,
    createdAt: new Date('2024-01-02'),
    users: {
      from: { user_id: 'user-2', keep: true },
      to: { user_id: 'user-1', keep: true }
    },
    property: {
      property_id: 'prop-2',
      name: 'Another Property',
      address: '456 Test Ave',
      type: PropertyType.commercial,
      transactionType: TransactionType.forRent,
      position: { lat: 11, lng: 126 },
      price: 200000,
      user_id: 'user-1'
    }
  };

  const mockEnquiry3: Enquiry = {
    enquiry_id: 'enq-3',
    title: 'Schedule Visit',
    content: 'Can I schedule a viewing?',
    email: 'user3@example.com',
    topic: EnquiryTopic.schedule,
    read: false,
    createdAt: new Date('2024-01-03'),
    users: {
      from: { user_id: 'user-1', keep: true },
      to: { user_id: 'user-3', keep: true }
    },
    property: {
      property_id: 'prop-3',
      name: 'Third Property',
      address: '789 Test Blvd',
      type: PropertyType.residential,
      transactionType: TransactionType.forSale,
      position: { lat: 12, lng: 127 },
      price: 300000,
      user_id: 'user-3'
    }
  };

  beforeEach(waitForAsync(() => {
    enquiriesSubject = new BehaviorSubject<Enquiry[]>([]);
    queryParamsSubject = new BehaviorSubject({});
    userSubject = new BehaviorSubject({ user_id: 'user-1' });

    const enquiriesServiceSpy = {
      enquiries$: enquiriesSubject.asObservable()
    };

    const userServiceSpy = {
      user$: userSubject.asObservable()
    };

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    routerSpy.navigate.and.returnValue(Promise.resolve(true));

    TestBed.configureTestingModule({
      declarations: [EnquiriesListComponent],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [
        { provide: EnquiriesService, useValue: enquiriesServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: queryParamsSubject.asObservable()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EnquiriesListComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should have isReceived as false by default', () => {
      expect(component.isReceived()).toBe(false);
    });

    it('should have empty enquiriesList when no enquiries', () => {
      fixture.detectChanges();
      expect(component.enquiriesList()).toEqual([]);
    });
  });

  describe('enquiriesList computed', () => {
    it('should return all enquiries when no filters applied', () => {
      enquiriesSubject.next([mockEnquiry1, mockEnquiry2, mockEnquiry3]);
      fixture.detectChanges();
      expect(component.enquiriesList().length).toBe(3);
    });

    it('should sort by latest by default', () => {
      enquiriesSubject.next([mockEnquiry1, mockEnquiry2, mockEnquiry3]);
      fixture.detectChanges();
      const list = component.enquiriesList();
      expect(list[0].enquiry_id).toBe('enq-3');
    });

    it('should sort by oldest when sort=oldest', () => {
      enquiriesSubject.next([mockEnquiry1, mockEnquiry2, mockEnquiry3]);
      queryParamsSubject.next({ sort: 'oldest' });
      fixture.detectChanges();
      const list = component.enquiriesList();
      expect(list[0].enquiry_id).toBe('enq-1');
    });

    it('should sort by title when sort=title', () => {
      enquiriesSubject.next([mockEnquiry1, mockEnquiry2, mockEnquiry3]);
      queryParamsSubject.next({ sort: 'title' });
      fixture.detectChanges();
      const list = component.enquiriesList();
      expect(list[0].title).toBe('Question about Property');
    });
  });

  describe('filterEnquiries', () => {
    it('should filter sent enquiries', () => {
      enquiriesSubject.next([mockEnquiry1, mockEnquiry2, mockEnquiry3]);
      queryParamsSubject.next({ filter: 'sent' });
      fixture.detectChanges();
      const list = component.enquiriesList();
      expect(list.every(e => e.users.from.user_id === 'user-1')).toBe(true);
    });

    it('should filter received enquiries', () => {
      enquiriesSubject.next([mockEnquiry1, mockEnquiry2, mockEnquiry3]);
      queryParamsSubject.next({ filter: 'received' });
      fixture.detectChanges();
      const list = component.enquiriesList();
      expect(list.every(e => e.users.from.user_id !== 'user-1')).toBe(true);
    });

    it('should filter by topic', () => {
      enquiriesSubject.next([mockEnquiry1, mockEnquiry2, mockEnquiry3]);
      queryParamsSubject.next({ filter: 'info' });
      fixture.detectChanges();
      const list = component.enquiriesList();
      expect(list.length).toBe(1);
      expect(list[0].topic).toBe(EnquiryTopic.info);
    });

    it('should filter by multiple topics', () => {
      enquiriesSubject.next([mockEnquiry1, mockEnquiry2, mockEnquiry3]);
      queryParamsSubject.next({ filter: 'info,sales' });
      fixture.detectChanges();
      const list = component.enquiriesList();
      expect(list.length).toBe(2);
    });

    it('should combine sent filter with topic filter', () => {
      enquiriesSubject.next([mockEnquiry1, mockEnquiry2, mockEnquiry3]);
      queryParamsSubject.next({ filter: 'sent,info' });
      fixture.detectChanges();
      const list = component.enquiriesList();
      expect(list.length).toBe(1);
      expect(list[0].enquiry_id).toBe('enq-1');
    });
  });

  describe('searchEnquiries', () => {
    it('should search by title', () => {
      enquiriesSubject.next([mockEnquiry1, mockEnquiry2, mockEnquiry3]);
      queryParamsSubject.next({ search: 'Question' });
      fixture.detectChanges();
      const list = component.enquiriesList();
      expect(list.length).toBe(1);
      expect(list[0].title).toContain('Question');
    });

    it('should search by email', () => {
      enquiriesSubject.next([mockEnquiry1, mockEnquiry2, mockEnquiry3]);
      queryParamsSubject.next({ search: 'user2@example.com' });
      fixture.detectChanges();
      const list = component.enquiriesList();
      expect(list.length).toBe(1);
      expect(list[0].email).toBe('user2@example.com');
    });

    it('should be case insensitive', () => {
      enquiriesSubject.next([mockEnquiry1, mockEnquiry2, mockEnquiry3]);
      queryParamsSubject.next({ search: 'SALES' });
      fixture.detectChanges();
      const list = component.enquiriesList();
      expect(list.length).toBe(1);
    });

    it('should return empty array when no matches', () => {
      enquiriesSubject.next([mockEnquiry1, mockEnquiry2, mockEnquiry3]);
      queryParamsSubject.next({ search: 'NonExistent' });
      fixture.detectChanges();
      expect(component.enquiriesList().length).toBe(0);
    });
  });

  describe('selectEnquiry', () => {
    it('should navigate to enquiry detail', () => {
      component.selectEnquiry(mockEnquiry1);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/enquiries', 'enq-1']);
    });
  });

  describe('edge cases', () => {
    it('should handle empty enquiries array', () => {
      enquiriesSubject.next([]);
      fixture.detectChanges();
      expect(component.enquiriesList()).toEqual([]);
    });

    it('should handle combined search and filter', () => {
      enquiriesSubject.next([mockEnquiry1, mockEnquiry2, mockEnquiry3]);
      queryParamsSubject.next({ search: 'Property', filter: 'sent' });
      fixture.detectChanges();
      const list = component.enquiriesList();
      expect(list.length).toBe(1);
      expect(list[0].enquiry_id).toBe('enq-1');
    });

    it('should handle combined search, filter, and sort', () => {
      enquiriesSubject.next([mockEnquiry1, mockEnquiry2, mockEnquiry3]);
      queryParamsSubject.next({ search: '', filter: 'sent', sort: 'oldest' });
      fixture.detectChanges();
      const list = component.enquiriesList();
      expect(list[0].enquiry_id).toBe('enq-1');
    });

    it('should handle user change', () => {
      enquiriesSubject.next([mockEnquiry1, mockEnquiry2, mockEnquiry3]);
      queryParamsSubject.next({ filter: 'sent' });
      fixture.detectChanges();
      const listBefore = component.enquiriesList();

      userSubject.next({ user_id: 'user-2' });
      fixture.detectChanges();
      const listAfter = component.enquiriesList();

      expect(listBefore.length).not.toBe(listAfter.length);
    });
  });
});
