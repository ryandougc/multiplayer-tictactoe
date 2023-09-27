# Multiplayer Oneline Tic-Tac-Toe
This is a multiplayer online version of tic-tac-toe that I built during my first week of the #100daysofcode challenge. The rules are the same as regular tic-tac-toe. You can play online with your friends through your browser. A live text chat is started in each game so you can chat with your opponent. 

## Skills Used

- Node.js
- [Socket.io](http://Socket.io) (web sockets)

## Lessons Learned

*Web Sockets*

This is the first project that I have worked with web sockets. I really got to understand event driven architecture within Node.js, having my server “react” to certain inputs that it receives. This was a new concept to me. At the time, I had mostly developed programs using the functional programming paradigm. I struggled at first to understand the differences between the two but as I used it, I began to realize how event driven architecture considers any form of input as a trigger for an action, whereas functional programming reacts mostly to changes in data. 

I also learned about how sockets are an alternative to a traditional Http connection in the browser. Being able to send data in real time to and from my server in a single connection opened up many doors for potential projects and features that I could build in the future. 

## Project Outcome

I ran this app for a few days, having posted this on my Instagram, and had some of my friends and family join in to play. It went well and was about as much fun as you can have while playing tictactoe

## Features
After you enter your name upon loading the website for the first time, you can either create a game or join an existing game if there is one. Once 2 people are in the game, the game will start. 

There is a realtime chat to give kind compliments to your opponents and to get updates about the status of the game. I also added a dark mode feature, only because I personally think every website should have their own darkmode. 

## Credit where it is due
This code is based off of 3 tutorials from a youtube channel called WebDevSimplified. All the techniques in these videos were combined together to build this multiuplayer version of tic-tac-toe. Credit goes to Kyle (channel owner) for his tutorials. I am simply a student who is trying to learn everything I can the best way I can.  

Socket.io chat: https://youtu.be/rxzOqP9YwmM  
Socket.io Rooms: https://youtu.be/UymGJnv-WsE  
Tic-Tac-Toe: https://youtu.be/Y-GkMjUZsmM
