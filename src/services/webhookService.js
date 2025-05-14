const twilio = require("twilio");
const userRepository = require("../repositories/userRepository");
const projectRepository = require("../repositories/projectRepository");
const timesheetRepository = require("../repositories/timesheetRepository");

class WebhookService {
  async processMessage(from, body) {
    const phone = from.replace("whatsapp:", "");

    let user = await this.findUserByPhone(phone);

    if (!user) {
      return this.createTwimlResponse(
        "❌ You need to register first. Please visit our website to create an account.",
      );
    }

    const hoursMatch = body.match(/(\d+(?:\.\d+)?)\s*(?:hrs?|hours?)?/i);

    if (!hoursMatch) {
      return this.createTwimlResponse(
        '❌ Please send your hours in the format "2hrs ProjectName" or "2hrs ProjectName DD/MM".',
      );
    }

    const hours = parseFloat(hoursMatch[1]);
    let remainingText = body.substring(hoursMatch[0].length).trim();

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

      if (isNaN(entryDate.getTime()) || entryDate > new Date()) {
        return this.createTwimlResponse(
          '❌ Invalid date. Please use format "DD/MM" or "DD/MM/YYYY".',
        );
      }

      remainingText = remainingText.replace(dateMatch[0], "").trim();
    }

    const projectName = remainingText;

    if (!projectName) {
      return this.createTwimlResponse(
        '❌ Please specify a project name: "2hrs ProjectName" or "2hrs ProjectName DD/MM"',
      );
    }

    const project = await projectRepository.findByUserAndName(
      user.id,
      projectName,
    );

    if (!project) {
      return this.createTwimlResponse(
        `❌ Project "${projectName}" does not exist. Please create it first on the website.`,
      );
    }

    await timesheetRepository.create({
      userId: user.id,
      projectId: project.id,
      date: entryDate,
      hours,
      notes: body,
    });

    const formattedDate = entryDate.toLocaleDateString("pt-BR");

    if (entryDate.toDateString() === new Date().toDateString()) {
      return this.createTwimlResponse(
        `✅ Added ${hours} hours to project "${projectName}" for today.`,
      );
    } else {
      return this.createTwimlResponse(
        `✅ Added ${hours} hours to project "${projectName}" for ${formattedDate}.`,
      );
    }
  }

  async findUserByPhone(phone) {
    let user = await userRepository.findByPhone(phone);

    if (user) return user;

    const normalizedIncomingPhone = phone.replace(/\D/g, "");
    const allUsers = await userRepository.findAll();

    user = allUsers.find((u) => {
      const normalizedUserPhone = u.phone.replace(/\D/g, "");
      return normalizedUserPhone === normalizedIncomingPhone;
    });

    if (user) return user;

    if (normalizedIncomingPhone.startsWith("55")) {
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
    }

    return user;
  }

  createTwimlResponse(message) {
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(message);
    return twiml.toString();
  }
}

module.exports = new WebhookService();
