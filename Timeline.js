class Timeline {
    // takes in the boss json and mitigation json to create an interactive
    // timeline. it should actually also take in a list of party members, but
    // that would unnecessarily complicate code before I'm ready to use it
    constructor(bJSON, mJSON) {
        this.bossJSON = bJSON
        this.mitJSON = mJSON
        this.bossTimeline = this.bossJSON["timeline"]
        requiredHeight = this.bossJSON["duration"]*5

        this.processBossJSON(this.bossJSON)
        this.processMitJSON(this.mitJSON)
    }

    processBossJSON(bJ) {
        // for (let i = 0; i < bJ.length; i++) {
        //     this.timeline.push(bJ[])
        // }
    }

    processMitJSON(mJ) {

    }

    // renders as a vertical timeline with ticks for boss mechanics and
    // party mitigation. does not handle any manipulation of the contents of
    // this timeline and calls on other classes to handle their own display
    // and update functions.
    render(x=30, y=30) {
        requiredHeight = this.bossJSON["duration"]*5 + y
        // required because dictionaries don't support this format?

        // margin around the text
        const TEXT_MARGIN = 5
        const LEFT_MARGIN = 10

        push()
        translate(x, y)

        let timelineStart = textHeight()+TEXT_MARGIN

        // add the lines that make up the table
        stroke(0, 0, 80)
        strokeWeight(2)
        line(0, timelineStart, width, timelineStart)

        // list of all the names we need to display and handle
        let classes = {[this.bossJSON["name"]]: "boss",
            "Mitsugan Miyamoto": "Gunbreaker",
            "Aerry Berry": "Gunbreaker",
            "Cody Berry": "Gunbreaker"
        }

        push()
        for (let i=0; i<Object.keys(classes).length; i++) {
            let name = Object.keys(classes)[i]

            stroke(0, 0, 80)
            strokeWeight(2)
            line(LEFT_MARGIN, 0, LEFT_MARGIN, height)

            noStroke()
            fill(0, 0, 80)
            textAlign(LEFT, BOTTOM)
            textSize(14)
            if (classes[name] === "boss") {
                text(name, TEXT_MARGIN + LEFT_MARGIN,
                    textHeight() + TEXT_MARGIN / 2)

                stroke(0, 0, 80)
                strokeWeight(2)
                line(
                    TEXT_MARGIN * 2 + LEFT_MARGIN + textWidth(name),
                    0,
                    TEXT_MARGIN * 2 + LEFT_MARGIN + textWidth(name),
                    height
                )
            }
            else {
                let img = jobIMGs[classes[name]]
                img.resize(IMG_SIZE, 0)

                image(jobIMGs[classes[name]], TEXT_MARGIN + LEFT_MARGIN,
                    textHeight() + TEXT_MARGIN / 2 - IMG_SIZE)

                stroke(0, 0, 80)
                strokeWeight(2)
                line(
                    TEXT_MARGIN * 2 + LEFT_MARGIN + IMG_SIZE,
                    0,
                    TEXT_MARGIN * 2 + LEFT_MARGIN + IMG_SIZE,
                    height
                )
            }

            if (classes[name] !== "boss") {
                let mitigation = this.mitJSON[classes[name]]
                for (let i = 0; i < Object.keys(mitigation).length; i++) {
                    let timelinePosition = map(
                        mitTime,
                        0, this.bossJSON["duration"],
                        timelineStart, height - y
                    )

                    stroke(0, 0, 80)
                    strokeWeight(2)

                    let tickWidth = 10
                    line(
                        LEFT_MARGIN + tickWidth/2, timelinePosition,
                        LEFT_MARGIN - tickWidth/2, timelinePosition,
                    )
                }
            }

            if (classes[name] === "boss")
                translate(LEFT_MARGIN + textWidth(name), 0)
            else
                translate(LEFT_MARGIN + IMG_SIZE, 0)
        }
        pop()

        textSize(14)
        // timeline abilities
        for (let ability of this.bossTimeline) {
            // find the position where the ability would be displayed on the
            // timeline
            let timelinePosition = map(
                ability["time"],
                0, this.bossJSON["duration"],
                timelineStart, height - y
            )

            // add a mark (tick), then the time to the left of it
            let tickWidth = 10
            stroke(0, 0, 80)
            strokeWeight(2)
            line(
                LEFT_MARGIN - tickWidth/2, timelinePosition,
                LEFT_MARGIN + tickWidth/2, timelinePosition
            )

            let tickLeftMargin = 2
            let tickRightMargin = 5

            noStroke()
            fill(0, 0, 80)
            textAlign(RIGHT, CENTER)
            text(
                ability["time_string"],
                LEFT_MARGIN - tickWidth/2 - tickLeftMargin,
                timelinePosition - 0.5 // hack to make it look more centered
            )

            textAlign(LEFT, CENTER)
            imageMode(CENTER)

            if (!ability["image"]) {
                text(
                    ability["abbreviation"],
                    LEFT_MARGIN + tickWidth/2 + tickRightMargin,
                    timelinePosition - 0.5
                )
            } else {
                if (!imageCache[ability["name"]]) {
                    let img = loadImage(
                        "bosses/"+ability["image"],
                        () => {
                            img.resize(IMG_SIZE, 0);
                            imageCache[ability["name"]] = img;
                        }
                    )
                } else {
                    let img = imageCache[ability["name"]]

                    image(
                        img,
                        IMG_SIZE/2 + LEFT_MARGIN + tickWidth/2 + tickLeftMargin,
                        timelinePosition - 0.5
                    )

                    // when hovering over the image, display the real name
                    // of the ability
                    if (
                        x + LEFT_MARGIN + tickWidth/2 + tickLeftMargin < mouseX &&
                        y - IMG_SIZE/2 + timelinePosition - 0.5 < mouseY &&
                        mouseX < x + IMG_SIZE + LEFT_MARGIN + tickWidth/2 + tickLeftMargin &&
                        mouseY < y + IMG_SIZE - IMG_SIZE/2 + timelinePosition - 0.5
                    ) {
                        textAlign(LEFT, BOTTOM)
                        fill(0, 0, 10)
                        // add 3 pixels of padding on each side
                        rect(mouseX-x, mouseY-y, textWidth(ability["name"])+6, -textHeight()-6)

                        fill(0, 0, 80)
                        text(ability["name"], mouseX - x+3, mouseY - y-3)

                        textAlign(LEFT, CENTER)
                    }
                }

                if (ability["physical"] && ability["magical"]) {
                    image(physical,
                        IMG_SIZE/4 + LEFT_MARGIN + tickWidth/2 + tickLeftMargin,
                        timelinePosition - 0.5 + IMG_SIZE/2 + 10
                    )
                    image(magical,
                        IMG_SIZE*3/4 + LEFT_MARGIN + tickWidth/2 + tickLeftMargin,
                        timelinePosition - 0.5 + IMG_SIZE/2 + 10
                    )
                } else if (ability["physical"]) {
                    image(physical,
                        IMG_SIZE/2 + LEFT_MARGIN + tickWidth/2 + tickLeftMargin,
                        timelinePosition - 0.5 + IMG_SIZE/2 + 10
                    )
                } else if (ability["magical"]) {
                    image(magical,
                        IMG_SIZE/2 + LEFT_MARGIN + tickWidth/2 + tickLeftMargin,
                        timelinePosition - 0.5 + IMG_SIZE/2 + 10
                    )
                }
            }
        }

        pop()
    }
}
