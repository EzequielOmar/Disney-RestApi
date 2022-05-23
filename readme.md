#### ALKEMY CHALLENGE BACKEND - NodeJs

# Disney Api

##### Node - Express - Sequelize - MySql - Jwt

---

###### You can read the [**complete api documentation here**](https://documenter.getpostman.com/view/9036853/UyxqBiED).

The **_disney.postman_collection.json_** file in the project root, can be used to import into postman and test the project locally.

The system consist of three entities: **Genre, Movie, Character**.

**Many to Many** relation on:
Genre <=> Movie
Character <=> Movie

Enabled endpoints for CRUD methods for **Character** and **Movie** entities. And enabled endpoints (**signup** and **login**) to create and authenticate users.

All the methods that modify data are private and require **Authentication Bearer** header.

---

### Entities:

##### Genres

- Id
- Image
- Name
- Movies

##### Movies

- Id
- Image
- Title
- Creation
- Score
- Characters
- Genres
- CreatedAt
- UpdateAt

##### Characters

- Id
- Image
- Name
- Age
- Weight
- Story
- Movies
- CreatedAt
- UpdateAt

##### Users

- Id
- Email
- Pass
- CreatedAt
- UpdateAt
