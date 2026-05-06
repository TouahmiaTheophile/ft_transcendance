# MariaDB

Se charge de vérifier la forme (type de donnée: string, digits, etc) et les limites physiques des données (types, tailles, non-vide) ainsi que de l'unicité.

# API Backend

Vérifie tout ce qui concerne la logique métier qui n'est pas déjà fait par MariaDB.

ex: format des emails, limite de comptes créés par jour, conversion en minuscules, ...

# Frontend

Recoit et transmet les formulaires et messages d'erreur