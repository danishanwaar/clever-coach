export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Step 1: Subjects validation
export const validateSubjectsStep = (selectedSubjects: Array<{ id: string; name: string; class: string }>): ValidationResult => {
  const errors: ValidationError[] = [];

  if (selectedSubjects.length === 0) {
    errors.push({
      field: 'selectedSubjects',
      message: 'Please select at least one subject to continue'
    });
  }

  // Check if all selected subjects have a grade level
  const subjectsWithoutLevel = selectedSubjects.filter(subject => !subject.class);
  if (subjectsWithoutLevel.length > 0) {
    errors.push({
      field: 'selectedSubjects',
      message: 'Please select a grade level for all subjects'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Step 2: Educational background validation
export const validateEducationStep = (education: string): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!education || education.trim() === '') {
    errors.push({
      field: 'education',
      message: 'Please select your highest educational qualification'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Step 3: Personal information validation
export const validatePersonalInfoStep = (formData: {
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  birthDate: string;
  phone: string;
  street: string;
  postalCode: string;
  city: string;
  description: string;
  howFound: string;
}): ValidationResult => {
  const errors: ValidationError[] = [];

  // First name validation
  if (!formData.firstName || formData.firstName.trim() === '') {
    errors.push({
      field: 'firstName',
      message: 'First name is required'
    });
  } else if (formData.firstName.trim().length < 2) {
    errors.push({
      field: 'firstName',
      message: 'First name must be at least 2 characters long'
    });
  }

  // Last name validation
  if (!formData.lastName || formData.lastName.trim() === '') {
    errors.push({
      field: 'lastName',
      message: 'Last name is required'
    });
  } else if (formData.lastName.trim().length < 2) {
    errors.push({
      field: 'lastName',
      message: 'Last name must be at least 2 characters long'
    });
  }

  // Email validation
  if (!formData.email || formData.email.trim() === '') {
    errors.push({
      field: 'email',
      message: 'Email address is required'
    });
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.push({
        field: 'email',
        message: 'Please enter a valid email address'
      });
    }
  }

  // Gender validation
  if (!formData.gender || formData.gender.trim() === '') {
    errors.push({
      field: 'gender',
      message: 'Please select your gender'
    });
  }

  // Birth date validation
  if (!formData.birthDate || formData.birthDate.trim() === '') {
    errors.push({
      field: 'birthDate',
      message: 'Birth date is required'
    });
  } else {
    const birthDate = new Date(formData.birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (age < 18) {
      errors.push({
        field: 'birthDate',
        message: 'You must be at least 18 years old to register as a teacher'
      });
    }
  }

  // Phone validation
  if (!formData.phone || formData.phone.trim() === '') {
    errors.push({
      field: 'phone',
      message: 'Phone number is required'
    });
  } else {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      errors.push({
        field: 'phone',
        message: 'Please enter a valid phone number'
      });
    }
  }

  // Address validation
  if (!formData.street || formData.street.trim() === '') {
    errors.push({
      field: 'street',
      message: 'Street address is required'
    });
  }

  if (!formData.postalCode || formData.postalCode.trim() === '') {
    errors.push({
      field: 'postalCode',
      message: 'Postal code is required'
    });
  }

  if (!formData.city || formData.city.trim() === '') {
    errors.push({
      field: 'city',
      message: 'City is required'
    });
  }

  // Description validation
  if (!formData.description || formData.description.trim() === '') {
    errors.push({
      field: 'description',
      message: 'Please describe your current job and why you would like to tutor'
    });
  } else if (formData.description.trim().length < 50) {
    errors.push({
      field: 'description',
      message: 'Description must be at least 50 characters long'
    });
  } else if (formData.description.trim().length > 600) {
    errors.push({
      field: 'description',
      message: 'Description must not exceed 600 characters'
    });
  }

  // How found validation
  if (!formData.howFound || formData.howFound.trim() === '') {
    errors.push({
      field: 'howFound',
      message: 'Please tell us how you found out about us'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Step 4: Terms validation
export const validateTermsStep = (formData: {
  authorizationMinors: boolean;
  termsAccepted: boolean;
}): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!formData.authorizationMinors) {
    errors.push({
      field: 'authorizationMinors',
      message: 'You must authorize working with minors to continue'
    });
  }

  if (!formData.termsAccepted) {
    errors.push({
      field: 'termsAccepted',
      message: 'You must accept the terms and conditions to continue'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Main validation function for each step
export const validateStep = (step: number, formData: any): ValidationResult => {
  switch (step) {
    case 1:
      return validateSubjectsStep(formData.selectedSubjects);
    case 2:
      return validateEducationStep(formData.education);
    case 3:
      return validatePersonalInfoStep(formData);
    case 4:
      return validateTermsStep(formData);
    default:
      return { isValid: true, errors: [] };
  }
};
