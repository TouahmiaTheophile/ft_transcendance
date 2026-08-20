export function validateEnvironment() {
  const validPattern = /^[a-zA-Z0-9.-]+$/;
  const requiredVars = ['DB_USER', 'DB_PASSWORD', 'DB_NAME'];

  requiredVars.forEach((varName) => {
    const value = process.env[varName];
    if (!value || !validPattern.test(value)) {
      console.error(`FATAL CONFIG ERROR: Environment variable '${varName}' is missing or contains invalid characters.`);
      process.exit(1);
    }
  });
}
