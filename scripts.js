document.getElementById('recommendationForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const gpa = parseFloat(document.getElementById('gpa').value);
    const sat = parseInt(document.getElementById('sat').value);
    const education = document.getElementById('education').value;
    
    const loadingDiv = document.getElementById('loading');
    const resultsDiv = document.getElementById('results');
    const errorDiv = document.getElementById('error');
    const universitiesList = document.getElementById('universitiesList');
    const initialMessage = document.getElementById('initial-message');
    
    // Input validation
    if (gpa < 0 || gpa > 4.0) {
        showError('GPA must be between 0 and 4.0');
        return;
    }
    
    if (sat < 400 || sat > 1600) {
        showError('SAT score must be between 400 and 1600');
        return;
    }

    try {
        // Show loading state
        loadingDiv.classList.remove('hidden');
        resultsDiv.classList.add('hidden');
        errorDiv.classList.add('hidden');
        initialMessage.classList.add('hidden');

        const response = await fetch('http://localhost:5000/recommend', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                grades: {
                    gpa: gpa,
                    sat: sat
                },
                education_background: education
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to get recommendations');
        }

        // Hide loading state
        loadingDiv.classList.add('hidden');

        // Display results
        universitiesList.innerHTML = '';
        if (!data.recommendations || data.recommendations.length === 0) {
            universitiesList.innerHTML = `
                <div class="p-4 bg-yellow-50 text-yellow-800 rounded-md">
                    No universities found matching your criteria. Try adjusting your GPA or SAT scores.
                </div>`;
        } else {
            data.recommendations.forEach(recommendation => {
                const div = document.createElement('div');
                div.className = 'p-4 bg-gray-50 rounded-md border border-gray-200 hover:shadow-md transition-shadow';
                div.innerHTML = `
                    <h3 class="font-semibold text-lg text-blue-600">${recommendation.university}</h3>
                    <div class="mt-2 space-y-1 text-gray-600">
                        <p class="flex justify-between">
                            <span class="font-medium">Program:</span> 
                            <span>${recommendation.program}</span>
                        </p>
                        <p class="flex justify-between">
                            <span class="font-medium">Required GPA:</span>
                            <span>${recommendation.gpa_requirement}</span>
                        </p>
                        <p class="flex justify-between">
                            <span class="font-medium">Required SAT:</span>
                            <span>${recommendation.sat_requirement}</span>
                        </p>
                    </div>
                `;
                universitiesList.appendChild(div);
            });
        }
        
        resultsDiv.classList.remove('hidden');

    } catch (error) {
        console.error('Error:', error);
        showError(error.message);
    } finally {
        loadingDiv.classList.add('hidden');
    }
});

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    document.getElementById('results').classList.add('hidden');
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('initial-message').classList.add('hidden');
}