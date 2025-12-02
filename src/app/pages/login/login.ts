import { Content } from '@/layout/content';
import { Button } from '@/components/form/button';
import { Component, inject } from '@angular/core';
import { EmailInput } from '@/components/form/email-input';
import { PasswordInput } from '@/components/form/password-input';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
  imports: [Button, Content, EmailInput, PasswordInput, ReactiveFormsModule]
})
export class Login {
  fb = inject(FormBuilder);
  loginForm = this.fb.group({});

  login() {
    console.log('form', this.loginForm.value);
  }
}
