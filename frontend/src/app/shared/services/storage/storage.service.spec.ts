import { TestBed } from '@angular/core/testing';
import { Storage } from '@ionic/storage-angular';
import { StorageService } from './storage.service';
import { UserSignedIn } from '../../interface/user';
import { Coord } from '../../interface/map';

describe('StorageService', () => {
  let service: StorageService;
  let storageMock: jasmine.SpyObj<Storage>;

  const mockUser: UserSignedIn = {
    user_id: 'user-123',
    email: 'test@example.com',
    fullName: 'Test User',
    accessToken: 'test-token'
  };

  const mockCoord: Coord = {
    lat: 10.123,
    lng: 125.456
  };

  beforeEach(() => {
    const spy = jasmine.createSpyObj('Storage', ['create', 'set', 'get', 'remove']);
    spy.create.and.returnValue(Promise.resolve(spy));
    spy.set.and.returnValue(Promise.resolve());
    spy.get.and.returnValue(Promise.resolve(null));
    spy.remove.and.returnValue(Promise.resolve());

    TestBed.configureTestingModule({
      providers: [
        StorageService,
        { provide: Storage, useValue: spy }
      ]
    });

    service = TestBed.inject(StorageService);
    storageMock = TestBed.inject(Storage) as jasmine.SpyObj<Storage>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('init', () => {
    it('should initialize storage', async () => {
      await service.init();
      expect(storageMock.create).toHaveBeenCalled();
      expect(service.ionStorage).toBeTruthy();
    });
  });

  describe('set and get', () => {
    it('should set a value', async () => {
      await service.init();
      await service.set('testKey', 'testValue');
      expect(storageMock.set).toHaveBeenCalledWith('testKey', 'testValue');
    });

    it('should get a value', async () => {
      storageMock.get.and.returnValue(Promise.resolve('testValue'));
      await service.init();
      const result = await service.get('testKey');
      expect(storageMock.get).toHaveBeenCalledWith('testKey');
      expect(result).toBe('testValue');
    });

    it('should handle null ionStorage gracefully on set', async () => {
      service.ionStorage = null;
      await service.set('key', 'value');
      expect(storageMock.set).not.toHaveBeenCalled();
    });

    it('should handle null ionStorage gracefully on get', async () => {
      service.ionStorage = null;
      const result = await service.get('key');
      expect(result).toBeUndefined();
    });
  });

  describe('setDarkTheme and getDartTheme', () => {
    it('should set dark theme', async () => {
      await service.init();
      await service.setDarkTheme(true);
      expect(storageMock.set).toHaveBeenCalledWith('isDark', true);
    });

    it('should get dark theme', async () => {
      storageMock.get.and.returnValue(Promise.resolve(true));
      await service.init();
      const result = await service.getDartTheme();
      expect(storageMock.get).toHaveBeenCalledWith('isDark');
      expect(result).toBe(true);
    });

    it('should return false when dark theme not set', async () => {
      storageMock.get.and.returnValue(Promise.resolve(false));
      await service.init();
      const result = await service.getDartTheme();
      expect(result).toBe(false);
    });
  });

  describe('setCoord and getCoord', () => {
    it('should set coordinates', async () => {
      await service.init();
      await service.setCoord(mockCoord);
      expect(storageMock.set).toHaveBeenCalledWith('coord', mockCoord);
    });

    it('should get coordinates', async () => {
      storageMock.get.and.returnValue(Promise.resolve(mockCoord));
      await service.init();
      const result = await service.getCoord();
      expect(storageMock.get).toHaveBeenCalledWith('coord');
      expect(result).toEqual(mockCoord);
    });

    it('should return null when no coordinates set', async () => {
      storageMock.get.and.returnValue(Promise.resolve(null));
      await service.init();
      const result = await service.getCoord();
      expect(result).toBeNull();
    });
  });

  describe('setUser and getUser', () => {
    it('should set user', async () => {
      await service.init();
      await service.setUser(mockUser);
      expect(storageMock.set).toHaveBeenCalledWith('user', mockUser);
    });

    it('should get user', async () => {
      storageMock.get.and.returnValue(Promise.resolve(mockUser));
      await service.init();
      const result = await service.getUser();
      expect(storageMock.get).toHaveBeenCalledWith('user');
      expect(result).toEqual(mockUser);
    });

    it('should return null when no user set', async () => {
      storageMock.get.and.returnValue(Promise.resolve(null));
      await service.init();
      const result = await service.getUser();
      expect(result).toBeNull();
    });
  });

  describe('removeUser', () => {
    it('should remove user from storage', async () => {
      await service.init();
      await service.removeUser();
      expect(storageMock.remove).toHaveBeenCalledWith('user');
    });

    it('should handle null ionStorage gracefully', async () => {
      service.ionStorage = null;
      await service.removeUser();
      expect(storageMock.remove).not.toHaveBeenCalled();
    });
  });
});
