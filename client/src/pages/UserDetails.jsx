
import { useQuery } from '@apollo/client';
import moment from 'moment';
import React from 'react';
import { useParams } from 'react-router-dom';
import { Button, Card, Form, Icon, Segment, TextArea } from 'semantic-ui-react';
import { RandImg } from '../components';

import { useAuth } from '../context/auth';
import { FETCH_USER_QUERY } from '../utils/graphql';

function UserDetails() {

  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  let user = null;

  const { loading, data, subscribeToMore } = useQuery(FETCH_USER_QUERY, {
    variables: { userId, },
  });

  if (userId === currentUser?.id) user = { ...currentUser };
  else if (loading) return (<p>Loading...</p>);
  else if (!data) return (<p>error</p>);
  else user = { ...data.getUser };
  if (!loading && data) {
    const { getUser } = data;
    user.id = user.id || getUser.id || userId;
    user.email = user.email || getUser.email;
    user.username = user.username || getUser.username;
    user.createdAt = user.createdAt || getUser.createdAt;
    user.description = user.description || getUser.description;
  }

  return (
    <Segment textAlign="center" basic padded='very'>
      <Card.Group centered>
        <Card>
          <div style={{ position: 'relative' }}>
            <RandImg large wrapped />
            {userId === currentUser?.id
            && <Button basic icon="edit" style={{ position: 'absolute', top: '1%', right: 0, }}/>}
          </div>
          <Card.Content>
            <Card.Header style={{ fontSize: '1.5rem' }}>{user.username}</Card.Header>
            <Card.Meta>
              {'has been a memeber since '}
              {user.createdAt? moment(user.createdAt).fromNow(): 'a long long time ago'}
            </Card.Meta>
            <Card.Description>
              {userId === currentUser?.id
              ? <Form>
                  <TextArea rows={4} placeholder="Say hello to the world!" value={user.description || ''}
                  style={{ with: '100%' }} />
                  <Button.Group widths={2}>
                    <Button basic color="orange">
                      <Icon name="cancel" /> Cancel
                    </Button>
                    <Button basic color="blue" type="submit">
                      <Icon name="cloud upload" /> Public
                    </Button>
                  </Button.Group>
                </Form>
              : user.description || 'The user has not written a profile yet.'}
            </Card.Description>
          </Card.Content>
          <Card.Content extra>
            <a href={`mailto:${user.email}`}><Icon name="mail" /> {user.email}</a>
          </Card.Content>
        </Card>
      </Card.Group>
    </Segment>
  );
}

export default UserDetails;
