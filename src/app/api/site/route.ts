import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'

export async function GET() {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  const sites = await prisma.site.findMany();
  await prisma.$disconnect();
  return NextResponse.json(sites);
}

export async function POST(req: NextRequest) {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  const { name, companyId } = await req.json();
  const site = await prisma.site.create({ data: { name, companyId: Number(companyId) } });
  await prisma.$disconnect();
  return NextResponse.json(site);
}

export async function PUT(req: NextRequest) {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  const { id, name } = await req.json();
  const site = await prisma.site.update({ where: { id: Number(id) }, data: { name } });
  await prisma.$disconnect();
  return NextResponse.json(site);
}

export async function DELETE(req: NextRequest) {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  const { id } = await req.json();
  await prisma.site.delete({ where: { id: Number(id) } });
  await prisma.$disconnect();
  return NextResponse.json({ success: true });
}
