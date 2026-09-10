// 레이아웃과 빌드 산출물 검사가 공유하는 배포용 CSP.
export const STRICT_CSP =
  "default-src 'self'; script-src 'none'; style-src 'self'; " +
  "img-src 'self' data:; font-src 'self' data:; " +
  "base-uri 'none'; form-action 'none'; object-src 'none'";

export const NOTE_CSP =
  "default-src 'self'; script-src 'self'; style-src 'self'; " +
  "img-src 'self' https: data:; " +
  "frame-src https://www.youtube-nocookie.com https://player.vimeo.com; " +
  "media-src 'self' https:; font-src 'self' data:; " +
  "base-uri 'none'; form-action 'none'; object-src 'none'";
