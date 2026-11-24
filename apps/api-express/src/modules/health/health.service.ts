export function getHealth() {
  return {
    status: 'ok',
    uptime: Math.round(process.uptime()),
  };
}
