function RegExpTester(){
	

	this.signRange = {
		asciiBeginning: 97,
		asciiEnding: 122
	};

	this.settings = {
		stringLengthBeginning: 100000,
		stringLengthEnding: 1000000,
		stringLengthIncrement: 100000,
		numberOfTests: 40
	};

	this.randomCharacter = function() {
		return String.fromCharCode(parseInt(Math.random()*1000)%(this.signRange.asciiEnding - this.signRange.asciiBeginning)+this.signRange.asciiBeginning);
	};

	this.generateText = function(length) {
		var res = "";
		for (var i=0, len = length; i < len; i++)
			res += this.randomCharacter();

		return res;
	};

	this.generatePatterns = function() {
		this.patterns = [];
		for (var i=0; i < this.settings.numberOfTests; i++) {
			var patternText = this.generateText(Math.random()*100000);
			var reg = new RegExp(patternText);
			this.patterns.push(reg);
		}
	}

	
	this.result = {};
	this.patterns = [];

	this.test = function() {
		this.generatePatterns();
		for (var lengthOfString=this.settings.stringLengthBeginning, maximumLengthOfString=this.settings.stringLengthEnding;
				 lengthOfString <= maximumLengthOfString; lengthOfString += this.settings.stringLengthIncrement) {

			var miliseconds = 0;
			for (var actualNumberOfTest = 0, numberOfTests = this.settings.numberOfTests; actualNumberOfTest < numberOfTests; actualNumberOfTest++) {
				var text = this.generateText(lengthOfString);
				var actualTimestamp = Date.now();
				this.patterns[actualNumberOfTest].exec(text);
				miliseconds += Date.now() - actualTimestamp;
			}

			this.result[lengthOfString] = miliseconds/this.settings.numberOfTests;
			console.log(JSON.stringify(this.result));
		}
	}

	

};

var regexp = new RegExpTester();
regexp.test();