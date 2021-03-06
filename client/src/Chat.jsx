import React, { useState } from "react";
import "./Chat.css";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useSubscription,
  useMutation,
  gql,
} from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { Container, Row, Col, FormInput } from "shards-react";
import { Button, Avatar } from "@material-ui/core";

const link = new WebSocketLink({
  uri: `ws://localhost:4000/`,
  options: {
    reconnect: true,
  },
});

const client = new ApolloClient({
  link,
  uri: "/graphql",
  cache: new InMemoryCache(),
});

const GET_MESSAGES = gql`
  subscription {
    messages {
      id
      content
      user
    }
  }
`;

const POST_MESSAGE = gql`
  mutation($user: String!, $content: String!) {
    postMessage(user: $user, content: $content)
  }
`;

const DELETE_MESSAGE = gql`
  mutation($user: String!, $content: String!) {
    deleteMessage(user: $user, content: $content)
  }
`;

const Messages = ({ user }) => {
  const [toggle, on] = useState(false);
  const [secondsLeft, updateSeconds] = useState(60);
  const { data } = useSubscription(GET_MESSAGES);
  if (!data) {
    return null;
  }
  let startTime = () => {
    console.log("fires");
    on(true);
    setInterval(() => {
      updateSeconds((secondsLeft) => secondsLeft - 1);
    }, 1000);
  };

  return (
    <>
      <div className="chatWindow">
        <Button onClick={startTime}>
          {!toggle ? <h5>Start Battle</h5> : secondsLeft}
        </Button>
        {data.messages.map(({ id, user: messageUser, content }) => (
          <div
            style={{
              display: "flex",
              justifyContent: user === messageUser ? "flex-end" : "flex-start",
              paddingBottom: "1em",
            }}
          >
            <Avatar
              style={{
                height: 30,
                width: 30,
                marginRight: "0.5em",
                border: "2px solid #ffffff",
                borderRadius: 25,
                textAlign: "center",
                fontSize: "10pt",
              }}
              // className={classes.avatar}
              src={
                "https://avatars.dicebear.com/api/initials/" +
                messageUser +
                ".svg"
              }
            />
            {/* <div
              style={{
                height: 50,
                width: 50,
                marginRight: "0.5em",
                border: "2px solid #ffffff",
                borderRadius: 25,
                textAlign: "center",
                fontSize: "10pt",
                paddingTop: 5,
              }}
            >
              {messageUser.slice(0, 4).toUpperCase()}
            </div> */}

            <div
              style={{
                background: user === messageUser ? "blue" : "#e5e6ea",
                color: user === messageUser ? "#ffffff" : "black",
                padding: "10px",
                borderRadius: "1em",
                maxWidth: "60%",
                height: "60%",
              }}
            >
              {content}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
const Chat = () => {
  const [state, stateSet] = React.useState({
    user: "Emanuil",
    content: "",
  });
  const [postMessage] = useMutation(POST_MESSAGE);
  const [deleteMessage] = useMutation(DELETE_MESSAGE);
  const onDelete = () => {
    deleteMessage({
      variables: {
        user: "",
        content: "",
      },
    });
  };
  const onSend = () => {
    if (state.content.length > 0) {
      postMessage({
        variables: state,
      });
    }
    stateSet({
      ...state,
      content: "",
    });
  };
  return (
    <div className="container">
      <Messages user={state.user} />
      <div className="formUser">
        <Row>
          <Col xs={2} style={{ padding: 0 }}>
            <FormInput
              style={{ backgroundColor: "#BCE6FA" }}
              label="User"
              value={state.user}
              onChange={(evt) =>
                stateSet({
                  ...state,
                  user: evt.target.value,
                })
              }
            />
          </Col>
          <Col xs={6}>
            <FormInput
              style={{ backgroundColor: "#BCE6FA" }}
              label="Content"
              value={state.content}
              onChange={(evt) =>
                stateSet({
                  ...state,
                  content: evt.target.value,
                })
              }
              onKeyUp={(evt) => {
                if (evt.keyCode === 13) {
                  onSend();
                }
              }}
            />
          </Col>
          <Col xs={2} style={{ padding: 0 }}>
            <Button
              variant="contained"
              color="#000000"
              onClick={() => onSend()}
              style={{
                backgroundColor: "black",
                color: "white",
                fontFamily: " Oswald",
                border: "2px solid #ffffff",
              }}
            >
              Shoot
            </Button>
          </Col>
          <Col xs={2} style={{ padding: 0 }}>
            {" "}
            <Button
              variant="contained"
              color="secondary"
              onClick={() => onDelete()}
              style={{
                fontFamily: " Oswald",
              }}
            >
              DESTROY
            </Button>
          </Col>
        </Row>
      </div>
    </div>
  );
};
export default () => (
  <ApolloProvider client={client}>
    <Chat />
  </ApolloProvider>
);
