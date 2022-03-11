
import React, { useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import moment from 'moment';
import { Grid, Image, Card, Button, Icon, Label } from 'semantic-ui-react';
import { AuthContext } from '../context/auth';
import { FETCH_POST_QUERY } from '../utils/graphql';
import { LikeButton, DeleteButton } from '../components';

function SinglePost() {

  const navigate = useNavigate();
  const { postId } = useParams();
  const { user } = useContext(AuthContext);
  const { loading, data } = useQuery(FETCH_POST_QUERY, {
    variables: { postId },
  });

  function deletePostCallback() {
    navigate('/', { replace: true });
  }

  if (loading || !data) return (<p>Loading post...</p>);

  const {
    id, body, createdAt, username, comments,
    likes, likeCount, commentCount
  } = data.getPost;

  return (
    <Grid>
      <Grid.Row>
        <Grid.Column width={2}>
          <Image floated="right" size="small" src="https://react.semantic-ui.com/images/avatar/large/steve.jpg" />
        </Grid.Column>
        <Grid.Column width={10}>
          <Card fluid>
            <Card.Content>
              <Card.Header>{username}</Card.Header>
              <Card.Meta>
                {createdAt? moment(createdAt).fromNow(): 'a long long time ago'}
              </Card.Meta>
              <Card.Description>{body}</Card.Description>
            </Card.Content>
          </Card>
          <hr />
          <Card.Content extra>
            <LikeButton user={user} post={{ id, likeCount, likes }} />
            <Button as="div" labelPosition="right" onClick={console.log}>
              <Button basic color="blue">
                <Icon name="comments" />
              </Button>
              <Label basic color="blue" pointing="left">{commentCount}</Label>
            </Button>
            {user?.username === username && (
              <DeleteButton postId={id} callback={deletePostCallback} />
            )}
          </Card.Content>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
}

export default SinglePost;
