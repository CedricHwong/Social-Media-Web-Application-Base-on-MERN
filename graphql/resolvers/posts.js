
const { AuthenticationError, UserInputError } = require('apollo-server');
const { withFilter } = require('graphql-subscriptions');

const Post = require('../../models/Post');
const checkAuth = require('../../util/check-auth');
const autoPopulate = require('../../util/autoPopulate');

module.exports = {
  Query: {
    async getPosts(parent, args, context, info) {
      try {
        const posts = await autoPopulate(
          Post.find(), info
        ).sort({ createdAt: -1 });
        return posts;
      }
      catch (err) {
        throw new Error(err);
      }
    },
    async getPost(_, { postId }, context, info) {
      try {
        const post = await autoPopulate(Post.findById(postId), info);
        if (post) {
          return post;
        }
        else {
          throw new Error('Post not found');
        }
      }
      catch (err) {
        throw new Error(err);
      }
    }
  },
  Mutation: {
    async createPost(_, { body }, context, info) {
      const user = checkAuth(context);

      if (body.trim() === '') {
        throw new Error('Post body must not be empty');
      }

      const newPost = new Post({
        body,
        author: user._id,
        createdAt: new Date().toISOString(),
      });

      const post = await newPost.save();
      await autoPopulate(post);

      context.pubsub.publish('NEW_POST', { updatedPost: {
        eventType: 'NEW',
        postId: post.id, post,
      } });

      return post;
    },
    async deletePost(_, { postId }, context) {
      const user = checkAuth(context);

      try {
        const post = await Post.findById(postId);
        if (user.id === '' + post.author) {
          await post.delete();
          context.pubsub.publish('DEL_POST', { updatedPost: { eventType: 'DELETE', postId } });
          return 'Post deleted successfully';
        }
        else {
          throw new AuthenticationError('Action not allowed');
        }
      }
      catch (err) {
        throw new Error(err);
      }
    },
    async likePost(_, { postId }, context, info) {
      const user = checkAuth(context);

      const post = await Post.findById(postId);
      if (post) {
        if (post.likes.some((like) => like.user + '' === user.id)) {
          // Post already likes, unlike it
          post.likes = post.likes.filter((like) => like.user + '' !== user.id);
        }
        else {
          // Not liked, like post
          post.likes.push({
            user: user._id,
            createdAt: new Date().toISOString(),
          });
        }
        await post.save();
        await autoPopulate(post);
        context.pubsub.publish('LIKE_POST', { updatedPost: { eventType: 'LIKE', postId, post } });
        return post;
      }
      else throw new UserInputError('Post not found');
    },
  },
  Subscription: {
    updatedPost: {
      subscribe: withFilter(
        (_, __, { pubsub }) => pubsub.asyncIterator([
          'NEW_POST', 'DEL_POST', 'LIKE_POST', 'COMMENT_POST'
        ]),
        (payload, variables) =>
          !variables.postId || payload.updatedPost.postId === variables.postId,
      ),
    },
  },
};
