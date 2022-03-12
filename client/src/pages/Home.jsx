
import React, { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { Grid, Transition } from 'semantic-ui-react';
import { PostCard, PostForm } from '../components';
import { useAuth } from '../context/auth';
import { FETCH_POSTS_QUERY, POST_UPDATED_SUBSCRIPTION } from '../utils/graphql';

function Home() {
  const { user } = useAuth();
  const { loading, error, data, subscribeToMore } = useQuery(FETCH_POSTS_QUERY);

  useEffect(() => {
    subscribeToMore({
      document: POST_UPDATED_SUBSCRIPTION,
      updateQuery(prev, { subscriptionData }) {
        if (!subscriptionData.data) return prev;
        const { updatedPost } = subscriptionData.data;
        const prevHasPost = prev.getPosts.some(p => p.id === updatedPost.postId);
        switch (updatedPost.eventType) {
        case 'NEW':
          if (prevHasPost) return prev;
          return { ...prev, getPosts: [updatedPost.post, ...prev.getPosts] };
        case 'DELETE':
          if (!prevHasPost) return prev;
          return { ...prev, getPosts: prev.getPosts.filter(p => p.id !== updatedPost.postId) };
        case 'LIKE': case 'COMMENT':
        default:
          return prev;
        }
      },
    });
  }, []);

  return (
    <Grid columns={3}>
      <Grid.Row className="page-title">
        <h1>Recent Posts</h1>
      </Grid.Row>
      <Grid.Row>{
        user && (
          <Grid.Column>
            <PostForm />
          </Grid.Column>
        )
      }{ loading
        ? <h1>Loading posts...</h1>
        : <Transition.Group>{
            data?.getPosts?.map((post) => (
              <Grid.Column key={post.id} style={{ marginBottom: 20 }}>
                <PostCard post={post} />
              </Grid.Column>
            )) ?? error?.message ?? 'Error'
          }</Transition.Group>
      }</Grid.Row>
    </Grid>
  );
}

export default Home;
