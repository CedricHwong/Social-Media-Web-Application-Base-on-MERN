
import { gql } from '@apollo/client';

export const FETCH_POSTS_QUERY = gql`
  query {
    getPosts {
      id
      body
      createdAt
      author { id, username }
      likeCount
      likes {
        user { id }
      }
      commentCount
    }
  }
`;

export const CREATE_POST_MUTATION = gql`
  mutation createPost($body: String!) {
    createPost(body: $body) {
      id
      body
      createdAt
      author { id, username }
      likes {
        user { id }
      }
      likeCount
      commentCount
    }
  }
`;

export const REGISTER_USER_MUTATION = gql`
  mutation register(
    $username: String!
    $email: String!
    $password: String!
    $confirmPassword: String!
  ) {
    register(
      registerInput: {
        username: $username
        email: $email
        password: $password
        confirmPassword: $confirmPassword
      }
    ) {
      id
      email
      username
      createdAt
      token
    }
  }
`;

export const LOGIN_USER = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      id
      email
      username
      createdAt
      token
    }
  }
`;

export const LIKE_POST_MUTATION = gql`
  mutation likePost($postId: ID!) {
    likePost(postId: $postId) {
      id
      likes {
        id
        user { id }
      }
      likeCount
    }
  }
`;

export const FETCH_POST_QUERY = gql`
  query($postId: ID!) {
    getPost(postId: $postId) {
      id
      body
      createdAt
      author { id, username }
      likeCount
      likes {
        user { id }
      }
      commentCount
      comments {
        id
        author { id, username }
        createdAt
        body
      }
    }
  }
`;

export const DELETE_POST_MUTATION = gql`
  mutation deletePost($postId: ID!) {
    deletePost(postId: $postId)
  }
`;

export const CREATE_COMMENT_MUTATION = gql`
  mutation($postId: String!, $body: String!) {
    createComment(postId: $postId, body: $body) {
      id
      comments {
        id
        body
        createdAt
        author { id, username }
      }
      commentCount
    }
  }
`;

export const DELETE_COMMENT_MUTATION = gql`
  mutation deleteComment($postId: ID!, $commentId: ID!) {
    deleteComment(postId: $postId, commentId: $commentId) {
      id
      comments {
        id
        author { id, username }
        createdAt
        body
      }
      commentCount
    }
  }
`;

export const POST_UPDATED_SUBSCRIPTION = gql`
  subscription UpdatedPost($postId: ID) {
    updatedPost(postId: $postId) {
      eventType
      postId
      post {
        id
        body
        createdAt
        author { id, username }
        likeCount
        likes {
          user { id }
        }
        commentCount
        comments {
          id
          author { id, username }
          createdAt
          body
        }
      }
    }
  }
`;

export const FETCH_USER_QUERY = gql`
  query GetUser($userId: ID, $username: String, $email: String) {
    getUser(userId: $userId, username: $username, email: $email) {
      id
      email
      username
      createdAt
    }
  }
`;
