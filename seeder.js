const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Disease = require('./models/Disease');
const LearningCategory = require('./models/LearningCategory');

const User = require('./models/User');

dotenv.config();
connectDB();

const testUsers = [
    {
        name: "Test User 1",
        email: "test@orcare.app",
        password: "password123",
        age: 25,
        gender: "Male",
        isEmailVerified: true
    },
    {
        name: "ORCare Admin",
        email: "user@orcare.app",
        password: "password123",
        age: 30,
        gender: "Female",
        isEmailVerified: true
    }
];

const diseases = [
    {
        id: "gingivitis",
        name: "Gingivitis",
        iconName: "Bloodtype",
        colorHex: "#FEF3C7", // MintLight
        whatIsHappening: "Gingivitis is the earliest and only truly reversible stage of gum disease...",
        whatPeopleNotice: "The most common signs are gums that look red and puffy...",
        whyItHappens: "The primary cause is poor oral hygiene leading to plaque buildup...",
        whyNotIgnore: "While gingivitis is reversible, ignoring it allows the infection to spread below the gumline...",
        whenToSeeDentist: "Schedule a visit if you notice your gums bleeding during routine cleaning..."
    },
    {
        id: "cavities",
        name: "Cavities (Tooth Decay)",
        iconName: "Warning",
        colorHex: "#E2E8F0", // IndigoLight
        whatIsHappening: "Tooth decay is a process where the hard mineral structure of the tooth (enamel) is destroyed over time...",
        whatPeopleNotice: "In the early stages, you might see white spots on the teeth...",
        whyItHappens: "It's a combination of factors: bacteria in your mouth feed on dietary sugars...",
        whyNotIgnore: "Decay never stops on its own. Once it reaches the dentin, it spreads much faster...",
        whenToSeeDentist: "See a dentist immediately if you have a lingering toothache, sharp sensitivity..."
    },
    {
        id: "bad_breath",
        name: "Bad Breath (Halitosis)",
        iconName: "Air",
        colorHex: "#FEF3C7",
        whatIsHappening: "Chronic bad breath is typically caused by the breakdown of proteins by anaerobic bacteria...",
        whatPeopleNotice: "A persistent unpleasant taste, a thick white or yellowish coating on the back of the tongue...",
        whyItHappens: "Poor hygiene is the main culprit, but dry mouth is a major contributor...",
        whyNotIgnore: "While often seen as a social issue, persistent halitosis is a major warning sign...",
        whenToSeeDentist: "If bad breath remains a problem even after you've improved your habit..."
    },
    {
        id: "oral_cancer",
        name: "Oral Cancer",
        iconName: "Coronavirus",
        colorHex: "#E2E8F0",
        whatIsHappening: "Oral cancer is the result of abnormal cell growth in the mouth or throat...",
        whatPeopleNotice: "Look for a sore or ulcer that does not heal within 14 days...",
        whyItHappens: "The highest risk factors are tobacco use and excessive alcohol consumption...",
        whyNotIgnore: "Oral cancer is highly treatable if caught early...",
        whenToSeeDentist: "Any sore, lump, or patch in the mouth that persists for more than two weeks REQUIRES an examination..."
    },
    {
        id: "sensitivity",
        name: "Tooth Sensitivity",
        iconName: "Bolt",
        colorHex: "#FEF3C7",
        whatIsHappening: "This occurs when the protective enamel on the tooth's crown or the cementum wears away...",
        whatPeopleNotice: "A sudden, sharp flash of pain or deep ache when teeth are exposed to cold air...",
        whyItHappens: "Aggressive brushing, gum recession, teeth grinding, and acidic food consumption...",
        whyNotIgnore: "Sensitivity often masks other problems like cracked teeth or deep cavities...",
        whenToSeeDentist: "If the sensitivity is severe, happens in a specific tooth, or doesn't improve..."
    },
    {
        id: "mouth_ulcers",
        name: "Mouth Ulcers (Canker Sores)",
        iconName: "Whatshot",
        colorHex: "#E2E8F0",
        whatIsHappening: "These are small, shallow lesions that develop on the soft tissues in your mouth...",
        whatPeopleNotice: "Round or oval sores with a white or yellow center and a red border...",
        whyItHappens: "Triggers include minor injuries, stress, hormonal shifts, and allergic reactions...",
        whyNotIgnore: "While self-healing, frequent outbreaks are a signal that your body is missing nutrients...",
        whenToSeeDentist: "Seek care for unusually large sores or those accompanied by fever..."
    }
];

const categories = [
    {
        id: "daily_hygiene",
        title: "1. Daily Oral Hygiene",
        iconName: "CleaningServices",
        colorHex: "#3B82F6",
        modules: [
            {
                id: "hygiene_practices",
                title: "Daily Practices",
                duration: "5 min",
                lessonCount: 6,
                objective: "What everyone should do every day to prevent problems.",
                iconName: "Schedule",
                lessons: [
                    { id: 1, title: "What is Daily Hygiene?", content: "Daily oral hygiene is the proactive habit...", iconName: "Info" },
                    { id: 2, title: "The Golden Rules", content: "The foundation of a healthy mouth...", iconName: "List" }
                ],
                quiz: [
                    { id: 1, question: "Why is saliva so important for your teeth?", options: ["It makes teeth white", "It neutralizes acids and remineralizes enamel", "It tastes good", "It hardens the gums"], correctAnswerIndex: 1 }
                ]
            }
        ]
    }
];

const importData = async () => {
    try {
        await Disease.deleteMany();
        await LearningCategory.deleteMany();
        await User.deleteMany({ email: { $in: testUsers.map(u => u.email) } });

        await Disease.insertMany(diseases);
        await LearningCategory.insertMany(categories);
        
        // Use create instead of insertMany to trigger password hashing middleware
        for (const user of testUsers) {
            await User.create(user);
        }

        console.log('Data Imported Successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

importData();
