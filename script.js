let chemistryData = [];
// 2. LOAD DATA FROM data.json
fetch("data.json")
    .then(response => {
        // Check whether data.json can be loaded
        if (!response.ok) {
            throw new Error("Cannot load data.json");
        }
        return response.json();
    })
    .then(data => {
        // Store JSON data in chemistryData
        chemistryData = data;
        console.log(
            "Chemistry data loaded successfully:"
        );
        console.log(chemistryData);
    })
    .catch(error => {
        console.error(
            "Error loading Chemistry data:",
            error
        );
    });


// 3. SEND MESSAGE
function sendMessage() {
    // Get the input element
    const input = document.getElementById("userInput");
    // Get user's question
    const question = input.value.trim();
    // Do nothing if the input is empty
    if (question === "") {
        return;
    }
    // Get chat box
    const chatBox = document.getElementById("chatBox");


    // 3.1 DISPLAY USER QUESTION
    chatBox.innerHTML += `<div class="user-message"> 👤 ${question} </div>`;


    // 3.2 SEARCH FOR AN ANSWER
    const result = findBestAnswer(question);


    // 3.3 DISPLAY BOT ANSWER
    if (result) {
        chatBox.innerHTML += `<div class="bot-message">🧪 ${result.answer}</div>`;


    }
    else {
        chatBox.innerHTML += `<div class="bot-message">
                🤖 Sorry, I don't know this Chemistry question yet. <br><br>
                Try another question or choose one of the suggested questions.
            </div>
        `;
    }


    // 3.4 CLEAR INPUT
    input.value = "";
    // Put cursor back into input
    input.focus();


    // 3.5 SCROLL TO THE BOTTOM
    chatBox.scrollTop = chatBox.scrollHeight;
}


// 4. FIND THE BEST ANSWER
function findBestAnswer(question) {
    // Convert user question to lowercase
    const userQuestion = question.toLowerCase();


    // 4.1 FIRST: EXACT QUESTION MATCH
    const exactMatch = chemistryData.find(item => item.question.toLowerCase() === userQuestion);


    // If exact question is found
    if (exactMatch) {
        return exactMatch;
    }


    // 4.2 SECOND: KEYWORD SEARCH
    let bestResult = null;
    let highestScore = 0;


    // Check every item in the knowledge base
    chemistryData.forEach(item => {
        let score = 0;
        // Check whether this item has keywords
        if (item.keywords) {
            item.keywords.forEach(keyword => {
                const keywordLower = keyword.toLowerCase();
                // Check whether the user's question contains this keyword
                if (
                    userQuestion.includes(
                        keywordLower
                    )
                ) {
                    score++;
                }
            });
        }


        // Add one more point if the topic appears
        if (item.topic && userQuestion.includes(item.topic.toLowerCase())) {
            score++;
        }


        // Keep the result with the highest score        
        if (score > highestScore) {
            highestScore = score;
            bestResult = item;
        }
    });
    // Return the best result
    return bestResult;
}


// 5. ASK A SUGGESTED QUESTION
function askQuestion(question) {
    // Put the selected question into the input box
    document.getElementById("userInput").value = question;
    // Send the question
    sendMessage();
}


// 6. RANDOM CHEMISTRY QUESTION
function randomQuestion() {
    // Check whether data is available
    if (chemistryData.length === 0) {
        alert(
            "Chemistry data is not loaded yet."
        );
        return;
    }
    // Generate a random index
    const randomIndex = Math.floor( Math.random() * chemistryData.length);
    // Get a random question
    const randomItem = chemistryData[randomIndex];
    // Put question into input box
    document.getElementById("userInput").value = randomItem.question;
    // Send the question
    sendMessage();
}


// 7. PRESS ENTER TO SEND
document.getElementById("userInput").addEventListener("keydown",
        function (event) {
            // Check whether user pressed Enter
            if (event.key === "Enter") {
                sendMessage();
            }
        }
    );


// 8. SHOW DATA INFORMATION
function showDataInfo() {
    console.log(
        "Number of Chemistry questions:",
        chemistryData.length
    );
}
