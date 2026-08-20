const { io } = require('socket.io-client');
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const BASE_URL = 'http://localhost:3000';

async function register(username, email, password) {
  const res = await fetch(`${BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  return res.json();
}

async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const cookies = res.headers.raw()['set-cookie'] || [];
  const accessToken = cookies.find(c => c.startsWith('accessToken='))?.split(';')[0];
  const refreshToken = cookies.find(c => c.startsWith('refreshToken='))?.split(';')[0];
  return { accessToken, refreshToken, cookieString: [accessToken, refreshToken].filter(Boolean).join('; ') };
}

async function apiGet(path, cookieString) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Cookie: cookieString },
  });
  return res.json();
}

async function apiPost(path, cookieString, body = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieString },
    body: JSON.stringify(body),
  });
  if (res.status === 204) return null;
  return res.json();
}

function connectSocket(cookieString) {
  return io(BASE_URL, {
    extraHeaders: { cookie: cookieString },
    transports: ['websocket'],
  });
}

function waitForEvent(socket, event, timeoutMs = 3000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timeout waiting for '${event}'`)), timeoutMs);
    socket.once(event, (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('\n=== Setup: register + login ===');

  await register('wsalice', 'wsalice@test.com', 'password123');
  await register('wsbob',   'wsbob@test.com',   'password123');

  const alice = await login('wsalice@test.com', 'password123');
  const bob   = await login('wsbob@test.com',   'password123');
  console.log('Alice cookie:', alice.accessToken?.slice(0, 40) + '...');
  console.log('Bob cookie:  ', bob.accessToken?.slice(0, 40) + '...');

  const aliceProfile = await apiGet('/users/me', alice.cookieString);
  const bobProfile   = await apiGet('/users/me', bob.cookieString);
  console.log(`Alice id=${aliceProfile.id}, Bob id=${bobProfile.id}`);

  console.log('\n=== Setup: friendship ===');
  await apiPost(`/friends/request/${bobProfile.id}`, alice.cookieString);
  const pending = await apiGet('/friends/pending', bob.cookieString);
  const friendshipId = pending[0]?.id;
  await apiPost(`/friends/accept/${friendshipId}`, bob.cookieString);
  console.log('Friendship accepted, friendshipId:', friendshipId);

  const conversations = await apiGet('/conversations', alice.cookieString);
  const convId = conversations[0]?.id;
  console.log('Conversation id:', convId);

  console.log('\n=== Connect WebSockets ===');
  const socketAlice = connectSocket(alice.cookieString);
  const socketBob   = connectSocket(bob.cookieString);

  await Promise.all([
    new Promise(r => socketAlice.on('connect', () => { console.log('Alice socket connected:', socketAlice.id); r(); })),
    new Promise(r => socketBob.on('connect',   () => { console.log('Bob socket connected:  ', socketBob.id);   r(); })),
  ]);

  ['message', 'history', 'exception', 'conversationCreated'].forEach(evt => {
    socketAlice.on(evt, data => console.log(`[Alice] ${evt}:`, JSON.stringify(data, null, 2)));
    socketBob.on(evt,   data => console.log(`[Bob]   ${evt}:`, JSON.stringify(data, null, 2)));
  });

  console.log('\n=== Test 1: joinConversation (history should be empty) ===');
  socketAlice.emit('joinConversation', { conversationId: convId, limit: 50 });
  socketBob.emit('joinConversation',   { conversationId: convId, limit: 50 });
  await sleep(500);

  console.log('\n=== Test 2: sendMessage (both should receive it) ===');
  const msgPromise = waitForEvent(socketBob, 'message');
  socketAlice.emit('sendMessage', { conversationId: convId, content: 'Hello Bob!' });
  const received = await msgPromise;
  console.log('Bob received message:', JSON.stringify(received, null, 2));

  console.log('\n=== Test 3: joinConversation again — history should contain 1 message ===');
  const historyPromise = waitForEvent(socketAlice, 'history');
  socketAlice.emit('joinConversation', { conversationId: convId, limit: 50 });
  const history = await historyPromise;
  console.log('History:', JSON.stringify(history, null, 2));

  console.log('\n=== Test 4: Bob leaves — Alice sends, Bob should NOT receive ===');
  socketBob.emit('leaveConversation', { conversationId: convId });
  await sleep(200);
  socketAlice.emit('sendMessage', { conversationId: convId, content: 'Bob left, he wont see this' });
  await sleep(500);
  console.log('(If no [Bob] message above, leaveConversation works correctly)');

  console.log('\n=== Test 5: message too long (should get exception) ===');
  const exceptionPromise = waitForEvent(socketAlice, 'exception');
  socketAlice.emit('sendMessage', { conversationId: convId, content: 'x'.repeat(151) });
  const exception = await exceptionPromise;
  console.log('Exception received:', JSON.stringify(exception, null, 2));

  console.log('\n=== Test 6: join conversation not participant ===');
  const forbiddenPromise = waitForEvent(socketAlice, 'exception');
  socketAlice.emit('joinConversation', { conversationId: 99999, limit: 10 });
  const forbidden = await forbiddenPromise;
  console.log('Exception received:', JSON.stringify(forbidden, null, 2));

  console.log('\n=== Test 7: connect without token — guarded event should fail ===');
  const socketNoAuth = io(BASE_URL, { transports: ['websocket'] });
  await new Promise(r => socketNoAuth.on('connect', r));
  const noAuthException = waitForEvent(socketNoAuth, 'exception');
  socketNoAuth.emit('sendMessage', { conversationId: convId, content: 'hacker' });
  const noAuthErr = await noAuthException;
  console.log('Exception received:', JSON.stringify(noAuthErr, null, 2));
  socketNoAuth.disconnect();

  console.log('\n=== Done ===');
  socketAlice.disconnect();
  socketBob.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
