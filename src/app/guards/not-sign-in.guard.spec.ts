import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { notSignInGuard } from './not-sign-in.guard';

describe('notSignInGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => notSignInGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
