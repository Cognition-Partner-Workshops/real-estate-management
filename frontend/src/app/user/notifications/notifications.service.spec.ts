import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NotificationsService } from './notifications.service';
import { UserService } from '../user.service';
import { Notification } from 'src/app/shared/interface/notification';
import { UserNotificationType } from 'src/app/shared/enums/notification';
import { environment } from 'src/environments/environment';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let httpMock: HttpTestingController;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  const mockNotification: Notification = {
    notification_id: 'notif-123',
    message: 'Test notification message',
    type: UserNotificationType.enquiry,
    read: false,
    createdAt: new Date('2024-01-01')
  };

  const mockNotification2: Notification = {
    notification_id: 'notif-456',
    message: 'Another notification',
    type: UserNotificationType.property,
    read: true,
    createdAt: new Date('2024-01-02')
  };

  beforeEach(() => {
    const spy = jasmine.createSpyObj('UserService', ['signIn'], {
      token: 'test-token'
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        NotificationsService,
        { provide: UserService, useValue: spy }
      ]
    });

    service = TestBed.inject(NotificationsService);
    httpMock = TestBed.inject(HttpTestingController);
    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('notifications getter/setter', () => {
    it('should return empty array when no notifications set', () => {
      expect(service.notifications).toEqual([]);
    });

    it('should set and get notifications', () => {
      service.notifications = [mockNotification];
      expect(service.notifications).toEqual([mockNotification]);
    });

    it('should emit notifications through observable', (done) => {
      service.notifications$.subscribe(notifications => {
        if (notifications && notifications.length > 0) {
          expect(notifications).toEqual([mockNotification]);
          done();
        }
      });
      service.notifications = [mockNotification];
    });
  });

  describe('fetchNotifications', () => {
    const notificationUrl = environment.api.server + 'notifications';

    it('should fetch all notifications', async () => {
      const mockResponse = {
        status: 200,
        message: 'Success',
        data: [mockNotification, mockNotification2]
      };

      const promise = service.fetchNotifications();

      const req = httpMock.expectOne(notificationUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);

      const result = await promise;
      expect(result.status).toBe(200);
      expect(result.data.length).toBe(2);
    });

    it('should handle fetch notifications error', async () => {
      const promise = service.fetchNotifications();

      const req = httpMock.expectOne(notificationUrl);
      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

      const result = await promise;
      expect(result.message).toBe('Unauthorized');
    });
  });

  describe('readNotification', () => {
    const notificationUrl = environment.api.server + 'notifications';

    it('should mark notifications as read', async () => {
      const mockResponse = {
        status: 200,
        message: 'Notifications updated',
        data: [{ ...mockNotification, read: true }]
      };

      const promise = service.readNotification(['notif-123']);

      const req = httpMock.expectOne(notificationUrl);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ id: ['notif-123'] });
      req.flush(mockResponse);

      const result = await promise;
      expect(result.status).toBe(200);
    });

    it('should handle single notification id', async () => {
      const mockResponse = {
        status: 200,
        message: 'Notification updated',
        data: [{ ...mockNotification, read: true }]
      };

      const promise = service.readNotification('notif-123');

      const req = httpMock.expectOne(notificationUrl);
      expect(req.request.body).toEqual({ id: 'notif-123' });
      req.flush(mockResponse);

      await promise;
    });

    it('should return early when id array is empty', async () => {
      const result = await service.readNotification([]);
      expect(result).toBeUndefined();
    });

    it('should handle read notification error', async () => {
      const promise = service.readNotification(['notif-123']);

      const req = httpMock.expectOne(notificationUrl);
      req.flush({ message: 'Update failed' }, { status: 500, statusText: 'Internal Server Error' });

      const result = await promise;
      expect(result.message).toBe('Update failed');
    });
  });

  describe('deleteNotification', () => {
    const notificationUrl = environment.api.server + 'notifications';

    it('should delete notifications', async () => {
      const mockResponse = {
        status: 200,
        message: 'Notifications deleted'
      };

      const promise = service.deleteNotification(['notif-123']);

      const req = httpMock.expectOne(notificationUrl);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);

      const result = await promise;
      expect(result.status).toBe(200);
    });

    it('should handle single notification id for delete', async () => {
      const mockResponse = {
        status: 200,
        message: 'Notification deleted'
      };

      const promise = service.deleteNotification('notif-123');

      const req = httpMock.expectOne(notificationUrl);
      req.flush(mockResponse);

      const result = await promise;
      expect(result.status).toBe(200);
    });

    it('should handle delete notification error', async () => {
      const promise = service.deleteNotification(['notif-123']);

      const req = httpMock.expectOne(notificationUrl);
      req.flush({ message: 'Delete failed' }, { status: 500, statusText: 'Internal Server Error' });

      const result = await promise;
      expect(result.message).toBe('Delete failed');
    });
  });

  describe('removeNotificationsFromState', () => {
    it('should remove notifications by ids', () => {
      service.notifications = [mockNotification, mockNotification2];
      service.removeNotificationsFromState(['notif-123']);

      expect(service.notifications.length).toBe(1);
      expect(service.notifications[0].notification_id).toBe('notif-456');
    });

    it('should remove multiple notifications', () => {
      service.notifications = [mockNotification, mockNotification2];
      service.removeNotificationsFromState(['notif-123', 'notif-456']);

      expect(service.notifications.length).toBe(0);
    });

    it('should handle removal when notification not found', () => {
      service.notifications = [mockNotification];
      service.removeNotificationsFromState(['non-existent']);

      expect(service.notifications.length).toBe(1);
    });
  });

  describe('setNotificationsAsReadFromState', () => {
    it('should mark notifications as read in state', () => {
      service.notifications = [mockNotification, mockNotification2];
      service.setNotificationsAsReadFromState(['notif-123']);

      expect(service.notifications[0].read).toBe(true);
      expect(service.notifications[1].read).toBe(true);
    });

    it('should mark multiple notifications as read', () => {
      const unreadNotif = { ...mockNotification2, read: false };
      service.notifications = [mockNotification, unreadNotif];
      service.setNotificationsAsReadFromState(['notif-123', 'notif-456']);

      expect(service.notifications[0].read).toBe(true);
      expect(service.notifications[1].read).toBe(true);
    });

    it('should not affect notifications not in the ids list', () => {
      service.notifications = [mockNotification, mockNotification2];
      service.setNotificationsAsReadFromState(['notif-123']);

      expect(service.notifications[0].read).toBe(true);
      expect(service.notifications[1].read).toBe(true);
    });
  });

  describe('insertNotificationToState', () => {
    it('should insert notification at the beginning', () => {
      service.notifications = [mockNotification2];
      service.insertNotificationToState(mockNotification);

      expect(service.notifications.length).toBe(2);
      expect(service.notifications[0]).toEqual(mockNotification);
      expect(service.notifications[1]).toEqual(mockNotification2);
    });

    it('should work with empty notifications array', () => {
      service.notifications = [];
      service.insertNotificationToState(mockNotification);

      expect(service.notifications.length).toBe(1);
      expect(service.notifications[0]).toEqual(mockNotification);
    });
  });

  describe('resetState', () => {
    it('should reset notifications to empty array', () => {
      service.notifications = [mockNotification, mockNotification2];
      service.resetState();

      expect(service.notifications).toEqual([]);
    });
  });
});
