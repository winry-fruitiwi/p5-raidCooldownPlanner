/**
 *  @author 
 *  @date 2023.
 *
 */

let font
let fixedWidthFont
let variableWidthFont
let instructions
let mouseJustReleased = false
let debugCorner /* output debug text in the bottom left corner of the canvas */

let bossJSON
let mitJSON
let peopleJSON

let timeline
let requiredHeight
let imageCache // for displaying the ability images when they exist

let magical
let physical
let jobImageFiles = ["Dancer", "Gunbreaker"]
let jobIMGs = {}

// variables for testing purposes. can be a mix of constants and let variables
// placeholder time for when mitigation should appear
// let mitTime = 10

// constants
const IMG_SIZE = 35

function preload() {
    font = loadFont('data/consola.ttf')
    fixedWidthFont = loadFont('data/consola.ttf')
    variableWidthFont = loadFont('data/meiryo.ttf')

    magical = loadImage("/icons/magical.png")
    physical = loadImage("/icons/physical.png")

    for (let i = 0; i < jobImageFiles.length; i++) {
        jobIMGs[jobImageFiles[i]] = loadImage(`/jobIcons/${jobImageFiles[i]}.png`)
    }
}


function setup() {
    let cnv = createCanvas(600, 300)
    cnv.parent('#canvas')
    colorMode(HSB, 360, 100, 100, 100)
    textFont(font, 14)

    /* initialize instruction div */
    instructions = select('#ins')
    instructions.html(`<pre>
        numpad 1 → freeze sketch</pre>`)

    debugCorner = new CanvasDebugCorner(5)

    loadJSON("bosses/Black_Cat.json", gotBossData)
    loadJSON("Mitigation.json", gotMitData)
    loadJSON("people.json", gotPeopleData)

    imageCache = {}

    magical.resize(IMG_SIZE/2, 0)
    physical.resize(IMG_SIZE/2, 0)
}


function gotBossData(data) {
    bossJSON = data
}


function gotMitData(data) {
    mitJSON = data
}

function gotPeopleData(data) {
    peopleJSON = data
}


function draw() {
    if (height !== requiredHeight)
        resizeCanvas(600, requiredHeight, true)

    background(234, 34, 24)

    if (timeline === undefined && bossJSON && mitJSON && peopleJSON) {
        timeline = new Timeline(bossJSON, mitJSON, peopleJSON)
    }

    if (timeline && width && height) {
        timeline.render()
    }

    mouseJustReleased = false

    if (frameCount > 3000)
        noLoop()

    // /* debugCorner needs to be last so its z-index is highest */
    // debugCorner.setText(`frameCount: ${frameCount}`, 2)
    // debugCorner.setText(`fps: ${frameRate().toFixed(0)}`, 1)
    // debugCorner.showBottom()
    // print(timeline)
    // print(bossJSON)
    // print(mitJSON)
}


function keyPressed() {
    /* stop sketch */
    if (keyCode === 97) { /* numpad 1 */
        noLoop()
        instructions.html(`<pre>
            sketch stopped</pre>`)
    }

    if (key === '`') { /* toggle debug corner visibility */
        debugCorner.visible = !debugCorner.visible
        console.log(`debugCorner visibility set to ${debugCorner.visible}`)
    }

    if (keyCode === DOWN_ARROW) {
        mitTime += 1
    }
    if (keyCode === UP_ARROW) {
        mitTime -= 1
    }
}


function textHeight() {
    return textAscent() + textDescent()
}


function mouseReleased() {
    mouseJustReleased = true
}



/** 🧹 shows debugging info using text() 🧹 */
class CanvasDebugCorner {
    constructor(lines) {
        this.visible = true
        this.size = lines
        this.debugMsgList = [] /* initialize all elements to empty string */
        for (let i in lines)
            this.debugMsgList[i] = ''
    }

    setText(text, index) {
        if (index >= this.size) {
            this.debugMsgList[0] = `${index} ← index>${this.size} not supported`
        } else this.debugMsgList[index] = text
    }

    showBottom() {
        if (this.visible) {
            noStroke()
            textFont(fixedWidthFont, 14)

            const LEFT_MARGIN = 10
            const DEBUG_Y_OFFSET = height - 10 /* floor of debug corner */
            const LINE_SPACING = 2
            const LINE_HEIGHT = textAscent() + textDescent() + LINE_SPACING

            /* semi-transparent background */
            fill(0, 0, 0, 10)
            rectMode(CORNERS)
            const TOP_PADDING = 3 /* extra padding on top of the 1st line */
            rect(
                0,
                height,
                width,
                DEBUG_Y_OFFSET - LINE_HEIGHT * this.debugMsgList.length - TOP_PADDING
            )

            fill(0, 0, 100, 100) /* white */
            strokeWeight(0)

            for (let index in this.debugMsgList) {
                const msg = this.debugMsgList[index]
                text(msg, LEFT_MARGIN, DEBUG_Y_OFFSET - LINE_HEIGHT * index)
            }
        }
    }

    showTop() {
        if (this.visible) {
            noStroke()
            textFont(fixedWidthFont, 14)

            const LEFT_MARGIN = 10
            const TOP_PADDING = 3 /* extra padding on top of the 1st line */

            /* offset from top of canvas */
            const DEBUG_Y_OFFSET = textAscent() + TOP_PADDING
            const LINE_SPACING = 2
            const LINE_HEIGHT = textAscent() + textDescent() + LINE_SPACING

            /* semi-transparent background, a console-like feel */
            fill(0, 0, 0, 10)
            rectMode(CORNERS)

            rect( /* x, y, w, h */
                0,
                0,
                width,
                DEBUG_Y_OFFSET + LINE_HEIGHT*this.debugMsgList.length/*-TOP_PADDING*/
            )

            fill(0, 0, 100, 100) /* white */
            strokeWeight(0)

            textAlign(LEFT)
            for (let i in this.debugMsgList) {
                const msg = this.debugMsgList[i]
                text(msg, LEFT_MARGIN, LINE_HEIGHT*i + DEBUG_Y_OFFSET)
            }
        }
    }
}