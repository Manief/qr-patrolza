import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'

export async function GET() {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  const points = await prisma.point.findMany();
  await prisma.$disconnect();
  return NextResponse.json(points);
}

export async function POST(req: NextRequest) {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  const { description, areaId, qrCode } = await req.json();
  const point = await prisma.point.create({ data: { description, areaId: Number(areaId), qrCode } });
  await prisma.$disconnect();
  return NextResponse.json(point);
}

export async function PUT(req: NextRequest) {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  const { id, description, qrCode } = await req.json();
  const point = await prisma.point.update({ where: { id: Number(id) }, data: { description, qrCode } });
  await prisma.$disconnect();
  return NextResponse.json(point);
}

export async function DELETE(req: NextRequest) {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  const { id } = await req.json();
  await prisma.point.delete({ where: { id: Number(id) } });
  await prisma.$disconnect();
  return NextResponse.json({ success: true });
}
