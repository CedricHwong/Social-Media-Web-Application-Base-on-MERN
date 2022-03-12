
import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Button, Confirm } from 'semantic-ui-react';

import { DELETE_COMMENT_MUTATION, DELETE_POST_MUTATION, FETCH_POSTS_QUERY } from '../utils/graphql';
import MyPopup from './MyPopup';

function DeleteButton({ postId, commentId, beforeDelete, afterDelete }) {

  const [confirmOpen, setConfirmOpen] = useState(false);
  const MUTATION = commentId? DELETE_COMMENT_MUTATION: DELETE_POST_MUTATION;
  const [deletePostOrComment] = useMutation(MUTATION, {
    variables: { postId, commentId, },
    update(cache) {
      setConfirmOpen(false);
      if (!commentId) {
        cache.updateQuery({ query: FETCH_POSTS_QUERY, }, ({ getPosts }) => ({
          getPosts: getPosts.filter((p) => p.id !== postId),
        }));
      }
      afterDelete?.();
    },
  });

  return (
    <>
      <MyPopup content={commentId? 'Delete comment' : 'Delete post'}>
        <Button icon="trash" as="div" color="red" floated="right"
          onClick={() => setConfirmOpen(true)} />
      </MyPopup>
      <Confirm open={confirmOpen} onCancel={() => setConfirmOpen(false)} onConfirm={() => {
        beforeDelete?.();
        deletePostOrComment();
      }} />
    </>
  );
}

export default DeleteButton;
