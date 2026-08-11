import { NextResponse } from "next/server";

// Oturumlar sekme bazlı sessionStorage + Authorization header ile yönetildiği için
// sunucu tarafı proxy çerez kontrolü yapmaz; koruma istemci bileşenlerinde kalır.
export async function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/analizlerim/:path*",
    "/ayarlar/:path*",
    "/destek/:path*",
    "/sss/:path*",
    "/profile/:path*",
    "/admin/users/:path*",
  ],
};
