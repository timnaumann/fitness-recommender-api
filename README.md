# Fitness-Recommender-Api

## How to StartUp

### Make sure that your postgres is running 
1. go into your postgres folder ```cd postgres ```
2. start your docker postgres using the postgres script ```./postgres.sh```

Your postgres should now run on http://localhost:5432

### setup the api 

1. go into ```fitness-recommender-api```
2.  ```npm i ```
3. ```npm run migrations ```
4. ```npm run dev ```
5. Your terminal is now blocked, so open a new one and do ```npm run addExampleData ```