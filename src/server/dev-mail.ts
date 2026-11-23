import { prisma } from "@/lib/prisma";

export const getLatestPasswordResetMail = () =>
  prisma.devMail.findFirst({
    where: { kind: "PASSWORD_RESET" },
    orderBy: { createdAt: "desc" },
    select: { to: true, content: true, createdAt: true },
  });
