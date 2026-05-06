#!/bin/bash

# The MariaDB entrypoint provides the database environment variables automatically.
# We connect to the DB and execute the SQL command using the MARIADB_DATABASE variable.

# Connect as root to create the application user and grant permissions
mariadb -u root -p"$MARIADB_ROOT_PASSWORD" <<EOF
CREATE DATABASE IF NOT EXISTS \`$MARIADB_DATABASE\`;
CREATE USER IF NOT EXISTS '$MARIADB_USER'@'%' IDENTIFIED BY '$MARIADB_PASSWORD';
GRANT ALL PRIVILEGES ON \`$MARIADB_DATABASE\`.* TO '$MARIADB_USER'@'%';
FLUSH PRIVILEGES;
EOF

# Give permissions for MARIADB_USER, it is used by prisma to create shadow database for migrations
mariadb -u root -p"$MARIADB_ROOT_PASSWORD" <<EOF
GRANT ALL PRIVILEGES ON appDB.* TO 'user'@'%';        # Full appDB
GRANT CREATE, DROP ON *.* TO 'user'@'%';              # Shadow DB + migrations
GRANT SELECT ON mysql.* TO 'user'@'%';                # Prisma introspect
FLUSH PRIVILEGES;
EOF


# Log the completion
echo "========================================================================"
echo "Database '$MARIADB_DATABASE' succesfully created (empty)."
echo "========================================================================"