export type PassageQuestion = {
  question: string
  answer: string
}

export type Passage = {
  id: string
  title: string
  text: string
  questions: PassageQuestion[]
}

export const PASSAGES: Passage[] = [
  {
    id: 'the-camel',
    title: 'The Ship of the Desert',
    text:
      'The camel is often called the ship of the desert. It can live for many days without water, which makes it perfect for travelling across hot, sandy deserts. The camel has a hump on its back. The hump stores fat, not water, and the animal uses this fat for energy when food is scarce. Its broad, flat feet stop it from sinking into the soft sand. A long, curved eyelid and thick hair protect its eyes from the blowing sand and the strong sun.\n\n' +
      'Camels are very useful to people who live in deserts. They carry heavy loads of goods across long distances. Their milk is drunk by people, their hair is used to make cloth and tents, and their skin is made into shoes and bags. In many countries, camels are so valuable that they are called the treasure of the desert. A camel can walk for hours without stopping and can find its way home even in a sandstorm.\n\n' +
      'Although camels look slow and clumsy, they can actually run quite fast. When the weather is extremely hot, they stand together in a group so that the leader, standing in the middle, gets the shade of the others. This shows how intelligent and caring these wonderful animals are.',
    questions: [
      {
        question: 'Why is the camel called the ship of the desert?',
        answer: 'Because it can travel across the hot, sandy desert for many days without water, like a ship travels across the sea.',
      },
      {
        question: 'What does the hump of a camel store?',
        answer: 'The hump stores fat, which the camel uses for energy when food is scarce.',
      },
      {
        question: 'How do the broad, flat feet of a camel help it?',
        answer: 'They stop the camel from sinking into the soft sand.',
      },
      {
        question: 'What does the word "scarce" mean in the passage?',
        answer: 'Scarce means not enough or difficult to find — very little in quantity.',
      },
      {
        question: 'Give the antonym (opposite) of the word "valuable" from the passage.',
        answer: 'Worthless (or cheap/useless).',
      },
    ],
  },
  {
    id: 'water-cycle',
    title: 'The Water Cycle',
    text:
      'Water is one of the most important things on Earth. All living things — plants, animals and human beings — need water to survive. But have you ever wondered where the rain comes from? The answer is the water cycle, a journey that water takes again and again.\n\n' +
      'The sun heats the water in rivers, lakes and seas. The heat changes the water into vapour, which is an invisible gas. This process is called evaporation. The water vapour rises into the sky, where the air is cooler. There it changes back into tiny drops of water and forms clouds. This process is called condensation. When the drops become too heavy, they fall back to the ground as rain or snow. This is called precipitation.\n\n' +
      'The rain flows into rivers and streams and finally back into the sea. Then the sun starts the whole journey again. In this way, water never really disappears — it only changes its form. That is why we must look after our water. We should not waste it, because clean water is a gift that supports all life on our planet.',
    questions: [
      {
        question: 'What is the water cycle?',
        answer: 'It is the journey that water takes again and again — from the earth to the sky and back.',
      },
      {
        question: 'What is evaporation?',
        answer: 'The process in which the sun heats water and changes it into invisible water vapour.',
      },
      {
        question: 'When does rain fall from the clouds?',
        answer: 'When the tiny drops of water in the clouds become too heavy, they fall to the ground as rain or snow.',
      },
      {
        question: 'What does the word "vapour" mean?',
        answer: 'Vapour is the invisible gas form of water (steam).',
      },
      {
        question: 'Give the antonym (opposite) of the word "important".',
        answer: 'Unimportant (or useless/trivial).',
      },
    ],
  },
  {
    id: 'forest-fire',
    title: 'The Brave Firefighter',
    text:
      'It was a hot summer afternoon when the fire alarm rang loudly at the station. Firefighter Imran and his team jumped into their red truck within seconds. A forest near the town was burning, and the flames were spreading fast. Thick, grey smoke rose high into the sky and could be seen from miles away.\n\n' +
      'When they reached the forest, Imran saw that the fire had already destroyed many trees. He ordered his team to spread out and spray water on the edges of the fire so that it could not spread further. The heat was terrible, and the smoke made it hard to breathe. But Imran did not give up. He knew that the small animals of the forest, the birds in the trees and the people living nearby were all in danger.\n\n' +
      'For three hours the brave team fought the fire. At last, with the help of a fire-beating helicopter, they brought it under control. The forest was damaged, but it was not destroyed completely. That evening, the people of the town thanked the fire-fighters warmly. Imran smiled and said, "It is my duty to protect people and nature. We saved the forest today."',
    questions: [
      {
        question: 'What happened on the hot summer afternoon?',
        answer: 'The fire alarm rang and a forest near the town was burning.',
      },
      {
        question: 'Why did Imran order his team to spray water on the edges of the fire?',
        answer: 'So that the fire could not spread further and destroy more of the forest.',
      },
      {
        question: 'How long did the team fight the fire?',
        answer: 'They fought the fire for three hours.',
      },
      {
        question: 'What does the word "destroyed" mean in the passage?',
        answer: 'Destroyed means ruined or damaged completely so that it cannot be used.',
      },
      {
        question: 'Give the antonym (opposite) of the word "brave".',
        answer: 'Cowardly (or afraid/fearful).',
      },
    ],
  },
  {
    id: 'village-fair',
    title: 'The Village Fair',
    text:
      'Every year, in the month of March, our village holds a grand fair. People from all the nearby villages come to enjoy it. The fair is held in the big open ground near the river, and it is decorated with colourful flags and bright lights.\n\n' +
      'There are many stalls at the fair. Some sell sweet jalebis and cold drinks, while others sell toys, bangles and bright cloth. The children love the merry-go-round and the giant wheel. The most exciting part of the fair is the horse race. The riders, dressed in bright clothes, gallop their horses as fast as they can while the crowd shouts and claps.\n\n' +
      'At night the fair looks even more beautiful. Lanterns and lamps are lit all around, and the sound of drums and music fills the air. The fair lasts for three days, and on the last night there is a fireworks show that lights up the whole sky. Everyone returns home happy and tired, already talking about the fair that will come again next year.',
    questions: [
      {
        question: 'When and where is the village fair held?',
        answer: 'It is held every year in March in the big open ground near the river.',
      },
      {
        question: 'Which is the most exciting part of the fair?',
        answer: 'The horse race is the most exciting part of the fair.',
      },
      {
        question: 'How long does the fair last?',
        answer: 'The fair lasts for three days.',
      },
      {
        question: 'What does the word "gallop" mean in the passage?',
        answer: 'Gallop means to run very fast, like a horse at full speed.',
      },
      {
        question: 'Give the antonym (opposite) of the word "happy".',
        answer: 'Sad (or unhappy).',
      },
    ],
  },
]

export function getPassage(id: string): Passage | undefined {
  return PASSAGES.find(p => p.id === id)
}
