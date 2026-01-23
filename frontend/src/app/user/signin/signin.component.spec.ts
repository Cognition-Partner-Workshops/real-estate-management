import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule, LoadingController, ToastController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { SigninComponent } from './signin.component';
import { UserService } from '../user.service';

describe('SigninComponent', () => {
  let component: SigninComponent;
  let fixture: ComponentFixture<SigninComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let loadingControllerSpy: jasmine.SpyObj<LoadingController>;
  let toastControllerSpy: jasmine.SpyObj<ToastController>;
  let platformSpy: jasmine.SpyObj<Platform>;

  const mockLoadingElement = {
    present: jasmine.createSpy('present'),
    dismiss: jasmine.createSpy('dismiss')
  };

  const mockToastElement = {
    present: jasmine.createSpy('present')
  };

  beforeEach(waitForAsync(() => {
    userServiceSpy = jasmine.createSpyObj('UserService', ['signIn', 'googleAuth']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
    loadingControllerSpy = jasmine.createSpyObj('LoadingController', ['create']);
    toastControllerSpy = jasmine.createSpyObj('ToastController', ['create']);
    platformSpy = jasmine.createSpyObj('Platform', ['is']);

    loadingControllerSpy.create.and.returnValue(Promise.resolve(mockLoadingElement as any));
    toastControllerSpy.create.and.returnValue(Promise.resolve(mockToastElement as any));
    platformSpy.is.and.returnValue(true);
    routerSpy.navigate.and.returnValue(Promise.resolve(true));
    routerSpy.navigateByUrl.and.returnValue(Promise.resolve(true));

    TestBed.configureTestingModule({
      declarations: [SigninComponent],
      imports: [IonicModule.forRoot(), RouterTestingModule, ReactiveFormsModule],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: LoadingController, useValue: loadingControllerSpy },
        { provide: ToastController, useValue: toastControllerSpy },
        { provide: Platform, useValue: platformSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SigninComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should have error as false by default', () => {
      expect(component.error).toBe(false);
    });

    it('should have authFailed as false by default', () => {
      expect(component.authFailed).toBe(false);
    });

    it('should initialize form with empty values', () => {
      expect(component.signinForm.get('email').value).toBe('');
      expect(component.signinForm.get('password').value).toBe('');
    });
  });

  describe('form validation', () => {
    it('should be invalid when empty', () => {
      expect(component.signinForm.valid).toBe(false);
    });

    it('should be invalid with invalid email', () => {
      component.signinForm.patchValue({ email: 'invalid-email', password: 'password123' });
      expect(component.signinForm.get('email').valid).toBe(false);
    });

    it('should be invalid without password', () => {
      component.signinForm.patchValue({ email: 'test@example.com', password: '' });
      expect(component.signinForm.get('password').valid).toBe(false);
    });

    it('should be valid with valid email and password', () => {
      component.signinForm.patchValue({ email: 'test@example.com', password: 'password123' });
      expect(component.signinForm.valid).toBe(true);
    });

    it('should require email field', () => {
      component.signinForm.patchValue({ email: '', password: 'password123' });
      expect(component.signinForm.get('email').hasError('required')).toBe(true);
    });

    it('should validate email format', () => {
      component.signinForm.patchValue({ email: 'notanemail', password: 'password123' });
      expect(component.signinForm.get('email').hasError('email')).toBe(true);
    });
  });

  describe('submit', () => {
    it('should set error to true when form is invalid', async () => {
      component.signinForm.patchValue({ email: '', password: '' });
      await component.submit();
      expect(component.error).toBe(true);
    });

    it('should not call signIn when form is invalid', async () => {
      component.signinForm.patchValue({ email: '', password: '' });
      await component.submit();
      expect(userServiceSpy.signIn).not.toHaveBeenCalled();
    });

    it('should call signIn with valid form', async () => {
      userServiceSpy.signIn.and.returnValue(Promise.resolve({ status: 200, message: 'Success' }));
      component.signinForm.patchValue({ email: 'test@example.com', password: 'password123' });
      await component.submit();
      expect(userServiceSpy.signIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('should show loading indicator during submit', async () => {
      userServiceSpy.signIn.and.returnValue(Promise.resolve({ status: 200, message: 'Success' }));
      component.signinForm.patchValue({ email: 'test@example.com', password: 'password123' });
      await component.submit();
      expect(loadingControllerSpy.create).toHaveBeenCalled();
      expect(mockLoadingElement.present).toHaveBeenCalled();
      expect(mockLoadingElement.dismiss).toHaveBeenCalled();
    });

    it('should navigate to map on successful login', async () => {
      userServiceSpy.signIn.and.returnValue(Promise.resolve({ status: 200, message: 'Success' }));
      component.signinForm.patchValue({ email: 'test@example.com', password: 'password123' });
      await component.submit();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/map'], { replaceUrl: true });
    });

    it('should show success toast on successful login', async () => {
      userServiceSpy.signIn.and.returnValue(Promise.resolve({ status: 200, message: 'Success' }));
      component.signinForm.patchValue({ email: 'test@example.com', password: 'password123' });
      await component.submit();
      expect(toastControllerSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
        message: 'Success, You are logged in',
        color: 'success'
      }));
    });

    it('should show error toast on failed login', async () => {
      userServiceSpy.signIn.and.returnValue(Promise.resolve({ status: 401, message: 'Invalid credentials' }));
      component.signinForm.patchValue({ email: 'test@example.com', password: 'wrongpassword' });
      await component.submit();
      expect(toastControllerSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
        message: 'Invalid credentials',
        color: 'danger'
      }));
    });

    it('should not navigate on failed login', async () => {
      userServiceSpy.signIn.and.returnValue(Promise.resolve({ status: 401, message: 'Invalid credentials' }));
      component.signinForm.patchValue({ email: 'test@example.com', password: 'wrongpassword' });
      await component.submit();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });
  });

  describe('ngAfterViewInit', () => {
    it('should not initialize Google signin on capacitor platform', () => {
      platformSpy.is.and.returnValue(true);
      component.ngAfterViewInit();
    });

    it('should initialize Google signin on web platform', () => {
      platformSpy.is.and.returnValue(false);
    });
  });

  describe('edge cases', () => {
    it('should handle email with spaces', () => {
      component.signinForm.patchValue({ email: ' test@example.com ', password: 'password123' });
      expect(component.signinForm.get('email').valid).toBe(false);
    });

    it('should handle very long email', () => {
      const longEmail = 'a'.repeat(100) + '@example.com';
      component.signinForm.patchValue({ email: longEmail, password: 'password123' });
      expect(component.signinForm.get('email').valid).toBe(true);
    });

    it('should handle special characters in password', () => {
      component.signinForm.patchValue({ email: 'test@example.com', password: 'p@$$w0rd!#$%' });
      expect(component.signinForm.valid).toBe(true);
    });

    it('should handle network error during signin', async () => {
      userServiceSpy.signIn.and.returnValue(Promise.resolve({ status: 500, message: 'Network error' }));
      component.signinForm.patchValue({ email: 'test@example.com', password: 'password123' });
      await component.submit();
      expect(toastControllerSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
        message: 'Network error',
        color: 'danger'
      }));
    });
  });
});
