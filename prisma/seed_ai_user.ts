// Este script crea un usuario especial para la IA si no existe
import prisma from '../src/lib/prisma';

async function main() {
  const aiEmail = 'ai@scuti.com';
  const aiUser = await prisma.user.findUnique({ where: { email: aiEmail } });
  if (!aiUser) {
    await prisma.user.create({
      data: {
        email: aiEmail,
        password: 'scuti-ai', // No se usará para login
        fullName: 'Scuti AI',
        avatarUrl: 'https://robohash.org/scuti-ai.png',
      },
    });
    console.log('AI user created');
  } else {
    console.log('AI user already exists');
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
