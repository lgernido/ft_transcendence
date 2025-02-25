## 🖥️ General Information

The aim of this project is to create a website for the famous **Pong** game.
This contains a mandatory part common for all gorups and a modular part that varies between teams.

## 🎓 Features

### Basics

This a Single Page Application compatible with latest version of Chrome.
Players and play the pong game using the same keyboard.
Registration system and a tournament option witch matchmaking system that announces winners, next games etc..
All passwords are hashed, the website is protected against SQL injections and HTTPS connection is enabled. 

### Backend

The backend was build using the **Django** framework.
The database for all databases instances is **PostgreSQL**

### Frontend

The frontend was build using the **Bootstrap toolkit**

### User Management 

The website is set up with standard user management that includes : 

◦ Registered users can log in in a secure way.

◦ Registered users can subscribe in in a secure way.

◦ Users can select a unique display name to play the tournaments.

◦ Users can update their information.

◦ Users can upload an avatar, with a default option if none is provided.

◦ Users can add others as friends and view their online status.

◦ User profiles display stats, such as wins and losses.

◦ Each user has a Match History including 1v1 games, dates, and relevant
details, accessible to logged-in users

We also implemented a remote authentication using **OAuth 2.0** with 42's API and ensured the secure exchange of authentication tokens and user information.

### Gameplay and User Experience

It is possible to have 2 distant players. 

We implemented a **live chat** that allows direct messages, the option to add users as friends, block them, invite them to play a game and access other users profiles to see their stats.

All users have access to game stats and comprehensive dashboards for each game sessions.

We also provide game customization option such as choosing the color of the pa and changing the necessary amount of points to win.

We also introduced an **AI Opponent** that replicates human behavior. 

Lastly, the website is available in English, French and Spanish and users can switch between the languages. 
