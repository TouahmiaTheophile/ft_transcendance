frontend/
	app/
		lib/
			socket.ts
			api.ts	(API = "")
	next.config.ts


ERREUR console en arrivant sur la page d'accueil:

The resource https://localhost/_next/static/chunks/0z8cepdlm8uy3.css was preloaded using link preload but not used within a few seconds from the window's load event. Please make sure it has an appropriate `as` value and it is preloaded intentionally.

ERREUR console en tentant un mauvais login (aucun users en db):
	(jsp si c'est normal que ça apparaisse dans la console, mais v que la consigne dit pas d'err dans la console à vérifier)

VM30 0lok0rsl.r3pw.js:1 
 POST https://localhost/auth/login 401 (Unauthorized)
c	@	VM30 0lok0rsl.r3pw.js:1
sJ	@	07lhk_q6pmm3r.js:1
(anonymous)	@	07lhk_q6pmm3r.js:1
tD	@	07lhk_q6pmm3r.js:1
s4	@	07lhk_q6pmm3r.js:1
fz	@	07lhk_q6pmm3r.js:1
fT	@	07lhk_q6pmm3r.js:1
