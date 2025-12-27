
const service = require('./auth.service');
const { LoginDTO } = require('./dtos/login.dto');
const { RegisterDTO } = require('./dtos/register.dto');
const logger = require('../../app/config/logger')

const {
    COOKIE_HTTP_ONLY,
    COOKIE_SECURE,
    COOKIE_SAMESITE,
    COOKIE_PATH,
} = require('../../app/config/env');

const REFRESH_COOKIE_OPTIONS = {
    httpOnly: COOKIE_HTTP_ONLY === 'true',
    secure: COOKIE_SECURE === 'true',
    sameSite: COOKIE_SAMESITE,
    path: COOKIE_PATH
};

// Login sin cookie httpOnly + secure + sameSite
/*exports.login = async (req, res) => {
    const dto = LoginDTO(req.body);
    const result = await service.login(dto, { ip: req.ip });
    res.json(result);
};*/

exports.login = async (req, res) => {
    const dto = LoginDTO(req.body);
    const { accessToken, refreshToken } = await service.login(dto, { ip: req.ip });

    logger.info(
        { userId: dto.identifier, ip: req.ip },
        'User logged in'
    );

    res
        .cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS)
        .json({ accessToken });
};

exports.register = async (req, res) => {
    const dto = RegisterDTO(req.body);
    const result = await service.register(dto);
    res.status(201).json(result);
};

// Refresh sin cookie httpOnly + secure + sameSite
/*exports.refresh = async (req, res) => {
    const result = await service.refresh(req.body);
    res.json(result);
};*/

exports.refresh = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    const { accessToken, refreshToken: newRefreshToken } =
        await service.refresh({ refreshToken });

    res
        .cookie('refreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS)
        .json({ accessToken });
};

// Logout sin cookie httpOnly + secure + sameSite
/*exports.logout = async (req, res) => {
    const result = await service.logout(req.body);
    res.json(result);
};*/

exports.logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    await service.logout({ refreshToken });

    res
        .clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS)
        //.clearCookie('refreshToken', { path: '/auth/refresh' })
        .json({ message: 'Logged out' });
};

exports.me = async (req, res) => {
    const result = await service.me(req.userId);
    res.json(result);
};

exports.sessions = async (req, res) => {
    const result = await service.sessions(req.userId);
    res.json(result);
}