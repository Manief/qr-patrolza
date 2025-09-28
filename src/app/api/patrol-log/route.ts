import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'

export async function GET() {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  const logs = await prisma.patrolLog.findMany();
  await prisma.$disconnect();
  return NextResponse.json(logs);
}

export async function POST(req: NextRequest) {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  const { time, pointId, userId, geoLocation, shift, signature } = await req.json();
  const log = await prisma.patrolLog.create({ data: { time, pointId: Number(pointId), userId: Number(userId), geoLocation, shift, signature } });
  await prisma.$disconnect();
  return NextResponse.json(log);
}

export async function PUT(req: NextRequest) {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  const { id, ...data } = await req.json();
  const log = await prisma.patrolLog.update({ where: { id: Number(id) }, data });
  await prisma.$disconnect();
  return NextResponse.json(log);
}

export async function DELETE(req: NextRequest) {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  const { id } = await req.json();
  await prisma.patrolLog.delete({ where: { id: Number(id) } });
  await prisma.$disconnect();
  return NextResponse.json({ success: true });
}
