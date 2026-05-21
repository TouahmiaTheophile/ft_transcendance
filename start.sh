#!/bin/bash
# start.sh - Single entry point for development


###		CREDENTIALS CARACTERS CHECK		###

	# Load environment variables
	if [ -f .env ]; then
		export $(grep -v '^#' .env | xargs)
	else
		echo "ERROR: .env file not found."
		exit 1
	fi

	# Regex to allow only alphanumeric characters, dots, and hyphens
	VALID_PATTERN='^[a-zA-Z0-9.-]+$'

	# Function to validate the presence and format of variables
	validate_var() {
		local var_name=$1
		local var_value=${!var_name}

		# Check if the variable is empty or unset
		if [ -z "$var_value" ]; then
			echo "CONFIG ERROR: Variable '$var_name' is missing or empty in .env file."
			exit 1
		fi

		# Check if the variable contains only allowed characters
		if [[ ! "$var_value" =~ ^[a-zA-Z0-9.-]+$ ]]; then
			echo "CONFIG ERROR: Variable '$var_name' contains invalid characters."
			echo "Value: '$var_value'"
			echo "Only alphanumeric characters, dots, and hyphens are allowed."
			exit 1
		fi
	}

	# Validate required variables
	validate_var "MARIADB_ROOT_PASSWORD"
	validate_var "MARIADB_USER"
	validate_var "MARIADB_PASSWORD"
	validate_var "MARIADB_DATABASE"

###



echo "Configuration validated. Starting containers..."
docker compose up -d --build