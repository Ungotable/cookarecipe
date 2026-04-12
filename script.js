let recipes = [];
let ingredientsSet = new Set();

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
        recipes.forEach(r => r.ingredients.forEach(i => ingredientsSet.add(i)));

        renderPantry();
        updateDisplay();
    } catch (err) {
        recipeContainer.innerHTML = `<p class="error">Failed to load recipe data.</p>`;
    }
}

function renderPantry() {
    const filter = pantrySearch.value.toLowerCase();
    ingredientsList.innerHTML = "";
    
    const sortedIngs = [...ingredientsSet].sort();
    
    sortedIngs.forEach(ing => 
        if (ing.toLowerCase().includes(filter)) {
            const label = document.createElement('label');
            label.className = "custom-checkbox";
            label.innerHTML = `
                <input type="checkbox" value="${ing}" class="pantry-item" onchange="updateDisplay()">
                <span class="checkmark"></span> ${ing}
            `;
            ingredientsList.appendChild(label);
        }
    });
}

function updateDisplay() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedIngs = Array.from(document.querySelectorAll('.pantry-item:checked')).map(i => i.value);

    const filtered = recipes.filter(recipe => {
        const matchesName = searchByName.checked && recipe.name.toLowerCase().includes(searchTerm);
        const matchesIngText = searchByIngredient.checked && recipe.ingredients.some(i => i.toLowerCase().includes(searchTerm));
        const textPass = !searchTerm || matchesName || matchesIngText;

        let pantryPass = true;
        if (selectedIngs.length > 0) {
            pantryPass = recipe.ingredients.some(ing => selectedIngs.includes(ing));
        }

        return textPass && pantryPass;
    });

    renderCards(filtered, selectedIngs);
}

function renderCards(data, selected) {
    recipeContainer.innerHTML = "";
    countDisplay.textContent = data.length;

    data.forEach(recipe => {
        const card = document.createElement('div');
        card.className = "recipe-card";
        const stars = "★".repeat(recipe.rarity);
        
        card.innerHTML = `
            <div class="rarity">${stars}</div>
            <h3>${recipe.name}</h3>
            <ul class="ingredients-list">
                ${recipe.ingredients.map(ing => `
                    <li class="${selected.includes(ing) ? 'has-it' : ''}">
                        ${selected.includes(ing) ? '✓ ' : '• '} ${ing}
                    </li>
                `).join('')}
            </ul>
            <div class="price">$${recipe.money.toLocaleString()}</div>
        `;
        recipeContainer.appendChild(card);
    });
}

function clearChecks() {
    document.querySelectorAll('.pantry-item').forEach(i => i.checked = false);
    updateDisplay();
}

// Listeners
searchInput.addEventListener('input', updateDisplay);
pantrySearch.addEventListener('input', renderPantry); 
searchByName.addEventListener('change', updateDisplay);
searchByIngredient.addEventListener('change', updateDisplay);

init();
