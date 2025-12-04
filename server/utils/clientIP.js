/**
 * 获取客户端 IP 地址
 * 支持代理服务器（X-Forwarded-For, X-Real-IP）
 */
export function getClientIP(event) {
  if (!event || !event.node || !event.node.req) {
    return 'unknown';
  }
  
  const req = event.node.req;
  
  // 检查 X-Forwarded-For 头（代理服务器）
  // 格式: "client, proxy1, proxy2"
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    // X-Forwarded-For 可能包含多个 IP，取第一个（原始客户端 IP）
    const ips = forwardedFor.split(',').map(ip => ip.trim());
    const firstIP = ips[0];
    if (firstIP && firstIP !== 'unknown') {
      return firstIP;
    }
  }
  
  // 检查 X-Real-IP 头（Nginx 等反向代理）
  const realIP = req.headers['x-real-ip'];
  if (realIP) {
    const ip = realIP.trim();
    if (ip && ip !== 'unknown') {
      return ip;
    }
  }
  
  // 检查 CF-Connecting-IP 头（Cloudflare）
  const cfIP = req.headers['cf-connecting-ip'];
  if (cfIP) {
    const ip = cfIP.trim();
    if (ip && ip !== 'unknown') {
      return ip;
    }
  }
  
  // 检查 True-Client-IP 头（某些 CDN）
  const trueClientIP = req.headers['true-client-ip'];
  if (trueClientIP) {
    const ip = trueClientIP.trim();
    if (ip && ip !== 'unknown') {
      return ip;
    }
  }
  
  // 最后尝试从 socket 获取
  if (req.socket && req.socket.remoteAddress) {
    const ip = req.socket.remoteAddress;
    // 处理 IPv6 映射的 IPv4 地址
    if (ip.startsWith('::ffff:')) {
      return ip.substring(7);
    }
    return ip;
  }
  
  // 如果都获取不到，返回 unknown
  return 'unknown';
}

