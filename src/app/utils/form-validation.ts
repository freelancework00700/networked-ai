import { FormGroup } from '@angular/forms';

/**
 * validates form fields and marks invalid fields as touched
 * @param form The FormGroup to validate
 * @param fieldNames Array of form control names to validate
 * @param cdr Optional ChangeDetectorRef to trigger change detection
 * @returns true if all fields are valid, false otherwise
 */
export function validateFields(form: FormGroup, fieldNames: string[]): boolean {
  // mark all fields as touched and update validity
  fieldNames.forEach((field) => {
    const control = form.get(field);
    if (control && !control.disabled) {
      // if control is a FormGroup (nested), mark all nested controls as touched
      if (control instanceof FormGroup) {
        Object.keys(control.controls).forEach((key) => {
          const nestedControl = control.get(key);
          if (nestedControl && !nestedControl.disabled) {
            nestedControl.markAsTouched();
            nestedControl.updateValueAndValidity();
          }
        });
      } else {
        control.markAsTouched();
        control.updateValueAndValidity();
      }
    }
  });

  // check if all fields are valid
  const isValid = fieldNames.every((field) => {
    const control = form.get(field);
    if (!control) return false;
    // if control is disabled and has a value, consider it valid
    if (control.disabled && control.value) {
      return true;
    }
    // if it's a FormGroup (nested), check all nested controls are valid
    if (control instanceof FormGroup) {
      return Object.keys(control.controls).every((key) => {
        const nestedControl = control.get(key);
        if (!nestedControl) return false;
        if (nestedControl.disabled && nestedControl.value) {
          return true;
        }
        return nestedControl.valid;
      });
    }
    // otherwise check normal validation
    return control.valid;
  });

  return isValid;
}
