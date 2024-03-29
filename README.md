# IITCricInfo

This app provides a simple UI which can be used to view the result of IPL matches whose information is provided in the form of tables in csv files. We have used Angular for the frontend, Node.js for the backend and Postgres as the database server. 

## Instructions to run the code 

- Create a new database named **lab4db** and execute the file ```lab4.ddl``` provided.
- Insert the data into the database. 
- Navigate to the directory ```frontend``` and execute the following commands
```
# To install dependencies
npm i 
# To compile and start the frontend 
ng serve
``` 
- Create a new file ```.env``` inside the folder ```backend``` and set the following environment variables

```
PGHOST=<host-name>
PGUSER=<database-username> 
PGDATABASE=<database-name> 
PGPASSWORD=<password>
PGPORT=<port>
```

- Open a new terminal window and navigate to the directory ```backend``` and execute the following commands

```
# To install dependencies
npm i 
# Run the backend server
node main.js 
``` 
- Open the url http://localhost:4200/ and enjoy using the app.

## References

- https://node-postgres.com
- https://nodejs.org
- https://www.tutorialspoint.com/nodejs/index.htm
- http://jsfiddle.net/MTB2q/
- https://material.angular.io/
- https://www.chartjs.org/

