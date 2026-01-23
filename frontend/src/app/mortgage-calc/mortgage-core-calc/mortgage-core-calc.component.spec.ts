import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CustomValidatorsDirective } from 'src/app/shared/directives/custom-validators.directive';
import { MortgageCoreCalcComponent } from './mortgage-core-calc.component';

describe('MortgageCoreCalcComponent', () => {
  let component: MortgageCoreCalcComponent;
  let fixture: ComponentFixture<MortgageCoreCalcComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MortgageCoreCalcComponent],
      imports: [IonicModule.forRoot(), ReactiveFormsModule],
      providers: [CustomValidatorsDirective]
    }).compileComponents();

    fixture = TestBed.createComponent(MortgageCoreCalcComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should have default form values', () => {
      expect(component.mortgageForm.get('price').value).toBe('300,000');
      expect(component.mortgageForm.get('downPayment').value).toBe('100,000');
      expect(component.mortgageForm.get('interest').value).toBe(5);
      expect(component.mortgageForm.get('term').value).toBe(30);
    });

    it('should have default payPerYear of 12', () => {
      expect(component.payPerYear).toBe(12);
    });

    it('should have simpleMode as false by default', () => {
      expect(component.simpleMode).toBe(false);
    });

    it('should have boxShadow as true by default', () => {
      expect(component.boxShadow).toBe(true);
    });

    it('should have initial monthlyPayment as 0', () => {
      expect(component.monthlyPayment).toBe('0');
    });

    it('should have initial lifetimePayment as 0', () => {
      expect(component.lifetimePayment).toBe('0');
    });
  });

  describe('form validation', () => {
    it('should be valid with default values', () => {
      expect(component.mortgageForm.valid).toBe(true);
    });

    it('should be invalid when price is empty', () => {
      component.mortgageForm.patchValue({ price: '' });
      expect(component.mortgageForm.get('price').valid).toBe(false);
    });

    it('should be invalid when downPayment is empty', () => {
      component.mortgageForm.patchValue({ downPayment: '' });
      expect(component.mortgageForm.get('downPayment').valid).toBe(false);
    });

    it('should be invalid when interest exceeds 20', () => {
      component.mortgageForm.patchValue({ interest: 25 });
      expect(component.mortgageForm.get('interest').valid).toBe(false);
    });

    it('should be invalid when term exceeds 30', () => {
      component.mortgageForm.patchValue({ term: 35 });
      expect(component.mortgageForm.get('term').valid).toBe(false);
    });

    it('should be invalid when downPayment is greater than price', () => {
      component.mortgageForm.patchValue({ price: '100,000', downPayment: '200,000' });
      expect(component.mortgageForm.hasError('paymentIsGreater')).toBe(true);
    });

    it('should be valid when price is greater than downPayment', () => {
      component.mortgageForm.patchValue({ price: '300,000', downPayment: '100,000' });
      expect(component.mortgageForm.hasError('paymentIsGreater')).toBe(false);
    });
  });

  describe('formatValue', () => {
    it('should format numeric value with commas', () => {
      const mockEvent = { target: { value: '1000000' } } as unknown as Event;
      component.formatValue(mockEvent, 'price');
      expect(component.mortgageForm.get('price').value).toBe('1,000,000');
    });

    it('should remove non-numeric characters', () => {
      const mockEvent = { target: { value: '1,000,000abc' } } as unknown as Event;
      component.formatValue(mockEvent, 'price');
      expect(component.mortgageForm.get('price').value).toBe('1,000,000');
    });

    it('should handle empty value', () => {
      const mockEvent = { target: { value: '' } } as unknown as Event;
      const originalValue = component.mortgageForm.get('price').value;
      component.formatValue(mockEvent, 'price');
      expect(component.mortgageForm.get('price').value).toBe(originalValue);
    });
  });

  describe('getMonthlyCalculate', () => {
    it('should not calculate when form is invalid', () => {
      component.mortgageForm.patchValue({ price: '' });
      component.getMonthlyCalculate();
      expect(component.monthlyPayment).toBe('0');
    });

    it('should calculate monthly payment with valid form', () => {
      component.mortgageForm.patchValue({
        price: '300,000',
        downPayment: '60,000',
        interest: 5,
        term: 30,
        propertyTax: '0',
        insurance: '0'
      });
      component.simpleMode = true;
      component.getMonthlyCalculate();
      expect(Number(component.monthlyPayment.replace(/,/g, ''))).toBeGreaterThan(0);
    });

    it('should emit formValue event', () => {
      spyOn(component.formValue, 'emit');
      component.mortgageForm.patchValue({
        price: '300,000',
        downPayment: '60,000',
        interest: 5,
        term: 30,
        propertyTax: '0',
        insurance: '0'
      });
      component.simpleMode = true;
      component.getMonthlyCalculate();
      expect(component.formValue.emit).toHaveBeenCalled();
    });

    it('should emit scheduleChanged event', () => {
      spyOn(component.scheduleChanged, 'emit');
      component.mortgageForm.patchValue({
        price: '300,000',
        downPayment: '60,000',
        interest: 5,
        term: 30,
        propertyTax: '0',
        insurance: '0'
      });
      component.simpleMode = true;
      component.getMonthlyCalculate();
      expect(component.scheduleChanged.emit).toHaveBeenCalledWith(true);
    });

    it('should include tax and insurance in non-simple mode', () => {
      component.simpleMode = false;
      component.mortgageForm.patchValue({
        price: '300,000',
        downPayment: '60,000',
        interest: 5,
        term: 30,
        propertyTax: '150',
        insurance: '300'
      });
      component.getMonthlyCalculate();
      const monthlyWithExtras = Number(component.monthlyPayment.replace(/,/g, ''));

      component.mortgageForm.patchValue({
        propertyTax: '0',
        insurance: '0'
      });
      component.getMonthlyCalculate();
      const monthlyWithoutExtras = Number(component.monthlyPayment.replace(/,/g, ''));

      expect(monthlyWithExtras).toBeGreaterThan(monthlyWithoutExtras);
    });
  });

  describe('getAmortizationSchedule', () => {
    it('should emit amortization schedule', () => {
      spyOn(component.amortizationSchedule, 'emit');
      component.mortgageForm.patchValue({
        price: '300,000',
        downPayment: '60,000',
        interest: 5,
        term: 30,
        propertyTax: '0',
        insurance: '0'
      });
      component.getAmortizationSchedule();
      expect(component.amortizationSchedule.emit).toHaveBeenCalled();
    });

    it('should generate correct number of payments', () => {
      let emittedSchedule: any[] = [];
      component.amortizationSchedule.subscribe(schedule => {
        emittedSchedule = schedule;
      });
      component.mortgageForm.patchValue({
        price: '300,000',
        downPayment: '60,000',
        interest: 5,
        term: 30,
        propertyTax: '0',
        insurance: '0'
      });
      component.getAmortizationSchedule();
      expect(emittedSchedule.length).toBe(361);
    });

    it('should have final balance of 0', () => {
      let emittedSchedule: any[] = [];
      component.amortizationSchedule.subscribe(schedule => {
        emittedSchedule = schedule;
      });
      component.mortgageForm.patchValue({
        price: '300,000',
        downPayment: '60,000',
        interest: 5,
        term: 30,
        propertyTax: '0',
        insurance: '0'
      });
      component.getAmortizationSchedule();
      const lastPayment = emittedSchedule[emittedSchedule.length - 1];
      expect(lastPayment.balance).toBe(0);
    });

    it('should have increasing accumulated principal', () => {
      let emittedSchedule: any[] = [];
      component.amortizationSchedule.subscribe(schedule => {
        emittedSchedule = schedule;
      });
      component.mortgageForm.patchValue({
        price: '300,000',
        downPayment: '60,000',
        interest: 5,
        term: 30,
        propertyTax: '0',
        insurance: '0'
      });
      component.getAmortizationSchedule();
      for (let i = 1; i < emittedSchedule.length; i++) {
        expect(emittedSchedule[i].accPrincipal).toBeGreaterThanOrEqual(emittedSchedule[i - 1].accPrincipal);
      }
    });
  });

  describe('ngAfterViewInit', () => {
    it('should call getMonthlyCalculate and getAmortizationSchedule after timeout', fakeAsync(() => {
      spyOn(component, 'getMonthlyCalculate');
      spyOn(component, 'getAmortizationSchedule');
      component.ngAfterViewInit();
      tick(1000);
      expect(component.getMonthlyCalculate).toHaveBeenCalled();
      expect(component.getAmortizationSchedule).toHaveBeenCalled();
    }));
  });

  describe('edge cases', () => {
    it('should handle zero interest rate', () => {
      component.mortgageForm.patchValue({
        price: '300,000',
        downPayment: '60,000',
        interest: 0,
        term: 30,
        propertyTax: '0',
        insurance: '0'
      });
      component.simpleMode = true;
      component.getMonthlyCalculate();
      expect(component.monthlyPayment).toBeDefined();
    });

    it('should handle very small loan amount', () => {
      component.mortgageForm.patchValue({
        price: '10,000',
        downPayment: '1,000',
        interest: 5,
        term: 5,
        propertyTax: '0',
        insurance: '0'
      });
      component.simpleMode = true;
      component.getMonthlyCalculate();
      expect(Number(component.monthlyPayment.replace(/,/g, ''))).toBeGreaterThan(0);
    });

    it('should handle maximum interest rate', () => {
      component.mortgageForm.patchValue({
        price: '300,000',
        downPayment: '60,000',
        interest: 20,
        term: 30,
        propertyTax: '0',
        insurance: '0'
      });
      component.simpleMode = true;
      component.getMonthlyCalculate();
      expect(Number(component.monthlyPayment.replace(/,/g, ''))).toBeGreaterThan(0);
    });

    it('should handle 1 year term', () => {
      component.mortgageForm.patchValue({
        price: '300,000',
        downPayment: '60,000',
        interest: 5,
        term: 1,
        propertyTax: '0',
        insurance: '0'
      });
      component.simpleMode = true;
      component.getMonthlyCalculate();
      expect(Number(component.monthlyPayment.replace(/,/g, ''))).toBeGreaterThan(0);
    });

    it('should handle different payPerYear values', () => {
      component.payPerYear = 26;
      component.mortgageForm.patchValue({
        price: '300,000',
        downPayment: '60,000',
        interest: 5,
        term: 30,
        propertyTax: '0',
        insurance: '0'
      });
      component.simpleMode = true;
      component.getMonthlyCalculate();
      expect(Number(component.monthlyPayment.replace(/,/g, ''))).toBeGreaterThan(0);
    });
  });
});
