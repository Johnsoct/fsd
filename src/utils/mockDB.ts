// Types
import { Message } from "../types/virtualization"
// Helpers
import { getOffset } from "./pagination"

const conversation = [
    { speaker: "Person A", message: "Raising a child is a big responsibility." },
    { speaker: "Person B", message: "Absolutely. It requires patience, love, and consistency." },
    { speaker: "Person A", message: "Do you think discipline is more important than encouragement?" },
    { speaker: "Person B", message: "I think they go hand in hand. Discipline sets boundaries, and encouragement builds confidence." },
    { speaker: "Person A", message: "That makes sense. But what about when a child misbehaves?" },
    { speaker: "Person B", message: "It depends on the situation. Sometimes you need to correct them immediately, other times it’s better to have a calm conversation." },
    { speaker: "Person A", message: "I see. Do you believe in time-outs?" },
    { speaker: "Person B", message: "Yes, as long as they’re used appropriately and not as a punishment but a way to calm down." },
    { speaker: "Person A", message: "What about rewards for good behavior?" },
    { speaker: "Person B", message: "Rewards are great, but they should be meaningful and not overused. Too many rewards can create dependency." },
    { speaker: "Person A", message: "How do you teach empathy to a child?" },
    { speaker: "Person B", message: "Model it. Show empathy in your own actions and explain why it’s important to care about others." },
    { speaker: "Person A", message: "That’s true. Kids learn a lot by observing." },
    { speaker: "Person B", message: "Exactly. They mimic what they see, so consistency in your actions is key." },
    { speaker: "Person A", message: "What do you think about screen time for kids?" },
    { speaker: "Person B", message: "It’s about balance. Limited, quality screen time can be educational, but too much can be harmful." },
    { speaker: "Person A", message: "What’s a good way to introduce chores?" },
    { speaker: "Person B", message: "Start small and make it fun. Chores teach responsibility, but they shouldn’t feel like a punishment." },
    { speaker: "Person A", message: "How do you handle tantrums?" },
    { speaker: "Person B", message: "Stay calm and don’t give in. Try to understand the cause of the tantrum and address it." },
    { speaker: "Person A", message: "That must be hard sometimes." },
    { speaker: "Person B", message: "It is, but losing your temper only escalates things. Staying calm is essential." },
    { speaker: "Person A", message: "Do you think it’s important to let kids fail?" },
    { speaker: "Person B", message: "Yes, failure teaches resilience and problem-solving. Protecting them from failure isn’t helpful in the long run." },
    { speaker: "Person A", message: "How do you balance work and parenting?" },
    { speaker: "Person B", message: "It’s tough, but setting clear priorities and boundaries helps. Quality time matters more than quantity." },
    { speaker: "Person A", message: "Do you believe in setting strict rules?" },
    { speaker: "Person B", message: "Rules are important, but they need to be reasonable and flexible when necessary." },
    { speaker: "Person A", message: "What’s the best way to handle sibling rivalry?" },
    { speaker: "Person B", message: "Encourage teamwork and acknowledge their individual strengths. Avoid comparisons at all costs." },
    { speaker: "Person A", message: "What’s a good way to teach responsibility?" },
    { speaker: "Person B", message: "Give them age-appropriate tasks and praise their efforts. Responsibility grows with practice." },
    { speaker: "Person A", message: "How do you encourage creativity?" },
    { speaker: "Person B", message: "Provide opportunities for unstructured play and let them explore their interests without judgment." },
    { speaker: "Person A", message: "What about teaching respect?" },
    { speaker: "Person B", message: "Respect starts with the parents. Treat your child with respect and expect the same in return." },
    { speaker: "Person A", message: "Do you think kids should have a say in family decisions?" },
    { speaker: "Person B", message: "Yes, when appropriate. It helps them feel valued and teaches decision-making skills." },
    { speaker: "Person A", message: "What’s the best way to handle bedtime struggles?" },
    { speaker: "Person B", message: "Establish a consistent bedtime routine and stick to it. Consistency is key." },
    { speaker: "Person A", message: "What about picky eaters?" },
    { speaker: "Person B", message: "Offer a variety of healthy options and don’t force them to eat. Keep mealtimes positive." },
    { speaker: "Person A", message: "How do you introduce new foods to kids?" },
    { speaker: "Person B", message: "Start with small portions and make it fun. It can take multiple tries before they accept a new food." },
    { speaker: "Person A", message: "Do you think rewards should include food?" },
    { speaker: "Person B", message: "Not often. Using food as a reward can create unhealthy relationships with eating." },
    { speaker: "Person A", message: "What’s a good way to teach gratitude?" },
    { speaker: "Person B", message: "Model gratitude yourself. Encourage them to say thank you and appreciate the small things." },
    { speaker: "Person A", message: "How do you prepare kids for school?" },
    { speaker: "Person B", message: "Read to them, establish routines, and help them develop social skills." },
    { speaker: "Person A", message: "What about bullying? How do you handle that?" },
    { speaker: "Person B", message: "Teach them to stand up for themselves and involve teachers or counselors if necessary." },
    { speaker: "Person A", message: "How do you teach financial literacy?" },
    { speaker: "Person B", message: "Start with small lessons, like saving allowance or understanding needs versus wants." },
    { speaker: "Person A", message: "What’s a good way to encourage reading?" },
    { speaker: "Person B", message: "Make books accessible and read with them daily. Show enthusiasm for stories." },
    { speaker: "Person A", message: "How do you help kids handle failure?" },
    { speaker: "Person B", message: "Reassure them that failure is part of learning and encourage them to try again." },
    { speaker: "Person A", message: "What’s a good way to introduce teamwork?" },
    { speaker: "Person B", message: "Group activities, like sports or collaborative games, help kids learn to work together." },
    { speaker: "Person A", message: "How do you teach kids to respect the environment?" },
    { speaker: "Person B", message: "Lead by example. Recycle, reduce waste, and involve them in activities like planting trees." },
    { speaker: "Person A", message: "Do you think kids should have chores?" },
    { speaker: "Person B", message: "Yes, it teaches responsibility and helps them feel like a contributing member of the family." },
    { speaker: "Person A", message: "What’s the best way to teach kindness?" },
    { speaker: "Person B", message: "Show kindness in your actions and encourage them to think about how their actions affect others." },
    { speaker: "Person A", message: "How do you encourage independence?" },
    { speaker: "Person B", message: "Allow them to make choices and solve problems on their own, with guidance if needed." },
    { speaker: "Person A", message: "What’s a good way to handle peer pressure?" },
    { speaker: "Person B", message: "Teach them to think critically and remind them it’s okay to say no." },
    { speaker: "Person A", message: "How do you ensure they have good self-esteem?" },
    { speaker: "Person B", message: "Praise their efforts, not just outcomes, and support their interests." },
    { speaker: "Person A", message: "What do you think about allowance?" },
    { speaker: "Person B", message: "It’s a great way to teach money management if it’s tied to responsibilities." },
    { speaker: "Person A", message: "How do you teach kids to share?" },
    { speaker: "Person B", message: "Model sharing and praise them when they share with others." },
    { speaker: "Person A", message: "What about screen addiction?" },
    { speaker: "Person B", message: "Set clear boundaries for screen time and encourage offline activities." },
    { speaker: "Person A", message: "How do you help kids cope with stress?" },
    { speaker: "Person B", message: "Teach them relaxation techniques like deep breathing and encourage open communication." },
    { speaker: "Person A", message: "What’s a good way to teach honesty?" },
    { speaker: "Person B", message: "Be honest with them and explain why telling the truth is important." },
    { speaker: "Person A", message: "How do you prepare kids for change?" },
    { speaker: "Person B", message: "Talk to them about what to expect and reassure them that change can be positive." },
    { speaker: "Person A", message: "What about teaching respect for diversity?" },
    { speaker: "Person B", message: "Expose them to different cultures and teach them to appreciate differences." },
    { speaker: "Person A", message: "How do you handle a defiant child?" },
    { speaker: "Person B", message: "Stay calm, listen to their concerns, and set clear, consistent expectations." },
    { speaker: "Person A", message: "What’s the best way to teach time management?" },
    { speaker: "Person B", message: "Use tools like schedules and timers to help them understand how to manage their day." },
    { speaker: "Person A", message: "How do you teach kids about gratitude?" },
    { speaker: "Person B", message: "Encourage them to say thank you and reflect on the good things in their life." },
    { speaker: "Person A", message: "What about teaching generosity?" },
    { speaker: "Person B", message: "Involve them in acts of giving, like donating toys or helping others." },
    { speaker: "Person A", message: "How do you build trust with a child?" },
    { speaker: "Person B", message: "Be consistent, keep your promises, and listen to them without judgment." },
    { speaker: "Person A", message: "What’s a good way to teach self-discipline?" },
    { speaker: "Person B", message: "Help them set goals and show them how to work toward them step by step." },
    { speaker: "Person A", message: "How do you encourage a love for learning?" },
    { speaker: "Person B", message: "Make learning fun and connect it to their interests." },
    { speaker: "Person A", message: "What’s the best way to teach conflict resolution?" },
    { speaker: "Person B", message: "Teach them to express their feelings calmly and listen to the other person’s perspective." },
    { speaker: "Person A", message: "How do you nurture a child’s curiosity?" },
    { speaker: "Person B", message: "Encourage them to ask questions and explore the world around them." },
    { speaker: "Person A", message: "What about building resilience?" },
    { speaker: "Person B", message: "Support them through challenges and teach them to view setbacks as opportunities to grow." }
];


class MockDB {
    constructor() { }

    async getMessages(limit = 10, page = 1): Promise<Message[] | []> {
        return new Promise((res) => {
            console.log("%cMockDB: getting messages", "background-color: green; color: white; padding: 4px;")

            setTimeout(() => {
                const offset = getOffset(limit, page)
                // For testing --> Add indexes to conversations
                const messages = conversation
                    .slice(offset, offset + limit)
                    .map((message, index) => {
                        return {
                            ...message,
                            offset: offset + index,
                        }
                    })

                res(messages)
            }, 500)
        })
    }

    async initDB(): Promise<MockDB> {
        return new Promise((res) => {
            setTimeout(() => {
                console.log("DB connected")
                res(this)
            }, 1000)
        })
    }
}

export default MockDB
