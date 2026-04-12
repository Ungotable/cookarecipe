let recipes = [];
let ingredientsSet = new Set();
let selectedPantryItems = new Set(); // Global state to track checks

const searchInput = document.getElementById('searchInput');
const pantrySearch = document.getElementById('pantrySearch');
const searchByName = document.getElementById('searchByName');
const searchByIngredient = document.getElementById('searchByIngredient');
const recipeContainer = document.getElementById('recipeContainer');
const ingredientsList = document.getElementById('ingredientsList');
const countDisplay = document.getElementById('recipeCount');

async function init() {
    try {
        const res = await fetch('https://raw.githubusercontent.com/Ungotable/cookarecipe/refs/heads/main/Recipes.json');
        const data = await res.json();
        
        recipes = Object.values(data).flat();
        
        // Extract ingredients
        recipes.forEach(r => {
            if(r.ingredients) {
                r.ingredients.forEach(ing => ingredientsSet.add(ing));
            }
        });

        renderPantry();
        updateDisplay();
    } catch (err) {
        console.error("Fetch error:", err);
        recipeContainer.innerHTML = `<p>Error loading recipes. Check connection.</p>`;
    }
}

function renderPantry() {
    const filter = pantrySearch ? pantrySearch.value.toLowerCase() : "";
    ingredientsList.innerHTML = "";
    
    const sortedIngs = [...ingredientsSet].sort();
    
    sortedIngs.forEach(ing => {
        if (ing.toLowerCase().includes(filter)) {
            const label = document.createElement('label');
            label.className = "custom-checkbox";
            const isChecked = selectedPantryItems.has(ing);
            
            label.innerHTML = `
                <input type="checkbox" value="${ing}" ${isChecked ? 'checked' : ''}>
                <span>${ing}</span>
            `;

            // CRITICAL: Handle the check state
            label.querySelector('input').addEventListener('change', (e) => {
                if (e.target.checked) {
                    selectedPantryItems.add(ing);
                } else {
                    selectedPantryItems.delete(ing);
                }
                updateDisplay();
            });

            ingredientsList.appendChild(label);
        }
    });
}

function updateDisplay() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedArray = Array.from(selectedPantryItems);
    
    // Get mode safely
    const modeEl = document.querySelector('input[name="pantryMode"]:checked');
    const mode = modeEl ? modeEl.value : 'any';

    const filtered = recipes.filter(recipe => {
        // 1. Text Search
        const matchesName = searchByName.checked && recipe.name.toLowerCase().includes(searchTerm);
        const matchesIngText = searchByIngredient.checked && recipe.ingredients.some(i => i.toLowerCase().includes(searchTerm));
        const textPass = !searchTerm || matchesName || matchesIngText;

        // 2. Strict Pantry Logic
        let pantryPass = true;
        if (mode === 'full') {
            if (selectedArray.length === 0) {
                pantryPass = false; // Can't cook anything with 0 items
            } else {
                // MUST have every ingredient in the recipe
                pantryPass = recipe.ingredients.every(ing => selectedArray.includes(ing));
            }
        } else {
            // "Any" Mode
            if (selectedArray.length > 0) {
                pantryPass = recipe.ingredients.some(ing => selectedArray.includes(ing));
            }
        }

        return textPass && pantryPass;
    });

    renderCards(filtered, selectedArray);
}

function renderCards(data, selected) {
    recipeContainer.innerHTML = "";
    countDisplay.textContent = data.length;

    if (data.length === 0) {
        recipeContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #94a3b8;">No recipes found. Try checking more ingredients!</p>`;
        return;
    }

    data.forEach(recipe => {
        const card = document.createElement('div');
        card.className = "recipe-card";
        const stars = "★".repeat(recipe.rarity || 1);
        card.innerHTML = `
            <div class="rarity">${stars}</div>
            <h3>${recipe.name}</h3>
            <ul class="ingredients-list">
                ${recipe.ingredients.map(ing => {
                    const hasIt = selected.includes(ing);
                    return `<li class="${hasIt ? 'has-it' : ''}">${hasIt ? '✓' : '•'} ${ing}</li>`;
                }).join('')}
            </ul>
            <div class="price">$${recipe.money.toLocaleString()}</div>
        `;
        recipeContainer.appendChild(card);
    });
}

function clearChecks() {
    selectedPantryItems.clear();
    renderPantry();
    updateDisplay();
}

// Event Listeners
if(searchInput) searchInput.addEventListener('input', updateDisplay);
if(pantrySearch) pantrySearch.addEventListener('input', renderPantry);
if(searchByName) searchByName.addEventListener('change', updateDisplay);
if(searchByIngredient) searchByIngredient.addEventListener('change', updateDisplay);

// Start
init();
