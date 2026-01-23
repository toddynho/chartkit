import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'public', 'llms.txt');
    const content = readFileSync(filePath, 'utf-8');
    
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400', // Cache for 1 day
      },
    });
  } catch {
    return NextResponse.redirect(new URL('/llms.txt', 'https://chartkit.dev'));
  }
}
