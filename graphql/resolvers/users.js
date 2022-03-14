
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validateRegisterInput, validateLoginInput, validateUpdateInput } = require('../../util/validators');
const { SECRET_KEY } = require('../../config');
const User = require('../../models/User');

const { UserInputError } = require('apollo-server');
const checkAuth = require('../../util/check-auth');
const { withFilter } = require('graphql-subscriptions');

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id || user._id,
      email: user.email,
      username: user.username,
    },
    SECRET_KEY,
    { expiresIn: '3h' },
  );
}

let msgCount = 0;

module.exports = {
  Query: {
    async getUser(_, { userId, username, email }) {
      const isEmpty = (s) => s && !!s.trim();
      if (![userId, username, email].some(isEmpty)) {
        throw new Error('Invalid input: At least one parameter is required.');
      }
      const $and = [];
      if (userId) $and.push({ _id: userId });
      if (username) $and.push({ username });
      if (email) $and.push({ email });
      const user = await User.findOne({ $and });
      if (!user) return null;
      return {
        ...user._doc,
        id: user._id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
      };
    },
    async searchUsers(_, { username, email }) {
      const isEmpty = (s) => s && !!s.trim();
      if (![username, email].some(isEmpty)) {
        throw new Error('Invalid input: At least one parameter is required.');
      }
      const $or = [];
      if (username) $or.push({ username: new RegExp(username, 'i'), });
      if (email) $or.push({ email: new RegExp(email, 'i'), });
      const users = await User.find({ $or }, {}, { limit: 5 });
      return users.map(user => ({
        ...user._doc,
        id: user._id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
      }));
    },
  },
  Mutation: {
    async login(_, { username, password }) {
      const { errors, valid } = validateLoginInput(username, password);

      if (!valid) {
        throw new UserInputError('Errors', { errors });
      }

      const user = await User.findOne({ username });

      if (!user) {
        errors.general = 'User not found';
        throw new UserInputError('User not found', { errors });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        errors.general = 'Wrong crendetials';
        throw new UserInputError('Wrong crendetials', { errors });
      }

      const token = generateToken(user);

      return {
        ...user._doc,
        id: user._id,
        token,
      };
    },
    async register(
      _,
      {
        registerInput: { username, email, password, confirmPassword }
      },
      context,
      info
    ) {
      // TODO: Validate user data
      const { valid, errors } = validateRegisterInput(
        username,
        email,
        password,
        confirmPassword
      );
      if (!valid) {
        throw new UserInputError('Errors', { errors });
      }

      // TODO: Make sure user doesnt already exist
      const user = await User.findOne({ username });
      if (user) {
        throw new UserInputError('Username is taken', {
          errors: {
            username: 'This username is taken',
          }
        });
      }
      // TODO: hash password and create an auth token
      password = await bcrypt.hash(password, 12);

      const newUser = new User({
        email,
        username,
        password,
        createdAt: new Date().toISOString(),
      });

      const res = await newUser.save();

      const token = generateToken(res);
      return {
        ...res._doc,
        id: res._id,
        token,
      };
    },
    async updateUserInfo(_, {
      id, description, username, oldPwd, newPwd, confirmPwd, email,
    }, context, info) {
      const { errors, valid } = validateUpdateInput(username, newPwd, confirmPwd, email);
      if (!valid) {
        throw new UserInputError('Errors', { errors });
      }
      const user = await User.findOne({ _id: id });
      if (!user) {
        errors.general = 'User not found';
        throw new UserInputError('User not found', { errors });
      }
      try {
        const authUser = checkAuth(context);
        if (user.id !== authUser.id) throw new Error('Wrong crendetials');
      }
      catch (err) {
        const match = await bcrypt.compare(oldPwd, user.password);
        if (!match) {
          errors.general = 'Wrong crendetials';
          throw new UserInputError('Wrong crendetials', { errors });
        }
      }
      if (username) user.username = username;
      if (newPwd) user.password = await bcrypt.hash(newPwd, 12);
      if (email) user.email = email;
      if (description !== undefined) user.description = description;
      const res = await user.save();
      const token = generateToken(res);
      return {
        ...res._doc,
        id: res._id,
        token,
      };
    },
    async postMessage(parent, { from, to, text }, { pubsub }) {
      const id = ++msgCount;
      const user = await User.findById(from);
      if (user)
        pubsub.publish('MSG', { chatMessage: { from, to, text, id, fromUser: {
          ...user._doc,
          id: user._id,
          email: user.email,
          username: user.username,
          createdAt: user.createdAt,
        } } });
      return id;
    },
  },
  Subscription: {
    chatMessage: {
      subscribe: withFilter((parent, args, { pubsub }) => {
        return pubsub.asyncIterator(['MSG']);
      }, (payload, variables) => {
        return payload.chatMessage.to + '' === variables.receiverId + '' || payload.chatMessage.from + '' === variables.receiverId + '';
      }),
    },
  },
};
