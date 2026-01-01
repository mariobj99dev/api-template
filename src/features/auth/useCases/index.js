
const { makeLoginUseCase } = require('./login.usecase');
const { makeRegisterUseCase } = require('./register.usecase');
const { makeRefreshUseCase } = require('./refresh.usecase');
const { makeLogoutUseCase } = require('./logout.usecase');
const { makeMeUseCase } = require('./me.usecase');
const { makeSessionsUseCase } = require('./sessions.usecase');

module.exports = {
    makeLoginUseCase,
    makeRegisterUseCase,
    makeRefreshUseCase,
    makeLogoutUseCase,
    makeMeUseCase,
    makeSessionsUseCase,
};