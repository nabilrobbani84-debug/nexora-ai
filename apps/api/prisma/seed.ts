import 'dotenv/config';
import argon2 from 'argon2';
import { PrismaPg } from '@prisma/adapter-pg';
import { PERMISSIONS, SYSTEM_ROLES, type Permission, type SystemRole } from '@nexora/shared';
import { PrismaClient } from '../src/generated/prisma/client.js';

if (process.env.NODE_ENV === 'production') {
  throw new Error('Demo seed is disabled in production.');
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required to seed the database.');

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const rolePermissions: Record<SystemRole, Permission[]> = {
  SUPER_ADMIN: [...PERMISSIONS],
  ENTERPRISE_ADMIN: PERMISSIONS.filter((permission) => permission !== 'platform:organizations:manage'),
  SALES_MANAGER: [
    'dashboard:executive:read',
    'customers:read',
    'customers:pii:read',
    'conversations:read',
    'intelligence:read',
    'churn:read',
    'leads:read',
    'leads:write',
    'leads:score',
    'recommendations:read',
    'recommendations:manage',
    'analytics:read',
    'reports:read',
    'reports:export',
  ],
  CUSTOMER_SERVICE_MANAGER: [
    'dashboard:executive:read',
    'customers:read',
    'customers:write',
    'customers:pii:read',
    'conversations:read',
    'conversations:write',
    'intelligence:read',
    'intelligence:run',
    'churn:read',
    'churn:score',
    'workflows:read',
    'workflows:manage',
    'analytics:read',
    'reports:read',
    'reports:export',
  ],
  SALES_AGENT: [
    'customers:read',
    'customers:pii:read',
    'conversations:read',
    'conversations:write',
    'intelligence:read',
    'intelligence:run',
    'leads:read',
    'leads:write',
    'leads:score',
    'recommendations:read',
  ],
  CUSTOMER_SERVICE_AGENT: [
    'customers:read',
    'customers:pii:read',
    'conversations:read',
    'conversations:write',
    'intelligence:read',
    'intelligence:run',
    'churn:read',
    'workflows:read',
  ],
  BUSINESS_ANALYST: [
    'dashboard:executive:read',
    'customers:read',
    'conversations:read',
    'intelligence:read',
    'churn:read',
    'leads:read',
    'recommendations:read',
    'analytics:read',
    'reports:read',
    'reports:export',
  ],
};

const roleNames: Record<SystemRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  ENTERPRISE_ADMIN: 'Enterprise Administrator',
  SALES_MANAGER: 'Sales Manager',
  CUSTOMER_SERVICE_MANAGER: 'Customer Service Manager',
  SALES_AGENT: 'Sales Agent',
  CUSTOMER_SERVICE_AGENT: 'Customer Service Agent',
  BUSINESS_ANALYST: 'Business Analyst',
};

const demoUsers: Array<{ email: string; firstName: string; lastName: string; role: SystemRole }> = [
  { email: 'superadmin@nexora.demo', firstName: 'Nadia', lastName: 'Pratama', role: 'SUPER_ADMIN' },
  { email: 'admin@nexora.demo', firstName: 'Arif', lastName: 'Santoso', role: 'ENTERPRISE_ADMIN' },
  { email: 'sales.manager@nexora.demo', firstName: 'Maya', lastName: 'Wijaya', role: 'SALES_MANAGER' },
  {
    email: 'service.manager@nexora.demo',
    firstName: 'Dimas',
    lastName: 'Nugraha',
    role: 'CUSTOMER_SERVICE_MANAGER',
  },
  { email: 'sales.agent@nexora.demo', firstName: 'Rani', lastName: 'Kusuma', role: 'SALES_AGENT' },
  {
    email: 'service.agent@nexora.demo',
    firstName: 'Bayu',
    lastName: 'Mahendra',
    role: 'CUSTOMER_SERVICE_AGENT',
  },
  { email: 'analyst@nexora.demo', firstName: 'Sinta', lastName: 'Lestari', role: 'BUSINESS_ANALYST' },
];

async function main(): Promise<void> {
  const organization = await prisma.organization.upsert({
    where: { slug: 'nexora-demo' },
    update: { name: 'NEXORA Demo Enterprise', status: 'ACTIVE' },
    create: { name: 'NEXORA Demo Enterprise', slug: 'nexora-demo', status: 'ACTIVE' },
  });

  const permissions = new Map<string, { id: string }>();
  for (const code of PERMISSIONS) {
    const permission = await prisma.permission.upsert({
      where: { code },
      update: { name: code },
      create: { code, name: code },
      select: { id: true },
    });
    permissions.set(code, permission);
  }

  const roles = new Map<SystemRole, { id: string }>();
  for (const code of SYSTEM_ROLES) {
    const existing = await prisma.role.findFirst({ where: { organizationId: null, code } });
    const role = existing
      ? await prisma.role.update({
          where: { id: existing.id },
          data: { name: roleNames[code], isSystem: true },
          select: { id: true },
        })
      : await prisma.role.create({
          data: { code, name: roleNames[code], isSystem: true },
          select: { id: true },
        });
    roles.set(code, role);

    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    await prisma.rolePermission.createMany({
      data: rolePermissions[code].map((permissionCode) => ({
        roleId: role.id,
        permissionId: permissions.get(permissionCode)!.id,
      })),
      skipDuplicates: true,
    });
  }

  const password = process.env.DEMO_ADMIN_PASSWORD ?? 'Nexora-Demo-2026!';
  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19_456,
    timeCost: 2,
    parallelism: 1,
  });

  for (const demoUser of demoUsers) {
    const user = await prisma.user.upsert({
      where: { email: demoUser.email },
      update: {
        organizationId: organization.id,
        passwordHash,
        firstName: demoUser.firstName,
        lastName: demoUser.lastName,
        status: 'ACTIVE',
        deletedAt: null,
      },
      create: {
        organizationId: organization.id,
        email: demoUser.email,
        passwordHash,
        firstName: demoUser.firstName,
        lastName: demoUser.lastName,
        status: 'ACTIVE',
      },
    });
    await prisma.userRole.deleteMany({ where: { userId: user.id } });
    await prisma.userRole.create({
      data: {
        organizationId: organization.id,
        userId: user.id,
        roleId: roles.get(demoUser.role)!.id,
      },
    });
  }

  await prisma.customerSegment.upsert({
    where: { organizationId_name: { organizationId: organization.id, name: 'Enterprise Priority' } },
    update: {},
    create: {
      organizationId: organization.id,
      name: 'Enterprise Priority',
      description: 'Foundation seed segment; full deterministic dataset arrives in Phase 2.',
      color: '#3B82F6',
    },
  });

  console.info(`Seeded ${demoUsers.length} demo users for ${organization.name}.`);
  console.info(`Demo password: ${password}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
