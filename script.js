// script.js

const data = {
  // your given data structure here
};

const container = document.getElementById("grid-container");
const quests = data.quests;

quests.forEach(quest => {
  const questElement = document.createElement("div");
  questElement.className = "quest";

  // Calculate position based on x and y values
  const x = (quest.x + 0.5) * container.offsetWidth;
  const y = (quest.y + 0.5) * container.offsetHeight;

  questElement.style.left = `${x}px`;
  questElement.style.top = `${y}px`;

  container.appendChild(questElement);
});
