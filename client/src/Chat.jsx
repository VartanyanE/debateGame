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
import { Button } from "@material-ui/core";

const link = new WebSocketLink({
  uri: `ws://localhost:4000/`,
  options: {
    reconnect: true,
  },
});

const client = new ApolloClient({
  link,
  uri: "http://localhost:4000/",
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

const Messages = ({ user }) => {
  const [toggle, on] = useState(false);
  const { data } = useSubscription(GET_MESSAGES);
  if (!data) {
    return null;
  }

  return (
    <>
      <div className="chatWindow">
        {data.messages.map(({ id, user: messageUser, content }) => (
          <div
            style={{
              display: "flex",
              justifyContent: user === messageUser ? "flex-end" : "flex-start",
              paddingBottom: "1em",
            }}
          >
            <div
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
            </div>

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
          <Col xs={8}>
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
                width: "100%",
                backgroundColor: "black",
                color: "white",
                fontFamily: " Oswald",
              }}
            >
              Shoot
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
