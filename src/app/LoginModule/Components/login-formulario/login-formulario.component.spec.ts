import { ComponentFixture, TestBed } from '@angular/core/testing';

import { loginFormularioComponent } from './login-formulario.component';

describe('loginFormularioComponent', () => {
  let component: loginFormularioComponent;
  let fixture: ComponentFixture<loginFormularioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [loginFormularioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(loginFormularioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
