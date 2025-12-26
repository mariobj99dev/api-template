
const service = require('./auth.service');
const { LoginDTO } = require('./dtos/login.dto');
const { RegisterDTO } = require('./dtos/register.dto');

exports.login = async (req, res) => {
    const dto = LoginDTO(req.body);
    const result = await service.login(dto, { ip: req.ip });
    res.json(result);
};

exports.register = async (req, res) => {
    const dto = RegisterDTO(req.body);
    const result = await service.register(dto);
    res.status(201).json(result);
};

exports.refresh = async (req, res) => {
    const result = await service.refresh(req.body);
    res.json(result);
};

exports.logout = async (req, res) => {
    const result = await service.logout(req.body);
    res.json(result);
};

exports.me = async (req, res) => {
    const result = await service.me(req.userId);
    res.json(result);
};
