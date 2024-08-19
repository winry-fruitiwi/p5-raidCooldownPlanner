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

        // margin around the text
        const TEXT_MARGIN = 5
        const LEFT_MARGIN = 10

        push()
        translate(x, y)

        // add the lines that make up the table
        stroke(0, 0, 80)
        strokeWeight(2)
        line(0, textHeight()+TEXT_MARGIN, width, textHeight()+TEXT_MARGIN)
        line(LEFT_MARGIN, 0, LEFT_MARGIN, height)

        noStroke()
        fill(0, 0, 80)
        textAlign(LEFT, BOTTOM)
        textSize(14)
        text(this.bossJSON["name"], TEXT_MARGIN + LEFT_MARGIN,
            textHeight() + TEXT_MARGIN/2)


        textSize(10)
        // timeline abilities
        for (let ability of this.bossTimeline) {
            // find the position where the ability would be displayed on the
            // timeline
            let timelinePosition = map(
                ability["time"],
                0, this.bossJSON["duration"],
                textHeight()+TEXT_MARGIN, height - y
            )

            // add a mark (tick), then the time to the left of it
            let tickWidth = 10
            stroke(0, 0, 80)
            strokeWeight(2)
            line(
                LEFT_MARGIN - tickWidth/2, timelinePosition,
                LEFT_MARGIN + tickWidth/2, timelinePosition
            )

            noStroke()
            textAlign(RIGHT, CENTER)
            text(
                ability["time_string"],
                LEFT_MARGIN - tickWidth/2 - 2,
                timelinePosition - 0.5 // hack to make it look more centered
            )
        }

        pop()
    }
}
