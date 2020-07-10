# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

The app will track to ensure that only the creator of a shortened URL will be able to edit or delete that short URL. 

Additional features to be added at a later stage:
- tracking the date the short URL was created
- tracking the number of times the short URL was visited
- tracking the number of unique visits for the short URL

## Final Product

!["Screenshot of Register page"](https://github.com/unicornteacup/tinyapp/blob/master/docs/TinyApp%20Register.png?raw=true)
!["Screenshot of Create New ShortURL page"](https://github.com/unicornteacup/tinyapp/blob/master/docs/TinyApp%20Create%20New.png?raw=true)
!["Screenshot of MyURLs page"](https://github.com/unicornteacup/tinyapp/blob/master/docs/TinyApp%20MyURLs.png?raw=true)
!["Screenshot of Edit URL page"](https://github.com/unicornteacup/tinyapp/blob/master/docs/TinyApp%20Edit.png?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.