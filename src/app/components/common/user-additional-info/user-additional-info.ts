import { input, Component } from '@angular/core';
import { IUserForm } from '@/interfaces/IUserForm';
import { TextInput } from '@/components/form/text-input';
import { SocialInput } from '@/components/form/social-input';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TextAreaInput } from '@/components/form/text-area-input';

@Component({
  selector: 'user-additional-info',
  styleUrl: './user-additional-info.scss',
  templateUrl: './user-additional-info.html',
  imports: [TextInput, SocialInput, TextAreaInput, ReactiveFormsModule]
})
export class UserAdditionalInfo {
  // inputs
  formGroup = input.required<FormGroup<IUserForm>>();
}
