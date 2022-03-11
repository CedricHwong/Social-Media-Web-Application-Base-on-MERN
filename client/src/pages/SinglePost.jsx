
import React, { useContext, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import moment from 'moment';
import { Grid, Image, Card, Button, Icon, Label, Form } from 'semantic-ui-react';
import { AuthContext } from '../context/auth';
import { FETCH_POST_QUERY, CREATE_COMMENT_MUTATION } from '../utils/graphql';
import { LikeButton, DeleteButton } from '../components';

function SinglePost() {

  const navigate = useNavigate();
  const { postId } = useParams();
  const { user } = useContext(AuthContext);
  const { loading, data } = useQuery(FETCH_POST_QUERY, {
    variables: { postId },
  });

  const commentInputRef = useRef(null);
  const [comment, setComment] = useState('');
  const [submitComment] = useMutation(CREATE_COMMENT_MUTATION, {
    variables: { postId, body: comment, },
    update() {
      setComment('');
      commentInputRef.current.blur();
    },
  });

  function deletePostCallback() {
    navigate('/', { replace: true });
  }

  if (loading || !data) return (<p>Loading post...</p>);

  const post = data.getPost, {
    id, body, createdAt, username, comments,
    likes, likeCount, commentCount
  } = post;

  const CardBody = ({ info: { username, createdAt, body } }) => <>
    <Card.Header>{username}</Card.Header>
    <Card.Meta>
      {createdAt? moment(createdAt).fromNow(): 'a long long time ago'}
    </Card.Meta>
    <Card.Description>{body}</Card.Description>
  </>;

  return (
    <Grid>
      <Grid.Row>
        <Grid.Column width={2}>
          <Image floated="right" size="small" src="https://react.semantic-ui.com/images/avatar/large/steve.jpg" />
        </Grid.Column>
        <Grid.Column width={10}>
          <Card fluid><Card.Content><CardBody info={post} /></Card.Content></Card>
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
          {user && (
            <Card fluid>
              <Card.Content>
                <p>Post a comment</p>
                <Form>
                  <div className="ui action input fluid">
                    <input
                      type="text" value={comment}
                      placeholder="Comment.." name="comment"
                      onChange={(e) => setComment(e.target.value)}
                      ref={commentInputRef}
                    />
                    <button
                      type="submit"
                      className="ui button teal"
                      disabled={comment.trim() === ''}
                      onClick={submitComment}
                    >
                      Submit
                    </button>
                  </div>
                </Form>
              </Card.Content>
            </Card>
          )}
          {comments.map((comment) => (
            <Card fluid key={comment.id}>
              <Card.Content>
                <CardBody info={comment} />
              </Card.Content>
            </Card>
          ))}
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
}

export default SinglePost;
