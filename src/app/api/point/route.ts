import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const points = await prisma.point.findMany();
  return NextResponse.json(points);
}

export async function POST(req: NextRequest) {
  const { description, areaId, qrCode } = await req.json();
  const point = await prisma.point.create({ data: { description, areaId: Number(areaId), qrCode } });
  return NextResponse.json(point);
}

export async function PUT(req: NextRequest) {
  const { id, description, qrCode } = await req.json();
  const point = await prisma.point.update({ where: { id: Number(id) }, data: { description, qrCode } });
  return NextResponse.json(point);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.point.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
