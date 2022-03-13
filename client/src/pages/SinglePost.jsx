
import React, { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import moment from 'moment';
import { Grid, Image, Card, Button, Icon, Label, Form, Transition, Modal, Header } from 'semantic-ui-react';
import { useAuth } from '../context/auth';
import { FETCH_POST_QUERY, CREATE_COMMENT_MUTATION, POST_UPDATED_SUBSCRIPTION, FETCH_POSTS_QUERY } from '../utils/graphql';
import { LikeButton, DeleteButton, MyPopup } from '../components';
import { apolloCache } from '../Apollo';

function SinglePost() {

  const navigate = useNavigate();
  const { postId } = useParams();
  const { user } = useAuth();
  const { loading, data, subscribeToMore } = useQuery(FETCH_POST_QUERY, {
    variables: { postId },
  });

  const [isDeleted, setIsDeleted] = useState(false);
  let deleting = false;
  useEffect(() => {
    subscribeToMore({
      document: POST_UPDATED_SUBSCRIPTION,
      variables: { postId, },
      updateQuery(prev, { subscriptionData }) {
        if (!subscriptionData.data) return prev;
        const { updatedPost } = subscriptionData.data;
        switch (updatedPost.eventType) {
        case 'DELETE':
          if (!deleting) {
            setIsDeleted(true);
            // update posts list for home
            apolloCache.updateQuery({ query: FETCH_POSTS_QUERY, }, ({ getPosts }) => ({
              getPosts: getPosts.filter((p) => p.id !== postId),
            }));
          }
        case 'LIKE':
          return prev;
        }
        const prevComments = prev.getPost.comments;
        const prevHasComment = prevComments.some(c => c.id === updatedPost.commentId);
        switch (updatedPost.eventType) {
        case 'NEW_COMMENT':
          if (prevHasComment) return prev;
          return { ...prev, getPost: updatedPost.post };
        case 'DEL_COMMENT':
          if (!prevHasComment) return prev;
          return { ...prev, getPost: updatedPost.post };
        default:
          return prev;
        }
      },
    });
  }, []);

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

  if (loading) return (<p>Loading post...</p>);
  if (!data) return (<Navigate replace to="/" />);

  const post = data.getPost, {
    id, body, createdAt, author, comments,
    likes, likeCount, commentCount
  } = post;

  const CardBody = ({ info: { author, createdAt, body } }) => <>
    <Card.Header>{author.username}</Card.Header>
    <Card.Meta>
      {createdAt? moment(createdAt).fromNow(): 'a long long time ago'}
    </Card.Meta>
    <Card.Description>{body}</Card.Description>
  </>;

  return (
    <>
      <Modal open={isDeleted} size="small" basic onClick={deletePostCallback}>
        <Header icon>
          <Icon name="delete" color="red" />
          The post is lost.
        </Header>
        <Modal.Content>
          <p style={{ textAlign: "center" }}>The post has been deleted, click to return to the homepage.</p>
        </Modal.Content>
        <Modal.Actions>
          <Button basic color="green" onClick={deletePostCallback}>
            <Icon name="home" style={{ margin: 0 }} />
          </Button>
        </Modal.Actions>
      </Modal>
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
              <MyPopup content="Comment on post">
                <Button as="div" labelPosition="right" onClick={console.log}>
                  <Button basic color="blue">
                    <Icon name="comments" />
                  </Button>
                  <Label basic color="blue" pointing="left">{commentCount}</Label>
                </Button>
              </MyPopup>
              {user?.id === author.id && (
                <DeleteButton postId={id}
                  beforeDelete={() => deleting = true}
                  afterDelete={deletePostCallback}
                />
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
            <Transition.Group>
              {comments.map((comment) => (
                <Card fluid key={comment.id}>
                  <Card.Content>
                    {user?.id === comment.author.id && (
                      <DeleteButton postId={id} commentId={comment.id} />
                    )}
                    <CardBody info={comment} />
                  </Card.Content>
                </Card>
              ))}
            </Transition.Group>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </>
  );
}

export default SinglePost;
