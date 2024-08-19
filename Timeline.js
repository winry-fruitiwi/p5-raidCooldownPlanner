class Timeline {
    // takes in the boss json and mitigation json to create an interactive
    // timeline. it should actually also take in a list of party members, but
    // that would unnecessarily complicate code before I'm ready to use it
    constructor(bJSON, mJSON) {
        this.bossJSON = bJSON
        this.mitJSON = mJSON
        this.timeline = this.bossJSON["timeline"]

        requiredHeight = this.bossJSON["duration"]

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
    render(x, y) {
        const TEXT_MARGIN = 5
        const LEFT_MARGIN = 10

        push()
        translate(x, y)

        stroke(0, 0, 80)
        strokeWeight(2)
        line(0, textHeight()+TEXT_MARGIN, width, textHeight()+TEXT_MARGIN)
        line(LEFT_MARGIN, 0, LEFT_MARGIN, height)

        noStroke()
        fill(0, 0, 80)
        textAlign(LEFT, BOTTOM)
        text(this.bossJSON["name"], TEXT_MARGIN + LEFT_MARGIN, textHeight())

        pop()
    }
}
