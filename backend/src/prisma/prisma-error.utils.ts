import { Prisma } from '@prisma/client';

export function resolveUniqueConstraintFields(
  error: Prisma.PrismaClientKnownRequestError,
): string[] {
  const target = error.meta?.target;
  const modelName = error.meta?.modelName;

  if (
    typeof target !== 'string' ||
    typeof modelName !== 'string'
  ) {
    return [];
  }

  const model = Prisma.dmmf.datamodel.models.find(
    (m) => m.name === modelName,
  );

  if (!model) {
    return [];
  }

  const targetParts = target.split('_');

  return model.fields
    .filter((field) =>
      targetParts.includes(field.name),
    )
    .map((field) => field.name);
}