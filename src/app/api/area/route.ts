import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const areas = await prisma.area.findMany();
  return NextResponse.json(areas);
}

export async function POST(req: NextRequest) {
  const { name, siteId } = await req.json();
  const area = await prisma.area.create({ data: { name, siteId: Number(siteId) } });
  return NextResponse.json(area);
}

export async function PUT(req: NextRequest) {
  const { id, name } = await req.json();
  const area = await prisma.area.update({ where: { id: Number(id) }, data: { name } });
  return NextResponse.json(area);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.area.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
