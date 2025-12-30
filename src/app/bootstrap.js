
//Ports
const transactionPort = require('../features/auth/ports/transaction.port');
const userPort = require('../features/auth/ports/user.port');
const userProfilePort = require('../features/profile/ports/userProfile.port');
const identityPort = require('../features/auth/ports/identity.port');

//Adapters
const transactionAdapter = require('../features/auth/adapters/transaction.adapter');
const userPgAdapter = require('../features/auth/adapters/user.pg.adapter');
const userProfilePgAdapter = require('../features/profile/adapters/userProfile.pg.adapter');
const identityPgAdapter = require('../features/auth/adapters/identity.pg.adapter');

//Implementations
transactionPort.setImplementation(transactionAdapter);
userPort.setImplementation(userPgAdapter);
userProfilePort.setImplementation(userProfilePgAdapter);
identityPort.setImplementation(identityPgAdapter);