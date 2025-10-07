// Database seed script
// Creates initial data for development and testing

import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/api/auth';
import { generateInvitationToken, getInvitationExpiry } from '../lib/invitation-utils';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a demo company
  const demoCompanyPassword = await hashPassword('MagnaDemo2025!');
  const demoCompany = await prisma.company.create({
    data: {
      email: 'demo@company.com',
      name: 'Demo Company',
      password: demoCompanyPassword,
    },
  });
  console.log('✅ Created demo company:', demoCompany.email);

  // Create demo investors with passwords (for those who have accepted invitations)
  const demoPassword = await hashPassword('investor123');
  
  const investors = await Promise.all([
    prisma.investor.create({
      data: {
        email: 'john.smith@example.com',
        name: 'John Smith',
        password: demoPassword,
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        status: 'ACTIVE',
      },
    }),
    prisma.investor.create({
      data: {
        email: 'sarah.johnson@example.com',
        name: 'Sarah Johnson',
        password: demoPassword,
        walletAddress: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
        status: 'ACTIVE',
      },
    }),
    prisma.investor.create({
      data: {
        email: 'mike.chen@example.com',
        name: 'Mike Chen',
        password: demoPassword,
        status: 'ACTIVE',
      },
    }),
    prisma.investor.create({
      data: {
        email: 'emma.davis@example.com',
        name: 'Emma Davis',
        password: null, // No password yet - waiting for invitation acceptance
        status: 'INVITED',
      },
    }),
  ]);
  console.log(`✅ Created ${investors.length} demo investors`);

  // Create demo rounds
  const seedRound = await prisma.round.create({
    data: {
      name: 'Seed Round',
      companyId: demoCompany.id,
      description:
        'Early-stage funding to develop our DeFi platform and expand the team. This round is crucial for establishing our market presence and building out core features.',
      target: 5000000,
      raised: 425000,
      minContribution: 10000,
      maxContribution: 100000,
      status: 'CLOSED',
      acceptedTokens: ['USDC', 'USDT'],
      startDate: new Date('2025-09-01'),
      endDate: new Date('2025-10-31'),
    },
  });
  console.log('✅ Created Seed Round');

  const seriesARound = await prisma.round.create({
    data: {
      name: 'Series A',
      companyId: demoCompany.id,
      description:
        'Growth round to scale operations and expand into new markets. We are looking for strategic investors who can help us achieve our expansion goals.',
      target: 10000000,
      raised: 750000,
      minContribution: 50000,
      maxContribution: 500000,
      status: 'ACTIVE',
      acceptedTokens: ['USDC', 'USDT'],
      startDate: new Date('2025-10-01'),
      endDate: new Date('2025-12-31'),
    },
  });
  console.log('✅ Created Series A Round');

  const preSeedRound = await prisma.round.create({
    data: {
      name: 'Pre-Seed',
      companyId: demoCompany.id,
      description: 'Initial funding to validate product-market fit and build MVP.',
      target: 1000000,
      raised: 1000000,
      minContribution: 5000,
      maxContribution: 50000,
      status: 'COMPLETED',
      acceptedTokens: ['USDC'],
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-08-31'),
    },
  });
  console.log('✅ Created Pre-Seed Round');

  // Create demo contributions for Seed Round
  const contributions = await Promise.all([
    prisma.contribution.create({
      data: {
        roundId: seedRound.id,
        investorId: investors[0].id,
        amount: 75000,
        token: 'USDC',
        status: 'CONFIRMED',
        confirmedAt: new Date('2025-09-15'),
        transactionHash: '0x1234567890abcdef1234567890abcdef12345678',
        walletAddress: investors[0].walletAddress,
      },
    }),
    prisma.contribution.create({
      data: {
        roundId: seedRound.id,
        investorId: investors[1].id,
        amount: 100000,
        token: 'USDT',
        status: 'CONFIRMED',
        confirmedAt: new Date('2025-09-18'),
        transactionHash: '0x2345678901bcdefg2345678901bcdefg23456789',
        walletAddress: investors[1].walletAddress,
      },
    }),
    prisma.contribution.create({
      data: {
        roundId: seedRound.id,
        investorId: investors[2].id,
        amount: 50000,
        token: 'USDC',
        status: 'CONFIRMED',
        confirmedAt: new Date('2025-09-20'),
        transactionHash: '0x3456789012cdefgh3456789012cdefgh34567890',
      },
    }),
    prisma.contribution.create({
      data: {
        roundId: seedRound.id,
        investorId: investors[0].id,
        amount: 100000,
        token: 'USDT',
        status: 'CONFIRMED',
        confirmedAt: new Date('2025-09-25'),
        transactionHash: '0x4567890123defghi4567890123defghi45678901',
        walletAddress: investors[0].walletAddress,
      },
    }),
    prisma.contribution.create({
      data: {
        roundId: seedRound.id,
        investorId: investors[1].id,
        amount: 100000,
        token: 'USDC',
        status: 'CONFIRMED',
        confirmedAt: new Date('2025-09-28'),
        transactionHash: '0x567890124efghij567890124efghij567890124e',
        walletAddress: investors[1].walletAddress,
      },
    }),
  ]);
  console.log(`✅ Created ${contributions.length} contributions for Seed Round`);

  // Create contributions for Series A
  await Promise.all([
    prisma.contribution.create({
      data: {
        roundId: seriesARound.id,
        investorId: investors[0].id,
        amount: 250000,
        token: 'USDC',
        status: 'CONFIRMED',
        confirmedAt: new Date('2025-10-05'),
        transactionHash: '0x678901235fghijk678901235fghijk678901235f',
        walletAddress: investors[0].walletAddress,
      },
    }),
    prisma.contribution.create({
      data: {
        roundId: seriesARound.id,
        investorId: investors[1].id,
        amount: 500000,
        token: 'USDT',
        status: 'CONFIRMED',
        confirmedAt: new Date('2025-10-08'),
        transactionHash: '0x789012346ghijkl789012346ghijkl789012346g',
        walletAddress: investors[1].walletAddress,
      },
    }),
  ]);
  console.log('✅ Created contributions for Series A Round');

  // Create contributions for Pre-Seed
  await Promise.all([
    prisma.contribution.create({
      data: {
        roundId: preSeedRound.id,
        investorId: investors[0].id,
        amount: 25000,
        token: 'USDC',
        status: 'CONFIRMED',
        confirmedAt: new Date('2025-07-15'),
        transactionHash: '0x890123457hijklm890123457hijklm890123457h',
        walletAddress: investors[0].walletAddress,
      },
    }),
    prisma.contribution.create({
      data: {
        roundId: preSeedRound.id,
        investorId: investors[1].id,
        amount: 50000,
        token: 'USDC',
        status: 'CONFIRMED',
        confirmedAt: new Date('2025-07-20'),
        transactionHash: '0x901234568ijklmn901234568ijklmn901234568i',
        walletAddress: investors[1].walletAddress,
      },
    }),
    prisma.contribution.create({
      data: {
        roundId: preSeedRound.id,
        investorId: investors[2].id,
        amount: 925000,
        token: 'USDC',
        status: 'CONFIRMED',
        confirmedAt: new Date('2025-08-10'),
        transactionHash: '0x012345679jklmno012345679jklmno012345679j',
      },
    }),
  ]);
  console.log('✅ Created contributions for Pre-Seed Round');

  // Create invitations with tokens
  await Promise.all([
    prisma.invitation.create({
      data: {
        roundId: seedRound.id,
        investorId: investors[0].id,
        token: generateInvitationToken(),
        expiresAt: getInvitationExpiry(),
        status: 'ACCEPTED',
        respondedAt: new Date('2025-09-14'),
      },
    }),
    prisma.invitation.create({
      data: {
        roundId: seedRound.id,
        investorId: investors[1].id,
        token: generateInvitationToken(),
        expiresAt: getInvitationExpiry(),
        status: 'ACCEPTED',
        respondedAt: new Date('2025-09-17'),
      },
    }),
    prisma.invitation.create({
      data: {
        roundId: seedRound.id,
        investorId: investors[2].id,
        token: generateInvitationToken(),
        expiresAt: getInvitationExpiry(),
        status: 'ACCEPTED',
        respondedAt: new Date('2025-09-19'),
      },
    }),
    prisma.invitation.create({
      data: {
        roundId: seriesARound.id,
        investorId: investors[3].id,
        token: generateInvitationToken(),
        expiresAt: getInvitationExpiry(),
        status: 'SENT',
      },
    }),
  ]);
  console.log('✅ Created demo invitations');

  console.log('\n✨ Database seeded successfully!');
  console.log('\n📝 Demo Credentials:');
  console.log('   Company Email: demo@company.com');
  console.log('   Password: MagnaDemo2025!');
  console.log('\n   Investor Logins (email / password):');
  console.log('   - john.smith@example.com / investor123');
  console.log('   - sarah.johnson@example.com / investor123');
  console.log('   - mike.chen@example.com / investor123');
  console.log('   - emma.davis@example.com (no password - needs invitation)');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
