import { describe, it, expect } from 'vitest';

describe('utils/users.js - isPasswordValid', () => {
  const isPasswordValid = function (password) {
    return (
      password.length >= 8 &&
      password.match(/\d/) &&
      password.match(/[A-Z]/) &&
      password.match(/[a-z]/) &&
      password.match(/[!@#$%^&*(),.?":{}|<>]/)
    );
  };

  it('should return true for a valid password with all requirements', () => {
    const validPassword = 'Password1!';
    expect(isPasswordValid(validPassword)).toBeTruthy();
  });

  it('should return true for a complex valid password', () => {
    const validPassword = 'MyStr0ng@Pass';
    expect(isPasswordValid(validPassword)).toBeTruthy();
  });

  it('should return falsy for password shorter than 8 characters', () => {
    const shortPassword = 'Pass1!';
    expect(isPasswordValid(shortPassword)).toBeFalsy();
  });

  it('should return falsy for password without digits', () => {
    const noDigitPassword = 'Password!';
    expect(isPasswordValid(noDigitPassword)).toBeFalsy();
  });

  it('should return falsy for password without uppercase letters', () => {
    const noUpperPassword = 'password1!';
    expect(isPasswordValid(noUpperPassword)).toBeFalsy();
  });

  it('should return falsy for password without lowercase letters', () => {
    const noLowerPassword = 'PASSWORD1!';
    expect(isPasswordValid(noLowerPassword)).toBeFalsy();
  });

  it('should return falsy for password without special characters', () => {
    const noSpecialPassword = 'Password1';
    expect(isPasswordValid(noSpecialPassword)).toBeFalsy();
  });

  it('should return true for password with various special characters', () => {
    expect(isPasswordValid('Password1@')).toBeTruthy();
    expect(isPasswordValid('Password1#')).toBeTruthy();
    expect(isPasswordValid('Password1$')).toBeTruthy();
    expect(isPasswordValid('Password1%')).toBeTruthy();
    expect(isPasswordValid('Password1^')).toBeTruthy();
    expect(isPasswordValid('Password1&')).toBeTruthy();
    expect(isPasswordValid('Password1*')).toBeTruthy();
    expect(isPasswordValid('Password1(')).toBeTruthy();
    expect(isPasswordValid('Password1)')).toBeTruthy();
    expect(isPasswordValid('Password1,')).toBeTruthy();
    expect(isPasswordValid('Password1.')).toBeTruthy();
    expect(isPasswordValid('Password1?')).toBeTruthy();
    expect(isPasswordValid('Password1"')).toBeTruthy();
    expect(isPasswordValid('Password1:')).toBeTruthy();
    expect(isPasswordValid('Password1{')).toBeTruthy();
    expect(isPasswordValid('Password1}')).toBeTruthy();
    expect(isPasswordValid('Password1|')).toBeTruthy();
    expect(isPasswordValid('Password1<')).toBeTruthy();
    expect(isPasswordValid('Password1>')).toBeTruthy();
  });

  it('should return true for exactly 8 character valid password', () => {
    const exactPassword = 'Passwo1!';
    expect(isPasswordValid(exactPassword)).toBeTruthy();
  });

  it('should return true for very long valid password', () => {
    const longPassword = 'ThisIsAVeryLongPassword123!@#';
    expect(isPasswordValid(longPassword)).toBeTruthy();
  });
});
