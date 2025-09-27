import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const companies = await prisma.company.findMany();
  return NextResponse.json(companies);
}

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  const company = await prisma.company.create({ data: { name } });
  return NextResponse.json(company);
}

export async function PUT(req: NextRequest) {
  const { id, name } = await req.json();
  const company = await prisma.company.update({ where: { id: Number(id) }, data: { name } });
  return NextResponse.json(company);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.company.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
