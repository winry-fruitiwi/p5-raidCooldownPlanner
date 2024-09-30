/**
 *  @author Winry Fruitiwi - PCT Main, working M4S
 *  @date 2024.8.17
 *
 *  Established during Patch 7.05.
 *  I've been a Dragoon for over 4 years!
 *  Also leveled:
 *      Dancer - lv100, M1-4N cleared
 *      Astrologian - lv93
 *      Dark Knight - lv100
 *      Sage - lv100
 *      Reaper - lv80, no role quests
 *      Gunbreaker - lv80, no knowledge of how to play
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
let peopleTxtJSON
let bossTxtJSON

let timeline
let requiredHeight
let imageCache // for displaying the ability images when they exist

let tanks = ["Paladin", "Warrior", "Dark Knight", "Gunbreaker"]
let healers = ["Scholar", "Astrologian", "Sage", "White Mage"]
let dps = [
    "Dancer",  "Machinist", "Bard",
    "Red Mage", "Black Mage", "Summoner", "Pictomancer",
    "Monk", "Samurai", "Reaper", "Dragoon", "Ninja", "Viper"
]

let magical
let physical
let jobImageFiles = [
    "Dancer", "Gunbreaker", "Dragoon", "Warrior", "Scholar", "Astrologian",
    "Red Mage", "Bard", "Monk", "Paladin", "Black Mage", "White Mage", "Ninja",
    "Summoner", "Dark Knight", "Machinist", "Samurai", "Reaper", "Sage",
    "Viper", "Pictomancer"
]
let jobIMGs = {}

// variables for testing purposes. can be a mix of constants and let variables
// placeholder time for when mitigation should appear
// let mitTime = 10

// constants
const IMG_SIZE = 30

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
    let cnv = createCanvas(900, 300)
    cnv.parent('#canvas')
    colorMode(HSB, 360, 100, 100, 100)
    textFont(font, 14)

    /* initialize instruction div */
    instructions = select('#ins')
    instructions.html(`<pre>
        numpad 1 → freeze sketch</pre>`)

    debugCorner = new CanvasDebugCorner(5)

    loadJSON("bosses/Brute_Bomber.json", gotBossData)
    loadJSON("Mitigation.json", gotMitData)
    loadJSON("people.json", gotPeopleData)
    loadStrings("bosses/Brute_Bomber.txt", gotTimelineData)

    imageCache = {}

    magical.resize(IMG_SIZE/2, 0)
    physical.resize(IMG_SIZE/2, 0)
}


function gotTimelineData(data) {
    // lines look like this: 02:50/s/Brutal Impact/s/Physical/s/40,000
    bossTxtJSON = {
        "name": "Brute Bomber",
        "duration": 688,
        "timeline": []
    }
    peopleTxtJSON = {}

    let headerList = data[0].split('/s/')
    let timeline = data.slice(1)

    for (let i = 4; i < headerList.length; i++) {
        peopleTxtJSON[headerList[i]] = []
    }

    for (let line of timeline) {
        let splitLine = line.split('/s/')
        print(splitLine)

        // indices to values conversion:
        // 0 = time that the ability occurs at
        // 1 = full ability name - abbreviations may be substituted
        // 2 = type of damage, either physical, magical, or both
            // usually, both means two attacks occurred at the same time
        // 3 = amount of damage, only present when the type is present

        // desired format: {
        //       "name": "Call Me Honey",
        //       "abbreviation": "CMH",
        //       "image": null,
        //       "time_string": "9:26",
        //       "time": 566,
        //       "physical": false,
        //       "magical": true
        //     },

        let timeString = splitLine[0]
        let name = splitLine[1]
        let type = splitLine[2]
        // let damage = splitLine[3]

        let minutesSeconds = timeString.split(":")
        let minutes = int(minutesSeconds[0])
        let seconds = int(minutesSeconds[1])

        let time = minutes*60 + seconds
        print(time)

        if (splitLine[2]) {
            let physical, magical

            if (type === "Physical") {
                physical = true
                magical = false
            }
            else if (type === "Magical") {
                magical = true
                physical = false
            }

            bossTxtJSON["timeline"].push({
                    "name": name,
                    "abbreviation": name,
                    "image": null, // TODO
                    "time_string": timeString,
                    "time": time,
                    "physical": physical,
                    "magical": magical
                }
            )
        }

        for (let i = 4; i < splitLine.length; i++) {
            if (splitLine[i] !== "") {
                let mitigation = splitLine[i].split(" + ")
                print(mitigation)

                for (let j=mitigation.length-1; j >= 0; j--) {
                    peopleTxtJSON[headerList[i]].push({
                        "name": mitigation[j],
                        "time": time - 3*j
                    })
                }
            }
        }
    }
    print(peopleTxtJSON)
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
        resizeCanvas(900, requiredHeight, true)

    background(234, 34, 24)

    if (timeline === undefined && bossTxtJSON && mitJSON && peopleTxtJSON) {
        timeline = new Timeline(bossTxtJSON, mitJSON, peopleTxtJSON)
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