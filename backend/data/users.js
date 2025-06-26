let users = [
  { id: '1', username: 'admin', password: 'password', role: 'admin' },
  { id: '2', username: 'engineer', password: 'password', role: 'engineer' },
  { id: '3', username: 'operator', password: 'password', role: 'operator' },
];
let nextUserId = 4;
function getNextUserId() { return String(nextUserId++); }
module.exports = { users, getNextUserId }; 