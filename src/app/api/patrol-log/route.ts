import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const logs = await prisma.patrolLog.findMany();
  return NextResponse.json(logs);
}

export async function POST(req: NextRequest) {
  const { time, pointId, userId, geoLocation, shift, signature } = await req.json();
  const log = await prisma.patrolLog.create({ data: { time, pointId: Number(pointId), userId: Number(userId), geoLocation, shift, signature } });
  return NextResponse.json(log);
}

export async function PUT(req: NextRequest) {
  const { id, ...data } = await req.json();
  const log = await prisma.patrolLog.update({ where: { id: Number(id) }, data });
  return NextResponse.json(log);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.patrolLog.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
