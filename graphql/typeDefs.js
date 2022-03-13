
const gql = require('graphql-tag');

module.exports = gql`
  type Post {
    id: ID!
    body: String!
    author: User!
    createdAt: String!
    comments: [Comment]!
    likes: [Like]!
    likeCount: Int!
    commentCount: Int!
  }
  type Comment {
    id: ID!
    createdAt: String!
    author: User!
    body: String!
  }
  type Like {
    id: ID!
    createdAt: String!
    user: User!
  }
  type User {
    id: ID!
    email: String!
    token: String
    username: String!
    createdAt: String!
  }
  type updatedPostEvent {
    eventType: String!
    postId: ID!
    post: Post
    commentId: ID
    comment: Comment
  }
  input RegisterInput {
    username: String!
    password: String!
    confirmPassword: String!
    email: String!
  }
  input UpdateUserInfoInput {
    id: ID!
    oldPwd: String!
    username: String
    newPwd: String
    confirmPwd: String
    email: String
  }
  type Query {
    getPosts: [Post]!
    getPost(postId: ID!): Post
    getUser(userId: ID, username: String, email: String): User
  }
  type Mutation {
    register(registerInput: RegisterInput): User!
    login(username: String!, password: String!): User!
    updateUserInfo(updateUserInfoInput: UpdateUserInfoInput!): User!
    createPost(body: String!): Post!
    deletePost(postId: ID!): String!
    createComment(postId: String!, body: String!): Post!
    deleteComment(postId: ID!, commentId: ID!): Post!
    likePost(postId: ID!): Post!
  }
  type Subscription {
    updatedPost(postId: ID): updatedPostEvent!
  }
`;
