import 'dotenv/config';
import { db } from '../src/db';
import { decksTable, cardsTable } from '../src/db/schema';

const userId = 'user_3971C1Egq9imgnuIJ7jRVrPs1U7';

async function seedExampleDecks() {
  try {
    console.log('Starting to seed example decks...');

    // Create Deck 1: English-Spanish Translations
    const [englishSpanishDeck] = await db
      .insert(decksTable)
      .values({
        userId,
        title: 'English to Spanish - Common Words',
        description: 'Learn common English words and their Spanish translations',
      })
      .returning();

    console.log(`Created deck: ${englishSpanishDeck.title} (ID: ${englishSpanishDeck.id})`);

    // Insert cards for English-Spanish deck
    const englishSpanishCards = [
      { front: 'Hello', back: 'Hola' },
      { front: 'Goodbye', back: 'Adiós' },
      { front: 'Please', back: 'Por favor' },
      { front: 'Thank you', back: 'Gracias' },
      { front: 'Yes', back: 'Sí' },
      { front: 'No', back: 'No' },
      { front: 'Water', back: 'Agua' },
      { front: 'Food', back: 'Comida' },
      { front: 'House', back: 'Casa' },
      { front: 'Friend', back: 'Amigo' },
      { front: 'Love', back: 'Amor' },
      { front: 'Time', back: 'Tiempo' },
      { front: 'Day', back: 'Día' },
      { front: 'Night', back: 'Noche' },
      { front: 'Beautiful', back: 'Hermoso' },
    ];

    await db.insert(cardsTable).values(
      englishSpanishCards.map((card) => ({
        deckId: englishSpanishDeck.id,
        front: card.front,
        back: card.back,
      }))
    );

    console.log(`Inserted ${englishSpanishCards.length} cards for English-Spanish deck`);

    // Create Deck 2: British History Q&A
    const [britishHistoryDeck] = await db
      .insert(decksTable)
      .values({
        userId,
        title: 'British History Quiz',
        description: 'Questions and answers about key events in British history',
      })
      .returning();

    console.log(`Created deck: ${britishHistoryDeck.title} (ID: ${britishHistoryDeck.id})`);

    // Insert cards for British History deck
    const britishHistoryCards = [
      {
        front: 'When did the Battle of Hastings take place?',
        back: '1066',
      },
      {
        front: 'Who was the first Tudor monarch?',
        back: 'Henry VII',
      },
      {
        front: 'In which year did the Great Fire of London occur?',
        back: '1666',
      },
      {
        front: 'When did the English Civil War begin?',
        back: '1642',
      },
      {
        front: 'Who was known as the "Iron Lady"?',
        back: 'Margaret Thatcher',
      },
      {
        front: 'In which year did World War II end?',
        back: '1945',
      },
      {
        front: 'What was the name of the ship that brought the Pilgrims to America?',
        back: 'The Mayflower',
      },
      {
        front: 'When did the Industrial Revolution begin in Britain?',
        back: 'Around 1760',
      },
      {
        front: 'Who was the longest-reigning British monarch before Elizabeth II?',
        back: 'Queen Victoria',
      },
      {
        front: 'In which year did the Battle of Waterloo take place?',
        back: '1815',
      },
      {
        front: 'What was the name of the period when Oliver Cromwell ruled England?',
        back: 'The Commonwealth or Interregnum',
      },
      {
        front: 'When did the Norman Conquest of England occur?',
        back: '1066',
      },
      {
        front: 'Who was the British Prime Minister during most of World War II?',
        back: 'Winston Churchill',
      },
      {
        front: 'In which year did the Battle of Britain take place?',
        back: '1940',
      },
      {
        front: 'What was the name of the plague that struck London in 1665?',
        back: 'The Great Plague of London',
      },
    ];

    await db.insert(cardsTable).values(
      britishHistoryCards.map((card) => ({
        deckId: britishHistoryDeck.id,
        front: card.front,
        back: card.back,
      }))
    );

    console.log(`Inserted ${britishHistoryCards.length} cards for British History deck`);

    console.log('✅ Successfully seeded example decks!');
  } catch (error) {
    console.error('Error seeding decks:', error);
    throw error;
  }
}

seedExampleDecks()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
