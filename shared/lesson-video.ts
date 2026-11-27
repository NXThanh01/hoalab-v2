export const VIDEO_MAX_BYTES = 100 * 1024 * 1024;
export const videoContentTypes = ["video/mp4", "video/webm"];
export const videoBlobPath = /^lessons\/hoa-12-bai-[1-9]\d*\/[a-f\d-]{36}\.(mp4|webm)$/;

export function getVideoBlobPath(source: string) {
  const path = source.startsWith("blob:") ? source.slice(5) : "";
  return videoBlobPath.test(path) ? path : null;
}

export function videoSourceForLesson(source: string, lessonId: string) {
  return getVideoBlobPath(source) ? `/api/lessons/video?id=${encodeURIComponent(lessonId)}` : source;
}
