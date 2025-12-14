import { FormControl, AbstractControl } from '@angular/forms';

export interface IUserForm {
  // step 1 fields
  dob?: FormControl<string | null>;
  title?: FormControl<string | null>;
  email?: FormControl<string | null>;
  mobile?: FormControl<string | null>;
  address?: FormControl<string | null>;
  username?: FormControl<string | null>;
  password?: FormControl<string | null>;
  latitude?: FormControl<number | null>;
  last_name?: FormControl<string | null>;
  longitude?: FormControl<number | null>;
  first_name?: FormControl<string | null>;
  account_type?: FormControl<'Individual' | 'Business'>;

  settings?: AbstractControl<{
    hide_email?: FormControl<boolean | null>;
    hide_mobile?: FormControl<boolean | null>;
    hide_location?: FormControl<boolean | null>;
  }>;

  // step 2 fields
  socials?: AbstractControl<{
    website?: FormControl<string | null>;
    twitter?: FormControl<string | null>;
    facebook?: FormControl<string | null>;
    linkedin?: FormControl<string | null>;
    snapchat?: FormControl<string | null>;
    instagram?: FormControl<string | null>;
  }>;
  company_name?: FormControl<string | null>;
  description?: FormControl<string | null>;
  college_university_name?: FormControl<string | null>;

  // step 3 fields
  image_url?: FormControl<string | null>;
  thumbnail_url?: FormControl<string | null>;
}
