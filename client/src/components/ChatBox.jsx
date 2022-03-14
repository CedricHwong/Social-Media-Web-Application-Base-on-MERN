
import { useMutation, useSubscription } from "@apollo/client";
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button, Card, Form, Portal, Message, Image, Grid, List } from "semantic-ui-react";
import { useAuth } from "../context/auth";
import { CHAT_MESSAGE_SUBSCRIPTION, POST_MESSAGE_MUTATION } from "../utils/graphql";
import SearchUserBar from "./SearchUserBar";
import useFixRandImg from "../utils/fixRandImg";

function SignleMsg({
  text, right = false, color = right? 'green': 'olive',
  imgSrc = 'https://react.semantic-ui.com/images/avatar/large/steve.jpg',
}) {
  const img = <Grid.Column width={2} className="msgAvatar">
    <Image circular src={imgSrc} />
  </Grid.Column>;
  const msgText = <Grid.Column width={14} className="msgText">
    <Message compact color={color}>{text}</Message>
  </Grid.Column>;
  return (right
  ? <Grid.Row className="signleMsg" textAlign="right">
      {msgText}{img}
    </Grid.Row>
  : <Grid.Row className="signleMsg">
      {img}{msgText}
    </Grid.Row>);
}

function MessageList({ messages = [] }) {
  const { randImgUrl } = useFixRandImg();
  return (
    <Grid verticalAlign="middle" className="messageList">
      {messages.map(({ text, isSelf, imgSrc = randImgUrl }, i) => (
        <SignleMsg text={text} right={isSelf} imgSrc={imgSrc} key={i} />
      ))}
    </Grid>
  );
}

function MassageInput({ onSend }) {
  const [text, setText] = useState('');
  const onChange = (_, { value }) => setText(value);
  return (<Form onSubmit={_ => onSend(text)}>
    <Form.Field style={{ paddingBottom: '0.5rem' }}>
      <Form.Input value={text} placeholder="Aa" name="Aa"
        onChange={onChange}
        action={{
          icon: 'level up alternate',
          color: 'blue'
        }} />
    </Form.Field>
  </Form>);
}

function ChatBtn({ onClick }) {
  return <Button onClick={onClick}
    size="huge" icon="talk" circular color="green" className="chatBtn" />;
}

function UserList({ list = [], onClick }) {
  const { randImgUrl } = useFixRandImg();
  return (
    <List selection>
      {list.map(({ text, username, userId, imgSrc = randImgUrl, }) => (
        <List.Item key={userId} onClick={_ => onClick(userId)}
          header={username} description={text} image={{
            floated: "left", size: "mini", src: imgSrc,
            as: Link, to: `/users/${userId}`,
          }} />
      ))}
    </List>
  );
}

function ChatBox() {
  const [openWin, setOpenWin] = useState(false);
  const handleClose = () => setOpenWin(false);
  const handleOpen = () => setOpenWin(true);
  const [isChating, setChating] = useState(false);

  const { user: currentUser } = useAuth();
  const [chatingUser, setChatingUser] = useState(null);
  const onSelectUser = (_, { result: { user } }) => {
    setChatingUser(user);
    setChating(true);
  };

  // { other user id : {info, msgs: [messages]} }
  const [messages, setMessages] = useState({});

  const [postMessage] = useMutation(POST_MESSAGE_MUTATION);
  useSubscription(CHAT_MESSAGE_SUBSCRIPTION, {
    variables: { receiverId: currentUser?.id },
    onSubscriptionData({ subscriptionData }) {
      if (subscriptionData?.data) {
        const { data: { chatMessage } } = subscriptionData;
        const uid = chatMessage.from === currentUser.id
          ? chatMessage.to: chatMessage.from;
        if (messages[uid]) {
          setMessages({ ...messages, [uid]: { ...messages[uid], msgs: [
            ...messages[uid].msgs, chatMessage
          ] }});
        }
        else {
          setMessages({ ...messages, [uid]: { info: chatMessage.fromUser, msgs: [chatMessage] } });
        }
      }
    }
  });

  const sendMsg = (msg) => {
    if (msg.trim() === '') {}
    else {
      postMessage({
        variables: {
          from: currentUser.id,
          to: chatingUser?.id,
          text: msg,
        },
      });
    }
  };

  return <>
    <ChatBtn onClick={handleOpen} />
    <Portal open={openWin}>
      <Card raised className="chatBox">
        <Card.Content>
          <Card.Header style={{ height: '100%', textAlign: 'center' }}>
            {isChating &&
              <Button compact floated="left" circular basic icon="chevron left" onClick={() => setChating(false)} />}
            {isChating? chatingUser?.username ?? 'ChatBox' : 'ChatBox'}
            <Button compact floated="right" circular basic icon="close" onClick={handleClose} />
          </Card.Header>
        </Card.Content>
        {!isChating &&
        <Card.Content style={{ overflowY: 'auto', minHeight: 420 }}>
          <div style={{ width: '100%', textAlign: 'center' }}>
            <SearchUserBar onSelectUser={onSelectUser} />
          </div>
          <UserList
            onClick={uid => {
              setChatingUser({ id: uid, username: messages[uid].info.username });
              setChating(true);
            }}
            list={Object.entries(messages).map(([uid, { info: { username }, msgs }]) => ({
              text: msgs[msgs.length - 1].text,
              userId: uid,
              username: username,
              // imgSrc,
            }))} />
        </Card.Content>}
        {isChating &&
        <Card.Content style={{ overflowY: 'auto' }}>
          <MessageList messages={messages[chatingUser.id]?.msgs.map(({ text, from }) => ({
            text, isSelf: from === currentUser.id,
            // imgSrc,
          })) ?? []} />
        </Card.Content>}
        {isChating &&
        <Card.Content extra>
          <MassageInput onSend={sendMsg} />
        </Card.Content>}
      </Card>
    </Portal>
  </>;
}

function ChatLayout() {
  const navigate = useNavigate();
  return useAuth().user
    ? <ChatBox />
    : <ChatBtn onClick={_ => navigate('/login')} />;
}

export default ChatLayout;
