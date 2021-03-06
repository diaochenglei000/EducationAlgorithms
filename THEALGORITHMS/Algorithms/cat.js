/*
Computerized Algorithimic Testing
-----------------------------------
cat.js
@author Owen Chen

Generalized Algorithm where developer provides a test bank. Maybe json file

inputs: Test bank, json file with card data
	Card attributes:
		- difficulty
		- subject/section
		- Answer

Example: 10 Items, 1 Parameter
		2 Examinees
		Test Length: 5		

	
Algorithm

On startup:
Take two random items and set initial child ability to be the average of the two. 

1. Request next candidate. Set D=0, L=0, H=0, and R=0. 
	D = Item difficulty. L = items taken. H = difficultiesTotal R= response score
2. Find next item near difficulty, D.
	Search in item bank for closest item near D
3. Set D at the actual calibration of that item.
	Set d = that item. 
1. Administer that item.
	Prompt that question
2. Obtain a response.
	Get a response from user
3. Score that response.
	Score the response
4. Counttheitemstaken:L=L+1
	Global variable L. 
5. Add the difficulties used: H = H + D
	Global variable totalDifficulties
6. If response incorrect, update item difficulty: D = D - 2/L
7. If response correct, update item difficulty: D = D + 2/L
8. If response correct, count right answers: R = R + 1
9. If not ready to decide to pass/fail, Go to step 2.
10. If ready to decide pass/fail, calculate wrong answers: W = L - R
11. Estimate measure: B = H/L + log(R/W)
12. Estimate standard error of the measure: S = [L/(R*W)]
13. Compare B with pass/fail standard T.
14. If(T-S)<B<(T+S),gotostep2.
15. If(B-S)>T,thenpass.
16. If(B+S)<T,thenfail.



IRT Rasch Model is the 1 parameter model. It is measured in logits.

Scale item difficulties from 1-100 down to -3 to 3 logits in float for the Rasch model. Use Logits for unit measurements. 
Logits = log( Probability of success / probability of failure) =  ability - difficulty

When child ability and item difficulty are the same, then the learner has a 50% probability of getting the correct answer. 
Log-odds model = RaschModel / (1 - raschModel). 



 
References:
- Computer-Adaptive Testing:
A Methodology Whose Time Has Come.

*/

var fs = require('fs');
var readline = require('readline');
var readlineSync = require('readline-sync');
// var itemResponse = require('/itemResponse');


//JSON card bank

//Variables
// D = difficulty
// L = items taken
// H = Difficulties used
// R = Right answers 

var D = 0,
	L = 0,
	H = 0,
	R = 0,
	testStandard = 0, //Pass/Fail Standard
	tLength = 0;


var student = {
	name: "Owen",
	ability: 18,
}; //Student Object
var item = "";

var testLength = 5; //Test length
// var itemBank = []; // Item Bank to choose from
// var candidateBank = []; //student Test bank

// Dummy Data =====================================================
var itemBank = [ 
	{
		question: "test1",
		answer: "1",
		difficulty: 22
	},
	{
		question: "test3",
		answer: "1",		
		difficulty: 21
	},
	{
	  	question: "test4: This is a question",
	  	answer: "1",		
	  	difficulty: 20
	},		
	{
	  	question: "test5: This is a question",
	  	answer: "1",		
	  	difficulty: 19
	},	

	{
	  	question: "test7: This is a question",
	  	answer: "1",		
	  	difficulty: 18
	},	
	{
	  	question: "test8: This is a question",
	  	answer: "1",		
	  	difficulty: 17
	},	

	{
		question: "test2",
		answer: "1",	
		difficulty: 16
	}
]; // Item Bank to choose from

var candidateBank = [
	{
		name: "Owen",
		ability: 18
	},

	{
	 	name: "Chris",
	 	ability: 15
	}	

]; //student Test bank

// Dummy Data ====================================================================




/**
@Item properties:
Json
{
	question: "String",
	difficulty: Integer,
}

**/




/**
@setInitialAbility
@param curCandidate, itemBank

Take two random items in item bank, average the difficulties.
Set the curCandidate's ability to that average. 

================================================================

**/


/**
Request next candidate
-----
Initialize variables of that user to 0
From test bank, find next item closest to the difficulty D.

Set user's D to the actual D value of that item.
@param User
**/

var newCandidate = function(){

	//Resetting

    D = 0;
	L = 0;
	H = 0;
	R = 0;	

	var nextCandidate = candidateBank[0];
	
	D = nextCandidate.ability
	testStandard = 5; // Initializing testStandard
	tLength = testLength;

	begin(nextCandidate);
}

var begin = function(nextCandidate){
	// St 1) Prompt for next candidate 

	// St 2) Find closest difficulty
	var closestItem = findItemInBank(D);
	// St 3) Set D at the actual calibration of that item
	D = closestItem.difficulty;
	console.log(D);

	// St 4-5) Administer the Item. Continue steps in here
	var response = administerItem(closestItem);
	// console.log(response);

	// St 6) Score this response. 1 = right, 0 - wrong.
	
	//======== ADDING IN IRT PROBABILITY

	var IRTProbability = raschModel(D, nextCandidate.ability);
	console.log("item difficulty" + D + "candidate ability " + nextCandidate.ability);
	console.log("Probability " + IRTProbability);

	//======== ADDING IN IRT PROBABILITY
	
	var score = scoreResponse(response, closestItem);
	console.log(score);

	// St 7) Total items taken
	L += 1;

	// St 8) Add total difficulties used
	H = H + D;


	// St 9) If response incorrect, D = D - 2/L
	if (score == 0){
		console.log(D + "\n Before");
		D = D - 2 / L;
		console.log(D);
	}

	// St 10-11) If response is correct, D = D + 2/L
	if (score == 1){
		console.log("Correct ");
		D = D + 2/L;
		R += 1; // Update right count
	}

	// St 12) If not ready to decide to pass fail, repeat
	if (tLength > 0){
		console.log("Haven't finished testing yet");
		tLength -= 1;
		console.log(tLength + " more questions to go");

		begin(nextCandidate);
	}

	// St 13) If ready, calcualte wrong answers 
	if (tLength <= 0){
		console.log("Ready to score pass or fail");

		var W = L - R; //Caculate wrong answers
		
		

		// St 14) Estimate measure
		// Compare measure variable to standard. Measure = H/L + log(R/W)


		//Check if a variable is zero and set Measure. Cant log(0)
		if (L == 0 || R == 0){
			var measure = H/L;
		}
		else {
			var measure = H/L + Math.log(R/W);
		}


		// St 15) Estimate standard error of the mesaure
		var standardError = (L/(R*W));

		console.log(" Measure is " + measure  );
		console.log(" StandardError is " + standardError );

		// St 16) Compare (measure) with pass/fail standard standardError. Assess

		//Is the estimate standard error small enough to stop the test?

		if ((measure - standardError) > testStandard){
			console.log("Passed the testStandard");
		}

		else if ((measure + standardError) < testStandard){
		 	console.log("Failed the testStandard");
		}	

		console.log("Final ability level of the child is " + measure);
		//Check for standard Error.

		// else if ((testStandard - standardError) < measure < (testStandard + standardError)){
		//	console.log("Repeat Step 2");
		// }
	
		
	}
	


};



/**
@findItemInBank
@param D = target difficulty
Returns the item with the closest difficulty as the passed in parameter D.
**/

var findItemInBank = function(D){
	minVal = 999;
	minItem = "";
	// console.log(" the D value is " + D);

	for (item in itemBank){
		var difference = Math.abs(D - itemBank[item].difficulty)
		// console.log("The difference is " + difference);
		if (difference < minVal){
			minVal = difference;
			minItem = itemBank[item];
		}
	}

	return minItem
}

/**
@administerItem
@param item -> dictionary of question and difficulty

Gives the user the question, recieves a response.
**/

var administerItem = function(item){
	var question = item.question;
	return getUserPrompt(question); //Asynchronous call

}

/**
@getUserPrompt
@param question

Prompts the user with the question. Synchronous version with readlineSync
**/

var getUserPrompt = function(question){
	var answer = readlineSync.question(question + '\n' );
	console.log("Your answer is: \n");
	return answer;
}



/**
@scoreResponse
@params reply - Reply from command Line
			- Item - Current dictionary object with the item
Scores the response 
**/

var scoreResponse = function(response, item){
	console.log("Scoring response");
	if (response != item.answer){
		console.log("WRONG");
		return 0;
	}

	else {
		console.log("Correct");
		return 1;
	}
	
};



// IRT MODULE ===============================================================


/*
@raschModel
@params itemDifficulty latentAbility

Person parameter is latentAbility

Item Response Theory Model for each item. One Parameter Model, Rasch. P(theta) is assessment of a learners probability of attaining a correct
answer to this specific problem given an ability level. 

Rasch Model IMplementation
Equation => exp(theta - Bi) / 1 + exp(theta - Bi)

References:
Book Rasch Models


*/
	
var raschModel = function(itemDifficulty, latentAbility){

	//Scaling 
	theta = scaleDifficulty(latentAbility);
	b = scaleDifficulty(itemDifficulty);


	result = ( Math.exp(theta - b) / (1 + Math.exp(theta - b)) ) 
	return result;
}



/*
@logOddsModel
@param raschModel

Returns logit units to estimate learner probability
Equation: e ^ ( probability of success / probability of failure) => e ^ (raschModel) / (1 - raschModel)

*/

var logOddsModel = function(raschProbability){
	logit = Math.exp( raschProbability / (1 - raschProbability));

	return logit;
}


/*
@scaleDifficulty
@params value to convert, range1 [...], range2 [.....]

Scales item difficulty from 1-100 to -3 to 3 for raschModel.

*/

function scaleDifficulty( value) { 
	r1 = [1, 100];
	r2 = [-3, 3];
    return ( value - r1[ 0 ] ) * ( r2[ 1 ] - r2[ 0 ] ) / ( r1[ 1 ] - r1[ 0 ] ) + r2[ 0 ];
}



// ======================TEST CASES========================= //

// newCandidate();


console.log("Rasch model testing ~~~~ ");
console.log(raschModel(70, 25));
console.log(raschModel(92,98));
console.log(raschModel(24,62));


console.log("scaled difficulty " + scaleDifficulty(80));

console.log('Rasch model of 72 and 70 converted probability ' +  raschModel(scaleDifficulty(80), scaleDifficulty(61)));

console.log("Testing logits ~~~~ ");

console.log(logOddsModel(raschModel(80, 61)) + " logits ");





// findITEMINBANK Testing
// result = findItemInBank(23);
// console.log("Item difficulty closest to 23");
// console.log(result.difficulty);
// console.log(result.question);




