'use strict';

const net = require('node:net');

// RNAwiki's public domain is proxied through Cloudflare before Railway. Railway documents
// X-Real-IP as the address that reached its edge; Cloudflare documents CF-Connecting-IP as the
// original visitor address. CF-Connecting-IP is trusted only when Railway's own header proves that
// the upstream address belongs to Cloudflare. A direct caller can forge CF-Connecting-IP, but not
// Railway's X-Real-IP, so the forged value is ignored.
// Source of record: https://www.cloudflare.com/ips/ (checked 2026-08-12).
const CLOUDFLARE_CIDRS = [
  '103.21.244.0/22', '103.22.200.0/22', '103.31.4.0/22', '104.16.0.0/13',
  '104.24.0.0/14', '108.162.192.0/18', '131.0.72.0/22', '141.101.64.0/18',
  '162.158.0.0/15', '172.64.0.0/13', '173.245.48.0/20', '188.114.96.0/20',
  '190.93.240.0/20', '197.234.240.0/22', '198.41.128.0/17',
  '2400:cb00::/32', '2606:4700::/32', '2803:f800::/32', '2405:b500::/32',
  '2405:8100::/32', '2a06:98c0::/29', '2c0f:f248::/32',
];

const cloudflare = new net.BlockList();
for (const cidr of CLOUDFLARE_CIDRS) {
  const [address, prefixText] = cidr.split('/');
  const family = net.isIP(address);
  cloudflare.addSubnet(address, Number(prefixText), family === 6 ? 'ipv6' : 'ipv4');
}

function validHeaderIp(value) {
  const first = String(value || '').split(',')[0].trim().replace(/^::ffff:/, '');
  return net.isIP(first) ? first : null;
}

function isCloudflareIp(address) {
  const family = net.isIP(address);
  return !!family && cloudflare.check(address, family === 6 ? 'ipv6' : 'ipv4');
}

function clientIp(req, trustProxy = process.env.TRUST_PROXY === '1') {
  const rawPeer = String((req.socket && req.socket.remoteAddress) || '').replace(/^::ffff:/, '');
  const peer = net.isIP(rawPeer) ? rawPeer : 'unknown';
  if (!trustProxy) return peer;

  // Railway overwrites X-Real-IP at its edge. It is therefore the only forwarded value used
  // without another trust check. Behind Cloudflare it normally names a Cloudflare edge address;
  // only in that case may CF-Connecting-IP supply the visitor address.
  const railwayIp = validHeaderIp(req.headers['x-real-ip']);
  if (railwayIp && isCloudflareIp(railwayIp)) {
    const visitorIp = validHeaderIp(req.headers['cf-connecting-ip']);
    if (visitorIp) return visitorIp;
  }
  return railwayIp || peer;
}

module.exports = { clientIp, isCloudflareIp, validHeaderIp, CLOUDFLARE_CIDRS };
