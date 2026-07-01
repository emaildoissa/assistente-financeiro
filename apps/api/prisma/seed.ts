import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultCategories = [
  { name: 'Salário', type: 'income', icon: 'briefcase', color: '#22c55e' },
  { name: 'Freelance', type: 'income', icon: 'laptop', color: '#16a34a' },
  { name: 'Investimentos', type: 'income', icon: 'trending-up', color: '#15803d' },
  { name: 'Vendas', type: 'income', icon: 'shopping-cart', color: '#166534' },
  { name: 'Outras Receitas', type: 'income', icon: 'plus-circle', color: '#14532d' },

  { name: 'Alimentação', type: 'expense', icon: 'coffee', color: '#ef4444' },
  { name: 'Transporte', type: 'expense', icon: 'car', color: '#dc2626' },
  { name: 'Moradia', type: 'expense', icon: 'home', color: '#b91c1c' },
  { name: 'Água', type: 'expense', icon: 'droplets', color: '#3b82f6' },
  { name: 'Luz', type: 'expense', icon: 'zap', color: '#eab308' },
  { name: 'Internet', type: 'expense', icon: 'wifi', color: '#6366f1' },
  { name: 'Telefone', type: 'expense', icon: 'phone', color: '#8b5cf6' },
  { name: 'Saúde', type: 'expense', icon: 'heart', color: '#ec4899' },
  { name: 'Educação', type: 'expense', icon: 'book', color: '#f59e0b' },
  { name: 'Lazer', type: 'expense', icon: 'film', color: '#10b981' },
  { name: 'Assinaturas', type: 'expense', icon: 'repeat', color: '#06b6d4' },
  { name: 'Impostos', type: 'expense', icon: 'file-text', color: '#78716c' },
  { name: 'Seguros', type: 'expense', icon: 'shield', color: '#64748b' },
  { name: 'Cartão de Crédito', type: 'expense', icon: 'credit-card', color: '#1e293b' },
  { name: 'Outras Despesas', type: 'expense', icon: 'minus-circle', color: '#292524' },
];

async function seedCategoriesForTenant(tenantId: string) {
  const existing = await prisma.financialCategory.count({ where: { tenantId, isSystem: true } });
  if (existing > 0) {
    console.log(`Tenant ${tenantId} already has ${existing} system categories. Skipping.`);
    return;
  }

  for (const cat of defaultCategories) {
    await prisma.financialCategory.create({
      data: {
        tenantId,
        name: cat.name,
        type: cat.type,
        icon: cat.icon,
        color: cat.color,
        isSystem: true,
      },
    });
  }

  console.log(`Seeded ${defaultCategories.length} categories for tenant ${tenantId}`);
}

async function main() {
  const tenants = await prisma.tenant.findMany({ select: { id: true } });

  for (const tenant of tenants) {
    await seedCategoriesForTenant(tenant.id);
  }

  console.log('Seed complete.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
