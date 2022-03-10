
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';
import { Form, Button } from 'semantic-ui-react';

import { useForm } from '../utils/useFormHooks';

const REGISTER_USER = gql`
  mutation register(
    $username: String!
    $email: String!
    $password: String!
    $confirmPassword: String!
  ) {
    register(
      registerInput: {
        username: $username
        email: $email
        password: $password
        confirmPassword: $confirmPassword
      }
    ) {
      id
      email
      username
      createdAt
      token
    }
  }
`;

function Register() {

  let navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const { onChange, onSubmit, values } = useForm(registerUser, {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [addUser, { loading }] = useMutation(REGISTER_USER, {
    update(proxy, result) {
      console.log(result);
      // navigate('/login', { replace: true });
      navigate('/');
    },
    onError(err) {
      console.error(err, err.graphQLErrors);
      setErrors(err.graphQLErrors[0].extensions.errors);
    },
    variables: values,
  });

  function registerUser() {
    addUser();
  }

  return (
    <div className="form-container">
      <Form onSubmit={onSubmit} noValidate>
        <h1>Register</h1>
        <Form.Input
          type="text"
          label="Username" placeholder="Username.."
          name="username" value={values.username}
          error={!!errors.username}
          onChange={onChange}
        />
        <Form.Input
          type="email"
          label="Email" placeholder="Email.."
          name="email" value={values.email}
          error={!!errors.email}
          onChange={onChange}
        />
        <Form.Input
          type="password"
          label="Password" placeholder="Password.."
          name="password" value={values.password}
          error={!!errors.password}
          onChange={onChange}
        />
        <Form.Input
          type="password"
          label="Confirm Password" placeholder="Confirm Password.."
          name="confirmPassword" value={values.confirmPassword}
          error={!!errors.confirmPassword}
          onChange={onChange}
        />
        <Button type="submit" primary>Register</Button>
      </Form>
      {Object.keys(errors).length > 0 && (
        <div className='ui error message'>
          <ul className='list'>
            {Object.values(errors).map((value) => (
              <li key={value}>{value}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Register;
