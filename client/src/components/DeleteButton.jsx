
import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Button, Icon, Confirm } from 'semantic-ui-react';

import { DELETE_COMMENT_MUTATION, DELETE_POST_MUTATION, FETCH_POSTS_QUERY } from '../utils/graphql';

function DeleteButton({ postId, commentId, callback }) {

  const [confirmOpen, setConfirmOpen] = useState(false);
  const MUTATION = commentId? DELETE_COMMENT_MUTATION: DELETE_POST_MUTATION;
  const [deletePostOrComment] = useMutation(MUTATION, {
    variables: { postId, commentId, },
    update(cache) {
      setConfirmOpen(false);
      if (!commentId) {
        const existingPosts = cache.readQuery({
          query: FETCH_POSTS_QUERY,
        });
        cache.writeQuery({
          query: FETCH_POSTS_QUERY,
          data: {
            getPosts: existingPosts.getPosts.filter((p) => p.id !== postId),
          }
        });
      }
      callback?.();
    },
  });

  return (
    <>
      <Button as="div" color="red" floated="right" onClick={() => setConfirmOpen(true)}>
        <Icon name="trash" style={{ margin: 0 }} />
      </Button>
      <Confirm open={confirmOpen} onCancel={() => setConfirmOpen(false)} onConfirm={deletePostOrComment} />
    </>
  );
}

export default DeleteButton;
