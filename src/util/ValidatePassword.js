export const validatePassword = password => {
  const minLength = 8;
  const uppercasePattern = /[A-Z]/;
  const lowercasePattern = /[a-z]/;
  const numericPattern = /[0-9]/;
  const specialCharPattern = /[!@#$%^&*(),.?":{}|<>]/;

  if (!password) {
    return 'Please enter your password';
  }
  // if (password.length < minLength) {
  //   return `Password must be at least ${minLength} characters long`;
  // }
  // if (!uppercasePattern.test(password)) {
  //   return 'Password must contain at least one uppercase letter';
  // }
  // if (!lowercasePattern.test(password)) {
  //   return 'Password must contain at least one lowercase letter';
  // }
  // if (!numericPattern.test(password)) {
  //   return 'Password must contain at least one numeric character';
  // }
  // if (!specialCharPattern.test(password)) {
  //   return 'Password must contain at least one special character';
  // }
  return false;
};

export const validatePasswordConfirm = password => {
  const minLength = 8;
  const uppercasePattern = /[A-Z]/;
  const lowercasePattern = /[a-z]/;
  const numericPattern = /[0-9]/;
  const specialCharPattern = /[!@#$%^&*(),.?":{}|<>]/;

  if (!password) {
    return 'Please re-enter your password';
  }
  // if (password.length < minLength) {
  //   return `Confirm Password must be at least ${minLength} characters long`;
  // }
  // if (!uppercasePattern.test(password)) {
  //   return 'Confirm Password must contain at least one uppercase letter';
  // }
  // if (!lowercasePattern.test(password)) {
  //   return 'Confirm Password must contain at least one lowercase letter';
  // }
  // if (!numericPattern.test(password)) {
  //   return 'Confirm Password must contain at least one numeric character';
  // }
  // if (!specialCharPattern.test(password)) {
  //   return 'Confirm Password must contain at least one special character';
  // }
  return false;
};
