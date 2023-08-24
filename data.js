var data = {
    quest1: { x: 0, y: 0, size: 1, title: "Mining Basics", subtitle: "subtitle", description: "" },

    // Power Branch
    quest2: { x: 1, y: -1, size: 1, requires: ['quest1'], title: "Coal Generator", subtitle: "subtitle", description: "" },
    quest3: { x: 2, y: -2, size: 1, requires: ['quest2'], title: "Solar Panel", subtitle: "subtitle", description: "" },
    quest4: { x: 3, y: -2, size: 1, requires: ['quest3'], title: "Battery", subtitle: "subtitle", description: "" },
    quest5: { x: 4, y: -2, size: 1, requires: ['quest4'], title: "Wind Turbine", subtitle: "subtitle", description: "" },

    // Machine Branch
    quest6: { x: 1, y: 1, size: 1, requires: ['quest1'], title: "Machine Chassis", subtitle: "subtitle", description: "" },
    quest7: { x: 2, y: 2, size: 1, requires: ['quest6'], title: "Electric Furnace", subtitle: "subtitle", description: "" },
    quest8: { x: 3, y: 3, size: 1, requires: ['quest7'], title: "Assembler", subtitle: "subtitle", description: "" },
    quest9: { x: 4, y: 3, size: 1, requires: ['quest8'], title: "3D Printer", subtitle: "subtitle", description: "" },

    // Automation Branch
    quest10: { x: 5, y: 1, size: 1, requires: ['quest5', 'quest9'], title: "Robot Arm", subtitle: "subtitle", description: "" },
    quest11: { x: 6, y: 1, size: 1, requires: ['quest10'], title: "Fluid Pump", subtitle: "subtitle", description: "" },
    quest12: { x: 7, y: 2, size: 1, requires: ['quest11'], title: "Miner", subtitle: "subtitle", description: "" },
    quest13: { x: 8, y: 2, size: 1, requires: ['quest12'], title: "Conveyor Belt", subtitle: "subtitle", description: "" },

    // Exploration Branch
    quest14: { x: 3, y: 0, size: 1, requires: ['quest1'], title: "Jetpack", subtitle: "subtitle", description: "" },
    quest15: { x: 4, y: 0, size: 1, requires: ['quest14'], title: "Glider", subtitle: "subtitle", description: "" },
    quest16: { x: 5, y: -1, size: 1, requires: ['quest15'], title: "Underwater Gear", subtitle: "subtitle", description: "" },
    quest17: { x: 6, y: -2, size: 1, requires: ['quest16'], title: "Space Suit", subtitle: "subtitle", description: "" },

    // Advanced Tech
    quest18: { x: 9, y: 3, size: 1, requires: ['quest9'], title: "Quantum Processor", subtitle: "subtitle", description: "" },
    quest19: { x: 10, y: 4, size: 1, requires: ['quest18'], title: "Dimensional Warp", subtitle: "subtitle", description: "" },
    quest20: { x: 11, y: 4, size: 1, requires: ['quest19'], title: "Nano Fabricator", subtitle: "subtitle", description: "" },

    // Advanced Power
    quest21: { x: 6, y: -3, size: 1, requires: ['quest5'], title: "Nuclear Reactor", subtitle: "subtitle", description: "" },
    quest22: { x: 7, y: -4, size: 1, requires: ['quest21'], title: "Fusion Cell", subtitle: "subtitle", description: "" },

    // Bridge quests between branches
    quest23: { x: 8, y: 0, size: 1, requires: ['quest13', 'quest17'], title: "Material Analyzer", subtitle: "subtitle", description: "" },
    quest24: { x: 9, y: 1, size: 1, requires: ['quest23'], title: "Advanced Materials", subtitle: "subtitle", description: "" },
    quest25: { x: 10, y: 2, size: 1, requires: ['quest24', 'quest20'], title: "Elemental Synthesizer", subtitle: "subtitle", description: "" },

    // Endgame Tech
    quest26: { x: 9, y: -2, size: 1, requires: ['quest17', 'quest22'], title: "Space Rocket", subtitle: "subtitle", description: "" },
    quest27: { x: 10, y: -3, size: 1, requires: ['quest26'], title: "Space Station", subtitle: "subtitle", description: "" },
    quest28: { x: 11, y: -4, size: 1, requires: ['quest27', 'quest22'], title: "Interstellar Travel", subtitle: "subtitle", description: "" },
    
    // Rare Resources
    quest29: { x: 12, y: 3, size: 1, requires: ['quest20'], title: "Gem Extraction", subtitle: "subtitle", description: "" },
    quest30: { x: 13, y: 2, size: 1, requires: ['quest29'], title: "Elemental Infusion", subtitle: "subtitle", description: "" },

    // The Final Quests
    quest31: { x: 12, y: 0, size: 2, requires: ['quest28', 'quest30', 'quest25'], title: "Universal Core", subtitle: "subtitle", description: "" },
    quest32: { x: 13, y: -1, size: 2, requires: ['quest31', 'quest28'], title: "Galactic Nexus", subtitle: "subtitle", description: "" },

    // Bonus Quests (hidden branches?)
    // Quantum Mechanics
    quest33: { x: 14, y: 1, size: 1, requires: ['quest32', 'quest20'], title: "Quantum Field Generator", subtitle: "subtitle", description: "" },
    quest34: { x: 15, y: 0, size: 1, requires: ['quest33'], title: "Particle Accelerator", subtitle: "subtitle", description: "" },
    quest35: { x: 15, y: 2, size: 1, requires: ['quest33'], title: "Wave Function Stabilizer", subtitle: "subtitle", description: "" },

    // Deep Earth Mining
    quest36: { x: 14, y: -2, size: 1, requires: ['quest32'], title: "Magma Extractor", subtitle: "subtitle", description: "" },
    quest37: { x: 15, y: -3, size: 1, requires: ['quest36'], title: "Diamond Drill", subtitle: "subtitle", description: "" },
    quest38: { x: 16, y: -2, size: 1, requires: ['quest37'], title: "Rare Earth Refinery", subtitle: "subtitle", description: "" },

    // Cosmic Energy
    quest39: { x: 17, y: 0, size: 1, requires: ['quest34', 'quest35'], title: "Dark Energy Battery", subtitle: "subtitle", description: "" },
    quest40: { x: 18, y: 1, size: 1, requires: ['quest39'], title: "Neutron Collector", subtitle: "subtitle", description: "" },
    quest41: { x: 18, y: -1, size: 1, requires: ['quest39'], title: "Cosmic Ray Trap", subtitle: "subtitle", description: "" },

    // Organic Technology
    quest42: { x: 17, y: -4, size: 1, requires: ['quest38'], title: "Bio-engineering Lab", subtitle: "subtitle", description: "" },
    quest43: { x: 18, y: -5, size: 1, requires: ['quest42'], title: "Organic Circuitry", subtitle: "subtitle", description: "" },
    quest44: { x: 19, y: -4, size: 1, requires: ['quest43'], title: "Natural Power Generator", subtitle: "subtitle", description: "" },

    // Nexus Expansion
    quest45: { x: 19, y: -2, size: 1, requires: ['quest38', 'quest41'], title: "Nexus Amplifier", subtitle: "subtitle", description: "" },
    quest46: { x: 20, y: -1, size: 1, requires: ['quest45'], title: "Galactic Beacon", subtitle: "subtitle", description: "" },

    // Universal Secrets
    quest47: { x: 21, y: 0, size: 1, requires: ['quest40', 'quest44'], title: "Secrets of the Universe", subtitle: "subtitle", description: "" },
    quest48: { x: 22, y: -1, size: 1, requires: ['quest47'], title: "Dimensional Fold", subtitle: "subtitle", description: "" },
    quest49: { x: 22, y: 1, size: 1, requires: ['quest47'], title: "Timeless Manipulator", subtitle: "subtitle", description: "" },

    // The Ultimate Endeavor
    quest50: { x: 23, y: 0, size: 2, requires: ['quest32', 'quest46', 'quest48', 'quest49'], title: "Mastery of Time & Space", subtitle: "subtitle", description: "" }
};

for (let key in data) {
    const item = data[key];
    if (item.requires) {
        // Initialize unlocked to true and then set it to false if any required quest is not completed
        item.unlocked = true;
        for (const req of item.requires) {
            if (!data[req].completed) {
                item.unlocked = false;
                break;
            }
        }
    } else {
        item.unlocked = true; // If there are no requirements, it's unlocked by default
    }

    item.completed = false; // Default to not completed for all quests
}