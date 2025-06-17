const twilio = require("twilio");
const userRepository = require("../repositories/userRepository");
const projectRepository = require("../repositories/projectRepository");
const timesheetRepository = require("../repositories/timesheetRepository");
const logger = require("../observability/logger");

class WebhookService {
  async processMessage(from, body) {
    const phone = from.replace("whatsapp:", "");
    logger.debug(`Processing message from ${phone}: "${body}"`);

    let user = await this.findUserByPhone(phone);

    if (!user) {
      logger.warn(`Unregistered user attempted to use service: ${phone}`);
      return this.createTwimlResponse(
        "❌ You need to register first. Please visit our website to create an account."
      );
    }

    logger.debug(`User identified: ${user.id} (${user.name || phone})`);

    if (
      body.toLowerCase() === "projects" ||
      body.toLowerCase() === "list projects"
    ) {
      logger.info(`User ${user.id} requested projects list`);
      const projects = await projectRepository.findByUser(user.id);

      if (projects.length === 0) {
        logger.info(`User ${user.id} has no projects`);
        return this.createTwimlResponse(
          "❌ You don't have any projects yet. Please create a project first on the website."
        );
      }

      const projectList = projects
        .map((project) => `• ${project.name}`)
        .join("\n");

      return this.createTwimlResponse(
        `📋 Your Projects:\n${projectList}\n\nTo log hours, send: "2hrs ProjectName" or "2hrs ProjectName DD/MM"`
      );
    }

    if (body.toLowerCase() === "help" || body.toLowerCase() === "?") {
      logger.info(`User ${user.id} requested help menu`);
      return this.createTwimlResponse(
        `📱 Available Commands:
          • "2hrs ProjectName" - Log hours for today
          • "2hrs ProjectName DD/MM" - Log hours for a specific date
          • "projects" - List all your projects
          • "help" - Show this help message`
      );
    }

    const hoursMatch = body.match(/(\d+(?:\.\d+)?)\s*(?:hrs?|hours?)?/i);

    if (!hoursMatch) {
      logger.warn(`User ${user.id} sent invalid format: "${body}"`);
      return this.createTwimlResponse(
        '❌ Please send your hours in the format "2hrs ProjectName" or "2hrs ProjectName DD/MM".'
      );
    }

    const hours = parseFloat(hoursMatch[1]);
    let remainingText = body.substring(hoursMatch[0].length).trim();
    logger.debug(`Parsed hours: ${hours}, remaining text: "${remainingText}"`);

    const datePattern = /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/;
    const dateMatch = remainingText.match(datePattern);

    let entryDate = new Date();

    if (dateMatch) {
      const day = parseInt(dateMatch[1]);
      const month = parseInt(dateMatch[2]) - 1;
      const year = dateMatch[3]
        ? dateMatch[3].length === 2
          ? 2000 + parseInt(dateMatch[3])
          : parseInt(dateMatch[3])
        : new Date().getFullYear();

      entryDate = new Date(year, month, day);
      logger.debug(`Parsed date: ${entryDate.toISOString().split("T")[0]}`);

      if (isNaN(entryDate.getTime()) || entryDate > new Date()) {
        logger.warn(`User ${user.id} provided invalid date: ${dateMatch[0]}`);
        return this.createTwimlResponse(
          '❌ Invalid date. Please use format "DD/MM" or "DD/MM/YYYY".'
        );
      }

      remainingText = remainingText.replace(dateMatch[0], "").trim();
    }

    const projectName = remainingText;

    if (!projectName) {
      logger.warn(`User ${user.id} didn't specify project name`);
      return this.createTwimlResponse(
        '❌ Please specify a project name: "2hrs ProjectName" or "2hrs ProjectName DD/MM"'
      );
    }

    logger.debug(
      `Looking for project with name: "${projectName}" for user ${user.id}`
    );

    const allUserProjects = await projectRepository.findByUser(user.id);
    logger.debug(
      `User has ${allUserProjects.length} projects: ${allUserProjects.map((p) => `"${p.name}"`).join(", ")}`
    );

    const project = await projectRepository.findByUserAndName(
      user.id,
      projectName
    );

    if (!project) {
      logger.warn(
        `User ${user.id} specified non-existent project: "${projectName}"`
      );
      return this.createTwimlResponse(
        `❌ Project "${projectName}" does not exist. Please create it first on the website.`
      );
    }

    logger.debug(`Project found: ${project.id} (${project.name})`);

    await timesheetRepository.create({
      userId: user.id,
      projectId: project.id,
      date: entryDate,
      hours,
      notes: body,
    });

    logger.info(
      `User ${user.id} logged ${hours} hours to project ${project.id} (${project.name}) for date ${entryDate.toISOString().split("T")[0]}`
    );

    const formattedDate = entryDate.toLocaleDateString("pt-BR");

    if (entryDate.toDateString() === new Date().toDateString()) {
      return this.createTwimlResponse(
        `✅ Added ${hours} hours to project "${projectName}" for today.`
      );
    } else {
      return this.createTwimlResponse(
        `✅ Added ${hours} hours to project "${projectName}" for ${formattedDate}.`
      );
    }
  }

  async findUserByPhone(phone) {
    logger.debug(`Looking up user by phone: ${phone}`);
    let user = await userRepository.findByPhone(phone);

    if (user) {
      logger.debug(`User found directly: ${user.id}`);
      return user;
    }

    const normalizedIncomingPhone = phone.replace(/\D/g, "");
    logger.debug(
      `No direct match, trying with normalized phone: ${normalizedIncomingPhone}`
    );
    const allUsers = await userRepository.findAll();

    user = allUsers.find((u) => {
      const normalizedUserPhone = u.phone.replace(/\D/g, "");
      return normalizedUserPhone === normalizedIncomingPhone;
    });

    if (user) {
      logger.debug(`User found by normalized phone: ${user.id}`);
      return user;
    }

    if (normalizedIncomingPhone.startsWith("55")) {
      logger.debug(`Trying Brazilian phone number variations`);
      user = allUsers.find((u) => {
        const normalizedUserPhone = u.phone.replace(/\D/g, "");

        if (normalizedUserPhone.startsWith("55")) {
          const position = 4;

          if (
            normalizedUserPhone.length ===
            normalizedIncomingPhone.length + 1
          ) {
            const userPhoneWith9Removed =
              normalizedUserPhone.substring(0, position) +
              normalizedUserPhone.substring(position + 1);

            return userPhoneWith9Removed === normalizedIncomingPhone;
          }
        }
        return false;
      });

      if (user) {
        logger.debug(`User found by Brazilian phone format: ${user.id}`);
      }
    }

    if (!user) {
      logger.warn(`No user found for phone: ${phone}`);
    }

    return user;
  }

  createTwimlResponse(message) {
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(message);
    logger.debug(`Created TwiML response: "${message.split("\n")[0]}..."`);
    return twiml.toString();
  }
}

module.exports = new WebhookService();
