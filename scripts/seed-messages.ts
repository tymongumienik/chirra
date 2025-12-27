// ai generated
import { prismaClient } from "../src/app/libs/db";

async function main() {
  console.log("Starting message seeding...");

  const users = await prismaClient.user.findMany({
    select: { id: true, username: true },
  });

  if (users.length < 2) {
    console.error("Not enough users to seed messages. Need at least 2 users.");
    process.exit(1);
  }

  console.log(`Found ${users.length} users.`);

  const messagesToCreate = 500;
  const messages = [];

  const randomContent = [
    "Hey, how are you?",
    "Did you see the latest update?",
    "Let's catch up soon.",
    "Can you send me that file?",
    "What are you working on?",
    "This is a test message.",
    "Hello!",
    "Good morning!",
    "See you later.",
    "Thanks for the help!",
    "Interesting point.",
    "I agree properly.",
    "Not sure about that.",
    "Maybe we can try a different approach.",
    "Check this out!",
    "Coding is fun.",
    "Are you free this weekend?",
    "Let's do lunch.",
    "Meeting starts in 5 minutes.",
    "Call me when you can.",
  ];

  // Generate messages with random timestamps
  for (let i = 0; i < messagesToCreate; i++) {
    const senderIndex = Math.floor(Math.random() * users.length);
    const sender = users[senderIndex];

    let recipientIndex = Math.floor(Math.random() * users.length);
    while (recipientIndex === senderIndex) {
      recipientIndex = Math.floor(Math.random() * users.length);
    }
    const recipient = users[recipientIndex];

    const createdAt = new Date(
      Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30),
    );

    messages.push({
      content: randomContent[Math.floor(Math.random() * randomContent.length)],
      authorId: sender.id,
      recipientId: recipient.id,
      createdAt,
    });
  }

  // Sort messages by createdAt ascending
  messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  // Add sequential numbers based on date
  messages.forEach((msg, index) => {
    msg.content += ` (Msg #${index + 1})`;
  });

  console.log(`Prepared ${messages.length} messages. Inserting...`);

  await prismaClient.message.createMany({
    data: messages,
  });

  console.log("Successfully created 500 messages!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });
