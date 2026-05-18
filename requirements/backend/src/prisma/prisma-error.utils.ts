import { Prisma } from '@prisma/client';

/**
 * Resolves Prisma unique constraint errors (P2002)
 * into the corresponding Prisma model field names.
 *
 * This function attempts to match parts of the SQL constraint
 * name (target) with Prisma field names from the DMMF schema.
 *
 * It supports both single-field and composite unique constraints.
 *
 * Note: This relies on Prisma naming conventions and may not
 * be fully reliable across all database providers or custom mappings.
 */
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

  // Relies on the assumption that 'target' contains the column name, which is not guaranteed in all cases.
  //	eg: using map in prisma schema to define a custom SQL name for a column
  //		  username String @unique(map: "login_unique")
  return model.fields
    .filter((field) =>
      targetParts.includes(field.name),
    )
    .map((field) => field.name);
}