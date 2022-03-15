
import React, { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { Grid, Transition } from 'semantic-ui-react';
import { PostCard, PostForm } from '../components';
import { useAuth } from '../context/auth';
import { FETCH_POSTS_QUERY, POST_UPDATED_SUBSCRIPTION } from '../utils/graphql';
import { createMedia } from '@artsy/fresnel';

const { MediaContextProvider, Media } = createMedia({
  breakpoints: {
    mobile: 0,
    tablet: 768,
    computer: 1024,
  },
});

const DesktopContainer = ({ children }) => <Media at="computer">
  <Grid columns={3}>{children}</Grid>
</Media>;
const TabletContainer = ({ children }) => <Media at="tablet">
  <Grid columns={2}>{children}</Grid>
</Media>;
const MobileContainer = ({ children }) => <Media at="mobile">
  <Grid columns={1}>{children}</Grid>
</Media>;

const ResponsiveGrid = ({ children }) => <MediaContextProvider>
  <DesktopContainer>{children}</DesktopContainer>
  <TabletContainer>{children}</TabletContainer>
  <MobileContainer>{children}</MobileContainer>
</MediaContextProvider>;

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
    <ResponsiveGrid>
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
              <Grid.Column key={post.id}>
                <PostCard post={post} />
              </Grid.Column>
            )) ?? error?.message ?? 'Error'
          }</Transition.Group>
      }</Grid.Row>
    </ResponsiveGrid>
  );
}

export default Home;
