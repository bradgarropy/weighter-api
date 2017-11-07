# Weighter API

After creating a completely server side weight tracking app ([weighter](https://github.com/bradgarropy/weighter)), it was time to implement a client side front end, which means I also needed a REST API on the server side. Using my [NWA Template](https://github.com/bradgarropy/nwa) as a starting point, I was able to quickly spin up some user and weight models. This API acts as the backend to both the [React](https://reactjs.org/) and [Vue](https://vuejs.org/) implementations of the front end.

Both implementations are deployed on [Heroku](https://dashboard.heroku.com/apps) at the links below:  
http://weighter-react.herokuapp.com/  
http://weighter-vue.herokuapp.com/  

You can access the API here:
https://weighter-api.herokuapp.com/


## API

### Feedback

Send feedback to the site maintainer.

```
POST /api/feedback
{
  "email": <string>,
  "feedback": <string>
}
```

### Forgot Password

Requests a password reset token be sent to the email provided.

```
POST /api/forgot
{
  "email": <string>
}
```

### User Login

Validates user credentials and responds with a [JSON Web Token](https://jwt.io/)

```
POST /api/login
{
  "email": <string>,
  "password": <string>
}
```

### Change Password

Changes the user's password.

```
POST /api/password
{
  "current_password": <string>,
  "new_password": <string>,
  "confirmation": <string>
}
```

### Reset Password

Allows the user to change their password by providing a reset token.

```
POST   /api/reset/:token
{
  "password": <string>,
  "confirmation": <string>
}
```

### User

User CRUD operations.

```
GET /api/user

GET /api/user/:id

POST /api/user
{
  "first_name": <string>,
  "last_name": <string>,
  "email": <string>,
  "password": <string>,
  "confirmation": <string>,
}

DELETE /api/user/:id

PUT /api/user/:id
{
  "first_name": <string>,
  "last_name": <string>,
  "email": <string>
}
```

### Weight

Weight CRUD operations.

```
GET /api/weight

GET /api/weight/:id

POST /api/weight
{
  "date": <string>,
  "weight": <string>
}

DELETE /api/weight/:id

PUT /api/weight/:id
{
  "date": <string>,
  "weight": <string>
}
```

## Usage

If you would like to build and run this API locally, follow the instructions below.


First, clone the repository.

```
git clone https://github.com/bradgarropy/weighter-api.git
```

Next, install the dependencies.

```
npm install
```

Then, start the web server.

```
npm start
```

Finally, navigate to the site.

```
localhost:3000
```
