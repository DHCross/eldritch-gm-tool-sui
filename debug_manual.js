const cpRemaining = 2;

const purchasableAdvantages = [
  { name: 'Animal Affinity', cost: 2 },
  { name: 'Arcane Inheritance', cost: 4 },
  { name: 'Attractiveness', cost: 2 }
];

const purchasedAdvantagesList = [];
const selectableDefaultAdvantages = [];

purchasableAdvantages
  .filter(adv => !selectableDefaultAdvantages.some(d => d.toLowerCase() === adv.name.toLowerCase()))
  .forEach(adv => {
    const alreadyPurchased = purchasedAdvantagesList.some(a => a.name === adv.name);
    const canAfford = adv.cost <= cpRemaining || alreadyPurchased;
    console.log(adv.name, canAfford);
  });
