const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/userRepository");
const logger = require("../observability/logger");

class AuthService {
  constructor() {
    if (!process.env.JWT_SECRET) {
      logger.error("JWT_SECRET environment variable is not defined!");
      throw new Error("JWT_SECRET must be configured");
    }
  }

  async register(userData) {
    logger.debug(
      `Registering new user with email: ${userData.email}, phone: ${userData.phone}`
    );

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      logger.warn(
        `Registration failed: Email ${userData.email} already exists`
      );
      throw new Error("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    logger.debug(`Password hashed for new user: ${userData.email}`);

    const user = await userRepository.create({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      password: hashedPassword,
    });

    logger.info(`User created successfully: ${user.id}, ${user.email}`);

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(email, password) {
    logger.debug(`Login attempt for email: ${email}`);

    const user = await userRepository.findByEmail(email);

    if (!user) {
      logger.warn(`Login failed: Email not found: ${email}`);
      throw new Error("Invalid email or password");
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      logger.warn(`Login failed: Invalid password for user: ${email}`);
      throw new Error("Invalid email or password");
    }

    logger.debug(`Password validated for user: ${email}`);

    if (!process.env.JWT_SECRET) {
      logger.error("JWT_SECRET is not defined when trying to sign token");
      throw new Error("Server configuration error");
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    logger.info(`JWT token generated for user: ${user.id}, ${email}`);

    return { token };
  }
}

module.exports = new AuthService();
