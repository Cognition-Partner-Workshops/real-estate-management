import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { StorageService } from '../shared/services/storage/storage.service';
import { Router } from '@angular/router';
import { UserSignedIn } from '../shared/interface/user';
import { Property } from '../shared/interface/property';
import { PropertyType, TransactionType } from '../shared/enums/property';
import { environment } from 'src/environments/environment';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockUser: UserSignedIn = {
    user_id: 'user-123',
    email: 'test@example.com',
    fullName: 'Test User',
    accessToken: 'test-token-123'
  };

  const mockProperty: Property = {
    property_id: 'prop-123',
    name: 'Test Property',
    address: '123 Test St',
    type: PropertyType.residential,
    transactionType: TransactionType.forSale,
    position: { lat: 10.123, lng: 125.456 },
    price: 100000,
    user_id: 'user-123'
  };

  beforeEach(() => {
    const storageSpy = jasmine.createSpyObj('StorageService', [
      'init', 'getUser', 'setUser', 'removeUser'
    ]);
    storageSpy.init.and.returnValue(Promise.resolve());
    storageSpy.getUser.and.returnValue(Promise.resolve(null));
    storageSpy.setUser.and.returnValue(Promise.resolve());
    storageSpy.removeUser.and.returnValue(Promise.resolve());

    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
    routerSpyObj.navigate.and.returnValue(Promise.resolve(true));
    routerSpyObj.navigateByUrl.and.returnValue(Promise.resolve(true));

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        UserService,
        { provide: StorageService, useValue: storageSpy },
        { provide: Router, useValue: routerSpyObj }
      ]
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
    storageServiceSpy = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('user getter', () => {
    it('should return null when no user is set', () => {
      expect(service.user).toBeNull();
    });

    it('should return user after setUser is called', async () => {
      await service.setUser(mockUser);
      expect(service.user).toEqual(mockUser);
    });
  });

  describe('token getter', () => {
    it('should return access token from user', async () => {
      await service.setUser(mockUser);
      expect(service.token).toBe('test-token-123');
    });
  });

  describe('signIn', () => {
    const authUrl = environment.api.server + 'auth/signin';

    it('should sign in successfully and set user', async () => {
      const mockResponse = {
        status: 200,
        message: 'Success',
        data: mockUser
      };

      const promise = service.signIn('test@example.com', 'password123');

      const req = httpMock.expectOne(authUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        email: 'test@example.com',
        password: 'password123'
      });
      req.flush(mockResponse);

      const result = await promise;
      expect(result.status).toBe(200);
      expect(service.user).toEqual(mockUser);
      expect(storageServiceSpy.setUser).toHaveBeenCalledWith(mockUser);
    });

    it('should handle sign in error', async () => {
      const promise = service.signIn('test@example.com', 'wrongpassword');

      const req = httpMock.expectOne(authUrl);
      req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });

      const result = await promise;
      expect(result.message).toBe('Invalid credentials');
    });
  });

  describe('signOut', () => {
    it('should clear user and navigate to signin', async () => {
      await service.setUser(mockUser);
      await service.signOut();

      expect(service.user).toBeNull();
      expect(storageServiceSpy.removeUser).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/user/signin'], { replaceUrl: true });
    });
  });

  describe('register', () => {
    const registerUrl = environment.api.server + 'auth/register';

    it('should register successfully and set user', async () => {
      const mockResponse = {
        status: 200,
        message: 'Success',
        data: mockUser
      };

      const promise = service.register('Test User', 'test@example.com', 'password123');

      const req = httpMock.expectOne(registerUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      req.flush(mockResponse);

      const result = await promise;
      expect(result.status).toBe(200);
      expect(service.user).toEqual(mockUser);
    });

    it('should handle registration error', async () => {
      const promise = service.register('Test', 'invalid-email', 'pass');

      const req = httpMock.expectOne(registerUrl);
      req.flush({ message: 'Validation error' }, { status: 400, statusText: 'Bad Request' });

      const result = await promise;
      expect(result.message).toBe('Validation error');
    });
  });

  describe('googleAuth', () => {
    const googleAuthUrl = environment.api.server + 'auth/google';

    it('should authenticate with Google successfully', async () => {
      const mockResponse = {
        status: 200,
        message: 'Success',
        data: mockUser
      };

      const googlePayload = { credential: 'google-token-123' };
      const promise = service.googleAuth(googlePayload);

      const req = httpMock.expectOne(googleAuthUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(googlePayload);
      req.flush(mockResponse);

      const result = await promise;
      expect(result.status).toBe(200);
      expect(service.user).toEqual(mockUser);
    });
  });

  describe('isPropertyOwner', () => {
    it('should return true when user owns the property', async () => {
      await service.setUser(mockUser);
      const result = service.isPropertyOwner(mockProperty);
      expect(result).toBe(true);
    });

    it('should return false when user does not own the property', async () => {
      await service.setUser(mockUser);
      const otherProperty = { ...mockProperty, user_id: 'other-user' };
      const result = service.isPropertyOwner(otherProperty);
      expect(result).toBe(false);
    });

    it('should return false when no user is logged in', () => {
      const result = service.isPropertyOwner(mockProperty);
      expect(result).toBe(false);
    });

    it('should return false when property is null', async () => {
      await service.setUser(mockUser);
      const result = service.isPropertyOwner(null);
      expect(result).toBe(false);
    });
  });

  describe('changePassword', () => {
    const changePasswordUrl = environment.api.server + 'auth/change-password';

    it('should change password successfully', async () => {
      await service.setUser(mockUser);
      const mockResponse = {
        status: 200,
        message: 'Password changed successfully'
      };

      const promise = service.changePassword('newPassword123', 'currentPassword');

      const req = httpMock.expectOne(changePasswordUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        passwordCurrent: 'currentPassword',
        passwordNew: 'newPassword123'
      });
      req.flush(mockResponse);

      const result = await promise;
      expect(result.status).toBe(200);
    });

    it('should handle change password error', async () => {
      await service.setUser(mockUser);
      const promise = service.changePassword('newPass', 'wrongCurrent');

      const req = httpMock.expectOne(changePasswordUrl);
      req.flush({ message: 'Current password is incorrect' }, { status: 400, statusText: 'Bad Request' });

      const result = await promise;
      expect(result.message).toBe('Current password is incorrect');
    });
  });

  describe('updateUser', () => {
    const updateUserUrl = environment.api.server + 'users/me';

    it('should update user successfully', async () => {
      await service.setUser(mockUser);
      const updatedUser = { ...mockUser, fullName: 'Updated Name' };
      const mockResponse = {
        status: 200,
        message: 'User updated',
        data: updatedUser
      };

      const promise = service.updateUser({ fullName: 'Updated Name' });

      const req = httpMock.expectOne(updateUserUrl);
      expect(req.request.method).toBe('PATCH');
      req.flush(mockResponse);

      const result = await promise;
      expect(result.status).toBe(200);
      expect(result.data.fullName).toBe('Updated Name');
    });

    it('should handle update user error', async () => {
      await service.setUser(mockUser);
      const promise = service.updateUser({ email: 'invalid' });

      const req = httpMock.expectOne(updateUserUrl);
      req.flush({ message: 'Validation error' }, { status: 400, statusText: 'Bad Request' });

      const result = await promise;
      expect(result.message).toBe('Validation error');
    });
  });

  describe('getCurrentUser', () => {
    const getCurrentUserUrl = environment.api.server + 'users/me';

    it('should get current user details', async () => {
      await service.setUser(mockUser);
      const mockResponse = {
        status: 200,
        message: 'Success',
        data: {
          ...mockUser,
          properties: ['prop-1', 'prop-2'],
          activities: [],
          notifications: []
        }
      };

      const promise = service.getCurrentUser();

      const req = httpMock.expectOne(getCurrentUserUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);

      const result = await promise;
      expect(result.status).toBe(200);
      expect(result.data.properties.length).toBe(2);
    });

    it('should handle get current user error', async () => {
      await service.setUser(mockUser);
      const promise = service.getCurrentUser();

      const req = httpMock.expectOne(getCurrentUserUrl);
      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

      const result = await promise;
      expect(result.message).toBe('Unauthorized');
    });
  });

  describe('setUser', () => {
    it('should set user and store in storage', async () => {
      await service.setUser(mockUser);

      expect(service.user).toEqual(mockUser);
      expect(storageServiceSpy.setUser).toHaveBeenCalledWith(mockUser);
    });

    it('should merge with existing user data', async () => {
      await service.setUser(mockUser);
      await service.setUser({ ...mockUser, fullName: 'Updated Name' });

      expect(service.user.fullName).toBe('Updated Name');
      expect(service.user.email).toBe('test@example.com');
    });
  });

  describe('user$ observable', () => {
    it('should emit user changes', (done) => {
      service.user$.subscribe(user => {
        if (user) {
          expect(user).toEqual(mockUser);
          done();
        }
      });
      service.setUser(mockUser);
    });
  });
});
