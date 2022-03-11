
import React, { useContext } from 'react';
import { useQuery } from '@apollo/client';
import { Grid } from 'semantic-ui-react';
import { PostCard, PostForm } from '../components';
import { AuthContext } from '../context/auth';
import { FETCH_POSTS_QUERY } from '../utils/graphql';

function Home() {
  const { user } = useContext(AuthContext);
  const { loading, error, data } = useQuery(FETCH_POSTS_QUERY);
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
        : data?.getPosts?.map((post) => (
          <Grid.Column key={post.id} style={{ marginBottom: 20 }}>
            <PostCard post={post} />
          </Grid.Column>
        )) ?? error?.message ?? 'Error'
      }</Grid.Row>
    </Grid>
  );
}

export default Home;
