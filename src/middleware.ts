import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'zealthy-secret-key-change-in-prod'
)

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/portal')) {
    const token = req.cookies.get('session')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    try {
      await jwtVerify(token, SECRET)
    } catch {
      const res = NextResponse.redirect(new URL('/', req.url))
      res.cookies.delete('session')
      return res
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/portal/:path*'],
}