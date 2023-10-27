/*
 * CS360 Group Project
 * @author: Kerry Wang, Jayden Fedoroff, Ryan Crist, Kien Tran
 * @date:   October 27, 2023
 * @desc:  This file contains the code for the colorblind extension.
 */

function createTypeButton(typeName) {
	return `<button type="button" class="versionButton">${typeName}</button>`;
}

function createButtonWithFunction(buttonName, func) {
	return `<button type="button" class="versionButton" func="${func.name}">${buttonName}</button>`;
}

function createRGBSlider(colorValue) {
	return `
	<input type="range" min="0" max="255" value = "0" class="rbgslider" id="${colorValue}">
	<p style="color:black;"> ${colorValue} <span id="${colorValue}Value">0</span></p>
	`;
}

// Anything that appears between the curly braces will not be run until the whole web page has loaded
$(document).ready(function () {
	// -------------------------------------------------
	// ----------Image Filter Overall Function:---------
	// Overall Func 1: Loop through images to apply filter
	const loopThroughImgs = (filterName) => {
		const imageList = document.getElementsByTagName("img"); // get a list of images
		const imageListLength = imageList.length;

		// Create a list of different ids for multiple canvas creation according to the numbers of images on web page
		const nameID = "canvas";
		const nameIDList = [];
		for (let imgIndex = 0; imgIndex < imageListLength; imgIndex += 1) {
			nameIDList.push(`${nameID}${imgIndex}`);
		}
		for (let imgIndex = 0; imgIndex < imageListLength; imgIndex += 1) {
			console.log("Image index ", imgIndex); // testing
			thisNameID = nameIDList[imgIndex];
			applyFilterToImage(imgIndex, imageList, thisNameID, filterName);
		}
	};

	// Overall Func 2: Apply filter to one image
	const applyFilterToImage = (imgIndex, imageList, nameID, filterName) => {
		// 1 getting and setting up manipulable image from the image list
		// CITE: Mozilla
		// URL: https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image
		// HELP: We learned how to create an image type object in Javascript.
		let thisImage = new Image(); // this is the current image from the imageList
		thisImage = imageList[imgIndex]; // copy the image from webpage

		//let oriSourceImage = new Image() // this is the source image the web page use
		//oriSourceImage.src = thisImage.src;

		// CITE: matt burns (Stack Overflow)
		// URL: https://stackoverflow.com/questions/22097747/how-to-fix-getimagedata-error-the-canvas-has-been-tainted-by-cross-origin-data
		// HELP: We learned how to circumvent error caused by cross-origin-data.
		thisImage.crossOrigin = "Anonymous";

		// Getting image's left and top coords on webpage
		// CITE: W3 Schools
		// URL:
		// HELP: We learned how to get left, top attributes (coord) of contents
		// RETURN: a DOMRect object with 8 properties: left, top, right, bottom, x, y, width, height.
		//let imagePositionAttributes = thisImage.getBoundingClientRect();
		let topCoordImage = thisImage.offsetTop;
		let leftCoordImage = thisImage.offsetLeft;

		// 2. Append canvas to html
		// CITE: W3 Schools
		// URL: https://www.w3schools.com/html/html5_canvas.asp
		// HELP: We learned about how canvas allow us to manipulate image on others' webpage.
		let canvasImg = document.createElement("canvas");
		//canvasImg.style.display = 'none'; // if only get pixel to figure our color pallete then activate this, so canvas not display
		canvasImg.id = `${nameID}`;
		canvasImg.style.position = "absolute"; // position relative to document body
		canvasImg.style.top = topCoordImage + "px";
		canvasImg.style.left = leftCoordImage + "px";
		canvasImg.style.zIndex = "1000"; // high z-index so canvas can always stay on top of original image on web page

		document.body.append(canvasImg);

		// 3. Manipulate image
		// 3.1 setting up canvas
		// CITE: Mozilla
		// URL: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images
		// HELP: We learned how to use images on webpage on canvas.
		let thisCanvas = document.getElementById(`${nameID}`); // get access to the canvas we create
		let canvasContent = thisCanvas.getContext("2d");

		// 3.2 loading images to screen
		// Draw the image on the canvas
		// CITE: Adassko (Stack Overflow)
		// URL: https://stackoverflow.com/questions/19396390/load-image-from-javascript
		// We learned how to load image into html from Javascript.
		thisImage.onload = () => {
			console.log("canvas content: ", canvasContent); // testing
			console.log("this image info: ", thisImage); // testing
			console.log("image width after load: ", thisImage.width); // testing
			console.log("image height after load: ", thisImage.height); // testing

			// Setting canvas dimension to that of image
			thisCanvas.width = thisImage.width;
			thisCanvas.height = thisImage.height;

			console.log("topCoordImage: ", topCoordImage); // testing
			console.log("leftCoordImage: ", leftCoordImage); // testing

			// Draw image on canvas
			// CITE: Mozilla
			// URL: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
			// HELP: We learned how to draw images on webpage on canvas.
			// Syntax: .drawImage(image, dx, dy, dWidth, dHeight)
			canvasContent.drawImage(
				thisImage,
				0,
				0,
				thisCanvas.width,
				thisCanvas.height
			); // use original image size

			// --CALL COLOR MANIPULATION HELPER FUNCTIONS HERE--
			// If to invert green value
			invertGreen(
				topCoordImage,
				leftCoordImage,
				canvasContent,
				thisCanvas
			);

			// If to invert Red value
			//invertRed(topCoordImage, leftCoordImage, canvasContent, thisCanvas);

			// If to delete Green value
			// deleteGreen(topCoordImage, leftCoordImage, canvasContent, thisCanvas);

			// If to delete Red value
			// deleteRed(topCoordImage, leftCoordImage, canvasContent, thisCanvas);

			// If to apply slider Green value to color Green value of image
			// valueG is the value from slider
			//let valueG = 0; // testing -- NEED to be replaced by passing value from slider for green to value G
			//sliderChangeGreen(topCoordImage, leftCoordImage, canvasContent, thisCanvas, valueG);

			RevertImageToOri();
		};
	};

	// ---------------------------------------------------------
	// ---------------Image Filter Helper Functions:------------
	// Func 1 invertGreen: inverted colors by inverting G values.
	const invertGreen = (
		topCoordImage,
		leftCoordImage,
		canvasContent,
		thisCanvas
	) => {
		console.log("invert green"); // testing
		// CITE: Mozilla
		// URL: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData
		// HELP: We learned how to get RGBA values of pixels of images into a list.
		// Syntax: .getImageData(sx, sy, sw, sh)
		const imageInfoList = canvasContent.getImageData(
			0,
			0,
			thisCanvas.width,
			thisCanvas.height
		); // a list of R,G,B,A of all pixels on images
		const imageInfoLength = imageInfoList.data.length;
		for (let index = 0; index < imageInfoLength; index += 4) {
			// R is at [index]

			// G is at [index + 1]
			let oriGreenValue = imageInfoList.data[index + 1];
			imageInfoList.data[index + 1] = 255 - oriGreenValue; // invert color

			// B is at [index + 2]

			// A is at [index + 3]
		}
		// CITE: Mozilla
		// URL: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/putImageData
		// HELP: We learned how to paint altered images onto canvas.
		// Syntax: .putImageData(imageData, dx, dy)
		canvasContent.putImageData(imageInfoList, 0, 0);
	};

	// Func 2 invertRed: inverted colors by inverting R values.
	const invertRed = (
		topCoordImage,
		leftCoordImage,
		canvasContent,
		thisCanvas
	) => {
		console.log("invert red"); // testing
		// CITE: Mozilla
		// URL: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData
		// HELP: We learned how to get RGBA values of pixels of images into a list.
		// Syntax: .getImageData(sx, sy, sw, sh)
		const imageInfoList = canvasContent.getImageData(
			0,
			0,
			thisCanvas.width,
			thisCanvas.height
		); // a list of R,G,B,A of all pixels on images
		const imageInfoLength = imageInfoList.data.length;
		for (let index = 0; index < imageInfoLength; index += 4) {
			// R is at [index]
			let oriRedValue = imageInfoList.data[index];
			imageInfoList.data[index] = 255 - oriRedValue; // invert color

			// G is at [index + 1]

			// B is at [index + 2]

			// A is at [index + 3]
		}
		// CITE: Mozilla
		// URL: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/putImageData
		// HELP: We learned how to paint altered images onto canvas.
		// Syntax: .putImageData(imageData, dx, dy)
		canvasContent.putImageData(imageInfoList, 0, 0);
	};

	// Func 3 invertBlue: inverted colors by inverting B values.
	const invertBlue = (
		topCoordImage,
		leftCoordImage,
		canvasContent,
		thisCanvas
	) => {
		console.log("invert blue"); // testing
		// CITE: Mozilla
		// URL: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData
		// HELP: We learned how to get RGBA values of pixels of images into a list.
		// Syntax: .getImageData(sx, sy, sw, sh)
		const imageInfoList = canvasContent.getImageData(
			0,
			0,
			thisCanvas.width,
			thisCanvas.height
		); // a list of R,G,B,A of all pixels on images
		const imageInfoLength = imageInfoList.data.length;
		for (let index = 0; index < imageInfoLength; index += 4) {
			// R is at [index]

			// G is at [index + 1]

			// B is at [index + 2]
			let oriBlueValue = imageInfoList.data[index + 2];
			imageInfoList.data[index + 2] = 255 - oriBlueValue; // invert color

			// A is at [index + 3]
		}
		// CITE: Mozilla
		// URL: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/putImageData
		// HELP: We learned how to paint altered images onto canvas.
		// Syntax: .putImageData(imageData, dx, dy)
		canvasContent.putImageData(imageInfoList, 0, 0);
	};

	// Func 4 deleteGreen: delete G value from pixels.
	const deleteGreen = (
		topCoordImage,
		leftCoordImage,
		canvasContent,
		thisCanvas
	) => {
		console.log("delete green"); // testing
		// CITE: Mozilla
		// URL: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData
		// HELP: We learned how to get RGBA values of pixels of images into a list.
		// Syntax: .getImageData(sx, sy, sw, sh)
		const imageInfoList = canvasContent.getImageData(
			0,
			0,
			thisCanvas.width,
			thisCanvas.height
		); // a list of R,G,B,A of all pixels on images
		const imageInfoLength = imageInfoList.data.length;
		const thisData = imageInfoList.data;
		for (let index = 0; index < imageInfoLength; index += 4) {
			// G is at [index + 1]
			thisData[index + 1] = 0; // delete G values
		}
		// CITE: Mozilla
		// URL: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/putImageData
		// HELP: We learned how to paint altered images onto canvas.
		// Syntax: .putImageData(imageData, dx, dy)
		canvasContent.putImageData(imageInfoList, 0, 0);
	};

	// Func 5 deleteRed: delete R value from pixels.
	const deleteRed = (
		topCoordImage,
		leftCoordImage,
		canvasContent,
		thisCanvas
	) => {
		console.log("delete red"); // testing
		// CITE: Mozilla
		// URL: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData
		// HELP: We learned how to get RGBA values of pixels of images into a list.
		// Syntax: .getImageData(sx, sy, sw, sh)
		const imageInfoList = canvasContent.getImageData(
			0,
			0,
			thisCanvas.width,
			thisCanvas.height
		); // a list of R,G,B,A of all pixels on images
		const imageInfoLength = imageInfoList.data.length;
		console.log(imageInfoLength);
		for (let index = 0; index < imageInfoLength; index += 4) {
			// R is at [index]
			imageInfoList.data[index] = 0; // delete R values
		}
		// CITE: Mozilla
		// URL: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/putImageData
		// HELP: We learned how to paint altered images onto canvas.
		// Syntax: .putImageData(imageData, dx, dy)
		canvasContent.putImageData(imageInfoList, 0, 0);
	};

	// Func 6 deleteBlue: delete B value from pixels.
	const deleteBlue = (
		topCoordImage,
		leftCoordImage,
		canvasContent,
		thisCanvas
	) => {
		console.log("delete blue"); // testing
		// CITE: Mozilla
		// URL: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData
		// HELP: We learned how to get RGBA values of pixels of images into a list.
		// Syntax: .getImageData(sx, sy, sw, sh)
		const imageInfoList = canvasContent.getImageData(
			0,
			0,
			thisCanvas.width,
			thisCanvas.height
		); // a list of R,G,B,A of all pixels on images
		const imageInfoLength = imageInfoList.data.length;
		const thisData = imageInfoList.data;
		for (let index = 0; index < imageInfoLength; index += 4) {
			// B is at [index + 2]
			thisData[index + 2] = 0; // delete G values
		}
		// CITE: Mozilla
		// URL: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/putImageData
		// HELP: We learned how to paint altered images onto canvas.
		// Syntax: .putImageData(imageData, dx, dy)
		canvasContent.putImageData(imageInfoList, 0, 0);
	};

	// Func 7 -- Slider Func: sliderChangeGreen: change the G value according to slider's value
	// Arguments: valueG is the value from slider G
	const sliderChangeGreen = (
		topCoordImage,
		leftCoordImage,
		canvasContent,
		thisCanvas,
		valueG
	) => {
		console.log("Slider changed Green");
		// CITE: Mozilla
		// URL: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData
		// HELP: We learned how to get RGBA values of pixels of images into a list.
		// Syntax: .getImageData(sx, sy, sw, sh)
		const imageInfoList = canvasContent.getImageData(
			0,
			0,
			thisCanvas.width,
			thisCanvas.height
		); // a list of R,G,B,A of all pixels on images
		const imageInfoLength = imageInfoList.data.length;
		const thisData = imageInfoList.data;
		for (let index = 0; index < imageInfoLength; index += 4) {
			// G is at [index + 1]
			thisData[index + 1] = valueG; // delete G values
		}
		// CITE: Mozilla
		// URL: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/putImageData
		// HELP: We learned how to paint altered images onto canvas.
		// Syntax: .putImageData(imageData, dx, dy)
		canvasContent.putImageData(imageInfoList, 0, 0);
	};

	// Func 8 -- Slider Func: sliderChangeRed: change the R value according to slider's value
	// Arguments: valueR is the value from slider R
	const sliderChangeRed = (
		topCoordImage,
		leftCoordImage,
		canvasContent,
		thisCanvas,
		valueR
	) => {
		console.log("Slider changed Red");
		// CITE: Mozilla
		// URL: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData
		// HELP: We learned how to get RGBA values of pixels of images into a list.
		// Syntax: .getImageData(sx, sy, sw, sh)
		const imageInfoList = canvasContent.getImageData(
			0,
			0,
			thisCanvas.width,
			thisCanvas.height
		); // a list of R,G,B,A of all pixels on images
		const imageInfoLength = imageInfoList.data.length;
		const thisData = imageInfoList.data;
		for (let index = 0; index < imageInfoLength; index += 4) {
			// R is at [index]
			thisData[index] = valueR; // delete G values
		}
		// CITE: Mozilla
		// URL: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/putImageData
		// HELP: We learned how to paint altered images onto canvas.
		// Syntax: .putImageData(imageData, dx, dy)
		canvasContent.putImageData(imageInfoList, 0, 0);
	};

	// Func 8 -- Slider Func: sliderChangeBlue: change the B value according to slider's value
	// Arguments: valueB is the value from slider B
	const sliderChangeBlue = (
		topCoordImage,
		leftCoordImage,
		canvasContent,
		thisCanvas,
		valueB
	) => {
		console.log("Slider changed Red");
		// CITE: Mozilla
		// URL: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData
		// HELP: We learned how to get RGBA values of pixels of images into a list.
		// Syntax: .getImageData(sx, sy, sw, sh)
		const imageInfoList = canvasContent.getImageData(
			0,
			0,
			thisCanvas.width,
			thisCanvas.height
		); // a list of R,G,B,A of all pixels on images
		const imageInfoLength = imageInfoList.data.length;
		const thisData = imageInfoList.data;
		for (let index = 0; index < imageInfoLength; index += 4) {
			// B is at [index + 2]
			thisData[index + 2] = valueB; // delete G values
		}
		// CITE: Mozilla
		// URL: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/putImageData
		// HELP: We learned how to paint altered images onto canvas.
		// Syntax: .putImageData(imageData, dx, dy)
		canvasContent.putImageData(imageInfoList, 0, 0);
	};

	const RevertImageToOri = () => {
		const allCanvas = document.querySelectorAll("canvas");
		const listLen = allCanvas.length;
		for (let index = 0; index < listLen; index++) {
			allCanvas[index].parentNode.removeChild(allCanvas[index]);
		}
	};

	// function to toggle black text on white background theme
	function toggleWhiteOnBlackTheme() {
		console.log("toggle white on black theme");
		if (document.body.classList.contains("whiteOnBlack")) {
			document.body.classList.remove("whiteOnBlack");
		} else {
			document.body.classList.add("whiteOnBlack");
		}

		// change all links' color to #A8A8FF (has passed the contrast ratio test for black background)
		let linksList = document.getElementsByTagName("a");
		for (var i = 0; i < linksList.length; i++) {
			if (linksList[i].href) {
				linksList[i].style.color = "#A8A8FF";
			}
		}
	}

	// Create a mapping object
	const funcMap = {
		toggleWhiteOnBlackTheme: toggleWhiteOnBlackTheme,
		loopThroughImgs: loopThroughImgs,
	};

	const versionButton1 = createButtonWithFunction(
		"Invert Green",
		loopThroughImgs
	);
	const versionButton2 = createButtonWithFunction(
		"Revert Images to Normal",
		RevertImageToOri
	);
	const whiteOnBlackTheme = createButtonWithFunction(
		"White on Black",
		toggleWhiteOnBlackTheme
	);

	//CITE: https://www.w3schools.com/css/css_grid.asp
	//DESC: Used to learn how to create a grid layout menu.
	let menu = `
	<div id="colorBlindMenu">
	<div class="choiceItem">${versionButton1}</div>
	<div class="choiceItem">${versionButton2}</div>
	<div class="choiceItem">${whiteOnBlackTheme}</div>
	<div class="choiceItem"></div>
	<div class="choiceItem"></div>
	<div class="choiceItem"></div>
	<div class="choiceItem">${createRGBSlider("Red")}</div>
	<div class="choiceItem"></div>
	<div class="choiceItem"></div>
	<div class="choiceItem">${createRGBSlider("Green")}</div>
	<div class="choiceItem"></div>
	<div class="choiceItem"></div>
	<div class="choiceItem">${createRGBSlider("Blue")}</div>
	</div>
	`;
	$("body").prepend(menu);
	$("body").prepend(
		`<button type="button" id="optionsButton">Color Blind Options</button>`
	);

	document
		.querySelector("#colorBlindMenu")
		.addEventListener("click", function (event) {
			if (event.target.matches(".versionButton")) {
				const func = event.target.getAttribute("func");
				console.log("BUTTON CLICKED");
				console.log(func);
				if (funcMap[func]) {
					console.log("YES");
					funcMap[func]();
				}
			}
		});

	//CITE: https://www.w3schools.com/howto/tryit.asp?filename=tryhow_css_js_rangeslider
	//DESC: Used to learn how to create a slider and store its value.
	const redSlider = document.getElementById("Red");
	const greenSlider = document.getElementById("Green");
	const blueSlider = document.getElementById("Blue");

	redSlider.oninput = function () {
		let redValue = redSlider.value;
		let redOutput = document.getElementById("RedValue");
		redOutput.innerHTML = this.value;
	};
	greenSlider.oninput = function () {
		let greenValue = greenSlider.value;
		let greenOutput = document.getElementById("GreenValue");
		greenOutput.innerHTML = this.value;
	};
	blueSlider.oninput = function () {
		let blueValue = blueSlider.value;
		let blueOutput = document.getElementById("BlueValue");
		blueOutput.innerHTML = this.value;
	};

	const colorBlindButton = document.getElementById("optionsButton");
	const colorBlindMenu = document.getElementById("colorBlindMenu");
	colorBlindButton.addEventListener("click", function () {
		if (colorBlindMenu.style.visibility == "hidden") {
			colorBlindMenu.style.visibility = "visible";
		} else {
			colorBlindMenu.style.visibility = "hidden";
		}
	});

	// ---------------------------------------------------
	// Call Function
	// Loop through all the images and apply filters
	// loopThroughImgs();

	// Toggle black text on white background theme
	// toggleWhiteOnBlackTheme();
});
