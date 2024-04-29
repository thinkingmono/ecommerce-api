const { StatusCodes } = require('http-status-codes');
const User = require('../models/User');
const CustomError = require('../errors/');
const { attachCookiesToResponse, createTokenUser } = require('../utils');

const register = async (req, res) => {
    const { name, email, password } = req.body;
    const emailFind = await User.findOne({ email })
    if (emailFind) {
        throw new CustomError.BadRequestError('Email account already in use. Please provide another one')
    }

    const isFirstAccount = (await User.countDocuments({})) === 0;
    const role = isFirstAccount ? 'admin' : 'user';

    const user = await User.create({ name, email, password, role });

    // const userToken = { userId: user._id, name: user.name, role: user.role };
    const userToken = createTokenUser({ user });

    attachCookiesToResponse({ res, userToken });

    res.status(StatusCodes.CREATED).json({ user: userToken })
}

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new CustomError.BadRequestError('Please provide email and password');
    }

    const user = await User.findOne({ email })

    if (!user) {
        throw new CustomError.UnauthenticatedError('User does not exist')
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
        throw new CustomError.UnauthenticatedError('Invalid credentials')
    }

    // const userToken = { userId: user._id, name: user.name, role: user.role }
    const userToken = createTokenUser({ user });

    attachCookiesToResponse({ res, userToken })

    res.status(StatusCodes.OK).json({ user: userToken, msg: 'Login succesfully' })
}

const logout = async (req, res) => {
    res.cookie('token', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now())
    })
    res.status(StatusCodes.OK).json({ msg: 'Logout user' })
}

module.exports = { register, login, logout }