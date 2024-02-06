# Qryptell Auth Service

The Qryptell Auth Service is responsible for managing user authentication and authorization within the Qryptell microservice chat application. It utilizes NodeJS, express, JWT to securely handle user authentication and token-based authorization.

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Features
- User registration and account creation
- User login and authentication using JWT (JSON Web Tokens)
- Password hashing and secure storage
- Authorization middleware for protected routes
- Token-based session management and expiration

## Technologies Used
- Node JS
- Express
- Rabbit MQ
- Mysql
- JWT

## Usage
Once the authentication service is running locally, it provides endpoints for user registration, login, and token generation.  
Use these endpoints to authenticate users and manage sessions for other services within the Qryptell application.

## Contributing
Contributions are welcome! To contribute to this project:
1. Fork the project
2. Clone the fork
    ```git
    git clone https://github.com/<your-username>/Qryptell-auth-service
    ```

3. Add Upstream
    ```git
    git remote add upstream https://github.com/LoomingLunar/Qryptell-auth-service
    ```

4. Craete a new branch
    ```git
    git checkout -b feature
    ```

5.  Make your changse
6. Commit your changes
    ```git
    git commit -am "Add new feature"
    ```

7. Update main
    ```git
    git checkout main
    git pull upstream main
    ```

8. Rebase to main
    ```git
    git checkout feature
    git rebase main
    ```

    if there is any conflict you need to fix it.
9. Push to the branch
    ```git
    git push origin feature
    ```

10. Create new Pull Request

## LICENSE

Qryptell Auth Service - Auth Service for Qryptell End To End Encrypted Chat App.

Copyright © 2023  Qryptell

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

[GPLv3](LICENSE)
