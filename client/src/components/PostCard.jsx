import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Card, Image, Button, Icon, Label } from 'semantic-ui-react';
import moment from 'moment';
import { AuthContext } from '../context/auth';

function PostCard({
  post: {
    body, createdAt, id, username, likeCount, commentCount, likes,
  }
}) {

  const { user } = useContext(AuthContext);
  const likePost = console.log;
  const commentOnPost = console.log;

  return (
    <Card fluid>
      <Card.Content>
        <Image floated="right" size="mini" src="https://react.semantic-ui.com/images/avatar/large/steve.jpg" />
        <Card.Header>{username}</Card.Header>
        <Card.Meta as={Link} to={`/posts/${id}`}>
          {moment(createdAt).fromNow()}
        </Card.Meta>
        <Card.Description>{body}</Card.Description>
      </Card.Content>
      <Card.Content extra>
        <Button as="div" labelPosition="right" onClick={likePost}>
          <Button color="teal" basic>
            <Icon name="heart" />
          </Button>
          <Label basic color="teal" pointing="left">{likeCount}</Label>
        </Button>
        <Button as="div" labelPosition="right" onClick={commentOnPost}>
          <Button color="blue" basic>
            <Icon name="comments" />
          </Button>
          <Label basic color="teal" pointing="left">{commentCount}</Label>
        </Button>
        {user?.username === username && (
          <Button as="div" color="red" floated="right" onClick={console.log}>
            <Icon name="trash" style={{ margin: 0 }} />
          </Button>
        )}
      </Card.Content>
    </Card>
  );
}

export default PostCard;
