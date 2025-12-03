import { Content } from '@/layout/content';
import { Button } from '@/components/form/button';
import { AuthService } from '@/services/auth.service';
import { signal, inject, Component } from '@angular/core';
import { EmailInput } from '@/components/form/email-input';
import { PasswordInput } from '@/components/form/password-input';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

interface LoginForm {
  phone?: FormControl<string | null>;
  email?: FormControl<string | null>;
  password?: FormControl<string | null>;
}

@Component({
  selector: 'login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
  imports: [Button, Content, EmailInput, PasswordInput, ReactiveFormsModule]
})
export class Login {
  // services
  fb = inject(FormBuilder);
  authService = inject(AuthService);

  // signals
  loginForm = signal<FormGroup<LoginForm>>(this.fb.group({}));

  async login() {
    console.log('form', this.loginForm().value);
    const result = await this.authService.signInWithEmailAndPassword('ravi.disolutions@gmail.com', 'Test@123');
    console.log('result', result);
  }
}
