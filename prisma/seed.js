import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding CP Application Status Master...");

  const statuses = [
    { code: "SUBMITTED" },
    { code: "APPROVED" },
    { code: "REJECTED" },
  ];

  for (const st of statuses) {
    await prisma.tblmst_cp_appl_status.upsert({
      where: {
        cp_appl_st_code: st.code,
      },
      update: {},
      create: {
        cp_appl_st_id: randomUUID(),
        cp_appl_st_code: st.code,
        cp_appl_st_created_at: new Date(),
      },
    });
  }

  console.log("✅ tblmst_cp_appl_status seeded successfully");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
