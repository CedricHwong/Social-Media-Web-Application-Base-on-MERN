
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Icon, Label } from 'semantic-ui-react';
import moment from 'moment';
import { useAuth } from '../context/auth';
import LikeButton from './LikeButton';
import DeleteButton from './DeleteButton';
import MyPopup from './MyPopup';
import RandImg from './RandImg';

function PostCard({
  post: {
    id, body, author, createdAt, likes, likeCount, commentCount,
  }
}) {

  const { user } = useAuth();
  const commentOnPost = console.log;

  return (
    <Card fluid>
      <Card.Content as={Link} to={`/posts/${id}`}>
        <RandImg floated="right" size="mini" as={Link} to={`/users/${author.id}`} />
        <Card.Header>{author.username}</Card.Header>
        <Card.Meta>
          {createdAt? moment(createdAt).fromNow(): 'a long long time ago'}
        </Card.Meta>
        <Card.Description>{body}</Card.Description>
      </Card.Content>
      <Card.Content extra>
        <LikeButton user={user} post={{ id, likes, likeCount }} />
        <MyPopup content="Comment on post">
          <Button as="div" labelPosition="right" onClick={commentOnPost}>
            <Button color="blue" basic>
              <Icon name="comments" />
            </Button>
            <Label basic color="teal" pointing="left">{commentCount}</Label>
          </Button>
        </MyPopup>
        {user?.id === author.id && (
          <DeleteButton postId={id} />
        )}
      </Card.Content>
    </Card>
  );
}

export default PostCard;
