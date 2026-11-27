import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getSessionUser } from "@/backend/modules/auth/session";
import { VIDEO_MAX_BYTES, videoBlobPath, videoContentTypes } from "@/shared/lesson-video";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as HandleUploadBody | null;
  if (!body || !["blob.generate-client-token", "blob.upload-completed"].includes(body.type)) {
    return Response.json({ error: "Yêu cầu tải video chưa hợp lệ." }, { status: 400 });
  }
  if (body.type === "blob.generate-client-token" && (await getSessionUser())?.role !== "admin") {
    return Response.json({ error: "Chỉ quản trị viên được tải video." }, { status: 403 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) {
    return Response.json({ error: "Chưa kết nối kho Vercel Blob. Bạn có thể dùng liên kết video trực tiếp." }, { status: 503 });
  }
  try {
    return Response.json(await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname) => {
        if (!videoBlobPath.test(pathname)) throw new Error("INVALID_VIDEO_PATH");
        return {
          allowedContentTypes: videoContentTypes,
          addRandomSuffix: false,
          maximumSizeInBytes: VIDEO_MAX_BYTES,
          validUntil: Date.now() + 30 * 60 * 1000,
        };
      },
      onUploadCompleted: async () => {},
    }));
  } catch {
    return Response.json({ error: "Không thể cấp quyền tải video. Kiểm tra cấu hình kho lưu trữ rồi thử lại." }, { status: 400 });
  }
}
