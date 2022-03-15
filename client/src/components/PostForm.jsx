
import React from 'react';
import { Button, Form } from 'semantic-ui-react';
import { useMutation } from '@apollo/client';

import { useForm } from '../utils/useFormHooks';
import { FETCH_POSTS_QUERY, CREATE_POST_MUTATION } from '../utils/graphql';

function PostForm() {

  const { values, onChange, onSubmit } = useForm(createPostCb, {
    body: ''
  });

  const [createPost, { error }] = useMutation(CREATE_POST_MUTATION, {
    variables: values,
    update(cache, result) {
      const existingPosts = cache.readQuery({
        query: FETCH_POSTS_QUERY
      });
      cache.writeQuery({
        query: FETCH_POSTS_QUERY,
        data: {
          getPosts: [result.data.createPost, ...existingPosts.getPosts]
        },
      });
      values.body = '';
    },
  });

  function createPostCb() {
    createPost();
  }

  return (
    <>
      <Form onSubmit={onSubmit} style={ error?.graphQLErrors[0]? {} : { marginBottom: 20 }}>
        <h2>Create a post:</h2>
        <Form.Field>
          <Form.Input
            placeholder="Hi World!"
            name="body"
            onChange={onChange}
            value={values.body}
            error={!!error}
          />
          <Button type="submit" color="teal">Post</Button>
        </Form.Field>
      </Form>
      {error?.graphQLErrors[0] && (
        <div className="ui error message" style={{ marginBottom: 20 }}>
          <ul className="list">
            <li>{error.graphQLErrors[0].message}</li>
          </ul>
        </div>
      )}
    </>
  );
}

export default PostForm;
