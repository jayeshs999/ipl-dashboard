# IITCricInfo

This app provides a simple UI which can be used to view the result of IPL matches whose information is provided in the form of tables in csv files. We have used angular as frontend, Node.js as backend and Postgres as the database server. 

## Instructions to run the code 

First, using the lab4db.ddl file provided and the data, insert the data into the database named \'lab4db\'. 

Now, navigate to the directory frontend and run command  
`npm i` on the terminal to install the required modules

Run the command  `ng serve` to compile and start the frontend.

Now, navigate to the backend directory and run the command `npm i` to install the modules. 

Run the command `PGHOST='127.0.0.1' PGUSER='[user]' PGDATABASE='lab4db' PGPASSWORD='[pswd]' PGPORT=5432 node main.js` to start the backend server. 

Now, open the url http://localhost:4200/ and enjoy the app.


## References used for the assignment

- https://node-postgres.com
- https://nodejs.org
- https://www.tutorialspoint.com/nodejs/index.htm
-
-
-

