
import { useMutation, useQuery } from '@apollo/client';
import moment from 'moment';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import TextareaAutosize from "react-textarea-autosize";
import { Button, Card, Form, Icon, Segment, TextArea } from 'semantic-ui-react';
import { RandImg } from '../components';

import { useAuth } from '../context/auth';
import { FETCH_USER_QUERY, UPDATE_USER_INFO_MUTATION } from '../utils/graphql';

function UserDetails() {

  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  let user = null;

  const [userDescription, setUserDescription] = useState(user?.description || '');
  const { loading, data, subscribeToMore } = useQuery(FETCH_USER_QUERY, {
    variables: { userId, },
    onCompleted({ getUser }) { setUserDescription(getUser.description); },
  });

  if (userId === currentUser?.id) user = { ...currentUser };
  if (!loading && data) {
    const { getUser } = data;
    user = user || {};
    user.id = user.id || getUser.id || userId;
    user.email = user.email || getUser.email;
    user.username = user.username || getUser.username;
    user.createdAt = user.createdAt || getUser.createdAt;
    user.description = user.description || getUser.description;
  }

  const [showBtns, setShowBtns] = useState(false);
  const [updateUserInfo] = useMutation(UPDATE_USER_INFO_MUTATION, {
    variables: { updateUserInfoInput: { id: userId, description: userDescription, } },
    update(cache, result) {
      const existingUser = cache.readQuery({
        query: FETCH_USER_QUERY,
      });
      cache.writeQuery({
        query: FETCH_USER_QUERY,
        data: {
          getUser: { ...existingUser, ...result.data.updateUserInfo },
        },
      });
      setUserDescription(result.data.updateUserInfo.description);
    },
  });
  if (!loading && !data) return (<p>error</p>);

  return (
    <Segment textAlign="center" basic padded='very' loading={loading}>
      <Card.Group centered>
        <Card>
          <div style={{ position: 'relative' }}>
            <RandImg large wrapped />
            {userId === currentUser?.id
            && <Button basic icon="edit" style={{ position: 'absolute', top: '1%', right: 0, }}/>}
          </div>
          <Card.Content>
            <Card.Header style={{ fontSize: '1.5rem' }}>{user?.username}</Card.Header>
            <Card.Meta>
              {'has been a memeber since '}
              {user?.createdAt? moment(user.createdAt).fromNow(): 'a long long time ago'}
            </Card.Meta>
            <Card.Description>
              {userId === currentUser?.id
              ? <Form onSubmit={_ => { updateUserInfo(); setShowBtns(false); }}>
                  <TextareaAutosize rows={4}
                    placeholder="Say hello to the world!" value={userDescription}
                    onChange={e => setUserDescription(e.target.value)}
                    onFocus={_ => setShowBtns(true)}
                    onBlur={_ => userDescription === user?.description && setShowBtns(false)}
                    style={{ with: '100%', resize: 'none' }} />
                  {showBtns &&
                  <Button.Group widths={2}>
                    <Button basic color="orange" onClick={_ => { setUserDescription(user?.description || ''); setShowBtns(false); }}>
                      <Icon name="cancel" /> Cancel
                    </Button>
                    <Button basic color="blue" type="submit">
                      <Icon name="cloud upload" /> Public
                    </Button>
                  </Button.Group>}
                </Form>
              : user?.description || 'The user has not written a profile yet.'}
            </Card.Description>
          </Card.Content>
          <Card.Content extra>
            <a href={`mailto:${user?.email}`}><Icon name="mail" /> {user?.email}</a>
          </Card.Content>
        </Card>
      </Card.Group>
    </Segment>
  );
}

export default UserDetails;
