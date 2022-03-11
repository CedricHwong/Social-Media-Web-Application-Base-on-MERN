
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';
import { Form, Button } from 'semantic-ui-react';

import { useForm } from '../utils/useFormHooks';
import { useAuth } from '../context/auth';

const LOGIN_USER = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      id
      email
      username
      createdAt
      token
    }
  }
`;

function Login() {

  const authCtx = useAuth();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const { onChange, onSubmit, values } = useForm(loginUserCb, {
    username: '',
    password: '',
  });

  const [loginUser, { loading }] = useMutation(LOGIN_USER, {
    update(_, { data: { login: userData } }) {
      authCtx.login(userData);
      navigate('/', { replace: true });
    },
    onError(err) {
      console.error(err, err.graphQLErrors);
      setErrors(err.graphQLErrors[0].extensions.errors);
    },
    variables: values,
  });

  function loginUserCb() {
    loginUser();
  }

  return (
    <div className="form-container">
      <Form onSubmit={onSubmit} noValidate>
        <h1>Login</h1>
        <Form.Input
          type="text"
          label="Username" placeholder="Username.."
          name="username" value={values.username}
          error={!!errors.username}
          onChange={onChange}
        />
        <Form.Input
          type="password"
          label="Password" placeholder="Password.."
          name="password" value={values.password}
          error={!!errors.password}
          onChange={onChange}
        />
        <Button type="submit" primary>Login</Button>
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

export default Login;
