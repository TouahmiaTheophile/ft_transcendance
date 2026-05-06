Le script init.sh dans requirements/ vérifie que les identifiants de mariadb ne contiennent que certains caractères puis appelle le docker-compose.yml,
il est le point d'entré du projet (par contre il appelle avec --build ce qui ralentit est n'est plus nécessaire il me semble)

le fichier prisma à la racine explique brièvement l'intérêt de prisma dans le projet et comment faire les changements

db_manip donne des commandes pratiques pour consulter / intéragir avec la db ou l'AP
I

