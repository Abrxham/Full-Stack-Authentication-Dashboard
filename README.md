# Full-Stack-Authentication-Dashboard
This is my project in base for a website that rewards users for viewing ads, logging in, and providing a database and admin panel. The rewards are in cryptocurrency (USDT), and the admin panel allows Admins to confirm withdrawals. It also features high levels of security against bots and multiple accounts.

Home login and registration page:
<img width="1892" height="958" alt="Captura de pantalla 2026-05-09 210825" src="https://github.com/user-attachments/assets/7490b111-f4ac-472f-b9bc-f9c9e566654c" />
In this section, new users can create their credentials to access the website. A phone number is required to receive a security SMS code to prevent the widespread use of bots and multiple accounts, and also to more effectively identify a user's account.

Dashboard page:
<img width="1920" height="977" alt="image" src="https://github.com/user-attachments/assets/7e278796-9aec-4556-979d-120e4a62b35b" />
In this section, users can view their available balance, acquire new tasks, complete tasks, and make withdrawals to a USTD wallet of their choice. The minimum withdrawal is 15 USDT (This value can be modified at will by an authorized administrator).

Administrator Page (Base): 
<img width="1920" height="633" alt="image" src="https://github.com/user-attachments/assets/61c4534f-a33a-48fc-b6c4-c26ebbf2178a" />
In this section, authorized administrators can view all transactions from various users. The administrator can see the username, the requested withdrawal amount, the wallet address, and the transaction status which can be one of three states: "Approved," "Pending," or "Rejected." These statuses are reflected in the user's dashboard.

||Tecnologías utilizadas:||

🔹Backend:

-Node.js

-Express.js


🔹Database:

-PostgreSQL

-pgAdmin


🔹Autenticación y Seguridad:

-JWT

-bcrypt

-Middleware de autenticación personalizado

-Sistema de verificación SMS

-Protección anti-fraude básica

-Rate limiting (planeado / opcional)


🔹Frontend:

-HTML5

-CSS3

-JavaScript Vanilla (sin framework)


🔹Comunicación API:

-REST API

-JSON


🔹Herramientas de Desarrollo:

-Nodemon

-Visual Studio Code

-GitHub


🔹Funcionalidades Implementadas:

-Sistema de usuarios

-Registro y login

-Verificación por SMS

-Sistema de tareas/recompensas

-Temporizador anti-trampa

-Sistema de retiros

-Panel administrativo

-Protección contra tareas repetidas

-Límite diario de tareas

-Sistema de balances virtuales (coins)



🔹Tecnologías Planeadas:

-API de SMS real (ej: Twilio)

-Integración USDT/TRC20

-Sistema de referidos

-Sistema anti-fraude avanzado

-Dashboard avanzado

-Automatización de retiros

-Detección de bots y multi-cuentas


