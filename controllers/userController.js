const CustomError = require('../errors/');
const { StatusCodes } = require('http-status-codes');
const User = require('../models/User');
const { createTokenUser, attachCookiesToResponse, checkPermissions } = require('../utils');

const getAllUsers = async (req, res) => {
    const users = await User.find({ role: 'user' }).select('-password');
    res.status(StatusCodes.OK).json({ users });
}

const getSingleUser = async (req, res) => {
    const { id } = req.params;
    const user = await User.findOne({ _id: id }).select('-password');
    if (!user) {
        throw new CustomError.NotFoundError(`User with ${id} not found`);
    }

    checkPermissions(req.user, id);

    res.status(StatusCodes.OK).json({ user });
}

const showCurrentUser = async (req, res) => {
    if (!req.user) {
        throw new CustomError.NotFoundError('There is no user logged');
    }
    res.status(StatusCodes.OK).json({ user: req.user })
}

//findOneAndUpdate
// const updateUser = async (req, res) => {
//     const { name, email } = req.body;
//     if (!name || !email) {
//         throw new CustomError.BadRequestError('Please provide name and email');
//     }

//     const user = await User.findOneAndUpdate({ _id: req.user.userId }, { name, email }, { new: true, runValidators: true, });

//     // console.log(user);

//     if (!user) {
//         throw new CustomError.NotFoundError(`User with id ${req.user.userId} not found`);
//     }

//     const userToken = createTokenUser({ user });

//     attachCookiesToResponse({ res, userToken });

//     res.status(StatusCodes.OK).send({ user: userToken, msg: 'User updated' })
// }

//user.save()
const updateUser = async (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
        throw new CustomError.BadRequestError('Please provide name and email');
    }

    const user = await User.findOne({ _id: req.user.userId });

    if (!user) {
        throw new CustomError.NotFoundError(`User with id ${req.user.userId} not found`);
    }

    user.email = email;
    user.name = name;

    await user.save();

    const userToken = createTokenUser({ user });

    attachCookiesToResponse({ res, userToken });

    res.status(StatusCodes.OK).send({ user: userToken, msg: 'User updated' })
}

const updateUserPassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body

    if (!oldPassword || !newPassword) {
        throw new CustomError.BadRequestError('Please fill all the fields');
    }

    let user = await User.findOne({ _id: req.user.userId })

    const isPasswordCorrect = await user.comparePassword(oldPassword);

    if (!isPasswordCorrect) {
        throw new CustomError.UnauthenticatedError('Invalid credentials');
    }

    user['password'] = newPassword;
    await user.save();

    res.status(StatusCodes.OK).json({ user, msg: 'Success! Password updated' })
}

module.exports = { getAllUsers, getSingleUser, showCurrentUser, updateUser, updateUserPassword }