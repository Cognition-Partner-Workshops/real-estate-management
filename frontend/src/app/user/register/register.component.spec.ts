import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { CustomValidatorsDirective } from 'src/app/shared/directives/custom-validators.directive';
import { RegisterComponent } from './register.component';
import { UserService } from '../user.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let loadingControllerSpy: jasmine.SpyObj<LoadingController>;
  let toastControllerSpy: jasmine.SpyObj<ToastController>;

  const mockLoadingElement = {
    present: jasmine.createSpy('present'),
    dismiss: jasmine.createSpy('dismiss')
  };

  const mockToastElement = {
    present: jasmine.createSpy('present')
  };

  beforeEach(waitForAsync(() => {
    userServiceSpy = jasmine.createSpyObj('UserService', ['register']);
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
    loadingControllerSpy = jasmine.createSpyObj('LoadingController', ['create']);
    toastControllerSpy = jasmine.createSpyObj('ToastController', ['create']);

    loadingControllerSpy.create.and.returnValue(Promise.resolve(mockLoadingElement as any));
    toastControllerSpy.create.and.returnValue(Promise.resolve(mockToastElement as any));
    routerSpy.navigateByUrl.and.returnValue(Promise.resolve(true));

    TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [IonicModule.forRoot(), ReactiveFormsModule, RouterTestingModule],
      providers: [
        CustomValidatorsDirective,
        { provide: UserService, useValue: userServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: LoadingController, useValue: loadingControllerSpy },
        { provide: ToastController, useValue: toastControllerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should have error as false by default', () => {
      expect(component.error).toBe(false);
    });

    it('should initialize form with empty values', () => {
      expect(component.registerForm.get('fullName').value).toBe('');
      expect(component.registerForm.get('email').value).toBe('');
      expect(component.registerForm.get('password').value).toBe('');
      expect(component.registerForm.get('confirm').value).toBe('');
      expect(component.registerForm.get('termService').value).toBe(false);
    });
  });

  describe('form validation', () => {
    it('should be invalid when empty', () => {
      expect(component.registerForm.valid).toBe(false);
    });

    it('should require fullName with minimum 4 characters', () => {
      component.registerForm.patchValue({ fullName: 'abc' });
      expect(component.registerForm.get('fullName').hasError('minlength')).toBe(true);
    });

    it('should accept fullName with 4 or more characters', () => {
      component.registerForm.patchValue({ fullName: 'John Doe' });
      expect(component.registerForm.get('fullName').valid).toBe(true);
    });

    it('should require valid email format', () => {
      component.registerForm.patchValue({ email: 'invalid-email' });
      expect(component.registerForm.get('email').valid).toBe(false);
    });

    it('should accept valid email', () => {
      component.registerForm.patchValue({ email: 'test@example.com' });
      expect(component.registerForm.get('email').valid).toBe(true);
    });

    it('should require password with minimum 8 characters', () => {
      component.registerForm.patchValue({ password: 'Short1!' });
      expect(component.registerForm.get('password').hasError('minlength')).toBe(true);
    });

    it('should require password with at least one number', () => {
      component.registerForm.patchValue({ password: 'Password!' });
      expect(component.registerForm.get('password').hasError('hasNumber')).toBe(true);
    });

    it('should require password with at least one uppercase letter', () => {
      component.registerForm.patchValue({ password: 'password1!' });
      expect(component.registerForm.get('password').hasError('hasCapitalCase')).toBe(true);
    });

    it('should require password with at least one lowercase letter', () => {
      component.registerForm.patchValue({ password: 'PASSWORD1!' });
      expect(component.registerForm.get('password').hasError('hasSmallCase')).toBe(true);
    });

    it('should require password with at least one special character', () => {
      component.registerForm.patchValue({ password: 'Password1' });
      expect(component.registerForm.get('password').hasError('hasSpecialCharacters')).toBe(true);
    });

    it('should accept valid password', () => {
      component.registerForm.patchValue({ password: 'Password1!' });
      expect(component.registerForm.get('password').valid).toBe(true);
    });

    it('should require password confirmation to match', () => {
      component.registerForm.patchValue({
        password: 'Password1!',
        confirm: 'DifferentPassword1!'
      });
      expect(component.registerForm.hasError('notConfirmed')).toBe(true);
    });

    it('should be valid when password and confirm match', () => {
      component.registerForm.patchValue({
        password: 'Password1!',
        confirm: 'Password1!'
      });
      expect(component.registerForm.hasError('notConfirmed')).toBe(false);
    });

    it('should be valid with all valid inputs', () => {
      component.registerForm.patchValue({
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'Password1!',
        confirm: 'Password1!',
        termService: true
      });
      expect(component.registerForm.valid).toBe(true);
    });
  });

  describe('submit', () => {
    it('should set error to true when form is invalid', async () => {
      component.registerForm.patchValue({ fullName: '', email: '', password: '', confirm: '' });
      await component.submit();
      expect(component.error).toBe(true);
    });

    it('should not call register when form is invalid', async () => {
      component.registerForm.patchValue({ fullName: '', email: '', password: '', confirm: '' });
      await component.submit();
      expect(userServiceSpy.register).not.toHaveBeenCalled();
    });

    it('should call register with valid form', async () => {
      userServiceSpy.register.and.returnValue(Promise.resolve({ error: null }));
      component.registerForm.patchValue({
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'Password1!',
        confirm: 'Password1!',
        termService: true
      });
      await component.submit();
      expect(userServiceSpy.register).toHaveBeenCalledWith('John Doe', 'john@example.com', 'Password1!');
    });

    it('should show loading indicator during submit', async () => {
      userServiceSpy.register.and.returnValue(Promise.resolve({ error: null }));
      component.registerForm.patchValue({
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'Password1!',
        confirm: 'Password1!',
        termService: true
      });
      await component.submit();
      expect(loadingControllerSpy.create).toHaveBeenCalled();
      expect(mockLoadingElement.present).toHaveBeenCalled();
      expect(mockLoadingElement.dismiss).toHaveBeenCalled();
    });

    it('should navigate to profile on successful registration', async () => {
      userServiceSpy.register.and.returnValue(Promise.resolve({ error: null }));
      component.registerForm.patchValue({
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'Password1!',
        confirm: 'Password1!',
        termService: true
      });
      await component.submit();
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/user/account/profile');
    });

    it('should show success toast on successful registration', async () => {
      userServiceSpy.register.and.returnValue(Promise.resolve({ error: null }));
      component.registerForm.patchValue({
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'Password1!',
        confirm: 'Password1!',
        termService: true
      });
      await component.submit();
      expect(toastControllerSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
        message: 'Success, registration is complete.',
        color: 'success'
      }));
    });

    it('should show error toast on failed registration', async () => {
      userServiceSpy.register.and.returnValue(Promise.resolve({ error: { message: 'Email already exists' } }));
      component.registerForm.patchValue({
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'Password1!',
        confirm: 'Password1!',
        termService: true
      });
      await component.submit();
      expect(toastControllerSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
        message: 'Error:Email already exists',
        color: 'danger'
      }));
    });

    it('should not navigate on failed registration', async () => {
      userServiceSpy.register.and.returnValue(Promise.resolve({ error: { message: 'Email already exists' } }));
      component.registerForm.patchValue({
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'Password1!',
        confirm: 'Password1!',
        termService: true
      });
      await component.submit();
      expect(routerSpy.navigateByUrl).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle email with uppercase letters', () => {
      component.registerForm.patchValue({ email: 'Test@Example.COM' });
      expect(component.registerForm.get('email').valid).toBe(true);
    });

    it('should handle very long fullName', () => {
      const longName = 'A'.repeat(100);
      component.registerForm.patchValue({ fullName: longName });
      expect(component.registerForm.get('fullName').valid).toBe(true);
    });

    it('should handle password with all special characters', () => {
      component.registerForm.patchValue({ password: 'Aa1!@#$%^&*()' });
      expect(component.registerForm.get('password').valid).toBe(true);
    });

    it('should handle network error during registration', async () => {
      userServiceSpy.register.and.returnValue(Promise.resolve({ error: { message: 'Network error' } }));
      component.registerForm.patchValue({
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'Password1!',
        confirm: 'Password1!',
        termService: true
      });
      await component.submit();
      expect(toastControllerSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
        message: 'Error:Network error',
        color: 'danger'
      }));
    });

    it('should handle termService not checked', () => {
      component.registerForm.patchValue({
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'Password1!',
        confirm: 'Password1!',
        termService: false
      });
      expect(component.registerForm.valid).toBe(false);
    });
  });
});
