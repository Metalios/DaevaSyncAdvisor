import { DiscordSDK } from '@discord/embedded-app-sdk';
// No OAuth, bot token, backend or user identity is required by the calculator.
const status = document.getElementById('discord-status');
const params = new URLSearchParams(window.location.search);
const embedded = window.parent !== window && (params.has('frame_id') || /\.discordsays\.com$/.test(location.hostname));
const report = sdk => window.dispatchEvent(new CustomEvent('advisor-startup', { detail: { sdk } }));
let sdk;
let ready = false;
function setStatus(message, state = '') {
  status.textContent = message;
  status.dataset.state = state;
}
if (!embedded) report('browser');
if (embedded) {
  report('loading SDK');
  setStatus('Connecting to Discord…');
  // Discord sandbox restricts normal outbound navigation. Intercept only source links.
  document.addEventListener('click', async (event) => {
    const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!anchor || !/^https:\/\//i.test(anchor.href)) return;
    event.preventDefault();
    if (!ready) {
      setStatus('Discord connection unavailable · copy the source link manually');
      showLink(anchor.href);
      return;
    }
    try { await sdk.commands.openExternalLink({ url: anchor.href }); }
    catch { showLink(anchor.href); }
  });
  connect().catch((error) => {
    console.warn('Discord SDK connection failed:', error);
    report('connection failed: ' + String(error?.name || 'Error'));
    setStatus('Discord connection unavailable · calculator still works');
  });
}
function showLink(url) {
  const dialog = document.getElementById('copy-dialog');
  const textarea = document.getElementById('copy-text');
  textarea.value = url;
  if (!dialog.open) dialog.showModal();
  textarea.select();
}
async function connect() {
  const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID?.trim() || '1575241594129359020';
  if (!clientId || !/^\d{17,22}$/.test(clientId)) {
    report('invalid application ID');
    setStatus('Discord app ID not configured · calculator still works');
    return;
  }
  report('starting handshake');
  sdk = new DiscordSDK(clientId);
  let timer;
  try {
    await Promise.race([sdk.ready(), new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('Discord handshake timed out')), 12000);
    })]);
    ready = true;
    report('ready');
    setStatus('Discord Activity · No account data requested', 'connected');
  } catch (error) {
    report('handshake failed');
    throw error;
  } finally { clearTimeout(timer); }
}
