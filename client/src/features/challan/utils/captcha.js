export function createCaptcha(length = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let captcha = "";

  for (let i = 0; i < length; i += 1) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return captcha;
}
