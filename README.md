# 2Fa with Authenticator Apps like Google Authenticator

This project provides a RESTful API for user authentication and management, utilizing MongoDB as the database and OTPAuth for generating and validating One-Time Passwords (OTP). The API is built using Express.js and is designed to handle user registration, login, OTP generation, verification, validation, and disabling.

## Table of Contents
- [Introduction](#user-authentication-and-otp-management-api)
- [Endpoints](#endpoints)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Dependencies](#dependencies)
- [Contributing](#contributing)
- [License](#license)

Documentation -  https://documenter.getpostman.com/view/22824646/2s9Xy2QsPE 
## Endpoints

1. **POST /register**: Register a new user by providing the user's name, email, and password. If successful, the user is added to the database.

2. **POST /login**: Log in a user by providing their email and password. If the login is successful, user details are returned, including OTP status.

3. **POST /otp/generate**: Generate an OTP for a user. The generated OTP is associated with the user, and a QR code is generated for adding the OTP to an authenticator app.

4. **POST /otp/verify**: Verify an OTP provided by the user. If the OTP is valid, the user's OTP status is updated.

5. **POST /otp/validate**: Validate an OTP provided by the user. The validation window is extended to allow for minor time discrepancies.

6. **POST /otp/disable**: Disable OTP for a user.

## Getting Started

1. Clone this repository to your local machine.
2. Install the required dependencies using `npm install`.
3. Set up your MongoDB database and provide the database URL in the project's environment.
4. Start the backend server using `npm start`.

## Usage

1. Start the backend server.
2. Use tools like Postman to send requests to the defined API endpoints.
3. Follow the flow for user registration, login, OTP generation, verification, validation, and disabling.

**Note:** This collection requires the use of an authenticator app that supports the TOTP algorithm to handle OTP generation and verification.

## Dependencies

- Express.js: Web framework for building the API endpoints.
- OTPAuth: Library for generating and validating OTPs using TOTP algorithm.
- MongoDB: Database used for storing user information and OTP-related data.

## Contributing

Contributions are welcome! If you find any issues or improvements, feel free to open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).
