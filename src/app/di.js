
//Ports
const transactionPort = require('../features/auth/ports/transaction.port');
const userPort = require('../features/users/ports/user.port');
const userProfilePort = require('../features/profile/ports/userProfile.port');
const identityPort = require('../features/auth/ports/authIdentity.port');
const loginAttemptsPort = require('../features/auth/ports/loginAttempts.port');
const sessionPort = require('../features/auth/ports/session.port');

//Adapters
const transactionPgAdapter = require('../features/auth/adapters/transaction.adapter');
const userPgAdapter = require('../features/users/adapters/user.pg.adapter');
const userProfilePgAdapter = require('../features/profile/adapters/userProfile.pg.adapter');
const identityPgAdapter = require('../features/auth/adapters/authIdentity.pg.adapter');
const loginAttemptsPgAdapter = require('../features/auth/adapters/loginAttempts.pg.adapter');
const sessionPgAdapter = require('../features/auth/adapters/session.pg.adapter');

//Implementations
transactionPort.setImplementation(transactionPgAdapter);
userPort.setImplementation(userPgAdapter);
userProfilePort.setImplementation(userProfilePgAdapter);
identityPort.setImplementation(identityPgAdapter);
loginAttemptsPort.setImplementation(loginAttemptsPgAdapter);
sessionPort.setImplementation(sessionPgAdapter);