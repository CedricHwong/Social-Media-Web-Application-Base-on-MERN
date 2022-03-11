
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from '@apollo/client';
import { Button, Label, Icon } from 'semantic-ui-react';
import { LIKE_POST_MUTATION } from '../utils/graphql';

function LikeButton({ user, post: { id, likeCount, likes } }) {

  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setLiked(user && likes.find((like) => like.username === user.username));
  }, [user, likes]);

  const [likePost] = useMutation(LIKE_POST_MUTATION, {
    variables: { postId: id, },
  });

  return (
    <Button as="div" labelPosition="right" onClick={likePost}>{user
      ? <Button color="teal" basic={!liked}>
          <Icon name="heart" />
        </Button>
      : <Button as={Link} to="/login" color="teal" basic>
          <Icon name="heart" />
        </Button>}
      <Label basic color="teal" pointing="left">{likeCount}</Label>
    </Button>
  );
}

export default LikeButton;
