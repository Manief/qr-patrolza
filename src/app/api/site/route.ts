import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const sites = await prisma.site.findMany();
  return NextResponse.json(sites);
}

export async function POST(req: NextRequest) {
  const { name, companyId } = await req.json();
  const site = await prisma.site.create({ data: { name, companyId: Number(companyId) } });
  return NextResponse.json(site);
}

export async function PUT(req: NextRequest) {
  const { id, name } = await req.json();
  const site = await prisma.site.update({ where: { id: Number(id) }, data: { name } });
  return NextResponse.json(site);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.site.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
