
import React, { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { Grid, Transition } from 'semantic-ui-react';
import { PostCard, PostForm } from '../components';
import { useAuth } from '../context/auth';
import { FETCH_POSTS_QUERY, POST_CREATED_SUBSCRIPTION } from '../utils/graphql';

function Home() {
  const { user } = useAuth();
  const { loading, error, data, subscribeToMore } = useQuery(FETCH_POSTS_QUERY);

  useEffect(() => {
    subscribeToMore({
      document: POST_CREATED_SUBSCRIPTION,
      updateQuery(prev, { subscriptionData }) {
        if (!subscriptionData.data?.newPost) return prev;
        const { newPost } = subscriptionData.data;
        return {
          ...prev,
          getPosts: [newPost, ...prev.getPosts],
        };
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
