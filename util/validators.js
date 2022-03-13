
const emailRegEx = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;

module.exports.validateRegisterInput = (
  username,
  email,
  password,
  confirmPassword
) => {
  const errors = {};
  if (username.trim() === '') {
    errors.username = 'Username must not be empty';
  }
  if (email.trim() === '') {
    errors.email = 'Email must not be empty';
  }
  else if (!email.match(emailRegEx)) {
    errors.email = 'Email must be a valid email address';
  }
  if (password === '') {
    errors.password = 'Password must not empty';
  }
  else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords must match';
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports.validateLoginInput = (username, password) => {
  const errors = {};
  if (username.trim() === '') {
    errors.username = 'Username must not be empty';
  }
  if (password === '') {
    errors.password = 'Password must not be empty';
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports.validateUpdateInput = (username, newPwd, confirmPwd, email) => {
  const errors = {};
  if (username && !!username.trim())
    errors.username = 'Username must not be empty';
  if (email) {
    email = email.trim();
    if (!email.match(emailRegEx))
      errors.email = 'Email must be a valid email address';
  }
  if (newPwd && newPwd !== confirmPwd)
    errors.confirmPwd = 'Passwords must match';

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};
