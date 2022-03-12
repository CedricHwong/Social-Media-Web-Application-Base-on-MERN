
const { AuthenticationError, UserInputError } = require('apollo-server');

const Post = require('../../models/Post');
const checkAuth = require('../../util/check-auth');

module.exports = {
  Mutation: {
    createComment: async (_, { postId, body }, context) => {
      const { username } = checkAuth(context);
      if (body.trim() === '') {
        throw new UserInputError('Empty comment', {
          errors: {
            body: 'Comment body must not empty'
          }
        });
      }
      const post = await Post.findById(postId);

      if (post) {
        post.comments.unshift({
          body,
          username,
          createdAt: new Date().toISOString()
        });
        await post.save();
        context.pubsub.publish('COMMENT_POST', { updatedPost: {
          eventType: 'NEW_COMMENT',
          postId, post, comment: post.comments[0],
          commentId: post.comments[0].id,
        } });
        return post;
      }
      else throw new UserInputError('Post not found');
    },
    async deleteComment(_, { postId, commentId }, context) {
      const { username } = checkAuth(context);

      const post = await Post.findById(postId);

      if (post) {
        const commentIndex = post.comments.findIndex((c) => c.id === commentId);

        if (post.comments[commentIndex].username === username) {
          post.comments.splice(commentIndex, 1);
          await post.save();
          context.pubsub.publish('COMMENT_POST', { updatedPost: {
            eventType: 'DEL_COMMENT',
            postId, post, commentId
          } });
          return post;
        }
        else {
          throw new AuthenticationError('Action not allowed');
        }
      }
      else {
        throw new UserInputError('Post not found');
      }
    }
  },
};
